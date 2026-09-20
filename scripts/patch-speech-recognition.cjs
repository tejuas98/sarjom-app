// scripts/patch-speech-recognition.cjs
// Ensures @capacitor-community/speech-recognition handles offline speech,
// bypasses Google-only hardcoding, and synchronizes with Android OS microphone permissions.
const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@capacitor-community',
  'speech-recognition',
  'android',
  'src',
  'main',
  'java',
  'com',
  'getcapacitor',
  'community',
  'speechrecognition',
  'SpeechRecognition.java'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');

  // 1. Add EXTRA_PREFER_OFFLINE if missing
  if (!content.includes('RecognizerIntent.EXTRA_PREFER_OFFLINE')) {
    content = content.replace(
      'intent.putExtra("android.speech.extra.DICTATION_MODE", partialResults);',
      'intent.putExtra("android.speech.extra.DICTATION_MODE", partialResults);\n        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);'
    );
  }

  // 2. Remove hardcoded com.google.android.googlequicksearchbox so non-Google speech engines work
  const oldPackageCheck = `        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            detailsIntent.setPackage("com.google.android.googlequicksearchbox");
        }`;
  if (content.includes(oldPackageCheck)) {
    content = content.replace(
      oldPackageCheck,
      '        // Support all speech recognition engines without forcing Google QuickSearchBox'
    );
  }

  // 3. Robust start() and permission methods
  const oldStart = `    @PluginMethod
    public void start(PluginCall call) {
        if (!isSpeechRecognitionAvailable()) {
            call.unavailable(NOT_AVAILABLE);
            return;
        }

        if (getPermissionState(SPEECH_RECOGNITION) != PermissionState.GRANTED) {
            call.reject(MISSING_PERMISSION);
            return;
        }

        String language = call.getString("language", Locale.getDefault().toString());
        int maxResults = call.getInt("maxResults", MAX_RESULTS);
        String prompt = call.getString("prompt", null);
        boolean partialResults = call.getBoolean("partialResults", false);
        boolean popup = call.getBoolean("popup", false);
        beginListening(language, maxResults, prompt, partialResults, popup, call);
    }`;

  const newStart = `    @PluginMethod
    public void start(PluginCall call) {
        boolean hasOsPerm = androidx.core.content.ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;

        if (!hasOsPerm && getPermissionState(SPEECH_RECOGNITION) != PermissionState.GRANTED) {
            requestPermissionForAlias(SPEECH_RECOGNITION, call, "permissionCallback");
            return;
        }

        String language = call.getString("language", Locale.getDefault().toString());
        int maxResults = call.getInt("maxResults", MAX_RESULTS);
        String prompt = call.getString("prompt", null);
        boolean partialResults = call.getBoolean("partialResults", false);
        boolean popup = call.getBoolean("popup", false);

        // If background recognition is unavailable or popup requested, launch system speech intent
        if (!isSpeechRecognitionAvailable() || popup) {
            beginListening(language, maxResults, prompt, partialResults, true, call);
            return;
        }

        beginListening(language, maxResults, prompt, partialResults, false, call);
    }

    @PluginMethod
    @Override
    public void checkPermissions(PluginCall call) {
        boolean hasOsPerm = androidx.core.content.ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;
        if (hasOsPerm) {
            JSObject permissionsResult = new JSObject();
            permissionsResult.put(SPEECH_RECOGNITION, "granted");
            call.resolve(permissionsResult);
            return;
        }
        super.checkPermissions(call);
    }

    @PluginMethod
    @Override
    public void requestPermissions(PluginCall call) {
        boolean hasOsPerm = androidx.core.content.ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;
        if (hasOsPerm) {
            JSObject permissionsResult = new JSObject();
            permissionsResult.put(SPEECH_RECOGNITION, "granted");
            call.resolve(permissionsResult);
            return;
        }
        super.requestPermissions(call);
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            android.content.Intent intent = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(android.net.Uri.parse("package:" + bridge.getActivity().getPackageName()));
            bridge.getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }`;

  if (content.includes(oldStart)) {
    content = content.replace(oldStart, newStart);
  }

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('[patch] Successfully applied permission & offline speech recognition patch to SpeechRecognition.java');
} else {
  console.log('[patch] Target file not found, skipping SpeechRecognition patch.');
}
