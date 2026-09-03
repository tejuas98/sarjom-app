const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = path.resolve('./tmp_video_frames');
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

let frameIndex = 0;

async function capture(page, label, holdFrames = 4) {
  // Update HUD
  await page.evaluate((text) => {
    let hud = document.getElementById('palash-record-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'palash-record-hud';
      hud.style.position = 'fixed';
      hud.style.bottom = '16px';
      hud.style.left = '50%';
      hud.style.transform = 'translateX(-50%)';
      hud.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
      hud.style.color = '#FFFFFF';
      hud.style.padding = '10px 24px';
      hud.style.borderRadius = '30px';
      hud.style.fontSize = '14px';
      hud.style.fontWeight = '700';
      hud.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5), 0 0 0 2px #10B981';
      hud.style.zIndex = '999999';
      hud.style.display = 'flex';
      hud.style.alignItems = 'center';
      hud.style.gap = '10px';
      hud.style.fontFamily = 'Inter, sans-serif';
      hud.style.pointerEvents = 'none';
      hud.style.transition = 'all 0.2s ease';
      document.body.appendChild(hud);
    }
    hud.innerHTML = `<span style="color:#10B981;">⚡ ACTION:</span> ${text}`;
  }, label);

  for (let i = 0; i < holdFrames; i++) {
    frameIndex++;
    const framePath = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath });
  }
}

async function showClickRipple(page, x, y) {
  await page.evaluate(({ cx, cy }) => {
    let ripple = document.getElementById('palash-click-ripple');
    if (!ripple) {
      ripple = document.createElement('div');
      ripple.id = 'palash-click-ripple';
      ripple.style.position = 'fixed';
      ripple.style.width = '30px';
      ripple.style.height = '30px';
      ripple.style.borderRadius = '50%';
      ripple.style.border = '3px solid #EF4444';
      ripple.style.backgroundColor = 'rgba(239, 68, 68, 0.4)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '9999999';
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      ripple.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      document.body.appendChild(ripple);
    }
    ripple.style.left = `${cx}px`;
    ripple.style.top = `${cy}px`;
    ripple.style.opacity = '1';
    ripple.style.transform = 'translate(-50%, -50%) scale(1.6)';
    setTimeout(() => {
      ripple.style.opacity = '0';
      ripple.style.transform = 'translate(-50%, -50%) scale(0.5)';
    }, 250);
  }, { cx: x, cy: y });
}

