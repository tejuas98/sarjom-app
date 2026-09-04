const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1380,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 1024, deviceScaleFactor: 2 });

  // Load the page with the main project title in Santhali
  const targetText = 'झारखंड की जनजातीय भाषाओं के लिए अनुवादक समाधान: डिजिटल समावेशन की ओर एक क्रांतिकारी कदम';
  await page.goto(`http://localhost:5173/?device=ios&lang=santhali&theme=dark&q=${encodeURIComponent(targetText)}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // Click on the SIH Benchmark toggle button to show the 16 cases
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const benchBtn = buttons.find(b => b.textContent.includes('SIH मूल्यांकन'));
    if (benchBtn) benchBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ipad_sih_showcase_ground_truth.png') });
  console.log('✅ Captured ipad_sih_showcase_ground_truth.png');

  await browser.close();
})();
