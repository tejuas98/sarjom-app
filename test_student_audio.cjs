const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Open student mode directly with parameter ?tab=voice&mode=student
  await page.goto('http://127.0.0.1:5173/?tab=voice&mode=student');

  await new Promise(r => setTimeout(r, 800));

  const result = await page.evaluate(async () => {
    const mod = await import('/src/services/voiceTranslationService.js');
    const nlp = await import('/src/services/nlpTranslationEngine.js');
    const vs = mod.voiceService;

    // Student speaks Ho intro
    const hoStudentInput = 'अयिङ-आ नुतुम रुद्र तना';
    const hoResult = nlp.translateTribalToHindi(hoStudentInput, 'ho');

    // What audio text is broadcast for the teacher?
    const textToBroadcast = hoResult.hindiTranslation || hoResult.nativeScript;

    // What voice is selected for this broadcast?
    const bestVoice = vs.getBestNaturalVoice('hi-IN');

    // Student speaks Santhali intro
    const sanStudentInput = 'ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱨᱩᱫᱽᱨᱚ ᱠᱟᱱᱟ';
    const sanResult = nlp.translateTribalToHindi(sanStudentInput, 'santhali');

    // Student speaks Sadri intro
    const sadStudentInput = 'मोर नाम रुद्र हेके';
    const sadResult = nlp.translateTribalToHindi(sadStudentInput, 'sadri');

    return {
      ho: {
        studentInput: hoStudentInput,
        teacherOutputHindi: hoResult.hindiTranslation,
        audioTextToBroadcast: textToBroadcast,
        selectedVoice: bestVoice ? { name: bestVoice.name, lang: bestVoice.lang } : null,
        speechRate: vs.speechRate,
        speechPitch: vs.speechPitch
      },
      santhali: {
        studentInput: sanStudentInput,
        teacherOutputHindi: sanResult.hindiTranslation,
      },
      sadri: {
        studentInput: sadStudentInput,
        teacherOutputHindi: sadResult.hindiTranslation,
      }
    };
  });

  console.log('Student Mode Audio & Translation Test:');
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
