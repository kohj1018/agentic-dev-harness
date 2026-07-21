# 보일러플레이트 개선 실행 가이드

두 개선 백로그(`IMPROVEMENT_BACKLOG.md`의 INST-1~6, `IMPROVEMENT_BACKLOG2.md`의 RD-1·DS-1~7·HN-1~6)에서 채택된 모든 항목을 실제로 적용하기 위한 단계별 편집 지침이다. 위에서부터 순서대로 따라가면 된다. 각 단계는 **어떤 파일의 어디를 / 기존에 무엇이 있었고 / 무엇으로 바꾸는지 / 왜**를 담는다. Phase 경계와 논리 단위마다 커밋 메시지를 한 줄로 제시한다.

## 이 가이드를 쓰는 법 (먼저 읽기)

- **순서가 곧 의존관계다.** Phase 1(거버넌스 기반)을 먼저 해야 이후 ADR들이 참조할 검증 방법·링크 체커가 존재한다. Phase 3(디자인)은 Phase 4(경험 계약)가 참조하는 게이트를 먼저 놓는다.
- **날짜**: 아래 ADR amendment/신규 ADR의 날짜는 placeholder다(가이드 작성 중 `2026-07-20`·`2026-07-21`이 혼재). **실제로 커밋하는 날짜 하나로 통일해 기입**한다(placeholder를 그대로 두지 말 것). (거버넌스 스킴의 grandfather 판정용 *생성일*은 실제 ADR 생성일이므로 바꾸지 않는다 — amendment 날짜만 통일.)
- **원문 인용 규칙**: "기존:" 블록은 저장소의 현재 원문 그대로다. 편집 시 그 문자열을 찾아 "변경:"으로 교체한다. 줄번호는 참고용이며(파일이 편집되며 밀린다) 실제 매칭은 문자열로 한다.
- **커밋**: 각 커밋 메시지는 영어 Conventional Commits 한 줄이다. 제시된 위치에서 커밋한다. 커밋 전 관련 문서와 구현 범위가 일치하는지 확인한다(AGENTS.md 규율).

## 전역 거버넌스 스킴 (이번 개선의 ADR 배치 — 확정)

| 개선 | 거버넌스 처리 | 비고 |
|---|---|---|
| DS-1 · DS-3 · DS-5 | **신규 `ADR-058` (Design Workflow)** — `ADR-049`를 supersede | ADR-049 status → `superseded` |
| DS-2 · DS-5 · DS-6 · DS-7 (DESIGN.md 내용) | **`ADR-027` Amendment 7** + `## 현재 유효 결정` 갱신 | 번호 유지(최소 churn) — D6의 "재발행" 대신 amend 선택(사용자 결정). ADR-027은 이미 `## 현재 유효 결정` 보유 |
| INST-1 | **`ADR-056` Amendment 1** (PX 커버리지) | ADR-056 현재 amend 0개 |
| INST-2 | **`ADR-056` Amendment 2** (raw-hex 토큰 정의 예외) | |
| DS-4 | **`ADR-056` Amendment 3** (화면 전환 표) | |
| RD-1 | **`ADR-057` Amendment 1** (마일스톤 로드맵) | ADR-057 현재 amend 0개 |
| INST-3 | **`ADR-057` Amendment 2** (seam 기재 위치 규칙) | |
| INST-6 · INST-4a · INST-4b | **`ADR-051` Amendment 4** (fan-out 자동 판정 + 회수 규율 + PM 고정) | **amend 4개째 → `## 현재 유효 결정` 요약 섹션 신설 필수**(ADR-045 D5 — 트리거: amend 4개+ *또는* 정정/뒤집기 amend) |
| HN-4 | **`ADR-050` Amendment 1** (dispatcher 사전판정 금지) | ADR-050 현재 amend 0개 |
| HN-5 | **`ADR-010` Amendment 5** (도구별 memory 비캐노니컬) | ADR-010 현재 amend 4개 |
| HN-2 · HN-1 | **`ADR-047` Amendment 1** (변경 검증법 + 링크 체커 러너) | |
| RD-1 (graduation 영속) | **`ADR-014`** 회고 스키마 amend | MILESTONE_TEMPLATE 동반 |

- **amendment 양식** (모든 amend 공통): 헤딩 바로 위 줄에 stable anchor `<a id="adr-NNN-amend-M"></a>` → `## Amendment M (2026-07-20) — <제목>` → `### 결정`(번호 목록) → `### 적용 surface`(파일 경로 1줄 1개). 필요 시 `### 근거`(evidence label `[관측됨]`/`[외부실증]`/`[가설]`) + `### 강도 (ADR-022)`.
- **Mutation Contract (ADR-047 D3 — *enabling*, 자동 차단 0)**: D3는 enabling이라 계약/delta 누락은 reviewer **P2 보고**에 그치고 *어떤 게이트도 막지 않는다*(ADR-047 §정책강도 원문: "자동 차단 0건. 6 필드 누락 시 reviewer P2 라벨로 보고만"). 따라서 어떤 amend도 계약 누락으로 차단되지 않는다 — 아래는 그 위에서의 이번 라운드 관례일 뿐(하드 요건 아님):
  - **신규 standalone `ADR-058` = 본문에 `## Mutation Contract` full 6필드**(Target / Failure mode / Predicted improvement / Preserved invariants / Falsifying evaluation / Rollback path). Phase 12+ 신규 harness ADR이라 full이 자연스럽다. 그 "Falsifying evaluation"은 Phase 1에서 만든 방법(ADR-047 Amendment 1)을 따른다 — 그래서 Phase 1이 맨 앞이다.
  - **base에 `## Mutation Contract`가 있는 ADR(051·010·047·050·056·057 — grep 확인)의 harness amend = base 계약 승계 + `### 결정`/`### 강도`에 delta 한 줄**(failure·falsifier·rollback 축). 반전·강도변경 amend(ADR-051 amend-4가 fan-out을 enabling→constraint로 승격, ADR-057 amend-2가 seam canonical 위치를 정정)엔 특히 이 delta를 명시한다. (enabling이라 누락은 P2 — 하드 요건 아님.)
  - **base 계약이 없는 pre-047 ADR(027·014)의 amend = 새 계약을 억지로 붙이지 않는다.** ADR-047:121 "기존 ADR 사후 retrofit X (Surgical Changes)"는 *기존 본문을 소급 개조하지 말라*는 뜻이지 "신규 amend가 면제"란 뜻이 아니다 — 다만 D3가 enabling이라 신규 amend의 계약 부재는 P2에 그치고, 저장소 관례상 pre-047 ADR의 amend는 계약을 두지 않는다(ADR-027 amend-5/6·ADR-040 amend-4 실측 0개). 정책 강도를 바꾸는 pre-047 amend라면 `### 결정`에 그 사실 한 줄만 남기면 충분.
  - amend는 full 6필드를 반복하지 않는다(양식: 헤딩 anchor → `### 결정` → `### 적용 surface` (+ `### 근거`/`### 강도`)).
- **인덱스 동기**: 모든 신규 ADR/amend는 `docs/90-decisions/boilerplate/README.md` 인덱스 행의 Amendments 컬럼을 함께 갱신한다(stabilize preflight가 amend 수 불일치를 `P1 [ADR-index]`로 잡음). Phase 5에서 일괄 정리한다.

### D6 거버넌스: grandfather vs 의도적 override (정직 명시)

이번 라운드 amend 중 일부는 ADR-045 D6상 *통합 재발행/supersede* 우선 대상이다. 생성일 기준으로 **grandfather**(ADR-045 = 2026-05-27 *이전* 생성)와 **override**(이후 생성 → D6 적용)를 구분한다:

- **grandfather (amend 정당)**: `ADR-027`(2026-05-16)·`ADR-010`(2026-05-16) — D6 grandfather 조항이 재발행을 "우선 검토(권고)"로만 두므로 amend + `## 현재 유효 결정` 정리로 충분.
- **의도적 override (D6는 재발행을 요구하나 minimal-churn 적용)**: 아래는 ADR-045 *이후* 생성이라 grandfather가 아니며 D6 트리거에 해당한다. **§1.6에서 amend-count 재발행 임계를 4→8로 올렸으므로, "amend 4개 누적" 사유는 override 대상에서 제거**됐다 — 아래는 *reversal·surface-5+* 트리거만 남은 것. 이번 라운드는 사용자 minimal-churn 결정으로 amend override한다:
  - `ADR-051`(생성 2026-06-26) amend-4: #amend-2 정책 뒤집기(enabling→constraint) — **reversal** 트리거(4개 amend 사유는 §1.6로 소멸).
  - `ADR-056`(생성 2026-07-16) amend-1: **surface 5+** 추가(PX가 7 surface).
  - `ADR-057`(생성 2026-07-16) amend-1: **surface 5+** (로드맵 6 surface) + R3 의미 변경.
  - `ADR-045` amend-1 (§1.6, 재발행 임계 4→8): 재발행 임계 *자체*를 바꾸는 것은 D6상 **정책 파라미터 변경**(경계적 "정책 의미 변경")이라 엄밀히는 supersede 대상이다. **self-amend 특수성** — D6를 *완화*하는 변경을 D6가 제약하는 amend로 처리하므로(부트스트랩 역설), override임을 특히 명시적으로 남긴다. 정책의 *의미*(누적 amend가 많으면 재발행)는 유지하고 트리거 *수치*만 조정하는 enabling 변경이라 amend가 과하지 않다는 판단.
  → **각 해당 amend 본문(`### 결정` 말미 또는 `### 강도`)에** "D6 재발행 대신 minimal-churn amend — 근거: 이번 개선 라운드 결정, 다음 변경 시 통합 재발행" **한 줄을 영속 기록**한다(override 출처가 삭제될 이 가이드가 아니라 ADR에 남게 — 거버넌스 추적성). 위치는 amend마다 다를 수 있으나(예: ADR-045 amend-1은 `### 결정`, ADR-056 amend-1은 `### 강도`, ADR-051 amend-4는 별도 거버넌스 주 callout) *ADR 본문 어딘가에 반드시 영속*되면 된다.
- **대안(strict D6)**: override가 부담스러우면 위 override 대상들(콘텐츠 ADR 051·056·057)을 각각 신규 번호로 통합 재발행(supersede)하고 참조를 re-point한다 — 단 각 ADR#dK 인용이 많아 churn이 커서 "minimal-churn" 취지와 상충한다. (ADR-045 self-amend의 strict 대안은 *ADR-045 자체를 supersede*하는 신규 doc-reference-contract ADR 발행이다 — 콘텐츠 ADR 재발행과 별개 축.) **어느 쪽을 택할지는 사용자 결정**(기본은 override — 사용자가 minimal-churn 선택).

## 착수하지 않는 항목 (명시 — 누락 아님)

아래는 백로그에서 **보류/측정 숙제/폐기**로 판정돼 이 가이드에 편집 단계를 두지 않는다. 나중에 "왜 이건 안 했나" 헷갈리지 않도록 근거를 남긴다.

- **INST-4(관찰)** — 하청이 최종 보고 직전 멈추는 현상. 회수 규율(재시도→직접 확인)은 채택해 Phase 2에서 문서화하지만, **멈춤의 근본 원인(모델 turn 한계·런타임 종료 추정)이 불확실**하므로 위임 문서를 더 손대지 않고 관찰만 유지한다.
- **INST-5** — 디자인 조사·시안 검토 하청 생략. 스킬은 이미 부르라고 돼 있어 **규칙 문제 아님**(깨끗한 별도 세션 재측정 숙제).
- **기타 미검증 3건** — Codex 동일 흐름 / fresh 세션 자동 로드 / 큰 작업 정식 fan-out 실측. 별도 세션 필요, 재측정 숙제.
- **HN-3** — 형제 스킬 혼동. 설명문이 이미 상당히 구분돼 **실제 오호출 재현 시에만** 착수(지금은 보류).
- **백로그 문서 정규화(PH-0)** — 두 백로그는 곧 삭제할 세션 메모라 정규화 편집은 무의미(이 가이드가 그 내용을 정책으로 옮긴다).

---

# Phase 1 — 거버넌스 기반 (HN-2 + HN-1)

**왜 먼저**: 이후 모든 harness ADR은 `## Mutation Contract`의 "Falsifying evaluation" 필드가 필요한데, 그걸 *어떻게 쓰는지*가 HN-2다. 그리고 HN-1의 링크 체커는 HN-2가 지목하는 검증 러너이자, Phase 3~5에서 대량 편집한 문서 링크가 안 깨졌는지 마지막에 확인하는 도구다.

## 1.1 문서 링크·앵커 무결성 체커 신설 (HN-1)

**기존**: `scripts/`에는 `README.md` 하나뿐이고 실행 스크립트가 0개다. 문서를 옮기거나 이름을 바꾸면 상대 링크·`#anchor`가 조용히 죽고, 에이전트가 죽은 경로로 안내받아 헛돌거나 없는 내용을 지어낸다(최근 커밋에 ADR 리네임·문서 삭제가 많았음).

**변경**: 아래 내용으로 새 파일 `scripts/check-doc-links.mjs`를 만든다. Node ESM(Claude·Codex 공통), 외부 의존 0(Node 내장 `fs`/`path`만). 저장소 전 `.md`의 상대 링크·`#anchor`가 실제 파일/헤딩(또는 `<a id>`)을 가리키는지 검사하고, 죽은 것을 "파일:줄 → 죽은 경로"로 출력하며 하나라도 있으면 exit code 1. `--frontmatter` 모드는 스킬 SKILL.md의 `name:`/`description:` frontmatter 존재를 검사한다(HN-6b 흡수).

> **지원 범위 (정직 명시 — "전수"의 경계)**: inline `[텍스트](경로#anchor)` 링크 + `<a id>` 앵커 + GFM heading 슬러그(중복 -1/-2 접미)만 검사한다. **미지원**: reference-style `[x][y]` 링크·HTML `<a href>`·`~~~` 코드펜스·중첩 괄호 URL. 현재 저장소는 이 미지원 형식을 **쓰지 않으므로**(grep 확인 — docs/ 전체 0건) 실질적으로 전수 검사지만, 그 형식을 도입하는 fork는 이 체커를 확장해야 한다(그때까지 이 4종은 검사 사각지대).

**오탐 방지가 핵심**(아래 스크립트가 이미 반영): ① `<!-- -->` 주석 + **코드펜스(```` ``` ````) + 인라인코드(`` ` ``)** 안의 예시 링크는 공백 처리해 검사 대상에서 뺀다(줄번호는 보존). ② `DESIGN_RESEARCH.md`·`ROADMAP.md`·`design-preview.html`·`prototypes/`·`reports/` 등 **generated/ephemeral 타깃**은 아직 없어도 dead로 잡지 않는다. ③ 임시 세션 문서(이 가이드·백로그류)는 **런타임 `--ignore`로만** 스캔 제외 — **영구 스크립트엔 그 파일명을 박지 않는다**(삭제될 문서를 영구 코드가 참조하면 안 됨). *개선 적용 중* 실행: `node scripts/check-doc-links.mjs --ignore IMPROVE-GUIDE.md,IMPROVEMENT_BACKLOG.md,IMPROVEMENT_BACKLOG2.md`(세 파일이 아직 존재·예시 링크 다수). *완료 후* 그 파일들을 지운 뒤엔 flag 없이 돌린다. — 이 규칙들이 없으면 현재 저장소에서 **27건 오탐 → exit 1**(실측 확인). Node 미설치 환경은 §1.3의 fallback으로 대체.

```javascript
#!/usr/bin/env node
// 문서 상대링크·앵커 무결성 체커 (ADR-047#amend-1 변경 검증 러너). 외부 의존 0 — Node 내장만.
// (위 ADR-047 참조는 이 파일이 ADR-047 ## Surfaces에 등재돼 stabilize [Surface-backref] forward-check가 역참조를 요구하기 때문 — design-gate.mjs의 "(ADR-058 D3)"와 동형.)
// 사용:
//   node scripts/check-doc-links.mjs            # 모든 .md의 상대링크·#anchor 검사
//   node scripts/check-doc-links.mjs --frontmatter   # + 스킬 SKILL.md frontmatter(name/description) 검사
//   node scripts/check-doc-links.mjs --ignore a.md,b.md   # 특정 basename 검사 제외(예: 임시 세션 문서)
// 죽은 링크/앵커가 하나라도 있으면 exit 1.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, extname, basename } from 'node:path';

const ROOT = resolve(process.cwd());
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage']);
// 검사 제외 파일 basename — 런타임 `--ignore a.md,b.md`로만 지정(삭제될 임시 문서명을 영구 스크립트에 박지 않는다). 기본값 없음.
const IGNORE_FILES = (() => { const i = process.argv.indexOf('--ignore'); return new Set(i >= 0 && process.argv[i + 1] ? process.argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : []); })();
// generated/ephemeral 타깃(아직 없거나 회차마다 생김) 은 dead 로 잡지 않는다
const IGNORE_TGT = [/DESIGN_RESEARCH\.md$/, /ROADMAP\.md$/, /design-preview\.html$/,
  /\/(design-concepts|prototypes|reports|plan-reviews|discovery-reviews|stabilize-reviews|visual)\//];
const wantFrontmatter = process.argv.includes('--frontmatter');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (extname(p) === '.md' && !IGNORE_FILES.has(basename(p))) out.push(p);
  }
  return out;
}

// HTML 주석·코드펜스·인라인코드를 공백 치환(줄번호 보존). 백틱은 \x60(hex) — 이 가이드 코드펜스와 충돌 방지
function blankOut(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\x60\x60\x60[\s\S]*?\x60\x60\x60/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\x60[^\x60\n]*\x60/g, (m) => m.replace(/[^\n]/g, ' '));
}

// GitHub 스타일 heading slug (유니코드 글자 보존, 문장부호 제거, 공백→하이픈)
function slug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

// 파일의 앵커 집합: <a id="X"> + heading slug. *둘 다* 코드 제거된 본문(body)에서만 뽑는다
// (펜스/인라인코드 안 가짜 heading·가짜 <a id> 예시 배제 — 그런 앵커를 실재로 인정하면 죽은 앵커를 놓친다) + GFM 중복 heading -1/-2 접미
function anchorsOf(content) {
  const set = new Set();
  const body = blankOut(content);
  for (const m of body.matchAll(/<a\s+id="([^"]+)"\s*>/g)) set.add(m[1]); // body(펜스 blank) — 펜스 안 예시 <a id>는 실앵커로 세지 않음
  const counts = {};
  for (const m of body.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
    const base = slug(m[1]);
    const n = counts[base] = (counts[base] ?? -1) + 1;
    set.add(n === 0 ? base : `${base}-${n}`);
  }
  return set;
}

const files = walk(ROOT);
const anchorCache = new Map();
function getAnchors(file) {
  if (!anchorCache.has(file)) anchorCache.set(file, anchorsOf(readFileSync(file, 'utf8')));
  return anchorCache.get(file);
}

const problems = [];
const linkRe = /\[[^\]]*\]\(([^)]+)\)/g; // [text](target)

for (const file of files) {
  const stripped = blankOut(readFileSync(file, 'utf8')); // 코드 안 예시 링크 오탐 방지(위 blankOut — 주석·펜스·인라인코드 공백화)
  for (const m of stripped.matchAll(linkRe)) {
    let target = m[1].trim().split(/\s+/)[0]; // "path "title" 형태의 title 제거
    if (/^(https?:|mailto:|tel:)/i.test(target)) continue; // 외부 링크 skip
    const lineNo = stripped.slice(0, m.index).split('\n').length;
    const [pathPart, anchor] = target.split('#');
    if (pathPart === '') {
      // 같은 파일 앵커
      if (anchor && !getAnchors(file).has(anchor)) {
        problems.push(`${relative(ROOT, file)}:${lineNo} → 죽은 앵커 #${anchor} (같은 파일)`);
      }
      continue;
    }
    const resolved = resolve(dirname(file), pathPart);
    const exists = existsSync(resolved);
    // generated/ephemeral 타깃은 *아직 없을 때만* 무시 — 생성된 뒤엔 정상 검사(미래 실제 dead link도 잡음)
    if (!exists && IGNORE_TGT.some((re) => re.test(pathPart))) continue;
    if (!exists) {
      problems.push(`${relative(ROOT, file)}:${lineNo} → 죽은 경로 ${pathPart}`);
      continue;
    }
    if (anchor && extname(resolved) === '.md') {
      if (!getAnchors(resolved).has(anchor)) {
        problems.push(`${relative(ROOT, file)}:${lineNo} → ${pathPart} 에 앵커 #${anchor} 없음`);
      }
    }
  }
}

if (wantFrontmatter) {
  for (const base of ['.claude/skills', '.agents/skills']) {
    const dir = join(ROOT, base);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      const skill = join(dir, name, 'SKILL.md');
      if (!existsSync(skill)) continue;
      const c = readFileSync(skill, 'utf8');
      const fm = c.startsWith('---') ? c.slice(3, c.indexOf('\n---', 3)) : '';
      if (!/^name:\s*\S/m.test(fm) || !/^description:\s*\S/m.test(fm)) {
        problems.push(`${base}/${name}/SKILL.md → frontmatter name/description 누락`);
      }
    }
  }
}

