#!/usr/bin/env node
// design gate v3 (ADR-072 D6 / Flutter 어댑터: ADR-059#amend-1). 모드: --html | --manifest | --self-test | --tokens-only. 품질 계약: ADR-058 D3.
import { resolve, dirname, basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync, copyFileSync, mkdtempSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';

const SHOTS = 'design-gate-shots';
const SPAWN_ERROR_CODES = new Set(['EPERM', 'EACCES', 'ENOENT']); // 자식 프로세스 기동 자체 실패 — ADR-063 D1 spawn 3분기
const WIN = process.platform === 'win32'; // npx·flutter는 Windows에서 .cmd라 shell 없이는 spawn되지 않는다(Node child_process 문서)

function usage(msg) {
  if (msg) console.error(msg);
  console.error('usage: node design-gate.mjs (--html <files|glob...> | --manifest <path> [--only <id,...>] [--snapshot <dir>] [--no-build] | --self-test [--scopes <dir,...>] | --tokens-only <glob...|dir...>) [--report <path>] [--viewports WxH,...]');
  process.exit(2);
}

// 셸이 glob을 확장하지 않는 환경(PowerShell·cmd·Codex는 concept-*.html을 리터럴로 Node에 전달) 대비.
function walkFiles(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out); else out.push(p);
  }
  return out;
}

function expandGlob(pat) {
  if (!pat.includes('*')) return [pat];
  if (pat.includes('**')) { // 재귀 glob — src/screens/**/*.tsx
    const base = pat.slice(0, pat.indexOf('**')).replace(/[/\\]$/, '') || '.';
    const rx = new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*\//g, '\u0000').replace(/\*\*/g, '\u0001') // ** 먼저 자리표시자로 — 뒤의 * 치환이 생성된 정규식을 다시 바꾸지 않게
      .replace(/\*/g, '[^/]*')
      .replace(/\u0000/g, '(?:.*/)?').replace(/\u0001/g, '.*') + '$');
    return walkFiles(base).filter((f) => rx.test(f));
  }
  const slash = Math.max(pat.lastIndexOf('/'), pat.lastIndexOf('\\'));
  const dir = slash >= 0 ? pat.slice(0, slash) : '.';
  const rx = new RegExp('^' + pat.slice(slash + 1).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  try { return readdirSync(dir).filter((f) => rx.test(f)).map((f) => (slash >= 0 ? dir + '/' + f : f)); } catch { return []; }
}

// 디렉터리를 받으면 재귀 전개한다(호출 측이 디렉터리를 넘겨도 «0건»으로 조용히 끝나지 않게).
function expandInputs(files) {
  const out = [];
  for (const f of files) {
    let st;
    try { st = statSync(f); } catch { out.push({ path: f, unreadable: true }); continue; }
    if (st.isDirectory()) for (const w of walkFiles(f)) out.push({ path: w });
    else out.push({ path: f });
  }
  return out;
}

function parseArgs(argv) {
  const MODES = ['--html', '--manifest', '--self-test', '--tokens-only'];
  const modeFlags = argv.filter((a) => MODES.includes(a));
  if (modeFlags.length !== 1) usage(modeFlags.length ? '모드 플래그는 하나만' : '모드 플래그 필요');
  const opts = { mode: modeFlags[0].slice(2), files: [], manifestPath: null, only: null, snapshot: null, noBuild: false, report: null, viewports: null, scopes: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--html' || a === '--tokens-only') {
      while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opts.files.push(argv[++i]);
    } else if (a === '--manifest') {
      opts.manifestPath = argv[++i];
    } else if (a === '--only') {
      opts.only = (argv[++i] || '').split(',').filter(Boolean);
    } else if (a === '--snapshot') {
      opts.snapshot = argv[++i];
    } else if (a === '--scopes') {
      opts.scopes = (argv[++i] || '').split(',').filter(Boolean);
    } else if (a === '--no-build') {
      opts.noBuild = true;
    } else if (a === '--') {
      // pnpm 은 `pnpm <script> -- <args>` 의 `--` 를 스크립트 인자로 그대로 넘긴다(npm 은 제거한다).
      // 같은 command template 이 두 PM 에서 모두 돌도록 bare `--` 를 무시한다 (ADR-072#amend-1).
    } else if (a === '--self-test') {
      // 모드 플래그 자체 — 별도 값 없음
    } else if (a === '--report') {
      opts.report = argv[++i];
    } else if (a === '--viewports') {
      opts.viewports = (argv[++i] || '').split(',').filter(Boolean).map((s) => { const [w, h] = s.split('x').map(Number); return { w, h }; });
    } else {
      usage('미정의 플래그: ' + a);
    }
  }
  if (opts.mode === 'html' || opts.mode === 'tokens-only') opts.files = opts.files.flatMap(expandGlob);
  if ((opts.mode === 'html' || opts.mode === 'tokens-only') && !opts.files.length) usage('입력 파일 없음');
  if (opts.mode === 'manifest' && !opts.manifestPath) usage('--manifest 는 경로가 필요');
  return opts;
}

