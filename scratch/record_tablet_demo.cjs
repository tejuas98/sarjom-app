const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SCENARIOS = [
  {
    lang: 'santhali',
    name: 'Santhali (Ol Chiki)',
    step1_teacher_in: 'Plants ko badhne ke liye paani aur suraj ki roshni chahiye.',
    step2_student1_in: 'ᱚᱦ! ᱱᱤᱛᱚᱜ ᱵᱩᱡᱷᱟᱹᱣ ᱮᱱᱟ᱾',
    step3_student2_in: 'ᱢᱮᱰᱟᱢ, ᱫᱟᱨᱮ ᱠᱚ ᱦᱚᱭ ᱦᱚᱸ ᱞᱟᱹᱠᱛᱤᱜ-ᱟ ᱥᱮ?',
    step4_teacher_reply: 'Haan, bilkul!'
  },
  {
    lang: 'ho',
    name: 'Ho (Warang Chiti / Devanagari)',
    step1_teacher_in: 'Plants ko badhne ke liye paani aur suraj ki roshni chahiye.',
    step2_student1_in: '𑢵𑢸! 𑢓𑣁𑢹𑣄 𑢤𑣃𑣓𑣁𑣉 𑣕𑣓𑣁।',
    step3_student2_in: '𑢫𑣄𑢵𑢫, 𑢵𑣁𑣜𑣃 𑢌𑣉 𑢹𑣉𑣕𑣉 𑢹𑣉 𑢵𑢜𑣜𑣌𑣁𑣜 𑢫𑣄𑢓𑣁𑣄 𑢡 𑢓𑣁?',
    step4_teacher_reply: 'Haan, bilkul!'
  },
  {
    lang: 'mundari',
    name: 'Mundari (Khunti / Devanagari)',
    step1_teacher_in: 'Plants ko badhne ke liye paani aur suraj ki roshni chahiye.',
    step2_student1_in: 'ओह! नाहः बुझाव याना।',
    step3_student2_in: 'मैडम, दारु को होयो हो दरकार मेनाः आ ना?',
    step4_teacher_reply: 'Haan, bilkul!'
  }
];

