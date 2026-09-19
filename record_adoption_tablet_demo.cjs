const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = path.resolve('./tmp_adoption_tablet_frames');
if (fs.existsSync(FRAMES_DIR)) {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';
let frameIndex = 0;

async function capture(page, label, holdFrames = 5) {
  await page.evaluate((text) => {
    let hud = document.getElementById('sarjom-demo-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'sarjom-demo-hud';
      hud.style.position = 'fixed';
      hud.style.bottom = '18px';
      hud.style.left = '50%';
      hud.style.transform = 'translateX(-50%)';
      hud.style.backgroundColor = 'rgba(15, 23, 42, 0.94)';
      hud.style.color = '#FFFFFF';
      hud.style.padding = '8px 24px';
      hud.style.borderRadius = '30px';
      hud.style.fontSize = '13px';
      hud.style.fontWeight = '700';
      hud.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6), 0 0 0 2px #D9531E';
      hud.style.zIndex = '999999';
      hud.style.display = 'flex';
      hud.style.alignItems = 'center';
      hud.style.gap = '8px';
      hud.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      hud.style.pointerEvents = 'none';
      hud.style.letterSpacing = '0.01em';
      document.body.appendChild(hud);
    }
    hud.innerHTML = `<span style="color:#FDBA74; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">लाइव टैबलेट परीक्षण:</span> <span>${text}</span>`;
  }, label);

  for (let i = 0; i < holdFrames; i++) {
    frameIndex++;
    const framePath = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath });
  }
}

async function showClickRipple(page, selectorOrBox) {
  let box = selectorOrBox;
  if (typeof selectorOrBox === 'string') {
    const el = await page.$(selectorOrBox);
    if (el) box = await el.boundingBox();
  }
  if (!box) return;

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.evaluate(({ x, y }) => {
    let ripple = document.getElementById('sarjom-click-ripple');
    if (!ripple) {
      ripple = document.createElement('div');
      ripple.id = 'sarjom-click-ripple';
      ripple.style.position = 'fixed';
      ripple.style.width = '42px';
      ripple.style.height = '42px';
      ripple.style.borderRadius = '50%';
      ripple.style.border = '3px solid #D9531E';
      ripple.style.backgroundColor = 'rgba(217, 83, 30, 0.45)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '9999999';
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      ripple.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      document.body.appendChild(ripple);
    }
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.opacity = '1';
    ripple.style.transform = 'translate(-50%, -50%) scale(1.6)';
    setTimeout(() => {
      ripple.style.opacity = '0';
      ripple.style.transform = 'translate(-50%, -50%) scale(0.4)';
    }, 280);
  }, { x: cx, y: cy });
}

