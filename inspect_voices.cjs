const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173');

  const voices = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        resolve(v.map(item => ({ name: item.name, lang: item.lang, default: item.default, localService: item.localService })));
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          v = window.speechSynthesis.getVoices();
          resolve(v.map(item => ({ name: item.name, lang: item.lang, default: item.default, localService: item.localService })));
        };
        setTimeout(() => {
          v = window.speechSynthesis.getVoices();
          resolve(v.map(item => ({ name: item.name, lang: item.lang, default: item.default, localService: item.localService })));
        }, 1500);
      }
    });
  });

  console.log('Total voices found in Chrome:', voices.length);
  const hindiOrIndianVoices = voices.filter(v => 
    v.lang.includes('hi') || 
    v.lang.includes('IN') || 
    v.name.toLowerCase().includes('india') ||
    v.name.toLowerCase().includes('hindi') ||
    v.name.toLowerCase().includes('lekha') ||
    v.name.toLowerCase().includes('rishi')
  );
  console.log('Indian / Hindi Voices:', JSON.stringify(hindiOrIndianVoices, null, 2));

  await browser.close();
})();
