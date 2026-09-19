// scripts/patch-speech-recognition.cjs
// Ensures @capacitor-community/speech-recognition passes EXTRA_PREFER_OFFLINE for on-device Android ASR
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
  if (!content.includes('RecognizerIntent.EXTRA_PREFER_OFFLINE')) {
    content = content.replace(
      'intent.putExtra("android.speech.extra.DICTATION_MODE", partialResults);',
      'intent.putExtra("android.speech.extra.DICTATION_MODE", partialResults);\n        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch] Applied RecognizerIntent.EXTRA_PREFER_OFFLINE to SpeechRecognition.java');
  } else {
    console.log('[patch] EXTRA_PREFER_OFFLINE already present in SpeechRecognition.java');
  }
} else {
  console.log('[patch] Target file not found, skipping SpeechRecognition patch.');
}
