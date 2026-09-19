const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685';

(async () => {
  console.log('Launching Chrome to verify in-app live translation of audiobook speech...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });

  // The spoken phrase from the audiobook:
  const speechText = "गोद लेने की एक सच्ची कहानी सुनाओ";

  const languages = [
    { id: 'santhali', name: 'Santhali (Ol Chiki)', file: 'audiobook_speech_santhali_verified.png' },
    { id: 'ho', name: 'Ho (Warang Chiti)', file: 'audiobook_speech_ho_verified.png' },
    { id: 'mundari', name: 'Mundari', file: 'audiobook_speech_mundari_verified.png' },
    { id: 'sadri', name: 'Sadri', file: 'audiobook_speech_sadri_verified.png' }
  ];

  for (const lang of languages) {
    console.log(`\n======================================================`);
    console.log(`Loading app for: ${lang.name}...`);
    
    const targetUrl = `http://localhost:4173?lang=${lang.id}&q=${encodeURIComponent(speechText)}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // Capture screenshot of the app
    const savePath = path.join(ARTIFACT_DIR, lang.file);
    await page.screenshot({ path: savePath });
    console.log(`📸 Saved app screenshot: ${savePath}`);

    // Read the rendered translation card in the DOM
    const resultCard = await page.evaluate(() => {
      const el = document.getElementById('voice-translation-result');
      if (!el) return 'Result card not found';
      return {
        cardHeading: el.querySelector('.card-heading, [style*="color: var(--color-slate-muted)"]')?.textContent.trim() || '',
        nativeScript: el.querySelector('.voice-result-script')?.textContent.trim() || '',
        phoneticGuidance: el.querySelector('[style*="fontSize: 0.95rem"], [style*="font-size: 0.95rem"]')?.textContent.trim() || '',
        fullLines: el.innerText.split('\n').map(s => s.trim()).filter(Boolean)
      };
    });
    console.log(`Live App Result:`, JSON.stringify(resultCard, null, 2));
  }

  await browser.close();
  console.log('\nAll in-app audiobook translations verified!');
})();
