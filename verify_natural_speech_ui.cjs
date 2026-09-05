const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://127.0.0.1:5173');

  await new Promise(r => setTimeout(r, 1000));

  // Find and click the HD Voice button
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hdBtn = buttons.find(b => b.textContent.includes('HD Voice') || b.textContent.includes('प्राकृतिक आवाज़'));
    if (hdBtn) {
      hdBtn.click();
      return true;
    }
    return false;
  });

  console.log('HD Voice button clicked:', clicked);
  await new Promise(r => setTimeout(r, 800));

  // Take screenshot of the Voice Tuning modal
  const screenshotPath = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f/hd_voice_tuning_modal.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  // Click the test voice demo button inside the modal
  const testedDemo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find(b => b.textContent.includes('Play Demo') || b.textContent.includes('Test Voice'));
    if (demoBtn) {
      demoBtn.click();
      return true;
    }
    return false;
  });
  console.log('Test Voice button clicked:', testedDemo);
  await new Promise(r => setTimeout(r, 1200));

  await browser.close();
})();
