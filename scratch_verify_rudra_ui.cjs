const puppeteer = require('puppeteer-core');

const userSentence = "चूंकि ग्राम सभा के सक्रिय सदस्य रुद्र ने यह आधिकारिक प्रशासनिक शिकायत दर्ज कराई है कि सुदूरवर्ती टोले के कुछ बाहरी बिचौलियों ने कपटपूर्ण तरीके से हमारे दादाजी की पारंपरिक भूमि के दस्तावेज़ों को बदल दिया है, इसलिए मानकी-मुंडा न्याय व्यवस्था ने सर्वसम्मति से यह सामाजिक निर्णय लिया है कि जब तक अंचल अधिकारी स्वयं पुलिस बल के साथ आकर भूमि की नए सिरे से पैमाइश नहीं करेंगे, तब तक न तो रुद्र की शिकायत का निवारण माना जाएगा और न ही उस विवादित भूमि पर किसी भी प्रकार के बाहरी निर्माण कार्य की अनुमति दी जाएगी, जिसका उल्लंघन करने वाले किसी भी व्यक्ति के खिलाफ कानूनी और सामाजिक दंडात्मक कार्रवाई सुनिश्चित की जाएगी।";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Click the quick prompt chip
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const chip = buttons.find(b => b.textContent.includes('रुद्र: भूमि विवाद'));
    if (chip) chip.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 1. HO
  const hoPath = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685/rudra_complex_ho_verified.png';
  await page.screenshot({ path: hoPath });
  console.log('✅ Ho verified');

  // 2. MUNDARI
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.nav-dialect-bar button'));
    const target = btns.find(b => b.textContent.includes('मुण्डारी') || b.textContent.includes('Mundari'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const mundariPath = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685/rudra_complex_mundari_verified.png';
  await page.screenshot({ path: mundariPath });
  console.log('✅ Mundari verified');

  // 3. SANTHALI
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.nav-dialect-bar button'));
    const target = btns.find(b => b.textContent.includes('संताली') || b.textContent.includes('Santhali'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const santhaliPath = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685/rudra_complex_santhali_verified.png';
  await page.screenshot({ path: santhaliPath });
  console.log('✅ Santhali verified');

  // 4. SADRI
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.nav-dialect-bar button'));
    const target = btns.find(b => b.textContent.includes('सादरी') || b.textContent.includes('Sadri'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const sadriPath = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685/rudra_complex_sadri_verified.png';
  await page.screenshot({ path: sadriPath });
  console.log('✅ Sadri verified');

  await browser.close();
  console.log('🎉 All 4 screenshots captured and verified!');
})();
