---
name: validate-plan
description: 다른 세션·다른 LLM에서 `/plan-workitem`이 생성·갱신한 workitem 문서를 비판적으로 교차 검토하고 임시 리뷰 파일 1개를 작성한다. workitem 문서 자체는 수정하지 않는다 (ADR-038).
argument-hint: "[milestone or feature or task id] [--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. milestone/feature/task 문서 일체 수정 금지. 코드 수정 금지. 커밋 금지.

너의 역할은 입력 workitem ID에 해당하는 plan 문서를 *외부 시선*으로 비판적으로 검토하고, 임시 리뷰 파일 1개를 작성하는 것이다.

**호출 시나리오**: 사용자는 원본 plan 세션과 *다른 터미널·다른 세션·다른 LLM*에서 본 skill을 호출한다. 본 skill의 출력 리뷰 파일은 원본 세션의 `/repair-plan`이 회수한다.

**⚠ 같은 checkout/worktree 운영 제약**: `/validate-plan`이 작성하는 리뷰 파일은 `docs/40-validation/plan-reviews/`의 *로컬 파일*이며 `.gitignore`된 상태. 다른 worktree 또는 다른 checkout에서 호출하면 원본 세션의 `/repair-plan`이 파일을 *못 본다*. **두 skill을 같은 checkout/worktree에서 실행**하거나, 다른 worktree에서 실행했다면 *원본 checkout으로 파일을 수동 이동* 후 `/repair-plan` 호출.

**다중 리뷰어 동시 실행 시 `--reviewer-tag` 필수 권장** — 각 리뷰어 호출 시 *서로 다른 tag 명시* (예: `--reviewer-tag claude-b`, `--reviewer-tag codex`). 미지정 시 둘 다 `default` 태그로 저장되어 충돌 가능성 발생 — 자동 suffix 부여 동작은 아래 입력 단락 참조.

입력:
- `$ARGUMENTS`에는 milestone ID(`M1`) / feature ID(`F-001`) / task ID(`T-001`) + 선택 플래그 `--reviewer-tag <tag>`가 들어온다.
- `--reviewer-tag` 미지정 시 `default` 사용.
- **tag 형식 제약**: `[A-Za-z0-9._-]{1,32}` (파일 경로에 들어가므로). **미일치 시 *즉시 종료*** (silent fallback X — silent overwrite 위험 회피). 사용자에게 valid tag 형식 안내 후 종료.
- **workitem-id 형식 제약**: `M[0-9]+` / `F-[0-9]+` / `T-[0-9]+` 만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 즉시 종료.
- **파일 존재 시 자동 suffix**: 호출 시점에 `docs/40-validation/plan-reviews/<workitem-id>.<tag>.md`가 이미 존재하면 `<tag>-2.md`, `<tag>-3.md`로 *자동 suffix 부여* (silent overwrite 방지). 출력에 "기존 리뷰 파일 존재 — `<id>.<tag>-N.md`로 저장" 한 줄 안내.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md` (`## 5. 비목표`, `## 7. 제약 조건` 참조)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` (`## 3-1. 레이어 경계` 참조 — *부재* 시 [Plan-arch] 차원 skip + 리뷰 파일 "핵심 관찰"에 그 사실 명시)
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` (해당 스택 한정 — [Plan-arch-iface] 참조). *해당 sub-section 부재 시 본 차원 skip*.
- `docs/20-system/DESIGN.md` (UI 프로젝트 한정 — [Plan-design] 참조). *파일 부재 시 본 차원 skip + "핵심 관찰" 에 명시*.
- 입력 ID에 해당하는 workitem 문서 + **모든 하위 문서**:
  - `M1` 입력 → `docs/30-workitems/milestones/M1-*.md` + 본 마일스톤 산하 feature/task 전체
  - `F-001` 입력 → 해당 feature 문서 + 본 feature 산하 task 전체
  - `T-001` 입력 → 해당 task 문서 + (있으면) 상위 feature + 상위 milestone
- **하위 문서 탐색 규칙**:
  1. **파일명 prefix glob**: `M1-*.md`, `F-001-*.md`, `T-NNN-*.md` 패턴.
  2. **상위 문서 link 본문**: milestone `## 3. 포함되는 기능` / feature `## 7-1. FAC ↔ AC 매핑표` / task `## 7. 관련 문서`에서 명시 link.
  3. **본문 link**: 상위/하위 문서가 서로 인용한 markdown link 추적.
  세 단계 모두 결과 0건이면 *"하위 문서 회수 0건"* 한 줄 echo 후 본 workitem만 회수하고 진행 (자동 차단 X).
