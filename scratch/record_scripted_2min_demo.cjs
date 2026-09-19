const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_PATH = '/opt/homebrew/bin/ffmpeg';

const FRAMES_DIR = path.join(__dirname, 'demo_2min_frames');
const AUDIO_FILE = path.join(__dirname, '../public/sarjom_narrator_voiceover.mp3');
const SLIDES_URL = 'file://' + path.resolve(__dirname, 'demo_slides.html');
const APP_URL = 'http://localhost:4173/?tab=voice&lang=santhali&frame=full';

async function main() {
  console.log('===========================================================');
  console.log('🎬 SARJOM 2-MINUTE NARRATED DEMO VIDEO RECORDER');
  console.log('Target: 600 frames at 5 FPS = 120.00s synchronized video');
  console.log('===========================================================');

  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  // Standard 10-inch Classroom Android Tablet (800x1100, 1.5x DPI)
  await page.setViewport({ width: 800, height: 1100, deviceScaleFactor: 1.5 });

  let frameIdx = 0;

  async function captureFrames(count) {
    for (let i = 0; i < count; i++) {
      const framePath = path.join(FRAMES_DIR, `frame_${String(frameIdx).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: framePath, quality: 88, type: 'jpeg' });
      frameIdx++;
    }
  }

  // =========================================================================
  // SEGMENT 1: 0:00–0:15 (75 frames, idx 0..74)
  // "In many tribal classrooms, teachers and students may speak different..."
  // =========================================================================
  console.log(`\n[0:00 - 0:15] Capturing Segment 1: Classroom Language Gap (Slide 1)`);
  await page.goto(SLIDES_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.showSlide(1));
  await new Promise(r => setTimeout(r, 400));
  await captureFrames(75);
  console.log(`✓ Segment 1 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 2: 0:15–0:30 (75 frames, idx 75..149)
  // "Here, the teacher is explaining a lesson in Hindi, while students..."
  // =========================================================================
  console.log(`\n[0:15 - 0:30] Capturing Segment 2: Turning to SARJOM Bridge (Slide 2)`);
  await page.evaluate(() => window.showSlide(2));
  await new Promise(r => setTimeout(r, 400));
  await captureFrames(75);
  console.log(`✓ Segment 2 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 3: 0:30–0:48 (90 frames, idx 150..239)
  // Real-Time Translation: Teacher speaks Hindi -> Santhali Ol Chiki + Audio
  // =========================================================================
  console.log(`\n[0:30 - 0:48] Capturing Segment 3: Real-Time Translation in App`);
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // 6 frames initial idle
  await captureFrames(6);

  // Click teacher mode button (5 frames)
  const teacherBtn = await page.$('#teacher-mode-btn');
  if (teacherBtn) await teacherBtn.click();
  await captureFrames(5);

  // Type teacher input: "Plants ko badhne ke liye paani aur suraj ki roshni chahiye."
  const teacherInput = 'Plants ko badhne ke liye paani aur suraj ki roshni chahiye.';
  await page.focus('#voice-text-input');
  await page.evaluate(() => {
    const el = document.getElementById('voice-text-input');
    if (el) el.value = '';
  });

  // Type in increments and capture frames (35 frames)
  for (let i = 0; i < teacherInput.length; i++) {
    await page.keyboard.sendCharacter(teacherInput[i]);
    if (i % 2 === 0 && frameIdx < 185) {
      await captureFrames(1);
    }
  }
  // Fill up typing frames to frame 190
  while (frameIdx < 190) {
    await captureFrames(1);
  }

  // Click submit (5 frames)
  const submitBtn = await page.$('#voice-text-submit-btn');
  if (submitBtn) await submitBtn.click();
  await new Promise(r => setTimeout(r, 500));
  await captureFrames(5);

  // Hold translation display with audio indicator active until frame 240 (45 frames)
  while (frameIdx < 240) {
    await captureFrames(1);
  }
  console.log(`✓ Segment 3 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 4: 0:48–1:02 (70 frames, idx 240..309)
  // Two-Way Communication: Student speaks Mother Tongue -> Teacher Hindi
  // =========================================================================
  console.log(`\n[0:48 - 1:02] Capturing Segment 4: Two-Way Communication`);
  // Click student mode button (8 frames)
  const studentBtn = await page.$('#student-mode-btn');
  if (studentBtn) await studentBtn.click();
  await new Promise(r => setTimeout(r, 300));
  await captureFrames(8);

  // Student 1 speaks: ᱚᱦ! ᱱᱤᱛᱚᱜ ᱵᱩᱡᱷᱟᱹᱣ ᱮᱱᱟ᱾ ("Oh! Ab samajh aa gaya.")
  const s1Text = 'ᱚᱦ! ᱱᱤᱛᱚᱜ ᱵᱩᱡᱷᱟᱹᱣ ᱮᱱᱟ᱾';
  await page.focus('#voice-text-input');
  await page.evaluate(() => {
    const el = document.getElementById('voice-text-input');
    if (el) el.value = '';
  });
  for (let i = 0; i < s1Text.length; i++) {
    await page.keyboard.sendCharacter(s1Text[i]);
    if (i % 2 === 0) await captureFrames(1);
  }
  const s1Submit = await page.$('#voice-text-submit-btn');
  if (s1Submit) await s1Submit.click();
  await new Promise(r => setTimeout(r, 400));
  while (frameIdx < 275) {
    await captureFrames(1);
  }

  // Student 2 asks: ᱢᱮᱰᱟᱢ, ᱫᱟᱨᱮ ᱠᱚ ᱦᱚᱭ ᱦᱚᱸ ᱞᱟᱹᱠᱛᱤᱜ-ᱟ ᱥᱮ? ("Ma'am, plants ko hawa bhi chahiye na?")
  const s2Text = 'ᱢᱮᱰᱟᱢ, ᱫᱟᱨᱮ ᱠᱚ ᱦᱚᱭ ᱦᱚᱸ ᱞᱟᱹᱠᱛᱤᱜ-ᱟ ᱥᱮ?';
  await page.focus('#voice-text-input');
  await page.evaluate(() => {
    const el = document.getElementById('voice-text-input');
    if (el) el.value = '';
  });
  for (let i = 0; i < s2Text.length; i++) {
    await page.keyboard.sendCharacter(s2Text[i]);
    if (i % 2 === 0) await captureFrames(1);
  }
  const s2Submit = await page.$('#voice-text-submit-btn');
  if (s2Submit) await s2Submit.click();
  await new Promise(r => setTimeout(r, 400));
  while (frameIdx < 300) {
    await captureFrames(1);
  }

  // Teacher confirms in Hindi: "Haan, bilkul!"
  if (teacherBtn) await teacherBtn.click();
  await page.focus('#voice-text-input');
  await page.evaluate(() => {
    const el = document.getElementById('voice-text-input');
    if (el) el.value = '';
  });
  for (const ch of 'Haan, bilkul!') {
    await page.keyboard.sendCharacter(ch);
  }
  if (submitBtn) await submitBtn.click();
  await new Promise(r => setTimeout(r, 300));
  while (frameIdx < 310) {
    await captureFrames(1);
  }
  console.log(`✓ Segment 4 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 5: 1:02–1:18 (80 frames, idx 310..389)
  // Multilingual Flashcards: Visuals, Vocabulary & Pronunciation
  // =========================================================================
  console.log(`\n[1:02 - 1:18] Capturing Segment 5: Flashcards Deck`);
  const flashTabBtn = await page.$('#tab-btn-flashcards');
  if (flashTabBtn) {
    await flashTabBtn.click();
  } else {
    await page.goto('http://localhost:4173/?tab=flashcards&lang=santhali&frame=full', { waitUntil: 'networkidle0' });
  }
  await new Promise(r => setTimeout(r, 600));
  await captureFrames(15);

  // Click vocabulary tab or filter
  const vocabBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('शब्दावली'));
  });
  if (vocabBtn && vocabBtn.asElement()) {
    await vocabBtn.asElement().click();
    await new Promise(r => setTimeout(r, 400));
  }
  await captureFrames(15);

  // Click on a flashcard to flip it
  const cardElements = await page.$$('.flashcard, [style*="cursor: pointer"]');
  if (cardElements.length > 2) {
    await cardElements[2].click();
    await new Promise(r => setTimeout(r, 400));
  }
  await captureFrames(25);

  // Scroll slightly down to showcase more visual cards
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await new Promise(r => setTimeout(r, 300));
  while (frameIdx < 390) {
    await captureFrames(1);
  }
  console.log(`✓ Segment 5 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 6: 1:18–1:32 (70 frames, idx 390..459)
  // Interactive Quizzes aligned with NIPUN Bharat FLN
  // =========================================================================
  console.log(`\n[1:18 - 1:32] Capturing Segment 6: Worksheets & NIPUN Bharat Quiz`);
  const quizTabBtn = await page.$('#tab-btn-worksheets');
  if (quizTabBtn) {
    await quizTabBtn.click();
  } else {
    await page.goto('http://localhost:4173/?tab=worksheets&lang=santhali&frame=full', { waitUntil: 'networkidle0' });
  }
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await captureFrames(20);

  // Click interactive match quiz option
  await page.evaluate(() => {
    // Click on option 1 in Column A
    const itemsA = document.querySelectorAll('.worksheet-col-a button, [style*="cursor: pointer"]');
    if (itemsA.length > 0) itemsA[0].click();
  });
  await new Promise(r => setTimeout(r, 300));
  await captureFrames(15);

  // Click matching item in Column B
  await page.evaluate(() => {
    const itemsB = document.querySelectorAll('.worksheet-col-b button, [style*="cursor: pointer"]');
    if (itemsB.length > 1) itemsB[1].click();
  });
  await new Promise(r => setTimeout(r, 400));
  while (frameIdx < 460) {
    await captureFrames(1);
  }
  console.log(`✓ Segment 6 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 7: 1:32–1:40 (40 frames, idx 460..499)
  // Directionart (Pedagogical Dictionary & Teacher Guidance)
  // =========================================================================
  console.log(`\n[1:32 - 1:40] Capturing Segment 7: Directionart / Pedagogical Dictionary`);
  const dictTabBtn = await page.$('#tab-btn-dictionary');
  if (dictTabBtn) {
    await dictTabBtn.click();
  } else {
    await page.goto('http://localhost:4173/?tab=dictionary&lang=santhali&frame=full', { waitUntil: 'networkidle0' });
  }
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await captureFrames(12);

  // Focus search and type 'पेड़' or 'पौधा'
  const dictInput = await page.$('input[type="text"], input[placeholder*="खोजें"]');
  if (dictInput) {
    await dictInput.focus();
    for (const ch of 'पेड़') {
      await page.keyboard.sendCharacter(ch);
      await captureFrames(1);
    }
  }
  await new Promise(r => setTimeout(r, 300));
  while (frameIdx < 500) {
    await captureFrames(1);
  }
  console.log(`✓ Segment 7 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 8: 1:40–1:55 (75 frames, idx 500..574)
  // Transformative Classroom Impact (Slide 8)
  // =========================================================================
  console.log(`\n[1:40 - 1:55] Capturing Segment 8: Classroom Transformation (Slide 8)`);
  await page.goto(SLIDES_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.showSlide(8));
  await new Promise(r => setTimeout(r, 400));
  while (frameIdx < 575) {
    await captureFrames(1);
  }
  console.log(`✓ Segment 8 done. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 9: 1:55–2:00 (25 frames, idx 575..599)
  // Outro Logo & Tagline (Slide 9)
  // =========================================================================
  console.log(`\n[1:55 - 2:00] Capturing Segment 9: Outro Logo & Tagline (Slide 9)`);
  await page.evaluate(() => window.showSlide(9));
  await new Promise(r => setTimeout(r, 400));
  while (frameIdx < 600) {
    await captureFrames(1);
  }
  console.log(`✓ Segment 9 done. Total frames: ${frameIdx}`);

  await browser.close();
  console.log(`\n🎉 Total frames captured: ${frameIdx} (Target: 600)`);

  // =========================================================================
  // ENCODE VIDEO & MUX AUDIO WITH FFMPEG
  // =========================================================================
  const outputMp4 = path.join(ARTIFACT_DIR, 'sarjom_2min_narrated_demo.mp4');
  const pubMp4 = path.join(__dirname, '../public/sarjom_2min_narrated_demo.mp4');
  const outputGif = path.join(ARTIFACT_DIR, 'sarjom_2min_narrated_demo_preview.gif');
  const pubGif = path.join(__dirname, '../public/sarjom_2min_narrated_demo_preview.gif');

  console.log(`\n🎞️ Muxing 600 video frames with master narrator voiceover audio...`);
  const ffmpegCmd = `${FFMPEG_PATH} -y -framerate 5 -i "${FRAMES_DIR}/frame_%05d.jpg" -i "${AUDIO_FILE}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -vf "scale=800:-2" "${outputMp4}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });
  fs.copyFileSync(outputMp4, pubMp4);
  console.log(`✅ Master 2-minute MP4 created: ${outputMp4}`);
  console.log(`✅ Copied to public: ${pubMp4}`);

  // Create lightweight preview GIF (every 5th frame, scaled to 480w)
  console.log(`\n🎞️ Generating optimized preview GIF...`);
  try {
    const gifCmd = `${FFMPEG_PATH} -y -framerate 2 -i "${FRAMES_DIR}/frame_%05d.jpg" -vf "scale=480:-1:flags=lanczos,fps=2" -t 30 "${outputGif}"`;
    execSync(gifCmd, { stdio: 'inherit' });
    fs.copyFileSync(outputGif, pubGif);
    console.log(`✅ Preview GIF created: ${outputGif}`);
  } catch (err) {
    console.warn(`GIF generation note:`, err.message);
  }

  // Probe the final MP4
  console.log(`\n🔍 Verifying final MP4 media metadata...`);
  execSync(`${FFMPEG_PATH.replace('ffmpeg', 'ffprobe')} -i "${outputMp4}"`, { stdio: 'inherit' });
}

main().catch(err => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});
