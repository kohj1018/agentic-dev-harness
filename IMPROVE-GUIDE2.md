# IMPROVE-GUIDE (Part 2 / 2) — 가치형 확장 + 위생

> `IMPROVE-GUIDE.md`(Part 1)의 연속이다. **Part 1(Step 1~7)을 먼저 완료**한다 — Part 2는 Step 5(researcher)·Step 6(Evidence Log)에 의존한다.
> Part 2는 Step 8~18. 각 Step은 비교적 독립적이라 일부만 골라 적용해도 된다(우선순위·의존은 각 Step 머리에 표기).
> 규약(Before/After, SSOT 후속 체크리스트, 커밋)은 Part 1 `## 0`과 동일.

### Step 인덱스 (Part 2)
```
 Step 8   bootstrap-stack --recommend / --migrate + ADR-041     (의존: Step 5)        P1
 Step 9   UX 흐름 품질 (FEATURE §8-1 UX 필드) + ADR-042            (의존: Step 6)        P1
 Step 10  MCP Optional Connectors 정책 + 연결 절차 + ADR-043      (의존: Step 5)        P2
 Step 11  Playwright MCP 탐색적 QA path (stabilize)             (의존: Step 10)       P2
 Step 12  ADR area 인덱스 + review-doc 타이밍                                          P2
 Step 13  plan-workitem 지시문 다이어트 (UI 판정 → ADR-027 amend3)  (Step 7과 함께)      P2
 Step 14  plan-workitem silent-overwrite 문구 정정                                    P2
 Step 15  bootstrap-design --update 모드 + ADR-027 amend4        (독립)               P2
 Step 16  plan-workitem 기술 부채 회수 hook                      (의존: Step 1)        P2
 Step 17  CI workflow opt-in 생성 + 로컬 hook 안내               (독립)               P2
 Step 18  validate-discovery / repair-discovery + ADR-044 (기획 cross-LLM peer review)  (Step 6 권장)  P1
```

---

## Step 8 — bootstrap-stack `--recommend` / `--migrate` + ADR-041 (P1)

**목적:** 현재 bootstrap-stack은 스택이 *이미 확정된 후*를 전제한다. (a) `--recommend`로 스택 확정 *전* 요구사항·제약·확장성·마이그레이션 비용을 따져 2~3 조합을 추천하고, (b) `--migrate`로 스택 변경 시 contract(old/new/compat/cutover/rollback/validation/hook update)를 ADR로 남긴다. researcher(Step 5)로 현재 프레임워크 지형을 그라운딩(지식 컷오프 보완).

### 8-A. 신규 파일: `docs/90-decisions/boilerplate/ADR-041-stack-recommend-migrate.md`
````markdown
# ADR-041 — 스택 추천(--recommend) + 마이그레이션 contract(--migrate)

> scope: boilerplate

## 상태
accepted

## 배경
- [관측됨] `/bootstrap-stack`은 "프로젝트 스택이 명확해진 이후"를 전제한다 — 확정 *전* 추천 자리가 없어 사용자가 스택을 즉흥 선택한다.
- [관측됨] 스택 변경(마이그레이션) 시 old/new/호환/cutover/rollback/검증/hook 갱신을 묶는 contract가 없다. ARCH 7-x·stack-guard verify는 재실행으로 갱신되나 *왜·어떻게* 기록이 없다.
- [외부실증] expand-contract(parallel change) 마이그레이션 패턴 — 점진 cutover + dual-run + cleanup.

## 결정
1. **`--recommend` 모드** (스택 확정 전): PROJECT_CHARTER `## 6 목표`/`## 7 비목표`/`## 8 성공 기준`/`## 9 제약`/ARCH `## 8 품질 속성`(규모·성능·확장 기대)을 읽어 **2~3개 스택 조합 + tradeoff**를 제시. 각 조합에 (a) 현재 복잡도, (b) 확장·마이그레이션 비용, (c) ADR-031 직접지원 5유형 정합, (d) 마이그레이션 경로("X로 시작 → Y로 성장")를 명시. **ADR-006 단순성 가중**(과한 스택 경고). 최신 프레임워크 지형 그라운딩이 필요하면 *사전에 `/research-pack`* 으로 insights 노트를 만들어 참조한다(bootstrap-stack은 fork+Agent 미보유라 직접 위임 X). 출력 → 사용자 선택 → 기존 bootstrap-stack 본 흐름 진행. 파일 자동 생성 X(추천 텍스트만).
2. **`--migrate` 모드**: 새 ADR(또는 ADR-101 supersede)에 마이그레이션 contract를 기록 — old stack / new stack / 호환성(데이터·API·런타임) / cutover 순서(expand-contract) / rollback / validation(검증 기준) / hook·verify 갱신 목록. 이후 `/bootstrap-stack`(스택 정보 갱신)·`/stack-guard`(verify 재생성, 도구 감지 우선순위로 기존 도구 보존) 재실행을 안내.

## 근거
- 추천·마이그레이션은 고-tradeoff 결정 → architect agent(본 skill의 기존 agent)에 적합. 새 skill 없이 *플래그 2개*로 확장(단순성).

## 결과
- `.claude/skills/bootstrap-stack/SKILL.md`에 --recommend/--migrate 단락.

## Ratchet 강도 (ADR-022)
- enabling(약) — 새 모드, opt-in. 추천은 텍스트만(자동 생성 X).

## 참고
- ADR-031(직접지원 5유형), ADR-006(단순성), ADR-040(researcher 그라운딩), ADR-025(외부 의존 권장).
````

### 8-B. `.claude/skills/bootstrap-stack/SKILL.md` 수정

**기존 (Before)** — frontmatter 4줄(`argument-hint`):
```markdown
argument-hint: "[stack and runtime summary]"
```
**변경 후 (After)**:
```markdown
argument-hint: "[stack and runtime summary | --recommend | --migrate]"
```

**기존 (Before)** — 16~18줄(입력 단락):
```markdown
입력:
- `$ARGUMENTS`에는 언어, 프레임워크, 패키지 매니저, 테스트 도구, 배포 환경 등이 자연어로 들어온다.
- 입력이 짧더라도 `stack-brief-template.md` 구조를 참고해 내부적으로 정리한다.
```
**변경 후 (After)**:
```markdown
입력:
- `$ARGUMENTS`에는 언어, 프레임워크, 패키지 매니저, 테스트 도구, 배포 환경 등이 자연어로 들어온다.
- 입력이 짧더라도 `stack-brief-template.md` 구조를 참고해 내부적으로 정리한다.
- **`--recommend`**: 스택 확정 *전* 모드. 아래 `## --recommend 모드` 절차를 따른다 (추천 텍스트만 출력, 파일 생성 X).
- **`--migrate`**: 스택 변경 모드. 아래 `## --migrate 모드` 절차를 따른다 (마이그레이션 contract ADR 작성).
```

**다음으로**, 파일 맨 끝(`## Context 정책 (ADR-019)` 단락 **앞**)에 두 단락 추가:
```markdown
## --recommend 모드 (ADR-041)
스택 확정 *전* 호출. architect로서 다음을 수행:
1. `docs/10-charter/PROJECT_CHARTER.md` `## 6 목표`/`## 7 비목표`/`## 8 성공 기준`/`## 9 제약`, `docs/20-system/ARCHITECTURE_OVERVIEW.md` `## 8 품질 속성`을 읽어 요구·규모·확장 기대를 파악.
2. (옵션) 최신 프레임워크/라이브러리 지형이 필요하면 *먼저* `/research-pack <스택 후보 주제>`를 돌려 insights 노트를 만들어 두고 본 모드가 이를 참조한다 — 지식 컷오프 보완. (bootstrap-stack은 fork+Agent 미보유라 본 skill에서 직접 researcher 위임은 불가.)
3. **2~3개 스택 조합**을 제시. 각 조합: (a) 현재 복잡도, (b) 확장·마이그레이션 비용, (c) ADR-031 직접지원 5유형(web frontend/API/CLI/monorepo/Supabase) 정합, (d) 마이그레이션 경로("X로 시작 → Y로 성장 가능").
4. **ADR-006 단순성 가중** — 요구에 비해 과한 스택이면 명시 경고. prototype은 가장 단순한 조합 우선.
5. 출력은 *추천 텍스트만*. 파일 생성 X. 사용자가 선택하면 `/bootstrap-stack <선택한 스택>`(플래그 없이)로 본 흐름 진행 안내.