async function run() {
  console.log('🚀 Starting Chrome in Horizontal Landscape Tablet mode (1200x800)...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1220,840'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1.25 });

  const baseUrl = 'http://localhost:4173';
  console.log(`🌐 Navigating to ${baseUrl}/?tab=voice&lang=santhali&ui=hi`);
  await page.goto(`${baseUrl}/?tab=voice&lang=santhali&ui=hi`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // Frame 1: Initial Landscape Tablet Overview
  console.log('📸 [1/6] Capturing horizontal tablet Voice Console...');
  await capture(page, 'सरजोम (SARJOM) • हॉरिजॉन्टल टैबलेट दृश्य • भाषा: संथाली (Ol Chiki)', 8);

  // Frame 2: Trigger Adoption Audiobook Playback
  console.log('▶ [2/6] User clicks "कहानी ऑडियो सुनें" (Play Adoption Story Audio)...');
  const playAudioBtn = await page.$('#play-adoption-audio-btn');
  if (playAudioBtn) {
    await showClickRipple(page, playAudioBtn);
    await playAudioBtn.click();
  }
  await capture(page, '🎧 ऑडिओबुक चालू: "गोद लेने की एक सच्ची कहानी" (चक्रधर दीक्षित वाचन)', 10);

  // Frame 3: Translate Adoption Sentence 1 (Santhali Ol Chiki)
  console.log('▶ [3/6] User clicks adoption prompt "👶 कहानी सुनाओ"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pill = buttons.find((b) => b.textContent && b.textContent.includes('कहानी सुनाओ'));
    if (pill) pill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await capture(page, 'संथाली ओल चिकी अनुवाद: ᱟᱯᱱᱟᱨ ᱨᱮᱱᱟᱜ ᱢᱤᱫ ᱥᱟᱹᱨᱤ ᱠᱟᱹᱦᱱᱤ ᱞᱟᱹᱭ ᱯᱮ (0 Hinglish)', 12);

  // Frame 4: Switch to Ho Dialect
  console.log('▶ [4/6] Switching language to "हो" (Ho / Devanagari & Warang Chiti)...');
  await page.evaluate(() => {
    const hoPill = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('हो') && !b.textContent.includes('खोलो'));
    if (hoPill) hoPill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pill = buttons.find((b) => b.textContent && b.textContent.includes('कहानी सुनाओ'));
    if (pill) pill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await capture(page, 'हो अनुवाद: पोसोः रेआः मिद सारी काहनी काजी पे (वारंग क्षिति लिपि)', 12);

  // Frame 5: Translate Complex Sentence (Real Woman, Man & Comfortable Home)
  console.log('▶ [5/6] User clicks "🏡 असली औरत व घर"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pill = buttons.find((b) => b.textContent && b.textContent.includes('असली औरत व घर'));
    if (pill) pill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await capture(page, 'हो अनुवाद: मिद सारी एरा आर मिद सारी होड़ो किलिङ ताइकेना आमा आर बाबा लेका', 12);

  // Frame 6: Switch to Mundari & Sadri
  console.log('▶ [6/6] Switching to Mundari & Sadri...');
  await page.evaluate(() => {
    const mundariPill = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('मुंडारी'));
    if (mundariPill) mundariPill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pill = buttons.find((b) => b.textContent && b.textContent.includes('असली औरत व घर'));
    if (pill) pill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await capture(page, 'मुंडारी अनुवाद: मियद सारी एरा आर मियद सारी होड़ो किलिङ ताइकेना आमाः आर अप्पा लेका', 10);

  // Final Sadri capture
  await page.evaluate(() => {
    const sadriPill = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('सादरी'));
    if (sadriPill) sadriPill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pill = buttons.find((b) => b.textContent && b.textContent.includes('असली औरत व घर'));
    if (pill) pill.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await capture(page, 'सादरी अनुवाद: एक असली मेहरारू आउर एक असली आदमी रहैँ तोहर आउर बाप लखे (100% सटीक)', 12);

  await browser.close();
  console.log(`✅ Captured ${frameIndex} frames. Compiling MP4 and GIF demos with ffmpeg...`);

  const outputMp4 = path.join(ARTIFACT_DIR, 'sarjom_adoption_tablet_demo.mp4');
  const publicMp4 = path.resolve('./public/sarjom_adoption_tablet_demo.mp4');
  const outputGif = path.join(ARTIFACT_DIR, 'sarjom_adoption_tablet_demo.gif');
  const publicGif = path.resolve('./public/sarjom_adoption_tablet_demo.gif');

  // Assemble high-quality video with narration audio track
  const audioInput = path.resolve('./public/audio/adoption_audiobook_preview.mp3');
  try {
    execSync(
      `ffmpeg -y -framerate 6 -i "${FRAMES_DIR}/frame_%05d.png" -i "${audioInput}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest "${outputMp4}"`,
      { stdio: 'inherit' }
    );
    fs.copyFileSync(outputMp4, publicMp4);
    console.log(`🎬 Video saved: ${outputMp4} & ${publicMp4}`);
  } catch (e) {
    console.error('Video encoding error', e);
  }

  // Assemble interactive animated GIF
  try {
    execSync(
      `ffmpeg -y -framerate 6 -i "${FRAMES_DIR}/frame_%05d.png" -vf "scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${outputGif}"`,
      { stdio: 'inherit' }
    );
    fs.copyFileSync(outputGif, publicGif);
    console.log(`🎞️ GIF saved: ${outputGif} & ${publicGif}`);
  } catch (e) {
    console.error('GIF encoding error', e);
  }

  // Cleanup tmp frames
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('🎉 Horizontal Tablet Demo Recording Complete!');
}

run().catch(console.error);
