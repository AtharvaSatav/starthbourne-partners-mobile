package com.beepstream.mobile;

import android.app.Application;
import android.util.Log;

/**
 * Native-only Application class for CI/production builds
 * This completely avoids React Native dependencies
 */
public class NativeMainApplication extends Application {
    
    private static final String TAG = "BeepStream";
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "BeepStream Native Application initialized");
    }
}