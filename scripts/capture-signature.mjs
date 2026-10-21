import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const directory = `artifacts/signature-v3/${process.env.SIGNATURE_REVIEW_PASS || 'pass-1'}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('http://localhost:8787/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('main > section').evaluateAll(nodes => nodes.forEach(node => { node.style.contentVisibility = 'visible'; }));
    await page.locator('img').evaluateAll(async images => Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })));
    await page.screenshot({ path: `${directory}/hero-${width}.png`, animations: 'disabled' });
    await page.screenshot({ path: `${directory}/home-${width}.png`, animations: 'disabled', fullPage: true });
  }
  for (const path of ['about', 'services', 'portfolio', 'industries', 'technologies', 'contact', 'start-project']) {
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`http://localhost:8787/${path}`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('main > section').evaluateAll(nodes => nodes.forEach(node => { node.style.contentVisibility = 'visible'; }));
      await page.locator('img').evaluateAll(async images => Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })));
      await page.screenshot({ path: `${directory}/_${path}-${width}.png`, animations: 'disabled', fullPage: true });
    }
  }
  console.log(`Captured five viewport pairs in ${directory}`);
} finally { await browser.close(); }