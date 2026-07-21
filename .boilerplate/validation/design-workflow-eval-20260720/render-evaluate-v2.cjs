const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/tmp/dogfood-ui-todo/node_modules/playwright');
const AxeBuilderModule = require('C:/tmp/dogfood-ui-todo/node_modules/@axe-core/playwright');
const AxeBuilder = AxeBuilderModule.default || AxeBuilderModule;

const root = __dirname;
const inputRoots = [path.join(root, 'concepts'), path.join(root, 'microtests', 'ds3')];
const screenshotRoot = path.join(root, 'screenshots');
const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : entry.name.endsWith('.html') ? [target] : [];
  });
}

function relativeId(file) {
  return path.relative(root, file).replaceAll('\\', '/').replace(/\.html$/, '');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const file of inputRoots.flatMap(htmlFiles).sort()) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
        await page.goto(pathToFileURL(file).href, { waitUntil: 'load', timeout: 10000 });
      });
      await page.waitForTimeout(350);

      const id = relativeId(file);
      const screenshotPath = path.join(screenshotRoot, `${id}--${viewport.name}.png`);
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const layout = await page.evaluate(() => {
        const elementPath = (el) => {
          const name = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const classes = [...el.classList].slice(0, 2).map((item) => `.${item}`).join('');
          return `${name}${id}${classes}`;
        };
        const clippedText = [...document.querySelectorAll('h1,h2,h3,p,span,button,a,label,[data-check-text]')]
          .filter((el) => {
            const style = getComputedStyle(el);
            const clips = ['hidden', 'clip'].includes(style.overflow) || ['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY);
            return clips && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
          })
          .map(elementPath);
        const viewportEscape = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return style.display !== 'none' && rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
          })
          .slice(0, 20)
          .map(elementPath);
        const critical = [...document.querySelectorAll('[data-critical]')].map((el) => ({ el, rect: el.getBoundingClientRect() }));
        const criticalOverlaps = [];
        for (let i = 0; i < critical.length; i += 1) {
          for (let j = i + 1; j < critical.length; j += 1) {
            const a = critical[i].rect;
            const b = critical[j].rect;
            const overlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            if (overlap > 20) criticalOverlaps.push(`${critical[i].el.dataset.critical}+${critical[j].el.dataset.critical}`);
          }
        }
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          clippedText,
          viewportEscape,
          criticalOverlaps,
        };
      });

      let axe = { violations: [], error: null };
      try {
        const report = await new AxeBuilder({ page }).analyze();
        axe.violations = report.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
        }));
      } catch (error) {
        axe.error = String(error);
      }

      results.push({
        id,
        viewport: viewport.name,
        screenshot: path.relative(root, screenshotPath).replaceAll('\\', '/'),
        layout,
        axe,
      });
      await context.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(root, 'metrics-v2.json'), `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Evaluated ${results.length} file/viewport combinations.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
