package org.jharkhand.sarjom;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_RECORD_AUDIO = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Proactively request RECORD_AUDIO runtime permission on Android startup
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{
                        Manifest.permission.RECORD_AUDIO,
                        Manifest.permission.MODIFY_AUDIO_SETTINGS
                    },
                    PERMISSION_REQUEST_RECORD_AUDIO
            );
        }

        // Configure WebView media settings if bridge webView is available
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
            }
        } catch (Exception e) {
            // Safe fallback
        }
    }
}
