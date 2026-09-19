const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('Testing Chrome speech recognition with fake audio file input...');
  const fakeAudioPath = path.resolve('scratch/audiobook_fake_mic.wav');
  console.log('Using audio file:', fakeAudioPath);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${fakeAudioPath}`,
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  
  // Set up console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Run a test inside the page that creates SpeechRecognition and starts it
  const result = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Speech) {
        return resolve({ error: 'No SpeechRecognition in window' });
      }

      const rec = new Speech();
      rec.lang = 'hi-IN';
      rec.continuous = true;
      rec.interimResults = true;

      const collected = [];
      let resolved = false;

      rec.onresult = (e) => {
        for (let i = 0; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          const isFinal = e.results[i].isFinal;
          console.log(`RECOG RESULT [final=${isFinal}]:`, t);
          collected.push({ text: t, isFinal });
        }
      };

      rec.onerror = (e) => {
        console.log('RECOG ERROR:', e.error);
        if (!resolved) {
          resolved = true;
          resolve({ status: 'error', error: e.error, collected });
        }
      };

      rec.onend = () => {
        console.log('RECOG END');
        if (!resolved) {
          resolved = true;
          resolve({ status: 'ended', collected });
        }
      };

      try {
        rec.start();
        console.log('RECOG STARTED listening to fake audio device...');
      } catch (err) {
        resolve({ error: err.message });
      }

      // Wait 15 seconds to let the audio play into the mic
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { rec.stop(); } catch(e) {}
          resolve({ status: 'timeout_15s', collected });
        }
      }, 15000);
    });
  });

  console.log('\n--- Test Result from Fake Mic ---');
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
