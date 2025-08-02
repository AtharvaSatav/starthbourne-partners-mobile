package com.beepstream.mobile;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import android.content.Context;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.app.PendingIntent;
import android.content.Intent;
import androidx.core.app.NotificationCompat;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Build;

/**
 * Native Android WebView implementation for BeepStream
 * Provides critical alert notifications and audio capabilities
 */
public class NativeWebViewActivity extends Activity {
    private WebView webView;
    private ToneGenerator toneGenerator;
    private static final String CHANNEL_ID = "beepstream_critical";
    private static final int NOTIFICATION_ID = 1001;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize notification channel
        createNotificationChannel();
        
        // Initialize tone generator for audio alerts
        toneGenerator = new ToneGenerator(AudioManager.STREAM_ALARM, 100);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Add JavaScript interface for native functionality
        webView.addJavascriptInterface(new BeepStreamInterface(this), "NativeApp");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Load the BeepStream web app
        String baseUrl = "https://beepstream-mobile-beepstream.replit.app/";
        webView.loadUrl(baseUrl);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "BeepStream Critical Alerts";
            String description = "Critical system alerts from BeepStream";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            channel.enableVibration(true);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    public class BeepStreamInterface {
        Context context;

        BeepStreamInterface(Context c) {
            context = c;
        }

        @JavascriptInterface
        public void showCriticalAlert(String message) {
            // Create high-priority notification
            Intent intent = new Intent(context, NativeWebViewActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_alert)
                    .setContentTitle("BeepStream Critical Alert")
                    .setContentText(message)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setAutoCancel(false)
                    .setOngoing(true)
                    .setContentIntent(pendingIntent)
                    .setFullScreenIntent(pendingIntent, true);

            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.notify(NOTIFICATION_ID, builder.build());
            
            // Play alarm tone
            playAlarmTone();
        }

        @JavascriptInterface
        public void playAlarmTone() {
            if (toneGenerator != null) {
                toneGenerator.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 2000);
            }
        }

        @JavascriptInterface
        public void clearAlert() {
            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.cancel(NOTIFICATION_ID);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (toneGenerator != null) {
            toneGenerator.release();
        }
    }
}