## --migrate 모드 (ADR-041)
스택 변경 시 호출. 다음 contract를 새 project ADR(`docs/90-decisions/project/ADR-1NN-<migration>.md`, 기존 ADR-101 stack-selection을 `superseded` 처리 + 상단 "대체: ADR-1NN")로 작성:
- **old stack / new stack**
- **호환성**: 데이터·API·런타임 호환 이슈
- **cutover 순서**: expand-contract(신규 추가 → 양쪽 dual-run → 구식 제거) 단계
- **rollback**: 되돌리기 절차
- **validation**: 마이그레이션 완료 판정 기준
- **hook·verify 갱신 목록**: `/stack-guard` 재실행으로 갱신할 verify 스크립트·도구(도구 감지 우선순위로 기존 도구 보존 — stack-guard SKILL "도구 감지 우선 순서" 참조)
작성한 project ADR은 **`docs/90-decisions/project/README.md` 인덱스에 한 줄 추가**(인덱스 표의 현재 컬럼 형식에 맞춰 — Step 12 적용 시 area·last-reviewed 포함). 기존 ADR-101을 supersede하면 그 행 상태도 `superseded`로 갱신.
작성 후 안내: `/bootstrap-stack <new stack>` → `/stack-guard` 순으로 재실행. 마이그레이션 cutover 작업은 `Type: migration` task(ADR-039)로 분해(`/plan-workitem`).
```

### 8-C. SSOT 후속
- `docs/90-decisions/boilerplate/README.md` 인덱스에 행 추가:
  ```markdown
  | 041 | 스택 추천 + 마이그레이션 contract | accepted | — | bootstrap-stack --recommend(확정 전 2~3조합) / --migrate(expand-contract contract ADR) |
  ```

> **커밋:** `feat(stack): add --recommend and --migrate modes to bootstrap-stack (ADR-041)`

---

## Step 9 — UX 흐름 품질 (FEATURE §8-1 UX 필드) + ADR-042 (P1)

**목적:** 시각 디자인(DESIGN.md)은 강하나 *UX(흐름 품질)* 가 약하다. feature마다 primary task·empty/loading/error 흐름·접근성·copy·성공 지표를 FEATURE `## 8-1` 필드로 명시한다. UX 지표(HEART)는 Evidence Log(Step 6)로 회수해 데이터 루프에 통합한다. 흐름 점검은 기존 FEATURE 시나리오·8상태 self-check가 담당하므로 plan-workitem에 별도 self-check는 두지 않는다. **의존: Step 6(Evidence Log).**

### 9-A. 신규 파일: `docs/90-decisions/boilerplate/ADR-042-ux-flow-quality.md`
````markdown
# ADR-042 — UX 흐름 품질 (HEART signals)

> scope: boilerplate

## 상태
accepted

## 배경
- [관측됨] DESIGN.md는 *시각*(color/type/layout/components/motion/8상태)을 강하게 다루지만, *UX 흐름 품질*(흐름 레벨 사용성·상태·접근성·copy·지표)은 Charter 핵심 흐름 + Feature 시나리오 + edge + NFR까지만 — feature 단위로 흐름 품질을 명시할 자리가 약하다. reviewer `design` surface도 *시각 일관성*이지 UX가 아니다.
- [외부실증] Google HEART 프레임워크(Happiness/Engagement/Adoption/Retention/Task success → 목표→신호→지표 매핑), Web Vitals(field measurement가 실제 UX 포착에 필요).

## 결정
1. `FEATURE_TEMPLATE.md`에 **`## 8-1. UX 흐름 품질`** subsection 신설(§8 NFR 직후): primary task / empty·loading·error 흐름 / accessibility / copy 톤 / success metric(HEART signal 1개 — 목표→신호→지표). 비-UI feature는 "(해당 없음)".
2. UX 지표(§8-1 success metric)는 실사용 데이터로 측정 → DISCOVERY Evidence Log(ADR-035 amend2)의 `quant` 항목으로 회수 → discovery 루프로 UX 개선 환류. **별도 UX 파이프라인 만들지 않음** — 기존 데이터 루프 재사용.
3. 흐름(empty/loading/error·복구) 점검은 기존 FEATURE 시나리오(ADR-036)·8상태 매트릭스 self-check가 담당한다 — plan-workitem에 별도 UX self-check를 두지 않는다.

## 근거
- 흐름 레벨 UX를 *feature 필드*로 흡수 → 새 skill/agent 없이 단순(ADR-006). 데이터 루프(ADR-035 amend2)에 UX를 끼워 product/UX 개선을 한 고리로.

## 결과
- FEATURE_TEMPLATE §8-1.

## Ratchet 강도 (ADR-022)
- enabling(약, [외부실증] HEART/Web Vitals) — 필드는 권장(비-UI는 "(해당 없음)"), 자동 차단 X.

## 참고
- ADR-027(시각 디자인 — 본 ADR은 UX 흐름으로 보완), ADR-035 amend2(Evidence 루프), ADR-036(FEATURE schema).
````

### 9-B. `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` 수정

**기존 (Before)** — 36~37줄:
```markdown
## 8. Non-functional Requirements
<!-- 성능·접근성·보안·i18n. 해당 없으면 "(해당 없음)" 명시. -->
```
**변경 후 (After)**:
```markdown
## 8. Non-functional Requirements
<!-- 성능·접근성·보안·i18n. 해당 없으면 "(해당 없음)" 명시. -->

## 8-1. UX 흐름 품질
<!-- UI feature 한정(비-UI는 "(해당 없음)"). 정책: ADR-042 (Google HEART).
     - primary task: 이 feature에서 사용자의 핵심 1행동.
     - empty / loading / error 흐름: 각 상태에서 사용자가 무엇을 보고 어떻게 복구하는가.
     - accessibility: 키보드·스크린리더·대비 등 흐름 레벨 요구.
     - copy 톤: 핵심 메시지·에러 문구 방향.
     - success metric (HEART signal 1개): 목표 → 신호 → 지표 (예: Task success → 완료율 → "온보딩 완료 ≥70%"). 실사용 데이터로 측정해 DISCOVERY §14 Evidence Log(quant)로 회수. -->
```

### 9-C. SSOT 후속
- `docs/90-decisions/boilerplate/README.md` 인덱스에 행 추가:
  ```markdown
  | 042 | UX 흐름 품질 (HEART) | accepted | — | FEATURE §8-1 UX 필드 + 지표를 Evidence 루프로 회수 |
  ```

> **커밋:** `feat(ux): add scenario-level UX flow fields to FEATURE template (ADR-042)`

---

## Step 10 — MCP: Optional Connectors 정책 + 연결 절차 + ADR-043 (P2)

**목적:** MCP는 자동화·컨텍스트 면에서 가치가 크나 보안/권한/비용 리스크가 있다(tool poisoning, prompt injection, cross-tool leakage; Playwright `browser_run_code_unsafe`=RCE급). **기본 자동 연결 X.** ADR-043 보안 정책 + STACK_SETUP_PLAN "Optional MCP Connectors" 섹션 + researcher(Step 5) 기반 *연결 절차*로 처리한다(전용 skill 없음). **의존: Step 5(researcher).**

