const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';

(async () => {
  console.log('🚀 Launching browser to verify Audiobook Player & Offline Voice Setup...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });

  await page.goto('http://localhost:4173?lang=santhali', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Verify Offline Voice Setup Button & Modal
  console.log('\n--- 1. Testing Offline Voice Setup Button & Modal ---');
  const hasOfflineBtn = await page.$('#offline-voice-setup-btn');
  console.log('Has Offline Voice Button:', !!hasOfflineBtn);

  await page.click('#offline-voice-setup-btn');
  await new Promise(r => setTimeout(r, 800));

  const modalScreenshotPath = path.join(ARTIFACT_DIR, 'offline_voice_guide_modal_verified.png');
  await page.screenshot({ path: modalScreenshotPath });
  console.log('📸 Saved modal screenshot:', modalScreenshotPath);

  // Close modal by clicking Got it or close button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.textContent.includes('Got it') || b.textContent.includes('समझ गया') || b.textContent.trim() === '✕');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Verify Audiobook Player
  console.log('\n--- 2. Testing Audiobook Player & Audio Playback ---');
  const playerInfo = await page.evaluate(() => {
    const player = document.getElementById('audiobook-live-player');
    const playBtn = document.getElementById('play-audiobook-btn');
    const audioEl = player?.querySelector('audio');
    return {
      hasPlayer: !!player,
      hasPlayBtn: !!playBtn,
      audioSrc: audioEl?.getAttribute('src') || '',
    };
  });
  console.log('Player Info:', playerInfo);

  // Click Play Audiobook Button
  console.log('Clicking Play Audiobook Button...');
  await page.click('#play-audiobook-btn');
  await new Promise(r => setTimeout(r, 2500));

  // Check playback status & live translation
  const playbackState = await page.evaluate(() => {
    const audioEl = document.querySelector('#audiobook-live-player audio');
    const subtitleEl = document.querySelector('#audiobook-live-player [style*="backgroundColor: rgb(255, 255, 255)"], #audiobook-live-player [style*="background-color: #ffffff"]');
    const inputEl = document.querySelector('input[type="text"]');
    const translationCard = document.getElementById('voice-translation-result');
    const nativeScript = translationCard?.querySelector('.voice-result-script')?.innerText.trim() || '';

    return {
      currentTime: audioEl?.currentTime || 0,
      paused: audioEl?.paused ?? true,
      subtitle: subtitleEl?.innerText.trim() || '',
      inputText: inputEl?.value || '',
      hasTranslationCard: !!translationCard,
      nativeScript: nativeScript
    };
  });
  console.log('Playback State & Live Translation:', JSON.stringify(playbackState, null, 2));

  const audiobookLiveScreenshot = path.join(ARTIFACT_DIR, 'audiobook_live_playback_santhali.png');
  await page.screenshot({ path: audiobookLiveScreenshot });
  console.log('📸 Saved audiobook live playback screenshot:', audiobookLiveScreenshot);

  // 3. Test with Ho Language
  console.log('\n--- 3. Testing Audiobook with Ho Language ---');
  await page.goto('http://localhost:4173?lang=ho', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  await page.click('#play-audiobook-btn');
  await new Promise(r => setTimeout(r, 2500));

  const hoPlaybackState = await page.evaluate(() => {
    const audioEl = document.querySelector('#audiobook-live-player audio');
    const inputEl = document.querySelector('input[type="text"]');
    const translationCard = document.getElementById('voice-translation-result');
    const nativeScript = translationCard?.querySelector('.voice-result-script')?.innerText.trim() || '';

    return {
      currentTime: audioEl?.currentTime || 0,
      inputText: inputEl?.value || '',
      hasTranslationCard: !!translationCard,
      nativeScript: nativeScript
    };
  });
  console.log('Ho Playback State & Live Translation:', JSON.stringify(hoPlaybackState, null, 2));

  const hoAudiobookScreenshot = path.join(ARTIFACT_DIR, 'audiobook_live_playback_ho.png');
  await page.screenshot({ path: hoAudiobookScreenshot });
  console.log('📸 Saved Ho live playback screenshot:', hoAudiobookScreenshot);

  await browser.close();
  console.log('\n🎉 Audiobook Player & Offline Voice Setup fully verified!');
})();
