const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f';

async function capture() {
  console.log('Launching headless Chrome to capture clean PS UI...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 860, deviceScaleFactor: 2 });

  // 1. English Mode - Voice Translator (Brand: SARJOM)
  console.log('1. Capturing English UI mode...');
  await page.goto('http://localhost:5173/?ui=en&theme=dark&device=ios', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_ps_english_mode.png') });

  // 2. Hindi Mode - Voice Translator (Brand: सरजोम (SARJOM))
  console.log('2. Capturing Hindi UI mode...');
  await page.goto('http://localhost:5173/?ui=hi&theme=dark&device=ios', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_ps_hindi_mode.png') });

  // 3. Student Speak Mode in English
  console.log('3. Capturing Student Speak Mode in English...');
  await page.goto('http://localhost:5173/?ui=en&theme=dark&device=ios', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  // Click Student Speaks button
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text.includes('Student Speaks')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_ps_student_mode.png') });

  // 4. Worksheets Tab in English
  console.log('4. Capturing Worksheets Tab in English...');
  await page.goto('http://localhost:5173/?ui=en&tab=worksheets&theme=dark&device=ios', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_ps_worksheets_english.png') });

  // 5. Dictionary Tab in English
  console.log('5. Capturing Dictionary Tab in English...');
  await page.goto('http://localhost:5173/?ui=en&tab=dictionary&theme=dark&device=ios', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_ps_dictionary_english.png') });

  await browser.close();
  console.log('All clean PS UI screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