### 10-A. 신규 파일: `docs/90-decisions/boilerplate/ADR-043-optional-mcp-connectors.md`
````markdown
# ADR-043 — Optional MCP Connectors 정책

> scope: boilerplate

## 상태
accepted

## 배경
- [관측됨] `.codex/config.toml`에 `[mcp_servers.jetbrains]`가 이미 있으나, 보일러플레이트 문서/스킬은 이 연결을 전혀 인식하지 않는다.
- [외부실증] MCP spec(resources/prompts/tools, JSON-RPC), Claude Code MCP docs(이슈트래커·모니터링·DB·디자인 도구 등 반복 붙여넣는 외부 컨텍스트를 MCP로 대체). Claude Code는 `claude mcp add --scope local|project|user`(project=공유 `.mcp.json`).
- [외부실증] MCP 보안 — tool poisoning / prompt injection / cross-tool leakage; Playwright `browser_run_code_unsafe`는 RCE-equivalent.

## 결정
1. **기본 자동 연결 X** — 보안/권한/비용. 정적 설치 레시피를 보일러플레이트에 baking하지 않는다(생태계가 월 단위로 변함).
2. **`docs/00-meta/STACK_SETUP_PLAN.md`에 "## Optional MCP Connectors" 섹션** — 연결한 MCP별로: purpose / official docs URL / scope(user|project) / **read-only default** / secret handling(.env, 절대 커밋 X) / smoke check / last-verified date.
3. **짧은 common-MCP 카테고리 표**(버전 미고정, "언제 원하나"만): Playwright(브라우저 E2E), DB(스키마 introspection), GitHub(PR/issue), 공식문서(impl 중 최신 API), 분석(PostHog 등), 디자인(Figma), 에러추적(Sentry). 설치 명령은 박지 않음.
4. **전용 skill 없이 *연결 절차*로 처리** (ADR-006 단순성): (a) researcher(ADR-040)로 해당 능력의 *최신 공식 MCP 설정* 조회, (b) **Claude(`claude mcp add ... --scope project` 또는 `.mcp.json`) + Codex(`.codex/config.toml [mcp_servers.*]`) 양쪽 설정**을 사용자가 직접 실행(외부·권한 행위), (c) project ADR(`ADR-1NN`)에 MCP 의존+왜+read-only 기록 + project README 인덱스 갱신, (d) STACK_SETUP_PLAN Optional Connectors 섹션 갱신. **skill/agent 본문 자동 재작성 X**(drift 위험 — 수동 채택). 본 절차는 STACK_SETUP_PLAN 섹션 주석에 체크리스트로 박는다.
5. 기존 JetBrains MCP(`.codex/config.toml`에 있으면)는 Optional Connectors 섹션에 backfill 권장.

## 근거
- cross-tool parity(ADR-010): 사용자가 Claude + Codex 양쪽을 쓰므로 둘 다 emit. read-only 기본·secret 분리로 MCP 보안 리스크 완화.
- 전용 skill 대신 절차 문서로 표면적·context 비용 절감(ADR-006 단순성).

## 결과
- STACK_SETUP_PLAN.md Optional MCP Connectors 섹션(표 + 연결 절차 체크리스트). 전용 skill·새 agent 없음(researcher 재사용).

## Ratchet 강도 (ADR-022)
- enabling(약) + 보안 가드(read-only default / secret 분리 = constraint 약).

## 참고
- ADR-010(multi-tool parity), ADR-040(researcher 조회), ADR-025(권장만), GUARDRAILS_STRATEGY(OS·런타임 종속 자동화 강제 X).
````

### 10-B. `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md` 에 섹션 + 연결 절차 체크리스트 추가
> 본 템플릿 파일 맨 끝에 아래를 append (생성될 `STACK_SETUP_PLAN.md`가 이 섹션을 갖도록). 만약 템플릿 구조가 다르면 "Optional MCP Connectors" 제목 섹션을 적절한 위치에 추가한다. **전용 skill 없음** — 주석의 절차를 사람/메인 세션이 따른다.
```markdown
## Optional MCP Connectors
<!-- 기본 자동 연결 X (ADR-043). RCE급 도구(예: Playwright browser_run_code_unsafe)는 신뢰 클라이언트 한정. secret은 .env(커밋 X).
     연결 절차(ADR-043, 전용 skill 없음 — 1회성 셋업): (a) researcher(ADR-040)로 해당 능력의 최신 공식 MCP 설정 조회; (b) Claude(`claude mcp add <name> --scope project` 또는 `.mcp.json`) + Codex(`.codex/config.toml [mcp_servers.<name>]`) 설정을 *사용자가 직접 실행*; (c) project ADR(ADR-1NN)에 purpose/official docs/scope/read-only/secret/왜 기록 + project README 인덱스 갱신; (d) 아래 표에 행 추가. -->
| name | purpose | official docs | scope | read-only | secret | smoke check | last-verified |
|------|---------|---------------|-------|-----------|--------|-------------|---------------|
| (예: jetbrains) | IDE 연동 | (URL) | project | - | - | - | - |
```

### 10-C. SSOT 후속
- **skill 카운트 변경 없음** — 전용 skill 미신설(research-pack 이후 16종 유지). STRUCTURE skill 행 갱신 불필요.
- `docs/90-decisions/boilerplate/README.md` 인덱스에 행 추가:
  ```markdown
  | 043 | Optional MCP Connectors | accepted | — | 기본 자동연결 X + STACK_SETUP_PLAN 연결 절차(researcher 기반, 전용 skill 없음) + 보안 가드 |
  ```

> **커밋:** `docs(mcp): add optional MCP connectors policy and connection procedure (ADR-043)`

---

## Step 11 — Playwright MCP 탐색적 QA path (stabilize) (P2)

**목적:** AI가 실제 앱을 구동해 엣지케이스·E2E를 발굴하고 발견을 영속 테스트로 남기게 한다. stabilize-milestone에 *옵션* 경로 추가 — Playwright MCP가 연결된 UI 프로젝트일 때만. **의존: Step 10(MCP).** 비-웹/미연결은 기존대로(자동 skip).

### 11-A. `.claude/skills/stabilize-milestone/SKILL.md` 수정

**기존 (Before)** — 96~97줄(step 3·4):
```markdown
3. 통합 `validate` 명령을 실행한다 + (있으면) E2E 명령을 실행한다.
4. **qa agent에 회귀·엣지케이스 점검 위임** — qa는 보고만 한다(qa.md의 tools에 Write 없음). 반환된 보고를 본 skill이 받아 `docs/40-validation/QA_FINDINGS.md`에 누적 기록한다.
```
**변경 후 (After)**:
```markdown
3. 통합 `validate` 명령을 실행한다 + (있으면) E2E 명령을 실행한다.
3-P. **(옵션) Playwright MCP 탐색적 QA** (ADR-043 — Playwright MCP 연결 + UI 프로젝트일 때만; 미연결·비-UI는 silent skip + 사유 echo): 실제 앱을 구동해 본 마일스톤 feature의 시나리오(happy/alt/fail) + qa 엣지케이스를 *탐색*한다(accessibility 트리·클릭/입력·스크린샷·네트워크). 발견한 결함을 `docs/40-validation/QA_FINDINGS.md`에 기록하고, **재현 케이스를 영속 Playwright 테스트(`validate:e2e`에 묶이는 커밋 가능한 파일)로 남길 것을 권장**(자동 커밋 X — stabilize는 코드·커밋 금지, 후속 task 제안). 실패는 `Type: bugfix` task(ADR-039)로 라우팅. **보안: `browser_run_code_unsafe`류 RCE급 도구는 사용하지 않는다** — accessibility snapshot·표준 브라우저 조작만.
4. **qa agent에 회귀·엣지케이스 점검 위임** — qa는 보고만 한다(qa.md의 tools에 Write 없음). 반환된 보고를 본 skill이 받아 `docs/40-validation/QA_FINDINGS.md`에 누적 기록한다.
```

