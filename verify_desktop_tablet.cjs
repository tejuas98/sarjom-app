const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });
  const artifactDir = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f';

  // 1. Tablet Viewport (1194x834 - iPad Pro Landscape / Standard 10-inch Classroom Tablet)
  const tabletPage = await browser.newPage();
  await tabletPage.setViewport({ width: 1194, height: 834 });
  await tabletPage.goto('http://127.0.0.1:5173/?tab=voice&ui=en&theme=light');
  await new Promise(r => setTimeout(r, 1000));
  await tabletPage.screenshot({ path: `${artifactDir}/tablet_verification_after.png` });

  // 2. Desktop Viewport (1440x900 - Standard Desktop Monitor)
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900 });
  await desktopPage.goto('http://127.0.0.1:5173/?tab=voice&ui=en&theme=light');
  await new Promise(r => setTimeout(r, 1000));
  await desktopPage.screenshot({ path: `${artifactDir}/desktop_verification_after.png` });

  // Verify that on tablet & desktop, mobile bottom nav is NOT visible
  const tabletBottomNav = await tabletPage.evaluate(() => {
    const el = document.querySelector('.mobile-bottom-nav');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  const desktopBottomNav = await desktopPage.evaluate(() => {
    const el = document.querySelector('.mobile-bottom-nav');
    return el ? window.getComputedStyle(el).display : 'none';
  });

  console.log(`Tablet .mobile-bottom-nav display: ${tabletBottomNav}`);
  console.log(`Desktop .mobile-bottom-nav display: ${desktopBottomNav}`);

  await browser.close();
  console.log('Verification completed.');
})();
