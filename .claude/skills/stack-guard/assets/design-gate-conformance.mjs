#!/usr/bin/env node
// Fixed conformance oracle for ADR-058#amend-2/v2.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

const CAPABILITY = 'ADR-058#amend-2/v2';
const EXPECTED_SOURCE_SHA256 = '9fb9b7a2858af4d68dda5d8cefe5ccc019ee8c07a71ecbc8e6273ca76f17cda9';
const adapterArg = process.argv[2];
const adapter = adapterArg ? resolve(adapterArg) : '';
const checks = [];
const record = (name, pass, detail) => checks.push({ name, pass, detail });
const html = (title, style, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>* { box-sizing: border-box; } ${style}</style>
</head>
<body>${body}</body>
</html>
`;

const FIXTURES = {
  'clean.html': html(
    'Clean control',
    'body { margin: 0; color: #17211b; background: #f4f6f3; font: 16px/1.5 Arial, sans-serif; } main { width: min(100% - 32px, 720px); margin: 32px auto; } button { min-height: 44px; padding: 0 18px; color: white; background: #1d5b3f; border: 2px solid transparent; } button:focus-visible { outline: 3px solid #1f6feb; outline-offset: 3px; }',
    '<main><h1>Checkout API</h1><p>Investigating for 7 minutes</p><button>Assign incident owner</button></main>',
  ),
  'low-contrast.html': html(
    'Contrast negative',
    'body { margin: 0; padding: 48px; color: #18181b; background: #fff; font: 16px/1.5 Arial, sans-serif; } .done { color: #737373; opacity: .65; font-size: 15px; }',
    '<main><h1>Resolved incidents</h1><p class="done">Checkout recovery completed at 02:31 UTC</p></main>',
  ),
  'horizontal.html': html(
    'Horizontal overflow negative',
    'body { margin: 0; color: #15202b; background: #f7f8fa; font: 14px/1.4 Arial, sans-serif; } .toolbar { min-width: 760px; display: grid; grid-template-columns: 1fr repeat(4, 140px); gap: 8px; padding: 20px; background: white; } .cell { padding: 12px; border: 1px solid #68756b; }',
    '<main class="toolbar"><div class="cell">Incident</div><div class="cell">Severity</div><div class="cell">Age</div><div class="cell">Owner</div><div class="cell">State</div></main>',
  ),
  'self-clip.html': html(
    'Self clipping negative',
    'body { margin: 0; padding: 24px; color: #1f2933; background: #f8faf9; font: 16px/1.5 Arial, sans-serif; } .notice { width: min(100%, 420px); height: 56px; overflow: hidden; padding: 12px 16px; border-left: 4px solid #b42318; background: #fff; }',
    '<main><h1>Payment status</h1><p class="notice" data-check-text>The payment error rate exceeded the threshold. Assign an owner and confirm the next customer update time.</p></main>',
  ),
  'vertical.html': html(
    'Vertical scroll escape negative',
    'body { margin: 0; padding: 16px; color: #17211b; background: #f4f6f3; font: 16px/1.5 Arial, sans-serif; } .vertical-scroll { width: 260px; height: 120px; overflow-y: auto; } .escaped { width: 520px; padding: 12px; background: white; border: 1px solid #68756b; }',
    '<main class="vertical-scroll"><p class="escaped">This content escapes horizontally. A vertical scrolling ancestor must not exempt it.</p><p>Additional vertical content.</p><p>Additional vertical content.</p></main>',
  ),
  'ancestor-clip.html': html(
    'Ancestor clipping negative',
    'body { margin: 0; padding: 20px; color: #17211b; background: #f4f6f3; font: 16px/1.5 Arial, sans-serif; } .notice { width: 260px; height: 48px; overflow: hidden; padding: 8px; background: white; border: 1px solid #68756b; } .notice p { margin: 0; }',
    '<main><h1>Deployment status</h1><section class="notice"><p data-check-text>The deployment is waiting for approval from the incident commander before traffic can move.</p></section></main>',
  ),
  'exclusions.html': html(
    'Geometry exclusions control',
    'body { margin: 0; padding: 16px; color: #17211b; background: #f4f6f3; font: 16px/1.5 Arial, sans-serif; } .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; } .table-scroll { width: 100%; overflow-x: auto; border: 1px solid #68756b; } table { width: 720px; border-collapse: collapse; } th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ccd3cd; } .ellipsis { width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '<main><h1>Incident queue</h1><span class="sr-only"><span>Screen-reader-only context remains intentionally clipped.</span></span><div class="table-scroll" tabindex="0" aria-label="Incident queue table"><table><thead><tr><th>Incident</th><th>Owner</th><th>Status</th><th>Updated</th></tr></thead><tbody><tr><td>Checkout latency</td><td>Payments</td><td>Investigating</td><td>12:40 UTC</td></tr></tbody></table></div><p class="ellipsis">This intentionally shortened title should remain outside clipping findings.</p></main>',
  ),
  'label-name.html': html(
    'Label name negative',
    'body { margin: 0; padding: 24px; color: #17211b; background: white; font: 16px/1.5 Arial, sans-serif; } button { padding: 10px 16px; color: white; background: #14532d; border: 0; }',
    '<main><h1>Incident search</h1><button aria-label="Find records">Search incidents</button></main>',
  ),
  'edge-1px.html': html(
    'One pixel tolerance control',
    'body { margin: 0; color: #17211b; background: white; font: 16px/1.5 Arial, sans-serif; } .edge { position: fixed; left: -1px; top: 40px; width: 180px; padding: 8px; border: 1px solid #68756b; background: white; }',
    '<main><h1>Boundary control</h1><p class="edge">One pixel is within tolerance.</p></main>',
  ),
  'edge-2px.html': html(
    'Two pixel escape negative',
    'body { margin: 0; color: #17211b; background: white; font: 16px/1.5 Arial, sans-serif; } .edge { position: fixed; left: -2px; top: 40px; width: 180px; padding: 8px; border: 1px solid #68756b; background: white; }',
    '<main><h1>Boundary negative</h1><p class="edge">Two pixels must be reported.</p></main>',
  ),
};

const finish = (forcedExit) => {
  const passed = checks.filter((item) => item.pass).length;
  console.log(JSON.stringify({ capability: CAPABILITY, sourceDigest: EXPECTED_SOURCE_SHA256, passed, total: checks.length, checks }, null, 2));
  process.exit(forcedExit ?? (passed === checks.length ? 0 : 1));
};

let adapterSource;
try {
  if (adapter && statSync(adapter).isFile()) adapterSource = readFileSync(adapter);
} catch { /* Invalid or inaccessible input is an execution-unavailable result. */ }
if (!adapterSource) {
  record('source-integrity', false, `adapter is not a readable file: ${adapter || '<empty>'}`);
  finish(2);
}

const actualDigest = createHash('sha256').update(adapterSource).digest('hex');
record('source-integrity', actualDigest === EXPECTED_SOURCE_SHA256, `actual=${actualDigest}`);
if (actualDigest !== EXPECTED_SOURCE_SHA256) finish(1);

const root = mkdtempSync(join(tmpdir(), 'design-gate-v2-'));
const fixtureDir = join(root, 'fixtures');
mkdirSync(fixtureDir, { recursive: true });
for (const [name, source] of Object.entries(FIXTURES)) writeFileSync(join(fixtureDir, name), source, 'utf8');

const run = (files) => {
  const result = spawnSync(process.execPath, [adapter, ...files], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    timeout: 120_000,
    windowsHide: true,
  });
  if (result.error) return { result, output: null };
  try { return { result, output: JSON.parse(result.stdout) }; }
  catch { return { result, output: null }; }
};

const fixture = (name) => join(fixtureDir, name);
const fileBlockers = (output, name) => (output?.blockers || []).filter((item) => basename(item.file) === name);
const hasKind = (output, name, kind) => fileBlockers(output, name).some((item) => item.kind === kind);
const noGeometryBlockers = (output, name) => fileBlockers(output, name).every((item) => !['page-overflow', 'viewport-escape', 'clipped-text'].includes(item.kind));

try {
  const shots = join(root, 'design-gate-shots');
  mkdirSync(shots, { recursive: true });
  writeFileSync(join(shots, 'stale.png'), 'stale', 'utf8');

  const coreNames = ['clean.html', 'low-contrast.html', 'horizontal.html', 'self-clip.html', 'vertical.html', 'ancestor-clip.html', 'exclusions.html', 'label-name.html'];
  const core = run(coreNames.map(fixture));
  if (core.result.status === 2) {
    const detail = (core.result.stderr || core.result.stdout || 'adapter exit 2').trim();
    record('execution-available', false, detail.slice(0, 2000));
    // finish() terminates immediately, so remove the temp tree before emitting exit 2.
    rmSync(root, { recursive: true, force: true });
    finish(2);
  }
  record('bounded-process-completion', !core.result.error, core.result.error?.message || `status=${core.result.status}`);
  record('stale-screenshot-cleanup', !existsSync(join(shots, 'stale.png')), 'stale.png removed before capture');
  record('clean-pass', fileBlockers(core.output, 'clean.html').length === 0 && (core.output?.screenshots || []).filter((shot) => basename(shot).startsWith('0-clean-')).length === 3, 'blockers=0 screenshots=3');
  record('page-overflow', hasKind(core.output, 'horizontal.html', 'page-overflow'), 'horizontal fixture');
  record('viewport-escape', hasKind(core.output, 'horizontal.html', 'viewport-escape'), 'horizontal fixture');
  record('self-clipped-text', hasKind(core.output, 'self-clip.html', 'clipped-text'), 'self overflow fixture');
  record('ancestor-clipped-text', hasKind(core.output, 'ancestor-clip.html', 'clipped-text'), 'ancestor overflow fixture');
  record('vertical-scroll-escape', hasKind(core.output, 'vertical.html', 'viewport-escape'), 'vertical-only ancestor is not exempt');
  record('accessible-horizontal-scroll-pass', noGeometryBlockers(core.output, 'exclusions.html'), 'named focusable scroll container');
  record('sr-hidden-ellipsis-pass', noGeometryBlockers(core.output, 'exclusions.html'), 'sr-only and ellipsis excluded');
  record('serious-axe', hasKind(core.output, 'low-contrast.html', 'axe:color-contrast'), 'computed low contrast');
  record('label-content-name-mismatch', hasKind(core.output, 'label-name.html', 'axe:label-content-name-mismatch'), 'experimental WCAG 2.1 A rule explicitly enabled');

  const sameA = join(root, 'same-a', 'index.html');
  const sameB = join(root, 'same-b', 'index.html');
  mkdirSync(dirname(sameA), { recursive: true });
  mkdirSync(dirname(sameB), { recursive: true });
  writeFileSync(sameA, FIXTURES['clean.html'], 'utf8');
  writeFileSync(sameB, FIXTURES['clean.html'], 'utf8');
  const same = run([sameA, sameB]);
  const sameShots = (same.output?.screenshots || []).map((shot) => basename(shot));
  record('same-basename-batch', same.result.status === 0 && sameShots.length === 6 && sameShots.filter((name) => name.startsWith('0-index-')).length === 3 && sameShots.filter((name) => name.startsWith('1-index-')).length === 3 && new Set(sameShots).size === 6, `screenshots=${sameShots.length} unique=${new Set(sameShots).size}`);

  const missing = join(root, 'missing.html');
  const isolated = run([missing, fixture('clean.html')]);
  record('per-file-render-error-isolation', isolated.result.status === 1 && hasKind(isolated.output, 'missing.html', 'render-error') && (isolated.output?.screenshots || []).filter((shot) => basename(shot).startsWith('1-clean-')).length === 3, 'missing file blocks while clean sibling still renders');

  const edge = run([fixture('edge-1px.html'), fixture('edge-2px.html')]);
  record('one-pixel-tolerance-pass', fileBlockers(edge.output, 'edge-1px.html').length === 0, 'left=-1px is within tolerance');
  record('two-pixel-escape-block', hasKind(edge.output, 'edge-2px.html', 'viewport-escape'), 'left=-2px is outside tolerance');
} finally {
  rmSync(root, { recursive: true, force: true });
}

finish();