### 11-B. SSOT 후속
- 새 ADR 불필요(ADR-014 stabilize + ADR-043 MCP 하에서 동작). README 갱신 없음.

> **커밋:** `feat(qa): add optional Playwright-MCP exploratory QA path to stabilize-milestone`

---

## Step 12 — ADR area/status 인덱스 + review-doc 타이밍 문서화 (P2)

**목적:** 장기 ADR sprawl 대비. *폴더 분리 대신 인덱스 메타데이터*. 핵심은 *project* ADR(100+, 시간이 지나며 쌓는 것)에 area/status 컬럼을 두는 것. boilerplate 인덱스는 이미 status·Amendments가 있어 손대지 않는다. + review-doc 사용 타이밍을 명문화.

### 12-A. `docs/90-decisions/boilerplate/_ADR_GUIDE.md` 에 area 컨벤션 추가

**기존 (Before)** — 24~31줄(권장 섹션):
```markdown
## 권장 섹션
- 상태
- 배경 (왜 이 결정이 필요했는가)
- 결정 (무엇을 선택했는가)
- 근거 (왜 이 선택인가, 대안은 무엇이었는가)
- 결과 (이 결정으로 무엇이 달라지는가)
- 후속 작업
```
**변경 후 (After)**:
```markdown
## area 태그 (장기 분류 — project ADR 권장)
ADR 첫 줄 `> scope:` 다음에 선택적 `> area:` 한 줄을 둔다 — 값: `product | design | dev | infra | process | tooling`. project ADR이 쌓일 때 종류별 필터·sprawl 추적에 쓴다(폴더 분리 대신 메타데이터 — 단순성).

## 권장 섹션
- 상태
- 배경 (왜 이 결정이 필요했는가)
- 결정 (무엇을 선택했는가)
- 근거 (왜 이 선택인가, 대안은 무엇이었는가)
- 결과 (이 결정으로 무엇이 달라지는가)
- 후속 작업
```

### 12-B. `docs/90-decisions/project/README.md` 인덱스 컬럼 확장
프로젝트 ADR 인덱스 표의 **헤더 행 + 구분선(separator) 행을 함께** 바꾼다(컬럼이 4→6칸이 되므로 separator도 6칸으로 맞춰야 표가 깨지지 않는다). 예시/placeholder 데이터 행이 있으면 그 칸 수도 6칸으로 맞춘다.

**기존 (Before)** (헤더 + 구분선):
```
| # | 제목 | 상태 | 한 줄 요약 |
|---|------|------|-----------|
```
**변경 후 (After)**:
```
| # | 제목 | 상태 | area | last-reviewed | 한 줄 요약 |
|---|------|------|------|---------------|-----------|
```
> 본문에 안내 1줄 추가: "`area`=product/design/dev/infra/process/tooling. `superseded`된 ADR은 상태 컬럼에 표기하고 상단 '대체: ADR-NNN' 링크로 supersession 추적(폴더 이동 X). 연 1회 `last-reviewed` 갱신 권장." 기존에 예시 데이터 행이 있으면 6칸으로 맞춰 갱신한다.

### 12-C. review-doc 타이밍 명문화 — `docs/00-meta/DELEGATION_STRATEGY.md`

**기존 (Before)** — 106줄:
```markdown
문서 품질이 걱정되면 `/review-doc` 또는 reviewer를 사이에 끼운다.
```
**변경 후 (After)**:
```markdown
문서 품질이 걱정되면 `/review-doc` 또는 reviewer를 사이에 끼운다.

**review-doc vs stabilize 분담 (사용 타이밍)**: `/review-doc`은 *단일 문서 on-demand 심층 비평* — 핵심 문서(charter/ARCHITECTURE/큰 ADR)를 새로 쓰거나 크게 고친 직후, *전파되기 전에* 쓴다. *repo-wide cross-doc 정합*(링크·ADR-ref·FAC↔AC·모드라벨)은 `/stabilize-milestone` deterministic preflight가 매 마일스톤 자동 수행 — review-doc을 `--all`로 확장하지 않는다(stabilize 책임).
```

> **커밋:** `docs(adr): add area/last-reviewed index columns and document review-doc timing`

---

## Step 13 — plan-workitem 지시문 다이어트 (UI 판정 → ADR-027 amend3) — **Step 7의 필수 짝** (P2)

**목적:** plan-workitem은 호출마다 통째 로드되는데, "UI 다중신호 판정" 절차가 plan-workitem·stabilize §5-1에 *복붙*돼 있다(instruction-rot + drift 위험). 절차의 *상세·근거*를 ADR-027 단일 SSOT로 두고, skill에는 *장황한 신호 열거 산문*을 **압축 인라인 3-case + ADR 인용**으로 줄인다(바 참조 X — ADR-019 JIT상 절차가 매 호출 컨텍스트에 있어야 함). **surgical scope — UI 판정 절차만.**

> **Step 7을 적용하면 본 Step도 반드시 함께 적용한다(옵션 아님).** Step 7이 plan-workitem 핫스팟에 type/evidence/docs-check를 더하므로, 본 다이어트가 순 비대를 상쇄해야 한다. (Step 7을 적용하지 않는다면 본 Step은 단독으로도 순수 리팩토링이라 무해 — 그땐 선택.)
> 바 참조가 아니라 *압축 인라인 3-case 유지 + ADR 상세 인용*이다 — ADR-019 JIT상 절차가 매 호출 컨텍스트에 있어야 하므로. 아래 13-B/13-C의 After는 이미 3-case를 인라인으로 유지한다(장황한 신호 열거 산문만 제거).

### 13-A. `docs/90-decisions/boilerplate/ADR-027-...md` 에 Amendment 3 추가
파일 맨 끝(Amendment 2 다음)에 append:

````markdown
## Amendment 3 (2026-05-27) — UI 판정 다중신호 절차 단일 SSOT

### 배경
- [관측됨] "UI 프로젝트 판정 다중신호 절차"(DESIGN.md 부재→비-UI / status≠draft→UI / status=draft→추가신호)가 `plan-workitem` 본문과 `stabilize-milestone` §5-1에 *거의 동일한 산문으로 복제*돼 있다 → 지시문 비대 + 한쪽 수정 시 drift.

### 결정 (canonical 절차 — 인용 대상)
**UI 판정 다중신호 절차** (false UI 판정 회피):
1. `docs/20-system/DESIGN.md` 부재 → **비-UI 확정** → UI 관련 회수/cross-check skip + 사유 echo.
2. DESIGN.md 존재 + `## 0. Status` ≠ `draft`(예: accepted/living) → **UI 확정** → 본문 회수 + cross-check 활성.
3. DESIGN.md 존재 + `## 0. Status` == `draft` → *추가 신호* 점검: (a) ARCH `## 7-4. 프론트 결정` 활성, (b) 대상 workitem 산하 task의 `## 7. 관련 문서`에 `Design:` link 또는 본문 UI 키워드(`component/컴포넌트/page/페이지/screen/view/UI/frontend/프론트`). 신호 ≥1 → *UI 의심* → warning 1줄 echo + 본문 회수 + cross-check 활성. 신호 0 → silent skip.

본 절차가 단일 SSOT(상세·근거)다. **단 ADR-019 JIT 정합상 skill은 절차를 매 호출마다 따라야 하므로, 바 참조만 두면 안 된다** — 각 skill은 *압축 인라인 3-case*(부재→비-UI / status≠draft→UI / status=draft+신호≥1→UI 의심)를 유지하고 `상세: ADR-027 amend3`로 인용한다. 제거 대상은 *장황한 신호 열거 산문*뿐이며, 절차 자체를 skill 밖으로 빼는 게 아니다.