// ---------- 브라우저 (playwright) ----------
// 설치 scope가 저장소 루트가 아닐 수 있다(monorepo — apps/web 등). 매니페스트 scope → cwd → 루트 순으로 해석한다.
// playwright·@axe-core/playwright는 CJS라 import 네임스페이스에 named export가 없을 수 있어 default까지 본다.
async function loadPlaywright(scopes = []) {
  const bases = [...new Set([...scopes, '.', process.cwd()])].map((d) => resolve(d));
  const errors = [];
  for (const base of bases) {
    const req = createRequire(join(base, 'package.json'));
    let chromium;
    for (const spec of ['playwright', '@playwright/test']) {
      try {
        const m = await import(pathToFileURL(req.resolve(spec)).href);
        chromium = m.chromium ?? m.default?.chromium;
        if (chromium) break;
      } catch (e) { errors.push(`${base}:${spec} — ${e.code ?? e.message}`); }
    }
    if (!chromium) continue;
    try {
      const m = await import(pathToFileURL(req.resolve('@axe-core/playwright')).href);
      const AxeBuilder = [m.default?.default, m.default, m.AxeBuilder].find((x) => typeof x === 'function');
      if (!AxeBuilder) { errors.push(`${base}:@axe-core/playwright — 생성자 export 없음`); continue; }
      return { chromium, AxeBuilder };
    } catch (e) { errors.push(`${base}:@axe-core/playwright — ${e.code ?? e.message}`); }
  }
  console.error('Needs Install: npm i -D @playwright/test @axe-core/playwright && npx playwright install — 게이트 미실행(모듈 부재).');
  console.error('  해석 시도: ' + bases.join(' / ') + (errors.length ? '\n  사유: ' + errors.join(' / ') : ''));
  process.exit(2);
}

async function launchBrowser(chromium) {
  try {
    return await chromium.launch();
  } catch (e) {
    console.error('Needs Install: npx playwright install (chromium 바이너리 부재) — 게이트 미실행. 사유: ' + e.message);
    process.exit(2);
  }
}

// 정상 UI 오탐 제외(실브라우저 검증분): (1) sr-only/visually-hidden (2) aria-hidden/inert/hidden 조상 (3) 접근 가능한 contained 가로스크롤
function evalGeometry(wide) {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const sel = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
  const srOnly = (el) => { const s = getComputedStyle(el); return (el.clientWidth <= 1 && el.clientHeight <= 1) || (s.clip && s.clip !== 'auto') || (s.clipPath && s.clipPath !== 'none'); };
  const inSrOnly = (el) => { let p = el; while (p && p !== document.documentElement) { if (srOnly(p)) return true; p = p.parentElement; } return false; };
  const inaccessible = (el) => el.closest('[aria-hidden="true"],[inert],[hidden]') != null;
  const hasName = (el) => {
    if ((el.getAttribute('aria-label') || '').trim() || (el.getAttribute('title') || '').trim()) return true;
    return (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).some((id) => (document.getElementById(id)?.textContent || '').trim());
  };
  const inScrollable = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const s = getComputedStyle(p);
      const contained = /(auto|scroll)/.test(s.overflowX) && p.scrollWidth > p.clientWidth + 1 && p.tabIndex >= 0 && hasName(p);
      if (contained) return true;
      p = p.parentElement;
    }
    return false;
  };
  const clipped = (el) => {
    const s = getComputedStyle(el);
    const selfClipped = (['hidden', 'clip'].includes(s.overflowX) && el.scrollWidth > el.clientWidth + 1)
      || (['hidden', 'clip'].includes(s.overflowY) && el.scrollHeight > el.clientHeight + 1);
    if (selfClipped) return true;
    const r = el.getBoundingClientRect();
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const ps = getComputedStyle(p);
      const pr = p.getBoundingClientRect();
      const left = pr.left + p.clientLeft;
      const top = pr.top + p.clientTop;
      const right = left + p.clientWidth;
      const bottom = top + p.clientHeight;
      if ((['hidden', 'clip'].includes(ps.overflowX) && (r.left < left - 1 || r.right > right + 1))
        || (['hidden', 'clip'].includes(ps.overflowY) && (r.top < top - 1 || r.bottom > bottom + 1))) return true;
      p = p.parentElement;
    }
    return false;
  };
  const skip = (el) => !vis(el) || inSrOnly(el) || inaccessible(el);
  const overflow = document.documentElement.scrollWidth > innerWidth + 1;
  let escapes = [], clips = [];
  if (!wide) {
    escapes = [...document.querySelectorAll('body *')].filter((el) => { if (skip(el) || inScrollable(el)) return false; const r = el.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).slice(0, 5).map(sel);
    clips = [...document.querySelectorAll('h1,h2,h3,p,span,button,a,label,[data-check-text]')].filter((el) => { if (skip(el)) return false; const s = getComputedStyle(el); return s.textOverflow !== 'ellipsis' && clipped(el); }).slice(0, 5).map(sel);
  }
  return { overflow, escapes, clips };
}

