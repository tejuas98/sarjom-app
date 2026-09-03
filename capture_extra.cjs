const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:5173/';
const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/60d77a60-605e-4115-9231-5d1461bdb8c6';

async function captureExtra() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 860, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const buttons = await page.$$('.tab-navigation button');
  console.log('Found tab buttons:', buttons.length);

  // Tab 5: Slate & Folklore
  if (buttons.length >= 5) {
    console.log('Capturing Slate...');
    await buttons[4].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_digital_slate.png') });

    // Switch to Folklore sub-tab
    const subBtns = await page.$$('button');
    for (const b of subBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('झारखंडी लोककथाएँ')) {
        console.log('Clicking folklore sub-tab...');
        await b.click();
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_tribal_folklore.png') });
        break;
      }
    }
  }

  // Tab 6: Dictionary Search
  if (buttons.length >= 6) {
    console.log('Capturing Dictionary...');
    await buttons[5].click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_dictionary_search.png') });
  }

  await browser.close();
  console.log('Extra screenshots captured!');
}

captureExtra().catch(console.error);