### 적용 surface (압축 인라인 3-case + ADR 인용으로 교체 — 바 참조 X)
- `.claude/skills/plan-workitem/SKILL.md` DESIGN.md read 항목
- `.claude/skills/stabilize-milestone/SKILL.md` §5-1

### Ratchet 강도 (ADR-022)
- enabling(약) — 순수 리팩토링(동작 동일, 산문 단일화).
````

### 13-B. `.claude/skills/plan-workitem/SKILL.md` 수정 (inline → 참조)

**기존 (Before)** — 20~27줄:
```markdown
- `docs/20-system/DESIGN.md` — *UI 프로젝트 한정*. **UI 판정은 다중 신호 우선순위 (baseline placeholder 존재 회피)**:
  1. DESIGN.md 부재 → 비-UI 확정 (fork 직후 삭제 권장 따른 경우, ADR-027 결정 #1·#15 정합) → DESIGN read skip + skip 사유 echo.
  2. DESIGN.md 존재 + `## 0. Status` ≠ `draft` (예: `accepted` / `living`) → UI 확정 → 본문 회수 + cross-check 활성.
  3. DESIGN.md 존재 + `## 0. Status` == `draft` → *추가 신호* 점검:
     - ARCH `## 7-4. 프론트 결정` sub-section 활성 (본문 비어 있지 않음)
     - 입력 workitem 산하 task 중 `## 7. 관련 문서` 에 `Design:` link 또는 본문에 UI 키워드 (`component`, `컴포넌트`, `page`, `페이지`, `screen`, `view`, `UI`, `frontend`, `프론트`) 등장
     - 위 신호 *1개 이상* 발견 → *UI 의심* → warning 1줄 echo (`DESIGN.md status=draft + UI 신호 감지 — /bootstrap-design 미실행 의심. plan 진행은 허용하지만 시각 결정이 즉흥적이 됨`) + 본문 회수 + cross-check 활성.
     - 신호 0개 → silent skip (false UI 판정 회피).
```
**변경 후 (After)**:
```markdown
- `docs/20-system/DESIGN.md` — *UI 프로젝트 한정*. UI 판정은 **ADR-027 amend3 "UI 판정 다중신호 절차"** 적용(부재→비-UI / status≠draft→UI / status=draft→추가신호). UI 확정 시 본문 회수 + cross-check 활성, 비-UI/skip 시 사유 echo.
```

### 13-C. `.claude/skills/stabilize-milestone/SKILL.md` 수정 (§5-1 inline → 참조)

**기존 (Before)** — 59~62줄:
```markdown
   5-1. **UI 프로젝트 판정** (plan-workitem 과 동일 다중 신호 우선순위 적용 — false UI 판정 회피):
   - (i) DESIGN.md 부재 → 비-UI 확정 → 본 5-1 ~ 5-3 모두 skip + skip 사유 echo.
   - (ii) DESIGN.md 존재 + `## 0. Status` ≠ `draft` → UI 확정 → 5-1 ~ 5-3 활성.
   - (iii) DESIGN.md 존재 + `## 0. Status` == `draft` → 추가 신호 (ARCH `## 7-4` 활성 / 본 마일스톤 산하 task 중 `## 7. 관련 문서` 의 `Design:` link 또는 본문 UI 키워드 등장) 1개 이상 → UI 의심 → IMPROVEMENT_GUIDE 에 `P1 [Design-draft] DESIGN.md status=draft + UI 신호 감지 — /bootstrap-design 권장` 기록 + 5-1 ~ 5-3 활성. 신호 0개 → silent skip.
```
**변경 후 (After)**:
```markdown
   5-1. **UI 프로젝트 판정** — **ADR-027 amend3 "UI 판정 다중신호 절차"** 적용(부재→비-UI: 5-1~5-3 skip+사유 echo / status≠draft→UI: 5-1~5-3 활성 / status=draft+추가신호≥1→UI 의심: IMPROVEMENT_GUIDE에 `P1 [Design-draft] DESIGN.md status=draft + UI 신호 감지 — /bootstrap-design 권장` 기록 + 5-1~5-3 활성 / 신호 0→silent skip).
```

### 13-D. SSOT 후속
- `docs/90-decisions/boilerplate/README.md` 인덱스 ADR-027 행 `Amendments` 컬럼 끝에 `, +amend3: UI 판정 절차 단일 SSOT` 추가.
- `docs/00-meta/STRUCTURE.md` Canonical Owner 표의 ADR-027 cross-surface 행에 "UI 판정 다중신호 절차 = ADR-027 amend3 SSOT" 한 구절 추가(기존 행 끝에 덧붙임).

> **커밋:** `refactor(plan): extract UI-detection procedure to ADR-027 single SSOT (amend3)`

---

## Step 14 — plan-workitem silent-overwrite 문구 정정 (P2)

**목적:** `plan-workitem`의 `## Cross-review hook` 단락이 "다음 라운드 호출이 silent overwrite"라고 적었으나, `validate-plan`은 이미 자동 suffix(`-N`)로 overwrite를 막는다. 문구를 실제 동작에 맞게 정정한다.

### 14-A. `.claude/skills/plan-workitem/SKILL.md` 수정
- `## Cross-review hook` 단락의 `*opt-in 시작 후 ... 다음 라운드 호출이 silent overwrite하거나 ...*` 문구에서 **"silent overwrite"** 를 **"자동 suffix(-N)로 보존(또는 rm으로 수동 정리)"** 로 교정 — `validate-plan`의 suffix 가드와 정합.

> **커밋:** `docs(plan): fix silent-overwrite wording to match validate-plan suffix guard`

---

## Step 15 — bootstrap-design `--update` 모드 (재디자인/부분 갱신) (P2)

**목적:** 대규모 디자인 변경/재디자인 시 처음부터 R0~R5를 다시 돌지 않고 기존 DESIGN.md를 delta 갱신 — discover-product `--update`와 대칭. (Step 8은 스택 `--migrate`만 다뤘고, *디자인* 재진입 모드가 빠져 있었다.)

### 15-A. `docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` 에 Amendment 4 추가
> Step 13(amend3)을 적용하지 않았다면 본 amendment를 **Amendment 3**으로 번호 조정한다(앞 amendment 다음 번호).
파일 맨 끝에 append:
````markdown
## Amendment 4 — bootstrap-design --update 모드

### 배경
- [관측됨] discover-product는 `--update`(mid-project pivot)가 있으나 bootstrap-design은 없다 → 대규모 디자인 변경/재디자인 시 처음부터 R0~R5를 다시 돌아야 해 비용·잡음이 크다.

### 결정
27. `/bootstrap-design --update` 신설 — 기존 DESIGN.md가 있을 때 delta 갱신: R0(레퍼런스 재확인, 선택) → 변경 토큰/컴포넌트만 R2/R3 부분 갱신(미변경 토큰·§1~§9 구조 보존, 전면 재작성 X) → R4 저장 → (시각 방향이 크게 바뀌면) R5 시안 재생성·검토. 대규모 재디자인(브랜드/방향 전환)은 결정 근거를 ADR로 남길 것을 권장.

### Ratchet 강도 (ADR-022)
- enabling(약) — 새 모드, opt-in.
````

### 15-B. `.claude/skills/bootstrap-design/SKILL.md` 수정

