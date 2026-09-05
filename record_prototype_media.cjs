const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'public', 'screenshots');
const FRAMES_DIR = path.join(__dirname, 'public', 'temp_frames');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
} else {
  // clean old frames
  fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));
}

let frameIndex = 0;
async function captureFrame(page, repeat = 1) {
  const framePath = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(4, '0')}.png`);
  await page.screenshot({ path: framePath });
  frameIndex++;
  for (let i = 1; i < repeat; i++) {
    const dupPath = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(4, '0')}.png`);
    fs.copyFileSync(framePath, dupPath);
    frameIndex++;
  }
}

(async () => {
  console.log('🚀 Launching Chrome to capture high-res prototype media...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });

  // 1. Initial Load - Parchment Sand Voice Translator
  console.log('📸 1. Capturing Voice Translator (Parchment Sand)...');
  await page.goto(`${BASE_URL}/?theme=light&ui=en&tab=voice`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_voice_translator_parchment.png') });
  await captureFrame(page, 4);

  // Type a sample translation
  console.log('✍️ Typing translation prompt...');
  const inputEl = await page.$('input[type="text"]');
  if (inputEl) {
    await inputEl.type('Mera naam Rudra hai. Kitab kholo.', { delay: 40 });
    await captureFrame(page, 2);
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));
    await captureFrame(page, 5);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_translation_result.png') });

  // 2. Switch dialect to Santhali (Ol Chiki)
  console.log('📸 2. Switching dialect to Santhali (Ol Chiki)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const santhaliBtn = btns.find(b => b.textContent.includes('Santhali') || b.textContent.includes('ᱥᱟᱱᱛᱟᱲᱤ'));
    if (santhaliBtn) santhaliBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await captureFrame(page, 4);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_santhali_olchiki.png') });

  // 3. Switch to Student Ear mode
  console.log('📸 3. Switching to Student Ear Mode...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const studentBtn = btns.find(b => b.textContent.includes('Student Speaks') || b.textContent.includes('छात्र'));
    if (studentBtn) studentBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await captureFrame(page, 4);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_student_ear_mode.png') });

  // 4. Switch back to Teacher mode & Navigate to Worksheets
  console.log('📸 4. Capturing Worksheets Studio...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const teacherBtn = btns.find(b => b.textContent.includes('Teacher Speaks') || b.textContent.includes('शिक्षक'));
    if (teacherBtn) teacherBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const wsTab = btns.find(b => b.textContent.trim() === 'Worksheets' || b.textContent.includes('कार्यपत्रक'));
    if (wsTab) wsTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await captureFrame(page, 5);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_bilingual_worksheets.png') });

  // 5. Navigate to Flashcards
  console.log('📸 5. Capturing NIPUN Flashcards...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const fcTab = btns.find(b => b.textContent.trim() === 'Flashcards' || b.textContent.includes('फ्लैशकार्ड'));
    if (fcTab) fcTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await captureFrame(page, 5);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_nipun_flashcards.png') });

  // 6. Navigate to Dictionary
  console.log('📸 6. Capturing Tri-Lingual Dictionary...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const dictTab = btns.find(b => b.textContent.trim() === 'Dictionary' || b.textContent.includes('शब्दकोश'));
    if (dictTab) dictTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await captureFrame(page, 5);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_tribal_dictionary.png') });

  // 7. Toggle Dark Mode via direct navigation
  console.log('📸 7. Capturing Dark Mode (OLED)...');
  await page.goto(`${BASE_URL}/?theme=dark&ui=en&tab=voice`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await captureFrame(page, 5);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_dark_mode_oled.png') });

  // 8. Worksheets in Dark Mode
  await page.goto(`${BASE_URL}/?theme=dark&ui=en&tab=worksheets`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await captureFrame(page, 4);

  // 9. Back to Parchment Sand Voice
  await page.goto(`${BASE_URL}/?theme=light&ui=en&tab=voice`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await captureFrame(page, 4);

  await browser.close();
  console.log(`✅ Captured ${frameIndex} high-res frames and 8 key screenshots.`);

  // 9. Compile Video & GIF using ffmpeg
  console.log('🎬 Compiling MP4 video...');
  const mp4Output = path.join(__dirname, 'public', 'sarjom_live_click_demo.mp4');
  const gifOutput = path.join(__dirname, 'public', 'sarjom_live_click_demo.gif');

  try {
    // Generate high quality mp4
    execSync(`ffmpeg -y -framerate 4 -i "${FRAMES_DIR}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:-2" "${mp4Output}"`, { stdio: 'inherit' });
    console.log('✅ MP4 created successfully:', mp4Output);

    // Generate high quality animated GIF (scaled down to 800w for fast loading on GitHub)
    console.log('🎞️ Compiling animated GIF for GitHub README...');
    execSync(`ffmpeg -y -framerate 4 -i "${FRAMES_DIR}/frame_%04d.png" -vf "fps=4,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${gifOutput}"`, { stdio: 'inherit' });
    console.log('✅ GIF created successfully:', gifOutput);

    // Clean up temporary frames
    fs.readdirSync(FRAMES_DIR).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));
    fs.rmdirSync(FRAMES_DIR);
    console.log('🧹 Cleaned up temporary frames.');
  } catch (err) {
    console.error('Error during ffmpeg video encoding:', err);
  }

  console.log('🎉 Prototype media generation complete!');
})();
