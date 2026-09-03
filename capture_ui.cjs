const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:5173/';
const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/60d77a60-605e-4115-9231-5d1461bdb8c6';

async function capture() {
  console.log('Launching local Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Android tablet resolution (1280x800, typical Lenovo M8/M10 or Samsung Tab)
  await page.setViewport({ width: 1200, height: 860, deviceScaleFactor: 2 });

  console.log('Navigating to', URL);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Voice Translator
  console.log('Capturing Voice Translator...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_voice_translator.png') });

  // 2. Click on NIPUN FLN Tab
  console.log('Capturing NIPUN Curriculum...');
  const buttons = await page.$$('.tab-navigation button');
  if (buttons.length >= 2) {
    await buttons[1].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_nipun_curriculum.png') });
  }

  // 3. Click on Worksheets Tab
  console.log('Capturing Worksheets Studio...');
  if (buttons.length >= 3) {
    await buttons[2].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_worksheet_studio.png') });
  }

  // 4. Click on Flashcards Tab
  console.log('Capturing Flashcards Deck...');
  if (buttons.length >= 4) {
    await buttons[3].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_flashcards_deck.png') });
  }

  // 5. Open Teacher Drawer
  console.log('Capturing Teacher Drawer...');
  const drawerBtn = await page.$('button.btn-ochre');
  if (drawerBtn) {
    await drawerBtn.click();
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_teacher_drawer.png') });
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
