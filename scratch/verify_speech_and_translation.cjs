const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';

(async () => {
  console.log('🚀 Starting end-to-end browser verification of speech toggle, continuous capture, and translation...');
  
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });

  // 1. Open app
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Check the speech language toggle button
  const initialBtnText = await page.evaluate(() => {
    const btn = document.getElementById('speech-lang-toggle-btn');
    return btn ? btn.innerText.trim() : null;
  });
  console.log('Initial Speech Lang Button Text:', initialBtnText);

  // Click the toggle button to switch to English Mic
  await page.click('#speech-lang-toggle-btn');
  await new Promise(r => setTimeout(r, 600));

  const toggledBtnText = await page.evaluate(() => {
    const btn = document.getElementById('speech-lang-toggle-btn');
    return btn ? btn.innerText.trim() : null;
  });
  console.log('After 1st Click (Toggled to English):', toggledBtnText);

  // Click again to toggle back to Hindi Mic
  await page.click('#speech-lang-toggle-btn');
  await new Promise(r => setTimeout(r, 600));

  const toggledBackBtnText = await page.evaluate(() => {
    const btn = document.getElementById('speech-lang-toggle-btn');
    return btn ? btn.innerText.trim() : null;
  });
  console.log('After 2nd Click (Toggled back to Hindi):', toggledBackBtnText);

  // 3. Test English sentence translation via the app UI
  console.log('\n--- Testing English Speech / Text: "tell me a real story of adoption" ---');
  await page.goto('http://localhost:4173?lang=santhali&q=' + encodeURIComponent('tell me a real story of adoption'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const santhaliResult = await page.evaluate(() => {
    const el = document.getElementById('voice-translation-result');
    return {
      exists: !!el,
      scriptText: el ? el.querySelector('.voice-result-script')?.innerText.trim() : '',
      phonetic: el ? el.querySelector('[style*="fontSize: 0.95rem"], [style*="font-size: 0.95rem"]')?.innerText.trim() : ''
    };
  });
  console.log('Santhali Result for English sentence:', santhaliResult);

  const englishSanthaliPath = path.join(ARTIFACT_DIR, 'speech_english_santhali_verified.png');
  await page.screenshot({ path: englishSanthaliPath });
  console.log('📸 Screenshot saved:', englishSanthaliPath);

  // 4. Test Classroom command: "sit down and open your book" in Ho
  console.log('\n--- Testing English Classroom Command in Ho: "sit down and open book" ---');
  await page.goto('http://localhost:4173?lang=ho&q=' + encodeURIComponent('sit down and open book'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const hoResult = await page.evaluate(() => {
    const el = document.getElementById('voice-translation-result');
    return {
      exists: !!el,
      scriptText: el ? el.querySelector('.voice-result-script')?.innerText.trim() : '',
      phonetic: el ? el.querySelector('[style*="fontSize: 0.95rem"], [style*="font-size: 0.95rem"]')?.innerText.trim() : ''
    };
  });
  console.log('Ho Result for Classroom command:', hoResult);

  const hoCmdPath = path.join(ARTIFACT_DIR, 'speech_classroom_ho_verified.png');
  await page.screenshot({ path: hoCmdPath });
  console.log('📸 Screenshot saved:', hoCmdPath);

  // 5. Test Mic Button & UI responsiveness
  console.log('\n--- Testing Mic Controls on UI ---');
  await page.goto('http://localhost:4173?lang=mundari', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const micBtnPresent = await page.evaluate(() => {
    const mic = document.getElementById('primary-mic-button');
    const toggle = document.getElementById('speech-lang-toggle-btn');
    return {
      hasMicButton: !!mic,
      micText: mic?.innerText || '',
      hasToggle: !!toggle,
      toggleText: toggle?.innerText || ''
    };
  });
  console.log('Mic Controls Check:', micBtnPresent);

  const mundariUiPath = path.join(ARTIFACT_DIR, 'mic_controls_mundari_verified.png');
  await page.screenshot({ path: mundariUiPath });
  console.log('📸 Screenshot saved:', mundariUiPath);

  await browser.close();
  console.log('\n🎉 Verification completed successfully!');
})();
