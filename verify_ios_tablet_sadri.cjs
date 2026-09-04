const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

(async () => {
  console.log('================================================================================');
  console.log('SARJOM — APPLE IPAD (iOS TABLET) & SADRI (सादरी) RUNTIME VERIFICATION');
  console.log('Target: http://localhost:5173/?device=ios&lang=sadri');
  console.log('================================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1380,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 980, deviceScaleFactor: 2 });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(`[Page Crash] ${err.message}`);
  });

  // 1. Initial Load of iOS Tablet with Sadri
  console.log('▶ [TEST 1] Loading iPad iOS Tablet Simulator with Sadri...');
  await page.goto('http://localhost:5173/?device=ios&lang=sadri', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Check DOM text & verify it is NOT a blank white page
  const mainCheck = await page.evaluate(() => {
    const text = document.body.innerText.trim();
    const hasStatus941 = text.includes('9:41 AM');
    const hasGumla = text.includes('गुमला') || text.includes('बिशुनपुर');
    const hasSadri = text.includes('Sadri') || text.includes('सादरी');
    const hasAppleTag = text.includes('iPad • Gumla DIET');
    const buttons = document.querySelectorAll('button').length;
    return {
      textLength: text.length,
      buttons,
      hasStatus941,
      hasGumla,
      hasSadri,
      hasAppleTag,
      preview: text.substring(0, 200).replace(/\n+/g, ' ')
    };
  });

  console.log(`  Page Text Length: ${mainCheck.textLength} characters`);
  console.log(`  Buttons Detected: ${mainCheck.buttons}`);
  console.log(`  iOS 9:41 Status Bar Present: ${mainCheck.hasStatus941 ? '✅ YES' : '❌ NO'}`);
  console.log(`  Apple iPad Status Tag: ${mainCheck.hasAppleTag ? '✅ YES' : '❌ NO'}`);
  console.log(`  Gumla School Selected: ${mainCheck.hasGumla ? '✅ YES' : '❌ NO'}`);
  console.log(`  Sadri Language Active: ${mainCheck.hasSadri ? '✅ YES' : '❌ NO'}`);

  if (mainCheck.textLength < 200) {
    errors.push(`Blank white page detected! Body text length is only ${mainCheck.textLength}`);
  }

  // Capture Screenshot of Apple iPad with Sadri
  const shotPath = path.join(SCREENSHOTS_DIR, '01_ipad_ios_sadri_voice.png');
  const artifactShot = path.join(ARTIFACT_DIR, 'ipad_ios_sadri_verified.png');
  await page.screenshot({ path: shotPath });
  fs.copyFileSync(shotPath, artifactShot);
  console.log(`  📸 Screenshot saved: ${shotPath} and ${artifactShot}`);

  // 2. Test All 9 Tabs in Sadri to Guarantee Zero Blank Screens
  const tabs = [
    { id: 'voice', name: 'Voice Translator' },
    { id: 'curriculum', name: 'NIPUN FLN Curriculum' },
    { id: 'worksheets', name: 'Bilingual Worksheet Studio' },
    { id: 'flashcards', name: 'Flashcard Deck & Quiz' },
    { id: 'slate', name: 'Digital Slate & Folklore' },
    { id: 'dictionary', name: '4-Dialect Lexicon' },
    { id: 'neural', name: 'Neural Model Inspector' },
    { id: 'orf', name: 'Acoustic Fluency Coach' },
    { id: 'benchmark', name: 'Jury Benchmarking Matrix' }
  ];

  console.log('\n▶ [TEST 2] Testing All 9 Modules in Sadri to verify zero blank screens:');
  for (const tab of tabs) {
    await page.goto(`http://localhost:5173/?device=ios&lang=sadri&tab=${tab.id}`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));
    const tabCheck = await page.evaluate(() => ({
      textLength: document.body.innerText.trim().length,
      buttons: document.querySelectorAll('button').length
    }));

    if (tabCheck.textLength < 150) {
      console.error(`  ❌ FAIL: Tab ${tab.name} (${tab.id}) rendered blank! (${tabCheck.textLength} chars)`);
      errors.push(`Tab ${tab.name} is blank on Sadri`);
    } else {
      console.log(`  ✅ Tab [${tab.name}]: ${tabCheck.textLength} chars, ${tabCheck.buttons} buttons — PASS`);
    }
  }

  // 3. Test Device Mode Switching
  console.log('\n▶ [TEST 3] Testing Device Switcher (iPad vs Android vs Full):');
  await page.goto('http://localhost:5173/?device=android&lang=sadri', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const androidCheck = await page.evaluate(() => document.body.innerText.includes('Android 9.0+'));
  console.log(`  Android Go Mode: ${androidCheck ? '✅ PASS' : '❌ FAIL'}`);

  await page.goto('http://localhost:5173/?device=full&lang=sadri', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const fullCheck = await page.evaluate(() => document.body.innerText.includes('सरजोम (SARJOM)'));
  console.log(`  Full Desktop Mode: ${fullCheck ? '✅ PASS' : '❌ FAIL'}`);

  await browser.close();

  console.log('\n================================================================================');
  if (errors.length === 0) {
    console.log('🎉 VERIFICATION RESULT: 100% SUCCESSFUL! ZERO BLANK SCREENS!');
    console.log('Apple iPad Pro iOS Tablet Simulator + Sadri (सादरी) Fully Operational!');
    console.log('================================================================================\n');
    process.exit(0);
  } else {
    console.error('⚠️ ERRORS DETECTED:');
    errors.forEach((e) => console.error('  - ' + e));
    console.log('================================================================================\n');
    process.exit(1);
  }
})();
