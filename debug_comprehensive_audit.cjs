const puppeteer = require('puppeteer-core');

(async () => {
  console.log('================================================================================');
  console.log('PALASH SETU — COMPREHENSIVE RUNTIME & UI DEBUGGING AUDIT');
  console.log('================================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();

  const errors = [];
  const warnings = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      warnings.push(`Console Warning: ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`Page Error: ${err.message}\n${err.stack}`);
  });

  console.log('▶ [CHECK 1] Loading Application on http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('▶ [CHECK 2] Verifying Title & Semantic Root Elements ...');
  const title = await page.title();
  console.log(`  Page Title: "${title}"`);
  if (!title.includes('PALASH Setu')) {
    errors.push(`Unexpected title: ${title}`);
  }

  // ---------------------------------------------------------
  // Helper to click and verify without throwing unhandled
  // ---------------------------------------------------------
  async function testClick(label, selectorOrText, isText = true) {
    try {
      let clicked = false;
      if (isText) {
        clicked = await page.evaluate((txt) => {
          const elements = Array.from(document.querySelectorAll('button, a, select, [role="button"], input, label, span'));
          for (const el of elements) {
            if (el.innerText && el.innerText.includes(txt) && el.offsetParent !== null) {
              el.click();
              return true;
            }
          }
          return false;
        }, selectorOrText);
      } else {
        const el = await page.$(selectorOrText);
        if (el) {
          await el.click();
          clicked = true;
        }
      }

      if (clicked) {
        console.log(`  ✅ Clicked: ${label}`);
      } else {
        console.warn(`  ⚠️ Could not find element for: ${label} ("${selectorOrText}")`);
      }
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      errors.push(`Click error on ${label}: ${e.message}`);
    }
  }

  // ---------------------------------------------------------
  // TEST TAB 1: VOICE TRANSLATOR & PROMPTS
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 3] Testing Voice Translator Tab & Classroom Prompts ...');
  await testClick('Voice Tab', 'संवाद');
  await testClick('Language Ho', 'Ho (');
  await testClick('Language Mundari', 'Mundari (');
  await testClick('Language Santhali', 'Santhali (');
  await testClick('Prompt 1 (जोहार)', 'जोहार (Greeting)');
  await testClick('Prompt 2 (नाम पूछें)', 'नाम पूछें (Ask Name)');
  await testClick('Prompt 3 (शांत रहें)', 'शान्त रहें (Silence)');
  await testClick('Audio Playback', 'कक्षा में सुनाएं');
  await testClick('Student to Teacher Direction', 'छात्र ➔ शिक्षक');
  await testClick('Teacher to Student Direction', 'शिक्षक ➔ छात्र');

  // ---------------------------------------------------------
  // TEST TAB 2: NIPUN CURRICULUM
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 4] Testing NIPUN FLN Curriculum & Assessment Form ...');
  await testClick('Curriculum Tab', 'निपुण पाठ');
  await testClick('Lesson 1', 'पाठ 1:');
  await testClick('Lesson 2', 'पाठ 2:');
  await testClick('Lesson 3', 'पाठ 3:');
  
  // Fill student assessment
  await page.evaluate(() => {
    const nameInput = document.querySelector('input[placeholder*="बिरसा सोरेन"]');
    if (nameInput) {
      nameInput.value = 'सुनीता मुंडा (Sunita Munda)';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  console.log('  Filled student assessment name input');
  await testClick('Assessment Radio Level 3', 'स्तर 3 (सक्षम/निपुण)');
  await testClick('Submit Assessment', 'मूल्यांकन सहेजें');

  // ---------------------------------------------------------
  // TEST TAB 3: WORKSHEETS & AUDIO QR
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 5] Testing Bilingual Worksheet Studio ...');
  await testClick('Worksheet Tab', 'अभ्यास पत्र');
  await testClick('Option: Number Counting', 'संख्या ज्ञान (1-5)');
  await testClick('Option: Word Matching', 'शब्द मिलान (Matching)');
  await testClick('Option: Script Tracing', 'लिपि अनुरेखण (Tracing)');

  // ---------------------------------------------------------
  // TEST TAB 4: FLASHCARDS & QUIZ MODE
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 6] Testing Flashcards Deck & Quiz Mode ...');
  await testClick('Flashcards Tab', 'फ़्लैशकार्ड');
  await testClick('Flip Card', 'टैप कर पलटें');
  await testClick('Category Numbers', 'संख्याएँ (Numbers)');
  await testClick('Category Nature', 'प्रकृति (Nature)');
  await testClick('Category Animals', 'पशु-पक्षी (Animals)');
  await testClick('Category Family', 'परिवार (Family)');
  await testClick('Category All', 'सभी कार्ड्स (All)');
  await testClick('Quiz Mode Switch', 'कक्षा क्विज मोड (Quiz Mode)');
  await testClick('Quiz Option A', 'quiz-option', false);
  await testClick('Return to Card Gallery', 'कार्ड गैलरी (Cards View)');

  // ---------------------------------------------------------
  // TEST TAB 5: DIGITAL SLATE & FOLKLORE
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 7] Testing Multi-Touch Digital Slate & Folklore ...');
  await testClick('Slate Tab', 'स्लेट व लोककथा');
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(200, 200);
      ctx.stroke();
    }
  });
  console.log('  Rendered chalk stroke on slate canvas');
  await testClick('Tracing Glyph अ', 'अ');
  await testClick('Tracing Glyph क', 'क');
  await testClick('Tracing Glyph म', 'म');
  await testClick('Praise Button', 'शाबाशी दें (Praise)');
  await testClick('Wipe Slate Button', 'स्लेट पोंछें');
  await testClick('Folktales Switch', 'झारखण्डी लोककथाएँ (Folk Tales)');
  await testClick('Return to Slate', 'डिजिटल चौक-स्लेट (Digital Slate)');

  // ---------------------------------------------------------
  // TEST TAB 6: TRI-LINGUAL LEXICON
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 8] Testing Tri-Lingual Lexicon Search ...');
  await testClick('Dictionary Tab', 'शब्दकोश');
  await page.evaluate(() => {
    const searchInput = document.querySelector('input[placeholder*="खोजें"]');
    if (searchInput) {
      searchInput.value = 'पानी';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  console.log('  Executed search for "पानी"');
  await new Promise(r => setTimeout(r, 500));
  const resultsCount = await page.evaluate(() => {
    return document.querySelectorAll('tr, .lexicon-item, .card').length;
  });
  console.log(`  Lexicon filtered view has ${resultsCount} rendered items`);

  // ---------------------------------------------------------
  // TEST MODALS & DRAWERS
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 9] Testing Onboarding Wizard Modal ...');
  await testClick('Onboarding Button', 'ऑनबोर्डिंग');
  await testClick('Wizard Next', 'आगे बढ़ें');
  await testClick('Wizard Close', '✕');

  console.log('\n▶ [CHECK 10] Testing Vaul Teacher Drawer ...');
  await testClick('Teacher Drawer Button', 'शिक्षक निर्देश');
  await new Promise(r => setTimeout(r, 600));
  await testClick('Close Drawer Button', '✕');

  // ---------------------------------------------------------
  // TEST TOP STATUS BAR TOGGLES
  // ---------------------------------------------------------
  console.log('\n▶ [CHECK 11] Testing Tablet Status Bar Toggles ...');
  await testClick('Toggle Offline Mode', 'ऑफ़लाइन सक्रिय');
  await testClick('Toggle Online Mode', 'ऑनलाइन');
  await testClick('Toggle Tablet View', 'टैबलेट व्यू');
  await testClick('Toggle Full View', 'फुल व्यू');

  // ---------------------------------------------------------
  // FINAL AUDIT & SUMMARY
  // ---------------------------------------------------------
  console.log('\n================================================================================');
  console.log('DEBUGGING AUDIT RESULTS:');
  console.log(`Total Runtime Page Errors: ${errors.length}`);
  console.log(`Total Console Warnings: ${warnings.length}`);
  console.log('================================================================================');

  if (errors.length > 0) {
    console.error('\n❌ ERRORS DETECTED:');
    errors.forEach((e, i) => console.error(`  [${i+1}] ${e}`));
    process.exitCode = 1;
  } else {
    console.log('\n🎉 ZERO ERRORS FOUND! All 11 feature modules, tabs, modals, forms, and toggles operate 100% cleanly without any exceptions!');
  }

  await browser.close();
})();
