const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('http://127.0.0.1:5173/?tab=voice&mode=student&q=%E0%A4%85%E0%A4%AF%E0%A4%BF%E0%A4%99-%E0%A4%86+%E0%A4%A8%E0%A4%81%E0%A4%A4%E0%A4%AE+%E0%A4%B0%E0%A4%A6%E0%A5%8D%E0%A4%B0+%E0%A4%A4%E0%A4%A8%E0%A4%BE');

  await new Promise(r => setTimeout(r, 1200));

  const screenshotPath = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f/student_mode_dual_audio_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Student Mode Dual Audio Screenshot saved to:', screenshotPath);

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean);
  });
  console.log('Detected buttons on page:', buttons.filter(b => b.includes('अनुवाद') || b.includes('उच्चारण') || b.includes('Speaker')));

  await browser.close();
})();
