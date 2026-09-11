#!/usr/bin/env node
// reference gallery capture (ADR-058#amend-4 결정 1)
// 입력: docs/20-system/design-refs/refs.json (skill이 작성) — { viewports: [{w,h,name}], resolveFrom?: [<dir>], targets: [{ id, url, kind: "live|store|hub", usage?: <사용 주의>, flows: [{ name, steps: [{ action: "goto|click|wait", selector }] }] }] }
// 출력: docs/20-system/design-refs/shots/<id>-<flow|page>-<n>-<w>x<h>.png + gallery.html + selection.json(사용자가 갤러리에서 내보낼 때)
// 보안: fill 액션 없음 — 자격 증명 입력 경로 자체를 두지 않는다. browser_run_code류 없음.
import { resolve, join, dirname, extname, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

// 경로는 언제나 저장소 루트 기준이다(어느 디렉터리에서 실행하든 갤러리 위치가 같아야 한다).
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const REFS_DIR = join(REPO_ROOT, 'docs/20-system/design-refs');
const REFS_JSON = join(REFS_DIR, 'refs.json');
const SHOTS_DIR = join(REFS_DIR, 'shots');
const INBOX_DIR = join(REFS_DIR, 'inbox');
const GALLERY_HTML = join(REFS_DIR, 'gallery.html');

if (!existsSync(REFS_JSON)) {
  console.error(`usage: ${REFS_JSON} 를 먼저 작성한 뒤 실행한다 — { viewports, targets }`);
  process.exit(2);
}
const refs = JSON.parse(readFileSync(REFS_JSON, 'utf8'));
const viewports = refs.viewports?.length ? refs.viewports : [{ w: 1280, h: 900, name: 'default' }];
const targets = refs.targets ?? [];

// stack-guard가 까는 것은 @playwright/test(standalone playwright 아님) — 둘 다 chromium을 export한다.
// 설치 scope가 저장소 루트가 아닐 수 있으므로(monorepo — apps/web 등) 해석 기준을 여러 곳에서 시도한다.
async function loadChromium() {
  const bases = [...(refs.resolveFrom ?? []), process.cwd(), REPO_ROOT].map((d) => resolve(REPO_ROOT, d));
  const errors = [];
  for (const base of bases) {
    const req = createRequire(join(base, 'package.json'));
    for (const spec of ['playwright', '@playwright/test']) {
      try {
        const mod = await import(pathToFileURL(req.resolve(spec)).href);
        // playwright는 CJS 재-export라 namespace에 named `chromium`이 없다 — default(module.exports)에서 꺼낸다.
        const c = mod.chromium ?? mod.default?.chromium;
        if (c) return c;
        errors.push(`${base}:${spec} — chromium export 없음`);
      } catch (e) { errors.push(`${base}:${spec} — ${e.code ?? e.message}`); }
    }
  }
  console.error('Needs Install: npm i -D @playwright/test && npx playwright install — 캡처 미실행(모듈 부재).');
  console.error(`  해석 시도: ${bases.join(' / ')} (monorepo면 refs.json에 "resolveFrom": ["apps/web"] 을 적는다)`);
  return null;
}
const chromium = await loadChromium();
if (!chromium) process.exit(2);

mkdirSync(SHOTS_DIR, { recursive: true });
const log = []; // { id, 캡처불가: <사유> } — 실패 target은 링크 카드로 대체(exit 0 유지 — 일부 실패는 정상)
const cards = []; // gallery.html에 렌더할 카드 목록

const KIND_LABEL = { live: '출처 유형: live', store: '출처 유형: store-screenshot', hub: '출처 유형: curated-hub' };
const DEFAULT_USAGE = '사용 주의: 참고용(재배포 금지)';

let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  console.error('Needs Install: npx playwright install (chromium 바이너리 부재) — 캡처 미실행. 사유: ' + e.message);
  process.exit(2);
}