async function runAxe(page, AxeBuilder) {
  return new AxeBuilder({ page }).options({
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'label-content-name-mismatch': { enabled: true } },
  }).analyze();
}

// 화면 1개(파일 URL 또는 이미 goto된 페이지)를 주어진 뷰포트 목록으로 렌더 — html/manifest/self-test 공용.
// 상태의 렌더 조건(ADR-072 D4 `states[].render`) → 그 상태를 돌 뷰포트 목록.
// `render.viewports` 가 있으면 그것만(프로필 밖 폭도 허용 — geometryOnly 가 아니라 기준선 대상이다).
function stateRenderViewports(state, profileViewports) {
  const r = state && state.render;
  if (!r || !Array.isArray(r.viewports) || !r.viewports.length) return profileViewports;
  return r.viewports.map((v) => ({ w: v.w, h: v.h, geometryOnly: false }));
}

// viewports 원소: { w, h, geometryOnly? } — geometryOnly면 axe 생략(매니페스트 profile 밖에서 주입한 320x720 등).
async function renderScreen({ browser, AxeBuilder, url, name, viewports, textScale, fonts }) {
  const entries = [];
  // 글자 확대 조건(ADR-072 D4 `states[].render.textScale`)은 브라우저 컨텍스트에 건다 —
  // CSS zoom 은 리플로우를 일으켜 실제 확대와 같고, transform:scale 은 리플로우가 없어 부적합하다.
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    for (const vp of viewports) {
      const entry = { viewport: { w: vp.w, h: vp.h }, blockers: [], reports: [], screenshot: null };
      try {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate(() => (document.fonts && document.fonts.ready) ? document.fonts.ready : null).catch(() => {});
        // goto 뒤에 건다 — 네비게이션이 앞서 주입한 스타일을 버린다.
        if (textScale && textScale !== 1) { await page.addStyleTag({ content: `:root{zoom:${textScale}}` }).catch(() => {}); await page.waitForTimeout(50); }
        const populated = await page.evaluate(() => !!document.body && (document.body.innerText.trim().length > 0 || document.body.querySelectorAll('img,svg,canvas,input,button,select,textarea').length > 0));
        if (!populated) entry.blockers.push({ rule: 'empty-render', selector: 'body', detail: 'populated 전제 위반 — 빈 화면(ADR-058 D3)' });
        const geo = await page.evaluate(evalGeometry, vp.w > 375);
        if (geo.overflow) entry.blockers.push({ rule: 'page-overflow', selector: 'document', detail: null });
        for (const s of geo.escapes) entry.blockers.push({ rule: 'viewport-escape', selector: s, detail: null });
        for (const s of geo.clips) entry.blockers.push({ rule: 'clipped-text', selector: s, detail: null });
        const shot = join(SHOTS, `${name}-${vp.w}x${vp.h}.png`); // 높이까지 넣는다 — 같은 폭 다른 높이 뷰포트가 서로 덮어쓰지 않게
        await page.screenshot({ path: shot, fullPage: true });
        entry.screenshot = shot;
        // 결정 글꼴 2차 검사 (ADR-073#amend-1 결정 5 — 보고 등급).
        // 네트워크·캐시·헤드리스 상태에 좌우되므로 차단하지 않는다. 1차(정적 선언)가 차단을 맡는다.
        if (fonts && fonts.length && !vp.geometryOnly) {
          const missing = await page.evaluate((fams) => {
            if (!document.fonts || !document.fonts.check) return [];
            return fams.filter((f) => !document.fonts.check(`16px "${f}"`));
          }, fonts).catch(() => []);
          for (const f of missing) entry.reports.push({ rule: 'font-not-loaded', selector: null, detail: `DESIGN 이 고른 글꼴 "${f}" 가 렌더 시점에 로드되지 않았다 — @font-face·next/font/local 배선 확인` });
        }
        if (!vp.geometryOnly) {
          const res = await runAxe(page, AxeBuilder);
          for (const v of res.violations) {
            const block = v.impact === 'serious' || v.impact === 'critical';
            const item = { rule: 'axe:' + v.id, selector: v.nodes.map((n) => n.target).flat().slice(0, 5), detail: v.impact };
            (block ? entry.blockers : entry.reports).push(item);
          }
          for (const v of res.incomplete) entry.reports.push({ rule: 'axe-incomplete:' + v.id, selector: null, detail: '자동 판정 불가 — 수동 검토' });
        }
      } catch (e) {
        entry.blockers.push({ rule: 'render-error', selector: null, detail: String(e && e.message || e).slice(0, 200) });
      }
      entries.push(entry);
    }
  } finally {
    await context.close();
  }
  return entries;
}

// ---------- 정적 서버 (storybook / self-test fixture 서빙) ----------
function serveStatic(rootDir) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const path = decodeURIComponent(req.url.split('?')[0]);
      const file = join(rootDir, path === '/' ? '/index.html' : path);
      try {
        const body = readFileSync(file);
        const ext = file.split('.').pop();
        const type = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png' }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolvePromise(server));
  });
}