async function recordScenario(scenario) {
  console.log(`\n======================================================`);
  console.log(`🎬 Recording 2-Way Tablet Scenario for: ${scenario.name}`);
  console.log(`======================================================`);

  const framesDir = path.join(__dirname, `frames_${scenario.lang}`);
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

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
  async function captureFrame(count = 1) {
    for (let i = 0; i < count; i++) {
      const framePath = path.join(framesDir, `frame_${String(frameIdx++).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: framePath, quality: 85, type: 'jpeg' });
    }
  }

  // Navigate to voice translator for selected tribal language
  await page.goto(`http://localhost:4173/?tab=voice&lang=${scenario.lang}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await captureFrame(4); // 0.8s idle

  // Save initial milestone screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `tablet_${scenario.lang}_initial.png`) });

  // ----------------------------------------------------
  // STEP 1: Teacher (Hindi) speaks plant science lesson
  // ----------------------------------------------------
  console.log(`[Step 1] Teacher speaking in Hindi: "${scenario.step1_teacher_in}"`);
  await page.click('#teacher-mode-btn');
  await captureFrame(2);

  // Type teacher sentence
  await page.focus('#voice-text-input');
  for (const ch of scenario.step1_teacher_in) {
    await page.keyboard.sendCharacter(ch);
    if (frameIdx % 4 === 0) await captureFrame(1);
  }
  await captureFrame(2);

  // Submit translation
  await page.click('#voice-text-submit-btn');
  await new Promise(r => setTimeout(r, 600));
  await captureFrame(8); // hold translation display for 1.6s

  // Save Step 1 Milestone Screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `tablet_${scenario.lang}_step1_teacher_output.png`) });

  // ----------------------------------------------------
  // STEP 2: TWO-WAY COMMUNICATION - Student 1 (Mother Tongue)
  // "Oh! Ab samajh aa gaya."
  // ----------------------------------------------------
  console.log(`[Step 2] Switching to Student Mode (Two-Way Communication)...`);
  await page.click('#student-mode-btn');
  await new Promise(r => setTimeout(r, 300));
  await captureFrame(3);

  console.log(`[Step 2] Student 1 speaking in ${scenario.name}: "${scenario.step2_student1_in}"`);
  await page.focus('#voice-text-input');
  // Clear any existing text
  await page.evaluate(() => {
    const el = document.getElementById('voice-text-input');
    if (el) el.value = '';
  });

  for (const ch of scenario.step2_student1_in) {
    await page.keyboard.sendCharacter(ch);
    if (frameIdx % 3 === 0) await captureFrame(1);
  }
  await captureFrame(2);

  // Submit Student 1 message
  await page.click('#voice-text-submit-btn');
  await new Promise(r => setTimeout(r, 600));
  await captureFrame(8); // hold translation display for 1.6s

  // Save Step 2 Milestone Screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `tablet_${scenario.lang}_step2_student1_translated.png`) });

  // ----------------------------------------------------
  // STEP 3: Student 2 questions in Mother Tongue
  // "Ma'am, plants ko hawa bhi chahiye na?"
  // ----------------------------------------------------
  console.log(`[Step 3] Student 2 asking in ${scenario.name}: "${scenario.step3_student2_in}"`);
  await page.focus('#voice-text-input');
  await page.evaluate(() => {
    const el = document.getElementById('voice-text-input');
    if (el) el.value = '';
  });

  for (const ch of scenario.step3_student2_in) {
    await page.keyboard.sendCharacter(ch);
    if (frameIdx % 3 === 0) await captureFrame(1);
  }
  await captureFrame(2);

  await page.click('#voice-text-submit-btn');
  await new Promise(r => setTimeout(r, 600));
  await captureFrame(8); // hold translation display for 1.6s

  // Save Step 3 Milestone Screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `tablet_${scenario.lang}_step3_student2_translated.png`) });

  // ----------------------------------------------------
  // STEP 4: Teacher confirms in Hindi: "Haan, bilkul!"
  // ----------------------------------------------------
  console.log(`[Step 4] Switching back to Teacher Mode...`);
  await page.click('#teacher-mode-btn');
  await new Promise(r => setTimeout(r, 300));
  await captureFrame(3);

  console.log(`[Step 4] Teacher replying in Hindi: "${scenario.step4_teacher_reply}"`);
  await page.focus('#voice-text-input');
  await page.evaluate(() => {
    const el = document.getElementById('voice-text-input');
    if (el) el.value = '';
  });

  for (const ch of scenario.step4_teacher_reply) {
    await page.keyboard.sendCharacter(ch);
    if (frameIdx % 3 === 0) await captureFrame(1);
  }
  await captureFrame(2);

  await page.click('#voice-text-submit-btn');
  await new Promise(r => setTimeout(r, 600));
  await captureFrame(10); // hold final state for 2s

  // Save Final Interaction Log Milestone Screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `tablet_${scenario.lang}_final_dialogue_log.png`) });

  await browser.close();
  console.log(`📸 Captured ${frameIdx} frames for ${scenario.name}`);

  // Convert frames to MP4 and GIF using ffmpeg
  const mp4Output = path.join(ARTIFACT_DIR, `sarjom_two_way_${scenario.lang}_tablet.mp4`);
  const gifOutput = path.join(ARTIFACT_DIR, `sarjom_two_way_${scenario.lang}_tablet.gif`);
  const pubMp4 = path.join(__dirname, `../public/sarjom_two_way_${scenario.lang}_tablet.mp4`);
  const pubGif = path.join(__dirname, `../public/sarjom_two_way_${scenario.lang}_tablet.gif`);

  console.log(`🎞️ Compiling MP4 video for ${scenario.name}...`);
  try {
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -framerate 5 -i "${framesDir}/frame_%05d.jpg" -c:v libx264 -pix_fmt yuv420p -vf "scale=800:-2" "${mp4Output}"`,
      { stdio: 'inherit' }
    );
    fs.copyFileSync(mp4Output, pubMp4);
    console.log(`✅ Created MP4: ${mp4Output}`);

    console.log(`🎞️ Compiling GIF animation for ${scenario.name}...`);
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -framerate 5 -i "${framesDir}/frame_%05d.jpg" -vf "fps=5,scale=560:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifOutput}"`,
      { stdio: 'inherit' }
    );
    fs.copyFileSync(gifOutput, pubGif);
    console.log(`✅ Created GIF: ${gifOutput}`);
  } catch (err) {
    console.error(`❌ FFmpeg error for ${scenario.name}:`, err);
  }

  // Clean up temporary frames
  try {
    fs.rmSync(framesDir, { recursive: true, force: true });
  } catch (e) {}
}

async function runAll() {
  console.log('🚀 Starting 2-Way Classroom Tablet Demo Recording for All 3 Languages...');
  for (const s of SCENARIOS) {
    await recordScenario(s);
  }
  console.log('\n🎉 ALL 3 TABLET DEMO RECORDINGS GENERATED SUCCESSFULLY!');
}

runAll().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
