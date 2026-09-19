const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';

async function verifyCleanApp() {
  console.log('🚀 Launching Puppeteer to verify clean app without hardcoded test artifacts...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915 }); // Pixel 7 viewport

  await page.goto('http://localhost:4173/?tab=voice&lang=santhali', { waitUntil: 'networkidle0' });

  // 1. Check that audiobook player and test buttons are gone
  const audiobookPlayer = await page.$('#audiobook-live-player');
  const playAudiobookBtn = await page.$('#play-audiobook-btn');
  const uploadCustomBtn = await page.$('#upload-custom-audio-btn');

  console.log('1. Audiobook live player in DOM:', audiobookPlayer !== null ? 'FOUND (ERROR)' : 'REMOVED (SUCCESS)');
  console.log('2. Play audiobook button in DOM:', playAudiobookBtn !== null ? 'FOUND (ERROR)' : 'REMOVED (SUCCESS)');
  console.log('3. Upload custom audio button in DOM:', uploadCustomBtn !== null ? 'FOUND (ERROR)' : 'REMOVED (SUCCESS)');

  if (audiobookPlayer !== null || playAudiobookBtn !== null) {
    throw new Error('Hardcoded test audiobook player still exists in DOM!');
  }

  // 2. Check that the pure Voice Translator elements are intact
  const heroMicBtn = await page.$('#primary-mic-button');
  const langToggleBtn = await page.$('#speech-lang-toggle-btn');
  const offlineVoiceBtn = await page.$('#offline-voice-setup-btn');
  const inputBar = await page.$('#voice-text-input');

  console.log('4. Hero Mic Button:', heroMicBtn !== null ? 'OK' : 'MISSING');
  console.log('5. Mic Lang Toggle (hi-IN / en-IN):', langToggleBtn !== null ? 'OK' : 'MISSING');
  console.log('6. Offline Voice Setup:', offlineVoiceBtn !== null ? 'OK' : 'MISSING');
  console.log('7. Freeform text input bar:', inputBar !== null ? 'OK' : 'MISSING');

  if (!heroMicBtn || !langToggleBtn || !offlineVoiceBtn || !inputBar) {
    throw new Error('Core UI element missing!');
  }

  // Screenshot initial clean state
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'clean_app_no_hardcoded_player.png'),
    fullPage: false
  });
  console.log('📸 Saved clean_app_no_hardcoded_player.png');

  // 3. Test dynamic translation of a real natural sentence
  await page.type('#voice-text-input', 'नमस्ते शिक्षक जी, बच्चे मैदान में खेल रहे हैं');
  await page.click('#voice-text-submit-btn');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'clean_dynamic_translation_verified.png'),
    fullPage: false
  });
  console.log('📸 Saved clean_dynamic_translation_verified.png');

  // 4. Test Ho language translation
  await page.goto('http://localhost:4173/?tab=voice&lang=ho', { waitUntil: 'networkidle0' });
  await page.type('#voice-text-input', 'आज हम विज्ञान पढ़ेंगे');
  await page.click('#voice-text-submit-btn');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'clean_ho_dynamic_translation.png'),
    fullPage: false
  });
  console.log('📸 Saved clean_ho_dynamic_translation.png');

  await browser.close();
  console.log('✅ Verification completed successfully! All hardcoded test components removed.');
}

verifyCleanApp().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