if (problems.length) {
  console.error(`문서 링크·앵커 문제 ${problems.length}건:`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`OK — 검사한 .md ${files.length}개, 죽은 링크·앵커 0건`);
```

**왜**: Node 내장만 쓰므로 스택·OS 무관하게 즉시 실행 가능하고, HN-2의 falsifying-eval 러너로도 재사용된다. 백로그 3차 정정대로 "스킬 5개 누락"은 오류였으므로(의도적 자연어 호출 스킬 + preflight 7이 이미 roster 검사) roster 검사는 새로 만들지 않고 링크 무결성만 새로 더한다.

## 1.2 scripts/README.md 갱신 (HN-1)

**기존** (`scripts/README.md` 앞부분 — 이 뒤로 "예시:" 스택별 목록이 더 있으나 편집과 무관):

```
# scripts

이 디렉터리는 프로젝트별 자동화 스크립트를 두는 자리다.

기본 보일러플레이트에서는 OS/셸/런타임 종속성을 피하기 위해
공유 스크립트를 강제로 포함하지 않는다.

권장 방식:
- 프로젝트의 스택이 정해진 뒤
- 그 스택에 맞는 검증 스크립트, hook 스크립트, CI 스크립트를 생성한다
```

**변경**: 파일 전체를 교체하지 말 것 — **삽입만** 한다. "공유 스크립트를 강제로 포함하지 않는다." 로 끝나는 문단 *바로 다음*(그 아래 빈 줄과 "권장 방식:" 사이)에 아래 블록을 넣는다(스택 무관 Node 내장 스크립트는 예외임을 명시):

```
> 예외: `check-doc-links.mjs`는 스택·OS 무관(Node 내장만)이라 보일러플레이트가 기본 포함한다 —
> 모든 `.md`의 상대링크·`#anchor` 무결성을 검사한다(문서 이동 시 죽은 경로 사전 차단).
> 실행: `node scripts/check-doc-links.mjs` (frontmatter까지: `--frontmatter`).
```

**왜**: 현행 README의 "강제 포함 안 함" 스탠스와 새 checker가 충돌하지 않게, Node 내장 스크립트만 예외임을 명문화.

## 1.3 stabilize-milestone preflight에 링크 체커 연결 (HN-1)

**기존** (`.claude/skills/stabilize-milestone/SKILL.md` §1.0 항목 1, 발췌):

```
1. **docs/ 내부 markdown link 유효성** (기본: *내부 / ADR 참조 / 로컬 파일* 만 점검 — 외부 URL 검사는 optional):

   - **기본 (내부 link only — deterministic 보장)**: `markdown-link-check --config <(echo '{"ignorePatterns":[{"pattern":"^https?://"}]}') docs/**/*.md` (외부 URL 무시).
```

**변경**: 이 항목 1의 "기본" 줄 바로 위에, repo-local checker를 1순위로 쓰라는 한 줄을 넣는다("기본" 불릿을 다음으로 교체):

```
   - **기본 (repo-local checker — deterministic·의존 0)**: `node scripts/check-doc-links.mjs` 실행(모든 `.md`의 상대링크·`#anchor`가 실제 파일/헤딩/`<a id>`를 가리키는지 검사, exit 1 on 실패). 이 스크립트가 항목 2의 내부 anchor 링크(ADR-045#d9)까지 함께 커버한다. 외부 URL·flaky 네트워크 검사는 아래 optional.
   - **(fallback) markdown-link-check** (checker 미가용 시): `markdown-link-check --config <(echo '{"ignorePatterns":[{"pattern":"^https?://"}]}') docs/**/*.md` (외부 URL 무시).
```

**왜**: 기존 preflight는 외부 npm 도구(`markdown-link-check`)에 의존해 미설치 시 통째로 skip됐다. repo-local checker를 1순위로 두면 의존 없이 항상 돈다. roster 검사(항목 7)는 이미 결정적이라 손대지 않는다.

## 1.4 ADR-047 Amendment 1 — 변경 검증법 (HN-2)

**기존**: `docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md`의 D3(6필드)·D4(falsifying eval default = ADR-017 dogfood 재실행)는 *무엇을 적어야 하는지*만 정하고, **그 falsifying evaluation을 어떻게 값싸게 만드는지 방법이 없다**. 그래서 실제로는 "검증했다"고 글로만 적고 넘어간다. `## 참고` 다음이 파일 끝이며 amendment는 0개다.

**변경**: 파일 맨 끝(`## 참고` 뒤)에 Amendment 1을 추가한다:

```
<a id="adr-047-amend-1"></a>
## Amendment 1 (2026-07-20) — 변경 검증법 (falsifying evaluation을 값싸게 만드는 방법)

### 배경
- [관측됨] D3/D4는 falsifying evaluation을 *의무화*했으나 *만드는 방법·러너*가 없어, 실제로는 "검증함"을 산문으로만 적고 넘어갔다(문서 전수 확인).
- [외부실증] 규칙 문구 실패는 두 종류다 — **규율 실패**(모델이 규칙을 무시)와 **모양 실패**(모델이 규칙을 따르려 하나 출력 형태가 틀림). superpowers 실측: *금지문("~하지 마라")*은 규율 실패엔 유효하나 **모양 실패엔 오히려 역효과**(대조군보다 나쁜 출력)이며, 모양 실패는 "이렇게 해라" 긍정 레시피로 고쳐야 한다.

### 결정
1. **실패 유형 분류 먼저**: harness 문구를 바꾸기 전에 막으려는 실패가 *규율 실패*인지 *모양 실패*인지 분류한다. 규율 실패 → 금지문 OK. 모양 실패 → 금지문 금지, 긍정 레시피("이 입력이면 이렇게 출력")로 작성.
2. **대조군을 둔 초저비용 문구 테스트를 기본 falsifying evaluation으로**: 바꾼 문구가 실제로 행동을 바꿨는지, *바꾸기 전 문구(대조군)* 대비 소수(≈5회) 시행으로 비교한다. 비싼 전체 dogfood 재실행(D4 default) 전에 이 값싼 테스트를 먼저 통과해야 한다.
3. **정적 검사 vs 행동 fixture 분리**:
   - *정적 검사*(링크·앵커·roster·frontmatter 등 결정적으로 판정 가능한 것)는 `scripts/check-doc-links.mjs`(+ stabilize preflight)를 러너로 지목한다 — 이 스크립트를 falsifying evaluation의 결정적 부분으로 쓴다.
   - *행동 fixture*(스킬이 특정 입력에 특정 판정을 내리는지)는 드리프트 잦은 소수 스킬(validate-*·bootstrap-stack 등)에 한해 "이 입력 → 이 판정" 예시 3~5개를 **사람이 확인하는 체크리스트**로 둔다(자동 실행 X — 스킬은 여러 파일·상태를 다뤄 자동화 불가, 21개 파일화 금지).
4. D4의 dogfood 재실행 default는 유지하되, 본 Amendment의 값싼 테스트가 그 *앞단 게이트*임을 명시.

### 적용 surface
- docs/90-decisions/boilerplate/_ADR_GUIDE.md
- scripts/check-doc-links.mjs
- .claude/skills/stabilize-milestone/SKILL.md

### 강도 (ADR-022)
- enabling(약) — 방법·러너 명시. 자동 차단 없음.
```

**왜**: 우리 스스로 의무화한 필드에 실체를 준다. 외부 레포 3개(superpowers 방법론·remotion 러너·marketing-skills 픽스처)가 독립적으로 이 구멍을 지목했다.

## 1.5 _ADR_GUIDE.md 포인터 (HN-2)

**기존** (`docs/90-decisions/boilerplate/_ADR_GUIDE.md` 마지막 섹션):

```
## Harness Mutation Contract (ADR-047)

본 ADR이 `.claude/skills` / `.claude/agents` / `AGENTS.md` / `.agents/skills` / `.codex/config.toml` / lifecycle ADR 중 *어느 하나라도* 수정한다면 ([ADR-047](ADR-047-code-as-agent-harness.md) D3 대상 surface), 본문에 `## Mutation Contract` 섹션 6 필드(Target / Failure mode / Predicted improvement / Preserved invariants / Falsifying evaluation / Rollback path)를 명시한다. ADR-022와 양립 — evidence label은 그대로, Mutation Contract는 변경 governance 양식.
```

**변경**: 이 문단 끝에 한 줄을 덧붙인다:

```
- **"Falsifying evaluation" 필드 작성법**: 실패 유형(규율 실패→금지문 / 모양 실패→긍정 레시피)을 분류하고, 대조군을 둔 초저비용 문구 테스트를 기본 검증으로 삼는다. 정적 검사는 `scripts/check-doc-links.mjs`를 러너로, 행동 fixture는 소수 스킬 사람-확인 체크리스트로 (상세: [ADR-047](ADR-047-code-as-agent-harness.md)#amend-1).
```

**왜**: ADR-047 본문이 SSOT이고, _ADR_GUIDE는 한 줄 포인터만 둔다(문서 비대 방지).

## 1.6 ADR-045 Amendment 1 — D6 통합 재발행 임계 4→8 상향 (사용자 결정)

**왜 먼저**: 이 규칙 상향이 뒤 Phase의 override 판단에 영향을 주므로 Phase 1(거버넌스 기반)에서 먼저 반영한다.

**배경**: D6는 "개정(amend) **4개 이상** 누적 → 통합 재발행"을 요구한다. 그러나 D5가 amend 4개+에서 `## 현재 유효 결정` 요약을 이미 의무화해 *가독성은 그 요약이 담당*한다 — 4개는 요약 도입 전 기준이라 과하게 낮다. 재발행은 요약이 있어도 탐색이 실제로 힘들어지는 수준(≈8)에서만 강제한다.

**변경 (a) — D6 표 행은 *그대로 둔다* (append-only Record — ADR-051 선례)**.

ADR은 Record라 원 결정 텍스트를 덮어쓰지 않는다(convention 확인: ADR-051은 corrective amendment에서도 원 `## 결정`을 유지하고 변경을 Amendment에만 기록 — STRUCTURE.md#l12 ADR=Record). 따라서 ADR-045 D6 표의 다음 행은 **손대지 않는다**:

```
| 개정(amend) 4개 이상 누적 | 통합 재발행(supersede)로 클린 ADR 재작성. 구 ADR은 `superseded`로 history 잔존 |
```

4→8 변경은 아래 **(d) Amendment 1**(신규 규칙 기록)과 **(b) `## 현재 유효 결정`**(net 현재 규칙 = 8)이 담당한다 — 원 표 행(4)은 historical Record로 남고, D5 fast-path 요약과 Amendment가 현재 규칙(8)을 전달한다(D5 설계: 상단 요약=빠른 현재-규칙 경로, 본문 표=역사; body-vs-amendment 분기는 append-only의 정상 상태).

**변경 (b) — 상단 `## 현재 유효 결정` 요약 줄**.

**기존**:

```
- amend는 작게 유지. 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가·개정(amend) 4개 이상 누적은 신규 supersede ADR로 간다(ADR-045 이후 *신규 변경* 기준 — 기존 ADR은 grandfather, D6).
```

**변경**:

```
- amend는 작게 유지. 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가는 신규 supersede ADR로 간다. 개정(amend) 8개 이상 누적도 통합 재발행(4~7개는 D5 요약으로 충분 — #amend-1로 4→8 상향). (ADR-045 이후 *신규 변경* 기준 — 기존 ADR은 grandfather, D6.)
```

**변경 (c) — `docs/90-decisions/boilerplate/_ADR_GUIDE.md`**.

**기존**:

```
- 개정(amend) 4개 이상 누적 → 통합 재발행(supersede)로 클린 ADR 재작성, 구 ADR은 `superseded`로 잔존.
```

**변경**:

```
- 개정(amend) 8개 이상 누적 → 통합 재발행(supersede)로 클린 ADR 재작성, 구 ADR은 `superseded`로 잔존. 4~7개는 `## 현재 유효 결정` 요약(D5)이 가독성 담당(재발행 불요 — ADR-045#amend-1).
```

**변경 (d) — ADR-045 파일 맨 끝에 Amendment 1 추가**.

```
<a id="adr-045-amend-1"></a>
## Amendment 1 (2026-07-21) — D6 통합 재발행 임계 4→8 상향

### 결정
D6의 "개정(amend) 4개 이상 누적 → 통합 재발행" 임계를 **8개 이상**으로 올린다. 근거: D5가 amend 4개+에서 `## 현재 유효 결정` 요약을 의무화해 **4~7개 구간의 가독성을 이미 담당**하므로, 하드 재발행 캡은 요약이 있어도 탐색이 힘들어지는 수준(≈8)에 두는 게 맞다. (원래 '4'는 ADR-045 첫 커밋부터 **D5 요약 의무화 임계와 같은 값으로 함께 설정된** 초기 보수값이다 — D5 도입과 선후 관계가 아니라 동시 설정. 실사용상 과소로 판단해 상향.) **정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가 트리거는 불변** — 그건 *변경 규모* 기준이지 *누적* 기준이 아니다.

거버넌스 주: 재발행 임계 자체를 바꾸는 것은 D6상 경계적 "정책 의미 변경"이라 엄밀히는 supersede 대상이나, 정책의 *의미*는 유지하고 트리거 *수치*만 조정하는 enabling 변경이므로 이번 라운드 minimal-churn 결정에 따라 amend로 처리한다(D6 재발행 대신 minimal-churn amend — 근거: 이번 개선 라운드 결정, 다음 변경 시 통합 재발행).

### 적용 surface
- docs/90-decisions/boilerplate/ADR-045-doc-reference-contract.md (`## 현재 유효 결정` 요약 — D6 표 원행은 Record로 *보존*, 덮어쓰지 않음)
- docs/90-decisions/boilerplate/_ADR_GUIDE.md (amend/supersede 기준 줄 — 운영 가이드라 현재 규칙 반영)

### 강도 (ADR-022)
- enabling(약) — 임계 조정, 되돌리기 쉬움.
```

**변경 (e) — `[ADR-index]` preflight 오탐 차단 (F2)**. ADR-045 `### D2` 예시 블록 안에 리터럴 `## Amendment 1 — ...`(anchor `adr-027-amend-1`)이 있다. stabilize `[ADR-index]` preflight는 `## Amendment N` 헤딩 수 ↔ README Amendments 컬럼을 대조하는데, 코드펜스를 무시하지 않으면 이 *예시* 헤딩까지 세어 README와 어긋난다(실제로 amend-1 추가 전인 지금도 "예시 1 vs README 0"으로 잠복 중; amend-1 추가 후엔 "2 vs 1"). 경고 문구만으론 안 고쳐지므로 둘 다 손본다:

**(e-1)** ADR-045 D2 예시 헤딩을 숫자 없는 placeholder로 바꿔 리터럴 충돌을 제거한다.

기존:
```
<a id="adr-027-amend-1"></a>
## Amendment 1 — ...
```
변경:
```
<a id="adr-027-amend-M"></a>
## Amendment <M> — ...
```
(D2 본문 규칙 "anchor id 규칙: `adr-<번호>-amend-<M>`"과 일관된 예시가 된다.)

**(e-2)** stabilize `[ADR-index]` preflight를 fence-aware로 만든다. `.claude/skills/stabilize-milestone/SKILL.md`의 인덱스 동기 항목 문구를 "본문 `## Amendment N` 수 일치"에서 **"코드펜스(```)·`<!-- -->` 주석 *밖의* 본문 `## Amendment N` 수 일치(예시·주석 헤딩 제외 — `check-doc-links.mjs` blankOut과 동일 원칙)"** 로 바꾼다. 그래야 앞으로 어떤 ADR이 D2류 예시를 둬도 오탐이 없다.

**왜**: 4개는 (D5 요약 의무화 임계와 같은 값으로 첫 커밋부터 함께 설정된) 초기 보수값으로, D5 요약이 4~7 구간 가독성을 담당하는 지금 기준으론 과소다. 8로 올리면 **ADR-051(4 amends)의 *amend-count* 재발행 트리거가 사라진다**(→ 아래 §2.1의 override 근거가 "reversal(정책 뒤집기)"만 남음). surface-5+·reversal 트리거는 그대로라 ADR-056(7 surface)·ADR-057(6 surface+정책변경) override는 유지된다.

> **커밋 (Phase 1 종료)**:
> `feat(governance): raise D6 reissue threshold (ADR-045 amend 1), add doc link checker + change-verification method (ADR-047 amend 1)`

---

# Phase 2 — 오케스트레이션·위임 규율 (INST-6 · INST-4a · INST-4b · HN-4 · HN-5 · HN-6c)

작고 서로 독립적인 규율들이다. Phase 1 뒤, Phase 3(디자인) 앞에 둔다.

## 2.1 ADR-051 Amendment 4 + `## 현재 유효 결정` 신설 (INST-6 · INST-4a · INST-4b)

**기존**: `docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md`는 amendment 3개(현재 4개째가 없음)이고 `## 현재 유효 결정` 요약 섹션이 **없다**. Amendment 2 근거(L114)가 명시적으로 *"팬아웃 강제 강화는 하지 않는다"*라고 선언했고, D2 fan-out은 정책 강도상 enabling(약)이다.

**변경 (a) — `## 현재 유효 결정` 신설**: amend가 4개째가 되므로 ADR-045 D5에 따라 요약 섹션이 **필수**다. `## Status` 섹션(값 `accepted`) 바로 아래에 다음을 삽입한다:

```
## 현재 유효 결정
- implement는 foreman(메인 세션)이 운전 — `## 3` step 파일 경로로 file-disjoint slice를 나눠 병렬 builder, 작거나 겹치면 단일/순차(D1·#d6).
- validate/stabilize는 report-only fan-out. **inline vs fan-out은 dispatch 전 파일·줄 수 기계 계산으로 결정** — 임계 초과 시 inline 재량 0, inline 강행은 `## Orchestration`에 계산값+사유 명시(#amend-4가 #amend-2를 이 축에서 뒤집음).
- plan de-fork + plan-milestone 신설, ADR-038 wave(#d3/#d6)·write_set 5필드 제거(D5).
- 하청이 구조화 반환 없이 멈추면 foreman/dispatcher가 1회 재개→실패 시 파일 직접 회수(always-verify, #amend-4).
- 위임 시 프로젝트 패키지 매니저 고정 — builder는 지정된 PM만 실행(#amend-4).
- 공유 런타임 리소스 partition 가드(#amend-1), validate orchestration 관측 기록(#amend-2), D4 범위 M1 통일(#amend-3).
```

**변경 (b) — Amendment 4 추가**: 파일 맨 끝에 추가한다:

```
<a id="adr-051-amend-4"></a>
## Amendment 4 (2026-07-20) — fan-out 크기 판정 기계화 + 하청 정지 회수 + 패키지 매니저 고정

### 배경
- [관측됨] SIMULATION_RUN Round 4 — T-002(10파일 +249/-380 = 629줄)가 small-diff 임계를 명백히 초과했는데 "단일 vertical slice"라는 실행자 판단으로 inline 처리됐다(경계 판단 오용). 뒤늦게 fan-out 오케스트레이션 패턴으로 재검증하니 inline이 놓친 P1 2건([Doc-code-mismatch]·[Repair-bookkeeping-gap])이 검출됐다. #amend-2의 "경계값은 메인 세션 판단" 문구가 명확한 규칙을 우회하는 핑계가 됐다.
- [관측됨] 서브에이전트가 구조화 최종 반환 전 중간 사고 문장에서 정지하는 패턴 5+건(빌더 2·qa 1·validator 1은 빈 반환) — foreman이 재개·직접 회수로 매번 챙겼으나 규범 문서엔 없었다.
- [관측됨] builder가 npm 프로젝트에서 무심코 `pnpm`을 실행해 stray `pnpm-lock.yaml` 생성.

### 결정
1. **fan-out 크기 판정 기계화**: validate-workitem의 inline vs fan-out은 dispatch 전 계산한 값으로 결정한다 — 변경 파일 수 F, 줄 합계 L(`git status --porcelain`; tracked=`git diff HEAD`, untracked=파일 전체). inline 허용은 **(L≤50) 또는 (F≤2 그리고 L≤200)**, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상 명백히 해당없음 — 셋 다 충족일 때만. 하나라도 미충족이면 **fan-out 필수(inline 재량 0)**. 조건 충족 시에도 inline을 택했으면 `## Orchestration`에 F·L과 "임계 미달"을 기록. **임계 초과인데 inline이면 그 자체가 규칙 위반**(산출물로 반증 가능). #amend-2의 "팬아웃 강제 강화 안 함"을 *이 축에 한해* 뒤집는다.
2. **하청 정지 회수 규율**: foreman/dispatcher는 위임한 서브에이전트가 구조화 최종 반환 없이 멈추면 1회 재개(예: SendMessage) → 그래도 미반환이면 그 에이전트가 건드린 파일을 직접 열어 결과를 회수한다(always-verify). "결과 없음"을 조용히 통과시키지 않는다. *멈춤의 근본 원인은 모델/런타임 행동으로 추정되어 불확실하므로, 위임 프롬프트 문구를 더 늘리지 않고 회수 규율만 둔다*(원인 확정 전 과잉 문구 금지).
3. **패키지 매니저 고정**: implement preflight에서 프로젝트 패키지 매니저를 확인하고(STACK_SETUP_PLAN 기록 또는 lockfile 존재로), builder dispatch payload에 명시한다. builder는 그 PM만 실행하고 다른 PM을 실행하지 않는다.

### 근거
- [관측됨] 위 3건 전부 SIMULATION_RUN Round 4 실측.

### 강도 (ADR-022)
- **결정 1(fan-out 크기 판정)은 constraint(강)로 승격** — #amend-2 D2의 enabling에서 올린다(큰 변경에서 검증 누락은 파괴적, 실측으로 효과 입증). 결정 2·3은 enabling(약).

### 적용 surface
- .claude/skills/validate-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/agents/builder.md
- docs/00-meta/DELEGATION_STRATEGY.md
```

> **거버넌스 주의 (ADR-045 D6 — 의도적 override + 검증)**: amend-4는 #amend-2의 "팬아웃 강제 강화 안 함"을 *뒤집는다*(fan-out 크기 판정 enabling→constraint) — D6의 **"기존 결정 뒤집기(reversal)" 트리거**에 해당해 통합 재발행 대상이다. (§1.6에서 amend-count 재발행 임계를 4→8로 올렸으므로 "4번째 amend"는 더 이상 트리거가 아니다 — 남는 건 *reversal* 하나. 단 amend 4개라 D5 `## 현재 유효 결정` 요약은 여전히 필수 — 위 변경(a).) **ADR-051은 grandfather가 아니다**(2026-06-26 생성 > ADR-045 2026-05-27 — grandfather는 ADR-045 *이전* 생성 ADR(예: ADR-027·010)만). 따라서 D6는 이 reversal에 통합 재발행을 요구한다. 이번 개선 라운드는 사용자 **minimal-churn 결정**으로 이를 *의도적으로 override*하여 amend로 처리한다 — **override 근거는 (삭제될 이 가이드가 아니라) 본 amend `### 결정` 말미에 "D6 reversal 재발행 대신 minimal-churn amend 적용 — 근거: 이번 라운드 결정, 다음 변경 시 ADR-051 통합 재발행" 한 줄로 영속 기록**한다. (전면 재발행을 원하면 §전역 거버넌스의 대안 경로 참조.) **검증(ADR-047#amend-1)**: 이 기계 판정이 실제로 놓친 결함을 잡는지는 SIMULATION_RUN 재실행(대조군=구 inline 재량)으로 확인 — falsifying eval은 ADR-051 base Mutation Contract를 승계하되 이 축의 반증 신호("임계 초과 diff를 inline으로 보내 P0 누락")를 추가 관찰.

**왜**: "규칙은 있는데 실행자가 우회 가능"한 구조를 없앤다. 크기 판정을 계산으로 확정하고 예외를 기록으로 강제하면 재량 우회가 불가능해진다.

## 2.2 validate-workitem — 크기 판정 기계화 (INST-6)

**변경 (frontmatter) — 크기 계산 도구 권한 (실행 가능성)**: 아래 recipe는 `git diff`·`git status`(이미 allowed) 외에 untracked 줄 수 집계에 `wc`를 쓴다. `.claude/skills/validate-workitem/SKILL.md`의 `allowed-tools`엔 `Bash(git diff *)`·`Bash(git log *)`·`Bash(git status *)`만 있고 `Bash(wc *)`가 **없다** → recipe가 실행 불가다. `allowed-tools` 끝에 `Bash(wc *)`를 추가한다(git-bash `wc`; wc가 없는 환경이면 대체로 `git diff --no-index --numstat -- /dev/null <file>`가 untracked 줄 수를 주고 이건 이미 `Bash(git diff *)`로 허용됨).

**기존** (`.claude/skills/validate-workitem/SKILL.md` — small-diff fallback 기준 줄):

```
     - **small-diff fallback 기준** (cost guard): `git status --porcelain` 변경 파일 집합의 줄 합계(tracked 변경은 `git diff HEAD` 줄 수, untracked 신규 파일은 파일 전체 줄 수) ≤ 50, *또는* (변경 파일 ≤ 2 *이고* 줄 합계 ≤ 200), *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음이면 팬아웃을 건너뛰고 단일 inline validator로 수행한다(휴리스틱 — 경계값은 메인 세션 판단. "2파일이면 줄 수 무관 inline"이던 구 기준은 구현+테스트 2파일의 대형 TDD diff를 놓쳐 보정됨 — ADR-051#amend-2). 어느 경로를 탔든 report `## Orchestration` 기록은 의무다.
```

**변경**: 위 줄을 다음으로 교체한다:

```
     - **small-diff fallback 기준 — 계산이 먼저, 초과 시 재량 0** (cost guard, ADR-051#amend-4): dispatch 전에 크기를 *결정적 명령으로 계산한다*. **tracked 줄 변경** = `git diff HEAD --numstat` 각 행의 (added+deleted) 합(**binary 파일은 numstat이 `-\t-`로 표기 → 0으로 취급**; rename 행 `{old => new}`도 숫자 열은 그대로라 합산 정상); **untracked 신규** = `git status --porcelain --untracked-files=all`(= `-uall`)의 `??` 항목 각 *파일* 줄 수 합(`wc -l`). **`-uall`이 핵심** — 기본 `git status --porcelain`은 untracked 디렉터리를 `?? dir/` 한 줄로 접어 파일 수를 놓치고 `wc -l`을 디렉터리에 돌리면 깨진다(예: untracked 대량 디렉터리가 1로 오계산). **L = 둘의 합, F = numstat 행 수 + untracked 파일 수.** **기준은 working tree 전체(HEAD 대비)** — 정상 lifecycle은 직전 task가 finalize로 커밋돼 tree엔 본 task 변경분만 남으므로 별도 '관련 파일' 선별이 불요하다. **over-count는 안전하다**(크게 세면 fan-out으로 기울 뿐 — 검증을 *더* 하는 쪽). 그래서 무관한 dirty/untracked가 섞여도 **임의 제외하지 말고**(제외가 재량 우회 창구가 된다) 전부 센 뒤 `## Orchestration`에 "오염 tree(무관 파일 포함 가능)" 사유만 적는다. 정확한 수가 필요하면 무관분을 stash 후 재계산해도 되지만 필수 아님 — **공유 worktree에서 사용자 변경을 강제 커밋/stash하지 않는다**. inline 허용은 **(L ≤ 50) 또는 (F ≤ 2 이고 L ≤ 200)**, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음 — **셋 다 충족일 때만**. 하나라도 미충족이면 **fan-out 필수 — inline 선택 불가(재량 0)**. 조건 충족이어도 "vertical slice라 하나로 본다" 류 사유로 inline을 택하려면 `## Orchestration`의 fallback 사유에 계산한 F·L + "임계 미달"을 명시 기록한다. **임계 초과인데 inline이면 규칙 위반**(산출물로 반증 가능 — SIMULATION_RUN Round 4 T-002 우회 재발 방지). 경계값(50/200)은 실측 전 추정치라 #amend-4가 재보정 창구다. 어느 경로를 탔든 report `## Orchestration` 기록은 의무다.
```

**기존** (`## Orchestration` 섹션의 fallback 사유 불릿):

```
- fallback 사유 (해당 시): 파일 N개 · 변경 줄 M줄 (`git status --porcelain` 기준 — tracked=`git diff HEAD`, untracked=파일 전체)
```

**변경**:

```
- fallback 사유 (inline 모드일 때만 기록): 파일 F개 · 변경 줄 L줄 (`git status --porcelain` 기준 — tracked=`git diff HEAD`, untracked=파일 전체) — **임계 미달 확인**(inline 정당 근거). **임계 초과면 inline 불가(fan-out 필수)** — "임계 초과 예외 inline"은 없다(재량 0). fan-out 모드에선 본 필드를 비우고 spawn 축을 적는다.
```

**왜**: 실행자가 계산값을 산출물에 남기게 강제하면, 임계 초과 inline을 사후에 반증할 수 있다. (백로그의 "자동계산 도구" 취지는 *별도 스크립트가 아니라* 이 recipe(dispatch 전 git 계산) + `## Orchestration` 산출물 기록으로 실현한다 — 계산값이 산출물로 남아 반증 가능하므로 executor 우회를 막는다. 별도 sizing 스크립트는 YAGNI이나, 팀이 원하면 이 계산을 `scripts/`로 뽑아도 무방.)

## 2.3 implement-workitem — 패키지 매니저 preflight + dispatch 전달 (INST-4b) + 정지 회수 (INST-4a)

**기존** (`.claude/skills/implement-workitem/SKILL.md` "반드시 먼저 할 일" 초입):

```
반드시 먼저 할 일 (메인 세션이 1회 수행):
1. 관련 task 문서를 읽는다 (메인 세션이 *한 번*만 읽는다 — builder 에 task 전문을 넘기지 않는다).
2. 필요하면 상위 feature/milestone/architecture 문서를 읽는다.
3. task 문서의 `## 6. Acceptance Criteria`(AC-1, AC-2 ...)와 `## 3. 구현 항목`을 회수한다.
```

**변경**: step 3 다음에 새 step을 삽입한다(`3-R. draft 가이드 하드스탑` 앞):

```
3-PM. **패키지 매니저 확인 (ADR-051#amend-4)**: 프로젝트 패키지 매니저를 회수한다 — `docs/00-meta/STACK_SETUP_PLAN.md` 기록 또는 repo 루트 lockfile 존재(`package-lock.json`→npm / `pnpm-lock.yaml`→pnpm / `yarn.lock`→yarn / `bun.lockb`→bun)로 판정. 확인한 PM을 각 builder dispatch(step 5)에 명시 전달한다.
```

**기존** (dispatch step 5, builder 1개에 넘기는 것 목록의 마지막 즈음):

```
   - 병렬 builder 는 *file-disjoint* slice 에만 띄운다. 같은 파일에 실제 write-conflict 가능성이 있으면 *그 slice 들은 순차로* 돌린다(또는 사용자가 별도 worktree 로 격리) — disjoint 인 일반 경우엔 불필요.
```

**변경**: 이 줄 바로 위에 새 불릿을 추가한다:

```
   - **프로젝트 패키지 매니저**(3-PM에서 확인 — 예: npm). builder는 이 PM만 실행한다 — 다른 PM(예: npm 프로젝트에서 pnpm) 실행 금지(stray lock 파일 방지 — ADR-051#amend-4).
```

**기존** (builder 결과 반환 지점):

```
각 builder 는 *자기 slice 가 건드린 파일* 을 메인 foreman 에 반환한다.
```

**변경**:

```
각 builder 는 *자기 slice 가 건드린 파일* 을 메인 foreman 에 반환한다.
**builder가 구조화 최종 반환 없이 멈추면** foreman은 1회 재개를 시도(SendMessage 등)하고, 그래도 미반환이면 그 slice가 건드렸을 파일을 직접 열어 결과를 회수한다(always-verify — "결과 없음"을 조용히 통과 금지, ADR-051#amend-4).
```

**왜**: PM 오용을 dispatch 시점에 차단하고, 하청 정지를 foreman이 반드시 회수하게 한다.

## 2.4 builder.md — 패키지 매니저 규칙 (INST-4b)

**기존** (`.claude/agents/builder.md` 규칙 목록 초입):

```
규칙:
- 범위 밖 변경은 하지 않는다.
```

**변경**: "범위 밖 변경은 하지 않는다." 다음에 한 줄 추가:

```
- 패키지 설치·명령은 **dispatch에서 지정된 프로젝트 패키지 매니저만** 쓴다 — 다른 PM(예: npm 프로젝트에서 pnpm/yarn) 실행 금지(stray lock 파일 방지 — ADR-051#amend-4).
```

**왜**: builder 페르소나에 PM 규율이 전혀 없었다(dossier 확인). 하청 측에도 못박아 이중 방어.

## 2.5 DELEGATION_STRATEGY — 회수 규율(INST-4a) + dispatcher 사전판정 금지(HN-4)

**기존** (`docs/00-meta/DELEGATION_STRATEGY.md` 메인 세션 역할):

```
## 메인 세션의 역할
- 현재 목표와 우선순위를 정리한다
- 관련 workitem과 상위 문서를 확인한다
- 적절한 서브에이전트에 작업을 위임한다
- 돌아온 결과를 통합하고 다음 결정을 내린다
- 긴 로그, 장문의 탐색 결과, 세부 구현 과정을 메인 컨텍스트에 오래 보존하지 않는다
```

**변경**: "돌아온 결과를 통합하고 다음 결정을 내린다" 다음에 한 줄 추가:

```
- 위임한 서브에이전트가 구조화 최종 반환 없이 멈추면 1회 재개한다. 그래도 미반환이면: **파일 생성 에이전트(builder)** 는 그 slice가 건드린 파일을 직접 확인해 회수; **report-only 감사자(validator/qa/reviewer — 산출 파일 없음)** 는 재실행 → 안 되면 다른 감사자에 재위임하거나 메인이 그 축을 직접 감사 → 그래도 불가하면 `감사 미완(unavailable): <축>`을 명시 기록한다("결과 없음"을 조용히 통과 금지 — ADR-051#amend-4)
```

**기존** (위임 트리거 표 아래 실행 컨텍스트 노트):

```
> **실행 컨텍스트 노트 (ADR-050)**: 본 표의 agent 매핑은 *책임 경계 정의*다(ADR-007#amend-2). 일부 lifecycle skill(validate-workitem/repair-workitem 등)은 이제 메인 세션에서 실행되지만(ADR-050) **같은 책임 경계**를 따른다 — 메인 세션이 그 경계대로 직접 수행하거나, 같은 역할의 agent를 `Agent`로 직접 fork 위임할 수 있다. `.claude/agents/*.md` persona 파일은 그대로 존재한다.
```

**변경**: 이 노트 바로 다음에 새 노트를 추가한다:

```
> **검증 위임 규율 (ADR-050#amend-1)**: 검증/감사(validator·reviewer·qa)를 위임할 때, 일 시키는 쪽은 검증자에게 *무엇을 지적하지 말라*고 미리 말하거나 *심각도를 미리 정해* 주지 않는다(자기검증 편향 차단). 계획·구현과 충돌하는 발견은 숨기지 말고 사람에게 올린다. 단 *지켜야 할 기준·계약*(AC·승인 프로토타입·DESIGN 토큰·seam INV 등)을 그대로 전달하는 것은 필수 맥락이지 사전판정이 아니다 — 이 선을 지킨다.
```

**왜**: 메인 세션이 구현·검증을 다 운전하므로 자기가 낸 지름길을 무르게 프레이밍할 편향이 있다. 감사자 제약만 있고 dispatcher 프레이밍 제약이 없던 구멍을 한 줄로 막는다.

## 2.6 ADR-050 Amendment 1 (HN-4)

**기존**: `docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md`는 amendment 0개이고 `## 참고`로 끝난다.

**변경**: 파일 맨 끝에 추가한다:

```
<a id="adr-050-amend-1"></a>
## Amendment 1 (2026-07-20) — dispatcher 사전판정 금지 (자기검증 편향 차단)

### 배경
- [관측됨] 메인 세션이 구현·계획을 하고 그 검증(validate-workitem 등)도 직접 운전하므로(D2 model-invocable), 자기가 낸 지름길을 "이 정도는 괜찮다"고 프레이밍해 통과시킬 편향 위험. 기존 규칙은 *감사자*의 "수정 금지·보고만"만 정하고 *일 시키는 쪽*의 프레이밍은 막지 않는다.

### 결정
1. 검증/감사 위임 시 dispatcher는 검증자에게 **무엇을 지적하지 말라고 미리 말하거나 심각도를 미리 정해 주지 않는다**. 계획·구현과 충돌하는 발견은 숨기지 말고 사람에게 에스컬레이션한다.
2. 단, *지켜야 할 기준·계약*(AC·승인 프로토타입·DESIGN 토큰·seam INV 등)을 그대로 전달하는 것은 필수 맥락이지 사전판정이 아니다 — 예외로 명시.

### 적용 surface
- docs/00-meta/DELEGATION_STRATEGY.md

### 강도 (ADR-022)
- enabling(약) — 한 줄 규율.
```

> **커밋 (2.1~2.6 — 오케스트레이션·위임)**:
> `feat(orchestration): mechanize validate fan-out sizing, foreman recovery, PM pinning, dispatcher pre-judgment ban (ADR-051 amend 4, ADR-050 amend 1)`

## 2.7 ADR-010 Amendment 5 + PROJECT_START_CHECKLIST (HN-5)

**기존**: `docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md`는 amendment 4개(이미 `## 현재 유효 결정` 보유)이며 도구별 memory 규율은 없다(memory 언급은 근거 bullet 1곳뿐).

**변경 (a)**: 파일 맨 끝에 Amendment 5를 추가한다:

```
<a id="adr-010-amend-5"></a>
## Amendment 5 (2026-07-20) — 도구별 memory는 비캐노니컬 (필수 결정은 checked-in 문서에)

### 배경
- [관측됨] Claude Code는 내장 `MEMORY.md`, Codex도 native Memories 기능(`~/.codex/memories/`)을 갖는다 — *둘 다 존재*한다("Codex엔 memory 없음"은 오류). 단 Codex 쪽은 **버전에 따라 experimental·기본 비활성일 수 있다**(예: 일부 codex-cli 배포에서 memories=experimental off — 구체 버전은 핀하지 않는다). on이든 off든 본 amend 결정(비캐노니컬)은 불변이다. 둘 다 로컬·생성물이라 cross-machine sync가 없고 비캐노니컬이다.
- 위험: "OAuth는 M3로 미룸" 같은 결정이 *오직 도구 memory에만* 있으면, 다른 도구·다른 머신·fresh 세션으로 이어받은 사람은 그걸 못 보고 다시 계획한다(연속성 깨짐 + SSOT 위반).

### 결정
1. **도구별 memory(Claude `MEMORY.md`·Codex memories 둘 다)는 로컬 가속기일 뿐 사실의 유일 소유자가 되면 안 된다.** 지속돼야 할 결정(범위·마일스톤 순서·연기 결정·기술 선택 등)은 반드시 checked-in 문서(마일스톤/feature 문서 또는 ADR)에도 내려가야 한다.
2. 프로젝트 시작 시 1회 점검(PROJECT_START_CHECKLIST).

### 적용 surface
- docs/00-meta/PROJECT_START_CHECKLIST.md

### 강도 (ADR-022)
- enabling(약) — 규율 + 주기 점검(강제 불가 — 내장 memory는 자동 기록).
```

**변경 (b)**: `docs/00-meta/PROJECT_START_CHECKLIST.md`의 `## 5. 의사결정 기록` 항목에 한 줄 추가한다.

**기존**:

```
## 5. 의사결정 기록
- [ ] 중요한 선택을 `docs/90-decisions`에 ADR로 남겼다
```

**변경**:

```
## 5. 의사결정 기록
- [ ] 중요한 선택을 `docs/90-decisions`에 ADR로 남겼다
- [ ] 지속돼야 할 결정(범위·마일스톤 순서·연기 결정 등)이 도구 memory(Claude MEMORY.md·Codex memories)에만 있지 않고 checked-in 문서(마일스톤/ADR)에도 있다 (ADR-010#amend-5 — 도구별 memory는 비캐노니컬)
```

> **거버넌스 주의 (D6)**: amend-5는 ADR-010의 5번째 amend라 D6상 재발행 "우선 검토" 대상이나, grandfather 조항 + 최소-churn 방침 + ADR-010이 이미 `## 현재 유효 결정`을 보유(fold 부담 낮음)해 amend로 처리한다(enabling 한 줄 확장 — 기존 결정 반전 아님).

**왜**: 도구별 memory에만 남은 결정이 다른 도구·머신·세션에서 증발하는 연속성/SSOT 구멍을 규율 한 줄로 막는다.

## 2.8 index-first recall 규율 (HN-6c)

**배경**: `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`는 마일스톤별로 계속 길어진다. 이걸 통째로 읽지 말고 **상태·심각도 색인으로 먼저 걸러 해당 항목만** 읽는 규율이다. **반드시 상태·심각도로 걸러야 한다** — 마일스톤 헤더로만 자르면 이전 마일스톤에서 넘어온 미해결 P0(carry-over)를 놓친다. 지금은 파일이 짧아 이득이 작지만 마일스톤 10+ 다운스트림에서 토큰을 아낀다.

**기존** (`docs/00-meta/WORKFLOW.md` §5 마일스톤 안정화, 기록 줄):

```
- **코드 수정·커밋·status 변경 금지** — 결과는 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`에 누적 기록.
```

**변경**: 이 줄 다음에 한 줄 추가:

```
- **index-first recall (ADR-019 정합)**: 누적된 `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`를 회수할 때는 통째로 읽지 말고 *상태·심각도 색인*(open·P0/P1)으로 먼저 걸러 해당 항목만 읽는다. **마일스톤 헤더로만 자르지 않는다** — 이전 마일스톤에서 넘어온 미해결 P0(carry-over)를 놓치기 때문.
```

**기존** (`.claude/skills/repair-milestone/SKILL.md` 회수 단계 2):

```
2. `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` / `### P1` / `### P2` 항목을 회수한다.
```

**변경**:

```
2. `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` / `### P1` / `### P2` 항목을 회수한다. **추가로 다른 마일스톤 헤더의 미해소(`status`≠`resolved`) P0/P1도 색인 스캔한다** — carry-over 미해결 항목이 본 milestone 헤더로 자르면 누락되기 때문(index-first recall).
```

**왜**: 마일스톤 헤더로만 자르는 기존 회수가 carry-over P0를 놓칠 수 있다는 백로그 경고를 반영. `stabilize`/`plan-milestone R0`는 이미 마일스톤 무관 open 항목을 회수하므로 별도 편집 불요(WORKFLOW 규율로 커버).

> **커밋 (2.7~2.8 — memory·recall 규율)**:
> `feat(continuity): make tool memory non-canonical and add index-first recall (ADR-010 amend 5)`

---

# Phase 3 — 디자인 게이트·정체성 (DS-1 · DS-2 · DS-3 · DS-5 · DS-6 · DS-7)

당신의 핵심 목표("세련되고 창의적인, AI스럽지 않은 디자인")를 정면으로 겨냥하는 Phase다. 실험 근거상 진짜 지렛대는 **수용 게이트(DS-2/3/7)**이고, 리서치 강화(DS-1)·정체성(DS-5)은 그 위에 얇게 얹는다. 순서: 거버넌스 ADR → DESIGN.md 내용 → 스킬·에이전트 배선.

> **거버넌스 주의**: ADR-058은 `ADR-049`를 supersede한다. 그래서 이 Phase에서 bootstrap-design을 재작성할 때 그 안의 `ADR-049#...` 인용은 자연히 `ADR-058`로 바뀐다. 그 밖에 남는 `ADR-049` 인용(ADR-027·ADR-040·DESIGN.md §0 주석·.gitignore 주석·STRUCTURE·WORKFLOW)은 **Phase 5의 re-point 스윕**에서 정리한다(Phase 3에서 편집하는 파일 안의 것은 그때그때 함께 바꾼다).

## 3.1 신규 `ADR-058` — Design Workflow (ADR-049 supersede) [DS-1 · DS-3 · DS-5]

**변경**: 새 파일 `docs/90-decisions/boilerplate/ADR-058-design-workflow.md`를 만든다:

```markdown
# ADR-058 — Design Workflow (reference flow + acceptance gate + concept cards)

> scope: boilerplate
> area: design

## Status
accepted

> 대체: [ADR-049](ADR-049-concept-mockup-first-design.md)를 supersede한다(디자인 워크플로우 라운드 구조·R0 grounding·시안 정책 전부). ADR-049는 `superseded`로 history 잔존. DESIGN.md *내용*·인터페이스 할당 SSOT는 [ADR-027](ADR-027-interface-decision-allocation.md)이 계속 소유(본 ADR은 흐름·게이트·리서치·시안 카드만).
> 승격 범위(정직 — *status 축*과 *검증 축*은 별개다):
> - **status = `accepted`** — 저장소 `_ADR_GUIDE`상 accepted는 *운영 채택*을 뜻하지 검증 완료가 아니다(wiring이 이미 accepted 전제로 짜여 정합; `trial`은 허용 status가 아니라 분리 불가).
> - **D3 수용 게이트는 지금 constraint** — ADR-022는 constraint에 `[관측됨]` *또는* `[외부실증]`을 요구하고(둘 중 하나면 자격 충족), repo-local `[관측됨]`으로 충족된다. **실측 개선 축은 serious/critical axe**(REPORT 기준 2 — repair loop로 5/8→0/8). 320 overflow·clip은 게이트가 *결정적으로 상시 검사*하는 축이지만 이 eval에서 5/8→0/8 수치를 낸 건 axe다(320/clip을 같은 수치로 뭉뚱그리지 않는다). 별도 "강 승격" 관문은 없다(constraint 자체가 ADR-022 '강').
> - **나머지(R0 evidence-on-demand·REFINE/EXPLORE·cross-model·실화면 a11y)는 directional/enabling — 미검증 명시.**
> - **REPORT §13 용어 정정**: REPORT는 7기준을 "`accepted` 승격 조건"으로 적었으나, 이는 저장소 status(accepted=채택)보다 엄격한 *완전 실증* 의미다. 저장소 거버넌스에선 그 7기준을 **신뢰도(Medium→High)·외부 일반화 승격 조건**으로 읽는다(REPORT 원문은 history로 보존하고 본 ADR이 용어를 정정 — 조용한 덮어쓰기 아님). 기준 2(게이트 결함 0)·3(blind visual 5% 이내 — *게이트와 다른 축*)만 탐색적 충족, 나머지 5개 미검증. 미검증 부분은 아래 재검토 트리거가 관장(충족 시 신뢰도·일반화 승격; 미충족 신호 누적 시 그 부분 후퇴).

## 현재 유효 결정
- `/bootstrap-design` 라운드 구조 SSOT는 본 ADR: R0(리서치 + `DESIGN_RESEARCH.md`) → R1(원칙 + voice 기본값) → R2(다중 concept 시안 — DESIGN.md 작성 *전* 시각 방향 선택) → R3(토큰) → R4(컴포넌트) → R5(DESIGN.md 저장) → R6(파생 preview 확인 + 정리).
- **R0 = evidence-on-demand**(D2): AI 자율 리서치가 디폴트, 사용자 입력은 옵션 힌트. Layer A(방향)/B(값 grounding — 핀 URL)/C(포맷 — R5 fixture만). role 3종, counter-reference 조건부, 고정 쿼터 없음(coverage 정지, 최종 3~5개), 최소 기록 schema.
- **R2/R6 수용 게이트**(D3): full 모드는 concept마다 1280+375 렌더 + 독립 reviewer 픽셀 판정, 320 reflow·populated axe 상시, block/report 등급, repair loop(retry ≤2). *진짜 품질 지렛대*.
- **R2 시안 카드 = REFINE / EXPLORE**(D4): 안전/과감 아님. signature는 primary task 이해를 도울 때만.
- 취향 오라클=사용자, 생성(designer)/감사(reviewer[design]) 분리 유지(D5).

## 배경
- [관측됨] 실사용 fork에서 시안이 단조롭고 어디서 본 듯함 + R0 grounding이 median으로 조용히 후퇴(슬롭 근본원인). 레퍼런스 값 추출이 실제 제품 페이지에서 자주 실패(Linear/Stripe/Vercel 0/3 — markdown 변환으로 CSS 소실).
- [관측됨] repo-local 엄밀 재검증(`.boilerplate/validation/design-workflow-eval-20260720/REPORT.md` — Stage1 24안 블라인드 2인 + B3 8안 + holdout 2인, 2브랜드, 실제 1280/375/320 렌더+axe. ADR-022상 저장소-로컬 평가는 `[관측됨]` — `[외부실증]`은 외부 다중 repo 실증에만): ① 레퍼런스 규칙을 잔뜩 더해도 평균 시각 점수 향상 0, 문맥 +76% ② 최초 24안 중 12안이 serious axe 위반 ③ 실패 selector 되먹임 1회 repair로 3/8→8/8 통과. → 품질을 만든 건 리서치가 아니라 **수용 게이트 폐쇄 루프**.

## 결정
1. **라운드 구조 R0~R6** — 위 현재 유효 결정 순서. `--fast`(R2·R4·R6 생략, R5 저장은 유지) / `--update`(부분 갱신) 존재.
2. **R0 evidence-on-demand**:
   - 디폴트는 **AI 자율 리서치**. 사용자 제공 URL·취향은 *우선 힌트*(prerequisite 아님) — 있으면 Layer A에 우선 반영, 없어도 확인 게이트 없이 자율 진행.
   - **Layer A (방향)**: charter의 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 AI가 스스로 탐색(정성 방향 어휘).
   - **Layer B (값 grounding)**: Layer A 방향에 맞는 오픈소스 토큰 패키지에서 실제 값 추출 — **핀 고정 목록**(Primer/Radix/Polaris/Tailwind/shadcn 검증된 원본 주소)으로 추측·404 제거. raw CSS + JSON 토큰 엔드포인트까지. mobbin·copycats류 가짜 요약 사이트 거부. 닫힌 제품(Linear 등)은 "추출 불가 — <사유>" 정직 표기.
   - **Layer C (포맷·완성도)**: Google 공식 예시 DESIGN.md(`google-labs-code/design.md/examples`)로 섹션 완성도·빠짐 점검 — **선택이 끝난 R5에서 format fixture로만**(창작 컨텍스트 R0~R2에 넣지 않는다 — 공식 예시 `atmospheric-glass`가 glassmorphism/보라 그라디언트로 §9 anti-slop 위반이라 미감 오염). authoritative는 Google 공식 예시 3종만, `designmd.directory`·커뮤니티 미러는 lead로만.
   - **role 3종**: `task/behavior` · `identity/craft` · `implementation system`. **한 canonical 레퍼런스가 여러 role을 겸하면 우선**(brand-fit과 groundable을 동시에 만족하는 소스 — role은 다중값 허용); 겸비가 불가할 때만 role별로 분리한다(겸용 우선, 안 될 때 분리). counter-reference(안티-레퍼런스)는 별도 role이 아니라 *미해결 tension이나 실제 monoculture가 있을 때만* 추가(mandatory anti-pole 폐기).
   - **고정 최소 개수 없음** — evidence coverage가 차면 정지. designer 최종 입력 보통 3~5개 이하(단순 내부 도구는 더 적게). primary task·결정 순간·실패/복구·정체성 tension을 먼저 적어 리서치의 방향타로 삼는다.
   - concept 안에서는 **coherent primary system 1개**. 명시 gap 시에만 secondary primitive(**Radix는 *색만* fallback** — 타이포/레이아웃/IA/모션은 ground 못함, semantic mapping·대비검증 별도).
   - **관측 기반 주장만**: visual 주장은 실제 화면/스크린샷을 봤을 때만, behavior 주장은 docs/interaction을 봤을 때만 기록. broad search·gallery·Dribbble/Behance는 이름 찾는 lead로만 허용 후 canonical 제품·공식 문서·live 스크린샷·source/token 코드로 승격.
   - **최소 기록 schema** (DESIGN_RESEARCH.md): `source/canonical | role | 뒷받침한 결정 | 검증유형(visual/behavior/code) | 관측일 | borrow | avoid | confidence/caveat`. quality-tier·cluster-quota·groundable-count 같은 실험용 label은 정책 필드로 만들지 않는다(기록 비용 > 결정 품질).
3. **R2/R6 수용 게이트**:
   - **항상(값싼·결정적 — 러너가 계산)**: **320px 브라우저 geometry** — page overflow + **element viewport escape + clipped/truncated text**(narrow ≤375 — `.boilerplate` 평가 `check-reflow-320.cjs`의 `getBoundingClientRect`·overflow-clip 로직 이식) + **populated-state axe**(실데이터 채운 화면 *전제* — 입력 계약; 러너는 axe를 돌리고 "실제로 채워졌는지"는 reviewer 스크린샷이 backstop으로 확인). **overflow·escape·clip은 러너가 결정적으로 잡는다**(REPORT §13 항목 2 실측 검증분 — geometry는 픽셀 취향이 아니라 좌표 계산이라 결정 가능). **단 정상 UI 오탐 제외**: sr-only/visually-hidden(1px·clip/clip-path)·aria-hidden/inert/닫힌 drawer·overflow scroll/auto 조상 안(contained 가로스크롤=의도적, 예: 넓은 표)·의도적 `text-overflow:ellipsis`는 escape/clip에서 뺀다(실브라우저 검증분 — 러너 코드에 반영). reviewer 픽셀은 *주관적* 판정(위계·밀도·slop·overlap)만 담당한다.
   - **full 모드**: 각 concept을 1280 + 375로 항상 렌더 → **독립 reviewer(design surface)가 픽셀로** 위계·밀도·domain fit·장식 slop 판정(HTML-read source 감사와 별개 — 세 검사가 서로 다른 결함을 잡아 대체 불가). LLM reviewer는 1명이면 충분.
   - **차단(block) — 러너 결정적**(design-gate.mjs가 계산): serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry). **차단(block) — reviewer 픽셀 판정**(스크린샷으로 판단, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding. **수동 smoke**(자동 불가분): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
   - **repair loop**(핵심): 실패 selector + 요약을 designer에 되먹여 재실행. **retry ≤2, 초과 시 승인 보류 + brief/source 재검토**(무한 루프 방지), 여전히 fail이면 승인 불가. 통과본 외 임시 렌더/스크린샷은 정리.
   - 게이트는 concept/preview·선택 프로토타입 **1회성에서만**(per-task hot-loop 금지). Playwright/axe는 stack-guard 선설치분 재사용(추가 의존 0).
   - `--fast`/`--update`: research·스크린샷 reviewer는 명시 생략 가능(사유 echo — silent skip 금지), browser 있는 UI면 값싼 axe/reflow는 유지 권장.
4. **R2 시안 카드 REFINE / EXPLORE**: 두 기본안을 **REFINE**(익숙한 task convention 우선 + restrained signature) / **EXPLORE**(signature-led이되 *같은* 익숙한 control/flow 보존)로 정의(안전/과감 아님 — novelty가 목표라는 오해 차단). 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*. 카드 필드: `task hypothesis | preserved convention | visible signature | failure sign`. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해침).
5. **취향 오라클·생성/감사 분리 (D5 — ADR-049 승계)**: 취향 오라클=사용자(선호 추천·순위 금지, 물으면 예외). concept authoring=designer, 구별성·픽셀 감사=reviewer[design](자기 비평 금지). parallel-merge 금지(순차 생성→비평→선택). **harness degradation (Codex 등 독립 subagent 미지원 경로)**: 독립 subagent 격리가 없는 harness에서는 gen/audit가 동일 세션 *순차 페르소나*로 degrade한다 — 이때 (a) designer→reviewer 페르소나 전환을 *명시적 단계*로 끊고, (b) 감사 독립성 저하를 산출물에 `under-verified: 동일 세션 감사`로 명시하며, (c) 완전 독립 감사가 요구되면 사용자 승인 보류. **단 결정적 렌더 게이트(`design-gate.mjs`)는 세션 격리와 무관하게 그대로 실행**되므로 배포불가 결함(serious/critical axe·320 geometry)은 Codex 경로에서도 결정적으로 차단된다(감사 *독립성*이 degrade해도 *안전 게이트*는 유지).

## 근거
- 대안 A(현행 유지 B0): raw 시각/비용은 최선이나, acceptance gate 없이는 배포불가 결함(serious axe)이 승인까지 통과 — 유지 불가.
- 대안 B(리서치 대폭 강화 B1/B2): 평균 시각 향상 0, 문맥 +76%, 고정 lane이 무관 근거를 끌어와 task 적합도↓ — 채택 안 함(축소).
- 채택(B3형 = 얇은 evidence-on-demand + task 기여 2안 + 독립 렌더/DOM 수용 게이트): 실험상 serious 5/8→0/8, holdout 최고안이 incumbent와 0.5/50 차이.
- 신뢰도: **Medium** — 2브랜드·same-model·static prototype·B3 post-hoc라 cross-project 다양성·작은 시각점수 차는 일반화 금지(REPORT §13/§14). directional 근거.
- 재검토 트리거: REPORT §13 7기준(동일 brief 2회 비교 / archetype별 serious·320·clipping 0안 매 반복 제공 / blind 평균 5% 이내 / quota 없음 확인 / --fast·--update silent skip 없음 / Claude·Codex 축소 경로 실행 / 키보드·focus·escape·SR name·동적 상태 실화면 검사)은 **신뢰도(Medium→High)·외부 일반화 승격 조건**이다(accepted 채택 자체를 막는 조건이 아님 — accepted는 이미 성립, D3 constraint는 [관측됨]으로 충족). 미충족 신호가 누적되면 해당 부분(리서치·카드 등 directional)을 후퇴시킨다. archetype 확대·cross-project 다양성 측정 시 재검토.

## Mutation Contract (ADR-047 D3)
1. **Target** — bootstrap-design SKILL R0~R6·`--fast`·`--update` + `allowed-tools`(렌더·axe 실행) / `scripts/design-gate.mjs` 러너 / plan-milestone R5 게이트(allowed-tools + R5-5) / researcher.md 디자인 레퍼런스 모드 / designer.md(카드·signature·PX 마커) / reviewer.md(design surface 렌더 증거·픽셀 판정·bootstrap-design 호출자 등재) / DESIGN_RESEARCH.md 스키마 / stack-guard(populated axe·320 reflow) / DESIGN.md §0 주석 R0~R6 / STRUCTURE·WORKFLOW·.gitignore의 ADR-049→ADR-058 re-point.
2. **Failure mode** — R0 grounding이 median으로 조용히 후퇴 + 독립 감사가 렌더·DOM을 안 봐 배포불가 결함(serious axe·320 overflow) 통과 + 시안이 "다르기만" 하고 안전·평범(전부 관측됨/실측).
3. **Predicted improvement** — serious axe/320 결함이 concept/preview 단계에서 제거(실측 5/8→0/8), 레퍼런스 값 확보 안정화, REFINE/EXPLORE로 의도된 개성.
4. **Preserved invariants** — DESIGN.md 시각 SSOT / preview·concept ephemeral(ADR-005) / 취향 오라클=사용자 / 생성·감사 분리 / RGR inner-loop 스크린샷 hot-loop 금지(게이트는 1회성 carve-out) / 비-UI DESIGN.md 삭제 경로 / skill auto-invocation 금지 / ADR-027 DESIGN 내용·인터페이스 SSOT 지위.
5. **Falsifying evaluation** — REPORT §13 수용기준 재실행에서 새 흐름이 archetype별 serious/320/clipping 0안을 매 반복 제공 못 하거나 blind 평균이 current 대비 5% 초과 하락하면 게이트·리서치 강도 재조정(ADR-047#amend-1 방법 — 대조군 둔 저비용 비교 먼저). 정적 부분은 `scripts/check-doc-links.mjs`.
6. **Rollback path** — ADR-058을 *새 supersede ADR*로 되돌린다: ADR-058을 supersede하는 신규 ADR을 발행해 라운드 구조(R0 5단 위계·divergence 카드·visual-QA scaffold)를 재채택하고 렌더 게이트·evidence-on-demand·REFINE/EXPLORE를 제거하며 surface를 새 ADR로 re-point한다. **ADR-049 status를 accepted로 되돌리지 않는다** — supersede는 history 영속(ADR-045)이라 status 되돌리기는 기록 왜곡이다.

## 정책 강도 (ADR-022)
- D3 수용 게이트의 block 등급(serious/critical axe·320 overflow·viewport escape·clipped text)은 **constraint(ADR-022 '강')**. ADR-022는 constraint에 `[관측됨]` *또는* `[외부실증]`을 요구하는데(둘 중 하나면 충족), 게이트가 배포불가 결함(serious/critical axe·320 geometry — WCAG·브라우저 기준)을 제거하는 효과가 `[관측됨]` repo-local 평가(REPORT 기준 2 — serious 5/8→0/8)로 확인되므로 **지금 constraint 자격을 충족**한다. 신뢰도는 Medium 유지 — 외부 다중 repo 실증이 쌓이면 `[관측됨+외부실증]`으로 신뢰도·일반화가 오른다(ADR-022 "제약 강하게"; constraint *자격*은 이미 충족이라 별도 승격 관문 아님). R0 evidence-on-demand·REFINE/EXPLORE·report 등급은 enabling(약).

## 결과
- 디자인 흐름의 품질 지렛대가 "리서치 양"에서 "수용 게이트 폐쇄 루프"로 이동. 레퍼런스는 얇게, 게이트는 결정적으로.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-design/SKILL.md
- .claude/agents/researcher.md
- .claude/agents/designer.md
- .claude/agents/reviewer.md
- docs/20-system/DESIGN.md                  — §0 주석 R0~R6 + §1 DESIGN_RESEARCH 링크
- scripts/design-gate.mjs                    — R2-G/R6 수용 게이트 러너
- .claude/skills/plan-milestone/SKILL.md      — R5 프로토타입 게이트 호출자(allowed-tools + R5-5 게이트)
- .claude/skills/stack-guard/SKILL.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md
- .gitignore

## 참고
- ADR-027 (DESIGN 내용·인터페이스 SSOT), ADR-040#amend-4 (researcher 디자인 레퍼런스 모드), ADR-056 (R5 프로토타입·경험 계약), ADR-047 (mutation contract), ADR-045 (참조 계약), ADR-053 (parallel-merge 금지), ADR-005 (SSOT).
```

**왜**: 사용자 URL 1순위(ADR-049 R0)를 "AI 자율 디폴트"로 뒤집는 것은 기존 결정 번복이라 ADR-045 D6상 amend가 아니라 supersede(신규 ADR)가 맞다. 게이트를 constraint로 박아 배포불가 결함을 빌드 전에 실제로 제거한다.

## 3.1b ADR-058 근거 evidence bundle 커밋 (인용 재현성)

ADR-058이 `[관측됨]`으로 인용하는 평가 산출물(`.boilerplate/validation/design-workflow-eval-20260720/`)이 현재 **untracked(실측 293파일·~35MB)**라, 커밋 안 하면 clean clone에서 인용이 사라져 후속 검토자가 `[관측됨]` 판정을 확인할 수 없다. `.boilerplate/validation/`은 STRUCTURE.md상 **Record·boilerplate-only** 영역이다(선례: `SIMULATION_RUN.md` tracked). 단 **REPORT.md 단독 커밋은 금지** — REPORT `## 15. 검증 산출물`이 protocol README·reference-packs·concept HTML·metrics JSON을 상대 링크로 참조해 REPORT만 커밋하면 그 링크가 전부 깨진다. **소형 evidence bundle**을 커밋한다:

- **커밋 (텍스트/HTML/JSON/스크립트 — 실측 79파일·~0.73MB)**: `REPORT.md` + protocol `README.md` + `reference-packs/` + concept·preflight HTML + 측정 JSON(`metrics-*.json`) + 결정적 검사 CJS(`check-reflow-320.cjs` 등) + blind/holdout 평가 문서.
- **제외 (PNG/JPG 스크린샷 — 실측 214파일·~33MB)**: 무게 대부분. 판정 재현에 불필요(결정적 검사 CJS·JSON이 수치를 담음).
- **삭제 예정 backlog 참조 제거**: REPORT가 곧 삭제될 `IMPROVEMENT_BACKLOG2.md`를 markdown 링크(§2 등 6곳)로 참조 → 삭제 시 dead link + 영구 커밋물이 삭제될 문서를 참조(사용자 규칙 위반). **링크·파일명 언급을 *일반 provenance 서술*로 교체**한다 — 예: "당시 세션 검토 메모(현재 저장소에서 삭제됨)가 제안한 DS 항목". 파일명·경로를 남기지 않는다(체커는 markdown 링크만 잡지만, 산문 파일명 참조도 제거 — 삭제될 문서를 영구 REPORT가 가리키지 않게).
- **제외된 이미지 참조 처리**: 커밋된 `.md`가 *제외된* PNG를 markdown 이미지 링크(`![..](x.png)`)로 참조하면 체커가 dead로 잡는다. → 그 이미지 참조를 산문화하거나, `check-doc-links.mjs`의 `IGNORE_TGT`에 이 eval의 이미지 경로 패턴(예: `/design-workflow-eval-[0-9]+\/.*\.(png|jpe?g)$/`)을 추가한다(둘 중 하나).
- **로컬 경로 한계 명시**: eval 스크립트가 `C:/tmp/...` 절대경로를 하드코딩하고 README가 없는 `metrics.json`(실제 `metrics-stage2-final.json` 등)을 가리킨다 — 이건 *실행 재현*을 막지만 *판정 추적*은 커밋된 JSON·REPORT로 가능하다. 이 한계를 커밋 메시지·REPORT 주석에 명시.
- **검증**: PNG 제외 상태에서 `node scripts/check-doc-links.mjs` 재실행 → bundle 내부 링크·backlog 정리·이미지 처리가 통과.

**표현(정직)**: 이 bundle은 "전체 실험 완전 재현"이 아니라 **"핵심 판정의 감사 가능성 + 결정적 검사(geometry·axe·JSON 수치) 재현"**이다.

> **커밋 (Phase 3 — ADR-058 근거)**:
> `chore(evidence): commit design-workflow eval bundle (report/protocol/html/json/checks, no screenshots) for ADR-058 provenance`

## 3.2 ADR-049 → superseded 표기

**기존** (`docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md` 상단 — `## Status` 아래 값 줄만 대상):

```
## Status
accepted
```

**변경**: `_ADR_GUIDE` "대체 절차"를 정확히 따른다 — **Status 값은 상태어(`superseded`)만** 두고, 대체 정보는 **ADR 제목 아래 별도 줄**로 기록한다(저장소 관례상 Status 값에 긴 설명을 욱여넣지 않는다 — 부분 supersede만 짧은 괄호를 달고 그건 `accepted` 유지; ADR-049는 *전면* supersede라 bare `superseded`). `## 현재 유효 결정` 헤딩·본문은 건드리지 않는다(history 잔존).

(1) `## Status` 값 교체:
```
## Status
superseded
```
(2) ADR-049 제목(H1) 바로 아래에 대체 줄 1개 추가:
```
> 대체: [ADR-058](ADR-058-design-workflow.md) (2026-07-21 — 라운드 구조·R0 grounding·시안 정책 전부 ADR-058로 이관; 본 ADR 본문은 history로 보존)
```

**왜**: `_ADR_GUIDE` "대체 절차"(① status→`superseded` ② 상단 "대체: ADR-xxx" 별도 표기 ③ 신규 ADR이 구 ADR 참조) 준수 — Status 값에 서술을 섞지 않는다.

**변경 (b) — orphan `## Surfaces` 제거 (F1 — [Surface-backref] 오탐 차단)**: ADR-049는 본문 끝에 `## Surfaces` 블록(fan-out SSOT)을 갖는다. §5.5가 그 등재 파일들의 `ADR-049` 역참조를 `ADR-058`로 re-point하면 역참조가 사라지는데, stabilize `[Surface-backref]` forward-check(`.claude/skills/stabilize-milestone/SKILL.md`의 "Surfaces forward check" 항목)는 `## Surfaces`를 가진 *모든* ADR에 각 파일의 `ADR-NNN` 역참조 존재를 요구하며 **superseded 예외가 없다** → 완전 re-point된 파일마다 `P1 [Surface-backref] ADR-049 → <file>`가 터진다(이건 인용의 [Ref-dead] P2와는 *별개* 검사라 P2 강등으로 안 덮인다). 그래서 supersede 시 **ADR-049 본문 끝의 `## Surfaces` 블록을 통째로 삭제**한다 — superseded ADR은 live sync 소스가 아니고, 그 surface는 이제 ADR-058 `## Surfaces`가 소유한다(결정 본문·`## 현재 유효 결정`은 history로 남기고, fan-out 포인터인 Surfaces 블록만 제거 — 결정 history 손실 0).

**변경 (c) — forward-check에 superseded 예외 (F1 일반화 — 미래 supersede 대비)**: (b)와 별개로, 앞으로의 어떤 supersede에서도 같은 오탐이 안 나게 `.claude/skills/stabilize-milestone/SKILL.md`의 "Surfaces forward check" 항목 문구에 한 줄을 더한다 — **"대상 ADR의 `## Status`가 `superseded`/`deprecated`면 forward-check에서 skip한다(live sync 소스만 점검 — 죽은 ADR의 잔존 Surfaces는 별도 [Ref-dead]가 담당)."** (b)는 지금 ADR-049를 정리하고, (c)는 클래스 전체를 막는다.

## 3.3 ADR-027 Amendment 7 + `## 현재 유효 결정` 갱신 [DS-2 · DS-5 · DS-6 · DS-7]

**기존** (`docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md`의 `## 현재 유효 결정` 첫·넷째 불릿):

```
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장 + Voice & Writing 확장(§10 — ADR-056)), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다.
```

**변경 (a)**: 첫 불릿 끝에 내용 계약 확장을 덧붙이고, 흐름 SSOT 참조를 ADR-049→ADR-058로 바꾼다. 첫 불릿을 다음으로 교체:

```
- 시각 결정은 `DESIGN.md`(UI 한정, Stitch 8섹션 + Motion 확장 + Voice & Writing 확장(§10 — ADR-056) + **내용 계약 확장(§1 긍정적 정체성 · §3 tabular · §4 responsive invariant · §7 category state · §8 semantic motion · §9 WCAG 2.2 a11y — #amend-7)**), 인터페이스 결정은 ARCHITECTURE `## 7-1`(API)/`## 7-2`(CLI)/`## 7-3`(백엔드)/`## 7-4`(프론트)에 둔다. **디자인 워크플로우 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 [ADR-058](ADR-058-design-workflow.md)**(ADR-049 supersede).
```

**기존** (amend roster 불릿):

```
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4(라운드 구조는 ADR-049). #amend-5(§10 Voice 규칙서 — ADR-056). #amend-6(design reviewer 렌더 증거 주입).
```

**변경 (b)**: 끝에 amend-7을 덧붙인다:

```
- cross-surface enforcement(plan/validate-plan/stabilize/templates/reviewer)는 #amend-1이 SSOT. anti-slop·lint·Motion 정정은 #amend-2. UI 판정 다중신호 절차는 #amend-3. `--update`는 #amend-4(라운드 구조는 ADR-058). #amend-5(§10 Voice 규칙서 — ADR-056). #amend-6(design reviewer 렌더 증거 주입). #amend-7(DESIGN 내용 계약 확장 — §1 정체성·§9 a11y·§8 semantic motion·§7 category state·§4 responsive invariant·§3 tabular; reviewer a11y 차원·category state 미러).
```

**변경 (c)**: 파일 맨 끝(마지막 Amendment 뒤)에 Amendment 7을 추가한다:

```
<a id="adr-027-amend-7"></a>
## Amendment 7 (2026-07-20) — DESIGN.md 내용 계약 확장 (정체성 · a11y · semantic motion · category state · responsive invariant · tabular)

### 배경
- [관측됨] §9는 "하지 마라"(금지)만 잔뜩이고 "이렇게 되어라"(긍정)가 없어 결과가 *깨끗하지만 평범한* UI로 수렴. §9에 reduced-motion·2축 위계는 있으나 **대비/키보드/aria/포커스 규칙이 없다**("아예 없음"은 과장, 부재는 이 넷). §8 Motion은 Material 3 수치 한 줄뿐. §7은 전 컴포넌트 8상태 강제라 planning paperwork 과다(실측 136 entry→category 74, -46% + 빠졌던 success 추가). §4에 반응형 설계 규정 부재, dogfood에서 overflow·axe가 결과무관 통과라 반응형 미검증.
- [실측 증거] dogfood(QuickTodo)에서 완료 텍스트 대비 3.70:1(AA 4.5:1 미달)이 통과됨 — 빈 화면만 본 axe advisory가 못 잡음.

### 결정 (DESIGN.md 내용 계약 — SSOT는 ADR-027, 실제 규칙 텍스트는 DESIGN.md 각 섹션 주석)
1. **§1 긍정적 정체성**: design thesis 1문장 + signature mechanism 1개 + imagery/icon 방향(또는 N/A) + contextual density. actionable 가드(공허한 buzzword 금지). variance/motion 다이얼은 도입 안 함(divergence 카드·§8과 중복).
2. **§9 접근성 (WCAG 2.2)**: 정상 텍스트 4.5:1 / 큰 텍스트 3:1 / 비텍스트 UI·아이콘 3:1 / 포커스 링 제거 금지 / 키보드 조작 / 아이콘 버튼 accessible name(computed name — aria-label·aria-labelledby·visible text·alt·title 등 어느 출처든; aria-label 강제 아님) / 색-단독 표시 금지. LLM이 정밀 비율·computed name을 못 계산하므로 포커스 제거·색-단독은 강하게, 정밀 대비·name은 권고 + 실화면 axe(stack-guard populated axe · design-gate.mjs 러너)가 결정적으로 잡음.
3. **§8 semantic motion contract**: 목적(feedback/continuity/orientation/state-change) · 빈도(반복 흐름일수록 budget↓) · 실행(project token duration/easing · interruptible · no layout shift) · 접근성(reduced-motion 정보손실 없는 대체) · 금지(decorative infinite/repeated). Emil 정확 수치는 project token *시작 default*로만(보편 법칙 아님). tabular-nums는 모션 아님 → §3으로.
4. **§7 category state 계약**: interactive primitive(default/hover/active/focus-visible/disabled, async면 loading) · data composite/screen(default/loading/empty/error/success) · static primitive(상태 매트릭스 없음). N/A는 category상 expected를 의도적으로 뺄 때만. 전 컴포넌트 8상태 강제 폐기.
5. **§4 responsive invariant**: content order / container transition / table strategy / sticky occlusion / 320 reflow / text fit / essential-2D exception 소유. 임의 breakpoint 숫자 목록 강제 아님.
6. **§3 tabular figures**: 표·정렬 숫자 열은 tabular-nums.
7. **reviewer 미러**: reviewer[design] 5→**6차원**(a11y 신설), [Design-state]는 8상태→category state 판정으로, [Plan-design]의 "8 상태 매트릭스" 문구도 category로 동기(#amend-1 미러 계약 유지).

### 적용 surface
- docs/20-system/DESIGN.md (§1/§3/§4/§7/§8/§9)
- .claude/agents/reviewer.md (a11y 차원 신설 + [Design-state] category + [Plan-design] 미러)
- .claude/skills/validate-plan/SKILL.md ([Plan-design] 미러)
- .claude/skills/bootstrap-design/SKILL.md (R4 category state · R6 preview 상태 렌더 문구)

### 근거
- [관측됨]·[실측] 위 배경. [외부실증] WCAG 2.2 / REPORT 실측(serious axe 12/24, category state -46%).

### 강도 (ADR-022)
- §9 a11y의 grep 가능분(포커스 제거·색-단독)·§4 320 reflow는 constraint(강). 나머지 enabling(약).
```

**변경 (d) — grandfather amend 근거 명시**: Amendment 7 헤딩 바로 아래에 한 줄을 넣어, ADR-027이 grandfather라 D6 재발행 강제 없이 amend가 정당함을 남긴다(체커·유지보수자 혼동 방지):

```
> **amend 근거(ADR-045 D6 grandfather 조항)**: ADR-027은 ADR-045(2026-05-27) *이전* 생성(2026-05-16)이라 **grandfather** — D6 재발행은 "우선 검토(권고)"일 뿐 즉시 강제가 아니다. 본 개선 라운드는 *최소 churn*을 택해 Amendment 7로 처리한다(사용자 결정 — 번호·참조 churn 회피). `## 현재 유효 결정`이 이미 net 규칙을 요약하므로 fold 부담은 낮다. 다음 변경 시 통합 재발행 우선 검토.
```

**왜**: 사용자가 Q3에서 "최소 churn: 027 번호 유지"를 택했다. §1 긍정적 정체성이 당신 목표("AI스럽지 않은 좋은 디자인")의 실제 지렛대이고, a11y·category state·responsive는 기본 웹 스택의 최대 품질 구멍을 값싸게 닫는다.

## 3.4 DESIGN.md §1 — 긍정적 정체성 (DS-5)

**기존**:

```
## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-049#d28).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-049#d30 — /bootstrap-design R2 선택 결과). -->
```

**변경**:

```
## 1. Overview
<!-- 디자인 원칙 3~5개 (actionable verb. "modern/clean/sleek" 같은 모호어 금지).
     + 긍정적 정체성 (ADR-027#amend-7 — 금지 목록(§9)만으론 '안 촌스러움'까지, 개성·세련은 여기서):
       - design thesis: 이 제품 디자인이 뭘 지향하는가 한 문장 (actionable — 공허한 미사여구 금지).
       - signature mechanism 1개: 이 제품만의 시각/인터랙션 특징 (예: "모든 액션은 커맨드바 한 곳에서"). primary task 이해를 더 빨리 돕지 못하면 두지 않는다(장식이면 제거).
       - imagery/icon 방향: 사진/일러스트/아이콘 스타일 (해당 없으면 "N/A").
       - contextual density: 대시보드=조밀 / 마케팅=여유 등 강도 1줄.
     + [디자인 리서치](DESIGN_RESEARCH.md) 링크 + what-to-borrow/avoid 1~2줄 (ADR-058).
     + `선택 concept: <X>(+하이브리드 메모)` 한 줄 (ADR-058 — /bootstrap-design R2 선택 결과). -->
```

## 3.5 DESIGN.md §3 — tabular figures (DS-6/DS-7)

**기존**:

```
## 3. Typography
<!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair -->
```

**변경**:

```
## 3. Typography
<!-- 1~2 family, 4~5 size scale, modular ratio (1.125/1.25/1.333), weight pair.
     + Data-table 계약 (ADR-027#amend-7): 표·정렬이 필요한 숫자 열은 tabular figures(`font-variant-numeric: tabular-nums`)로 정렬 흔들림 방지. -->
```

## 3.6 DESIGN.md §4 — responsive invariant (DS-7)

**기존**:

```
## 4. Layout
<!-- 4 또는 8 단위 base spacing, t-shirt scale 또는 numeric -->
```

**변경**:

```
## 4. Layout
<!-- 4 또는 8 단위 base spacing, t-shirt scale 또는 numeric.
     + 반응형 = invariant 소유 (ADR-027#amend-7 — 임의 breakpoint 숫자 목록 강제 아님):
       content order(작은 화면에서도 읽기 순서 보존) / container transition(고정폭→유동) / table strategy(가로 스크롤은 표 자체 영역만, page 넘침 금지) / sticky occlusion(고정 요소가 콘텐츠 가림 방지) / 320 CSS px reflow(가로 스크롤·클리핑 없음) / text fit(말줄임보다 줄바꿈 우선) / essential-2D exception(표·캔버스 등 본질적 2차원은 contained region만 스크롤 + 그 region은 keyboard focus/name 보유). -->
```

## 3.7 DESIGN.md §7 — category state 계약 (DS-7)

**기존**:

```
## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty. -->
```

**변경**:

```
## 7. Components
<!-- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
     상태 = category 계약 (ADR-027#amend-7 — 전 컴포넌트 8상태 강제 대체):
     - interactive primitive (Button/Input 등): default / hover / active / focus-visible / disabled (비동기 동작이면 loading 추가).
     - data composite / screen (Card·리스트·화면): default / loading / empty / error / success.
     - static primitive (Text/Icon 등): 상태 매트릭스 없음.
     - 역할별 semantic 상태(해당 컴포넌트에 한): checkbox/radio=checked·indeterminate, tab/segmented=selected, disclosure/accordion=expanded, input=invalid·read-only 등 — 역할이 요구하는 상태를 위 category 위에 추가.
     N/A는 category상 expected 상태를 *의도적으로* 뺄 때만 명시. -->
```

## 3.8 DESIGN.md §8 — semantic motion contract (DS-6)

**기존**:

```
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-027#d24)
     duration/easing + `prefers-reduced-motion` 분기. Material 3 기준: 라우팅 UI 160~240ms, entrance/exit 240~360ms -->
```

**변경**:

```
## 8. Motion
<!-- (보일러플레이트 확장 섹션 — Stitch 공식 canonical 8섹션 외. 근거: Material 3 motion / a11y. ADR-027#d24)
     semantic motion contract (ADR-027#amend-7 — 5항목):
     - 목적: 각 모션이 feedback / continuity / orientation / state-change 중 무엇을 전달하는가 (장식 목적 금지).
     - 빈도: 반복 흐름일수록 motion budget↓ (자주 보는 전환은 짧고 절제).
     - 실행: duration·easing은 project token으로 (interruptible, layout shift 없음).
     - 접근성: `prefers-reduced-motion`에서 정보손실 없는 대체 상태 제공.
     - 금지: decorative infinite/repeated 모션.
     수치는 project token의 *시작 default*로만 (보편 법칙 아님): 버튼 100~160ms / 라우팅 UI 160~240ms / entrance·exit 240~360ms (Material 3 참고). -->
```

## 3.9 DESIGN.md §9 — 접근성 + category 정합 (DS-2)

**기존** (§9 주석 내 두 줄):

```
     - hierarchy는 size+weight+color 중 2축 이상
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 8 상태 매트릭스 정의 (특히 empty/loading/error 누락 빈번)
```

**변경**: "8 상태 매트릭스" 줄을 category로 바꾸고, "hierarchy는 …" 다음에 접근성 블록을 삽입한다:

```
     - hierarchy는 size+weight+color 중 2축 이상
     [접근성 — WCAG 2.2, ADR-027#amend-7]
     - 대비: 정상 텍스트 4.5:1 / 큰 텍스트(굵은 18.66px+ 또는 24px+) 3:1 / 비텍스트 UI·아이콘·상태 경계 3:1
     - 포커스 링 제거(`outline:none`만) 금지 — 대체 visible focus 필수
     - 키보드: 모든 인터랙션은 키보드로 도달·조작 가능
     - 아이콘 버튼: accessible name 확보 — 브라우저 computed name(aria-label·aria-labelledby·감싼 visible text·alt·title 등 *어느 출처든*; aria-label 강제 아님). 정밀 판정은 실화면 axe(design-gate.mjs 러너·stack-guard)
     - 색-단독 금지: 상태·의미를 색으로만 표시 금지(아이콘·텍스트·패턴 병행)
     - 한 화면 primary CTA 2개 이상 금지
     - 모든 motion에 `prefers-reduced-motion` 분기
     - 모든 컴포넌트에 ## 7 의 category별 expected 상태 정의 (interactive/data/static — 특히 empty/loading/error/success 누락 빈번)
```

**왜**: 접근성은 기본 웹 스택의 기본기다. LLM이 못 잡는 정밀 비율은 §3.17의 실화면 axe가 결정적으로 잡고, 여기 문서 계약은 "확실히 잡히는 것"을 강하게 못박는다.

> **커밋 (Phase 3 전반 — 거버넌스 ADR + DESIGN 내용)**:
> `feat(design): add Design Workflow ADR-058 (supersede ADR-049) and reissue DESIGN.md contract via ADR-027 amend 7`

## 3.10 researcher.md — 디자인 레퍼런스 모드 재설계 (DS-1)

**기존** (`.claude/agents/researcher.md` `## 디자인 레퍼런스 모드` 전체):

```
## 디자인 레퍼런스 모드 (ADR-040#amend-4)
호출 측이 "디자인 레퍼런스 모드"를 명시하면(주로 /bootstrap-design R0):
- 목적: 레퍼런스의 시각 시스템을 **코드 증거**로 추출한다 — 텍스트 인상 요약("미니멀하고 모던함")이 아니라 실제 값.
- 소스 위계: ① 사용자 제공 URL(raw CSS 파일이면 WebFetch로 직접 추출) → ② 오픈소스 디자인 토큰 패키지(WebSearch로 발견 → unpkg/GitHub raw에서 fetch — 예: GitHub Primer, Shopify Polaris, IBM Carbon, Adobe Spectrum, Atlassian) → ③ 정성 소스(디자인 요약 사이트 — 방향 어휘 보조로만).
- 추출 대상: `:root` CSS custom property / font-family stack / hex·rgba 색 상위 N개 / spacing·radius·shadow 수치. minified 전문 반환 금지 — 증류만.
- 한계 정직 보고: 일반 HTML 페이지는 markdown 변환으로 stylesheet URL·CSS가 소실됨 — 발견 불가면 "추출 불가 — <사유>"를 반환하고 날조하지 않는다. CSS-in-JS/Tailwind JIT는 수율 낮음 명시.
- 값 복제 금지: 반환에 "추출 토큰은 구조 학습용 — 통째 복제는 특정 서비스 클론화" 1줄 포함.
- 반환 양식: DESIGN_RESEARCH.md 레퍼런스 섹션(color signature/typography/density/motion) + `### 추출 토큰 (코드)` fenced block(hex/font/spacing/radius/shadow 실값).
```

**변경**:

```
## 디자인 레퍼런스 모드 (ADR-040#amend-4 / ADR-058)
호출 측이 "디자인 레퍼런스 모드"를 명시하면(주로 /bootstrap-design R0):
- 목적: 레퍼런스를 **관측 기반 증거**로 확보한다 — 방향 어휘(behavior)는 docs·상호작용을 봤을 때만, 값(color/type/spacing)은 실제 코드/토큰을 봤을 때만 기록. "official"은 provenance이지 품질 점수 아님.
- **역할별 수집 (ADR-058 role 3종)**:
  - `task/behavior`·`identity/craft` 방향(Layer A): charter 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 WebSearch로 자율 탐색 → 방향 어휘 + what-to-borrow/avoid. 대부분 2차 소스라 값 추출은 안 됨(그래서 Layer B 별도).
  - `implementation system` 값 grounding(Layer B): 아래 핀 목록에서 실제 토큰 값 추출.
- **값 grounding 핀 목록 (검증된 원본 — 추측·404 금지)**:
  - Primer — `@primer/primitives` (unpkg `dist/css/...`·`dist/tokens/...json`)
  - Radix Colors — `@radix-ui/colors` (`*.css` — 예: `slate.css`의 `--slate-1..12` 실 hex + p3)
  - Shopify Polaris — `@shopify/polaris-tokens` (`dist/...` CSS/JSON)
  - Tailwind — 공개 default theme(색 스케일·spacing)
  - shadcn/ui — 토큰이 CSS가 아니라 JSON/registry에 있으므로 **JSON 엔드포인트** fetch
  - **비압축 개별 토큰 파일 우선**(minified 번들은 몇 값만 나옴). raw CSS가 없으면 **JSON 토큰 엔드포인트로 확장**.
  - **예시 URL + 버전 해석 규칙**(404 재발 방지): 정확 버전 고정 `unpkg.com/<pkg>@<x.y.z>/<path>` 권장. 버전 미상이면 `@latest`로 시도 → 404면 GitHub raw(`raw.githubusercontent.com/<org>/<repo>/<tag>/<path>`) fallback. 예: `unpkg.com/@radix-ui/colors/slate.css` · `unpkg.com/@primer/primitives/dist/tokens/` · `unpkg.com/@shopify/polaris-tokens/dist/` · Tailwind 색은 공식 문서/`tailwindcss` 패키지 `theme`. (정확 경로·파일명은 패키지 버전마다 다르므로 fetch 전 디렉터리 확인 — 추측 금지.)
- **거부 목록**: mobbin·copycats류 "가짜 요약/갤러리" 사이트는 값 추출 소스로 쓰지 않는다(이름 찾는 lead로만, 최종 근거는 canonical 제품·공식 문서·source/token 코드로 승격).
- 추출 대상: `:root` CSS custom property / font-family stack / hex·rgba 상위 N개 / spacing·radius·shadow 수치 / JSON 토큰. minified 전문 반환 금지 — 증류만.
- 한계 정직 보고: 실제 제품 페이지(Linear/Stripe/Vercel 등)는 markdown 변환으로 CSS가 소실돼 값 추출이 자주 실패([관측됨] 0/3). stylesheet/토큰 URL을 못 찾으면 "추출 불가 — <사유>" 반환, 날조 금지.
- 값 복제 금지: "추출 토큰은 구조 학습용 — 통째 복제는 클론화" 1줄 포함.
- 반환 양식: DESIGN_RESEARCH.md 최소 schema(source/canonical | role | 뒷받침한 결정 | 검증(visual/behavior/code) | 관측일 | borrow | avoid | confidence) + `#### 추출 토큰 (코드)` fenced block.
```

**기존** (`.claude/agents/researcher.md` frontmatter — `model: sonnet`): DS-1은 웹 리서치 품질을 요구하지만 이 가이드는 모델 별칭 정책(ADR-004)을 건드리지 않는다. **frontmatter는 수정하지 않는다**(현행 `model: sonnet` 유지 — 별칭 변경은 범위 밖).

**추가 — ADR-040 부분 supersede 명시 (SSOT 충돌 해소)**: ADR-040#amend-4가 아직 소스 위계 "①사용자 URL 1순위"를 정책 SSOT로 유지해 ADR-058(AI 자율 디폴트)과 모순된다. ADR-040 `## 현재 유효 결정`의 디자인 레퍼런스 모드 줄을 부분 supersede로 표기한다.

**기존** (`docs/90-decisions/boilerplate/ADR-040-external-research-capability.md` `## 현재 유효 결정` 마지막 줄):

```
- 디자인 레퍼런스 모드(#amend-4): 호출 측 명시 시 코드 수준 토큰 추출 — 소스 위계 ①사용자 URL ②오픈소스 토큰 패키지 ③정성 소스, 추출 불가 시 정직 보고·값 통째 복제 금지.
```

**변경**:

```
- 디자인 레퍼런스 모드(#amend-4): 호출 측 명시 시 코드 수준 토큰 추출 — **소스 위계·"사용자 URL 1순위"는 [ADR-058](ADR-058-design-workflow.md)이 evidence-on-demand(AI 자율 리서치 디폴트 + 핀 목록 값 grounding, 사용자 입력=옵션 힌트)로 부분 supersede**. 추출 대상·정직 보고·값 통째 복제 금지 규율은 유효.
```

> ADR-058 `## 참고`의 "ADR-040#amend-4" 항목도 "(소스 위계는 ADR-058이 부분 supersede)"로 한 조각 보강한다.

**왜**: 레퍼런스 값 확보가 "운 좋으면 됨"에서 "핀 목록으로 안정적 확보 + 방향은 자율 리서치"로 바뀐다. ADR-040이 구 위계를 SSOT로 남기면 두 ADR이 모순되므로 부분 supersede를 명문화(ADR-045 부분 supersede 관례 — ADR-041/050 동형).

## 3.11 bootstrap-design R0 — evidence-on-demand (DS-1) + DESIGN_RESEARCH 최소 schema (DS-1e/DS-7b)

**기존**: `.claude/skills/bootstrap-design/SKILL.md`의 `## R0 — 레퍼런스 추출 + 안티-레퍼런스 + 레퍼런스 노트 영속화 (ADR-049#d28)` 라운드 전체(heading부터 `## R1` 직전까지). 현재 R0는 5단 grounding 위계(①=사용자 URL 1순위), 안티-레퍼런스 1~2개 **필수**, DESIGN_RESEARCH.md 템플릿(color signature/typography/density/motion 4축).

**변경**: 그 R0 라운드 전체를 아래로 교체한다:

```
## R0 — 리서치: evidence-on-demand (ADR-058)

> 디폴트는 **AI 자율 리서치**. 사용자 제공 URL·취향은 *우선 힌트*(prerequisite 아님) — 있으면 Layer A에 우선 반영, 없어도 확인 게이트 없이 자율 진행.

- **먼저 방향타를 적는다**: primary task / 결정 순간 / 실패·복구 / 정체성 tension을 1줄씩. 리서치는 이 방향타를 채우는 것.
- **Layer A (방향 — 자율)**: charter 기획 방향·서비스 성격에 맞는 디자인 방향·레퍼런스 제품을 **researcher(디자인 레퍼런스 모드)** 위임으로 탐색 → 방향 어휘 + what-to-borrow/avoid. (Codex: 메인 세션이 researcher.md를 읽고 인라인 수행.)
- **Layer B (값 grounding)**: Layer A 방향에 맞는 오픈소스 토큰 패키지에서 실제 값 추출 — researcher 핀 목록(Primer/Radix/Polaris/Tailwind/shadcn). raw CSS 없으면 JSON 토큰 엔드포인트. 닫힌 제품은 "추출 불가 — <사유>" 정직 표기.
- **Layer C (포맷)**: Google 공식 예시 DESIGN.md는 **R5에서만** format fixture로 씀 — R0~R2 창작 컨텍스트에 넣지 않는다(glassmorphism/보라 예시가 §9 anti-slop 오염).
- **role 3종**: `task/behavior` · `identity/craft` · `implementation system`. counter-reference(안티-레퍼런스)는 *미해결 tension이나 실제 monoculture가 있을 때만* — **필수 아님**(구 "안티-레퍼런스 1~2개 필수"를 조건부로 완화).
- **정지 규칙**: 고정 최소 개수 없음 — evidence coverage가 차면 멈춘다. designer 최종 입력 보통 **3~5개 이하**(단순 내부 도구는 더 적게).
- **관측 기반 주장만**: visual 주장은 실화면/스크린샷 봤을 때만, behavior 주장은 docs/interaction 봤을 때만 기록. broad search·gallery·Dribbble/Behance는 이름 찾는 lead로만 허용 후 canonical로 승격.
- concept 안에서는 **coherent primary system 1개**. 명시 gap 시에만 secondary primitive(**Radix는 색만 fallback** — 타이포/레이아웃/IA/모션은 ground 못함).
- **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다**(불변 — ADR-027#amend-2 비결정 존중).
- **레퍼런스 노트 영속화 (필수, `--fast`는 minimal)**: `docs/20-system/DESIGN_RESEARCH.md`에 **최소 schema**로 남긴다:

  ```markdown
  # 디자인 리서치 (레퍼런스 + 시안 선택 근거)

  > 모드: Reference (/bootstrap-design R0/R2 산출). SSOT는 DESIGN.md(확정 결정).
  - 조사일: <YYYY-MM-DD>

  ## 레퍼런스   <!-- R0 — 각 항목 최소 schema (ADR-058) -->
  ### <source/canonical> — <URL>
  - role: task/behavior | identity/craft | implementation system
  - 뒷받침한 결정: <이 레퍼런스가 뒷받침하는 디자인 결정>
  - 검증(provenance): visual | behavior | code   <!-- 실제로 본 것 기준 (provenance) -->
  - 관측일: <YYYY-MM-DD>
  - borrow: <1줄> / avoid: <1줄>
  - confidence/caveat: <1줄>
  #### 추출 토큰 (코드)   <!-- Layer B — hex/font/spacing/radius/shadow·JSON 실값. 미추출 시 "추출 불가 — <사유>" -->

  (레퍼런스는 coverage가 찰 때까지 — 보통 3~5개 이하)

  ## counter-reference   <!-- 조건부 — 미해결 tension·실제 monoculture 시에만 -->
  - <"~같지 말 것"> — <이유 1줄>

  ## grounding 출처   <!-- 자율 조사 / 사용자 URL / "추출 불가" 등 -->

  ## 시안 옵션   <!-- R2 REFINE/EXPLORE 카드 (선택 후 채움) -->
  ## 최종 선택   <!-- R2 -->
  ```

- DESIGN.md `## 1 Overview`는 본 노트를 상대경로 링크(`[디자인 리서치](DESIGN_RESEARCH.md)`) + borrow/avoid 1~2줄 + 긍정적 정체성(§1 필드)만 인라인. `## 시안 옵션`·`## 최종 선택`은 R2 종료 후 채운다(아래 R2-2).
```

**기존** (skill 헤더 패턴 줄):

```
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 **designer**를 단발 sub-call로 위임(ADR-049#amend-2 — 코드 증거 수집은 researcher 디자인 레퍼런스 모드). 종료 후 사용자가 `/clear` 권장 (R0~R6 인터랙션이 다음 task 컨텍스트에 잡음).
> 라운드 구조 SSOT는 ADR-049(concept-mockup-first). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts)·인터페이스 할당 SSOT는 ADR-027.
```

**변경**: `ADR-049` 참조를 `ADR-058`로 바꾼다(라운드 구조 SSOT 이관):

```
> 패턴: `discover-product` 차용 — `context: fork`를 명시하지 않아 메인 세션이 R0~R6를 직접 운전한다. R0 방향 리서치·값 grounding은 `Agent` 도구로 **researcher**(디자인 레퍼런스 모드) + 분해·시안 authoring은 **designer** 단발 sub-call 위임(ADR-058). 종료 후 사용자가 `/clear` 권장.
> 라운드 구조·R0 리서치·수용 게이트·시안 카드 SSOT는 ADR-058(design workflow). DESIGN.md *내용*(8섹션+Motion / 3-tier 토큰 / Don'ts / 정체성·a11y·category state·responsive)·인터페이스 할당 SSOT는 ADR-027.
```

**기존** (`--fast` 모드 R0 정의):

```
- `--fast`: R0(위계 ①·⑤만 — 사용자 URL 있으면 사용, 없으면 확인 게이트 후 모델 지식 + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). **R2(concept 시안)·R4(컴포넌트 인벤토리)·R6(preview)는 생략** — R5 저장은 *생략하지 않는다*(생략하면 DESIGN.md 가 안 채워져 skill 목적 무산). R1은 *완전 생략 금지* — R3 토큰 결정의 근거이므로 *minimal 1줄*(예: "monochrome + 1 accent")이라도 채운다. `--fast`에서 concept 시안이나 preview가 필요하면 종료 후 사용자가 "concept 시안 생성" 또는 "design-preview 생성"을 명시 발화 → R2 또는 R6만 단독 수행.
```

**변경**: R0를 evidence-on-demand minimal로 바꾼다(위계 표현 제거):

```
- `--fast`: R0(Layer A/B minimal — 있으면 사용자 힌트 우선, 없으면 자율 조사 1~2개로 최소 grounding + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). **R2(concept 시안)·R4(컴포넌트 인벤토리)·R6(preview)는 생략** — R5 저장은 *생략하지 않는다*. R1은 *완전 생략 금지*(minimal 1줄). browser가 provision된 UI면 값싼 axe/reflow는 유지 권장(ADR-058 D3). `--fast`에서 concept·preview가 필요하면 종료 후 명시 발화로 R2/R6 단독 수행.
```

## 3.11b bootstrap-design R5 — Google 포맷 fixture point-check (DS-1 Layer C)

**기존** (`.claude/skills/bootstrap-design/SKILL.md` R5 상태 승격 불릿):

```
- **DESIGN.md 상태 승격 (ADR-027#amend-3 / ADR-056)**: 본 R5 저장 완료 시 `docs/20-system/DESIGN.md` `## 0. Status`를 `draft` → **`living`**으로 갱신한다(정식·`--fast` 경로 모두 수행 — R6 생략 프로젝트도 승격되도록). 비-UI 삭제 경로는 불변.
```

**변경**: 그 불릿 *앞*에 포맷 fixture 점검 불릿을 추가한다(삽입만):

```
- **포맷 완성도 point-check (ADR-058 Layer C)**: R5 저장 직후 Google 공식 예시 DESIGN.md(`google-labs-code/design.md/examples` — authoritative, 예: `examples/paws-and-paths/DESIGN.md`(실측 확인된 완성 예시: Brand&Style/Colors/Typography/Layout/Elevation/Shapes/Components + 토큰))와 대조해 메인 세션이 *섹션 완성도·빠짐*만 advisory 점검한다(별도 agent 호출 불요 — 예시 fetch + 비교). **미감·값·시각 방향은 참조 금지**(공식 예시가 glassmorphism/보라 그라디언트라 §9 anti-slop 오염 — format fixture로만). (옵션) UI+Node면 `@google/design.md lint`(stack-guard 권장 명령)도 이 시점에 실행 가능.
- **DESIGN.md 상태 승격 (ADR-027#amend-3 / ADR-056)**: 본 R5 저장 완료 시 `docs/20-system/DESIGN.md` `## 0. Status`를 `draft` → **`living`**으로 갱신한다(정식·`--fast` 경로 모두 수행 — R6 생략 프로젝트도 승격되도록). 비-UI 삭제 경로는 불변.
```

**왜**: ADR-058 D2의 Layer C("R5에서 format fixture")가 실제 R5 단계로 실체화된다 — 지금까진 정책만 있고 실행 지점이 없었다.

## 3.12 bootstrap-design R2 — REFINE/EXPLORE 카드 (DS-5) + 수용 게이트 (DS-3)

**기존** (`## R2 — 다중 concept 시안` 의 R2-1 divergence 카드 불릿):

```
- **divergence 카드 (ADR-049#amend-2)**: 각 concept에 {① 배타적 레퍼런스 borrow 축(R0 레퍼런스 중 concept별 배정 — 공유 금지; 레퍼런스 수 < concept 수면 동일 레퍼런스의 서로 다른 축(색/밀도/타이포/모션)을 배타 배정), ② 전용 안티-레퍼런스 1개, ③ 밀도/타이포/색 전략 중 최소 2축 상이}를 명시 배정하고 `DESIGN_RESEARCH.md ## 시안 옵션`에 카드를 기록한다. 두 concept이 같은 accent 전략·같은 borrow를 공유하면 재생성. 단 모든 concept이 R0 안티-레퍼런스와 `## 9` Don'ts는 공통 회피.
```

**변경**:

```
- **REFINE / EXPLORE 카드 (ADR-058 — 안전/과감 아님)**: 두 기본안을 이렇게 정의한다:
  - **REFINE**: 익숙한 task convention 우선 + restrained signature (검증된 패턴을 깔끔하게).
  - **EXPLORE**: signature-led이되 *같은* 익숙한 control/flow를 보존 (개성은 시각·마감에, 조작 흐름은 익숙하게).
  - 3번째 안은 *풀리지 않은 명시적 tension이 있을 때만*.
  각 concept 카드에 `task hypothesis | preserved convention | visible signature | failure sign`을 명시하고 `DESIGN_RESEARCH.md ## 시안 옵션`에 기록한다. **signature가 primary task를 더 빨리 이해시키지 못하면 장식 → 제거**(실험에서 rail·route 장식이 coherence를 해침). counter-reference(안티-레퍼런스)는 R0에서 조건부로 확보된 경우에만 공통 회피 대상으로 둔다. 모든 concept은 `## 9` Don'ts를 공통 회피. **익숙한 control/flow(조작 흐름)는 두 안 모두 보존하는 *공통 통제변수*** — 달라야 하는 건 layout hypothesis·visible signature다. 두 concept이 같은 **layout hypothesis·signature**를 공유하면 재생성(control/flow가 같은 건 재생성 사유 아님 — 통제변수). **concept 대표 화면은 실카피 + 대표 실데이터로 채워 렌더한다(빈 화면 금지 — R2-G populated axe가 유효하려면; dogfood 빈-화면 3.70:1 맹점 방지).**
```

**기존** (R2-1.5 구별성 비평):

```
### R2-1.5. 구별성 비평 (순차 1회 — ADR-049#amend-2)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 divergence 카드 + concept별 토큰 요약만, HTML 전문 투입 금지) 1회로 판정: ① concept 간 실질 구별성(같은 카드 축을 침범했는가) ② 안티-레퍼런스·`## 9` Don'ts 근접도. designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.
```

**변경**: 판정 항목에 **시안 내부 조화 검사(DS-7a)**를 추가하고 카드 기준을 REFINE/EXPLORE로 갱신:

```
### R2-1.5. 구별성·조화 비평 (순차 1회 — ADR-058)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 REFINE/EXPLORE 카드 + concept별 토큰 요약 — 이 단계는 렌더 *전* 값싼 개념 점검이라 HTML 전문 투입 금지; *픽셀* 판정은 뒤의 R2-G가 스크린샷으로 한다) 1회로 판정: ① concept 간 실질 구별성(REFINE/EXPLORE 성격이 실제로 다른가, signature가 task를 돕는가) ② `## 9` Don'ts·(있으면) counter-reference 근접도 ③ **시안 내부 조화 — *카드·토큰 수준의 선언된 짜깁기 신호만***(예: 상충하는 소스를 한 시안에 섞겠다는 카드). *렌더 픽셀의 실제 조화*는 R2-G 스크린샷 리뷰가 확인한다(R2-1.5는 카드만 보므로 여기서 픽셀 조화를 단정하지 않는다). designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.
```

**변경 (신규 게이트 단계)**: R2-1.5 다음, R2-2 앞에 새 단계 R2-G를 삽입한다:

```
### R2-G. 수용 게이트 (ADR-058 D3 — full 모드)
`--fast`는 본 게이트 생략(단 browser 있으면 값싼 axe/reflow는 유지 권장). full 모드는:
- **렌더**: 각 concept HTML을 Playwright로 **1280 + 375** 캡처(desktop 폭은 프로젝트 target 명시 시 그 값). stack-guard가 깐 Playwright 재사용.
- **상시 결정적 검사**: **320 CSS px reflow**(page overflow / viewport escape / clipped text) + **populated DOM axe**(빈 화면 아님 — 대표 화면에 실데이터 채운 상태).
- **독립 픽셀 판정**: reviewer(design surface)가 1280/375 스크린샷을 Read로 열람해 위계·밀도·domain fit·장식 slop 판정(생성자 designer와 분리). LLM reviewer 1명.
- **차단(block) — 러너 결정적**(design-gate.mjs가 계산): serious/critical axe · page overflow · **viewport escape · clipped text**(320/375 geometry — check-reflow-320.cjs 이식). **차단(block) — reviewer 픽셀 판정**(스크린샷 열람, 러너가 못 잡는 *주관적* 영역): 위계 붕괴(nested card·장식 rail) · 밀도 · 장식 slop · critical overlap이 primary task를 저해할 때. **보고(report)**: moderate/minor axe + 취향·밀도 finding.
- **수동 smoke**(사람 몫): Tab 순서 · visible focus · trap 없음 · Escape close · 색 외 상태표식.
- **repair loop**: 차단 finding이 있으면 실패 selector + 요약을 **designer에 되먹여 재생성** → 재검사. **retry ≤2**, 초과 시 승인 보류 + brief(R0/R1) 재검토. 여전히 fail이면 그 concept은 선택지에서 제외(사용자에게 사유 echo).
- **정리**: 게이트용 임시 렌더/스크린샷은 통과 판정 후 정리(concept HTML은 R2-2 선택까지 유지 — R6-3에서 최종 삭제).
```

**왜**: 실측상 진짜 품질 지렛대는 이 폐쇄 루프(serious 5/8→0/8)다. 스크린샷만 본 사람은 대비 실패를 놓치므로 axe·320이 결정적으로 잡고, 픽셀 감사는 장식 slop·위계를 잡는다.

## 3.13 bootstrap-design R3 밀도 힌트 (DS-7f) + R6 게이트 (DS-3) + R4 category state (DS-7d)

**기존** (R3 토큰 불릿 마지막):

```
- radius / shadow / motion (duration·easing·`prefers-reduced-motion`).
- WCAG 4.5:1 텍스트 대비 검증 권장.
```

**변경**: 밀도 힌트 한 줄 추가:

```
- radius / shadow / motion (duration·easing·`prefers-reduced-motion` — §8 semantic motion contract 정합).
- WCAG 4.5:1 텍스트 대비 검증 권장(정밀 검사는 R6/게이트의 axe가 결정적).
- **밀도 힌트**: 제품 성격에 맞는 밀도를 1줄 — 대시보드=조밀 / 마케팅·랜딩=여유 (DESIGN.md §1 contextual density와 정합).
```

**기존** (R4 헤더 + 8상태 강제):

```
## R4 — 컴포넌트 인벤토리 + 상태 매트릭스 (ADR-027#d6/#d7)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 각 컴포넌트마다 상태 매트릭스 강제: default / hover / active / focus / disabled / loading / error / empty.
```

**변경**: category state 계약으로:

```
## R4 — 컴포넌트 인벤토리 + category state 계약 (ADR-027#amend-7)
- primitives (Button/Input/Text/Icon), composites (Card/Modal/Toast), patterns (Form/EmptyState/ErrorState/LoadingState).
- 상태 = category별 expected (DESIGN.md §7 정합): interactive primitive(default/hover/active/focus-visible/disabled, async면 loading) · data composite/screen(default/loading/empty/error/success) · static primitive(상태 매트릭스 없음). N/A는 category상 expected를 의도적으로 뺄 때만.
```

**기존** (R6-1 preview Components 렌더 줄):

```
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 8 상태(default/hover/active/focus/disabled/loading/error/empty)로 나란히 렌더. hover/active/focus는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
```

**변경**:

```
  2. **Components** — DESIGN.md `## 7` 인벤토리의 각 컴포넌트를 그 category의 expected 상태(§7 계약 — interactive: default/hover/active/focus-visible/disabled[+loading] · data/screen: default/loading/empty/error/success · static: 없음)로 나란히 렌더. hover/active/focus-visible는 CSS pseudo + *상태 클래스 변형*(예: `.is-hover`)을 둘 다 둬서 정적 캡처에서도 보이게 한다.
```

**변경 (R6 게이트)**: R6-2 검토 루프에 R2-G와 동일한 결정적 검사를 얹는다. R6-1 self-check 줄 다음에 한 단락 추가:

**기존**:

```
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check해 위반 의심 항목을 출력에 보고(자동 차단 X).
```

**변경**:

```
- 생성 직후 DESIGN.md `## 9 Do's and Don'ts` 위반을 self-check해 위반 의심 항목을 출력에 보고(자동 차단 X).
- **수용 게이트 (ADR-058 D3 — full 모드)**: preview를 `node scripts/design-gate.mjs docs/20-system/design-preview.html`로 검사한다(R2-G와 동일 분리 — **러너 결정적 차단**: serious/critical axe·320/375 geometry(page overflow·viewport escape·clipped text); **reviewer 픽셀 차단**(스크린샷): 위계 붕괴·밀도·장식 slop·critical overlap; moderate/minor+취향 = 보고). 차단 발견 시 **DESIGN.md(SSOT)를 먼저 고치고** preview 재생성(retry ≤2, 초과 시 승인 보류 + brief 재검토). exit 2(Needs Install)면 사유 echo 후 승인 보류. `--fast`는 생략(단 browser 있으면 값싼 axe/reflow 유지 권장).
```

**왜**: R2(concept)와 R6(preview) 두 지점에서 렌더·DOM을 결정적으로 검사해 배포불가 결함을 승인 전에 제거한다.

## 3.14 designer.md — R0 evidence-on-demand + REFINE/EXPLORE + repair 되먹임 (DS-1/5/3)

**기존** (`.claude/agents/designer.md` 역할 목록):

```
역할:
- 레퍼런스 분해(R0): 코드 증거(추출 토큰 — researcher 디자인 레퍼런스 모드 산출)를 입력으로 color signature / typography pairing / density / motion 톤 + what-to-borrow / what-to-avoid를 분해한다.
- 디자인 원칙(R1): actionable verb 원칙 3~5개. 모호어("modern/clean/sleek") 금지.
- concept 시안(R2): divergence 카드에 따라 *서로 확실히 다른* 방향의 자기완결 HTML/CSS 시안을 authoring한다.
```

**변경**:

```
역할:
- 레퍼런스 분해(R0): researcher가 확보한 방향(Layer A) + 추출 토큰(Layer B)을 입력으로 what-to-borrow/avoid + role별(task/behavior·identity/craft·implementation system) 정리를 분해한다(ADR-058 evidence-on-demand).
- 디자인 원칙(R1): actionable verb 원칙 3~5개. 모호어("modern/clean/sleek") 금지.
- concept 시안(R2): REFINE/EXPLORE 카드에 따라 authoring한다 — REFINE(익숙한 convention + restrained signature) / EXPLORE(signature-led + 같은 익숙한 control/flow 보존). signature가 primary task를 더 빨리 이해시키지 못하면 장식이므로 넣지 않는다(ADR-058). 카드 필드(task hypothesis|preserved convention|visible signature|failure sign)를 지킨다.
- **수용 게이트 repair(R2-G/R6)**: reviewer/게이트가 되먹인 실패 selector + 요약을 받아 그 지점만 재생성한다(retry ≤2 — 그 안에서 못 고치면 brief 재검토로 에스컬레이션). identity·layout 전면 재설계가 아니라 지목된 결함(대비·overflow·clipping 등)만 고친다.
```

**추가 — R5 프로토타입 PX 마커 의무 (INST-1 단일 source)**:

**기존** (`.claude/agents/designer.md` 역할의 R5 프로토타입 줄):

```
- 마일스톤 화면 프로토타입(plan-milestone R5): 확정된 DESIGN.md 토큰(`:root` CSS 변수만 참조 — 정의 블록 밖 raw hex 금지) 위에서 화면 구성·인터랙션 주석·실카피·못생긴 상태(긴 제목/빈 목록/로딩/에러/항목 과다)를 채운 프로토타입을 authoring한다.
```

**변경**:

```
- 마일스톤 화면 프로토타입(plan-milestone R5): 확정된 DESIGN.md 토큰(`:root` CSS 변수만 참조 — 정의 블록 밖 raw hex 금지) 위에서 화면 구성·인터랙션 주석·실카피·못생긴 상태(긴 제목/빈 목록/로딩/에러/항목 과다)를 채운 프로토타입을 authoring한다. **각 경험 결정에 `<!-- PX-<screen>-NN: <한 줄 결정> -->` 마커를 의무로 단다**(ADR-056#amend-1 — 이 마커가 PX 단일 source, plan-milestone R5-5가 그대로 복사; 재추출 drift 방지).
```

**왜**: designer가 evidence-on-demand 입력과 REFINE/EXPLORE 카드, repair 되먹임을 명시적으로 다루게 한다. PX 마커를 designer가 의무로 심어야 R5-5가 "재추출"이 아니라 "복사"만 하고, 그래야 INST-1이 겨눈 drift(프로토타입 결정이 AC로 안 내려감)가 계획 단계에서 기계적으로 잡힌다.

## 3.15 reviewer.md — a11y 차원 신설 + category state + bootstrap-design 게이트 호출자 (DS-2/3/7)

**기존** (호출 surface `design` 줄):

```
- `design`: Design Consistency 5 (아래 별도 섹션 — ADR-027#amend-1). UI 프로젝트에서 stabilize-milestone 이 호출.
```

**변경**:

```
- `design`: Design Consistency 6 (아래 별도 섹션 — ADR-027#amend-1·#amend-7). UI 프로젝트에서 stabilize-milestone(구현 후 감사) 및 **bootstrap-design R2-G/R6 수용 게이트(ADR-058 — concept/preview 픽셀·구별성 판정)**가 호출.
```

**기존** (Design Consistency 섹션 헤더 + 3·4번 차원):

```
## Design Consistency 5 차원 (design surface 전용 — ADR-027#amend-1 / ADR-056)

stabilize-milestone 이 UI 프로젝트 surface 호출 시 본 차원 적용. 호출 측이 렌더 증거(스크린샷 갤러리 경로·visual-qa 결과)를 주입하면 Read로 이미지를 열람해 판단에 사용한다(ADR-027#amend-6). 증거 없으면 기존 grep·문서 기반 판정만.
```

**변경** (헤더를 6차원으로, 호출자·게이트 문구 보강):

```
## Design Consistency 6 차원 (design surface 전용 — ADR-027#amend-1·#amend-7 / ADR-056 / ADR-058)

stabilize-milestone(구현 후) 및 bootstrap-design R2-G/R6 수용 게이트(ADR-058 — concept/preview)에서 호출. 호출 측이 렌더 증거(스크린샷·1280/375 캡처·axe 결과)를 주입하면 Read로 이미지를 열람해 픽셀 판정(위계·밀도·domain fit·장식 slop)에 쓴다. 증거 없으면 grep·문서 기반 판정만.
```

**기존** ([Design-state] 차원):

```
3. **[Design-state]** — **DESIGN.md `## 7` 본문에 등록된 컴포넌트 정의** 가 default/hover/active/focus/disabled/loading/error/empty 8 상태 매트릭스를 *모두 설계* 했는가 (문서 설계 기준 — task 구현이 8 상태 모두 구현했는지는 별도 차원). 누락 발견 시 `P1 [Design-state] DESIGN.md ## 7 의 <component> 정의에 <상태> 누락`. *task 구현 단계의 use-case 한정 상태 검증* 은 validator (validate-workitem) 책임 — 본 차원과 책임 분리. (P1)
```

**변경**:

```
3. **[Design-state]** — **DESIGN.md `## 7` 본문에 등록된 컴포넌트 정의**가 그 category의 expected 상태(ADR-027#amend-7 — interactive: default/hover/active/focus-visible/disabled[+loading] · data/screen: default/loading/empty/error/success · static: 없음)를 *모두 설계* 했는가. 누락 발견 시 `P1 [Design-state] DESIGN.md ## 7 의 <component>(category) 정의에 <상태> 누락`. *task 구현 단계의 use-case 한정 상태 검증*은 validator 책임 — 본 차원과 분리. (P1)
```

**변경 (a11y 차원 신설)**: [Design-voice] (5번) 다음에 6번 차원을 추가한다:

```
6. **[Design-a11y]** (ADR-027#amend-7) — WCAG 2.2 접근성. *deterministic·강*(렌더 증거 있으면 axe 결과 반영, 없으면 grep): 포커스 링 제거(`outline:none`만) / 아이콘 버튼 accessible name 누락(computed name 부재 — aria-label·aria-labelledby·visible text·alt·title 어느 것도 없음) / 색-단독 상태표시. *LLM·권고*: 대비 비율 미달 의심(정밀 비율·computed name은 실화면 axe가 결정적 — stack-guard populated axe·design-gate.mjs). 색·포커스·라벨은 P1, 정밀 대비는 P2 권고. DESIGN.md 부재 시 skip + 명시. (P1)
```

**변경 (8상태 책임 분배 표 정합)**: 그 아래 "8 상태 매트릭스 책임 분배" 표의 마지막 행(stabilize design surface) 기준 문구를 category로 갱신한다.

**기존**:

```
| stabilize-milestone design surface [Design-state] | reviewer (design surface) | DESIGN.md `## 7` 본문에 *컴포넌트 정의가 8 상태 전체* 설계됐는가? |
```

**변경**:

```
| stabilize-milestone design surface [Design-state] | reviewer (design surface) | DESIGN.md `## 7` 본문에 *컴포넌트 정의가 그 category의 expected 상태 전부* 설계됐는가? (ADR-027#amend-7) |
```

**변경 (표 제목 + 근거 정합 — DS-7)**: 같은 "8 상태 매트릭스 책임 분배" 표의 *제목*과 *근거*도 category로 바꾼다(안 그러면 위 category [Design-state]와 한 파일 안에서 모순).

**기존**:

```
**8 상태 매트릭스 책임 분배**:
```

**변경**:

```
**상태 매트릭스 책임 분배 (category 계약 — ADR-027#amend-7)**:
```

**기존**:

```
**근거**: DESIGN.md 는 *설계 문서* (8 상태 전 설계가 컴포넌트 인벤토리의 책임). task 는 *구현 단위* (1 task 1 RGR 사이클 — 8 상태 전부 1 task 강제는 ADR-026 sizing 위반). 두 surface 가 다른 기준으로 점검해야 정합.
```

**변경**:

```
**근거**: DESIGN.md 는 *설계 문서* (category별 expected 상태 전 설계가 컴포넌트 인벤토리의 책임). task 는 *구현 단위* (1 task 1 RGR 사이클 — category 전체를 1 task 에 강제하면 ADR-026 sizing 위반). 두 surface 가 다른 기준으로 점검해야 정합.
```

**기존** ([Plan-design] 차원 — Plan Quality 섹션 9번, "8 상태 매트릭스" 문구):

```
9. **[Plan-design]** (UI 프로젝트 한정 — ADR-027#amend-1) — DESIGN.md `## 7. Components` 인벤토리 외 새 컴포넌트 즉흥 신설 / AC 본문에 raw hex 색 코드 (`#[0-9A-Fa-f]{3,6}`) / DESIGN.md `## 9. Do's and Don'ts` 위반 (anti-slop 패턴 포함 — gradient·nested cards 등) / **task 본문의 use-case 에 등장하는 상태가 AC 에 누락** (예: hover/disabled 가 본문 시나리오에 있는데 AC 미언급). *전체 8 상태 매트릭스 (default/hover/active/focus/disabled/loading/error/empty) 의 설계 여부는 별도 차원* — DESIGN.md `## 7` 본문에 컴포넌트가 *등록될 때* 8 상태가 함께 설계됐는지는 [Design-state] (stabilize-milestone `design` surface) 책임. plan 단계는 *use-case 한정* 책임. **DESIGN.md 파일 부재 시 본 차원 skip + "핵심 관찰" 에 한 줄 명시** (비-UI 프로젝트 정상 경로). / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056) (P1 권장)
```

**변경**: "8 상태 매트릭스"를 category로 바꾸고 a11y 언급을 더한다. 위 문단에서 `*전체 8 상태 매트릭스 (default/hover/active/focus/disabled/loading/error/empty) 의 설계 여부는 별도 차원*` 부분을 다음으로 교체:

```
*전체 category state (ADR-027#amend-7 — interactive/data/static) 의 설계 여부는 별도 차원*
```

그리고 문단 끝 `/ **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056) (P1 권장)` 앞에 a11y 한 조각을 더한다:

```
/ **AC·task 본문에 색-단독 상태표시·포커스 제거·아이콘 버튼 라벨 누락이 명시적으로 드러나면** DESIGN.md §9 a11y 위반 의심(ADR-027#amend-7) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056) (P1 권장)
```

**왜**: reviewer가 접근성을 6번째 차원으로 감사하고, 8상태→category 정합을 맞추며, bootstrap-design 게이트의 픽셀 판정자로 등재된다.

## 3.16 validate-plan [Plan-design] 미러 (DS-2/DS-7d)

**기존** (`.claude/skills/validate-plan/SKILL.md` 차원 9 — **validate-plan 전용**. reviewer.md의 [Plan-design]는 문구가 다른 별도 버전으로 §3.15가 이미 처리했다 — 여기서 다시 손대지 않는다):

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / 8 상태 매트릭스 누락 / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

**변경** (validate-plan 차원 9만 — reviewer.md는 §3.15에서 이미 category/a11y로 바뀜):

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / category state(§7 — interactive/data/static) 누락 / **AC·task 본문의 색-단독·포커스 제거·아이콘 라벨 누락 = §9 a11y 위반 의심**(ADR-027#amend-7) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

**왜**: plan surface의 [Plan-design]을 category state·a11y로 정합. reviewer.md [Plan-design]은 §3.15가 담당한다(둘은 *개념적* 미러 — 각자 형식이 달라 byte-identical 아님). 차원 *개수*를 안 늘리므로 카운트 표는 그대로다.

## 3.17 stack-guard — populated axe·320 reflow (DS-3) + @google/design.md lint version-pin (DS-7g)

**기존** (`.claude/skills/stack-guard/SKILL.md` 6-4-1 visual-QA breakpoint 루프):

```
     - breakpoint 루프(375/768/1440): (a) **가로 overflow** — `document.scrollingElement.scrollWidth > clientWidth` false 단언(가로 스크롤 없음). **차단**: 졸업 e2e 실패(진짜 버그, FP 드묾). (b) **요소 겹침** — `getBoundingClientRect()` 교차 점검. **권고만**(sticky header·모달·툴팁 등 정당한 겹침 FP 가능 → 차단 X, P1 기록). (c) **a11y** `@axe-core/playwright` wcag2aa — **권고만**.
```

**변경**: 320을 루프에 넣고, populated 화면에서 axe를 돌리며 serious/critical을 차단으로 올린다:

```
     - breakpoint 루프(**320**/375/768/1440): (a) **가로 overflow** — `document.scrollingElement.scrollWidth > clientWidth` false 단언(가로 스크롤 없음). **차단**: 졸업 e2e 실패(진짜 버그, FP 드묾). 320은 375만으로 놓치는 좁은 화면 실패를 잡는다(실측 반례 존재). (b) **요소 겹침** — `getBoundingClientRect()` 교차 점검. **권고만**(sticky header·모달·툴팁 등 정당한 겹침 FP 가능 → 차단 X, P1 기록). (c) **a11y** `@axe-core/playwright` — **실데이터가 채워진 대표 화면(빈 화면 아님)**에서 실행하고, **serious/critical 위반은 차단**(졸업 e2e 실패), moderate/minor는 권고. (빈 화면만 검사해 대비 실패를 놓친 dogfood 문제 해결 — ADR-058 D3.)
```

**기존** (DESIGN.md lint 권장 명령):

```
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md lint docs/20-system/DESIGN.md
  ```
- 검사 항목: broken token reference / missing primary color / WCAG contrast / orphaned token / **section ordering** 등. exit 1 on error.
```

**변경** (version-pin + runtime rule 조회 + Windows):

```
- **권장 명령** (강제 X, shared 기본값 미등록 — 사용자가 채택 시 `validate` 의 lint 단계 또는 CI에 wiring):
  ```bash
  npx @google/design.md@<x.y.z> lint docs/20-system/DESIGN.md   # version-pin (alpha라 변동 — 실제 버전 고정)
  # 규칙 목록은 문서에 박지 말고 runtime 조회: npx -p @google/design.md@<x.y.z> designmd spec --rules
  # Windows: npx -p @google/design.md@<x.y.z> designmd lint docs/20-system/DESIGN.md
  ```
- 검사 항목은 버전마다 다르므로 `spec --rules`로 조회한다(현재 broken token ref / WCAG contrast / orphaned token / section ordering 등). **format·declared-token 보조일 뿐 browser a11y 게이트가 아니다** — 실화면 접근성은 위 breakpoint 루프 (c)의 populated axe·렌더가 담당. exit 1 on error.
```

**변경 (설치 배선) — `@axe-core/playwright` devDep (Blocking 해소)**: 현재 stack-guard는 visual-qa.spec에서 `@axe-core/playwright`를 *쓰기만* 하고 **설치하지 않아** design-gate·visual-qa가 exit 2(Needs Install)로 죽는다(실측 확인). 6-2 toolchain 설치 또는 6-4-1 scaffold 시점에 `@axe-core/playwright`를 **devDep로 설치**한다(감지된 PM으로, 예: `npm i -D @axe-core/playwright`). 설치 실패는 stack-guard 6-5 `Needs Install` fallback(날조 금지). — 즉 UI 프로젝트는 Playwright(재사용) + `@axe-core/playwright`(신규 devDep) 둘을 갖는다.

> **기존 fork 마이그레이션**: stack-guard는 `이미 e2e/visual-qa.spec.* 있으면 덮어쓰지 않는다`. 그래서 이 변경 *전에* scaffold된 fork는 여전히 advisory axe·375-only다 — 그 fork에서는 `e2e/visual-qa.spec.*`의 axe 단언을 blocking으로, breakpoint에 320을 수동으로 올려야 한다(신규 scaffold만 자동 반영). 신규 프로젝트는 해당 없음.

**왜**: 렌더·DOM 검사(populated axe·320)를 stack-guard 런타임에 심어 bootstrap-design 게이트(§3.12/3.13)와 졸업 e2e가 같은 결정적 검사를 공유한다. google lint는 버전 변동에 안전하게 pin + runtime 조회로.

## 3.18 DS-3 게이트 실행 배선 — allowed-tools + 러너 스크립트 (실행 불가 결함 해소)

**왜 필요**: §3.12 R2-G·§3.13 R6 게이트가 "Playwright로 렌더 + axe"를 요구하지만, 현재 `bootstrap-design` frontmatter의 `allowed-tools`는 `Bash(rm ...)` 2개뿐이라 **렌더·axe를 실행할 권한이 없다**(게이트가 글로만 존재). 실행 배선을 준다.

**변경 (a) — bootstrap-design allowed-tools 확장**.

**기존** (`.claude/skills/bootstrap-design/SKILL.md` frontmatter):

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html) Bash(rm docs/20-system/design-concepts/concept-*.html)
```

**변경**:

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/design-preview.html) Bash(rm docs/20-system/design-concepts/concept-*.html) Bash(node scripts/design-gate.mjs*) Bash(npx playwright*)
```

**변경 (b) — 게이트 러너 신설**. 새 파일 `scripts/design-gate.mjs`(Node ESM). concept/preview HTML을 1280/375/320에서 렌더 → **결정적 검사**(page-overflow[전 뷰포트] + viewport escape·clipped text[narrow ≤375만; sr-only·aria-hidden/inert·contained-scroll·ellipsis 제외] + populated axe serious/critical[1280·320]) → `{blockers[], reports[], screenshots[]}` JSON(블록에 실패 selector 포함 — designer repair 되먹임용) + blocker 있으면 exit 1. **위계·밀도·slop·overlap(장식 요소 겹침)은 러너가 검출하지 않는다** — 대신 1280/375 스크린샷(`screenshots[]`)을 출력해 reviewer가 픽셀로 판정한다(REPORT 실측: source-slop·hierarchy는 axe·layout으로 clean이라 vision 필요). geometry(overflow·escape·clip)는 러너가 결정적으로 잡으므로 reviewer 몫이 아니다. `@axe-core/playwright`가 `browser.newContext()`에서 만든 page를 요구하므로 러너는 context→page로 생성한다(`browser.newPage()` 직접 사용 시 예외 — 실브라우저 검증됨). Playwright/axe 미설치면 `Needs Install` echo 후 exit 2(승인 보류는 호출 측 판단 — 날조·통과 위장 금지). stack-guard가 UI 프로젝트에 깐 **Playwright를 재사용** + **`@axe-core/playwright`를 devDep로 추가**(stack-guard가 설치 — §3.17; 비-UI 프로젝트엔 둘 다 없음). 없으면 러너가 exit 2(Needs Install)로 정직하게 멈춘다. **최초 1회는 의도적 결함(저대비·가로 overflow) 샘플 HTML로 스모크 확인** 후 신뢰:

```javascript
#!/usr/bin/env node
// 디자인 수용 게이트 러너 (ADR-058 D3). 입력: concept/preview/prototype HTML 경로들.
// 각 파일 1280/375/320 렌더 → 320 page-overflow + populated axe(1280·320). blocker에 실패 selector 포함.
import { resolve, basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
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
const files = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (!files.length) { console.error('usage: node scripts/design-gate.mjs <html...>'); process.exit(2); }
const SHOTS = 'design-gate-shots';
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
        // 결정적 차단 (320px 브라우저 geometry — .boilerplate 평가 check-reflow-320.cjs 이식): page overflow(전 뷰포트) + element viewport escape·clipped text(narrow ≤375만 — desktop 의도적 off-canvas 오탐 회피). 이 셋은 러너가 결정적으로 잡는다(REPORT §13 항목 2 실측 검증분).
        const geo = await page.evaluate((wide) => {
          const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
          const sel = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
          // 정상 UI 오탐 제외(실브라우저 검증분):
          // (1) sr-only/visually-hidden — 1px 클립 또는 clip/clip-path (2) aria-hidden/inert/hidden 조상(닫힌 drawer·off-canvas) (3) overflow scroll/auto 조상 안(contained 가로스크롤=의도적, 예: 넓은 표)
          const srOnly = (el) => { const s = getComputedStyle(el); return (el.clientWidth <= 1 && el.clientHeight <= 1) || (s.clip && s.clip !== 'auto') || (s.clipPath && s.clipPath !== 'none'); };
          const inaccessible = (el) => el.closest('[aria-hidden="true"],[inert],[hidden]') != null;
          const inScrollable = (el) => { let p = el.parentElement; while (p && p !== document.body) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowX) || /(auto|scroll)/.test(s.overflowY)) return true; p = p.parentElement; } return false; };
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
          const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
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
```

**변경 (c) — R2-G·R6 게이트가 이 러너를 호출**. §3.12 R2-G와 §3.13 R6의 "렌더/axe" 검사는 다음으로 실체화된다:
- 실행: `node scripts/design-gate.mjs <concept 또는 preview HTML 경로들>`.
- exit 1 + JSON `blockers`(page-overflow / serious·critical axe) → **차단**: 실패 selector를 designer에 되먹여 재생성(repair loop, retry ≤2). `reports`(moderate/minor·취향) → 보고.
- exit 2(Needs Install) → 게이트 **미실행 사유를 echo하고 승인 보류**(silent skip 금지 — ADR-058 D3). browser 미가용(비-UI 환경 등)도 동일.
- 독립 픽셀 판정(위계·밀도·domain fit·장식 slop)은 러너 JSON에 더해 reviewer(design surface)가 1280/375 스크린샷을 Read로 열람해 수행(§3.15 — 게이트 자동 검사 ≠ 픽셀 취향 판정, 둘 다 필요).

**확인 (d) — ADR-058 Surfaces·Target에 러너 등재 (신규 작업 아님)**: `scripts/design-gate.mjs`는 §3.1에서 ADR-058을 만들 때 이미 `## Surfaces`(러너 줄)와 Mutation Contract Target에 등재된다 — 여기서 *추가로 할 일은 없고*, §3.1 편집 시 그 두 곳에 러너가 들어갔는지 **확인만** 한다. (plan-milestone R5 게이트 호출자도 §3.1 Surfaces·Target에 포함 — §4.11 상단 주석 참조.)

**변경 (e) — `design-gate-shots/` gitignore (F6 — stray-commit 방지)**: 러너는 스크린샷을 cwd의 `design-gate-shots/`에 쓴다(reviewer 픽셀 판정 입력 — 통과 후 정리 대상, ephemeral). `git add -A`류에 딸려 커밋되지 않게 `.gitignore`에 한 줄을 추가한다:
```
design-gate-shots/
```
(concept/preview 임시 렌더가 이미 ephemeral 취급되는 것과 동일 — tracked 대상은 통과본 프로토타입뿐.)

**왜**: 게이트가 "글"에서 "실행 가능한 결정적 검사"가 된다. axe·overflow는 러너(도구)가 판정(LLM 추정 아님), 픽셀 취향은 reviewer가. Playwright 미설치 UI 환경은 Needs Install로 정직 처리(통과 위장 금지).

> **커밋 (Phase 3 후반 — 디자인 배선)**:
> `feat(design): wire evidence-on-demand R0, REFINE/EXPLORE cards, acceptance gate runner, a11y dimension into design pipeline (ADR-058)`

---

# Phase 4 — 계획·경험 계약 + 로드맵 (INST-1 · INST-2 · INST-3 · DS-4 · RD-1)

`ADR-056`(경험 계약)·`ADR-057`(플래닝)과 그 surface(plan-milestone·plan-workitem·validate-plan·stabilize·templates)가 한 덩어리로 얽힌 Phase다. 같은 파일을 여러 항목이 건드리므로 이 순서대로 편집한다.

> **INST-1 PX 설계 확정** (이 가이드가 정한 구체안): ① 프로토타입의 각 *경험 결정*에 `PX-<screen>-NN` id를 붙인다(screen=화면 키, NN=화면 내 일련번호; 화면당 대략 3~8개 — 상태군·인터랙션군·핵심 카피를 *결정 단위*로, AC 3개 sizing과 충돌하지 않게 굵게). ② 그 목록은 feature 문서 `## 7`에 **PX 인벤토리**로 영속(plan-milestone R5-5가 승인 프로토타입에서 추출). ③ PX↔AC 매핑은 feature `## 7-3` subsection(FAC↔AC의 `## 7-1`과 동형). ④ 미참조 PX는 기존 `[Plan-FAC-coverage]` 차원을 *확장*해 잡는다(새 차원 신설 X — 차원 개수·미러·카운트표 불변). ⑤ 화면-키 프로토타입 특성상 한 화면 PX가 여러 feature에 걸치면 **소유 feature에 canonical + 나머지는 참조**(INST-3 소유 우선 규칙 재사용).

## 4.1 ADR-056 Amendment 1 — 프로토타입 경험 결정 PX 커버리지 (INST-1)

**기존**: `docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md`는 amendment 0개, `## 참고`로 끝난다. 결정 3(입구 계약)은 프로토타입 참조/면제 *존재*만 점검하고, 결정 4(경험 좁힘)는 해석 분기 시에만 발화하는 해석-레벨 장치라 **프로토타입의 모든 경험 결정이 AC로 빠짐없이 내려갔는지(coverage)는 아무도 점검하지 않는다**(dogfood에서 sticky-pin 결정이 §3-V까지 안 잡힘 — 이번 실험 최대 수확이자 유일 졸업 차단 원인).

**변경**: 파일 맨 끝에 Amendment 1을 추가한다:

```
<a id="adr-056-amend-1"></a>
## Amendment 1 (2026-07-21) — 프로토타입 경험 결정 PX 커버리지 (계획 단계 coverage 대조)

### 배경
- [관측됨] SIMULATION_RUN Round 4 — 프로토타입의 "입력창 sticky-pin" 구성 결정이 어떤 task AC에도 안 내려갔고, 단위·E2E·per-task validate 전부 green이었는데 마일스톤 끝 §3-V 스크린샷 대조에서야 처음 발견됐다(되돌리기 비용 큼). 입구 계약(결정 3)은 프로토타입 *존재*만, 경험 좁힘(결정 4)은 *해석 분기*만 본다 — coverage 점검이 없다.

### 결정
1. **PX 식별자 (전역 고유 + 마커가 단일 source)**: 승인 프로토타입의 각 *경험 결정*(레이아웃·인터랙션 결과·핵심 카피·못생긴 상태 처리 등, 결정 단위 — 화면당 대략 3~8개)에 **`PX-<screen>-NN`**(화면 파일명 슬러그 + 번호 — 전역 고유, 화면-키 프로토타입과 정합) id를 부여한다. designer가 R5-4/R5-5에서 프로토타입 HTML에 `<!-- PX-<screen>-NN: <한 줄 결정> -->` 마커를 **의무로** 단다(이 HTML 마커가 PX의 *단일 source* — 선택 보조 아님). 화면이 여러 feature에 걸쳐도 id가 화면-키라 충돌하지 않는다.
2. **PX 인벤토리 (계획 미러 — 재추출 금지)**: plan-milestone R5-5가 승인 시 프로토타입 HTML의 PX 마커를 **그대로 복사**(재추출·재해석 금지 — drift 차단, 재발 방지)해 각 feature 문서 `## 7`의 `프로토타입:` 참조 아래 `경험 결정(PX):` 블록에 기입한다. 한 화면이 여러 feature에 걸치면 그 화면의 PX는 소유 feature에 두고 나머지 feature는 화면 참조(ADR-057#amend-2 소유 우선).
3. **PX ↔ AC 매핑**: plan-workitem 3-P가 UI task 분해 시 각 PX를 그것을 구현하는 AC로 매핑해 feature `## 7-3. 프로토타입 경험(PX) ↔ AC 매핑` subsection에 영속(형식 `PX-<screen>-NN → T-NNN:AC-M`, FAC↔AC `## 7-1`과 동형; ADR-036 12-section에 main section 신설 X — subsection). task `## 6` AC는 `(PX-<screen>-NN)` 태그 가능.
4. **coverage 대조**: 어떤 AC도 참조하지 않는 PX(unmapped PX)를 골라낸다 — plan-workitem self-check가 "남은 미결정 사항"에 surface, `[Plan-FAC-coverage]`(reviewer·validate-plan 미러) 차원이 unmapped FAC와 **동일하게 unmapped PX도 P0**로 잡는다(새 차원 신설 X — 기존 coverage 차원 확장). *별도 parser는 없다 — unmapped 판정은 매핑 표 기준의 coverage 점검을 reviewer/self-check(LLM)가 수행*(마커 복사(R5-5)만 verbatim으로 기계적). 이러면 §3-V는 "정말 놓친 것"만 잡는 최후 보루로 정상화.

### 적용 surface
- .claude/skills/plan-milestone/SKILL.md (R5-5 PX 인벤토리)
- .claude/skills/plan-workitem/SKILL.md (3-P PX↔AC + self-check)
- .claude/skills/validate-plan/SKILL.md ([Plan-FAC-coverage] 확장)
- .claude/agents/reviewer.md ([Plan-FAC-coverage] 미러)
- .claude/agents/designer.md (PX 마커)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (## 7 PX 인벤토리 + ## 7-3)
- docs/30-workitems/_templates/TASK_TEMPLATE.md (## 6 (PX-<screen>-NN) 태그)

### 강도 (ADR-022)
- enabling(약) — coverage surface + self-check. 자동 차단은 [Plan-FAC-coverage] 기존 강도(P0 권장, 차단 아님)를 따른다.
- **D6 override (ADR-045)**: 본 amend는 surface 5+ 추가(7 surface)라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-056 통합 재발행. (ADR-056은 grandfather 아님 — 2026-07-16 생성.)
```

## 4.2 ADR-056 Amendment 2 — raw-hex 토큰 정의 예외 (INST-2)

**변경**: 파일 맨 끝(Amendment 1 뒤)에 추가한다:

```
<a id="adr-056-amend-2"></a>
## Amendment 2 (2026-07-21) — raw hex 스캔의 토큰 정의 예외

### 배경
- [관측됨] SIMULATION_RUN Round 4 — stabilize §5-2 raw-hex grep이 fork의 DTCG 토큰 *정의* CSS(`src/index.css`의 `:root`)를 위반으로 오탐(false positive). 정의(당연히 hex가 있어야 함)와 사용처를 구분하지 못했다. 현행 제외는 DESIGN.md 자체 + `docs/20-system/prototypes/`뿐.

### 결정
1. §5-2 raw-hex grep 결과에서 **CSS custom property *정의* 라인**(`--<name>: #hex` 형태)은 제외한다(토큰 정의는 정상 — dogfood의 `src/index.css :root` 오탐 케이스가 이걸로 해소). 검사 대상은 정의 밖 *사용처*(`color:#hex` / `background:#hex` 등)의 raw hex.
2. **파일명 기반 전체 제외는 하지 않는다** — 파일명(`theme`/`tokens` 등)으로 파일 전체를 빼면 그 파일 안의 *사용처* 위반도 함께 숨는다(false negative). 정의/사용처 구분은 오직 (1)의 *라인 형태*로 판정(정밀). 프로젝트가 순수 정의 파일 경로를 밝히고 싶으면 DESIGN.md §2에 적되, 검사 기준은 여전히 (1) 라인.
3. **전면 제외 금지**: 모든 `:root` 블록을 무조건 빼면 진짜 위반이 숨으므로, 오직 (1)의 *정의 라인*만 예외 — `:root` 안이라도 사용처 hex는 검사.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md (§5-2)

### 강도 (ADR-022)
- enabling(약) — 오탐 제거(검사는 report-only라 코드 차단 아님).
```

## 4.3 ADR-056 Amendment 3 — 화면 전환 표 (DS-4)

**변경**: 파일 맨 끝(Amendment 2 뒤)에 추가한다:

```
<a id="adr-056-amend-3"></a>
## Amendment 3 (2026-07-21) — 화면 사이 흐름: 전환 표 + downstream 소비자 (다화면·복구 흐름 한정)

### 배경
- [관측됨] 화면 *안*(색·글꼴·컴포넌트)은 다중 감사받지만 화면 *사이* 흐름은 약하다. FEATURE §8-1(primary task·empty/loading/error 복구·a11y·HEART)은 이미 있으나 **downstream 소비자가 없어 dead field**이고, cross-screen 전환(A→행동→B, 실패/복구)을 담는 자리가 없다. *가설 — static prototype 실험이 화면 전환을 직접 검증하지 못함(다화면·복구 흐름에 한정 채택).*

### 결정
1. **plan-milestone R5-1 전환 표**: 마일스톤 문서에 `## 9. 화면 전환 (UI)` 표를 도출한다 — `현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | 실패/복구 | owner feature/prototype`. **트리거는 *화면 수*가 아니라 *비가역 동작·분기·복구 상태의 존재*다**: (i) 화면 2개 이상(다화면 전환), 또는 (ii) **단일 화면이라도** 비가역/파괴적 동작(삭제·결제·전송)·분기·다단계 오류→복구(submit→error→retry)·modal·확인 dialog가 있으면 그 상태·복구 경로를 `## 9`에 적는다. 둘 다 아니면(순수 정적 단일 화면·비-UI) "(해당 없음)".
2. **downstream 소비자 배선** (안 그러면 §8-1처럼 또 dead field): plan-workitem이 분해하는 feature가 전환 표의 owner인 행을 회수해 그 primary path + 실패/복구 path가 task AC로 커버되게 하고(FEATURE §8-1의 복구 흐름과 정합), validate-plan `[Plan-design]`이 **primary path와 recovery path가 프로토타입·AC에 존재**하는지 점검한다.
3. ADR-042 결정 3("흐름 점검은 기존 시나리오·상태 self-check가 담당, plan-workitem에 별도 UX self-check 안 둠")과의 관계: 본 결정은 별도 UX self-check 신설이 아니라 *기존 [Plan-design] 차원 확장 + §8-1 소비 배선*이다(ADR-042 정신 유지).

### 적용 surface
- .claude/skills/plan-milestone/SKILL.md (R5-1)
- .claude/skills/plan-workitem/SKILL.md (owner 행 회수)
- .claude/skills/validate-plan/SKILL.md ([Plan-design] recovery path)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md (## 9 화면 전환)

### 강도 (ADR-022)
- enabling(약) — 다화면·복구 흐름 한정 조건부. *가설*이라 REPORT §13류 실측 전 정책 확정 아님.
```

## 4.4 ADR-057 Amendment 1 — 마일스톤 로드맵 SSOT (RD-1)

**기존**: `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`는 amendment 0개, `## Status`(accepted) 다음이 바로 `## 배경`이라 **`## 현재 유효 결정` 요약 섹션이 없다**.

**변경 (a) — `## 현재 유효 결정` 신설 (필수)**: amend-2(§4.5)가 base 결정 9의 seam canonical *위치 규칙을 정정*하므로 ADR-045 D5상 요약 섹션이 필수다(정정성 amend). `## Status`(accepted) 바로 아래에 삽입:

```
## 현재 유효 결정
- M1 포함 모든 마일스톤·feature 문서는 `/plan-milestone`이 생성(bootstrap-project는 charter/ARCH까지) — 배치 분해(2-tier/refresh) + feature 체크포인트.
- cross-task seam 계약: 신호 4종 감지 시 feature `## 7-2`에 INV 표. cross-feature canonical 위치 = **① 데이터 소유(write-through) → ② 최초 사용 → ③ 낮은 번호(fallback)**(#amend-2가 결정 9의 "낮은 번호 우선"을 이 우선순위로 정정 — 낮은 번호는 최종 fallback으로 잔존).
- **마일스톤 로드맵 SSOT**: `docs/30-workitems/ROADMAP.md`(Done/Now/Next/Later 4구간 + 얇음 규율) — plan-milestone 단독 작성(R3=Now 실체화, R0=graduation 재조정), stabilize는 회고 graduation만 영속(#amend-1).
- 상세는 아래 `## 결정 — A/B` + Amendment 1·2.
```

**변경 (b) — Amendment 1**: 파일 맨 끝에 추가한다:

```
<a id="adr-057-amend-1"></a>
## Amendment 1 (2026-07-21) — 마일스톤 로드맵 SSOT (얇은 forward 지도)

### 배경
- [관측됨] 마일스톤 forward 지도가 없다 — "끝난 것/지금/앞으로"를 한 장에서 못 본다. plan-milestone은 직전 1개만 회고하고, 계획 중 "이 목표는 마일스톤 3개로 쪼개야 한다"는 판단이 `/clear`로 증발해 다음에 처음부터 재계산한다.

### 결정
1. **docs/30-workitems/ROADMAP.md 신설** — 1행=1마일스톤, **Done / Now / Next / Later 4구간(rolling-wave)**, 구간별 맞춤 컬럼(Done: id·`candidate-key`·목표·졸업·주요 기능 / Now: id·`candidate-key`·목표·진척·주요 기능·의존 / Next·Later: `candidate-key` + 목표 1줄 + 확신도 목록). **`candidate-key`는 전 구간 공통 안정 식별자** — Later→Next→Now→Done 승격 내내 *같은 key*를 유지하고 Now/Done에서 id(M-number)를 추가로 발급한다(정체성이 goal-text 매칭에 의존하지 않게; Now/Done도 key를 보존해야 전 구간 추적이 닫힌다). baseline **빈 shell**로 커밋(presence: baseline), plan-milestone이 채운다. **템플릿 파일 없음**(단일 인스턴스 — 스키마는 본 amend + ROADMAP.md 헤더가 SSOT).
2. **단일 작성자 = plan-milestone**: R3는 *지금 착수하는* 마일스톤만 Now 행으로 쓴다(직전 행의 Done 전환은 R3가 강제하지 않는다 — 회고 `graduation:`=YES일 때만 Done이며 그 판정 반영은 R0 재조정이 담당). R2 분할이 식별한 후속 마일스톤은 Next/Later 얇은 행.
   **R0 전이 알고리즘(reconcile — candidate-key로 정체성 유지)**: (a) 직전 Now의 회고 `graduation:`=YES면 그 행을 **Done**으로(candidate-key·id 보존). (b) 착수할 Next 후보(candidate-key로 식별)를 **Now**로 승격하며 id(M-number) 발급 — *같은 candidate-key 유지*(중복 생성 방지·전 구간 추적). (c) 직전 Now가 미졸업(YES 아님)이면 단일-Now 규율상 새 Now 승격을 **보류**(명시적 병렬 승인이 있을 때만 병렬 Now 허용). (d) 마지막 마일스톤 종료(후속 Next 없음)면 Now→Done 후 Now를 비운다. (e) 기존 프로젝트에 로드맵을 처음 도입(backfill)하면 현존 마일스톤에 candidate-key를 부여해 Done/Now로 seed한다. **progress(`task done/total`)는 plan-workitem이 task를 만든 뒤 R0가 갱신하는 *계획-시점 스냅샷*** — 실시간 현황이 아니다(실시간은 task 문서가 SSOT). 그래서 R3 신규 행은 `tasks: unplanned`.
3. **얇음 규율(성패 관건)**: Next/Later 행은 *`candidate-key`(안정 슬러그) + 목표 1줄 + 확신도만* — 기능·AC·졸업 칸 자체를 만들지 않는다(아직 안 정한 걸 정한 척 = 소설, 오히려 해로움). candidate-key는 R0 재조정이 중복 생성·Now 승격을 매칭하는 유일 안정 식별자(목표 문구가 바뀌어도 고정). M 번호는 Done/Now(실체화)만 발급, Next/Later는 `(M3?)`처럼 잠정. 날짜·%·story point 기본 제외. Now 기본 1개(병렬 마일스톤은 명시 결정 시만).
4. **stabilize-milestone 읽기 전용 유지**: 로드맵 파일을 직접 건드리지 않는다. graduation 판정(`YES|NO|BLOCKED (날짜)`)만 마일스톤 `## 8. 회고`에 영속하고(ADR-014 회고 스키마 amend 동반), 다음 plan-milestone R0가 그것을 읽어 로드맵을 재조정한다.
5. **repair-plan은 로드맵을 건드리지 않는다**(단일 작성자 유지 — 다음 R0 재조정이 흡수). **validate-plan은 로드맵 drift 전용 차원을 신설하지 않는다**(요약 지도라 R0 재조정이 흡수 — 미러·카운트 비용 회피).
6. **로드맵=요약 / 각 Mx=상세 SSOT** — 링크만, 내용 복제 금지. 지킬 수 없으면 "존재하는 것만 표시(생성 전용)"로 후퇴.

### 적용 surface
- docs/30-workitems/ROADMAP.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md

### 강도 (ADR-022)
- enabling(약) — 얇음 규율이 전부. 작성자 1명·기존에 이미 읽는 정보라 부담 최소.
- **D6 override (ADR-045)**: 본 amend는 surface 6개 + R3 의미 변경(모든 마일스톤 실체화 → Now만)이라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-057 통합 재발행. (ADR-057은 grandfather 아님 — 2026-07-16 생성.)
```

## 4.5 ADR-057 Amendment 2 — seam canonical 위치 (소유 우선, INST-3)

**변경**: 파일 맨 끝(Amendment 1 뒤)에 추가한다:

```
<a id="adr-057-amend-2"></a>
## Amendment 2 (2026-07-21) — cross-feature seam canonical 위치 규칙 (소유 우선)

### 배경
- [관측됨] SIMULATION_RUN Round 4 — 비대칭 seam(한 feature가 write-through 소유)에서 결정 9의 "낮은 번호 feature canonical" 규칙이 *관련 거의 없는* 낮은 번호 feature에 INV를 배치해 "왜 이 규칙이 여기 있지?" 가독성 역전을 낳았다.

### 결정
결정 9의 cross-feature invariant canonical 기재 위치 *규칙을 정정한다* — 소유·최초사용 우선순위를 앞에 추가하고 기존 "낮은 번호"는 최종 fallback으로 **강등**한다. **비대칭 seam에서 canonical 위치가 낮은번호→소유자로 바뀌므로 "충돌 없는 확장"이 아니라 정정**이다(그래서 D5 `## 현재 유효 결정` 요약 의무 트리거 — 본 ADR `## 현재 유효 결정`과 정합). ADR-057은 이미 §거버넌스의 intentional override 대상이라 이 정정도 minimal-churn amend로 처리한다(D6 재발행 대신 amend — 근거: 이번 라운드 결정, 다음 변경 시 통합 재발행). 정정된 규칙: **① 그 데이터를 실제 소유(write-through)하는 feature → ② 애매하면 최초 사용 feature → ③ 그래도 불명확하면 낮은 번호 feature(기존 결정 9의 규칙 — 결정적 fallback)**. 상대 feature `## 7-2`엔 참조 링크 1줄만(SSOT 중복 금지 — 불변). 소유가 명확할 때만 ①, 불명확하면 ③으로 결정적 판정(도구가 위치를 찾을 수 있게 기계적 판정 가능성 유지).

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md

### 강도 (ADR-022)
- enabling(약) — 가독성 개선, 기능 불변.
```

## 4.6 ADR-014 Amendment — 회고에 graduation 줄 (RD-1)

**기존**: `docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md` 결정 2("회고 4 항목")는 목표 달성도/scope creep/비목표 위반/핵심 학습만 정한다. accepted ADR이므로 결정을 in-place로 덮어쓰지 않고 **amendment로 확장**한다(Record 문서 규약 — 충돌 없는 확장은 `## Amendment N`).

**변경**: 파일 맨 끝에 amendment를 추가한다. **번호는 README 인덱스의 ADR-014 행에서 현재 마지막 amend 다음 번호를 확인해 쓴다**(dossier 기준 amend-2까지 확인됨 → 보통 **Amendment 3**):

```
<a id="adr-014-amend-3"></a>
## Amendment 3 (2026-07-21) — 회고에 graduation 판정 줄 (로드맵 파생 입력)

### 결정
`## 8. 회고`에 4 항목 위로 `graduation:` 줄을 추가한다: `YES | NO | BLOCKED (<날짜>)`. **판정 기록 시점은 stabilize 단계 8(회고 자동 채움)** — 단계 4~6(qa·reviewer 팬아웃)이 찾은 P0까지 반영한 *최종* 판정을 1회 기록한다(§1.5 사전점검이 아님 — §1.5에서 기록하면 이후 P0를 못 잡아 '잘못된 YES'가 박힌다). 회고는 stabilize의 정상 write 대상 — read-only 계약 불변. BLOCKED = e2e blocked-on-env. 이 줄은 `docs/30-workitems/ROADMAP.md` Done/Now 파생 입력(다음 plan-milestone R0가 읽어 재조정 — ADR-057#amend-1). 로드맵 파일 자체는 stabilize가 건드리지 않는다.

### 적용 surface
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md (§8 회고)
- .claude/skills/stabilize-milestone/SKILL.md (단계 8 판정 영속 + 회고 항목)

### 강도 (ADR-022)
- enabling(약) — 회고 항목 1줄 확장.
```

**왜**: 로드맵 상태 파생의 출처가 되는 graduation 판정을 회고에 영속. accepted ADR의 결정을 덮어쓰지 않고 amendment로 확장해 Record 규약을 지킨다. (MILESTONE_TEMPLATE §8·stabilize 실제 편집은 §4.8·§4.14에서 수행 — 본 amendment는 그 정책 근거.)

## 4.7 ROADMAP.md 신설 (RD-1)

**변경**: 새 파일 `docs/30-workitems/ROADMAP.md`를 아래 빈 shell로 만든다(baseline — plan-milestone이 채움):

```markdown
# 마일스톤 로드맵

> 요약 지도 — 각 마일스톤 상세는 링크된 Mx 문서가 SSOT. 이 파일은 `/plan-milestone`만 갱신한다(R3 생성/갱신, R0 재조정). 상태는 `stabilize-milestone`이 마일스톤 회고에 남긴 graduation 판정에서 파생 (ADR-057#amend-1).
> **얇음 규율**: Next/Later 행은 "목표 1줄 + 확신도"만 — 기능·AC·졸업 칸을 만들지 않는다(아직 안 정한 걸 정한 척 금지). M 번호는 Done/Now만 발급, Next/Later는 `(M3?)`처럼 잠정. 날짜·%·story point 기본 제외. Now 기본 1개(병렬은 명시 결정 시만).

## Done
<!-- 졸업한 마일스톤 스냅샷만. -->
| id | 목표 | 졸업 | 주요 기능 |
|----|------|------|-----------|

## Now
<!-- 현재 진행(기본 1개). 진척 스냅샷만 — 상세는 Mx 문서. -->
| id | 목표 | 진척 | 주요 기능 | 의존 |
|----|------|------|-----------|------|

## Next
<!-- 다음 후보 — `candidate-key` + 목표 1줄 + 확신도만. 상세 문서 없음.
     형식: - (M3?) `<candidate-key>` <목표 1줄> — 확신도: <높음/중간/낮음>
     첫 backtick 토큰 = 안정 candidate key(목표 슬러그, 예 `offline-merge`) — R0 재조정이 *이 key로* 중복 생성·Now 승격을 매칭한다(목표 문구가 바뀌어도 key는 고정). 예: - (M3?) `offline-merge` 오프라인 편집 병합 — 확신도: 낮음 -->

## Later
<!-- 그 뒤 후보 한 줄. 같은 `candidate-key` 형식. 예: - `team-collab` 팀 협업 — 확신도: 낮음 -->
```

## 4.8 MILESTONE_TEMPLATE — 회고 graduation 줄 (RD-1) + 화면 전환 §9 (DS-4)

**기존** (`docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` §8 회고):

```
## 8. 회고 (stabilize 자동 채움)
- 목표 달성도: <정량/정성 1줄>
- scope creep 사례: <있으면 1줄, 없으면 "없음">
- 비목표(charter ## 5) 위반 사례: <있으면 1줄>
- 핵심 학습 3개 이내
```

**변경**: graduation 줄 추가 + §9 화면 전환 섹션 신설(파일 끝에):

```
## 8. 회고 (stabilize 자동 채움)
- graduation: <YES | NO | BLOCKED> (<날짜>)  <!-- stabilize 단계 8 최종 판정(단계 4~6 qa·reviewer P0 반영) 영속 — §1.5 사전점검 아님. ROADMAP.md 파생 입력 (ADR-014·ADR-057#amend-1). BLOCKED = e2e blocked-on-env. 주: 이 판정은 stabilize 시점 report(ADR-014상 checkout-local ephemeral) 기준이며, ROADMAP Done은 이 *영속된 판정*의 파생이지 fresh clone에서 재도출된 증거가 아니다 — 재검증이 필요하면 stabilize 재실행(증거 영속 강화는 ADR-014 범위). -->
- 목표 달성도: <정량/정성 1줄>
- scope creep 사례: <있으면 1줄, 없으면 "없음">
- 비목표(charter ## 5) 위반 사례: <있으면 1줄>
- 핵심 학습 3개 이내

## 9. 화면 전환 (UI — 다화면 또는 단일 화면의 비가역·분기·복구 흐름 시 — ADR-056#amend-3)
<!-- 순수 정적 단일 화면·비-UI 마일스톤은 "(해당 없음)"; 단일 화면이라도 비가역/파괴 동작(삭제·결제·전송)·분기·다단계 오류→복구(submit→error→retry)·modal·확인 dialog가 있으면 채운다(트리거=화면 수가 아니라 비가역 동작·분기·복구 상태 존재 — ADR-056#amend-3). /plan-milestone R5-1이 채운다.
     형식: | 현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | 실패/복구 | owner feature/prototype |
     plan-workitem이 owner feature 행의 primary + 실패/복구 path를 task AC로 회수, validate-plan [Plan-design]이 존재 점검. -->
```

## 4.9 FEATURE_TEMPLATE — PX 인벤토리 + `## 7-3` (INST-1)

**기존** (`docs/30-workitems/_templates/FEATURE_TEMPLATE.md` `## 7` 주석 + `## 7-2` 뒤):

```
## 7. Feature-level Acceptance Criteria
<!-- FAC-1, FAC-2 ... 시나리오 수준 측정 가능 기준.
     task `## 6 AC`는 FAC를 만족시키는 구현 단위.
     구 `## 8 검증 방법`을 흡수.
     UI feature는 승인 프로토타입 참조 줄을 둔다(ADR-056 — 화면 단위 파일, 그 feature가 등장하는 화면마다 1줄):
     `프로토타입: [M<N>/<screen>.html](../../20-system/prototypes/M<N>/<screen>.html) (진입: <라우트/상태 진입 메모>)`.
     프로토타입이 무의미한 UI feature는 `프로토타입 면제: <사유>` 한 줄로 대체(plan-workitem 입구 계약의 통과 조건 — 둘 다 없으면 Needs Experience Contract). -->
```

**변경**: `## 7` 주석 끝에 PX 인벤토리 규약을 덧붙인다:

```
## 7. Feature-level Acceptance Criteria
<!-- FAC-1, FAC-2 ... 시나리오 수준 측정 가능 기준.
     task `## 6 AC`는 FAC를 만족시키는 구현 단위.
     구 `## 8 검증 방법`을 흡수.
     UI feature는 승인 프로토타입 참조 줄을 둔다(ADR-056 — 화면 단위 파일, 그 feature가 등장하는 화면마다 1줄):
     `프로토타입: [M<N>/<screen>.html](../../20-system/prototypes/M<N>/<screen>.html) (진입: <라우트/상태 진입 메모>)`.
     프로토타입이 무의미한 UI feature는 `프로토타입 면제: <사유>` 한 줄로 대체(plan-workitem 입구 계약의 통과 조건 — 둘 다 없으면 Needs Experience Contract).
     경험 결정(PX) 인벤토리(ADR-056#amend-1 — plan-milestone R5-5가 승인 프로토타입 HTML의 `<!-- PX-<screen>-NN -->` 마커를 *그대로 복사*, 이 feature가 소유하는 화면의 경험 결정만; 화면이 여러 feature에 걸치면 소유 feature에 canonical + 나머지는 참조):
     `경험 결정(PX):`
     `- PX-<screen>-1: <한 줄 결정 (예: 입력창을 화면 상단에 sticky 고정)>`
     `- PX-<screen>-2: <...>` -->
```

**기존** (`## 7-2` 주석 다음 — `## 8`이 오기 전. 실제로는 `## 7-2` 블록 뒤에 §8이 옴):

```
## 7-2. Cross-task invariant 계약 (subsection of ## 7)
<!-- seam 신호(2+ task 동일 엔티티 write / 상태 머신 / 2차-write / 멱등 — ADR-057 결정 8) 발화 시에만 /plan-workitem이 채운다.
     미발화 시 "(해당 없음 — seam 신호 미발화)" 한 줄.
     형식: INV-N | 보장 (상태 전이 / 멱등 / 2차-write 재검증 / task 간 계약) | 관련 task:AC | 검증 방법
     예: INV-1 | 주문 상태는 draft→paid→shipped 단방향 — 어떤 task도 역방향 write 금지 | T-003:AC-2, T-005:AC-1 | 상태 전이 가드 단위 테스트
     unmapped INV는 plan 출력 "남은 미결정 사항"에 surface. validator가 task 검증 시 위반·테스트 커버를 점검. -->
```

**변경**: `## 7-2` 블록 바로 뒤에 새 subsection `## 7-3`을 추가한다:

```
## 7-2. Cross-task invariant 계약 (subsection of ## 7)
<!-- (위와 동일 — 변경 없음) -->

## 7-3. 프로토타입 경험(PX) ↔ AC 매핑 (subsection of ## 7)
<!-- UI feature 한정(ADR-056#amend-1). /plan-workitem 3-P가 채운다(영속 SSOT — plan 출력은 echo).
     형식: PX-<screen>-NN → T-NNN:AC-M, T-MMM:AC-K (다대다 허용)
     `## 7` PX 인벤토리의 어떤 PX도 참조하지 않는 AC/미매핑 PX(unmapped PX)는 [Plan-FAC-coverage]가 unmapped FAC와 동일 기준으로 잡는다(P0 권장).
     본 subsection은 ## 7과 한 묶음 — ADR-036 12-섹션 구조에 *추가 main section 신설 X* (## 7-1·## 7-2 선례). 비-UI feature는 "(해당 없음)". -->
- PX-<screen>-1 →
- PX-<screen>-2 →
```

> 주의: `## 7-2`의 주석 본문은 바꾸지 않는다 — `## 7-2` 블록 *뒤에* `## 7-3`을 삽입하는 것뿐이다. 위 "변경"에서 `## 7-2` 주석을 `(위와 동일 — 변경 없음)`으로 축약 표기했으니, 실제 편집은 `## 7-2` 블록을 원문 그대로 두고 그 다음 줄부터 `## 7-3` 블록을 넣는다.

## 4.10 TASK_TEMPLATE — `(PX-<screen>-NN)` 태그 (INST-1)

**기존** (`docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 6` 주석 마지막 부분):

```
## 6. Acceptance Criteria
<!-- AC는 Given-When-Then *형식 강력 권장*. measurable verb 사용:
     권장(좋은 예): returns, displays, persists, rejects, emits, responds with, contains, matches
     강력 금지(절대 비측정): works, looks good, is correct, is fine
     문맥상 허용: handles, supports — 단 *무엇을 / 어떻게*까지 명시되면 허용
     AC 3개 이하 권장(4개 이상이면 task 분해 *권장 텍스트*).
     위반 시 planner는 *재분해 권장 텍스트*를 출력, builder는 *재분해 요청 텍스트*를 Red phase 직전 출력 — 자동 차단은 하지 않는다(사용자 결정). 정책: ADR-026. -->
```

**변경**: 주석 끝에 PX 태그 규약 한 줄 추가:

```
## 6. Acceptance Criteria
<!-- AC는 Given-When-Then *형식 강력 권장*. measurable verb 사용:
     권장(좋은 예): returns, displays, persists, rejects, emits, responds with, contains, matches
     강력 금지(절대 비측정): works, looks good, is correct, is fine
     문맥상 허용: handles, supports — 단 *무엇을 / 어떻게*까지 명시되면 허용
     AC 3개 이하 권장(4개 이상이면 task 분해 *권장 텍스트*).
     위반 시 planner는 *재분해 권장 텍스트*를 출력, builder는 *재분해 요청 텍스트*를 Red phase 직전 출력 — 자동 차단은 하지 않는다(사용자 결정). 정책: ADR-026.
     UI task로 프로토타입 경험 결정을 구현하는 AC는 끝에 `(PX-<screen>-NN)` 태그를 붙일 수 있다(ADR-056#amend-1 — (AC-N)·(INV-N) 태그와 동형). feature `## 7-3` PX↔AC 매핑의 근거. -->
```

> **커밋 (Phase 4 전반 — 경험 계약·플래닝 ADR + 로드맵 파일·템플릿)**:
> `feat(planning): add PX coverage, transition map, seam ownership, milestone roadmap (ADR-056 amend 1-3, ADR-057 amend 1-2, ADR-014)`

## 4.11 plan-milestone — R0 로드맵 재조정 + R3 로드맵 갱신 + R5-1 전환 표 + R5-5 PX 인벤토리 + R5 게이트 권한 + 출력 (RD-1 · DS-4 · INST-1 · DS-3)

**변경 (frontmatter) — R5 게이트 실행 권한 (DS-3)**: plan-milestone `allowed-tools`에 게이트 실행 권한이 없어(현재 `Bash(rm ...)`뿐) R5-5 게이트가 실행 불가다.

**기존**:

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/prototypes/*/_drafts/*.html)
```

**변경**:

```
allowed-tools: Read Glob Grep Write Edit Agent Bash(rm docs/20-system/prototypes/*/_drafts/*.html) Bash(node scripts/design-gate.mjs*) Bash(npx playwright*)
```

> ADR-058 `## Surfaces`·Mutation Contract Target에도 `plan-milestone`(R5 게이트 호출자)이 추가돼 있어야 한다(§3.1에서 반영).

**기존** (R0 회수 블록 초입):

```
**R0 — 직전 마일스톤 회수 (additive 입력)**
- 직전 마일스톤 문서가 있으면 다음만 회수한다(ADR-019 minimal — 전체 fork-load 금지):
  - `## 8. 회고` (목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
```

**변경**: 이 블록 끝에 로드맵 재조정 불릿을 추가한다:

```
**R0 — 직전 마일스톤 회수 (additive 입력)**
- 직전 마일스톤 문서가 있으면 다음만 회수한다(ADR-019 minimal — 전체 fork-load 금지):
  - `## 8. 회고` (graduation 판정·목표 달성도·scope creep·핵심 학습) — `/stabilize-milestone`이 채운 내용.
  - `## 5. 완료 기준` 졸업 상태(graduation 미충족 항목이 남아 있으면 carry-over 후보).
  - 직전 마일스톤에서 *stabilize 이월*된 미완 항목(졸업 안 된 task / open finding).
- **로드맵 재조정 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`를 읽어 직전 마일스톤 `## 8. 회고`의 `graduation:` 판정 + task done/total로 Done/Now 구간을 최신화한다(graduation=YES면 Now→Done 스냅샷, 진행 중이면 진척 갱신). **미졸업 Now 가드**: 현재 Now 마일스톤의 graduation이 YES가 아니면(진행 중·NO·BLOCKED) *명시적 병렬 승인이 없는 한* 새 마일스톤을 Now로 추가하지 않는다 — "현재 Now(M<N>) 미졸업 — 완료 후 진행 권장"을 안내하고 새 Now 생성을 보류(단일 Now 규율). Next 후보를 Now로 승격·중복 생성 방지를 위해 각 Next/Later 행은 안정적 candidate key(목표 슬러그)를 갖는다. 로드맵은 plan-milestone만 쓴다.
```

**기존** (R3 authoring 초입):

```
**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- 확정된 각 마일스톤을 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(첫 호출이면 M1 — additive, 기존 보존).
```

**변경**: R3 첫 불릿 뒤에 로드맵 갱신 불릿을 추가한다(R3 블록 내, `## 5 완료 기준` 불릿 앞):

```
**R3 — 마일스톤 문서 authoring (MILESTONE_TEMPLATE에서)**
- **지금 착수하는 마일스톤만 실체화 (rolling-wave — ADR-057#amend-1)**: R2에서 확정한 분할 중 *이번에 착수하는* 마일스톤(기본 1개 = Now)만 `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`를 복사해 `docs/30-workitems/milestones/M<N>-<이름>.md`로 작성한다. `<N>`은 기존 마일스톤 다음 번호(첫 호출이면 M1 — additive, 기존 보존). **R2 분할이 식별한 *후속* 마일스톤은 지금 Mx 문서를 만들지 않는다 — 그 마일스톤의 feature 문서·R5 프로토타입도 만들지 않는다** (로드맵 Next/Later에 얇은 행(미번호 `(M?)`)으로만; R4 컴포넌트·R5 프로토타입은 지금 착수하는 Now 마일스톤의 화면에만 적용). 후속 마일스톤의 feature·프로토타입은 그 마일스톤이 *Now가 되는 회차*에 생성한다. (이래야 "미번호 얇은 후보 vs 실체 문서"가 어긋나지 않는다 — rolling-wave 핵심.)
- **로드맵 갱신 (ADR-057#amend-1)**: `docs/30-workitems/ROADMAP.md`(baseline shell 존재 — 없으면 헤더 포함 생성)에 이번 마일스톤 행을 **Now**로 쓴다(id·목표·진척·주요 기능 링크·의존). **진척 칸은 `tasks: unplanned`로 둔다** — R3 시점엔 plan-workitem 미실행이라 총 task 수 N을 모른다. plan-workitem이 task를 만든 뒤 다음 plan-milestone R0 재조정이 이 칸을 실제 `done/total`로 갱신한다(`0/N`처럼 미확정 N을 지금 박지 말 것). **직전 Now 행의 Done 전환은 R3가 강제하지 않는다** — 그 마일스톤 회고 `graduation:`이 YES일 때만 Done이며, 판정 반영은 R0 재조정이 담당한다(graduation 확인 없이 Done 박기 금지). R2 분할의 후속 마일스톤은 Next/Later에 얇게만(목표 1줄 + 확신도, `(M?)` 잠정 — 기능·AC·졸업 칸 만들지 말 것). Now 기본 1개(병렬은 명시 결정 시만). 로드맵은 plan-milestone만 쓴다.
```

**기존** (R4 feature authoring 초입 — 현재는 *모든* 확정 마일스톤의 feature를 생성):

```
**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- 각 마일스톤의 feature 후보를 `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 feature 다음 번호, 첫 호출이면 F-001 — additive).
```

**변경 (rolling-wave 정합 — 필수)**: R3가 Now 마일스톤만 실체화하는데 R4가 "각 마일스톤"이면 미래 마일스톤 feature가 선생성돼 R3와 모순된다. 첫 불릿의 "각 마일스톤"을 "지금 착수하는 Now 마일스톤"으로 좁힌다:

```
**R4 — feature 문서 authoring (FEATURE_TEMPLATE에서)**
- **지금 착수하는 Now 마일스톤(R3에서 실체화한 그 마일스톤)의 feature 후보만** `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`를 복사해 `docs/30-workitems/features/F-<NNN>-<이름>.md`로 작성한다(기존 feature 다음 번호, 첫 호출이면 F-001 — additive). **R2 분할이 식별한 후속 마일스톤의 feature는 지금 만들지 않는다** — 그 마일스톤이 *Now가 되는 회차*에 생성한다(R3 불릿과 정합, rolling-wave 핵심). 나머지 불릿(`## 0-1 Type`·`## 3 시나리오`·`## 7 FAC`·`## 7-1 빈 shell` 등)은 그 Now 마일스톤 feature에 대해 기존대로.
```

> R5 프로토타입은 R5-1이 R4 feature의 `## 3`에서 화면을 도출하므로, R4를 Now-한정하면 R5도 자동으로 Now-한정된다(별도 수정 불요).

**기존** (R5-1 화면 목록 확정):

```
- **R5-1 화면 목록 확정**: R4 feature 문서들의 `## 3 핵심 시나리오`에서 프로토타입 대상 화면을 도출(기본 feature당 대표 1화면 — 다화면 feature는 사용자 협의, 총 6~8화면 초과 시 우선순위 협상). 프로토타입이 무의미한 feature(순수 백엔드·내부 설정 등)는 이 시점에 해당 feature 문서 `## 7`에 `프로토타입 면제: <사유>` 한 줄을 기록한다(ADR-056 — plan-workitem 입구 계약의 통과 조건).
```

**변경**: 화면 목록 도출 뒤에 전환 표 authoring을 덧붙인다(다화면·복구 흐름 — 트리거는 §9 heading의 조건):

```
- **R5-1 화면 목록 확정 + 화면 전환 표(다화면·복구 흐름)**: R4 feature 문서들의 `## 3 핵심 시나리오`에서 프로토타입 대상 화면을 도출(기본 feature당 대표 1화면 — 다화면 feature는 사용자 협의, 총 6~8화면 초과 시 우선순위 협상). 프로토타입이 무의미한 feature(순수 백엔드·내부 설정 등)는 이 시점에 해당 feature 문서 `## 7`에 `프로토타입 면제: <사유>` 한 줄을 기록한다(ADR-056 — plan-workitem 입구 계약의 통과 조건). **화면이 2개 이상이거나(다화면), 단일 화면이라도 비가역/파괴 동작(삭제·결제·전송)·분기·다단계 오류→복구·modal이 있으면 마일스톤 문서 `## 9. 화면 전환`에 전환 표를 채운다**(ADR-056#amend-3 — 트리거는 화면 수가 아니라 비가역·분기·복구 상태 존재): `현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | 실패/복구 | owner feature/prototype`. 순수 정적 단일 화면·비-UI는 "(해당 없음)".
```

**기존** (R5-5 승인·저장 — feature `## 7` 참조 줄 기입 부분):

```
각 feature 문서 `## 7`에 `프로토타입: [화면 파일](상대경로) (진입: <라우트/상태 진입 메모>)` 참조 줄을 기입한다(그 feature가 등장하는 화면 파일마다 1줄 — §3-V가 이 진입 메모로 화면을 찾는다). `_drafts/` 내 시안 파일을 삭제한다(빈 디렉터리 잔존 무해). 승인 전에는 종료 출력으로 진행하지 않는다.
```

**변경**: 참조 줄 기입 다음에 PX 인벤토리 추출을 덧붙인다:

```
**순서가 중요하다 — 게이트·승격을 feature 문서 기입보다 *먼저* 한다**(게이트 실패 시 최종 `<screen>.html`가 안 생기므로, 참조 줄·PX를 먼저 쓰면 없는 파일을 가리키는 dangling 참조가 남는다).
   1. **(browser provisioned UI면) 게이트**: 완성된 시안(아직 `_drafts/`에 있는 승인 예정 HTML)을 `node scripts/design-gate.mjs <그 HTML 경로>`로 검사한다(ADR-058 D3 — **러너 결정적 차단**: serious/critical axe·320/375 geometry(page overflow·viewport escape·clipped text)). **픽셀 취향(위계·밀도·slop·overlap)은 R5-3 사용자 선택·수정 루프가 오라클이다 — R5엔 별도 reviewer[design] agent 호출이 없다**(취향 오라클=사용자; concept 단계의 reviewer 픽셀 감사(R2-G)와 달리 프로토타입은 사용자가 직접 고른다). 러너 차단이면 designer 재생성으로 수정 → 재검사(retry ≤2, repair 후 재승인 포함). retry 소진해도 차단이면 **승격 안 함**·feature 문서에 아무것도 기입하지 않고 그 화면을 미완으로 남긴다(dangling 참조 방지). exit 2(Needs Install)면 사유를 echo하고 **승인 보류**(browser 설치 후 재실행 권장 — R2-G/R6와 동일; 미검증 gap 명시 후 승인은 사용자 결정). 승인 프로토타입도 concept과 같은 1회성 게이트 대상.
   2. **승격**: 게이트 통과 후에만 시안을 `docs/20-system/prototypes/M<N>/<screen>.html`로 승격 저장한다.
   3. **그제서야 feature 문서 기입**: 각 feature 문서 `## 7`에 `프로토타입: [화면 파일](상대경로) (진입: <라우트/상태 진입 메모>)` 참조 줄을 기입한다(그 feature가 등장하는 *승격 완료된* 화면 파일마다 1줄 — §3-V가 이 진입 메모로 화면을 찾는다). **이어서 그 feature `## 7`에 `경험 결정(PX):` 인벤토리를 기입한다**(ADR-056#amend-1) — 승인 프로토타입 HTML의 `<!-- PX-<screen>-NN: ... -->` 마커를 **그대로 복사**(재추출·재해석 금지 — drift 차단)해 `- PX-<screen>-NN: <한 줄>`로. 화면이 여러 feature에 걸치면 그 화면 PX는 소유 feature에 두고 나머지는 참조(ADR-057#amend-2 소유 우선).
   4. `_drafts/` 내 시안 파일을 삭제한다(빈 디렉터리 잔존 무해). 승인(=전 화면 게이트 통과·승격) 전에는 종료 출력으로 진행하지 않는다.
```

**기존** (마지막 출력 계약):

```
마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature) — (UI 마일스톤) 승인 프로토타입 경로 목록 + 면제 feature 목록
- 마일스톤 ↔ feature 구조 한 줄 요약
```

**변경**: 로드맵 갱신 줄을 추가한다:

```
마지막 출력 ([WORKFLOW.md "스킬 종료 시 다음 단계 출력 contract"](../../../docs/00-meta/WORKFLOW.md) 양식 정합):
- 생성·갱신한 문서 목록(상대 경로 — 마일스톤·feature) — (UI 마일스톤) 승인 프로토타입 경로 목록 + 면제 feature 목록
- **로드맵 갱신됨: `docs/30-workitems/ROADMAP.md` (Done/Now/Next/Later 반영 — ADR-057#amend-1)**
- 마일스톤 ↔ feature 구조 한 줄 요약
```

## 4.12 plan-workitem — 3-P PX↔AC + 전환 표 소비 (INST-1·DS-4) + seam 소유 우선 (INST-3) + unmapped PX self-check

**기존** (3-P 승인 프로토타입 참조 authoring):

```
3-P. **승인 프로토타입 참조 authoring (ADR-056 결정 3 — 이중 잠금 2/2)**:
   입력 feature가 UI 확정·비면제이면, feature `## 7`의 `프로토타입:` 참조 줄에서 화면 파일 경로를 회수해 읽고(UI 확정·비면제 한정 JIT — ADR-019 minimal 정합), 그 화면을 구현하는 *모든* UI task `## 3`에 프로토타입 참조 line item을 authoring한다(신규 요소 유무와 무관 — builder는 기계 실행). 형식: `- 구현 시 승인 프로토타입 참조 — <경로>의 <상태/섹션>과 동일 상태·문구로 구현 (AC-N)`.
```

**변경**: PX↔AC 매핑 + 전환 표 owner 행 소비를 덧붙인다:

```
3-P. **승인 프로토타입 참조 + PX↔AC 매핑 + 전환 흐름 authoring (ADR-056 결정 3·#amend-1·#amend-3 — 이중 잠금 2/2)**:
   입력 feature가 UI 확정·비면제이면, feature `## 7`의 `프로토타입:` 참조 줄에서 화면 파일 경로를 회수해 읽고(UI 확정·비면제 한정 JIT — ADR-019 minimal 정합), 그 화면을 구현하는 *모든* UI task `## 3`에 프로토타입 참조 line item을 authoring한다(신규 요소 유무와 무관 — builder는 기계 실행). 형식: `- 구현 시 승인 프로토타입 참조 — <경로>의 <상태/섹션>과 동일 상태·문구로 구현 (AC-N)`.
   - **PX↔AC 매핑 (ADR-056#amend-1)**: feature `## 7`의 `경험 결정(PX):` 인벤토리 각 PX를 그것을 구현하는 AC로 매핑해 feature `## 7-3. 프로토타입 경험(PX) ↔ AC 매핑`에 `PX-<screen>-NN → T-NNN:AC-M`으로 기입한다(해당 AC 본문에 `(PX-<screen>-NN)` 태그 가능). 어떤 AC도 참조하지 않는 PX(unmapped PX)는 "남은 미결정 사항"에 `- unmapped PX: <PX-<screen>-NN> — 커버 task/AC 없음`으로 surface(unmapped FAC 패턴과 동형 — [Plan-FAC-coverage]가 재점검).
   - **전환 흐름 소비 (ADR-056#amend-3 — `## 9` 전환 표 존재 시)**: 마일스톤 `## 9. 화면 전환`에서 이 feature가 owner인 행을 회수해, 그 **primary path와 실패/복구 path**가 task AC로 커버되는지 확인한다(FEATURE §8-1 복구 흐름과 정합). 미커버 path는 "남은 미결정 사항"에 surface. `## 9`가 "(해당 없음)"이면 skip.
```

**기존** (seam self-check 배치 모드 줄 — L153):

```
- **배치 모드(M<N>)에서는 마일스톤 전체 task 집합 대상 1회 수행** — cross-feature invariant는 **낮은 번호 feature `## 7-2`에 canonical 기재 + 상대 feature `## 7-2`엔 참조 링크 1줄**(ADR-005 SSOT — 양쪽 본문 중복 금지).
```

**변경**:

```
- **배치 모드(M<N>)에서는 마일스톤 전체 task 집합 대상 1회 수행** — cross-feature invariant는 **① 데이터를 실제 소유(write-through)하는 feature → ② 애매하면 최초 사용 feature → ③ 그래도 불명확하면 낮은 번호 feature(결정적 fallback)** 순으로 canonical feature를 정해 그 `## 7-2`에 기재 + 상대 feature `## 7-2`엔 참조 링크 1줄(ADR-005 SSOT — 양쪽 본문 중복 금지; ADR-057#amend-2 소유 우선).
```

**추가 — `--refresh` + PX 재동기 (ADR-056#amend-1 — R2-11 stale 방지)**: `/plan-milestone M<N> --prototype F-NNN` 재승인으로 PX가 추가·삭제되면, 기존 `## 7-3` PX↔AC 매핑이 stale해진다. `--refresh`의 "AC·범위·매핑 미변경" 규율에 **한정 예외**를 둔다 — `/plan-workitem F-NNN --refresh`는 *프로토타입이 재승인된 경우* `## 7-3`의 PX↔AC를 재동기한다(없어진 PX 매핑 제거·신규 PX는 미매핑으로 surface → [Plan-FAC-coverage]가 재점검). PX 인벤토리가 그대로면 손대지 않는다. FAC↔AC(`## 7-1`)·task 범위는 여전히 불변.

## 4.13 validate-plan + reviewer — [Plan-FAC-coverage] PX 확장 (INST-1) + [Plan-design] recovery path (DS-4)

**기존** (`.claude/skills/validate-plan/SKILL.md` 차원 5):

```
5. **[Plan-FAC-coverage]** — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC. P0 권장.
```

**변경**:

```
5. **[Plan-FAC-coverage]** — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC + (UI feature) feature `## 7-3. PX ↔ AC 매핑`의 unmapped PX(ADR-056#amend-1 — 어떤 AC도 참조 안 한 경험 결정). P0 권장.
```

**기존** (`.claude/agents/reviewer.md` Plan Quality 차원 5 — 미러):

```
5. **[Plan-FAC-coverage]** (ADR-037) — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC / 누락 매핑. (P0 권장)
```

**변경**:

```
5. **[Plan-FAC-coverage]** (ADR-037 / ADR-056#amend-1) — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC / 누락 매핑 + (UI feature) feature `## 7-3. PX ↔ AC 매핑`의 unmapped PX(어떤 AC도 참조 안 한 프로토타입 경험 결정). (P0 권장)
```

**추가 — milestone-mode 반전을 PX에도 확장 (F9 — 거짓 P0 방지)**: [Plan-FAC-coverage]를 unmapped PX까지 P0로 확장했으므로, milestone-mode(task 0건 — plan-milestone 직후·plan-workitem 미실행) 반전도 PX를 포함해야 한다. 안 그러면 R5-5가 PX 인벤토리만 채우고 plan-workitem 전이라 `## 7-3` PX↔AC 매핑이 비어 있는 정상 상태가 P0로 폭주한다. **validate-plan과 reviewer.md 양쪽의 milestone-mode 반전 문구를 동일하게 고친다**:

**기존** (`.claude/skills/validate-plan/SKILL.md` milestone-plan mode):

```
- **[Plan-FAC-coverage] 반전**: `## 7-1` 빈 shell은 *정상* — unmapped FAC를 P0로 올리지 **않는다**. shell이 *형식적으로 깨졌을 때만* P2.
```

**변경**:

```
- **[Plan-FAC-coverage] 반전**: `## 7-1`(FAC) *및 `## 7-3`(PX)* 빈 shell은 *정상* — task 0건이면 unmapped FAC·**unmapped PX**를 P0로 올리지 **않는다**(R5-5가 PX 인벤토리만 채우고 plan-workitem 전이라 PX↔AC 매핑이 비어 있는 게 정상 — ADR-056#amend-1). shell이 *형식적으로 깨졌을 때만* P2.
```

> reviewer.md의 milestone-mode 게이팅 문장("빈 `## 7-1` shell은 정상이므로 unmapped FAC를 P0로 올리지 않고…")에도 같은 취지로 "및 `## 7-3` PX 빈 매핑" 을 더한다(미러 동기).

**기존** (`.claude/skills/validate-plan/SKILL.md` 차원 9 — **§3.16에서 이미 category/a11y로 바뀐 상태**):

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / category state(§7 — interactive/data/static) 누락 / **AC·task 본문의 색-단독·포커스 제거·아이콘 라벨 누락 = §9 a11y 위반 의심**(ADR-027#amend-7) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

**변경**: DS-4 recovery path 절을 §10 절 앞에 삽입한다:

```
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / category state(§7 — interactive/data/static) 누락 / **AC·task 본문의 색-단독·포커스 제거·아이콘 라벨 누락 = §9 a11y 위반 의심**(ADR-027#amend-7) / **마일스톤 `## 9. 화면 전환`(있으면) owner 행의 primary path·실패/복구 path가 프로토타입·AC에 존재**(ADR-056#amend-3) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
```

> 주의: reviewer.md의 `[Plan-design]`(§3.15에서 category/a11y로 바뀐 상태)에도 DS-4 recovery path 절을 같은 문구로 더한다(미러 동기). reviewer.md `[Plan-design]` 문단 끝의 `/ **UI task 카피가 …** (ADR-056) (P1 권장)` 앞에 `/ **마일스톤 ## 9 화면 전환(있으면) owner 행의 primary·복구 path가 프로토타입·AC에 존재**(ADR-056#amend-3)`를 삽입.
>
> **milestone-mode 가드 (F9와 동형 — 거짓 P1 방지)**: 이 recovery-path 절의 "…**·AC**에 존재" 절반은 plan-workitem이 AC를 만든 뒤에만 성립한다. task 0건(plan-milestone 직후 milestone-mode)에서는 **프로토타입 존재만 확인하고 AC 커버 절반은 유예**한다 — `## 9` 전환 표의 primary·복구 path가 승인 프로토타입에 나타나는지만 보고, AC 매핑 미비는 P0/P1로 올리지 않는다(정상 상태). AC 커버는 plan-workitem 후 정상 모드 재점검에서 확인. validate-plan·reviewer.md 양쪽 milestone-mode 문구에 이 유예를 명시(F9의 `## 7-3` PX 유예와 같은 절에 한 줄 추가).

**왜**: coverage 차원(dim 5)을 PX까지 확장하되 *차원 개수를 안 늘려* reviewer 미러·카운트 표를 건드리지 않는다(INST-1 최소 침습). recovery path는 [Plan-design]에 흡수(DS-4).

## 4.14 stabilize-milestone — raw-hex 토큰 예외 (INST-2) + graduation 영속 (RD-1)

**기존** (`.claude/skills/stabilize-milestone/SKILL.md` §5-2 raw hex grep):

```
   5-2. **UI 프로젝트 — raw hex grep** (정규식 deterministic): 5-0 에서 회수한 변경 파일 목록 중 확장자가 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html` 인 파일에서 `#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?` 패턴 grep. 일치 발견 시 IMPROVEMENT_GUIDE 에 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장` 기록. **DESIGN.md 자체 파일과 `docs/20-system/prototypes/` 하위는 grep 대상 *제외*** (token 정의 영역·자기완결 프로토타입 — false positive 회피, ADR-056 결정 7).
```

**변경**: 토큰 정의 예외를 추가한다:

```
   5-2. **UI 프로젝트 — raw hex grep** (정규식 deterministic): 5-0 에서 회수한 변경 파일 목록 중 확장자가 `.tsx`/`.jsx`/`.ts`/`.js`/`.vue`/`.svelte`/`.astro`/`.css`/`.scss`/`.html` 인 파일에서 `#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})\b` 패턴 grep(ERE — 3·4·6·8자리 hex 전부; `\b`로 더 긴 hex 런의 부분매치 방지. 구 `{3}([0-9A-Fa-f]{3})?`는 4자리 `#RGBA`·8자리 `#RRGGBBAA`를 놓쳤다). 일치 발견 시 IMPROVEMENT_GUIDE 에 `P1 [Design-rawhex] <file:line> — DESIGN.md ## 2 token 으로 교체 권장` 기록. **제외 (ADR-056#amend-2 — 정의/사용처 라인 구분)**: (a) DESIGN.md 자체 파일, (b) `docs/20-system/prototypes/` 하위(자기완결 프로토타입), (c) **CSS custom property *정의* 라인**(`--<name>: #hex` 형태 — 토큰 정의는 정상; dogfood `src/index.css :root` 오탐 해소). **파일명(`theme`/`tokens` 등)으로 파일 전체를 빼지 않는다**(사용처 위반 은폐 방지 — 정의/사용처는 (c) 라인 형태로만 구분). 검사 대상은 정의 밖 *사용처*(`color:#hex`·`background:#hex` 등) raw hex — 전면 `:root` 제외 금지.
```

**기존** (§1.5 graduation pre-check 판정 출력):

```
판정 출력:
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
- `--dry-run` 플래그가 켜져 있으면 위 평가만 돌리고 즉시 종료(qa·reviewer 위임 단계 4~6 생략).
```

**변경**: graduation 판정을 회고에 영속하는 규정을 추가한다(단, 회고 자동 채움 시점에 기록 — read-only 계약 유지):

```
판정 출력:
- 미충족 항목 발견 시 `졸업 가능: NO` + 미충족 항목 목록을 출력하고 *조기 종료 옵션*을 사용자에게 제시한다(강제 종료 아님).
- 모든 항목 충족 시 `졸업 가능: YES` 출력 후 다음 단계 진행.
- **graduation은 §1.5에서 기록하지 않는다 — §1.5는 pre-check일 뿐**. 단계 4~6(qa·reviewer 팬아웃)이 *새 P0를 찾을 수 있으므로*, 최종 graduation(`YES|NO|BLOCKED (날짜)`)은 **단계 8 회고 자동 채움 시점에 최종 P0로 1회만** 기록한다(아래 회고 항목 정의 + 단계 8). 여기서 '최종 P0'는 **ADR-014 predicate 그대로 `QA_FINDINGS.md`의 본 마일스톤 `### P0` 미해소 0건**을 뜻한다 — 단계 4~6 qa·reviewer가 발견한 P0는 *QA_FINDINGS에 기록되어* 이 predicate에 반영되는 것이지, preflight/reviewer finding을 *별도 predicate로* 세지 않는다(단일 predicate — ADR-014와 stabilize §1.5가 동일 기준). §1.5에서 조기 기록하면 이후 발견된 P0를 못 반영해 잘못된 YES가 박힌다.
- `--dry-run` 플래그가 켜져 있으면 위 평가만 돌리고 즉시 종료(qa·reviewer 위임 단계 4~6 생략 — 회고 미기록, graduation 판정 보류).
```

**기존** (stabilize 도입부 회고 항목 정의):

```
3. milestone 문서의 `## 8. 회고` 섹션 자동 채움 ([ADR-014](../../../docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md) graduation contract — status 변경 X, 본문 단락 갱신만).
   - 회고 본문 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
```

**변경**:

```
3. milestone 문서의 `## 8. 회고` 섹션 자동 채움 ([ADR-014](../../../docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md) graduation contract — status 변경 X, 본문 단락 갱신만).
   - 회고 본문: **graduation 줄(`YES|NO|BLOCKED (날짜)` — 단계 8 판정 영속, ADR-057#amend-1)** + 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
```

**기존** (stabilize `책임 경계` — 회고 채움 줄):

```
책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움.
```

**변경**: 회고 채움 시점에 graduation을 최종 P0로 기록하도록 명시한다:

```
책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 단계 4~6(qa·reviewer) 종료 후 graduation 5+1 기준 *전체를 최종 상태로 재판정*해 기록**(task status·통합 validate·e2e·AC 매핑 100% = 단계 3 결과 + P0 0건 = 단계 4~6 반영 + 추가 기준; YES|NO|BLOCKED+날짜; §1.5 사전점검이 아니라 여기서 확정 — ADR-057#amend-1·ADR-014). 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
```

**왜**: stabilize는 로드맵을 직접 안 쓰고 graduation 판정만 회고에 남긴다(read-only 계약 유지). 그 줄을 다음 plan-milestone R0가 읽어 로드맵을 재조정 — 단일 작성자 규율이 안 깨진다. **판정 시점은 단계 4~6 뒤**라 이번 라운드가 찾은 P0까지 반영된다(§1.5 조기 기록 금지).

> **커밋 (Phase 4 후반 — 계획·경험 스킬 배선)**:
> `feat(planning): wire PX/transition/roadmap/seam into plan-milestone, plan-workitem, validate-plan, reviewer, stabilize`

---

# Phase 5 — 마무리 sync · 조건부 옵션 · 검증

인덱스·구조·워크플로우 정합을 맞추고, ADR-049 참조를 정리하고, 조건부 옵션을 기록한 뒤, 링크 체커로 전수 검증한다.

## 5.1 ADR 인덱스 (`docs/90-decisions/boilerplate/README.md`)

인덱스 표(`| # | 제목 | Status | Amendments | 한 줄 요약 |`)를 갱신한다. **신규 행 1개(ADR-058) + ADR-049 Status→`superseded` + Amendments 컬럼 갱신 9개**(027·051·056·057·050·010·047·014·045).

> **커밋 원자성 (R2-22)**: 이상적으로는 *각 ADR의 인덱스 행 + base `## Surfaces`(§5.1b) + 그 ADR을 인용하는 surface 편집*을 **그 ADR을 만드는 Phase 커밋에 함께** 넣어 중간 커밋 drift를 없앤다. Phase별 커밋을 쓸 경우, 각 Phase 커밋 안에서 그 Phase가 만든 ADR의 인덱스·Surfaces를 함께 갱신하고, 아래 §5.1·§5.1b는 *놓친 분 일괄 정리 + 최종 확인*으로 쓴다(preflight를 중간에 돌리면 미동기 ADR이 `[ADR-index]`/`[Surface-backref]`로 잡히므로, 커밋 단위로 닫는 편이 낫다).

**(a) ADR-058 행 신설** — 057 행 다음에 추가:

```
| 058 | Design Workflow (reference flow + acceptance gate + concept cards) | accepted | — | /bootstrap-design R0~R6 SSOT(ADR-049 supersede) — evidence-on-demand R0 + R2/R6 수용 게이트(렌더·320·populated axe·repair loop) + REFINE/EXPLORE 시안 카드 |
```

**(b) ADR-049 행** — Status를 `accepted` → `superseded (by ADR-058)`로:

기존 행의 `| accepted |`를 `| superseded (by ADR-058) |`로 바꾼다(제목·Amendments·요약은 그대로 — history).

**(c) ADR-027 행** — Amendments 컬럼 닫는 괄호 앞에 추가: `, +#amend-7: DESIGN 내용 계약 확장(정체성·a11y·semantic motion·category state·responsive·tabular)`.

**(d) ADR-051 행** — Amendments 닫는 괄호 앞에 추가: `, +#amend-4: fan-out 크기 판정 기계화 + 하청 정지 회수 + PM 고정`.

**(e) ADR-056 행** — Amendments `—`를 `(+#amend-1: 프로토타입 PX 커버리지, +#amend-2: raw-hex 토큰 정의 예외, +#amend-3: 화면 전환 표)`로.

**(f) ADR-057 행** — Amendments `—`를 `(+#amend-1: 마일스톤 로드맵 SSOT, +#amend-2: seam canonical 소유 우선)`로.

**(g) ADR-050 행** — Amendments `—`를 `(+#amend-1: dispatcher 사전판정 금지)`로.

**(h) ADR-010 행** — Amendments 컬럼 닫는 괄호 앞에 추가: `, +#amend-5: 도구별 memory 비캐노니컬`.

**(i) ADR-047 행** — Amendments `—`(또는 기존 목록)에 `+#amend-1: 변경 검증법(falsifying eval 작성법 + link checker 러너)` 추가.

**(j) ADR-014 행** — Amendments 컬럼 닫는 괄호 앞에 추가: `, +#amend-3: 회고 graduation 줄`. **(§4.6에서 실제 amend 번호를 확인해 그 번호로 일치시킨다.)**

**(k) ADR-045 행** — Amendments `—`(또는 기존)에 `(+#amend-1: D6 재발행 임계 4→8)` 추가(§1.6).

**왜**: stabilize preflight 항목 2("인덱스 amend 수 ↔ 본문 `## Amendment N` 수 일치")가 불일치를 `P1 [ADR-index]`로 잡는다. 본문 amend를 추가했으면 인덱스도 반드시 동기.

## 5.1b amend 신규 surface → base `## Surfaces` 동기

amend가 *새* surface 파일을 추가하면(amend의 `### 적용 surface`), 그 파일이 ADR base `## Surfaces` 블록에도 있어야 fan-out SSOT가 완전해지고 stabilize preflight의 forward-check(등재 파일 존재 + 역참조)가 커버한다(ADR-027이 amend surface를 base `## Surfaces`에 `#amend-N` 주석으로 넣는 관례). **이미 base에 있는 surface는 건드리지 말고, *새로 생긴 것만* 추가**한다. 각 ADR base `## Surfaces`를 열어 아래를 추가:

- **ADR-047**: `- scripts/check-doc-links.mjs — #amend-1 변경 검증 러너` (신규).
- **ADR-056**: `- docs/30-workitems/_templates/TASK_TEMPLATE.md — #amend-1 (PX-<screen>-NN) 태그` (base에 FEATURE_TEMPLATE만 있고 TASK_TEMPLATE 없으면 추가).
- **ADR-057**: `- docs/30-workitems/ROADMAP.md — #amend-1` + `- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — #amend-1 회고 graduation·§9 전환표` (둘 다 base에 없으면 추가).
- **ADR-058**(신규): base `## Surfaces`는 §3.1에서 이미 작성(DESIGN_RESEARCH.md 제외·design-gate.mjs 포함 확인).
- **ADR-010**: **`## Surfaces` 블록이 아예 없다**(확인됨) → amend-5의 `PROJECT_START_CHECKLIST.md`는 amend `### 적용 surface`에만 두고 base 추가 불요(블록이 없으므로 — Surfaces 없는 ADR도 기존 관례상 정상. 원하면 블록 신설 가능하나 필수 아님).
- **그 외**(ADR-051/050/014/027): amend `### 적용 surface`의 각 파일이 base `## Surfaces`에 이미 있는지 *확인하고* **실제로 없는 것만** 추가한다. 대부분 이미 있다(예: ADR-051의 `builder.md`·validate-workitem·implement-workitem·DELEGATION은 base에 이미 등재 — 추가 불필요). 있으면 그대로 둔다.

**왜**: base `## Surfaces`가 fan-out의 유일 정의(ADR-045#d3)라, amend가 새 파일을 건드렸는데 base에 없으면 그 파일의 역참조 정합이 검증 밖에 남는다. `node scripts/check-doc-links.mjs`는 링크만 보고 Surfaces backref는 stabilize preflight가 보므로, 이 동기를 빠뜨리면 다음 stabilize에서 `[Surface-backref]`가 뜬다.

## 5.2 README / README_ko — 디자인 흐름 참조 (ADR-049 → ADR-058)

**기존** (`README.md` Overall Flow의 bootstrap-design 줄):

```
  → /bootstrap-design (frontend only — researches references into DESIGN_RESEARCH.md, shows multiple concept mockups to pick a direction *before* writing DESIGN.md, then a temporary design-preview.html for final review; mockups removed after approval) [ADR-049]
```

**변경**: 흐름 SSOT 참조를 ADR-058로 바꾸고 게이트를 한 조각 반영:

```
  → /bootstrap-design (frontend only — evidence-on-demand reference research into DESIGN_RESEARCH.md, multiple concept mockups (REFINE/EXPLORE) to pick a direction *before* writing DESIGN.md with a render/axe acceptance gate, then a temporary design-preview.html for final review; mockups removed after approval) [ADR-058]
```

**변경 (README_ko)**: `README_ko.md`의 동일 flow 줄도 같은 취지로 `[ADR-049]` → `[ADR-058]` + evidence-on-demand·수용 게이트 반영(README.md와 동시 갱신 — L1 주석 규율). Codex wrapper 목록은 **변경 없음**(신규 skill 없음 — ADR-058은 기존 bootstrap-design을 고칠 뿐).

## 5.3 STRUCTURE.md — 산출물 표 + Canonical Owner

**변경 (a) — 산출물 표에 2행 추가**. `milestone` 행 근처(30-workitems 블록)에 로드맵 행, `verify scripts` 행 근처(scripts 블록)에 체커 행:

```
| milestone roadmap | `docs/30-workitems/ROADMAP.md` | `/plan-milestone` (R3 생성/갱신, R0 재조정 — 단일 작성자) | Living | baseline |
```

```
| doc link/anchor checker | `scripts/check-doc-links.mjs` | 수동 (boilerplate 제공 — 스택 무관 Node 내장) | Reference | baseline |
```

```
| design gate runner (UI) | `scripts/design-gate.mjs` | 수동 (boilerplate 제공 — UI 프로젝트에서 stack-guard Playwright/axe 재사용) | Reference | baseline |
```

**변경 (b) — Canonical Owner 표**. 기존 "UI 디자인 워크플로우 라운드 구조" 행의 owner를 ADR-058로 바꾸고, 로드맵 행을 추가한다.

기존:

```
| UI 디자인 워크플로우 라운드 구조 (R0~R6 concept-first) + 레퍼런스 노트 | [ADR-049](../90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md) (정책 SSOT — 라운드 구조·시안 시점). → ADR-049 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
```

변경:

```
| UI 디자인 워크플로우 (R0~R6 + evidence-on-demand 리서치 + 수용 게이트 + REFINE/EXPLORE 시안) | [ADR-058](../90-decisions/boilerplate/ADR-058-design-workflow.md) (정책 SSOT — ADR-049 supersede). → ADR-058 `## Surfaces` 참조. DESIGN.md *내용*·인터페이스 할당은 [ADR-027](../90-decisions/boilerplate/ADR-027-interface-decision-allocation.md). |
| 마일스톤 로드맵 SSOT (Done/Now/Next/Later forward 지도) | [ADR-057](../90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-1 (정책 SSOT). 파일: `docs/30-workitems/ROADMAP.md` (단일 작성자 = plan-milestone). |
```

## 5.4 WORKFLOW.md — 디자인 흐름 참조 + 로드맵 surface

**기존** (§2 시스템 설계의 디자인 흐름 줄):

```
- UI 프로젝트의 `/bootstrap-design` 라운드 구조는 ADR-049(concept-mockup-first): R0(레퍼런스 + `DESIGN_RESEARCH.md`) → R1(원칙 + voice 기본값 확인 — ADR-056) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 — 실카피 렌더, 사용자가 시각 방향 선택)** → R3(토큰)·R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인). **사용자가 R2 concept 방향을 선택하고 R6 preview를 승인한 뒤** concept/preview 시안을 삭제하고 `/plan-milestone`으로 진행 권장(첫 마일스톤·feature 생성 — ADR-057; 이미 분해된 feature가 있으면 `/plan-workitem`) (ADR-049#d29·#d31). DESIGN.md *내용*·인터페이스 할당 SSOT는 ADR-027.
```

**변경**: ADR-049 참조를 ADR-058로 바꾸고 수용 게이트를 한 조각 반영:

```
- UI 프로젝트의 `/bootstrap-design` 라운드 구조는 ADR-058(design workflow): R0(evidence-on-demand 리서치 + `DESIGN_RESEARCH.md`) → R1(원칙 + voice 기본값 확인 — ADR-056) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 REFINE/EXPLORE — 실카피 렌더 + 수용 게이트(320·populated axe·repair loop), 사용자가 시각 방향 선택)** → R3(토큰)·R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인 + 게이트). **사용자가 R2 concept 방향을 선택하고 R6 preview를 승인한 뒤** concept/preview 시안을 삭제하고 `/plan-milestone`으로 진행 권장(첫 마일스톤·feature 생성 — ADR-057; 이미 분해된 feature가 있으면 `/plan-workitem`) (ADR-058). DESIGN.md *내용*·인터페이스 할당 SSOT는 ADR-027.
```

**기존** (§3 작업 단위 분해 초입):

```
## 3. 작업 단위 분해
- 마일스톤·feature 문서는 첫 마일스톤(M1)부터 `/plan-milestone`이 만든다(ADR-057 — bootstrap-project는 charter/architecture까지).
```

**변경**: 로드맵 한 줄 추가:

```
## 3. 작업 단위 분해
- 마일스톤·feature 문서는 첫 마일스톤(M1)부터 `/plan-milestone`이 만든다(ADR-057 — bootstrap-project는 charter/architecture까지).
- `/plan-milestone`은 `docs/30-workitems/ROADMAP.md`(Done/Now/Next/Later forward 지도)를 단독으로 유지한다 — R3에서 현재/직전 행 갱신, R0에서 회고 graduation으로 재조정 (ADR-057#amend-1). 예정(Next/Later) 행은 "목표 1줄 + 확신도"만(얇음 규율).
```

## 5.5 ADR-049 참조 re-point 스윕

ADR-049가 `superseded`가 됐으므로, 그것을 **현재 정책으로 인용하는** 참조는 ADR-058로 바꾼다(순수 *역사적 언급*은 그대로 둬도 되나 P2 [Ref-dead]로 보고될 수 있음).

1. `grep -rn "ADR-049" --include="*.md" .` (또는 Grep 도구)로 전수 확인.
2. **판정 규칙 (핵심 — 단순 치환 금지)**: 각 `ADR-049` hit를 두 종류로 나눈다. **(현재 정책 인용)** = "라운드 구조/R0 grounding/게이트/시안 정책은 ADR-049" 같이 *지금 따르는 규칙*을 가리키면 → **`ADR-058`로 re-point**. **(역사적 사실)** = "ADR-049가 ADR-027 #3/#13…을 supersede했다" 같이 *과거에 일어난 일*을 서술하면 → **그대로 둔다**(ADR-049는 `superseded`로 history 잔존하므로 역사 인용은 유효). old-decision→new-decision 매핑을 이 기준으로 판단.
   **re-point 대상 파일 (grep 결과 전수 — 현재 정책 인용분만)**:
   - `.claude/skills/bootstrap-design/SKILL.md` — §3.11~3.13에서 대부분 처리, 남은 `ADR-049#dK`/`#amend-M` 인라인 토큰.
   - `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` — **4곳**(§3.3는 현재유효결정 첫 불릿만 바꿈). 남은: 현재유효결정의 흐름 참조 잔여 · `## Surfaces` 라벨의 "라운드 구조는 ADR-049" · `#amend-4` "라운드 구조는 ADR-049" · `#amend-6`. *현재 정책* 부분만 ADR-058로, "ADR-049가 supersede" *역사 서술*은 유지.
   - `docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md` — **5곳**. R5·§3-V가 ADR-049 ephemeral 정책·R2 concept을 *현재 정책*으로 인용하면 ADR-058로.
   - `docs/00-meta/DELEGATION_STRATEGY.md` (1곳 — designer 행) · `docs/00-meta/PROJECT_START_CHECKLIST.md` (1곳 — design flow 단계) · `docs/20-system/DESIGN.md` §0 주석 · `.claude/agents/designer.md` · `docs/90-decisions/boilerplate/ADR-040...` #amend-4("R0 위계 배선 ADR-049#amend-2"→ADR-058).
   - `.gitignore`의 `ADR-049#d31`만 → `ADR-058`(같은 L24 줄 `ADR-027#d22`는 ADR-027 역사 앵커 — 건드리지 말 것; `ADR-049#d22`는 없음).
   - **접미(`#dK`/`#amend-M`) 처리 (F3 — 없는 토큰 생성 금지)**: ADR-058은 결정 구조가 ADR-049와 달라 **결정 1~5·amend 0개**라, ADR-049의 `#d28`~`#d31`·`#amend-2`에 1:1 대응 앵커가 **없다**. re-point 시 그 접미는 **떼고 bare `ADR-058`로** 쓴다(명백히 대응하는 ADR-058 결정번호가 있으면 그 번호로만). `ADR-058#d30`·`ADR-058#amend-2` 같은 *존재하지 않는* 토큰을 만들지 말 것. `#dK`는 clickable anchor가 아니라 grep 토큰(ADR-045 D1)이라 `check-doc-links.mjs`가 산문 속 dead grep 토큰은 **못 잡는다**(markdown 링크 `[..](..#anchor)` 앵커만 검사) → 자동 검출이 안 되니 접미 제거는 **수기**로 확실히 한다.
3. **그대로 둘 것**: ADR-049 본문 자체(history) + ADR-027 본문에서 이미 §3.3이 처리한 참조.
4. 확인: `node scripts/check-doc-links.mjs` — markdown 링크 앵커의 dead(예: 없어진 `[..](..#dK)`)는 잡는다. **산문 grep 토큰(`ADR-058#dK`)의 dead는 체커가 못 잡으니** 위 접미 규칙을 수기로 적용했는지 `grep -rn "ADR-058#" --include="*.md" .`로 육안 확인한다.

**왜**: 죽은/역사 ADR 인용을 정리해 에이전트가 현재 정책 문서로 안내받게 한다. checker가 markdown 앵커는 자동 확인, grep 토큰은 위 육안 확인.

## 5.6 조건부 옵션 (OPT-1 · OPT-2 — opt-in 기록만)

기본 틀에 강제 도입하지 않고, 프로젝트가 실제로 요구할 때만 쓰는 opt-in 어댑터로 **기록만** 남긴다. 공통 규율: 결과는 `DESIGN_RESEARCH.md`에 provenance를 남기고, 승인된 결정만 정식 문서로 정규화.

**OPT-1 — Google Stitch를 concept 생성기로 (옵션)**. `.claude/skills/bootstrap-design/SKILL.md` R2-1 생성 불릿 끝에 opt-in 한 줄 추가:

```
- **(옵션) 외부 concept generator**: UI 프로젝트가 원하면 Google Stitch 등 외부 도구를 concept 생성 보조로 쓸 수 있다 — 단 **기본 의존 금지**(계정·도구 의존 — ADR-027#amend-2 비결정 존중). 산출물은 DESIGN_RESEARCH.md에 provenance 기록 후, 승인된 방향만 DESIGN.md로 정규화(생성/감사 분리·취향 오라클=사용자 불변).
```

**OPT-2 — 마케팅/랜딩 한정 포지셔닝 필드 (옵션)**. `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` §8-1 주석 끝에 opt-in 한 줄 추가:

```
     - (옵션, 마케팅·랜딩 화면 한정) 포지셔닝: audience / JTBD / objection / proof / voice / key action을 *이 필드에 매핑*해 랜딩 카피 근거로 둔다(별도 마케팅 SSOT·스킬 설치 없음 — §10 Voice와 자연 연결). 마케팅 스코프 도입이 아니라 카피 근거 기록 수준.
```

**왜**: "가져오지 않기로 한 것"과 구분해, 프로젝트가 필요로 할 때의 경로만 최소 기록(과잉 도입 회피).

## 5.7 최종 검증

1. **링크·앵커 전수**: `node scripts/check-doc-links.mjs` (+ `--frontmatter`) — 죽은 링크·앵커·frontmatter 0건 확인. 이번 개선에서 새로 만든 anchor(`adr-045-amend-1`, `adr-027-amend-7`, `adr-056-amend-1..3`, `adr-057-amend-1..2`, `adr-051-amend-4`, `adr-050-amend-1`, `adr-010-amend-5`, `adr-047-amend-1`, `adr-014-amend-3`)를 인용한 링크가 실제로 존재하는지 걸린다. (**ADR-058은 amendment가 없어 `adr-058-*` 앵커가 없다** — ADR-058 인용은 파일 링크 `ADR-058-design-workflow.md`(fragment 없음)뿐이라 이 목록에 넣지 않는다.)
2. **인덱스 amend 동기**: 각 ADR 본문 `## Amendment N` 개수 ↔ `boilerplate/README.md` Amendments 컬럼 일치(§5.1). stabilize preflight 항목 2가 `P1 [ADR-index]`로 잡는 것과 동일.
3. **Surfaces 정합**: 새 ADR-058 `## Surfaces`에 등재한 파일들이 실제로 `ADR-058` 역참조를 갖는지(preflight 항목 2 Surfaces forward check). 각 surface 파일에 ADR-058 링크를 이미 박았으므로 통과해야 한다.
4. **미러 동기 확인**: (a) reviewer.md **Plan Quality 차원** ↔ validate-plan **검토 차원 + 카테고리 카운트 표** 미러 일치 — [Plan-FAC-coverage](PX 확장·milestone-mode PX 반전 포함)·[Plan-design](category/a11y/recovery)를 *양쪽 동일 문구*로 바꿨는지. (b) reviewer.md **Design Consistency**는 *reviewer 내부* 검사라 validate-plan엔 없다 — reviewer.md 안에서만 헤더가 `6 차원`이고 [Design-state] category·신설 [Design-a11y]·"상태 매트릭스 책임 분배" 표 제목·근거까지 category로 바뀌었는지 확인.
5. **Mutation Contract 준수 (D3 enabling — P2 보고만, 하드 게이트 아님)**: ADR-058에 full 6필드가 있는지(신규 standalone ADR 관례). base 계약이 있는 ADR(051·010·047·050·056·057)의 harness amend에 delta 한 줄(failure/falsifier/rollback)이 있는지 — *권장*, 누락은 P2. pre-047 ADR(027·014) amend는 계약 불요. **어느 것도 통과 차단 조건이 아니다**(ADR-047 §정책강도: 자동 차단 0)(§전역 거버넌스).
6. **DS-3 게이트 러너 스모크 (필수 — 가장 위험한 신규 실행물)**: 의도적 결함 샘플 HTML로 `node scripts/design-gate.mjs`를 실제로 돌려 검증한다 — (a) 저대비 텍스트 샘플 → `blockers`에 `axe:color-contrast`(serious) 잡힘, (b) 320에서 page가 넘치는 샘플 → `blockers`에 `page-overflow`, (c) 320에서 요소가 viewport 밖으로 나가거나(escape) overflow:hidden으로 텍스트가 잘리는 샘플 → `blockers`에 `viewport-escape`/`clipped-text`, (d) 정상 sr-only·`overflow-x:auto` 표·의도적 ellipsis 샘플 → **오탐 없이 통과**(제외 로직 검증), (e) clean 샘플 → blocker 0·exit 0·`screenshots[]` 생성. Playwright/axe 미설치 환경은 exit 2(Needs Install), 브라우저 바이너리 부재도 exit 2 확인. **이 스모크가 통과해야 R2-G/R6/R5 게이트가 실제 작동**한다(러너가 declared 계약대로 도는지 확인 — **러너 결정적 = axe + geometry(overflow·escape·clip)**, reviewer 픽셀 = 위계·밀도·slop·overlap임을 재확인).

> **커밋 (Phase 5 — 인덱스·구조·워크플로우 sync + 옵션)**:
> `docs: sync ADR index, STRUCTURE, WORKFLOW, README for the design/planning improvement round; re-point ADR-049→058`

---

# 완료 후

- 이 `IMPROVE-GUIDE.md`는 개선 실행용 임시 문서다 — 모든 Phase 적용·커밋이 끝나면 삭제한다(저장소 어디에서도 이 파일을 참조하지 않는다).
- 커밋 순서 요약(제안): Phase 1 → Phase 2(2.1~2.6, 2.7~2.8) → Phase 3(전반, 후반) → Phase 4(전반, 후반) → Phase 5. 각 커밋 전 `node scripts/check-doc-links.mjs`로 링크 무결성을 빠르게 확인하면 좋다.
- **Phase 사이 일시적 비정합은 *최종 적용 상태*에서만 검사한다 (F5 및 그 클래스)**: Phase별 커밋 사이엔 몇몇 참조가 일시적으로 dangling일 수 있다 — (a) Phase 3 `designer.md`의 산문 `ADR-056#amend-1`은 Phase 4에서 생성됨, (b) README ADR-index·amend surface 동기는 Phase 5에서 일괄 처리됨. `check-doc-links.mjs`는 markdown 링크만 보지만 **stabilize preflight의 `[Ref-anchor]`는 `ADR-NNN#amend-M`를 산문에서도 grep**(그 검사가 `<!-- -->` 주석을 예외로 두는 것 자체가 산문 grep 증거)하고 `[ADR-index]`·`[Surface-backref]`도 부분 상태에서 P1을 낼 수 있다. **이들은 전 Phase 적용 후 전부 해소**된다. → 규칙: Phase들을 연속 적용하고(특히 3·4는 함께/연속), **부분 Phase 상태에서 stabilize preflight를 돌리지 않는다**. 정합 검사는 Phase 5 + §5.7(최종 적용 상태)에서만 결정적으로 수행. 각 커밋 전 `check-doc-links.mjs`(markdown 링크·앵커)는 언제든 안전.
- **가설 표시 항목**(DS-4 화면 전환·DS-5 signature·DS-6 motion 세부)은 정책상 채택했으나 `REPORT §13` 수용기준 실측 전까지는 *directional*이다 — 다운스트림에서 과신 금지(각 amend `### 강도`에 명시).
- **전체 검증(ADR-017 dogfood)은 *의무*다 — 권장 아님**: [ADR-017](docs/90-decisions/boilerplate/ADR-017-dogfood-simulation.md)은 "재실행 트리거 3종"(신규 ADR(amendment 포함)·lifecycle 단계 변경·skill 본문 큰 변경) 중 1개라도 발생하면 Round N+1 dogfood를 **의무화**한다. 이번 라운드는 셋 다 해당하므로 적용 후 todo-CLI baseline dogfood 1회가 **필수**다(ADR-017 gate). **Phase 5는 정적 정합(링크·인덱스·미러·게이트 스모크)만** 결정적으로 확인 — 그것으로 dogfood 의무가 면제되지 않는다. 회귀 검출은 이 적용-후 dogfood가 담당하고(ADR-047 D4: falsifying evaluation 기본값 = ADR-017 baseline 재실행; falsifying eval은 사전 게이트가 아니라 rollback 트리거이므로 *적용 후*가 맞다), 검출 시 해당 Mutation Contract의 rollback path로 되돌린다.
- **착수 안 한 항목**은 이 문서 상단 "착수하지 않는 항목"에 근거와 함께 명시돼 있다(INST-4 관찰·INST-5·기타 미검증·HN-3·백로그 정규화).






