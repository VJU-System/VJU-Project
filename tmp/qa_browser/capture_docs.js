const { chromium } = require('../qa_browser_runner/node_modules/playwright');
(async () => {
  const docs = ['3626-QD-DHQGHN', '3636-QD-DHQGHN'];
  const base = 'http://127.0.0.1:8001/';
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  for (const docId of docs) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.click(`[data-doc="${docId}"]`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `tmp/qa_browser/${docId}_reader.png`, fullPage: true });
    await page.pdf({ path: `tmp/qa_browser/${docId}_browser.pdf`, printBackground: true, format: 'A4' });
    for (const lang of ['en', 'ja']) {
      const btn = page.locator(`#lang-${lang}`);
      if (await btn.count()) {
        await btn.first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `tmp/qa_browser/${docId}_reader_${lang}.png`, fullPage: true });
      }
    }
    await page.close();
  }
  await browser.close();
})();
