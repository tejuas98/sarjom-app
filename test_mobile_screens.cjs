const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  const artifactDir = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f';

  // 1. Voice
  await page.goto('http://127.0.0.1:5173/?tab=voice&ui=en&theme=light');
  await new Promise(r => setTimeout(r, 800));
  await page.type('input[type="text"]', 'Mera naam Rudra hai');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${artifactDir}/mobile_screen_voice_full.png`, fullPage: true });

  // 2. Worksheets
  await page.goto('http://127.0.0.1:5173/?tab=worksheets&ui=en&theme=light');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${artifactDir}/mobile_screen_worksheets_full.png`, fullPage: true });

  // 3. Flashcards
  await page.goto('http://127.0.0.1:5173/?tab=flashcards&ui=en&theme=light');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${artifactDir}/mobile_screen_flashcards_full.png`, fullPage: true });

  // 4. Dictionary
  await page.goto('http://127.0.0.1:5173/?tab=dictionary&ui=en&theme=light');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${artifactDir}/mobile_screen_dictionary_full.png`, fullPage: true });

  await browser.close();
  console.log('Mobile screenshots captured successfully.');
})();
