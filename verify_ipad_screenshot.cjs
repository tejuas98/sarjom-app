const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1024,768']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://127.0.0.1:5173/?ui=en&lang=santhali');

  await new Promise(r => setTimeout(r, 1000));

  // Type a sentence
  await page.type('input[type="text"]', 'Mera naam Rudra hai');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1200));

  const screenshotPath = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f/ipad_pro_human_crafted_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved iPad verified screenshot to:', screenshotPath);

  await browser.close();
})();
