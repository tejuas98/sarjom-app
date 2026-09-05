const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://127.0.0.1:5173/?ui=en');

  await new Promise(r => setTimeout(r, 1000));

  // Type a sentence in the input bar and submit
  await page.type('input[type="text"]', 'Mera naam Rudra hai');
  const submitBtn = await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  console.log('Submitted translation:', submitBtn);
  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot
  const screenshotPath = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f/desktop_redesign_with_translation.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
})();