// ---------- 자식 프로세스 ----------
// 반환: { ok, unavailable, timedOut, stdout, stderr }. spawn 자체 실패(EPERM/EACCES/ENOENT) → unavailable=true(exit 2 승계).
// 기동 후 시간 초과·출력 초과는 timedOut=true로 표시하고 호출부가 blocker(exit 1)로 정규화한다(ADR-063 D1).
function runChild(cmd, args, { cwd, timeoutMs = 180000 } = {}) {
  const r = spawnSync(cmd, args, { cwd, timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', shell: WIN });
  if (r.error && SPAWN_ERROR_CODES.has(r.error.code)) return { ok: false, unavailable: true, timedOut: false, stdout: '', stderr: String(r.error) };
  if (r.error || r.signal === 'SIGTERM') return { ok: false, unavailable: false, timedOut: true, stdout: r.stdout || '', stderr: r.stderr || String(r.error || '') };
  return { ok: r.status === 0, unavailable: false, timedOut: false, stdout: r.stdout || '', stderr: r.stderr || '' };
}

// ---------- 웹 어댑터 (Storybook) ----------
async function buildStorybook(scope, noBuild) {
  const outDir = join(scope, 'design-gate-storybook');
  if (noBuild && existsSync(outDir)) return { ok: true, outDir };
  const r = runChild('npx', ['storybook', 'build', '-o', 'design-gate-storybook', '--quiet'], { cwd: scope });
  if (r.unavailable) return { ok: false, unavailable: true };
  if (r.timedOut) return { ok: false, timedOut: true };
  if (!r.ok) return { ok: false, buildFailed: true, stderr: r.stderr };
  return { ok: true, outDir };
}

// ---------- Flutter 어댑터 ----------
function runFlutterTest(scope, testFile) {
  // 출력 경로는 저장소 루트 기준으로 고정한다 — cwd가 scope라 상대 경로면 apps/<scope>/design-gate-shots/에 쌓인다.
  const outAbs = resolve(SHOTS);
  // 출력 경로를 **두 경로로** 넘긴다. `--dart-define` 만 주면 `const String.fromEnvironment` 로만 읽히고,
  // 위젯 테스트가 더 흔한 `Platform.environment` 로 읽으면 조용히 null 이 되어 PNG 가 한 장도 안 나온다(실측).
  const r = spawnSync('flutter', ['test', testFile, '--reporter', 'json', `--dart-define=DESIGN_GATE_OUT=${outAbs}`], { cwd: scope, timeout: 180000, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', shell: WIN, env: { ...process.env, DESIGN_GATE_OUT: outAbs } });
  if (r.error && SPAWN_ERROR_CODES.has(r.error.code)) return { unavailable: true };
  if (r.error || r.signal === 'SIGTERM') return { timedOut: true };
  const lines = (r.stdout || '').split('\n').filter(Boolean);
  const events = [];
  for (const line of lines) { try { events.push(JSON.parse(line)); } catch { /* non-json 러너 로그 줄 무시 */ } }
  const hasProtocol = events.some((e) => e.type === 'start' && e.protocolVersion);
  const startedTests = events.some((e) => e.type === 'testStart');
  // 프로토콜 헤더가 없거나 테스트가 하나도 시작되지 못한 채 비정상 종료 = 컴파일·로드 실패(실행 불가 → exit 2).
  if (!hasProtocol || (!startedTests && r.status !== 0)) return { compileError: true, stderr: (r.stderr || '') + (r.stdout || '').slice(0, 500) };
  const tests = new Map();
  for (const e of events) if (e.type === 'testStart') tests.set(e.test.id, e.test.name);
  const blockers = [];
  const classify = (name, err) => (/RenderFlex overflow/i.test(err || '') ? 'overflow' : /meetsGuideline/i.test(name || '') ? 'guideline:' + name : 'exception');
  for (const e of events) {
    if (e.type !== 'testDone' || e.result === 'success' || e.hidden) continue;
    const name = tests.get(e.testID) || String(e.testID);
    blockers.push({ rule: classify(name, e.error), widget: name, detail: (e.error || '').slice(0, 200) });
  }
  // testDone 뒤에 오는 error 이벤트(비동기 예외·overflow)도 실패다 — json reporter 프로토콜상 error는 독립 이벤트다.
  for (const e of events) {
    if (e.type !== 'error') continue;
    const name = tests.get(e.testID) || 'test';
    blockers.push({ rule: classify(name, e.error), widget: name, detail: String(e.error || '').slice(0, 200) });
  }
  const done = [...events].reverse().find((e) => e.type === 'done');
  // 종료 상태·done.success도 본다 — testDone만 보면 «성공 뒤 오류»·«exit 1»이 통과로 새어 나간다.
  if ((done && done.success === false) || r.status !== 0) {
    if (!blockers.length) blockers.push({ rule: 'exception', widget: testFile, detail: `flutter test 비정상 종료(status=${r.status}, done.success=${done ? done.success : 'none'})` });
  }
  return { ok: blockers.length === 0, blockers };
}

// ---------- manifest 모드 ----------
// 결정 글꼴의 «선언»이 실재하는가 (ADR-073#amend-1 결정 5 — 1차, 차단 등급).
// 패밀리 이름을 CSS 변수에 쓴 것은 배선이 아니다 — @font-face / next/font/local / pubspec fonts: 중 하나가 있어야 한다.
function checkFontDeclarations(families, scopes) {
  const out = [];
  for (const family of families) {
    const esc = family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let found = null;
    for (const scope of scopes) {
      const pub = join(scope, 'pubspec.yaml');
      if (existsSync(pub)) {
        const y = readFileSync(pub, 'utf8');
        if (/^\s*fonts:/m.test(y) && new RegExp('family:\\s*[\'"]?' + esc, 'm').test(y)) { found = pub; break; }
      }
      for (const d of ['src', 'lib', 'app', 'styles', 'assets']) {
        const root = join(scope, d);
        if (!existsSync(root)) continue;
        for (const f of walkFiles(root)) {
          if (!/\.(css|scss|ts|tsx|js|jsx|mjs)$/.test(f)) continue;
          let txt = '';
          try { txt = readFileSync(f, 'utf8'); } catch { continue; }
          if (!txt.includes(family)) continue;
          if (/@font-face/.test(txt) || /next\/font\/local/.test(txt) || /localFont\s*\(/.test(txt)) { found = f; break; }
        }
        if (found) break;
      }
      if (found) break;
    }
    out.push({ family, declared: !!found, at: found });
  }
  return out;
}

async function runManifestMode(opts, ctx) {
  let manifest;
  try { manifest = JSON.parse(readFileSync(opts.manifestPath, 'utf8')); }
  catch (e) { console.error('매니페스트 읽기 실패: ' + e.message); process.exit(2); }
  if (manifest.version !== 1) { console.error('모르는 매니페스트 version: ' + manifest.version); process.exit(2); }
  let screens = manifest.screens || [];
  if (opts.only) {
    const missing = opts.only.filter((id) => !screens.some((s) => s.id === id));
    if (missing.length) { console.error('--only 에 매니페스트에 없는 화면 id: ' + missing.join(', ')); process.exit(2); }
    screens = screens.filter((s) => opts.only.includes(s.id));
  }
  if (!screens.length) { console.error('검사할 화면이 없다 — 매니페스트 screens[] 비어 있음'); process.exit(2); }

  const result = { version: 3, mode: 'manifest', screens: [], summary: { blockers: 0, reports: 0, unavailable: 0, snapshotWarnings: [] } };
  // 결정 글꼴 1차 검사 (ADR-073#amend-1 결정 5 — 차단). 선언 실재만 본다: 결정론적이라 blocker 로 쓸 수 있다.
  // `manifest.fonts` 가 없으면 통째로 건너뛴다(schema v1 minor — 기존 매니페스트 호환).
  if (manifest.fonts && manifest.fonts.length) {
    result.fontDeclarations = checkFontDeclarations(manifest.fonts, [...new Set(screens.map((s) => s.scope || '.'))]);
  }
  let unavailable = false;
  const { chromium, AxeBuilder } = await loadPlaywright([...screens.map((s) => s.scope || '.'), ...(opts.scopes ?? [])]); // 자가 검사 (c)는 --scopes 전체를 넘긴다(첫 scope에만 모듈이 없으면 오탐 exit 2)
  const browser = await launchBrowser(chromium);
  const storybookServers = new Map(); // scope -> http.Server (같은 scope 재사용 — screens 여러 개가 한 scope를 공유)
  try {
    for (const screen of screens) {
      const scope = screen.scope || '.';
      const profile = (manifest.profiles || {})[screen.profile] || { viewports: [{ w: 1280, h: 900 }] };
      const viewports = profile.viewports.map((v) => ({ ...v, geometryOnly: false }));
      if (!viewports.some((v) => v.w === 320 && v.h === 720)) viewports.push({ w: 320, h: 720, geometryOnly: true });
      const states = screen.states && screen.states.length ? screen.states : [{ id: 'default', preview: screen.preview }];
      for (const state of states) {
        const preview = state.preview || screen.preview;
        const name = `${screen.id}-${state.id}`;
        if (preview.startsWith('flutter:')) {
          const testFile = preview.slice('flutter:'.length).split('#')[0];
          const r = runFlutterTest(scope, testFile);
          if (r.unavailable) { console.error('flutter 미설치 또는 러너 기동 실패: ' + screen.id); process.exit(2); }
          if (r.compileError) { console.error('flutter test 컴파일 오류: ' + screen.id + ' — ' + (r.stderr || '').slice(0, 300)); process.exit(2); }
          if (r.timedOut) { result.screens.push({ id: screen.id, profile: screen.profile, viewport: null, preview, blockers: [{ rule: 'timeout', widget: null, detail: null }], reports: [], screenshot: null }); continue; }
          result.screens.push({ id: screen.id, profile: screen.profile, viewport: null, preview, blockers: r.blockers, reports: [], screenshot: null });
          continue;
        }
        let url;
        if (preview.startsWith('url:')) {
          url = pathToFileURL(resolve(preview.slice('url:'.length))).href;
        } else if (preview.startsWith('story:')) {
          const id = preview.slice('story:'.length);
          let server = storybookServers.get(scope);
          if (!server) {
            const built = await buildStorybook(scope, opts.noBuild);
            if (built.unavailable) { console.error('Needs Install: npx storybook — Storybook 미설치'); process.exit(2); }
            if (built.timedOut) { unavailable = false; result.screens.push({ id: screen.id, profile: screen.profile, viewport: null, preview, blockers: [{ rule: 'timeout', selector: null, detail: null }], reports: [], screenshot: null }); continue; }
            if (!built.ok) { console.error('Storybook 빌드 실패: ' + (built.stderr || '').slice(0, 300)); unavailable = true; result.summary.unavailable++; continue; }
            server = await serveStatic(built.outDir);
            storybookServers.set(scope, server);
          }
          const port = server.address().port;
          url = `http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;
        } else {
          console.error('알 수 없는 preview 스킴: ' + preview);
          process.exit(2);
        }
        // 상태가 렌더 조건을 선언하면 그 조건으로만 돈다(ADR-072 D4 — schema v1 minor `states[].render`).
        // 선언이 없으면 프로필 뷰포트 전체. 조건을 무시하면 「320에서 밀리는가」의 기준선이
        // 1280 스크린샷이 되어 이름과 내용이 어긋난다(dogfood Round 12 실측).
        const stateViewports = stateRenderViewports(state, viewports);
        const entries = await renderScreen({ browser, AxeBuilder, url, name, viewports: stateViewports, textScale: state.render && state.render.textScale, fonts: manifest.fonts });
        for (const e of entries) result.screens.push({ id: screen.id, profile: screen.profile, viewport: e.viewport, preview, blockers: e.blockers, reports: e.reports, screenshot: e.screenshot });
      }
      // 승인 스냅샷은 «통과한 화면»만 동결한다(ADR-072 D4) — 차단된 화면이 기존 승인본을 덮어쓰면 기준선이 오염된다.
      const screenBlocked = result.screens.some((s) => s.id === screen.id && (s.blockers || []).length);
      if (opts.snapshot && !screenBlocked) {
        const shotViewports = viewports.filter((v) => !v.geometryOnly); // geometry 전용(320)은 기준선이 아니다
        const primary = shotViewports[0];
        for (const st of states) {
          const isBaseline = st.id === 'default' || st.baseline === true
            || ((st.id === 'empty' || st.id === 'error') && primary); // empty·error는 1차 뷰포트만
          if (!isBaseline) continue;
          // 렌더 조건을 선언한 상태는 그 조건에서만 기준선을 뜬다 — 그러지 않으면
          // `<screen>-narrow-320-1280x900.png` 처럼 파일명과 내용이 어긋난다.
          const declared = stateRenderViewports(st, null);
          const vps = declared ? declared
            : (st.id === 'empty' || st.id === 'error') && !st.baseline ? [primary] : shotViewports;
          for (const vp of vps) {
            if (!vp) continue;
            const src = join(SHOTS, `${screen.id}-${st.id}-${vp.w}x${vp.h}.png`); // 웹·Flutter 공통 명명
            if (!existsSync(src)) continue;
            const dest = join(opts.snapshot, `${screen.id}-${st.id}-${vp.w}x${vp.h}.png`);
            mkdirSync(dirname(dest), { recursive: true });
            copyFileSync(src, dest);
            const bytes = statSync(dest).size;
            if (bytes > 500 * 1024) result.summary.snapshotWarnings.push({ file: dest, bytes, detail: '500KB 초과 — 화면 단순화 권고(차단 아님)' });
          }
        }
      }
    }
  } finally {
    await browser.close();
    for (const s of storybookServers.values()) s.close();
  }
  if (unavailable) return { result, exitOverride: 2 };
  return { result };
}

// ---------- self-test ----------
function knownBadHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>known-bad fixture</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;font:16px/1.4 sans-serif} .escape{width:200vw;height:20px;background:#eee} .low-contrast{color:#aaa;background:#fff;padding:8px}</style>
</head><body><div class="escape">overflow</div><p class="low-contrast">낮은 대비 텍스트</p><button><svg width="16" height="16" aria-hidden="true"></svg></button></body></html>`;
}
function knownGoodHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>known-good fixture</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;color:#17211b;background:#f4f6f3;font:16px/1.5 Arial,sans-serif} main{max-width:640px;margin:24px auto;padding:0 16px} button{min-height:44px;padding:0 18px;color:#fff;background:#1d5b3f;border:none;border-radius:6px}</style>
</head><body><main><h1>정상 화면</h1><p>대비·오버플로우 없는 통제 화면.</p><button>확인</button></main></body></html>`;
}

async function selfTestCase(name, html, expectRules, { browser, AxeBuilder }) {
  const dir = mkdtempSync(join(tmpdir(), 'design-gate-self-'));
  const file = join(dir, name + '.html');
  writeFileSync(file, html);
  const [entry] = await renderScreen({ browser, AxeBuilder, url: pathToFileURL(file).href, name: 'self-' + name, viewports: [{ w: 320, h: 720, geometryOnly: false }] });
  rmSync(dir, { recursive: true, force: true });
  const rules = new Set(entry.blockers.map((b) => b.rule));
  if (!expectRules) return { pass: entry.blockers.length === 0, entry };
  const pass = expectRules.every((r) => [...rules].some((x) => x === r || x.startsWith(r)));
  return { pass, entry };
}

// Flutter 자가 검사 대상 scope — 루트만 보면 monorepo(apps/mobile/pubspec.yaml)에서 (d)가 조용히 빠진다.
// stack-guard가 fixture를 만든 scope만 대상으로 한다(--scopes로 명시 가능).
function flutterSelfTestScopes(explicit) {
  if (explicit && explicit.length) return explicit.filter((s) => existsSync(join(s, 'test/design_gate')));
  const out = [];
  const has = (d) => existsSync(join(d, 'pubspec.yaml')) && existsSync(join(d, 'test/design_gate'));
  if (has('.')) out.push('.');
  for (const parent of ['.', 'apps', 'packages']) {
    let entries = [];
    try { entries = readdirSync(parent, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isDirectory() || e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const d = parent === '.' ? e.name : join(parent, e.name);
      if (has(d)) out.push(d);
    }
  }
  return [...new Set(out)];
}

async function runSelfTest(opts) {
  const cases = [];
  const { chromium, AxeBuilder } = await loadPlaywright(opts.scopes ?? []); // monorepo — 브라우저가 apps/web에만 있을 수 있다
  const browser = await launchBrowser(chromium);
  try {
    const a = await selfTestCase('known-bad', knownBadHtml(), ['page-overflow', 'axe:color-contrast', 'axe:button-name'], { browser, AxeBuilder });
    cases.push({ case: 'a-known-bad', pass: a.pass });
    const b = await selfTestCase('known-good', knownGoodHtml(), null, { browser, AxeBuilder });
    cases.push({ case: 'b-known-good', pass: b.pass });

    const dir = mkdtempSync(join(tmpdir(), 'design-gate-self-manifest-'));
    const goodFile = join(dir, 'good.html');
    writeFileSync(goodFile, knownGoodHtml());
    const tmpManifest = {
      version: 1, milestone: 'self-test',
      profiles: { default: { viewports: [{ w: 1280, h: 900 }] } },
      screens: [{ id: 'self-good', feature: 'self-test', profile: 'default', scope: (opts.scopes && opts.scopes[0]) || '.', preview: 'url:' + goodFile, states: [{ id: 'default', preview: 'url:' + goodFile, baseline: true }] }],
    };
    const manifestPath = join(dir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify(tmpManifest, null, 2));
    const snapDir = join(dir, 'snapshots');
    mkdirSync(snapDir, { recursive: true });
    const c = await runManifestMode({ mode: 'manifest', manifestPath, only: null, snapshot: snapDir, noBuild: false, scopes: opts.scopes ?? [] }, {});
    const cBlockers = c.result.screens.flatMap((s) => s.blockers);
    const cPass = cBlockers.length === 0 && existsSync(join(snapDir, 'self-good-default-1280x900.png'));
    cases.push({ case: 'c-manifest-url', pass: cPass });
    rmSync(dir, { recursive: true, force: true });

    for (const scope of flutterSelfTestScopes(opts.scopes)) {
      const bad = runFlutterTest(scope, 'test/design_gate/self_bad_test.dart');
      const ok = runFlutterTest(scope, 'test/design_gate/self_ok_test.dart');
      if (bad.unavailable || ok.unavailable) { console.error(`flutter 미설치 — self-test (d) 실행 불가 (scope: ${scope})`); process.exit(2); }
      if (bad.compileError || ok.compileError) { console.error(`flutter self-test fixture 컴파일 오류 (scope: ${scope})`); process.exit(2); }
      cases.push({ case: `d-flutter(${scope})`, pass: (bad.blockers || []).length > 0 && ok.ok });
    }
  } finally {
    await browser.close();
  }
  const allPass = cases.every((c) => c.pass);
  console.log(JSON.stringify({ 'self-test': allPass ? 'PASS' : 'FAIL', cases }, null, 2));
  return { result: { version: 3, mode: 'self-test', screens: [], summary: { blockers: 0, reports: 0, unavailable: 0 }, selfTest: { pass: allPass, cases } }, exitOverride: allPass ? 0 : 1 };
}

// ---------- tokens-only ----------
function runTokensOnly(opts) {
  const DEFINE_LINE = /^\s*(--[\w-]+\s*:\s*#[0-9a-f]{3,8}|static\s+const\s+Color\b)/i;
  const TOKEN_PATH = /(^|\/)(tokens?|theme)[\w./-]*\.(css|scss|dart|ts|js)$/i;
  // 3~5자리 단축 hex 는 «PR #412» 같은 산문 속 번호와 구별되지 않는다 — dogfood Round 11 실측에서
  // 18건 중 6건이 카피 문구 오탐이었다. 스타일시트에서만 단축 hex 를 잡고, 코드 파일에서는 6·8자리만 잡는다.
  // 대가: 코드에 직접 쓴 `#abc` 형태의 단축 색은 놓친다(토큰 규율상 코드에는 색 리터럴 자체를 두지 않는다). (ADR-072#amend-1)
  const STYLE_FILE = /\.(css|scss|sass|less)$/i;
  const LITERAL_STYLE = /#[0-9a-f]{3,8}\b|\[#[0-9a-f]{3,8}\]|Color\(0x[0-9a-fA-F]{6,8}\)|\bColors\.\w+\b|\b\d+px\b/g;
  const LITERAL_CODE = /#[0-9a-f]{6}(?:[0-9a-f]{2})?\b|\[#[0-9a-f]{3,8}\]|Color\(0x[0-9a-fA-F]{6,8}\)|\bColors\.\w+\b|\b\d+px\b/g;
  const tokens = [];
  const unreadable = [];
  for (const item of expandInputs(opts.files)) {
    const file = item.path;
    if (item.unreadable) { unreadable.push(file); continue; }
    if (TOKEN_PATH.test(file)) continue;
    let text;
    try { text = readFileSync(file, 'utf8'); } catch (e) { unreadable.push(file + ' — ' + (e.code || e.message)); continue; }
    const literal = STYLE_FILE.test(file) ? LITERAL_STYLE : LITERAL_CODE;
    text.split('\n').forEach((line, i) => {
      if (DEFINE_LINE.test(line)) return;
      const matches = line.match(literal);
      if (matches) for (const m of matches) tokens.push({ file, line: i + 1, literal: m });
    });
  }
  const result = { version: 3, mode: 'tokens-only', tokens, unreadable, summary: { blockers: 0, reports: tokens.length, unavailable: unreadable.length } };
  if (unreadable.length) console.error('읽지 못한 입력(0건과 구분): ' + unreadable.join(', '));
  console.log(JSON.stringify(result, null, 2));
  if (opts.report) writeFileSync(opts.report, JSON.stringify(result, null, 2));
  process.exit(0);
}

// ---------- html 모드 ----------
async function runHtmlMode(opts) {
  const { chromium, AxeBuilder } = await loadPlaywright(opts.scopes ?? []);
  const browser = await launchBrowser(chromium);
  const result = { version: 3, mode: 'html', screens: [], summary: { blockers: 0, reports: 0, unavailable: 0 } };
  const viewports = opts.viewports && opts.viewports.length
    ? opts.viewports.map((v, i) => ({ ...v, geometryOnly: i === 1 }))
    : [{ w: 1280, h: 900, geometryOnly: false }, { w: 375, h: 812, geometryOnly: true }, { w: 320, h: 720, geometryOnly: false }];
  try {
    for (const [idx, f] of opts.files.entries()) {
      const name = `${idx}-${basename(f).replace(/\.html?$/i, '')}`;
      const url = pathToFileURL(resolve(f)).href;
      const entries = await renderScreen({ browser, AxeBuilder, url, name, viewports });
      for (const e of entries) result.screens.push({ id: name, profile: null, viewport: e.viewport, preview: f, blockers: e.blockers, reports: e.reports, screenshot: e.screenshot });
    }
  } finally {
    await browser.close();
  }
  return { result };
}

// ---------- main ----------
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const RENDER_MODES = new Set(['html', 'manifest', 'self-test']);
  if (RENDER_MODES.has(opts.mode)) {
    rmSync(SHOTS, { recursive: true, force: true }); // stale 픽셀 제거 — 결정적 초기화(재실행마다 정확히 이번 입력분만)
    mkdirSync(SHOTS, { recursive: true });
  }

  let outcome;
  if (opts.mode === 'tokens-only') { runTokensOnly(opts); return; } // process.exit 내부에서 종료
  if (opts.mode === 'html') outcome = await runHtmlMode(opts);
  else if (opts.mode === 'manifest') outcome = await runManifestMode(opts, {});
  else if (opts.mode === 'self-test') outcome = await runSelfTest(opts);

  const { result, exitOverride } = outcome;
  for (const s of result.screens) { result.summary.blockers += (s.blockers || []).length; result.summary.reports += (s.reports || []).length; }
  // 결정 글꼴 1차 검사는 화면이 아니라 매니페스트 전체에 걸린다 — 화면 blockers 와 별도로 세고 exit 1 에 넣는다.
  const undeclared = (result.fontDeclarations || []).filter((f) => !f.declared);
  result.summary.fontBlockers = undeclared.length;
  result.summary.blockers += undeclared.length;
  const reportPath = opts.report || join(SHOTS, 'report.json');
  writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(exitOverride !== undefined ? exitOverride : (result.summary.blockers ? 1 : 0));
}

main();
