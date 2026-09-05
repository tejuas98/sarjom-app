const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173');

  const result = await page.evaluate(async () => {
    // Import or access voiceService
    const mod = await import('/src/services/voiceTranslationService.js');
    const vs = mod.voiceService;

    // Ensure voices loaded
    await new Promise(r => setTimeout(r, 600));

    const hiVoice = vs.getBestNaturalVoice('hi-IN');
    const enVoice = vs.getBestNaturalVoice('en-IN');
    
    const hoClip = vs.getStudioAudioClip('अयिङ-आ नुतुम रुद्र तना');
    const munClip = vs.getStudioAudioClip('आइङ-आह नुतुम रुद्र तना');
    const sanClip = vs.getStudioAudioClip('ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱨᱩᱫᱽᱨᱚ ᱠᱟᱱᱟ');
    const sadClip = vs.getStudioAudioClip('मोर नाम रुद्र हेके');
    const joharClip = vs.getStudioAudioClip('जोहार');
    const novelClip = vs.getStudioAudioClip('आज हम सब मिलकर गणित का नया अध्याय पढ़ेंगे');

    return {
      hindiVoice: hiVoice ? { name: hiVoice.name, lang: hiVoice.lang } : null,
      englishVoice: enVoice ? { name: enVoice.name, lang: enVoice.lang } : null,
      speechRate: vs.speechRate,
      speechPitch: vs.speechPitch,
      audioClips: {
        ho: hoClip,
        mundari: munClip,
        santhali: sanClip,
        sadri: sadClip,
        johar: joharClip,
        novelTextFallbackToTTS: novelClip
      }
    };
  });

  console.log('Voice Service Natural Audio Test Results:');
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