async function clickElementByText(page, text, actionLabel) {
  const clicked = await page.evaluate((targetText) => {
    const elements = Array.from(document.querySelectorAll('button, a, select, [role="button"], .btn-brutal, span'));
    for (const el of elements) {
      if (el.innerText && el.innerText.includes(targetText) && el.offsetParent !== null) {
        const rect = el.getBoundingClientRect();
        el.click();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }
    return null;
  }, text);

  if (clicked) {
    await showClickRipple(page, clicked.x, clicked.y);
  }
  await capture(page, actionLabel, 4);
}

(async () => {
  console.log('Starting automated interaction recorder in system Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,860'],
    defaultViewport: { width: 1280, height: 860 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/?offline=true&lang=santhali&tab=voice', { waitUntil: 'networkidle0' });
  await page.waitForTimeout ? page.waitForTimeout(1000) : new Promise(r => setTimeout(r, 1000));

  console.log('Recording sequence 1: Initial Classroom View...');
  await capture(page, 'SARJOM Gyanodaya 10.1" Tablet Initialized (Offline Ready)', 5);

  console.log('Recording sequence 2: Online / Offline Toggle...');
  await clickElementByText(page, 'ऑफलाइन मोड', 'Clicking Offline Toggle -> Switching to Online Connected Mode');
  await clickElementByText(page, 'ऑनलाइन', 'Clicking Online Toggle -> Switching back to 100% Offline Edge Mode');

  console.log('Recording sequence 3: Language Switching (Ho, Mundari, Santhali)...');
  await clickElementByText(page, 'Ho (', 'Switching Target Language to Ho (𑢹𑣉𑣉) -> Warang Chiti Script');
  await clickElementByText(page, 'Mundari (', 'Switching Target Language to Mundari (मुण्डारी) -> Khunti School');
  await clickElementByText(page, 'Santhali (', 'Switching Target Language to Santhali (ᱥᱟᱱᱛᱟᱲᱤ) -> Ol Chiki Script');

  console.log('Recording sequence 4: Quick Prompt Translation Chips...');
  await clickElementByText(page, 'जोहार (Greeting)', 'Clicking Prompt: "जोहार" -> Generating Sub-50ms Translation');
  await clickElementByText(page, 'किताब खोलें (Open Book)', 'Clicking Prompt: "किताब खोलें" -> Ol Chiki & Devanagari Output');
  await clickElementByText(page, 'स्लेट पर लिखो (Write)', 'Clicking Prompt: "स्लेट पर लिखो" -> Script & Audio Guidance');
  await clickElementByText(page, 'कक्षा में सुनाएं (Play Audio)', 'Clicking Audio Playback -> High-Clarity Speech Synthesis');

  console.log('Recording sequence 5: Two-Way Student Ear...');
  await clickElementByText(page, 'छात्र ➔ शिक्षक', 'Switching to "Two-Way Student Ear" -> Reverse Tribal-to-Hindi Listening');
  await clickElementByText(page, 'शिक्षक ➔ छात्र', 'Switching back to Teacher Instruction Mode');

  console.log('Recording sequence 6: NIPUN FLN Curriculum Studio...');
  await clickElementByText(page, 'निपुण पाठ', 'Opening NIPUN FLN Curriculum Studio');
  await clickElementByText(page, 'पाठ 2: संख्या ज्ञान', 'Switching Lesson -> Lesson 2: Counting 1 to 5 (80:20 Transition)');
  await clickElementByText(page, 'पाठ 3: प्रकृति', 'Switching Lesson -> Lesson 3: Nature & Forest Literacy');

  console.log('Recording sequence 7: Printable Bilingual Worksheets...');
  await clickElementByText(page, 'अभ्यास पत्र', 'Opening Bilingual Worksheet Studio');
  await clickElementByText(page, 'शब्द मिलान', 'Switching Worksheet -> Vocabulary Matching with Audio QR');

  console.log('Recording sequence 8: Visual Flashcards Studio...');
  await clickElementByText(page, 'फ्लैशकार्ड', 'Opening Visual Flashcard Deck Studio');
  await clickElementByText(page, 'टैप कर पलटें', 'Tapping Flashcard -> 3D Flip Revealing Ol Chiki & Devanagari');
  await clickElementByText(page, 'प्रकृति (Nature)', 'Switching Flashcard Category -> "प्रकृति (Nature)"');

  console.log('Recording sequence 9: Multi-Touch Digital Slate & Folklore...');
  await clickElementByText(page, 'स्लेट व लोककथा', 'Opening Multi-Touch Digital Slate Blackboard');
  // Draw stroke on slate canvas
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(150, 150, 60, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  await capture(page, 'Simulating Multi-Touch Chalk Stroke Handwriting on Slate', 5);
  await clickElementByText(page, 'स्लेट पोंछें', 'Clicking "स्लेट पोंछें" -> Blackboard Erased with Dust Effect');
  await clickElementByText(page, 'झारखण्डी लोककथाएँ', 'Switching to Culturally Rooted Tribal Folklore Tales');

  console.log('Recording sequence 10: Tri-Lingual Lexicon Search...');
  await clickElementByText(page, 'शब्दकोश', 'Opening Tri-Lingual Lexicon Search (1,240+ FLN Words)');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="text"]');
    if (input) {
      input.value = 'पानी';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await capture(page, 'Typing Query "पानी" -> Instant Fuzzy Filtering across Ho, Mundari, Santhali', 5);

  console.log('Recording sequence 11: 60-Second Onboarding Wizard...');
  await clickElementByText(page, 'ऑनबोर्डिंग', 'Clicking "ऑनबोर्डिंग" -> 60-Second Teacher Setup Modal Opens');
  await clickElementByText(page, 'आगे बढ़ें', 'Stepping through Wizard -> Audio Speaker & Mic Noise Calibration');
  await clickElementByText(page, '✕', 'Closing Wizard Modal');

  console.log('Recording sequence 12: Vaul Teacher Pedagogical Drawer...');
  await clickElementByText(page, 'शिक्षक निर्देश', 'Clicking "शिक्षक निर्देश" -> Vaul Pedagogical Drawer Slides Up');
  await capture(page, 'Vaul Drawer Active -> Phonetics Table & Cultural Etiquette Guide', 6);

  console.log('Closing browser...');
  await browser.close();

  console.log(`Total captured frames: ${frameIndex}`);
  console.log('Compiling frames with ffmpeg into MP4 video and animated GIF...');

  const mp4Out = path.resolve('./public/sarjom_live_click_demo.mp4');
  const gifOut = path.resolve('./public/sarjom_live_click_demo.gif');
  const legacyMp4 = path.resolve('./public/palash_setu_live_click_demo.mp4');
  const legacyGif = path.resolve('./public/palash_setu_live_click_demo.gif');
  const brainDir = '/Users/toru/.gemini/antigravity-ide/brain/60d77a60-605e-4115-9231-5d1461bdb8c6';

  // 1. Generate MP4 video (3 fps, smooth transitions, h264)
  const ffmpegMp4Cmd = `/opt/homebrew/bin/ffmpeg -y -framerate 3 -i ${FRAMES_DIR}/frame_%05d.png -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${mp4Out}`;
  execSync(ffmpegMp4Cmd);
  console.log(`MP4 video generated successfully: ${mp4Out}`);

  // 2. Generate animated GIF
  const ffmpegGifCmd = `/opt/homebrew/bin/ffmpeg -y -framerate 2.5 -i ${FRAMES_DIR}/frame_%05d.png -vf "scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ${gifOut}`;
  execSync(ffmpegGifCmd);
  console.log(`GIF animation generated successfully: ${gifOut}`);

  // Also sync to legacy paths and brain artifacts
  fs.copyFileSync(mp4Out, legacyMp4);
  fs.copyFileSync(gifOut, legacyGif);
  fs.copyFileSync(mp4Out, path.join(brainDir, 'sarjom_live_click_demo.mp4'));
  fs.copyFileSync(gifOut, path.join(brainDir, 'sarjom_live_click_demo.gif'));
  fs.copyFileSync(mp4Out, path.join(brainDir, 'palash_setu_live_click_demo.mp4'));
  fs.copyFileSync(gifOut, path.join(brainDir, 'palash_setu_live_click_demo.gif'));

  console.log('All video and GIF artifacts generated and copied to public and brain directories!');
})();
