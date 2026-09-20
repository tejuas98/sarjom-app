package org.jharkhand.sarjom;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.speechrecognition.SpeechRecognition;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(SpeechRecognition.class);
        registerPlugin(com.getcapacitor.community.tts.TextToSpeechPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
