const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/tmp/dogfood-ui-todo/node_modules/playwright');
const AxeBuilderModule = require('C:/tmp/dogfood-ui-todo/node_modules/@axe-core/playwright');
const AxeBuilder = AxeBuilderModule.default || AxeBuilderModule;

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
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(200);
    const report = await new AxeBuilder({ page }).analyze();
    const violations = report.violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact))
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      }));
    if (violations.length) {
      results.push({
        id: path.relative(root, file).replaceAll('\\', '/').replace(/\.html$/, ''),
        violations,
      });
    }
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(root, 'axe-details.json'), `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Recorded serious/critical details for ${results.length} concepts.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
