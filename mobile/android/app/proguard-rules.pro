# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep WebView JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep BeepStream interface
-keep class com.beepstream.mobile.NativeWebViewActivity$BeepStreamInterface { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep application classes
-keep class com.beepstream.mobile.** { *; }

# General Android rules
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class android.webkit.** { *; }