- `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `FEATURE_TEMPLATE.md`, `TASK_TEMPLATE.md` (양식 정합 점검용)

**큰 milestone budget 가이드 (ADR-019 minimal/JIT 정합)**: 산하 task 합산 ≥10개면 다음 순서로 budget — (a) feature 문서 전체 + 각 task `## 6 AC` 섹션만 1차 회수, (b) 그 결과로 P0 의심 task 후보를 좁힌 뒤 (c) 후보 task 본문 전체를 깊게 읽는다. 모든 task 본문을 사전 fork-load 금지.

## 입력 형태 판정 — milestone-plan mode (ADR-038#amend-4)
하위 문서 회수 결과 **분해된 task가 0건**이면(plan-milestone 직후·plan-workitem 미실행) **milestone-plan mode**:
- **비활성**: [Plan-sizing]·[Plan-AC-form]·[Plan-dep] (task 산물 부재). [Plan-seam]은 task 0건이면 비활성.
- **[Plan-FAC-coverage] 반전**: `## 7-1`(FAC) *및 `## 7-3`(PX)* 빈 shell은 *정상* — task 0건이면 unmapped FAC·**unmapped PX**를 P0로 올리지 **않는다**(R5-5가 PX 인벤토리만 채우고 plan-workitem 전이라 PX↔AC 매핑이 비어 있는 게 정상 — ADR-056#amend-1). shell이 *형식적으로 깨졌을 때만* P2. **[Plan-design] recovery-path 유예(F9와 동형, ADR-056#amend-3)**: task 0건이면 `## 9` 전환 표의 존재하는 각 path type 행(primary/failure/recovery)이 승인 프로토타입에 나타나는지만 보고, AC 매핑 미비는 P0/P1로 올리지 않는다(plan-workitem 후 정상 모드에서 AC 커버 재점검).
- **활성**: milestone-plan 4차원(아래).
- 혼합 마일스톤은 **feature 단위로** mode 적용. task가 1건+면 11차원.

검토 차원 (11 dimensions — reviewer.md의 *Plan Quality 11 차원* 정합 — ADR-027#amend-1):
1. **[Plan-scope]** — Charter `## 5. 비목표` 키워드 위반 / 상위 milestone `## 4. 제외되는 기능` 위반. P0 권장.
2. **[Plan-sizing]** — 1 task = 1 RGR 위반 / AC 4개 이상 / 변경 예정 파일 5개 초과 (초기 scaffolding·auth 예외). P1 권장.
3. **[Plan-AC-form]** — Given-When-Then 형식 부재 / 강력 금지 verb ("works"/"looks good"/"is correct"/"is fine"). P0 권장.
4. **[Plan-ambiguity]** — 1 AC에 2+ 합리적 해석 가능. P1 권장.
5. **[Plan-FAC-coverage]** (ADR-037) — feature `## 7-1. FAC ↔ AC 매핑표`의 unmapped FAC + (UI feature) feature `## 7-3. PX ↔ AC 매핑`의 unmapped PX(ADR-056#amend-1 — 어떤 AC도 참조 안 한 경험 결정) + **PX 소유·문법 (구조 — `M<N>` 입력 전용, task 수 무관)**: `M<N>` 입력이면 **`docs/20-system/prototypes/M<N>/*.html` glob**(`_drafts/` 제외)로 현재 active 화면 HTML 전체를 회수해 — ① **각 active 화면에 PX ≥1개** · ② **id 문법·화면 경로 일치**(`^PX-M<N>-<screen>-\d{2,}$`; id의 `M`/`<screen>`이 파일 경로 `M<N>/<screen>.html`와 일치 — 화면 revision 없음, 마일스톤 번호가 버전) · ③ **한 화면 HTML 내 id 중복 없음** · ④ **승인 HTML active PX = 모든 feature `## 7` 인벤토리의 disjoint union**(**orphan**=HTML엔 있으나 미인벤토리 · **중복**=2+ feature · **누락**=인벤토리엔 있으나 HTML엔 없음 — 완전-orphan HTML도 glob이 잡음, R5-5 이후 drift까지 검출; 매핑 `## 7-3`과 별개) · ⑤ **각 active PX 정확히 1 feature `## 7`에** · ⑥ **HTML 마커 ↔ feature 인벤토리는 `(id, 설명)` 쌍으로 정확 일치**(같은 id인데 설명이 다르면 mirror drift = fail — 현재 HTML 미러 drift 검사) · ⑦ **task `## 6`의 `(PX-…)` 태그는 선택이지만 *존재하면* 그 `(PX, task:AC)`가 feature `## 7-3` 매핑 RHS와 일치**(태그가 매핑과 다른 task:AC를 가리키면 태그-매핑 불일치 = P1) — 를 검사한다. **`F`/`T` 단독 입력은 sibling·glob 미독이라 이 cross-feature 검사 skip(P0 금지)**. **task 0건이라도 `M<N>` 입력이면 위 소유·문법 검사는 실행**(M입력은 feature 전체·HTML을 읽으므로 가능 — task 산물 부재는 PX↔AC coverage만 유예). *귀속 feature 적합성은 LLM 판정(엉뚱한 feature면 오배정)*. P0 권장.
6. **[Plan-dep]** — task `## 9. 의존성` 누락 / 잘못된 병렬 주장(P1 권장) + (`M<N>` 입력 시, ADR-057#amend-3) 의존성 그래프의 **존재성**(참조 선행 task 실재) · **비순환**(순환=실행 순서 부재) · **AC-보장**(후행 `## 3`가 전제한 선행 산출이 그 선행 task의 참조 AC에 존재) — 세 위반 모두 **P0**(실행 가능한 계획 미완 — plan-workitem 성공·task `ready` 승격 차단과 정합).
7. **[Plan-arch]** — ARCHITECTURE_OVERVIEW `## 3-1` 레이어 경계 위반 의심. *`## 3-1` 섹션 자체가 부재한 fork*에서는 본 차원 *skip* + "핵심 관찰"에 "[Plan-arch] skipped: `## 3-1` 부재" 한 줄 명시. P1 권장.
8. **[Plan-doc-link]** — task `## 7. 관련 문서` / feature `## 11. 관련 문서` link 누락·깨짐. P2 권장.
9. **[Plan-design]** (UI 한정 — DESIGN.md 부재 시 skip) — DESIGN.md `## 7` 인벤토리 외 컴포넌트 신설 / raw hex / Don'ts 위반 / task use-case 에 등장하는 category state(§7 — interactive/data/static)가 AC 에 누락 / **AC·task 본문의 색-단독·포커스 제거·아이콘 라벨 누락 = §9 a11y 위반 의심**(ADR-027#amend-7) / **마일스톤 `## 9. 화면 전환`(있으면) owner의 존재하는 각 path type 행(primary/failure/recovery)이 프로토타입·AC에 존재**(ADR-056#amend-3) / **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056). P1 권장.
10. **[Plan-arch-iface]** (해당 스택 한정 — 7-x sub-section 부재 시 skip) — ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 기존 결정 위반 / Don'ts 위반. P0 권장.
11. **[Plan-seam]** (ADR-057 결정 11 — seam 신호 해당 feature 한정) — 신호 4종(2+ writer/상태 머신/2차-write/멱등) 해당인데 feature `## 7-2` 부재·형식 파손 / task 간 입출력 계약 불일치 의심 / INV가 어떤 task AC에도 안 걸림. 신호 미해당 시 skip. P1 권장.

**milestone-plan 4차원 (milestone-mode 한정, ADR-038#amend-4):**
12. **[MP-FAC-quality]** — FAC가 *시나리오 수준 + 측정 가능*('works' 류 금지), feature `## 3` 시나리오 추적. P0.
13. **[MP-feature-scope]** — feature가 charter `## 5 비목표` / milestone `## 4 제외되는 기능` 침범 여부. P0.
14. **[MP-graduation]** — milestone `## 5 완료 기준` graduation 5+1(ADR-014) 정합 + UI/e2e 시 e2e 선언(ADR-052). P1.
15. **[MP-feature-dep]** — feature 간 의존(순환·잘못된 병렬). P1.

판정 규칙 (review verdict — 워크플로우 차단 아님):
- **NEEDS_CHANGES** — P0 finding 1개 이상.
- **ALL_GOOD** — P0 finding 0개. (P1/P2는 ALL_GOOD을 막지 않음.)
- 본 판정은 *리뷰 파일에 박는 severity 라벨*이지 자동 차단 트리거 아님 (ADR-038 enabling 약 + ADR-007 책임 경계). `/repair-plan`이 본 판정을 입력 신호로 받아 사용자 결정에 따라 적용.

마지막 단계 — 리뷰 파일 작성:

1. 출력 파일 경로: `docs/40-validation/plan-reviews/<workitem-id>.<reviewer-tag>.md`
   - 동일 tag로 재호출 시 기존 파일은 보존하고 `<tag>-2.md`/`<tag>-3.md`로 자동 suffix 부여 (위 입력 단락 — silent overwrite 방지).
   - 다른 tag로 동시 검토 시 파일 충돌 없음.
2. 다음 양식 그대로 작성:

```markdown
# Plan Review: <workitem-id>

- 리뷰어 태그: <reviewer-tag>
- 리뷰 시각: <ISO 8601 — LLM 컨텍스트의 today's date 사용. 예: `2026-05-23T00:00:00Z`>
- 대상 workitem: <workitem-id>
- 대상 문서 경로 (회수한 모든 문서):
  - <path 1>
  - <path 2>
- 판정: ALL_GOOD | NEEDS_CHANGES

## 발견

### P0 (수용 강력 권장 — plan 품질 critical, repair-plan에서 우선 처리)
- [P0] [Plan-AC-form] T-002:AC-1 — verb "works"는 비측정. [Given]..[When]..[Then] 형식 + measurable verb로 재작성 권장.
- [P0] [Plan-FAC-coverage] F-001:FAC-3 — unmapped. 본 FAC를 커버할 task 추가 (예: T-007) 권장.

### P1 (수용 권장 — plan 품질 저하)
- [P1] [Plan-sizing] T-001 — AC 4개. 1 task = 1 RGR 사이클 정합 위해 T-001a/T-001b로 분리 권장.

### P2 (개선 제안 — accept 선택)
- [P2] [Plan-doc-link] T-003 — `## 7. 관련 문서`에 Architecture 링크 누락.

## 카테고리 별 카운트
| Category | P0 | P1 | P2 |
|----------|----|----|----|
| Plan-scope | 0 | 0 | 0 |
| Plan-sizing | 0 | 1 | 0 |
| Plan-AC-form | 1 | 0 | 0 |
| Plan-ambiguity | 0 | 0 | 0 |
| Plan-FAC-coverage | 1 | 0 | 0 |
| Plan-dep | 0 | 0 | 0 |
| Plan-arch | 0 | 0 | 0 |
| Plan-doc-link | 0 | 0 | 1 |
| Plan-design | 0 | 0 | 0 |
| Plan-arch-iface | 0 | 0 | 0 |
| Plan-seam | 0 | 0 | 0 |
| MP-FAC-quality | 0 | 0 | 0 |
| MP-feature-scope | 0 | 0 | 0 |
| MP-graduation | 0 | 0 | 0 |
| MP-feature-dep | 0 | 0 | 0 |

## 핵심 관찰 (3개 이내)
- ...
- ...

## 다음 권장 액션 (원본 plan 세션에서)
`/repair-plan <workitem-id>` — 본 파일 + 다른 리뷰어 파일을 일괄 회수.
```

마지막 출력 (메인 세션에 텍스트로):
- 판정 (ALL_GOOD / NEEDS_CHANGES) — *review verdict, 워크플로우 차단 아님*을 한 줄 명시. **ALL_GOOD 의미 보강**: P0 finding 0개를 의미 — P1/P2 finding은 있을 수 있고 `/repair-plan`에서 4결정 중 하나로 다뤄짐.
- 실제 사용된 `<reviewer-tag>` (입력 그대로 또는 자동 suffix 부여된 `<tag>-N`). suffix 부여 시 사유 1줄 함께 출력 ("기존 파일 존재 — `-N` suffix 부여").
- P0 / P1 / P2 카운트
- 리뷰 파일 경로
- 다음 권장 액션: "원본 plan 세션에서 `/repair-plan <workitem-id>` 실행" + (다른 worktree에서 호출했을 시) "리뷰 파일을 원본 checkout으로 이동 후 호출"

가드:
- workitem 문서(milestone / feature / task) 일체 수정 금지.
- IMPROVEMENT_GUIDE / QA_FINDINGS / report 디렉터리 등 다른 산출물 위치 수정 금지.
- 코드 일체 수정 금지.
- 커밋 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
