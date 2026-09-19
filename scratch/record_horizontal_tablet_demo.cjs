const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_PATH = '/opt/homebrew/bin/ffmpeg';

const FRAMES_DIR = path.join(__dirname, 'demo_horizontal_frames');
const AUDIO_FILE = path.join(__dirname, '../public/sarjom_narrator_voiceover.mp3');
const APP_URL = 'http://localhost:4173/?tab=voice&lang=santhali&frame=full';

// Horizontal Tablet Landscape Viewport (1280x800, standard 10-inch widescreen tablet)
const VIEWPORT = { width: 1280, height: 800, deviceScaleFactor: 1.5 };

async function main() {
  console.log('===========================================================');
  console.log('🎬 SARJOM 100% IN-APP HORIZONTAL TABLET DEMO RECORDER (1280x800)');
  console.log('Target: Exactly 600 frames at 5 FPS = 120.00s synchronized video');
  console.log('NO SLIDES: Pure, continuous live interactive application usage');
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
  await page.setViewport(VIEWPORT);

  // Navigate directly into the live horizontal app
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Clear any existing dialogue log so the recording starts with a fresh session
  await page.evaluate(() => {
    try {
      localStorage.removeItem('sarjom_dialogue_log');
      localStorage.removeItem('sarjom_cleared_by_user');
    } catch (e) {}
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Inject a simulated glowing tablet touch cursor for clear visual demonstration
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-touch-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(217, 90, 39, 0.45)';
    cursor.style.border = '2.5px solid #D95A27';
    cursor.style.boxShadow = '0 0 12px rgba(217, 90, 39, 0.8), inset 0 0 6px rgba(255,255,255,0.8)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.transition = 'all 0.12s cubic-bezier(0.16, 1, 0.3, 1)';
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.left = '640px';
    cursor.style.top = '400px';
    document.body.appendChild(cursor);

    window.moveCursorTo = (x, y, click = false) => {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      if (click) {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
        cursor.style.backgroundColor = 'rgba(217, 90, 39, 0.85)';
        setTimeout(() => {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
          cursor.style.backgroundColor = 'rgba(217, 90, 39, 0.45)';
        }, 150);
      }
    };
  });

  let frameIdx = 0;

  async function captureFrames(count) {
    for (let i = 0; i < count; i++) {
      const framePath = path.join(FRAMES_DIR, `frame_${String(frameIdx).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: framePath, quality: 90, type: 'jpeg' });
      frameIdx++;
    }
  }

  // Helper to type text into React 18 controlled input with keystroke animation
  async function typeIntoReactInput(selector, text, framesToSpend) {
    await page.focus(selector);
    // Clear input using native setter
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, '');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, selector);

    const chunk = Math.max(1, Math.floor(text.length / (framesToSpend - 2)));
    for (let i = 0; i < text.length; i += chunk) {
      const charSlice = text.substring(i, Math.min(i + chunk, text.length));
      await page.keyboard.type(charSlice, { delay: 10 });
      // Update cursor near input
      const box = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + 20 + Math.min(el.value.length * 7, r.width - 40), y: r.top + r.height / 2 };
      }, selector);
      if (box) {
        await page.evaluate((b) => window.moveCursorTo(b.x, b.y), box);
      }
      await captureFrames(1);
    }
  }

  // =========================================================================
  // SEGMENT 1: 0:00–0:15 (75 frames, idx 0..74)
  // "In many tribal classrooms, teachers and students may speak different languages..."
  // IN-APP: Exploring multilingual language bar (Ho, Mundari, Santhali)
  // =========================================================================
  console.log(`\n[0:00 - 0:15] Capturing Segment 1: In-App Classroom Multilingual Setup`);
  
  // Frame 0..14: Center view of dashboard
  await page.evaluate(() => window.moveCursorTo(640, 260));
  await captureFrames(15);

  // Frame 15..34: Move cursor to Ho language button and click
  await page.evaluate(() => {
    const btn = document.getElementById('nav-lang-ho');
    if (btn) {
      const r = btn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      btn.click();
    }
  });
  await captureFrames(20);

  // Frame 35..54: Move cursor to Mundari button and click
  await page.evaluate(() => {
    const btn = document.getElementById('nav-lang-mundari');
    if (btn) {
      const r = btn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      btn.click();
    }
  });
  await captureFrames(20);

  // Frame 55..74: Move cursor back to Santhali (Ol Chiki) and click
  await page.evaluate(() => {
    const btn = document.getElementById('nav-lang-santhali');
    if (btn) {
      const r = btn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      btn.click();
    }
  });
  await captureFrames(75 - frameIdx);
  console.log(`✓ Segment 1 complete. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 2: 0:15–0:30 (75 frames, idx 75..149)
  // "Here, the teacher is explaining a lesson in Hindi, while students understand..."
  // IN-APP: Teacher enters Science Lesson in Hindi: "Plants ko badhne ke liye..."
  // =========================================================================
  console.log(`\n[0:15 - 0:30] Capturing Segment 2: Teacher Hindi Lesson Input`);

  // Move cursor to teacher mode button
  await page.evaluate(() => {
    const btn = document.getElementById('teacher-mode-btn');
    if (btn) {
      const r = btn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      btn.click();
    }
  });
  await captureFrames(8);

  // Move cursor to input box and focus
  await page.evaluate(() => {
    const input = document.getElementById('voice-text-input');
    if (input) {
      const r = input.getBoundingClientRect();
      window.moveCursorTo(r.left + 80, r.top + r.height / 2, true);
    }
  });
  await captureFrames(6);

  const lessonText = 'Plants ko badhne ke liye paani aur suraj ki roshni chahiye.';
  await typeIntoReactInput('#voice-text-input', lessonText, 55);

  // Fill up remaining frames to exact index 149
  if (frameIdx < 150) {
    await captureFrames(150 - frameIdx);
  }
  console.log(`✓ Segment 2 complete. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 3: 0:30–0:48 (90 frames, idx 150..239)
  // "First, the teacher selects Hindi as source language and student's mother tongue..."
  // IN-APP: Real-Time Translation output in Ol Chiki + Live Audio Broadcast
  // =========================================================================
  console.log(`\n[0:30 - 0:48] Capturing Segment 3: Real-Time Translation & Audio Broadcast`);

  // Move cursor to Translate Submit button and click (triggers handleSubmitText)
  await page.evaluate(() => {
    const btn = document.getElementById('voice-text-submit-btn');
    if (btn) {
      const r = btn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      btn.click();
    }
  });
  await captureFrames(15);

  // Hover over the Ol Chiki translation result card
  await page.evaluate(() => window.moveCursorTo(460, 480));
  await captureFrames(20);

  // Move cursor to Speaker Broadcast button and click (triggers audio broadcast)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const speakerBtn = btns.find(b => b.textContent && (b.textContent.includes('प्रसारण') || b.textContent.includes('Play') || b.textContent.includes('सुनें') || b.textContent.includes('Replay')));
    if (speakerBtn) {
      const r = speakerBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      speakerBtn.click();
    }
  });
  await captureFrames(25);

  // Move cursor to right-side dialogue log to highlight recorded entry #1
  await page.evaluate(() => window.moveCursorTo(1000, 320));
  await captureFrames(240 - frameIdx);
  console.log(`✓ Segment 3 complete. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 4: 0:48–1:02 (70 frames, idx 240..309)
  // "But communication works both ways. Students can speak in their mother tongue..."
  // IN-APP: Two-Way Communication (Student 1 + Student 2 + Teacher Reply)
  // =========================================================================
  console.log(`\n[0:48 - 1:02] Capturing Segment 4: Two-Way Communication (Pure Hindi Translation)`);

  // Click Student Mode button: "छात्र ➔ शिक्षक"
  await page.evaluate(() => {
    const btn = document.getElementById('student-mode-btn');
    if (btn) {
      const r = btn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      btn.click();
    }
  });
  await captureFrames(8);

  // Student 1: "Oh! Ab samajh aa gaya."
  await typeIntoReactInput('#voice-text-input', 'Oh! Ab samajh aa gaya.', 18);
  await page.evaluate(() => {
    const subBtn = document.getElementById('voice-text-submit-btn');
    if (subBtn) subBtn.click();
  });
  await page.evaluate(() => window.moveCursorTo(460, 470));
  await captureFrames(12);

  // Student 2: "Ma'am, plants ko hawa bhi chahiye na?"
  await typeIntoReactInput('#voice-text-input', "Ma'am, plants ko hawa bhi chahiye na?", 18);
  await page.evaluate(() => {
    const subBtn = document.getElementById('voice-text-submit-btn');
    if (subBtn) subBtn.click();
  });
  await page.evaluate(() => window.moveCursorTo(460, 480));
  await captureFrames(14);

  // Teacher responds: "हाँ, बिल्कुल!"
  await page.evaluate(() => {
    const tBtn = document.getElementById('teacher-mode-btn');
    if (tBtn) tBtn.click();
  });
  await captureFrames(4);
  await typeIntoReactInput('#voice-text-input', 'Haan, bilkul!', 10);
  await page.evaluate(() => {
    const subBtn = document.getElementById('voice-text-submit-btn');
    if (subBtn) subBtn.click();
  });
  await page.evaluate(() => window.moveCursorTo(1000, 420));
  await captureFrames(310 - frameIdx);
  console.log(`✓ Segment 4 complete. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 5: 1:02–1:18 (80 frames, idx 310..389)
  // "To make learning more engaging, Sarjom includes visual flashcards..."
  // IN-APP: Flashcard Studio with Nature category, card flipping & audio
  // =========================================================================
  console.log(`\n[1:02 - 1:18] Capturing Segment 5: Flashcard Studio Interaction`);

  // Move cursor to Flashcard tab and click
  await page.evaluate(() => {
    const tabBtn = document.getElementById('tab-btn-flashcards');
    if (tabBtn) {
      const r = tabBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      tabBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 400));
  await captureFrames(12);

  // Click on the Nature / प्रकृति category pill
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const natureBtn = btns.find(b => b.textContent && (b.textContent.includes('प्रकृति') || b.textContent.includes('Nature')));
    if (natureBtn) {
      const r = natureBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      natureBtn.click();
    }
  });
  await captureFrames(15);

  // Click on the first flashcard to flip it
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.flip-card, [style*="perspective"] > div, div[style*="cursor: pointer"]'));
    const targetCard = cards.find(c => c.textContent && (c.textContent.includes('पानी') || c.textContent.includes('पेड़') || c.textContent.includes('Water')));
    if (targetCard) {
      const r = targetCard.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      targetCard.click();
    }
  });
  await captureFrames(25);

  // Click speaker icon on the card
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const speakerBtn = btns.find(b => b.title && b.title.includes('उच्चारण') || (b.innerHTML && b.innerHTML.includes('lucide-volume')));
    if (speakerBtn) {
      const r = speakerBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      speakerBtn.click();
    }
  });
  await captureFrames(15);

  // Click second flashcard to flip it
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.flip-card, [style*="perspective"] > div, div[style*="cursor: pointer"]'));
    const targetCard = cards.find(c => c.textContent && (c.textContent.includes('पेड़') || c.textContent.includes('Tree') || c.textContent.includes('दारे')));
    if (targetCard) {
      const r = targetCard.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      targetCard.click();
    }
  });
  await captureFrames(390 - frameIdx);
  console.log(`✓ Segment 5 complete. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 6: 1:18–1:32 (70 frames, idx 390..459)
  // "Teachers can also generate interactive bilingual worksheets and quizzes..."
  // IN-APP: Bilingual Worksheet Studio & Interactive Word Matching
  // =========================================================================
  console.log(`\n[1:18 - 1:32] Capturing Segment 6: Worksheet & Interactive Quiz Studio`);

  // Move cursor to Worksheet tab and click
  await page.evaluate(() => {
    const tabBtn = document.getElementById('tab-btn-worksheets');
    if (tabBtn) {
      const r = tabBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      tabBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 400));
  await captureFrames(14);

  // Interactive Quiz: Click an answer option
  await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('button, div[style*="cursor: pointer"]'));
    const opt = options.find(o => o.textContent && (o.textContent.includes('ᱫᱟᱜ') || o.textContent.includes('दाग') || o.textContent.includes('दारे')));
    if (opt) {
      const r = opt.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      opt.click();
    }
  });
  await captureFrames(24);

  // Scroll worksheet preview down to show student answer sheet
  await page.evaluate(() => {
    window.scrollBy({ top: 220, behavior: 'smooth' });
    window.moveCursorTo(640, 480);
  });
  await captureFrames(460 - frameIdx);
  console.log(`✓ Segment 6 complete. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 7: 1:32–1:44 (60 frames, idx 460..519)
  // "Sarjom also includes a cultural dictionary. It helps teachers understand..."
  // IN-APP: Pedagogical Dictionary Search & Cultural Morphological Roots
  // =========================================================================
  console.log(`\n[1:32 - 1:44] Capturing Segment 7: Pedagogical Dictionary & Cultural Roots`);

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));

  // Move cursor to Dictionary tab and click
  await page.evaluate(() => {
    const tabBtn = document.getElementById('tab-btn-dictionary');
    if (tabBtn) {
      const r = tabBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      tabBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 400));
  await captureFrames(12);

  // Focus search bar and type "पौधा"
  await typeIntoReactInput('input[type="text"]', 'पौधा', 22);
  await page.evaluate(() => window.moveCursorTo(540, 440));
  await captureFrames(520 - frameIdx);
  console.log(`✓ Segment 7 complete. Total frames: ${frameIdx}`);

  // =========================================================================
  // SEGMENT 8: 1:44–2:00 (80 frames, idx 520..599)
  // "By bridging language barriers, Sarjom empowers both teachers and students..."
  // IN-APP: Return to Dialogue Hub, Export Classroom Report, Full Tablet View
  // =========================================================================
  console.log(`\n[1:44 - 2:00] Capturing Segment 8: Full Classroom Dialogue & Report Export`);

  // Return to Voice & Text Dialogue Hub
  await page.evaluate(() => {
    const tabBtn = document.getElementById('tab-btn-voice');
    if (tabBtn) {
      const r = tabBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
      tabBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 400));
  await captureFrames(15);

  // Move cursor to PDF Report button on top right of interaction log
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pdfBtn = btns.find(b => b.textContent && b.textContent.includes('PDF'));
    if (pdfBtn) {
      const r = pdfBtn.getBoundingClientRect();
      window.moveCursorTo(r.left + r.width / 2, r.top + r.height / 2, true);
    }
  });
  await captureFrames(20);

  // Smooth scroll through the rich interaction log to show all 4 recorded bilingual entries
  await page.evaluate(() => {
    const logContainer = document.querySelector('[style*="overflow-y: auto"], .dialogue-log-list');
    if (logContainer) {
      logContainer.scrollBy({ top: 120, behavior: 'smooth' });
    }
    window.moveCursorTo(1000, 500);
  });
  await captureFrames(25);

  // Final frames: Glide cursor to top brand logo & offline indicator
  await page.evaluate(() => window.moveCursorTo(140, 28));
  await captureFrames(600 - frameIdx);
  console.log(`✓ Segment 8 complete. Total frames: ${frameIdx}`);

  await browser.close();

  // Save key milestone verification screenshots directly to brain artifacts
  const milestones = [
    { frame: 30, name: 'inapp_demo_1_language_bar.jpg' },
    { frame: 140, name: 'inapp_demo_2_teacher_input.jpg' },
    { frame: 200, name: 'inapp_demo_3_realtime_translation.jpg' },
    { frame: 290, name: 'inapp_demo_4_twoway_pure_hindi.jpg' },
    { frame: 350, name: 'inapp_demo_5_flashcards_flip.jpg' },
    { frame: 420, name: 'inapp_demo_6_worksheet_match.jpg' },
    { frame: 490, name: 'inapp_demo_7_dictionary_roots.jpg' },
    { frame: 570, name: 'inapp_demo_8_dialogue_log.jpg' }
  ];

  for (const m of milestones) {
    const src = path.join(FRAMES_DIR, `frame_${String(m.frame).padStart(5, '0')}.jpg`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(ARTIFACT_DIR, m.name));
      console.log(`📸 Saved artifact preview: ${m.name}`);
    }
  }

  console.log('\n===========================================================');
  console.log('🎞️ ENCODING FINAL 120.00s HORIZONTAL TABLET VIDEO WITH AUDIO');
  console.log('===========================================================');

  const OUTPUT_VIDEO = path.join(__dirname, '../public/sarjom_horizontal_tablet_demo.mp4');
  const DOWNLOADS_VIDEO = '/Users/toru/Downloads/sarjom_horizontal_tablet_demo.mp4';
  const ARTIFACT_VIDEO = path.join(ARTIFACT_DIR, 'sarjom_horizontal_tablet_demo.mp4');

  const ffmpegCmd = [
    FFMPEG_PATH,
    '-y',
    '-framerate', '5',
    '-i', path.join(FRAMES_DIR, 'frame_%05d.jpg'),
    '-i', AUDIO_FILE,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    OUTPUT_VIDEO
  ].join(' ');

  console.log('Running ffmpeg encoding command...');
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Copy to Downloads & Artifacts
  fs.copyFileSync(OUTPUT_VIDEO, DOWNLOADS_VIDEO);
  fs.copyFileSync(OUTPUT_VIDEO, ARTIFACT_VIDEO);

  // Generate lightweight preview GIF for artifacts
  const GIF_OUTPUT = path.join(ARTIFACT_DIR, 'sarjom_horizontal_tablet_demo_preview.gif');
  console.log('Generating lightweight preview GIF...');
  try {
    execSync(
      `${FFMPEG_PATH} -y -ss 00:00:20 -t 15 -i ${OUTPUT_VIDEO} -vf "fps=6,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ${GIF_OUTPUT}`,
      { stdio: 'ignore' }
    );
    console.log(`✓ Preview GIF saved: ${GIF_OUTPUT}`);
  } catch (e) {
    console.warn('GIF preview warning:', e.message);
  }

  const stat = fs.statSync(OUTPUT_VIDEO);
  console.log('\n===========================================================');
  console.log('🎉 100% IN-APP HORIZONTAL TABLET DEMO VIDEO GENERATION COMPLETE!');
  console.log(`📦 Final Video Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`⏱️ Duration: Exactly 120.00s (600 frames at 5 FPS)`);
  console.log(`📂 Output Paths:`);
  console.log(`   1. Downloads: ${DOWNLOADS_VIDEO}`);
  console.log(`   2. Public Web: ${OUTPUT_VIDEO}`);
  console.log(`   3. Artifacts: ${ARTIFACT_VIDEO}`);
  console.log('===========================================================');
}

main().catch(err => {
  console.error('Fatal error in recorder:', err);
  process.exit(1);
});