**(1) `## 모드` 목록에 --update 추가 — 기존 (Before)**:
```markdown
- 기본: R0~R5 모두.
```
**변경 후 (After)**:
```markdown
- 기본: R0~R5 모두.
- `--update`: 기존 DESIGN.md가 있을 때의 부분 갱신/재디자인 모드(아래 `## --update 모드`). 처음부터 R0~R5를 다시 돌지 않는다.
```

**(2) `## 모드` 섹션 바로 아래에 신규 섹션 추가**:
```markdown
## --update 모드 (재디자인/부분 갱신, ADR-027 amend4)
기존 `docs/20-system/DESIGN.md`가 채워져 있을 때:
- 처음부터 R0~R5를 다시 돌지 않는다. 변경 필요한 부분만 갱신:
  - R0(레퍼런스 재확인) — *선택*. 시각 방향 자체가 바뀔 때만.
  - R2/R3 — 바뀐 토큰·컴포넌트만 부분 갱신(미변경 토큰·§1~§9 구조 보존, 전면 재작성 X).
  - R4 — 저장(변경분 반영).
  - R5 — 시각 방향이 크게 바뀌면 시안 재생성·검토 루프(아니면 생략).
- 대규모 재디자인(브랜드/방향 전환)은 *결정 근거*를 ADR로 남길 것을 권장(시각 방향 변경은 되돌리기 비용이 큼).
```

### 15-C. SSOT 후속
- `docs/90-decisions/boilerplate/README.md` 인덱스 ADR-027 행 `Amendments` 컬럼 끝에 `, +amend4: bootstrap-design --update` 추가(Step 13 미적용 시 `+amend3: bootstrap-design --update`).

> **커밋:** `feat(design): add --update mode to bootstrap-design for redesign/partial refresh`

---

## Step 16 — plan-workitem 기술 부채 회수 hook (P2)

**목적:** IMPROVEMENT_GUIDE에 누적된 open 리팩토링·아키텍처 부채가 task로 이어지도록, plan 분해 시 관련 부채를 후보 task(`Type: refactor`/`bugfix`)로 surface한다. (의존: Step 1 refactor type.)

### 16-A. `.claude/skills/plan-workitem/SKILL.md` 수정

**기존 (Before)** — `## Cross-review hook (ADR-038)` 단락 끝 + `## Context 정책` 헤더:
```markdown
운영 권장 (worktree·외부 리소스 면책 단락): ADR-038 D6 + 면책 단락 참조.

## Context 정책 (ADR-019)
```
**변경 후 (After)** (두 단락 사이에 신규 섹션 삽입):
```markdown
운영 권장 (worktree·외부 리소스 면책 단락): ADR-038 D6 + 면책 단락 참조.

## 기술 부채 회수 hook (ADR-022 / ADR-039)
부채 회수 의도가 있는 분해(사용자 요청 또는 milestone 부채 예산)일 때만 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 *open* 항목(특히 P0/P1 리팩토링·아키텍처 부채)을 회수해, 이번 범위와 관련되면 **후보 task로 surface**한다(보통 `Type: refactor` 또는 `bugfix` — ADR-039). 자동 생성 X — 출력 "다음 추천 단계"/"남은 미결정 사항"에 `- 부채 회수 후보: <IMPROVEMENT_GUIDE 항목 ID> → T-XXX(refactor) 권장` 형태로 제시. 부채 회수 의도가 없으면 IMPROVEMENT_GUIDE를 사전 read 하지 않는다 (ADR-019 minimal 정합).

## Context 정책 (ADR-019)
```

> **커밋:** `feat(plan): surface open IMPROVEMENT_GUIDE debt as candidate refactor tasks`

---

## Step 17 — CI workflow opt-in 생성 + 로컬 hook 1-명령 안내 (P2)

**목적:** 장기 "항상 켜진 기계 게이트"는 결국 CI다. 현재 stack-guard는 CI YAML을 *권장 텍스트로만* 출력 → 스택 확정 후엔 opt-in 파일 생성까지 제안한다(GUARDRAILS "강제 X" 정신 유지 — 사용자 명시 승인 시에만).

### 17-A. `.claude/skills/stack-guard/SKILL.md` 수정

