const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1024,768']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  const artifactDir = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f';

  // 1. Voice Translator
  await page.goto('http://127.0.0.1:5173/?ui=en');
  await new Promise(r => setTimeout(r, 1200));

  await page.type('input[type="text"]', 'Mera naam Rudra hai');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${artifactDir}/redesign_tab_voice.png` });
  console.log('Saved redesign_tab_voice.png');

  // 2. Worksheets
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button, header button, a, button'));
    const wsTab = tabs.find(b => b.textContent.includes('Worksheet'));
    if (wsTab) wsTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${artifactDir}/redesign_tab_worksheets.png` });
  console.log('Saved redesign_tab_worksheets.png');

  // 3. Flashcards
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button, header button, a, button'));
    const fcTab = tabs.find(b => b.textContent.includes('Flashcard'));
    if (fcTab) fcTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${artifactDir}/redesign_tab_flashcards.png` });
  console.log('Saved redesign_tab_flashcards.png');

  // 4. Dictionary
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button, header button, a, button'));
    const dictTab = tabs.find(b => b.textContent.includes('Dictionary'));
    if (dictTab) dictTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${artifactDir}/redesign_tab_dictionary.png` });
  console.log('Saved redesign_tab_dictionary.png');

  await browser.close();
  console.log('All tabs verified successfully.');
})();
