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

  // 0. Ensure PermissionCallback import
  if (!content.includes('import com.getcapacitor.annotation.PermissionCallback;')) {
    content = content.replace(
      'import com.getcapacitor.annotation.Permission;',
      'import com.getcapacitor.annotation.Permission;\nimport com.getcapacitor.annotation.PermissionCallback;'
    );
  }

  // 1. Remove hardcoded com.google.android.googlequicksearchbox so non-Google speech engines work
  const oldPackageCheck = `        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            detailsIntent.setPackage("com.google.android.googlequicksearchbox");
        }`;
  if (content.includes(oldPackageCheck)) {
    content = content.replace(
      oldPackageCheck,
      '        // Support all speech recognition engines without forcing Google QuickSearchBox'
    );
  }

  // 2. Replace start, startSystemDialog, checkPermissions, requestPermissions with fully robust implementations
  const newMethods = `    @PluginMethod
    public void start(PluginCall call) {
        boolean hasOsPerm = androidx.core.content.ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;

        if (!hasOsPerm) {
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

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        boolean hasOsPerm = androidx.core.content.ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;

        if (hasOsPerm) {
            start(call);
        } else {
            call.reject(MISSING_PERMISSION);
        }
    }

    @PluginMethod
    public void startSystemDialog(PluginCall call) {
        String language = call.getString("language", Locale.getDefault().toString());
        int maxResults = call.getInt("maxResults", MAX_RESULTS);
        String prompt = call.getString("prompt", null);
        beginListening(language, maxResults, prompt, false, true, call);
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
        requestPermissionForAlias(SPEECH_RECOGNITION, call, "permissionsCallbackHelper");
    }

    @PermissionCallback
    private void permissionsCallbackHelper(PluginCall call) {
        boolean hasOsPerm = androidx.core.content.ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;

        JSObject permissionsResult = new JSObject();
        permissionsResult.put(SPEECH_RECOGNITION, hasOsPerm ? "granted" : "denied");
        call.resolve(permissionsResult);
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

  // Replace from start(PluginCall call) through openAppSettings
  const startRegex = /@PluginMethod\s+public void start\(PluginCall call\)[\s\S]*?call\.resolve\(\);\s*\}\s*catch \(Exception e\) \{\s*call\.reject\(e\.getMessage\(\)\);\s*\}\s*\}/;
  if (startRegex.test(content)) {
    content = content.replace(startRegex, newMethods);
  }

  // 3. Ensure listeningResult handles null data safely
  const oldListeningResult = `@ActivityCallback
    private void listeningResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        int resultCode = result.getResultCode();
        if (resultCode == Activity.RESULT_OK) {
            try {
                ArrayList<String> matchesList = result.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                JSObject resultObj = new JSObject();
                resultObj.put("matches", new JSArray(matchesList));
                call.resolve(resultObj);
            } catch (Exception ex) {
                call.reject(ex.getMessage());
            }
        } else {
            call.reject(Integer.toString(resultCode));
        }

        SpeechRecognition.this.lock.lock();
        SpeechRecognition.this.listening(false);
        SpeechRecognition.this.lock.unlock();
    }`;

  const newListeningResult = `@ActivityCallback
    private void listeningResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        int resultCode = result.getResultCode();
        if (resultCode == Activity.RESULT_OK && result.getData() != null) {
            try {
                ArrayList<String> matchesList = result.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (matchesList != null && matchesList.size() > 0) {
                    JSObject resultObj = new JSObject();
                    resultObj.put("matches", new JSArray(matchesList));
                    call.resolve(resultObj);
                } else {
                    call.reject("No voice input recognized");
                }
            } catch (Exception ex) {
                call.reject(ex.getMessage());
            }
        } else {
            call.reject(Integer.toString(resultCode));
        }

        SpeechRecognition.this.lock.lock();
        SpeechRecognition.this.listening(false);
        SpeechRecognition.this.lock.unlock();
    }`;

  if (content.includes(oldListeningResult)) {
    content = content.replace(oldListeningResult, newListeningResult);
  }

  // 4. Ensure onError notifies JS listeners
  const oldOnError = `        @Override
        public void onError(int error) {
            SpeechRecognition.this.stopListening();
            String errorMssg = getErrorText(error);

            if (this.call != null) {
                call.reject(errorMssg);
            }
        }`;

  const newOnError = `        @Override
        public void onError(int error) {
            SpeechRecognition.this.stopListening();
            String errorMssg = getErrorText(error);

            try {
                JSObject ret = new JSObject();
                ret.put("status", "error");
                ret.put("error", errorMssg);
                ret.put("errorCode", error);
                SpeechRecognition.this.notifyListeners(LISTENING_EVENT, ret);
            } catch (Exception e) {}

            if (this.call != null) {
                call.reject(errorMssg);
            }
        }`;

  if (content.includes(oldOnError)) {
    content = content.replace(oldOnError, newOnError);
  }

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('[patch] Successfully applied permission callbacks, system dialog & error listener patch to SpeechRecognition.java');
} else {
  console.log('[patch] Target file not found, skipping SpeechRecognition patch.');
}
