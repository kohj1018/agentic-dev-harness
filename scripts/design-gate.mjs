#!/usr/bin/env node
// 디자인 수용 게이트 러너 (ADR-058 D3). 입력: concept/preview/prototype HTML 경로들.
// 각 파일 1280/375/320 렌더 → 320 page-overflow + populated axe(1280·320). blocker에 실패 selector 포함.
import { resolve, basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
let chromium, AxeBuilder;
try {
  // stack-guard가 까는 것은 @playwright/test(standalone playwright 아님) — playwright 우선 시도, 없으면 @playwright/test에서 chromium 회수(둘 다 chromium을 export).
  try { ({ chromium } = await import('playwright')); }
  catch { ({ chromium } = await import('@playwright/test')); }
  ({ default: AxeBuilder } = await import('@axe-core/playwright'));
} catch (e) {
  console.error('Needs Install: npm i -D @playwright/test @axe-core/playwright && npx playwright install — 게이트 미실행(모듈 부재). 사유: ' + e.message);
  process.exit(2); // 실행 불가 = skip(사유 echo). 승인 보류 여부는 호출 측(bootstrap-design)이 판단
}
// 셸이 glob을 확장하지 않는 환경(PowerShell·cmd·Codex는 concept-*.html을 리터럴로 Node에 전달) 대비 — arg에 '*'가 있으면 러너가 직접 확장한다(bash에서 이미 확장됐으면 '*' 없어 no-op).
const expandGlob = (pat) => {
  if (!pat.includes('*')) return [pat];
  const slash = Math.max(pat.lastIndexOf('/'), pat.lastIndexOf('\\'));
  const dir = slash >= 0 ? pat.slice(0, slash) : '.';
  const rx = new RegExp('^' + pat.slice(slash + 1).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  try { return readdirSync(dir).filter((f) => rx.test(f)).map((f) => (slash >= 0 ? dir + '/' + f : f)); } catch { return []; }
};
const files = process.argv.slice(2).filter((a) => !a.startsWith('-')).flatMap(expandGlob);
if (!files.length) { console.error('usage: node scripts/design-gate.mjs <html...>'); process.exit(2); }
const SHOTS = 'design-gate-shots';
rmSync(SHOTS, { recursive: true, force: true }); // 이전 실행 잔여 스크린샷 제거 — reviewer가 stale 픽셀을 읽지 않도록 결정적 초기화(재실행마다 정확히 이번 입력분만)
mkdirSync(SHOTS, { recursive: true });
const VIEWPORTS = [{ w: 1280, h: 900 }, { w: 375, h: 812 }, { w: 320, h: 720 }];
let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  // 모듈은 있으나 브라우저 바이너리 미설치 → 구조화된 exit 2(Needs Install), raw exit 1 아님(fail-closed 계약)
  console.error('Needs Install: npx playwright install (chromium 바이너리 부재) — 게이트 미실행. 사유: ' + e.message);
  process.exit(2);
}
const findings = [];
const screenshots = [];
try {
  for (const [idx, f] of files.entries()) {
    const context = await browser.newContext(); // @axe-core/playwright는 context에서 만든 page를 요구(browser.newPage() 직접 사용 시 예외)
    try {
      const page = await context.newPage();
      const name = `${idx}-${basename(f).replace(/\.html?$/i, '')}`; // idx 접두 — 동일 basename(예: M1/M2의 같은 화면명) 스크린샷 덮어쓰기 방지
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto(pathToFileURL(resolve(f)).href, { waitUntil: 'networkidle' }); // 뷰포트별 fresh 렌더 — 한 번 로드 후 resize만 하면 load-time 반응형 JS를 놓치므로 뷰포트마다 재로드
        await page.evaluate(() => (document.fonts && document.fonts.ready) ? document.fonts.ready : null).catch(() => {}); // 웹폰트 안정화(스크린샷·geometry flakiness 방지)
        // 결정적 차단 (320px 브라우저 geometry — design-workflow eval의 check-reflow-320.cjs 로직 이식, 원본 local-only): page overflow(전 뷰포트) + element viewport escape·clipped text(narrow ≤375만 — desktop 의도적 off-canvas 오탐 회피). 이 셋은 러너가 결정적으로 잡는다(design-eval 실측 검증분).
        const geo = await page.evaluate((wide) => {
          const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
          const sel = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
          // 정상 UI 오탐 제외(실브라우저 검증분):
          // (1) sr-only/visually-hidden — 1px 클립 또는 clip/clip-path (2) aria-hidden/inert/hidden 조상(닫힌 drawer·off-canvas) (3) overflow scroll/auto 조상 안(contained 가로스크롤=의도적, 예: 넓은 표)
          const srOnly = (el) => { const s = getComputedStyle(el); return (el.clientWidth <= 1 && el.clientHeight <= 1) || (s.clip && s.clip !== 'auto') || (s.clipPath && s.clipPath !== 'none'); };
          const inaccessible = (el) => el.closest('[aria-hidden="true"],[inert],[hidden]') != null;
          const inScrollable = (el) => { let p = el.parentElement; while (p && p !== document.body) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowX)) return true; p = p.parentElement; } return false; }; // 가로 escape 판정용 — *가로* 스크롤 조상만 제외(세로 전용 스크롤 조상은 가로 넘침을 담지 못하므로 escape 유효). 조상 overflow:hidden clipping 검출은 미구현 — §5.3 smoke fixture로 검증 후 추가(테스트 없이 미검증 로직 투입 금지).
          const skip = (el) => !vis(el) || srOnly(el) || inaccessible(el);
          const overflow = document.documentElement.scrollWidth > innerWidth + 1;
          let escapes = [], clips = [];
          if (!wide) {
            escapes = [...document.querySelectorAll('body *')].filter((el) => { if (skip(el) || inScrollable(el)) return false; const r = el.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).slice(0, 5).map(sel);
            // clip = overflow hidden/clip으로 *잘린* 텍스트. 의도적 text-overflow:ellipsis(정상 truncation)는 제외
            clips = [...document.querySelectorAll('h1,h2,h3,p,span,button,a,label,[data-check-text]')].filter((el) => { if (skip(el)) return false; const s = getComputedStyle(el); if (s.textOverflow === 'ellipsis') return false; const clipping = ['hidden', 'clip'].includes(s.overflowX) || ['hidden', 'clip'].includes(s.overflowY); return clipping && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1); }).slice(0, 5).map(sel);
          }
          return { overflow, escapes, clips };
        }, vp.w > 375);
        if (geo.overflow) findings.push({ file: f, viewport: vp.w, block: true, kind: 'page-overflow', selector: 'document' });
        for (const s of geo.escapes) findings.push({ file: f, viewport: vp.w, block: true, kind: 'viewport-escape', selector: s });
        for (const s of geo.clips) findings.push({ file: f, viewport: vp.w, block: true, kind: 'clipped-text', selector: s });
        // reviewer 픽셀 판정용 스크린샷 — *주관적* 판정만(위계·밀도·slop·decorative-overlap). geometry(overflow·escape·clip)는 위에서 러너가 이미 결정적으로 잡았다. 세 뷰포트 전부 캡처
        {
          const shot = join(SHOTS, `${name}-${vp.w}.png`);
          await page.screenshot({ path: shot, fullPage: true });
          screenshots.push(shot);
        }
        // 결정적 차단 #2: populated axe (파일이 실카피·실데이터 렌더 전제). WCAG 태그 명시(stack-guard 선언 wcag2aa + 2.2 AA 정합), serious/critical만 block
        if (vp.w === 1280 || vp.w === 320) {
          const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
          for (const v of res.violations) {
            const block = v.impact === 'serious' || v.impact === 'critical';
            findings.push({ file: f, viewport: vp.w, block, kind: 'axe:' + v.id, impact: v.impact, selector: v.nodes.map((n) => n.target).flat().slice(0, 5) });
          }
          for (const v of res.incomplete) findings.push({ file: f, viewport: vp.w, block: false, kind: 'axe-incomplete:' + v.id, note: '자동 판정 불가 — 수동 검토' }); // incomplete = 수동 검토 대상(보고, 비차단)
        }
      }
    } catch (e) {
      // 렌더/분석 자체가 실패한 파일은 fail-closed로 blocker 처리(전체 배치 크래시 대신 그 파일만 차단)
      findings.push({ file: f, block: true, kind: 'render-error', selector: String(e && e.message || e).slice(0, 200) });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close(); // 예외 경로에서도 chromium 프로세스 leak 방지
}
const blockers = findings.filter((x) => x.block);
console.log(JSON.stringify({ blockers, reports: findings.filter((x) => !x.block), screenshots }, null, 2));
process.exit(blockers.length ? 1 : 0);