**기존 (Before)** — `## CI 권장 출력 (ADR-025)` 단락 첫 두 줄:
```markdown
## CI 권장 출력 (ADR-025)
`.github/workflows/validate.yml` 형식 권장 텍스트를 출력한다 (파일 자동 생성 X — 사용자 결정):
```
**변경 후 (After)** (다음 줄의 ```yaml 블록은 그대로 유지):
```markdown
## CI 권장 출력 (ADR-025)
`.github/workflows/validate.yml` 형식 권장 텍스트를 출력한다. **스택 확정 후엔 출력에 그치지 말고 opt-in 파일 생성을 제안**한다 — 사용자가 명시 승인할 때만 `.github/workflows/validate.yml`을 생성(미승인 시 텍스트만; GUARDRAILS "강제 X" 정신). 로컬 PostToolUse hook 1-명령 설정 안내([GUARDRAILS_STRATEGY.md "## PostToolUse hook 매뉴얼 등록 절차"](../../../docs/00-meta/GUARDRAILS_STRATEGY.md))도 함께 출력:
```

> **커밋:** `feat(stack-guard): offer opt-in CI workflow generation and one-command hook setup`

---

## Step 18 — `/validate-discovery` + `/repair-discovery` (기획 cross-LLM peer review) + ADR-044 (P1)

**목적:** `/validate-plan`·`/repair-plan`(ADR-038)은 *workitem 분해 plan*(개발 plan) 층만 cross-LLM 검토한다. 제품 *기획* 층(DISCOVERY.md: persona/pain/JTBD/MVP/가정/성공기준)을 비판적으로 교차 검토하는 대응물이 없다. ADR-038 패턴(validate/repair 쌍)을 기획 층에 mirror해 peer-review를 추가한다. 새 agent는 없다 — reviewer에 `discovery` surface 추가 + repair는 architect 재사용. **하드 의존 없음**(Step 6 Evidence Log이 있으면 `[Disc-evidence]` 차원이 §14를 참조하고, 없으면 그 차원만 skip).

### 18-A. 신규 파일: `docs/90-decisions/boilerplate/ADR-044-cross-llm-discovery-validation.md`
````markdown
# ADR-044 — Cross-LLM Discovery Validation (기획 층 peer review)

> scope: boilerplate

## 상태
accepted

## 배경
- [관측됨] ADR-038의 `/validate-plan`·`/repair-plan`은 *workitem 분해 plan*(milestone/feature/task) 층만 cross-LLM 검토한다 — *제품 기획 층*(DISCOVERY.md)을 비판적으로 교차 검토하는 대응물이 없다. discover-product는 *생성*만, review-doc은 *범용 단일 문서*(기획 전용 차원·repair 루프 없음), stabilize §6.5는 *기계적 staleness*만.
- [외부실증] Teresa Torres / Cagan — discovery는 confirmation bias·leading evidence에 취약해 *외부 시선의 비판적 검토*가 품질의 핵심.

## 결정
1. `/validate-discovery` 신설 — *다른 세션·다른 LLM*에서 DISCOVERY.md(기획 SSOT)를 reviewer `discovery` surface로 비판 검토, 임시 리뷰 파일 1개를 `docs/40-validation/discovery-reviews/DISCOVERY.<tag>.md`에 작성. DISCOVERY/charter 일체 수정 X. (ADR-038 `/validate-plan` 패턴의 discovery 층 mirror)
2. `/repair-discovery` 신설 — 원본 세션에서 리뷰 파일 N개 회수 → adopt/adopt-modified/reject-false-positive/reject-conflict 판단 → DISCOVERY.md 수정 → 리뷰 파일 삭제. **agent: architect** (repair-plan은 planner이나 discovery는 제품 전략 판단이라 architect — bootstrap-project가 architect인 것과 정합).
3. **Discovery Quality 8 차원** (reviewer `discovery` surface): `[Disc-persona]` 증거 기반 · `[Disc-pain]` 빈도×고통 실재 · `[Disc-jtbd]` 진짜 job(solution-in-disguise 아님) · `[Disc-scope]` MVP ruthless(scope creep) · `[Disc-assumption]` 최위험 가정 식별·검증계획(§10/§12) · `[Disc-metric]` 성공기준 측정가능(§9) · `[Disc-evidence]` §14 Evidence 신뢰도·가설↔사실 분리(§14 부재 시 skip) · `[Disc-bias]` confirmation bias·leading·단일출처 과신.
4. 판정 verdict(ALL_GOOD/NEEDS_CHANGES)는 *리뷰 라벨*이지 워크플로 차단 아님(ADR-038·ADR-007 책임 경계 정합). opt-in.
5. charter는 수정하지 않는다 — DISCOVERY=SSOT(ADR-035), charter sync는 `/bootstrap-project --apply`.

## 근거
- 검증된 ADR-038 패턴을 mirror해 일관성 확보. 새 agent 0(reviewer surface 1 + architect 재사용).

## 결과
- `.claude/skills/validate-discovery/SKILL.md`, `.claude/skills/repair-discovery/SKILL.md`, reviewer `discovery` surface(8 차원), `docs/40-validation/discovery-reviews/`.

## Ratchet 강도 (ADR-022)
- enabling(약) — opt-in peer review. 자동 차단 X.

## 참고
- ADR-038(cross-LLM plan validation — 본 ADR이 mirror), ADR-035(DISCOVERY SSOT + Evidence Log), ADR-007(책임 경계), ADR-027 amend1(reviewer surface 패턴).
````

### 18-B. 신규 파일: `.claude/skills/validate-discovery/SKILL.md`
````markdown
---
name: validate-discovery
description: 다른 세션·다른 LLM에서 DISCOVERY.md(제품 기획 SSOT)를 비판적으로 교차 검토하고 임시 리뷰 파일 1개를 작성한다. DISCOVERY/charter 수정 X (ADR-044).
argument-hint: "[--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
context: fork
agent: reviewer
context-pack: minimal
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. DISCOVERY.md / PROJECT_CHARTER.md / 코드 일체 수정 금지. (ADR-038 `/validate-plan` 패턴의 discovery 층 mirror)

**호출 시나리오**: 원본 discovery 세션과 *다른 터미널·다른 세션·다른 LLM*에서 호출. 출력 리뷰 파일은 원본 세션의 `/repair-discovery`가 회수한다.

**⚠ 같은 checkout 제약**: 리뷰 파일은 `docs/40-validation/discovery-reviews/`의 로컬·gitignore 파일. 두 skill을 같은 checkout에서 실행하거나, 다른 worktree면 원본 checkout으로 파일 이동 후 `/repair-discovery`.

입력:
- `--reviewer-tag <tag>` (미지정 시 `default`). tag 형식 `[A-Za-z0-9._-]{1,32}`, 미일치 시 *즉시 종료*(silent overwrite 회피).
- 기존 `docs/40-validation/discovery-reviews/DISCOVERY.<tag>.md` 존재 시 `<tag>-2.md`/`<tag>-3.md`로 자동 suffix 부여.

반드시 먼저 읽을 파일:
- `docs/10-charter/DISCOVERY.md` (부재 시 종료 — `/discover-product` 선행 안내).
- (참조) `docs/10-charter/PROJECT_CHARTER.md` — DISCOVERY와의 drift 점검용.

검토 차원 (Discovery Quality 8 — reviewer.md `discovery` surface 정합):
1. `[Disc-persona]` 페르소나가 증거 기반인가, 추측이면 가정으로 표시됐나. (P1)
2. `[Disc-pain]` pain이 빈도×고통으로 실재·우선순위화됐나 vs 가정. (P1)
3. `[Disc-jtbd]` JTBD가 진짜 job인가(solution-in-disguise 아님). (P1)
4. `[Disc-scope]` MVP 범위/비범위가 ruthless한가(scope creep). (P0)
5. `[Disc-assumption]` 가장 위험한 가정이 식별·검증계획 있나(§10/§12). (P0)
6. `[Disc-metric]` 성공 기준이 측정 가능한가(§9). (P1)
7. `[Disc-evidence]` §14 Evidence 신뢰도 라벨 적절·가설↔사실 분리(ADR-035 amend2). §14 부재 시 본 차원 skip + "핵심 관찰"에 명시. (P1)
8. `[Disc-bias]` confirmation bias / leading 질문 / 단일 출처 과신. (P1)

판정 규칙: **NEEDS_CHANGES**(P0 ≥1) / **ALL_GOOD**(P0=0; P1/P2는 막지 않음). *리뷰 라벨이지 워크플로 차단 아님*(ADR-038 정합).

마지막 단계 — 리뷰 파일 작성: `docs/40-validation/discovery-reviews/DISCOVERY.<reviewer-tag>.md`. 양식은 validate-plan 리뷰 파일과 동형 — 판정 / 발견(P0/P1/P2 + 카테고리 라벨) / 카테고리 카운트 표 / 핵심 관찰(3개 이내) / 다음 권장 액션(`원본 세션에서 /repair-discovery`).

마지막 출력(메인에 텍스트로): 판정 + 사용된 tag + P0/P1/P2 카운트 + 리뷰 파일 경로 + "원본 세션에서 `/repair-discovery`".

가드: DISCOVERY/charter/코드/다른 산출물 일체 수정 금지. 커밋 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 자료는 발화 시 인용 — 사전 fork-load 금지.
````

### 18-C. 신규 파일: `.claude/skills/repair-discovery/SKILL.md`
````markdown
---
name: repair-discovery
description: 원본 세션에서 실행. docs/40-validation/discovery-reviews/*.md 리뷰를 회수해 수용·기각을 판단하고 DISCOVERY.md를 수정한 뒤 리뷰 파일을 삭제한다 (ADR-044).
argument-hint: ""
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash(rm docs/40-validation/discovery-reviews/*.md)
context: fork
agent: architect
context-pack: minimal
---

`/validate-discovery`가 만든 임시 리뷰 파일을 모두 회수해 DISCOVERY.md를 수정하는 단계. **charter·코드 수정·커밋 금지.** (ADR-038 `/repair-plan` 패턴의 discovery 층 mirror)

반드시 먼저 할 일:
1. `docs/40-validation/discovery-reviews/DISCOVERY.*.md` glob → **실제 경로 목록을 메모리에 회수**(이후 삭제는 이 목록 기준 — glob 재실행 금지). 0건이면 *"리뷰 파일 없음 — 다른 세션에서 `/validate-discovery` 먼저 실행"* 안내 후 종료(DISCOVERY 수정 금지).
2. `docs/10-charter/DISCOVERY.md`를 읽는다.

수행:
1. 모든 리뷰 파일의 발견을 한 표로(severity / category / 대상 섹션 / 설명 / 제안 / 리뷰어 태그).
2. 각 항목 4결정 중 하나 + 한 줄 근거: **Adopt** / **Adopt-modified** / **Reject-false-positive** / **Reject-conflict**. P0>P1>P2 — **한 라운드에 모두 판정**(defer-drop 금지, ADR-038 정합).
3. 다중 리뷰어 충돌은 architect가 *제품 전략* 기준으로 어느 쪽이 더 정합한지 판단 + 근거 1줄(자동 다수결 X).
4. Adopt/Adopt-modified 항목을 DISCOVERY.md에 반영 — 섹션 구조 유지, §12 Assumption Tracker / §14 Evidence / §15 Insight 정합 유지. **charter는 건드리지 않는다**(DISCOVERY=SSOT; charter sync는 `/bootstrap-project --apply`).
5. **삭제 전 echo 강제**: 삭제 대상 경로 목록 전체를 출력에 echo → *step 1에서 회수한 경로*를 한 개씩 `rm`(glob 재실행 X). 모든 경로가 `docs/40-validation/discovery-reviews/DISCOVERY.` 접두 + `.md` 접미인지 마지막 점검.

책임 경계: charter·workitem·코드·다른 산출물 수정 금지. 자동 커밋 금지.

마지막 출력: 처리 리뷰 수 + reviewer-tag 명단 / 결정별 카운트(Adopt·Adopt-modified·Reject-fp·Reject-conflict) / 수정된 DISCOVERY 섹션 / 다중 리뷰어 충돌 결정 근거(있으면) / 삭제된 리뷰 파일 목록 / 다음 권장(`/bootstrap-project --apply`로 charter sync, 또는 `/plan-workitem`).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 자료는 발화 시 인용 — 사전 fork-load 금지.
````

### 18-D. `.claude/agents/reviewer.md` 수정 — `discovery` surface 추가

**(1) 호출 surface 목록에 한 줄 추가** (`**호출 surface 명시**:` 단락):
```
- `discovery`: Discovery Quality 8 (아래 별도 섹션 — ADR-044). `/validate-discovery` 가 호출. Clean Code / Scope / Doc / Plan / Design 미적용.
```

**(2) `## Plan Quality 10 차원` 섹션 *다음*에 신규 섹션 추가**:
```markdown
## Discovery Quality 8 차원 (discovery surface 전용 — ADR-044)

`/validate-discovery` 호출 시 본 agent가 DISCOVERY.md(제품 기획 SSOT)를 비판 검토할 때 사용. 각 발견에 P0/P1/P2 + 카테고리 라벨.

1. **[Disc-persona]** 페르소나가 증거 기반인가, 추측이면 가정으로 표시됐나. (P1)
2. **[Disc-pain]** pain이 빈도×고통으로 실재·우선순위화됐나 vs 가정. (P1)
3. **[Disc-jtbd]** JTBD가 진짜 job인가(solution-in-disguise 아님). (P1)
4. **[Disc-scope]** MVP 범위/비범위가 ruthless한가(scope creep). (P0)
5. **[Disc-assumption]** 가장 위험한 가정이 식별·검증계획 있나(§10/§12 Assumption Tracker). (P0)
6. **[Disc-metric]** 성공 기준이 측정 가능한가(§9). (P1)
7. **[Disc-evidence]** §14 Evidence Log 신뢰도 라벨 적절·가설↔사실 분리(ADR-035 amend2). §14 부재 시 skip + "핵심 관찰"에 명시. (P1)
8. **[Disc-bias]** confirmation bias / leading 질문 / 단일 출처 과신. (P1)

라벨링 예: `P0 [Disc-scope] MVP 범위에 "협업 권한 관리" — JTBD 핵심(주간 갱신)과 무관, M3 이후로 비범위 권장`.
```

**(3) Write/Edit 사용 범위에 한 줄 추가** (`/validate-plan 호출 시 → plan-reviews` 줄 *다음*):
```
- `/validate-discovery` 호출 시 → `docs/40-validation/discovery-reviews/DISCOVERY.<reviewer-tag>.md` 단일 파일만 허용. DISCOVERY/charter 수정 금지 (ADR-044).
```

### 18-E. `.claude/skills/discover-product/SKILL.md` — cross-review opt-in hook

**기존 (Before)** — 마지막 출력 단락(다음 권장 단계 줄):
```markdown
- 다음 권장 단계 (`/bootstrap-project` — DISCOVERY.md를 입력으로 사용)
```
**변경 후 (After)**:
```markdown
- 다음 권장 단계 (`/bootstrap-project` — DISCOVERY.md를 입력으로 사용)
- **(opt-in, ADR-044) 기획 품질 확신이 부족하면**: 다른 세션·다른 LLM에서 `/validate-discovery --reviewer-tag <tag>` 1+회 → 원본 세션에서 `/repair-discovery` 회수. 건너뛰어도 정상.
```

### 18-F. SSOT 후속
1. `docs/00-meta/STRUCTURE.md` 산출물 표 — skill 카운트 **16종 → 18종** + validate-discovery·repair-discovery 추가:
   **기존 (Before)** (Step 5에서 16종으로 갱신된 상태):
   ```markdown
   | Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (16종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context/research-pack) | 수동 (boilerplate 제공) | Reference | baseline |
   ```
   **변경 후 (After)**:
   ```markdown
   | Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (18종 — bootstrap-project/bootstrap-stack/bootstrap-design/discover-product/plan-workitem/validate-plan/repair-plan/implement-workitem/validate-workitem/repair-workitem/finalize-workitem/stabilize-milestone/stack-guard/review-doc/boilerplate-context/research-pack/validate-discovery/repair-discovery) | 수동 (boilerplate 제공) | Reference | baseline |
   ```
2. `docs/00-meta/STRUCTURE.md` 산출물 표에 **신규 행 추가** (plan review 행 근처):
   ```markdown
   | discovery review | `docs/40-validation/discovery-reviews/DISCOVERY.<reviewer-tag>.md` | `/validate-discovery` (다른 세션·다른 LLM) | ephemeral | generated |
   ```
3. `docs/00-meta/DELEGATION_STRATEGY.md` 위임 트리거 표에 행 2개 추가 (validate-plan/repair-plan 행 근처):
   ```markdown
   | DISCOVERY(기획)의 cross-LLM peer review (opt-in) | reviewer (discovery surface, Discovery Quality 8 차원) | 다른 세션에서 `/validate-discovery`. 임시 리뷰 파일 1개, DISCOVERY/charter 수정 X (ADR-044). |
   | 기획 cross-review 결과 회수 + DISCOVERY 수정 | architect | 원본 세션에서 `/repair-discovery`. 리뷰 회수 → 결정 → DISCOVERY 수정 → 파일 삭제 (ADR-044). |
   ```
4. `docs/90-decisions/boilerplate/README.md` 인덱스에 행 추가:
   ```markdown
   | 044 | Cross-LLM Discovery Validation | accepted | — | /validate-discovery + /repair-discovery (기획 층 peer review, ADR-038 패턴 mirror) + reviewer discovery surface |
   ```
5. `docs/40-validation/discovery-reviews/` 디렉터리 생성 + `.gitkeep`. plan-reviews와 동일하게 *내용물은 `.gitignore`* (디렉터리만 보존).

> **커밋:** `feat(discovery): add /validate-discovery and /repair-discovery cross-LLM review (ADR-044)`

---

## 전체 완료 체크 (Part 1 + Part 2)
**Part 1**
- [ ] Step 1 Workitem Type + bugfix 템플릿 (ADR-039)
- [ ] Step 2 implement ambiguity 하드스탑 (ADR-006 amend2)
- [ ] Step 3 validate/finalize 게이트 강화 (ADR-007 amend3)
- [ ] Step 4 finalize --apply 사유 강제
- [ ] Step 5 researcher + research-pack (ADR-040)
- [ ] Step 6 Evidence Log/Insight Backlog (ADR-035 amend2)
- [ ] Step 7 plan-workitem 4개 보강

**Part 2**
- [ ] Step 8 bootstrap-stack --recommend/--migrate (ADR-041)
- [ ] Step 9 UX 흐름 품질 — FEATURE §8-1 필드 (ADR-042)
- [ ] Step 10 MCP connectors 정책 + 연결 절차 (ADR-043)
- [ ] Step 11 Playwright MCP QA path
- [ ] Step 12 ADR area 인덱스 + review-doc 타이밍
- [ ] Step 13 plan-workitem 다이어트 (ADR-027 amend3) — Step 7과 함께
- [ ] Step 14 plan-workitem silent-overwrite 문구 정정
- [ ] Step 15 bootstrap-design --update (ADR-027 amend4)
- [ ] Step 16 plan-workitem 기술 부채 회수 hook
- [ ] Step 17 CI opt-in 생성 + 로컬 hook 안내
- [ ] Step 18 validate-discovery / repair-discovery (ADR-044)

**최종 검증** (모든 Step 후): `/stabilize-milestone --dry-run`으로 deterministic preflight(내부 링크·ADR-ref·FAC↔AC) 1회 — 본 가이드로 추가한 ADR 링크·인덱스 정합 확인. 깨진 링크/누락 ADR-ref가 있으면 해당 Step의 SSOT 후속을 재점검한다.
