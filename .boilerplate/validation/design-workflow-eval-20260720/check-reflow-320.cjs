const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/tmp/dogfood-ui-todo/node_modules/playwright');

const root = __dirname;
const concepts = path.join(root, 'concepts');

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : entry.name.endsWith('.html') ? [target] : [];
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const file of htmlFiles(concepts).sort()) {
    const context = await browser.newContext({ viewport: { width: 320, height: 812 } });
    const page = await context.newPage();
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(200);
    const layout = await page.evaluate(() => {
      const visible = (el) => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
      const escaped = [...document.querySelectorAll('body *')]
        .filter((el) => {
          if (!visible(el)) return false;
          const rect = el.getBoundingClientRect();
          return rect.left < -1 || rect.right > innerWidth + 1;
        })
        .slice(0, 20)
        .map((el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].slice(0, 2).map((name) => `.${name}`).join('')}`);
      const clipped = [...document.querySelectorAll('h1,h2,h3,p,span,button,a,label,[data-check-text]')]
        .filter((el) => {
          const style = getComputedStyle(el);
          const clips = ['hidden', 'clip'].includes(style.overflow) || ['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY);
          return clips && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
        })
        .map((el) => `${el.tagName.toLowerCase()}${[...el.classList].slice(0, 2).map((name) => `.${name}`).join('')}`);
      return {
        documentWidth: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        escaped,
        clipped,
      };
    });
    results.push({ id: path.relative(root, file).replaceAll('\\', '/').replace(/\.html$/, ''), ...layout });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(root, 'reflow-320.json'), `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Checked ${results.length} concepts at 320 CSS px.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