try {
  for (const target of targets) {
    const { id, url, kind = 'live', usage, flows } = target;
    const flowList = flows?.length ? flows : [{ name: 'page', steps: [] }];
    let targetFailed = null;
    const targetShots = [];
    // 뷰포트가 바깥 루프다 — 모바일 전용 요소는 그 뷰포트에서 조작해야 잡힌다(리사이즈 후 클릭은 타임아웃).
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
      try {
        for (const flow of flowList) {
          const page = await context.newPage();
          page.setDefaultTimeout(15000);
          const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
          // 로그인 벽·봇 차단은 예외를 던지지 않고 403/401 페이지를 그대로 렌더한다 — 상태 코드로 걸러야 «정상 캡처»로 둔갑하지 않는다.
          if (!res || !res.ok()) throw new Error(`HTTP ${res ? res.status() : 'no-response'} — 로그인 벽·봇 차단 가능`);
          // 200으로 끝나는 로그인 리다이렉트(302 → /login)도 «정상 캡처»가 되면 안 된다 — 최종 URL이 로그인 경로로 바뀌었으면 실패로 본다(휴리스틱).
          const finalUrl = page.url();
          if (finalUrl !== url) {
            const f = new URL(finalUrl);
            const loginish = /(^|[/.])(login|signin|sign-in|auth|sso)([/?#]|$)/i;
            if (loginish.test(f.pathname) || loginish.test(f.hostname)) throw new Error(`로그인 리다이렉트 — 최종 URL ${finalUrl}`);
          }
          let n = 0;
          const shoot = async () => {
            const shotPath = join(SHOTS_DIR, `${id}-${flow.name}-${n}-${vp.w}x${vp.h}.png`);
            await page.screenshot({ path: shotPath });
            targetShots.push(shotPath);
            n++;
          };
          await shoot(); // 흐름 시작 화면
          for (const step of flow.steps ?? []) {
            if (step.action === 'goto') continue; // 이미 위에서 goto 완료
            if (step.action === 'click' && step.selector) await page.click(step.selector);
            if (step.action === 'wait' && step.selector) await page.waitForSelector(step.selector);
            // fill은 지원하지 않는다 — 자격 증명 입력 경로 자체를 두지 않는다(보안).
            await shoot(); // 단계마다 1장 — «≤6 화면» 예산은 refs.json을 쓰는 쪽이 지킨다
          }
          await page.close();
        }
      } catch (e) {
        // 로그인 벽·봇 차단·타임아웃 — 정직 표기하고 그 target은 링크 카드로 대체(exit 0 유지)
        targetFailed = e.message;
      } finally {
        await context.close();
      }
      if (targetFailed) break;
    }
    const label = KIND_LABEL[kind] ?? KIND_LABEL.live;
    const use = usage ? `사용 주의: ${usage}` : DEFAULT_USAGE; // kind는 «기본값»만 정한다 — concept-only 등은 target이 덮는다
    if (targetFailed) {
      log.push({ id, 캡처불가: targetFailed });
      cards.push({ id, url, kind, type: 'link', label, usage: use, note: `캡처 불가 — ${targetFailed}` });
    } else {
      cards.push({ id, url, kind, type: 'shots', label, usage: use, shots: targetShots });
    }
  }
} finally {
  await browser.close();
}
writeFileSync(join(SHOTS_DIR, '_log.json'), JSON.stringify(log, null, 2));

// inbox/ 이미지를 user-capture 카드로 합친다
if (existsSync(INBOX_DIR)) {
  const inboxFiles = readdirSync(INBOX_DIR).filter((f) => ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(f).toLowerCase()));
  for (const f of inboxFiles) {
    cards.push({ id: basename(f, extname(f)), url: null, kind: 'user-capture', type: 'shots', label: '출처 유형: user-capture', usage: DEFAULT_USAGE, shots: [join(INBOX_DIR, f)] });
  }
}

// gallery.html — 자기완결(빌드·외부 의존 0). 썸네일 grid + 링크 카드 + 체크박스 + 메모 textarea + "선택 내보내기" → selection.json.
// 브라우저에서 "선택 내보내기"를 누르면 JSON을 화면에 낸다(정적 페이지라 파일시스템에 직접 쓸 수 없음 — 사용자가 selection.json으로 저장하거나 대화에 붙여넣는다).
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escUrl = (p) => esc(encodeURI(String(p ?? '')));
const rel = (p) => p.replace(REFS_DIR + '/', ''); // gallery.html은 REFS_DIR에 있다
// key는 카드 고유 식별자다 — id는 중복될 수 있다(후보 id와 inbox 파일명이 겹치는 경우).
const cardHtml = cards.map((c, i) => {
  const thumbs = c.type === 'shots'
    ? c.shots.map((s) => `<img src="${escUrl(rel(s))}" loading="lazy" alt="${esc(c.id)}">`).join('')
    : `<div class="link-card"><a href="${escUrl(c.url)}" target="_blank" rel="noopener">${esc(c.url)}</a><p class="note">${esc(c.note)}</p></div>`;
  return `<div class="card" data-key="${i}" data-id="${esc(c.id)}">
    <div class="thumbs">${thumbs}</div>
    <div class="meta">
      <label><input type="checkbox" class="pick"> <strong>${esc(c.id)}</strong></label>
      <div class="tags">${esc(c.label)} · ${esc(c.usage)}</div>
      <textarea class="memo" placeholder="메모 (borrow/avoid)"></textarea>
    </div>
  </div>`;
}).join('\n');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Reference Gallery</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:16px;background:#fafafa}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:8px}
.thumbs{display:flex;gap:4px;overflow-x:auto}
.thumbs img{max-height:160px;border-radius:4px}
.link-card{padding:16px;background:#f0f0f0;border-radius:4px;font-size:13px;word-break:break-all}
.note{color:#a00;font-size:12px}
.memo{width:100%;box-sizing:border-box;min-height:48px;font-size:12px}
.tags{font-size:11px;color:#666}
button{padding:8px 16px;font-size:14px;cursor:pointer}
</style></head>
<body>
<p>원하시면 추천을 요청하실 수 있어요 — 마음에 드는 화면을 고르고 메모를 남겨 주세요.</p>
<button id="export">선택 내보내기</button>
<pre id="out" style="white-space:pre-wrap;background:#eee;padding:8px;display:none"></pre>
<div class="grid">${cardHtml}</div>
<script>
document.getElementById('export').addEventListener('click', () => {
  // 메모는 «그 카드 안에서» 읽는다 — id로 찾으면 동명 카드의 첫 항목이 잡힌다.
  const picked = [...document.querySelectorAll('.card')]
    .filter((card) => card.querySelector('.pick').checked)
    .map((card) => ({ key: card.dataset.key, id: card.dataset.id, memo: card.querySelector('.memo').value }));
  const json = JSON.stringify({ selected: picked }, null, 2);
  const out = document.getElementById('out');
  out.style.display = 'block';
  out.textContent = json + '\\n\\n(이 내용을 selection.json으로 저장하거나 대화에 붙여넣어 전달하세요.)';
});
</script>
</body></html>`;
writeFileSync(GALLERY_HTML, html);
console.log(`gallery: ${GALLERY_HTML} (targets: ${targets.length}, 실패: ${log.length}, inbox: ${cards.filter((c) => c.kind === 'user-capture').length})`);
process.exit(0);
