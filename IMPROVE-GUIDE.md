# 개선 실행 가이드

이 문서 하나만 보고 순서대로 따라가면 모든 개선이 끝난다. 각 단계는 «현재 상태 → 변경 내용»을 그대로 담는다.

**읽는 법 — 행 번호는 보조 정보다.** 편집 위치의 1차 앵커는 **인용된 원문 문자열**이고, 괄호 안 행 번호는 그 문자열을 빨리 찾기 위한 힌트일 뿐이다. Phase 3·6은 블록을 통째로 교체하므로 **같은 파일의 뒤쪽 단계에서 인용한 행 번호는 이미 어긋나 있다.** 항상 인용문으로 찾는다.

## 개선 전체 목록

| # | 개선 | Phase |
|---|---|---|
| 1 | 고아 status 필드 3개 제거 | 0 |
| 2 | 마일스톤 폐쇄 경계 + 졸업 v3 (ADR-068) | 1~2 |
| 3 | ADR-052·ADR-057 부분 supersede 노트 | 2 |
| 4 | 원장 섹션 정리 + **소비자 7곳 재지정** + 아카이브 회전 | 3 |
| 5 | closure receipt 도입 | 4~5 |
| 6 | task 재개방 폐지 (**마일스톤 층 한정 — 조건부**) | 5~6 |
| 7 | `--dry-run` / `--feature` 플래그 제거 | 6 |
| 8 | `/amend-ssot` 신규 skill (ADR-069) | 7 |
| 9 | 메타 문서 정합 (frontmatter·Codex wrapper 포함) | 8 |
| 10 | CI 기본 생성 + AC 검증 레벨 태그 | 9 |

## 순서 의존 관계

```
Phase 0 (독립)
Phase 1 (ADR-068 본문)  →  Phase 2 (상태·인덱스·인용)
                        →  Phase 3 (원장 구조)  →  Phase 6 (repair skill이 ## 5에 씀)
                        →  Phase 4 (템플릿)     →  Phase 5 (finalize가 closure 발급)
                                                →  Phase 6 (stabilize가 closure 읽음)
Phase 5 → Phase 6
Phase 7 (독립 — Phase 8의 로스터 갱신만 의존)
Phase 8 (전부 끝난 뒤)
Phase 9 (독립)
Phase 10 (최종 검증)
```

**Phase는 순서대로 진행한다.** Phase 안의 항목은 번호 순서를 지킨다.

---

# Phase 0 — 사전 정리 (독립·무위험)

## 0-1. `docs/10-charter/PROJECT_CHARTER.md` — status 필드 제거

**현재 (1~6행)**:
```markdown
# 프로젝트 헌장

## 0. Status
draft

## 1. 프로젝트 요약
```

**변경 — `## 0. Status`와 값 줄, 그리고 뒤따르는 빈 줄을 삭제**:
```markdown
# 프로젝트 헌장

## 1. 프로젝트 요약
```

## 0-2. `docs/20-system/ARCHITECTURE_OVERVIEW.md` — status 필드 제거

**현재 (1~6행)**:
```markdown
# 아키텍처 개요

## 0. Status
draft

## 1. 기술 요약
```

**변경**:
```markdown
# 아키텍처 개요

## 1. 기술 요약
```

## 0-3. `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` — status 필드 제거

**현재 (1~6행)**:
```markdown
# Discovery: <프로젝트 이름>

## 0. Status
draft

## 1. 문제 한 줄
```

**변경**:
```markdown
# Discovery: <프로젝트 이름>

## 1. 문제 한 줄
```

> 주의: `docs/20-system/DESIGN.md`의 `## 0. Status`는 **삭제하지 않는다.** 그 필드는 `/bootstrap-design` R5가 쓰고 `/stack-guard`가 읽는 살아 있는 필드다.

## 0-4. `docs/00-meta/PROJECT_START_CHECKLIST.md` — 51행 삭제

**현재 (`## 4. 작업 구조 준비` 안)**:
```markdown
- [ ] bootstrap 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md의 `## 0. Status`를 `draft → ready`로 전환했다 (수동 — 이 두 문서에는 상태 writer skill이 없다)
```

**변경**: 이 한 줄을 **삭제**한다.

## 0-5. `.claude/skills/discover-product/SKILL.md` — argument-hint 정정

**현재 (4행)**:
```yaml
argument-hint: "[product description | --fast]"
```

**변경** (본문에 `## --update 모드`가 있는데 힌트에 빠져 있음):
```yaml
argument-hint: "[product description | --fast | --update | --fast --update]"
```

> commit: `docs: remove orphan status fields and fix discover-product argument hint`

---

# Phase 1 — ADR-068 발행

## 1-1. `docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md` 신규 생성

아래 전문을 그대로 저장한다.

````markdown
# ADR-068 — 마일스톤 폐쇄 경계 + 졸업 계약 v3 (Milestone Closure Boundary & Graduation v3)

> scope: boilerplate
> area: process

## Status
accepted

## 대체
- [ADR-067](ADR-067-milestone-graduation-v2.md)을 **supersede**한다(현재 SSOT: 본 ADR). ADR-067의 D1~D6을 본 ADR이 승계하고 아래 다섯을 변경한다.
  1. **task 층 폐쇄 경계를 신설**한다(D1) — 마일스톤 층 skill이 task 문서·task status·validation report를 수정하지 않는다(예외는 task `## 8`의 AC receipt 이벤트 2종뿐).
  2. **closure receipt를 신설**한다(D2) — 졸업 판정의 입력이 checkout-local ephemeral 채점표에서 **커밋된 task 문서**로 옮겨진다.
  3. **졸업 item 4의 (a)(b)(c)(d)와 mtime 판정을 폐지**한다(D3) — (a)(b)(c)는 item 1의 closure receipt로 흡수되고 (d)는 삭제된다.
  4. **`/stabilize-milestone`의 두 플래그를 폐지**한다 — `--dry-run`(ADR-067 D4 철회, 사유는 D3 아래 주석) · `--feature F-NNN`(D1-b).
  5. **원장 구조 정리 + 아카이브 회전을 신설**한다(D7) — `IMPROVEMENT_GUIDE.md`의 죽은 절 2개 폐지·`## 3` 통합·졸업 마일스톤 회전.
- ADR-067 인용의 처리는 [ADR-045](ADR-045-doc-reference-contract.md)#amend-2의 5종 분류를 따른다. 살아있는 규칙 인용은 본 ADR로 재지정하고, supersede 선언·인덱스 행·실행 기록만 원문을 보존한 뒤 그 줄 끝에 `(현재 SSOT: ADR-068)`을 병기한다.

## 부분 supersede (본 ADR이 다른 ADR의 일부만 대체하는 지점)
아래 둘은 `superseded`로 만들지 않는다 — 나머지 결정이 살아 있어 전체 재발행 비용이 이득을 넘는다([ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이 같은 이유로 amendment를 택한 선례). 각 파일에 표기 노트를 남긴다.

- **[ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md) D4** — *"단일 task로 격리되는 결함은 `/repair-workitem T-NNN`으로 라우팅"* 은 본 ADR D1이 부분 supersede한다. **폐쇄 후에는 라우팅 없이 `/repair-milestone`이 직접 고친다.** D4의 나머지(코드 수정 허용 · 자동 커밋·status 변경 금지 · `## 5` 결정 이력)는 유효하다.
- **[ADR-057](ADR-057-planning-v2-batch-and-seam.md)** — 둘을 부분 supersede한다.
  - `## 현재 유효 결정`의 *"검증된 완료 결함만 repair-workitem이 `done→in-progress`"* (= #amend-3 결정 5의 task 상태기계 역전이): **폐쇄 후에 한해** 폐지된다(D1). 폐쇄 전 task 층의 재개방은 유효하다.
  - **결정 6 `/stabilize-milestone --feature F-NNN` 스코프**: 폐지된다(D1-b). #amend-3이 *"계획이 아니라 검사 범위라 유지"* 로 존치를 선언했으나 본 ADR이 그 존치를 뒤집는다.

## 배경
- [관측됨] 졸업 판정이 `docs/40-validation/reports/<task-id>.md`(gitignore된 checkout-local ephemeral)를 지속 입력으로 읽는다. 그 결과 새 체크아웃에서 마일스톤을 재평가하려면 산하 전 task의 `/validate-workitem`을 다시 돌려야 한다.
- [관측됨] 그 의존에서 세 가지가 파생됐다 — (a) 마일스톤 층 수리가 채점표를 되살리려 task를 재개방하는 연쇄, (b) 그 연쇄가 `/finalize-workitem`의 범위 비교에 걸리지 않도록 만든 실행 순서 규칙, (c) 그 순서 규칙 때문에 원장 쓰기가 뒤로 밀려 같은 라운드에 발급한 채점표를 stale로 만드는 자기무효화.
- [관측됨] 27 task 규모의 마일스톤에서 위 (c)가 관측됐다 — 라운드마다 최소 6건이 stale로 남고, 닫는 수와 새로 여는 수가 상쇄되어 **수렴하지 않았다.**
- [관측됨] 마일스톤 층 수정은 그 task의 AC로 역추적되지 않으므로, 재validate의 diff-trace 감사가 **구조적으로 반드시** `추적 불가`를 낸다. 현행 문서 세 곳이 그 결과를 "정상이며 차단이 아니다"로 해명하고 있다.

## 결정

### D1. 마일스톤 층 폐쇄 경계
**한 마일스톤 산하 task가 전부 `done`이 되는 순간부터 그 마일스톤은 «마일스톤 층»이다.** 이 상태에서:

- **마일스톤 층 skill**(`/stabilize-milestone`·`/repair-milestone`·`/accept-milestone`·`/repair-acceptance`)은 task 문서·task `## 0. Status`·validation report를 **읽기만 한다.**
- 그 skill들은 `/implement-workitem`·`/validate-workitem`·`/repair-workitem`·`/finalize-workitem`을 **호출하지 않는다.** 사용자에게 그 호출을 권하지도 않는다.
- **`/repair-workitem`의 `done` 재개방은 «마일스톤 층에서만» 폐지한다 (조건부).** 산하에 `done`이 아닌 task가 하나라도 남아 있으면 그 마일스톤은 아직 task 층이고, 그때의 `done → in-progress` 재개방은 **그대로 유효하다** — `/implement-workitem` 3-R (1)이 «선행 task가 done인데 약속한 산출이 없으면 그 선행 task를 현재 M에서 repair→validate→finalize» 를 명시 지시하므로, 이 경로를 막으면 그 지시가 실행 불가가 된다. **폐지되는 것은 «산하 전 task done» 이후의 재개방뿐이다.**
- **동결 대상**: task 문서 전체 · task status · validation report.
- **동결 아님**: 제품 코드·테스트. 마일스톤 층 수리가 고칠 수 있으며 기록은 D6을 따른다.
- **예외는 둘이다 — task `## 8`의 AC receipt 이벤트 2종뿐이다.** 그 둘은 같은 AC의 **단일 순서 로그**를 이루므로 분리할 수 없다([ADR-065](ADR-065-ac-verification-contract.md) D3 판독 규칙 2 «마지막 이벤트가 현재 상태»).
  - `- ac-acceptance` — writer는 `/accept-milestone`.
  - `- invalidated` — writer는 `/repair-milestone`·`/repair-acceptance`(그 수정이 관측 modality AC의 동작 경로를 건드렸을 때).
  - **이 둘 외에는 어떤 줄도 task 문서에 쓰지 않는다.** 폐쇄 후의 `- exec-evidence`·`- pattern-scan`은 task `## 8`이 아니라 `IMPROVEMENT_GUIDE.md` `## 5`의 그 항목 하위 줄에 적는다(D6).
  - **`- invalidated`를 `## 5`로 옮기면 안 되는 이유**: 졸업 item 4와 `/accept-milestone` R2의 필수 시나리오 산정이 **둘 다 task `## 8`의 마지막 이벤트만** 읽는다. 무효화를 다른 파일로 옮기면 그 AC는 여전히 `- ac-acceptance`가 마지막 이벤트로 남아 **무효화가 졸업에도 다음 수용 라운드에도 반영되지 않는다.**
  - 두 append 모두 재개방도 재validate도 유발하지 않는다(D3에서 mtime 판정이 삭제되므로).
- **판정 신호에 새 필드를 만들지 않는다** — «전 task `done`»은 졸업 item 1이 이미 읽는 값이다. 별도의 폐쇄 마커·폐쇄일·확인 프롬프트를 두지 않는다.

### D1-b. `/stabilize-milestone --feature F-NNN` 폐지
[ADR-057](ADR-057-planning-v2-batch-and-seam.md) 결정 6(#amend-3이 명시 존치)의 `--feature` 스코프를 **폐지한다.**
- **사유**: 그 플래그는 «마일스톤 중간에 한 feature만 점검»하는 도구인데, 본 ADR D1이 마일스톤 층의 시작을 «산하 전 task done»으로 정의하므로 **마일스톤 층 skill 안에 task 층 도구가 들어 있는 구조**가 된다. 대체 지점은 `/finalize-workitem` 수행 9의 feature-완료 체크포인트(FAC closure 요약)이며 이미 존재한다.
- **비용**: 그 플래그는 `/stabilize-milestone` 본문에서 가장 긴 단일 조건 블록(입력 검증 2종 · preflight 부분 적용 · 단계 5·6·6.5·7·7-T skip · composite 화면 부분 판정 · QA_FINDINGS scope 태그)을 차지한다.
- ADR-057 결정 6은 본 ADR이 **부분 supersede**하며 그 파일에 표기 노트를 남긴다(ADR-057의 기존 «부분 supersede» 헤더 노트와 동형).

### D2. closure receipt
`/finalize-workitem`은 task를 `done`으로 마감할 때 그 task `## 8. 메모`에 아래 한 줄을 append한다. **`## 0. Status`를 `done`으로 쓰는 것과 같은 편집 라운드에서 쓴다.**

```
- closure <YYYY-MM-DD> <task-id>: verdict=<Pass|Pending Acceptance> / 기계AC=<충족/전체> / audit=<complete|미완:<축>> / 관측대기=<AC-N 목록|없음> / 자동화율=<%>
```

- **출처**: 직전 `/validate-workitem`이 만든 채점표의 `- 판정:` · `## AC ↔ 검증 매핑` · `## Orchestration`의 `감사 미완(unavailable)` 행. finalize는 이미 그 파일을 읽으므로 새 읽기가 없다.
- **`관측대기=`의 정의 (중요)** — «그 라운드에 `- ac-pending`을 남긴 AC»가 **아니다.** 그렇게 정의하면 구멍이 난다: `- ac-pending`의 writer는 `/implement-workitem` 6-R과 `/finalize-workitem` 둘이고 finalize는 중복 append를 금지하므로, implement가 이미 남긴 관측 AC는 finalize 라운드에 append가 0건이 되어 `관측대기=없음`이 되고 **receipt 없는 관측 AC가 졸업을 통과한다.**
  - **정의**: 그 task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC 중, task `## 8`의 (HTML 주석 밖) **그 AC 마지막 이벤트가 `- ac-acceptance`가 아닌 것 전부.** 즉 `## 6-1`을 직접 스캔한다(구 ADR-067 item 4 (a')와 같은 입력원).
  - 관측 modality AC가 0건이거나 전부 이미 유효 receipt를 가졌으면 `관측대기=없음`.
- **판독 규칙**: HTML 주석(`<!-- ... -->`) 밖의 줄만 항목으로 센다([ADR-064](ADR-064-task-layer-evidence-contract.md) D4 공통 판독 규칙). 같은 task에 `- closure` 줄이 이미 있으면 **덮어쓰지 않고 새 줄을 append**한다(이력 보존 — 마지막 줄이 현재 상태다).
- **이 줄이 커밋되기 때문에** 졸업 판정이 새 체크아웃·다른 worktree에서도 성립한다. 채점표에 대한 졸업 의존이 0이 된다.
- **closure는 «마감 시점의 스냅샷»이며 그 이후의 코드 변경으로 무효화되지 않는다.** 폐쇄 후 수정의 *현재성*은 졸업 item 2(통합 `validate` — 그 수정의 회귀 테스트가 묶여 있다)와 item 5(P0 0건)가 담당하고, *추적성*은 D6의 `files:`·`scope:`가 담당한다. closure에 무효화 개념을 두면 폐쇄 후 수리마다 재validate가 필요해져 본 ADR의 목적이 무너진다.
- **[ADR-064](ADR-064-task-layer-evidence-contract.md) D4와의 관계**: D4는 receipt writer를 «implement foreman·repair-workitem», 시점을 «`/validate-workitem` 실행 이전»으로 규정한다. `- closure`는 그 규정의 **예외**다 — writer가 `/finalize-workitem`이고 시점이 validate *이후*다. 안전한 이유는 `- ac-pending`과 같다: **`## 0. Status`를 `done`으로 쓰는 것과 동일한 편집 라운드**에서 append하므로 별도의 mtime 갱신을 만들지 않고, 그 뒤에 이어지는 것은 커밋뿐이다.

### D3. 졸업 checklist 5+1 (v3)
MILESTONE `## 5. 완료 기준`은 다음 5개 필수 + 1개 선택이다. **항목을 증설하지 않는다.**

1. **마감 스냅샷 유효** — 산하 모든 task의 `## 0. Status`가 `done`이고, 각 task `## 8`의 마지막 `- closure` 줄이 (a) `verdict=Pass` 또는 `verdict=Pending Acceptance`이며 (b) `audit=complete`이다. `- closure` 줄이 없는 task는 미충족.
   - **`- closure` 부재의 처방은 skill 재실행이 아니라 «사용자 직접 기재»다.** `/finalize-workitem` 1-G는 `done` task에 read-only no-op이고 `/validate-workitem`도 폐쇄 상태에서 종료하므로, 이 개선 이전에 마감된 task는 그 두 skill로 closure를 얻을 수 없다. 그 task `## 8`에 사용자가 `- closure <날짜> <task-id>: verdict=Pass / 기계AC=<n/n> / audit=complete / 관측대기=<...> / 자동화율=<%> (마이그레이션 — 소급 기재)` 한 줄을 직접 적는다. **별도의 백필 skill·모드를 만들지 않는다.**
   - `audit=미완:<축>` 분기는 방어적 검사다 — `/validate-workitem`이 감사 미완이면 `Needs Fix`를 내고 finalize가 차단하므로 정상 경로에서는 도달하지 않는다. 수기 기재분을 잡기 위해 남긴다.
2. **통합 `validate` Pass** — 현재 코드 상태 기준. **마일스톤 층 수리가 추가한 회귀 테스트는 이 명령에 묶여 있어야 하며**(D6), 따라서 본 항목이 그 테스트의 통과까지 함께 검사한다.
3. **E2E Pass** — 판정 상태 5종의 SSOT는 [ADR-052](ADR-052-stack-provisioning-and-e2e-readiness.md)#amend-1이며 **실제 실행된 e2e 1개 이상 성공**이 조건이다(0-spec 예외 없음).
4. **관측 AC receipt 유효** — **대상 AC의 authoritative 출처는 task `## 6-1`의 modality 표기다.** 각 task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC를 전수 회수하고, 그 AC마다 task `## 8`의 (HTML 주석 밖) **마지막 이벤트가 `- ac-acceptance`** 인지 본다(ADR-065 D3 판독 규칙 2). `- ac-pending`·`- invalidated`이거나 이벤트가 없으면 미충족.
   - `- closure`의 `관측대기=` 목록은 **회수 편의용 색인**이며 판정의 근거가 아니다. 그 목록과 `## 6-1` 스캔 결과가 어긋나면 **`## 6-1`을 신뢰한다**(수기 기재·구 정의로 작성된 closure 줄 방어).
   - **본 항목만 미충족이고 1·2·3·5가 전부 충족이면 graduation은 `PENDING_ACCEPTANCE`다**(D4).
5. **P0 severity finding 0건** — `QA_FINDINGS.md`의 본 마일스톤 헤더 `### P0`에서 `status: resolved`가 아닌 항목 수 0.
6. (선택) 본 마일스톤 한정 추가 기준.

- **채점표(`docs/40-validation/reports/`)는 졸업 판정의 입력이 아니다.** ADR-067 D1 item 4의 (a)(b)(c)(d)와 mtime 비교는 전부 폐지된다.
- **`--dry-run` 폐지 사유**: v3의 item 1·4·5가 파일 읽기만으로 판정되므로 «싸게 미리 보기»의 대상이 item 2·3(validate·e2e)뿐인데, 그 둘은 졸업하려면 어차피 실행해야 한다. 별도 모드가 만드는 예외 분기(§1.5 안의 validate 1회 실행 / e2e 표기 / 판정 미기록 / §3-V 제외)만 남는다.
- **조기 종료 옵션은 유지한다** (ADR-067 D4에서 승계). 정적 항목(item 1·4) 평가에서 미충족이 나오면 `/stabilize-milestone`은 그 목록과 함께 **조기 종료 옵션을 사용자에게 제시**한다(강제 종료 아님 — 계속 진행을 택할 수 있다). item 1이 깨진 상태에서 qa·reviewer 팬아웃을 끝까지 도는 것은 낭비다. **단 item 4만 미충족인 경우는 조기 종료 옵션을 제시하지 않는다** — 결함이 아니라 «사람 확인만 남은» 상태이므로 되돌아가 고칠 것이 없다(D4 `PENDING_ACCEPTANCE`).

### D4. graduation 판정값 4종
`graduation: <YES | PENDING_ACCEPTANCE | NO | BLOCKED> (<날짜>)`. **ADR-067 D3을 그대로 승계한다** — 값·정의·우선순위(`BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`)·덮어쓰기 규칙·`ROADMAP` Done 전환은 `YES`일 때만·관측 AC 0건이면 `PENDING_ACCEPTANCE` 불성립, 전부 불변이다.
- `BLOCKED`이 덮는 것도 둘 그대로다 — (a) e2e blocked-on-env, (b) 감사 미완.
- 기록 시점은 `/stabilize-milestone` 단계 8이며 1회만 쓴다.

### D5. 회고 항목
`## 8. 회고`는 다음을 담는다(ADR-067 D2 + 한 줄 추가).
- `graduation:` 판정 줄 (D4)
- `open 항목 스냅샷:` — 두 원장의 미해소 합계 + 이전 마일스톤 carry-over
- **`post-close 수정:`** — 폐쇄 이후 마일스톤 층이 고친 건수. 형식: `<N건 (in-AC K / out-of-AC L)> — 상세: IMPROVEMENT_GUIDE ## 5 ### M<N>`. 0건이면 `없음`.
- 목표 달성도 / scope creep 사례 / 비목표 위반 사례 / 핵심 학습 3개 이내

### D6. post-close 수리 계약
마일스톤 층 수리(`/repair-milestone`·`/repair-acceptance`)는 아래를 지킨다.

- **재개방하지 않는다**(D1). 특정 task에 귀속되는 결함이라도 그 skill이 **직접 고친다.**
- **회귀 테스트 선행** — 결함을 재현하는 실패 테스트를 먼저 추가해 Red를 관측하고, 고친 뒤 Green을 확인한다. **그 테스트는 통합 `validate`에 묶는다**(묶지 않으면 졸업 item 2가 검사하지 못한다). 면제는 «코드 3줄 이하 + 외부 행동 불변» 또는 «문서만 고치는 finding»이며 사유를 결정 이력에 적는다.
- **검증 집합** — 재validate 대신 아래 넷을 돈다.
  1. 본 라운드가 추가·수정한 회귀 테스트 전부 Green
  2. 변경 파일과 교차하는 task의 `## 6-1` 자동 테스트 매핑 대상
  3. 외부 경계·핵심 journey를 건드렸으면 해당 integration/e2e smoke
  4. `validate --changed` 1회(미지원이면 통합 `validate`)
  전체 검증은 다음 `/stabilize-milestone`의 통합 `validate` + e2e가 담당한다.
- **결정 이력 필수 필드** — `IMPROVEMENT_GUIDE.md` `## 5. Repair decision log`에 P0/P1 전부를 append하고 아래 두 필드를 **양 skill 공통 필수**로 한다.
  - `files:` — 이 항목이 고친 파일 목록. 문서만 고쳤으면 `files: docs-only`. **재개방이 없으므로 이것이 «어느 파일을 고쳤나»의 유일한 영속 자리다.**
  - `scope: in-AC | out-of-AC` — «이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가». 계약의 범위는 여섯이다: task `## 6. AC` · task `## 3`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · `DESIGN.md` 계약. **애매하면 `out-of-AC`로 적는다**(추적 부채를 남기는 쪽이 안전하다).
  - `out-of-AC`면 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 계약 부채를 `status: open`으로 등재한다. **양 skill 공통 의무다.**
  - `affected: T-NNN` 은 기존대로 필수다.
- **수리 부산물의 기록 위치 (양 skill 공통)** — 폐쇄 후에는 task 문서에 쓸 수 없으므로(D1) 아래 셋을 `## 5`의 그 항목 **하위 줄**에 적는다. 형식 문자열은 [ADR-064](ADR-064-task-layer-evidence-contract.md) D4 / [ADR-066](ADR-066-milestone-acceptance.md) D6의 것을 그대로 쓰되 위치만 바뀐다.
  - `- exec-evidence <날짜> <경계 a|b|c>: …` (외부 경계 코드를 고쳤을 때)
  - `- pattern-scan <날짜> <패턴>: 범위 내 N건 / 범위 밖 M건 <경로>`
  - `- invalidated`는 **여기가 아니다** — D1의 예외대로 task `## 8`에 적는다(그 AC 이벤트 로그의 일부이기 때문).
  - **이 이동은 [ADR-064](ADR-064-task-layer-evidence-contract.md) D4와 충돌하지 않고 오히려 정합을 회복한다** — D4의 receipt 작성자는 «`/implement-workitem` foreman **및** `/repair-workitem`» 둘뿐이며 `/repair-milestone`·`/repair-acceptance`는 애초에 등재돼 있지 않다. 두 skill이 task `## 8`에 `- exec-evidence`를 쓰던 현행 문구가 D4를 벗어나 있었고, 본 항목이 그것을 `## 5`로 옮겨 해소한다.
- **봉인된 계약 본문은 고치지 않는다.** `[Spec-gap]`·`[Arch-iface-violation]` 같은 finding이 feature `## 7. FAC`·`## 7-1` 매핑표나 milestone `## 3`처럼 **`ready` 봉인으로 잠긴 계약 본문**을 고쳐야 성립하면, 그 수정을 하지 않고 사용자에게 보고 + 다음 M 후보로 남긴다([ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D6/D7 잠금 / ADR-057#amend-3 결정 6). 고칠 수 있는 것은 **코드·테스트·잠기지 않은 문서**(원장·ARCH 산문·링크·인덱스)뿐이다.

### D7. 원장 구조 정리 + 아카이브 회전
두 원장이 폐쇄 후 수리의 **유일한 추적 자리**가 되므로(D6) 회수 비용과 성장 속도를 함께 잡는다.

**D7-1. `IMPROVEMENT_GUIDE.md` 섹션 폐지·통합**
- `## 0. 요약`·`## 1. 우선순위`를 **폐지(결번)** 한다. 두 절은 writer도 reader도 0이었다 — 파생 요약은 다중 writer 환경에서 본문과 drift하기 때문에 실패했다.
- `## 3. 권장 리팩토링`을 **폐지(결번)** 하고 `## 2`로 통합한다. 세 소비자(`/repair-milestone` 회수·`/stabilize-milestone` 7-T·`/plan-milestone` R0)가 두 절을 이미 동일하게 취급하며, «즉시/권장» 구분은 `severity` 필드가 이미 표현한다.
- `## 2`를 **`## 2. 열린 항목`** 으로 개칭한다. `## 4`·`## 5`의 번호는 **바꾸지 않는다**(`## 5`는 인용이 많다). 폐지 번호는 재사용하지 않는다 — charter `## 10`·DISCOVERY `## 11`·milestone `## 7`의 결번 처리와 동형이다([ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D1 선례).
- 절 이름을 지목하는 소비자는 **함께 재지정한다**. 누락하면 `/repair-acceptance`가 존재하지 않는 절에서 `(수용)` 태그를 회수·토글하게 되어 사용자가 이번 마일스톤에서 고치기로 택한 개선이 실행되지 않는다.

**D7-2. 아카이브 회전** — **`/plan-milestone` R0가 수행한다.**
- 직전 마일스톤의 회고 `graduation:`이 **`YES`일 때만** 수행한다. `YES`가 아니면 아무것도 옮기지 않는다.
- 대상: 그 마일스톤 블록의 **`status: resolved` 항목** + `IMPROVEMENT_GUIDE.md` `## 5`의 그 `### M-N` 그룹 **전체**(closed records라 전량 대상).
- **`status: open` 항목은 옮기지 않는다** — 활성 파일에 남아 carry-over가 된다.
- 목적지: `docs/40-validation/archive/<M>.md` 1파일. 안에 `## QA_FINDINGS` / `## IMPROVEMENT_GUIDE` 두 절을 두어 출처를 보존한다. **gitignore 대상이 아니다**(Record — `40-validation/` 하위의 다른 5개 디렉터리와 반대다).
- **순서 고정**: ① 아카이브 파일에 append → ② 원본에서 제거. 중단으로 양쪽에 남으면 다음 R0가 «아카이브에 이미 있는 ID를 원본에서 제거»로 정리한다. 유실보다 중복이 안전하다.
- 아카이브는 닫힌 항목만 담으므로 [ADR-005](ADR-005-ssot.md)#amend-1의 비중복 불변식 N-1(«열린 채로» 두 원장에 존재 금지)의 대상이 아니다.
- **회전과 함께 포인터를 갱신한다** — 회고 `post-close 수정:` 줄의 상세 포인터가 `IMPROVEMENT_GUIDE ## 5 ### M<N>`를 가리키는데 그 그룹이 아카이브로 옮겨가므로, 회전 시 그 포인터를 `docs/40-validation/archive/<M>.md`로 바꾼다. 갱신하지 않으면 졸업한 마일스톤의 회고가 빈 위치를 가리킨다.

### D8. 승계 항목 (1건은 재지정 포함)
- **evaluator-optimizer 패턴 명명** — `/stabilize-milestone`이 evaluator orchestration이다. generator = `/implement-workitem`, evaluator = qa + reviewer + deterministic preflight. **optimizer는 ADR-067 D5의 `/repair-workitem`에서 `/repair-milestone`으로 재지정한다** — 폐쇄 후 수리 주체가 마일스톤 층으로 옮겨졌기 때문이며, 이것이 D8에서 유일하게 «변경»된 항목이다. 폐쇄 *전* 라운드의 optimizer는 여전히 `/repair-workitem`이다.
- **사용자 수용과의 관계 (변경 없음)** — [ADR-066](ADR-066-milestone-acceptance.md)의 `/accept-milestone`은 관측 modality AC가 0건인 마일스톤에서만 선택이며, 1건이라도 있으면 그 receipt 없이 item 4를 충족하지 못하므로 사실상 필수 경로다. 졸업 판정 소유권은 `/stabilize-milestone`에 유지한다.

## 비결정 (영구 No)
- 폐쇄 마커 필드·폐쇄일·폐쇄 확인 프롬프트 — 「전 task `done`」이 이미 그 신호다.
- **폐쇄 후에도** 사용자가 명시 호출하면 `done`을 재개방할 수 있는 탈출구 — 남기면 마일스톤 층 skill이 «사용자에게 재개방을 권하는» 경로가 되살아나고, `/finalize-workitem` 범위 비교 교착도 함께 돌아온다. **폐쇄 *전* task 층의 재개방은 폐지 대상이 아니다**(D1).
- 원장의 요약 인덱스 블록 — 파생 요약은 다중 writer 환경에서 반드시 drift한다(폐지된 `## 0. 요약`·`## 1. 우선순위`가 그 실패 사례다). D7 회전이 같은 문제를 부작용 없이 푼다.
- 채점표의 content-hash 기반 신선도 판정 — ADR-064 D4가 같은 이유로 이미 기각했다.

## 결과
- 졸업 판정의 **문서 입력**(item 1·4·5)이 전부 **커밋된 파일**에서 나온다 — 새 체크아웃에서 task별 재validate가 불필요해진다(item 2·3의 validate·e2e는 stabilize가 그 자리에서 실행한다).
- 재개방 연쇄·실행 순서 규칙·채점표 자기무효화가 함께 사라진다.
- 마일스톤 층 수정의 추적성이 `## 5`의 `affected` + `files` + `scope` 세 필드로 확보된다.
- 두 원장의 활성 크기가 마일스톤 수와 무관한 상수에 수렴한다.

## 정책 강도 (ADR-022)
- **제약(강) — [관측됨]**: D1 폐쇄 경계, D2 closure receipt 발급, D3 item 1·4, D6 회귀 테스트 선행 및 필수 필드, **D7-1의 소비자 재지정**(누락 시 `(수용)` 태그 회수가 죽는다).
- **enabling(약)**: D5 회고 항목, D7-1의 절 폐지·통합, D7-2 회전, D8 명명.

## Mutation Contract (ADR-047 D3)
1. **Target** — stabilize-milestone(§1.5·단계 8·플래그 2종 제거) / repair-milestone(2-A·2-C 삭제, `## 5` 필드, 부산물 위치) / repair-acceptance(재개방 판별→scope 분류값, 연쇄 삭제) / repair-workitem(2-G 조건부 `done` 거부) / finalize-workitem(closure 발급) / validate-workitem(폐쇄 가드) / accept-milestone(후속 안내) / plan-milestone(R0 회전) / MILESTONE_TEMPLATE `## 5`·`## 8` / TASK_TEMPLATE `## 8` / IMPROVEMENT_GUIDE `## 0`·`## 1`·`## 3` 폐지·`## 2` 개칭·`## 5` 필드 + 그 절 이름을 지목하는 소비자 전부 / WORKFLOW lifecycle·상태 전이 / DELEGATION 실행 순서 / ADR-066 D4 / ADR-052 D4·ADR-057 부분 supersede / ADR-067 전체.
2. **Failure mode** — (a) 채점표 자기무효화로 졸업 게이트가 수렴하지 않음 (b) 마일스톤 층 수리가 task를 재개방해 finalize 범위 비교 교착 (c) 새 체크아웃에서 전 task 재validate 강제 (d) 재개방 폐지 후 수정 파일이 어디에도 영속되지 않음.
3. **Predicted improvement** — 마일스톤 라운드 1회당 task 층 재실행 0회, 새 체크아웃 재validate 0회, `## 5` 항목마다 `files`·`scope`가 채워짐.
4. **Preserved invariants** — 졸업 항목 5+1 무증설 / 판정값 4종과 우선순위 / e2e 판정 SSOT = ADR-052#amend-1 / `/stabilize-milestone` read-only(코드·커밋·status 미변경) / commit owner = `/finalize-workitem`·사용자 / 원장 5종 배타 범위 / 관측 AC receipt의 사용자 authority.
5. **Falsifying evaluation** — dogfood 재실행에서 (a) 정상 마일스톤이 item 1에서 `- closure` 부재로 오차단되거나, (b) 마일스톤 층 수리가 회귀 테스트를 `validate`에 묶지 않아 item 2가 그것을 검사하지 못하거나, (c) `## 5`의 `files`·`scope`가 비어 추적이 끊기면 D2·D6을 재조정한다.
6. **Rollback path** — 본 ADR을 superseded로 두고 후속 ADR이 net 규칙을 다시 정의한다(ADR-067을 `accepted`로 되살리지 않는다). 되돌릴 실질은 넷이다: 폐쇄 경계 제거와 `done` 재개방 복원, closure receipt 폐지와 채점표 입력 복원, 졸업 item 4에 (a)(b)(c)(d) 복원, 아카이브 회전 제거.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
> 등재 기준: 본 ADR의 결정을 **실행하거나 집행하는 파일만** 등재한다.
- .claude/skills/stabilize-milestone/SKILL.md          — D3 §1.5 / D4·D5 단계 8 / D8 명명
- .claude/skills/repair-milestone/SKILL.md             — D1 재개방 금지 / D6 수리 계약·필수 필드
- .claude/skills/repair-acceptance/SKILL.md            — D1 재개방 금지 / D6 수리 계약·필수 필드
- .claude/skills/repair-workitem/SKILL.md              — D1 `done` 재개방 폐지
- .claude/skills/finalize-workitem/SKILL.md            — D2 closure receipt 발급
- .claude/skills/validate-workitem/SKILL.md            — D1 폐쇄 후 실행 가드
- .claude/skills/accept-milestone/SKILL.md             — D1 예외 2종 중 `- ac-acceptance` writer / D4 판정값 소비
- .claude/skills/plan-milestone/SKILL.md               — D3 `## 5` default 작성 / D7-2 아카이브 회전
- .claude/skills/validate-plan/SKILL.md                — D3 `[MP-graduation]` 정합 검사
- .claude/agents/reviewer.md                           — D3 `[MP-graduation]` 정합 검사
- .claude/skills/stack-guard/SKILL.md                  — D3 item 3 E2E-applicable 판정
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md   — D3 `## 5` / D5 `## 8`
- docs/30-workitems/_templates/TASK_TEMPLATE.md        — D2 `## 8` closure 형식
- docs/40-validation/IMPROVEMENT_GUIDE.md              — D6 `## 5` 필수 필드 / D7-1 절 폐지·개칭
- docs/00-meta/WORKFLOW.md                             — D1 lifecycle·상태 전이
- docs/00-meta/DELEGATION_STRATEGY.md                  — D1 실행 순서 / D8 명명
- docs/00-meta/STRUCTURE.md                            — D7-2 아카이브 산출물 행
- docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md — D1 부분 supersede(D4의 per-task 위임 라우팅)
- docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md — D1 부분 supersede(폐쇄 후 `done` 재개방) · D1-b 부분 supersede(결정 6 `--feature`)

## 참고
- ADR-007(lifecycle), ADR-022(Ratchet), ADR-045 D6(재발행 기준), ADR-052#amend-1(e2e 5상태 SSOT), ADR-057#amend-1(ROADMAP 파생), ADR-064 D4(receipt 위치·판독 규칙), ADR-065(AC 검증 modality), ADR-066(수용 단계), ADR-067(대체 대상).
````

> commit: `docs(adr): add ADR-068 milestone closure boundary and graduation v3`

---

# Phase 2 — ADR 상태·인덱스·비-skill 인용

## 2-1. `docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md` — supersede 처리

**현재 (6~7행)**:
```markdown
## Status
accepted
```

**변경**:
```markdown
## Status
superseded (by ADR-068)

> 본 ADR의 결정은 [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md)이 통합 승계했다. 졸업 item 4의 (a)(b)(c)(d)·mtime 판정·`--dry-run`은 폐지됐다. (현재 SSOT: ADR-068)
```

**추가 변경 — 본문은 그대로 둔다.** 역사 기록이므로 내용을 고치지 않는다.

## 2-2. `docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md` — Amendment 1 추가

파일 **맨 끝**에 아래를 append한다.

```markdown

<a id="adr-066-amend-1"></a>
## Amendment 1 (<적용일 YYYY-MM-DD>) — 재개방 판별 폐지 (마일스톤 층 폐쇄 경계 정합)

### 배경
- [관측됨] D4의 `in-AC` 분기는 그 task를 재개방해 `/repair-workitem` → `/validate-workitem` → `/finalize-workitem` 연쇄를 돌게 한다. 이 연쇄가 실행 순서 규칙과 채점표 자기무효화의 직접 원인이었다.
- [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D1이 마일스톤 층의 task 재개방을 전면 폐지한다.

### 결정
- **D4의 「재개방 판별」에서 «재개방» 부분을 폐지한다.** `in-AC`·`out-of-AC` 어느 쪽이든 `/repair-acceptance`가 **직접 고친다.** `/repair-workitem` 위임과 그 뒤의 연쇄(`/validate-workitem`·`/finalize-workitem`)는 수행하지 않는다.
- **`scope: in-AC | out-of-AC` 판별 자체는 유지한다** — 라우팅 분기가 아니라 `IMPROVEMENT_GUIDE.md` `## 5`의 **필수 분류값**으로 남는다(ADR-068 D6). 판별 질문과 계약 여섯 범위는 D4 본문 그대로다.
- `out-of-AC` 계약 부채 등재(`## 4. 보류 항목`) 의무는 유지하며 `/repair-milestone`에도 동일하게 적용된다(ADR-068 D6).
- D4의 «본 skill은 커밋하지 않는다»는 유지된다. 연쇄가 사라졌으므로 **커밋 주체는 사용자 하나**가 된다(`/finalize-workitem`이 이 경로에서 호출되지 않는다).
- D6 pattern-scan의 기록 위치는 task `## 8`이 아니라 `IMPROVEMENT_GUIDE.md` `## 5`의 그 항목 하위 줄로 옮긴다(폐쇄 후 task 문서 불가침 — ADR-068 D1). `/repair-workitem`이 폐쇄 **전**에 수행하는 pattern-scan은 기존대로 task `## 8`이다.

### 강도 (ADR-022)
- 제약(강) — [관측됨]. 기존 경로의 제거이며 새 요구를 추가하지 않는다.

### 적용 surface
- .claude/skills/repair-acceptance/SKILL.md
- .claude/skills/repair-milestone/SKILL.md
- .claude/skills/repair-workitem/SKILL.md
```

> `<적용일 YYYY-MM-DD>`는 실제 적용하는 날짜로 바꾼다.

## 2-3. `docs/90-decisions/boilerplate/README.md` — 인덱스 갱신

**(a) 067 행의 Status 칸**

**현재**:
```
| 067 | Milestone graduation contract v2 | accepted | — | ADR-014 통합 재발행. item 4=AC 충족(전 modality) / BLOCKED=평가 실행 불가(e2e env·감사 미완) / 회고 open 스냅샷 |
```

**변경**:
```
| 067 | Milestone graduation contract v2 | superseded | — | ADR-014 통합 재발행. item 4=AC 충족(전 modality) / BLOCKED=평가 실행 불가 / 회고 open 스냅샷 → ADR-068로 통합 재발행 |
```

**(b) 066 행의 Amendments 칸**

**현재**: `| 066 | Milestone acceptance | accepted | — | ...`

**변경**: Amendments 칸을 `(+#amend-1: 재개방 판별 폐지 — ADR-068 정합)`으로 채운다.

**(c) 068 행 추가** — 067 행 **아래**에 삽입:
```
| 068 | 마일스톤 폐쇄 경계 + 졸업 계약 v3 | accepted | — | ADR-067 통합 재발행. task 층 폐쇄 경계 + closure receipt + 졸업 item 4 (a)(b)(c)(d)·mtime 폐지 + 아카이브 회전 (현재 SSOT: ADR-068) |
```
> 끝의 마커는 (d)의 014 행과 같은 이유다 — 이 칸도 supersede 계보라 `ADR-067` 문자열이 남는데, 마커가 없으면 Phase 10 check #1이 미처리로 잡는다. 자기 행에 자기 번호를 적는 것이 중복으로 보이지만, «이 줄의 ADR-067 인용은 처리 완료»를 표시하는 검사 제외 마커라 형식이 같아야 한다(ADR-068 자기 *파일*은 경로로 제외한다 — 2-4의 필터 주의 참조).

**(d) 014 행** — 요약 칸 끝의 `→ ADR-067로 통합 재발행`을 **`→ ADR-067 → ADR-068로 통합 재발행 (현재 SSOT: ADR-068)`** 으로 바꾼다. 끝의 마커가 필요한 이유: 이 칸은 supersede 계보라 `ADR-067` 문자열이 남는데, 마커가 없으면 Phase 10 check #1이 미처리로 잡는다(ADR-045#amend-2 D10의 검사 제외 마커).

## 2-4. 비-skill 파일의 ADR-067 인용 재지정

대상 파일 (skill·템플릿은 각자 Phase에서 처리하므로 여기서 제외):

```
docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md
docs/90-decisions/boilerplate/ADR-009-tdd-default.md
docs/90-decisions/boilerplate/ADR-014-milestone-graduation.md
docs/90-decisions/boilerplate/ADR-017-dogfood-simulation.md
docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md
docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md
docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md
docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md
docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md
docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md
docs/90-decisions/boilerplate/ADR-054-cross-llm-stabilize-review.md
docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md
docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md
docs/90-decisions/boilerplate/ADR-063-verification-harness-integrity.md
docs/90-decisions/boilerplate/ADR-064-task-layer-evidence-contract.md
docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md
docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md
docs/00-meta/STRUCTURE.md          ← Phase 8에서 함께
docs/00-meta/WORKFLOW.md           ← Phase 8에서 함께
docs/00-meta/DELEGATION_STRATEGY.md ← Phase 8에서 함께
.boilerplate/validation/SIMULATION_RUN.md ← 실행 기록. 아래 (3) 적용
```

각 파일에서 `ADR-067`을 찾아 아래 표대로 처리한다.

| 인용 유형 | 처리 |
|---|---|
| (1) **살아있는 규칙 인용** — `ADR-067 D1 item 4`, `ADR-067 D3`, `ADR-067 D1` 등 현재도 적용되는 규칙을 가리킴 | **ADR-068의 대응 항목으로 재지정**한다. 매핑은 아래 표. |
| (2) **배경·역사 서술** — "ADR-067이 ADR-014를 supersede했다" 류 | 링크를 제거하고 산문으로 다시 쓰거나, 그대로 두고 줄 끝에 `(현재 SSOT: ADR-068)`을 병기 |
| (3) **supersede 선언·인덱스 행·실행 기록(Record)** | **원문을 보존**하고 그 줄 끝에 `(현재 SSOT: ADR-068)`을 병기. 과거에 한 행위를 기록한 문장 자체는 바꾸지 않는다 |

**(1)의 D-번호 매핑표**

| ADR-067 | → ADR-068 |
|---|---|
| `D1 item 4 (a)(b)(c)(d)` | **삭제하고 문장 재작성** — 그 조건은 존재하지 않는다 |
| `D1 item 4 (a')` | `D3 item 4` |
| `D1 item 1` (모든 task done) | `D3 item 1` (마감 스냅샷 유효 — closure 조건이 함께 들어옴) |
| `D1 item 2·3·5·6` | `D3 item 2·3·5·6` |
| `D2` (회고 항목) | `D5` |
| `D3` (판정값 4종) | `D4` |
| `D4` 중 **`--dry-run`** 언급 | **삭제** (폐지) |
| `D4` 중 **pre-check·조기 종료 옵션** 언급 | `D3` (조기 종료 옵션은 승계됐다 — 통째로 지우지 않는다) |
| `D5` (evaluator-optimizer 명명) | `D8` — **optimizer는 `/repair-workitem` → `/repair-milestone`으로 함께 바꾼다** |
| `D6` (수용 단계와의 관계) | `D8` |

**확인 명령** (전부 처리했는지) — Phase 10 check #1과 같은 필터를 쓴다:
```bash
grep -rn "ADR-067" --include="*.md" . \
  | grep -v "^\./\.git" \
  | grep -v "^\./IMPROVE-GUIDE\.md:" \
  | grep -v "^\./docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2\.md:" \
  | grep -v "^\./docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3\.md:" \
  | grep -v "현재 SSOT: ADR-068"
```
> **필터 주의**: `grep -v "ADR-067-milestone-graduation-v2.md:"` 처럼 파일명 *문자열*로 거르면 링크형 인용 `[ADR-067](…/ADR-067-milestone-graduation-v2.md)` 이 든 줄까지 함께 걸러져 **재지정 누락이 통과한다.** 위처럼 `^\./경로:` 로 «그 파일의 줄»만 걸러야 한다.
> **ADR-068 자기 파일을 제외하는 이유**: ADR-068 본문은 `## 대체`·D3·D4·D5·Rollback path 등 **11곳에서 ADR-067을 정당하게 인용**한다(supersede 계보 서술 — 1-1의 전문 그대로이며 고치면 안 된다). 그 줄들은 `(현재 SSOT: 본 ADR)` 형식이라 마커 필터에도 걸리지 않는다. **superseding ADR의 자기 파일은 superseded ADR의 자기 파일과 같은 이유로 경로 제외**하고, 그 밖의 파일은 줄 단위 마커로 처리한다 — 이 둘이 «정당한 잔존»의 유일한 두 형태다.

출력이 비면 완료. 남은 줄이 있으면 위 표로 다시 분류한다.

## 2-5. 부분 supersede 노트 2건 (ADR-052 · ADR-057)

본 개선은 두 ADR의 **살아 있는 결정 일부**를 뒤집는다. 두 파일을 `superseded`로 만들지는 않고(나머지 결정이 유효하다) 표기 노트만 남긴다 — ADR-057에 이미 같은 형식의 선례가 있다(`> **부분 supersede (2026-07-29)**: …`).

### (a) `docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md`

**위치**: `## 현재 유효 결정`의 `- D1(install provision)·D2(provision/smoke)·D4(repair-milestone) 결정은 그대로 유효하다.` 줄 **바로 뒤**.

**추가**:
```markdown
> **부분 supersede (<적용일 YYYY-MM-DD>)**: D4의 *"단일 task로 격리되는 결함은 `/repair-workitem T-NNN`으로 라우팅"* 은 [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D1이 부분 supersede한다 — **마일스톤 층(산하 전 task done) 이후에는 라우팅 없이 `/repair-milestone`이 직접 고친다.** D4의 나머지(코드 수정 허용 · 자동 커밋·status 변경 금지 · `## 5` 결정 이력)는 유효하다. 본 표기는 개정(amend)이 아니라 참조 갱신이다.
```

### (b) `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`

**위치**: 기존 `> **부분 supersede (2026-07-29)**: …` 노트 **바로 뒤** (같은 블록에 나란히 둔다).

**추가**:
```markdown
> **부분 supersede (<적용일 YYYY-MM-DD>)**: [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md)이 둘을 부분 supersede한다 — (1) `## 현재 유효 결정`의 *"검증된 완료 결함만 repair-workitem이 `done→in-progress`"* 는 **마일스톤 층(산하 전 task done) 이후에 한해** 폐지된다(폐쇄 전 task 층의 재개방은 유효하다). (2) **결정 6 `/stabilize-milestone --feature F-NNN` 스코프는 폐지된다** — #amend-3의 *"계획이 아니라 검사 범위라 유지"* 존치 선언을 ADR-068 D1-b가 뒤집는다. 본 표기는 개정(amend)이 아니라 참조 갱신이다.
```

**추가로 `## Surfaces`의 아래 두 행 끝에 `(부분 supersede: ADR-068 D1)`을 병기**한다(행 자체는 지우지 않는다 — 역사 기록):
```
- .claude/skills/repair-milestone/SKILL.md (다음 액션 `M<N>` 전체 + per-task 결함은 status를 직접 쓰지 않고 repair-workitem 위임 — §4.12c h·§4.12d h)
- .claude/skills/repair-workitem/SKILL.md (검증된 결함 시 `done → in-progress` 재개방 — §4.12d h)
```

> `<적용일 YYYY-MM-DD>`는 실제 적용하는 날짜로 바꾼다.

## 2-6. 번호 치환만으로 부족한 4곳 ★ 2-4의 «(1) 재지정»을 문장 재작성까지 끝낸다

2-4의 매핑표는 «ADR-067 → ADR-068» **번호**만이 아니라 **가리키는 대상**까지 바꾼다. 아래 넷은 번호만 바꾸면 문장이 거짓이 되거나 존재하지 않는 구조를 가리킨다. `ADR-067` 토큰이 이미 없어져 확인 명령에도 안 잡히므로 여기서 명시한다.

**(a) `docs/90-decisions/boilerplate/ADR-063-verification-harness-integrity.md`** — v3의 item 4는 «관측 AC receipt»이지 «AC 충족 100%»가 아니다. 기계 검증 AC는 item 1(closure)이 소유한다.

**현재 (`## 결정` D2 «프로젝트 빈 케이스» 불릿)**:
```
졸업 시점의 판정은 **ADR-068의 기존 5+1 항목이 소유한다**(테스트 0건은 item 4 `AC 충족 100%`에서 드러난다 — 본 ADR은 졸업 항목을 추가하지 않는다).
```
**변경**:
```
졸업 시점의 판정은 **ADR-068의 기존 5+1 항목이 소유한다**(테스트 0건은 그 task의 기계 검증 AC 미충족 → `- closure` 줄의 `verdict`·`기계AC`로 드러나며 졸업 item 1이 잡는다 — 본 ADR은 졸업 항목을 추가하지 않는다).
```

**(b) `docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md` 2곳** — v3의 item 4에는 하위 항목이 없으므로 `(a')` 표기를 없앤다.

| 위치 | 현재 | 변경 |
|---|---|---|
| D1 아래 발급 경로 불릿 | `receipt 없이는 졸업(item 4 (a'))을 통과하지 못하므로` | `receipt 없이는 졸업 item 4를 통과하지 못하므로` |
| `## Surfaces`의 stabilize 행 | `— D1 item 4 (a') 관측 AC receipt 직접 판독` | `— D1 관측 AC receipt 직접 판독 (졸업 item 4)` |

> Surfaces 행의 `D1`은 **ADR-065 자신의 D1**(modality 5종)이다 — 형제 행들과 같은 규약이다. `ADR-068 D3`으로 바꾸면 안 된다. 바뀌는 것은 뒤에 붙은 졸업 항목 표기뿐이다.

**(c) `docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md` 1곳** — `## 근거` 첫 불릿의 `졸업 item 4 (a')를 막으므로` → `졸업 item 4를 막으므로`.

**(d) `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md`** — 2-2가 발행한 ADR-066 Amendment 1이 이 문장을 거짓으로 만든다(재개방 연쇄 폐지). `ADR-066 D4` 인용이라 2-4의 ADR-067 sweep에 걸리지 않는다.

**현재 (`## Status` 아래 «단계 추가 (2026-08-09)» 노트 안)**:
```
**`/repair-acceptance`는 결함이 기존 계약으로 추적 가능하면(`in-AC`) 그 task를 재개방해 `/repair-workitem` → `/validate-workitem` → `/finalize-workitem`으로 마감하고, 추적 불가하면(`out-of-AC`) 재개방 없이 직접 고치고 계약 부채로 등재한다**(ADR-066 D4).
```
**변경**:
```
**`/repair-acceptance`는 `in-AC`·`out-of-AC` 어느 쪽이든 task를 재개방하지 않고 직접 고친다**(ADR-066#amend-1 / [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D1 — `scope`는 라우팅 분기가 아니라 결정 이력의 필수 분류값이며, `out-of-AC`는 계약 부채를 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 등재한다).
```

> 노트의 날짜 머리(`> **단계 추가 (2026-08-09)** —`)와 나머지 문장은 그대로 둔다.

> commit: `docs(adr): supersede ADR-067 with ADR-068, amend ADR-066, note partial supersede on ADR-052/057`

---

# Phase 3 — 원장 구조 정리

## 3-1. `docs/40-validation/IMPROVEMENT_GUIDE.md` — 섹션 정리 (ADR-068 D7-1)

### (a) 죽은 섹션 2개 삭제 + `## 2` 개칭 + `## 3` 결번

**현재 (22~30행)**:
```markdown
## 0. 요약

## 1. 우선순위

## 2. 즉시 수정할 항목

## 3. 권장 리팩토링

## 4. 보류 항목
```

**변경**:
```markdown
## 2. 열린 항목

<!-- 마일스톤 단위 `### M1`, `### M2` 그룹으로 누적한다. severity(P0/P1/P2)가 우선순위를 표현하므로
     별도의 «즉시/권장» 구분을 두지 않는다. 회수자는 /repair-milestone(이번 마일스톤)이다. -->

<!-- ## 0. 요약 · ## 1. 우선순위 — 폐지(결번). 파생 요약은 다중 writer 환경에서 본문과 drift한다.
     번호는 재사용하지 않는다. -->

<!-- ## 3. 권장 리팩토링 — 폐지(결번). `## 2. 열린 항목`으로 통합했다.
     번호는 재사용하지 않는다. -->

## 4. 보류 항목
```

### (b) `## 5` 안내의 필드 규정을 «필수 3종»으로 재작성

**현재 (56행 근처, `- **affected: T-NNN** 필드` 불릿)**:
```markdown
- **`affected: T-NNN` 필드**: `scope: out-of-AC` 항목에서 **필수**다(재개방하지 않아 task 문서에 흔적이 없으므로). `in-AC`는 task `## 8`에 이력이 남으므로 권장 수준이다. 여러 task에 걸치면 쉼표로 나열하고, 어느 task에도 귀속되지 않는 순수 cross-cutting은 `affected: —`.
```

**변경**:
```markdown
- **필수 필드 3종 (ADR-068 D6)** — `/repair-milestone`·`/repair-acceptance` 항목에 **전부 필수**다. 마일스톤 층은 task를 재개방하지 않으므로 task 문서에 흔적이 남지 않고, 이 세 필드가 유일한 추적 경로다.
  - `affected: T-NNN` — 영향 task. 여러 개면 쉼표 나열, 순수 cross-cutting은 `affected: —`.
  - `files:` — 이 항목이 실제로 고친 파일 목록. 문서만 고쳤으면 `files: docs-only`.
  - `scope: in-AC | out-of-AC` — 그 변경 줄을 기존 계약(task `## 6` AC · task `## 3` line item · feature `## 7` FAC · feature `## 7-2` INV · 승인 프로토타입 · DESIGN 계약)으로 거꾸로 추적할 수 있는가. **애매하면 `out-of-AC`.** `out-of-AC`면 `## 4. 보류 항목`에 계약 부채를 별도 등재한다.
```

### (c) `## 5` 안내의 재개방 서술 수정

**현재 (53~54행)**:
```markdown
- task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님. `/repair-milestone`·`/repair-acceptance`가 per-task 결함(`scope: in-AC`)을 `/repair-workitem`으로 위임한 경우 그 task 결정 이력도 task `## 8`에 남고, 본 섹션에는 cross-cutting 결정 + "T-NNN으로 위임함" routing 한 줄만 둔다.
- **재개방 없이 고친 것(`scope: out-of-AC`)은 본 섹션에 적고 `affected: T-NNN`으로 역참조한다** — task 문서를 건드리지 않으므로 이 역참조가 유일한 추적 경로다(ADR-066 D4). 그 항목의 «계약 미반영» 사실은 별도로 `## 4. 보류 항목`에 `status: open`으로 등재한다(수리는 끝났지만 계약 반영은 열려 있다 — 서로 다른 사실이므로 항목도 둘이다).
```

**변경**:
```markdown
- **폐쇄 전** task scope (T-NNN) 결정은 해당 task `## 8. 메모`에 직접 append — 본 섹션 아님(`/repair-workitem`이 마일스톤 폐쇄 전에 수행한 라운드).
- **폐쇄 후** 마일스톤 층이 고친 것은 `scope`와 무관하게 **전부 본 섹션에 적는다**(ADR-068 D1 — 마일스톤 층은 task 문서를 건드리지 않는다). `scope: out-of-AC` 항목은 그 «계약 미반영» 사실을 별도로 `## 4. 보류 항목`에 `status: open`으로 등재한다(수리는 끝났지만 계약 반영은 열려 있다 — 서로 다른 사실이므로 항목도 둘이다).
- **동일 패턴 전수 검색(pattern-scan) 결과**도 폐쇄 후에는 본 섹션의 그 항목 하위 줄에 적는다(ADR-066#amend-1).
```

### (d) `## 5` 형식 예시 갱신

`## 5` 안내 아래 형식 예시가 있으면 아래로 교체한다(없으면 `## 5` 안내 마지막 불릿 뒤에 추가). **아래 4-backtick 펜스 안의 내용을 그대로 넣는다** — 안쪽 3-backtick 펜스까지 포함해서 복사한다.

````markdown
형식:
```
- **M1-repair-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | files: src/auth/session.ts, tests/auth/session.spec.ts | scope: in-AC | status: applied | decision: Adopt
  - 발견 (stabilize qa): 세션 만료 후 재요청이 500을 낸다.
  - 결정: Adopt — AC-2가 401을 약속했다 / 회귀 테스트: tests/auth/session.spec.ts::expired_session_returns_401 (Red→Green 관측, validate에 묶임).
  - exec-evidence 2026-09-02 (a): 등급1 재실행 가능 — 테스트 전용 DB / 결과: 만료 세션 row 정리 확인.
  - pattern-scan 2026-09-02 만료 세션 401 처리: 범위 내 1건 수정 / 범위 밖 0건.
```
````

## 3-2. `docs/40-validation/archive/.gitkeep` 신규 생성

빈 파일 하나를 만든다.

```bash
mkdir -p docs/40-validation/archive && touch docs/40-validation/archive/.gitkeep
```

> `.gitignore`는 건드리지 않는다. `40-validation/` 하위 ignore 패턴은 디렉터리별 명시라서 새 디렉터리가 자동 제외되지 않는다 — 아카이브는 커밋 대상이므로 이게 맞다.

## 3-3. 폐지한 섹션을 가리키는 참조 7곳 재지정 (ADR-068 D7-1) ★ 누락 시 기능이 깨진다

3-1이 `## 2`를 개칭하고 `## 3`을 결번 처리하므로, **그 두 섹션을 이름으로 지목하는 모든 소비자**를 함께 고쳐야 한다. 특히 `repair-acceptance` 두 곳은 «존재하지 않는 섹션»에서 `(수용)` 태그를 회수·토글하게 되어 **사용자가 이번 마일스톤에서 고치기로 택한 개선 제안이 실행되지 않고 열린 채 남는다.**

| # | 파일 | 위치 |
|---|---|---|
| 1 | `docs/40-validation/IMPROVEMENT_GUIDE.md` | `## 5` 안내 첫 문단 끝 |
| 2 | `.claude/skills/repair-milestone/SKILL.md` | 반드시 먼저 할 일 3 |
| 3 | `.claude/skills/repair-acceptance/SKILL.md` | 반드시 먼저 할 일 2 |
| 4 | `.claude/skills/repair-acceptance/SKILL.md` | 수행 8 ② |
| 5 | `.claude/skills/repair-plan/SKILL.md` | `5-D` 결정 이력 영속화 |
| 6 | `.claude/skills/stabilize-milestone/SKILL.md` | 7-T 수집 소스 |
| 7 | `.claude/skills/stabilize-milestone/SKILL.md` | 7-T 집계 «Cross-stabilize 회귀 신호» |

**일괄 치환 규칙** — 각 파일에서 아래 문자열을 찾아 바꾼다.

| 찾을 것 | 바꿀 것 |
|---|---|
| `` `## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링` `` | `` `## 2. 열린 항목` `` |
| `` `## 2. 즉시 수정할 항목` 및 `## 3. 권장 리팩토링` `` | `` `## 2. 열린 항목` `` |
| `` `## 2. 즉시 수정할 항목`/`## 3. 권장 리팩토링` `` | `` `## 2. 열린 항목` `` |
| `` `## 2`/`## 3` `` (repair-acceptance의 축약형 2곳) | `` `## 2` `` |

> 축약형(`` `## 2`/`## 3` ``)은 절 이름 문자열을 포함하지 않아 **아래 확인 명령 1로는 안 잡힌다** — 확인 명령 2를 따로 돌린다.

**#5(repair-plan)만 의미가 다르므로 문장째 교체**한다.

**현재**:
```
**`## 2. 즉시 수정할 항목` / `## 3. 권장 리팩토링`에는 박지 않는다** — 이 둘은 *open items*(해야 할 일)이고 결정 이력은 *closed records*(지나간 판단)라 의미가 다르다.
```
**변경**:
```
**`## 2. 열린 항목`에는 박지 않는다** — 그 섹션은 *open items*(해야 할 일)이고 결정 이력은 *closed records*(지나간 판단)라 의미가 다르다.
```

**확인 명령 1 — 절 이름 형태**:
```bash
grep -rn "즉시 수정할 항목\|권장 리팩토링" --include="*.md" --exclude-dir=.git --exclude=IMPROVE-GUIDE.md .
```
→ **2줄만** 남아야 한다 — ① `IMPROVEMENT_GUIDE.md`의 **결번 주석**, ② `ADR-068` D7-1의 폐지 선언(`` `## 3. 권장 리팩토링`을 폐지(결번)하고… ``). ②는 **제거 불가**다: 절을 폐지한다고 쓰려면 그 이름을 불러야 한다.

**확인 명령 2 — 축약형**:
```bash
grep -rn '`## 2`/`## 3`' --include="*.md" --exclude-dir=.git --exclude=IMPROVE-GUIDE.md .
```
→ **빈 출력**이어야 한다.

> commit: `docs(ledger): prune dead sections, retarget consumers, add required tracking fields`

---

# Phase 4 — 템플릿

## 4-1. `docs/30-workitems/_templates/TASK_TEMPLATE.md` — closure 형식 추가

**위치**: `## 8. 메모`의 HTML 주석 안, `- ac-pending ...` 설명 줄 **바로 뒤**.

**현재 (114행 근처)**:
```
       `- ac-pending <날짜> <AC-N>: modality=<사용자 관측|플랫폼 관측> — 마일스톤 수용 라운드에서 확인 예정`  (ADR-065 D3 — writer: implement-workitem·finalize-workitem. ...)
```

**변경 — 그 줄 뒤에 아래를 추가**:
```
       `- closure <날짜> <task-id>: verdict=<Pass|Pending Acceptance> / 기계AC=<충족/전체> / audit=<complete|미완:<축>> / 관측대기=<AC-N 목록|없음> / 자동화율=<%>`  (ADR-068 D2 — writer: finalize-workitem 단독. 마감 시점의 채점표 결론을 커밋되는 자리로 옮겨 적는다. 졸업 item 1의 입력이다(`관측대기=`는 item 4 **회수용 색인**일 뿐 판정 근거가 아니다 — 근거는 `## 6-1` + `- ac-acceptance`, ADR-068 D3 item 4). 채점표(gitignore ephemeral)에 대한 졸업 의존을 없앤다. `## 0. Status`를 done으로 쓰는 것과 같은 편집 라운드에서 쓰고, 이미 있으면 덮어쓰지 않고 append한다 — 마지막 줄이 현재 상태다)
```

### (b) receipt writer 목록 정정 — 폐쇄 후 위치 반영

`## 8. 메모` HTML 주석 안의 **두 괄호**에서 writer 목록이 거짓이 된다(폐쇄 후 마일스톤 층 skill은 task 문서에 `- invalidated` 외에는 쓰지 않는다). 각 괄호를 통째로 교체한다.

**현재 — 주석 두 번째 줄 «증거 receipt 위치이기도 하다 (…)»의 괄호 전체**:
```
(ADR-064 D4 — writer: implement foreman · repair-workitem · repair-milestone · repair-acceptance(외부 경계 코드를 고친 경우). 시점: …)
```
**변경**:
```
(ADR-064 D4 — writer: implement foreman · repair-workitem(**폐쇄 전 라운드 한정**). 시점: 그 라운드의 파일 변경이 전부 끝난 뒤 · /validate-workitem 실행 *이전*. **폐쇄 후(산하 전 task done) repair-milestone·repair-acceptance의 실행 증거는 task 문서가 아니라 IMPROVEMENT_GUIDE `## 5` 항목 하위 줄에 적는다 — ADR-068 D1/D6**)
```

**현재 — `- pattern-scan` 형식 줄 뒤에 붙은 괄호 전체**:
```
(동일 결함 패턴의 다른 출현 전수 검색 결과 — ADR-066 D6. writer: repair-workitem·repair-acceptance·repair-milestone. 범위 밖 항목은 stabilize·repair-milestone이 회수)
```
**변경**:
```
(동일 결함 패턴의 다른 출현 전수 검색 결과 — ADR-066 D6. writer: repair-workitem(**폐쇄 전 라운드 한정**). **폐쇄 후 repair-milestone·repair-acceptance는 IMPROVEMENT_GUIDE `## 5` 항목 하위 줄에 적는다 — ADR-066#amend-1**. 범위 밖 항목은 stabilize가 두 위치 모두에서 회수)
```

**`- invalidated`는 손대지 않는다** — writer 3종(`/repair-workitem`·`/repair-acceptance`·`/repair-milestone`)이 그대로 task `## 8`에 쓴다(ADR-068 D1의 예외 2종 중 하나).

### (c) `## 6-1` 주석의 ADR-067 인용 재지정

**현재 (`## 6-1` 주석의 관측 modality 설명 안)**:
```
미발급 상태는 **마일스톤 졸업**에서 잡힌다(ADR-067 D1 item 4 (a') — graduation `PENDING_ACCEPTANCE`).
```
**변경**:
```
미발급 상태는 **마일스톤 졸업**에서 잡힌다(ADR-068 D3 item 4 — graduation `PENDING_ACCEPTANCE`).
```

## 4-2. `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` — 졸업 기준 재작성

**현재 (19~26행)**:
```markdown
## 5. 완료 기준 (graduation checklist)
> sprint contract: 본 마일스톤이 "done"이라고 합의되는 외부 검증 가능한 기준 (ADR-067).
- [ ] 모든 task status: done
- [ ] 통합 validate Pass
- [ ] E2E Pass — UI 프로젝트(ADR-027#amend-3) 또는 아래 item 6에서 e2e 선언 시 필요. **선언된 e2e 디렉터리에서 실제 실행된 테스트가 1개 이상 성공**해야 통과(registry 등록이 있으면 그 smoke 이름 일치까지 확인). 실행 0개(EMPTY)·실패(FAIL)·환경 불가(BLOCKED_ENV)는 모두 졸업 차단 (ADR-052#amend-1 / ADR-067 D1 item 3)
- [ ] AC 충족 100% + report 유효 — 판정 조건 (a)(a')(b)(c)(d)의 **정책 SSOT는 ADR-067 D1 item 4**이고 그 실행 절차는 `/stabilize-milestone` §1.5다(여기에 재서술하지 않는다 — 정책 중복 금지). 요지: 기계 검증 AC는 validation report에서, `[사용자 관측]`·`[플랫폼 관측]` AC(ADR-065 D1)는 task `## 8`의 `- ac-acceptance`에서 직접 판독. report 부재 task는 미충족
- [ ] P0 severity finding 0건 (QA_FINDINGS의 본 마일스톤 헤더 기준)
- [ ] (선택) 본 마일스톤 한정 추가 기준 <!-- UI 예시: "경험 게이트 [Experience-drift] P1 0건" (ADR-056 — 채택 시 본 항목이 졸업 차단으로 작동) -->
```

**변경**:
```markdown
## 5. 완료 기준 (graduation checklist)
> sprint contract: 본 마일스톤이 "done"이라고 합의되는 외부 검증 가능한 기준 (ADR-068 D3).
- [ ] 마감 스냅샷 유효 — 산하 모든 task의 `## 0. Status`가 `done`이고, 각 task `## 8`의 마지막 `- closure` 줄이 `verdict=Pass` 또는 `verdict=Pending Acceptance`이며 `audit=complete`다. `- closure` 줄이 없는 task는 미충족
- [ ] 통합 validate Pass — 마일스톤 층 수리가 추가한 회귀 테스트는 이 명령에 묶여 있어야 하며(ADR-068 D6) 본 항목이 함께 검사한다
- [ ] E2E Pass — UI 프로젝트(ADR-027#amend-3) 또는 아래 item 6에서 e2e 선언 시 필요. **선언된 e2e 디렉터리에서 실제 실행된 테스트가 1개 이상 성공**해야 통과(registry 등록이 있으면 그 smoke 이름 일치까지 확인). 실행 0개(EMPTY)·실패(FAIL)·환경 불가(BLOCKED_ENV)는 모두 졸업 차단 (ADR-052#amend-1 / ADR-068 D3 item 3)
- [ ] 관측 AC receipt 유효 — 각 task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC를 전수 회수해, 그 AC마다 task `## 8`의 (HTML 주석 밖) 마지막 이벤트가 `- ac-acceptance`인가(ADR-065 D3 판독 규칙 2). `- closure`의 `관측대기=`는 회수 편의용 색인일 뿐 판정 근거가 아니다. 본 항목만 미충족이면 graduation은 `PENDING_ACCEPTANCE`다
- [ ] P0 severity finding 0건 (QA_FINDINGS의 본 마일스톤 헤더 기준)
- [ ] (선택) 본 마일스톤 한정 추가 기준 <!-- UI 예시: "경험 게이트 [Experience-drift] P1 0건" (ADR-056 — 채택 시 본 항목이 졸업 차단으로 작동) -->

<!-- 채점표(docs/40-validation/reports/)는 졸업 판정의 입력이 아니다 (ADR-068 D3).
     구 ADR-067 item 4의 (a)(b)(c)(d)와 mtime 비교는 폐지됐다. (현재 SSOT: ADR-068) -->
```

## 4-3. `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` — 회고에 post-close 줄

**현재 (41행 근처)**:
```markdown
- open 항목 스냅샷: <QA_FINDINGS 미해소 N건 / IMPROVEMENT_GUIDE 미해소 M건 / 이전 M carry-over(P0/P1) K건>  <!-- ADR-067 D2 — ... -->
```

**변경 — 그 줄의 `ADR-067 D2`를 `ADR-068 D5`로 바꾸고, 바로 뒤에 아래 줄을 추가**:
```markdown
- post-close 수정: <N건 (in-AC K / out-of-AC L) — 상세: IMPROVEMENT_GUIDE ## 5 ### M<N>>  <!-- ADR-068 D5 — 폐쇄(전 task done) 이후 마일스톤 층이 고친 건수. 0건이면 "없음". stabilize 단계 8이 IMPROVEMENT_GUIDE `## 5`의 본 마일스톤 그룹을 세어 채운다 -->
```

**추가로**: `## 8` 주석 블록 안의 아래 문장을 **삭제**한다(재검증 안내는 closure receipt 도입으로 무효).
```
     주: 기계 검증 AC의 판정은 stabilize 시점 report(checkout-local ephemeral) 기준이다 — **새 체크아웃에서 재검증할 때는 각 task의 `/validate-workitem`을 먼저 재실행해 report를 만든 뒤 stabilize를 돌린다**(report가 없으면 item 4 (a)가 전 task 미충족으로 나온다). 관측 AC는 커밋된 task `## 8`에서 직접 읽으므로 체크아웃과 무관하다.
```
**대체 문장**:
```
     주: 정적 항목(item 1·4·5)의 입력이 전부 커밋된 파일(task `## 8`의 `- closure`·`- ac-acceptance`, QA_FINDINGS)이라 **새 체크아웃에서도 task별 `/validate-workitem` 재실행이 필요 없다** (ADR-068 D2). 동적 항목(item 2·3의 통합 validate·e2e)은 그 자리에서 `/stabilize-milestone`이 실행한다.
```

**그리고** `## 8` 주석의 `ADR-067 D3`·`ADR-067 D2` 인용을 각각 `ADR-068 D4`·`ADR-068 D5`로 바꾼다.

## 4-4. `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md` — `## 11` 인용 정정

`## 11. 수용 기록` 주석의 `ADR-067 D6` → `ADR-068 D8`, `ADR-067 D1 item 4 (a')` → `ADR-068 D3 item 4`로 바꾼다.

> commit: `docs(templates): add closure receipt format and graduation v3 checklist`

---

# Phase 5 — task 층 skill

## 5-1. `.claude/skills/finalize-workitem/SKILL.md` — closure receipt 발급

### (a) 수행 6에 closure 발급 추가

**현재 (51행)**:
```markdown
6. staging·안전검사(수행 4-5)가 abort 없이 통과한 뒤에만 task 문서의 `## 0. Status`를 `done`으로 갱신한다(커밋 성공 직전 — 검사 중단 시 done을 쓰지 않아 "done인데 미커밋" 방지).
```

**변경 — 별도 단계를 만들지 않고 수행 6 안에 넣는다.** 별도 번호(6-C 등)로 두면 실행자가 수행 5의 `git add`를 그 사이에 끼워 **closure 줄이 스테이징되지 않은 채 커밋**될 수 있다(수행 5-(0)은 "status=done을 쓴 뒤 task 문서를 add"이므로 두 쓰기가 같은 Edit 안에 있어야 안전하다).
```markdown
6. staging·안전검사(수행 4-5)가 abort 없이 통과한 뒤에만 task 문서를 갱신한다(커밋 성공 직전 — 검사 중단 시 아무것도 쓰지 않아 "done인데 미커밋" 방지). **아래 둘을 *한 번의 편집*으로 함께 쓴다** — 별도 편집으로 나누면 뒤엣것이 staging 밖에 남을 수 있다.
   - (i) `## 0. Status`를 `done`으로 갱신.
   - (ii) **closure receipt 발급 (ADR-068 D2)** — 「반드시 먼저 할 일 3」에서 읽은 채점표의 결론을 `## 8. 메모`에 한 줄 append.
     ```
     - closure <YYYY-MM-DD> <task-id>: verdict=<Pass|Pending Acceptance> / 기계AC=<충족/전체> / audit=<complete|미완:<축>> / 관측대기=<AC-N 목록|없음> / 자동화율=<%>
     ```
     - `verdict` = 채점표의 `- 판정:` 값 그대로.
     - `기계AC` = `## AC ↔ 검증 매핑`에서 modality가 `[자동 테스트]`·`[산출물 검사]`이거나 표기 부재인 AC의 충족/전체.
     - `audit` = `## Orchestration`의 `감사 미완(unavailable)` 항목이 없으면 `complete`, 있으면 `미완:<축>`.
     - **`관측대기` = task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC 중, `## 8`의 (HTML 주석 밖) 그 AC 마지막 이벤트가 `- ac-acceptance`가 아닌 것 전부** (없으면 `없음`). **«이 라운드에 `- ac-pending`을 남긴 AC»가 아니다** — `- ac-pending`은 `/implement-workitem` 6-R도 쓰고 본 skill은 중복 append를 금지하므로, implement가 이미 남긴 AC는 이 라운드에 append가 0건이 되어 목록이 비고 **receipt 없는 관측 AC가 졸업을 통과한다.** 반드시 `## 6-1`을 직접 스캔한다.
     - `자동화율` = 채점표에 기록된 값.
     - **같은 task에 `- closure` 줄이 이미 있어도 덮어쓰지 않고 append한다** — 마지막 줄이 현재 상태다.
     - **이 줄이 졸업 item 1의 유일한 입력이다.** 채점표는 gitignore된 checkout-local 파일이라 커밋되지 않으므로, 이 줄이 없으면 그 마일스톤은 졸업할 수 없다.
     - 값을 발명하지 않는다 — 채점표에서 읽을 수 없는 칸은 `미상`으로 적고 마지막 출력에 명시한다.
```

### (b) 마지막 출력에 항목 추가

**현재 (68행 근처)**:
```markdown
- **수용 라운드 대상 AC**: `[사용자 관측]`·`[플랫폼 관측]`로 미충족 통과시킨 AC-N 목록 + `- ac-pending` append 건수 / 해당없음
```

**변경 — 그 아래에 추가**:
```markdown
- **closure receipt**: append한 `- closure` 줄 전문 (ADR-068 D2)
```

### (c) 「반드시 먼저 할 일 3」의 ADR-067 인용 재지정

**현재 (분기 우선순위 ② 안)**:
```
미발급은 졸업 item 4 (a')가 잡는다([ADR-067](../../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md) D1).
```
**변경**:
```
미발급은 졸업 item 4가 잡는다([ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D3).
```

같은 항목의 `이 마일스톤은 그 receipt 전까지 졸업이 `PENDING_ACCEPTANCE`임을 한 줄 안내한다` 문장은 그대로 둔다.

## 5-2. `.claude/skills/repair-workitem/SKILL.md` — `done` 재개방 폐지 (마일스톤 층 한정)

### (a) 2-G 게이트 교체

**현재 (25행)**:
```markdown
2-G. **상태별 입구 게이트 (`done` 재개방 — 유일한 역전이·writer 고정, ADR-057#amend-3 결정 5)**: task `## 0. Status`를 확인한다. `draft`/`ready`(아직 구현 전)면 repair를 거부하고 "먼저 `/implement-workitem`으로 착수" 안내 후 종료. `in-progress`면 상태를 쓰지 않는 일반 repair로 계속한다. `done`이면 **report(또는 위 finding-mode 근거)가 검증된 결함을 가리킬 때만** 아래 "수행"의 done 재개방 절차를 따른다 — `/repair-workitem`만이 `done` task를 재개방하는 유일한 writer다. `/repair-milestone`은 ADR-052 D4대로 status를 직접 쓰지 않고 per-task 결함을 본 skill로 위임한다.
```

**변경 — `done` 거부는 «마일스톤 층일 때만»이다. 무조건 거부하면 `/implement-workitem` 3-R (1)의 «선행 task가 done인데 산출이 없으면 그 선행 task를 현재 M에서 repair→validate→finalize» 지시가 실행 불가가 된다.**

★ **위치도 함께 옮긴다 — 이 블록은 «수행 2(report 읽기)» *앞*에 둔다.** 현재 파일에서 2-G는 수행 2 *뒤*에 있는데, 그러면 폐쇄된 마일스톤에서 **수행 2의 종료 분기가 먼저 걸려** `/validate-workitem`(0-G가 종료) 또는 `/finalize-workitem`(`done`에 read-only no-op)을 처방하고 끝난다 — 둘 다 실행 불가한 처방이라 사용자가 두 번 튕긴 뒤에야 `/repair-milestone`에 도달한다. 아래 (b)의 «2-G가 마일스톤 층 진입을 이미 막는다»도 이 순서라야 참이 된다. 라벨은 `2-G` 그대로 둔다(`/validate-workitem`의 `0-G`가 수행 0 앞에 오는 것과 같은 규약이며, ADR-068 Mutation Contract의 «repair-workitem(2-G 조건부 `done` 거부)» 표기도 유지된다).

```markdown
2-G. **상태별 입구 게이트 (ADR-068 D1 — 마일스톤 층에서만 `done` 재개방 폐지)**: **아래 수행 2(report 읽기)보다 *먼저* 판정한다** — 폐쇄된 마일스톤에서 report 분기가 먼저 걸리면 `/validate-workitem`·`/finalize-workitem`을 잘못 처방하게 된다(둘 다 폐쇄 상태에서 각각 종료·no-op이라 실행 불가한 처방이다). task `## 0. Status`를 확인한다.
   - `draft`/`ready`(아직 구현 전) → repair를 거부하고 "먼저 `/implement-workitem`으로 착수" 안내 후 종료.
   - `in-progress` → 상태를 쓰지 않는 일반 repair로 계속한다.
   - **`done` → 부모 마일스톤의 «층»을 먼저 판정한다.** 그 마일스톤 산하 task를 전수 조회해:
     - **산하에 `done`이 아닌 task가 하나라도 있으면 (아직 task 층)** → 기존대로 진행한다. **아래 수행 2**의 report 판정(또는 finding-mode 근거)이 검증된 결함을 가리킬 때만 아래 "수행"의 done 재개방 절차를 따른다. `/repair-workitem`만이 `done` task를 재개방하는 유일한 writer라는 규율은 이 구간에서 유효하다.
     - **산하 task가 전부 `done`이면 (마일스톤 층)** → **거부하고 종료한다.** 파일·git index·status를 전혀 건드리지 않고 안내한다: *"이 마일스톤은 산하 전 task가 `done`이라 마일스톤 층입니다(ADR-068 D1). 수리는 `/repair-milestone <M>`(stabilize finding) 또는 `/repair-acceptance <M>`(수용 finding)이 재개방 없이 직접 수행합니다."*
   - **`done → in-progress` 역전이는 «폐쇄 전»에만 존재한다.** ADR-057#amend-3 결정 5의 그 전이를 ADR-068 D1이 부분 supersede한 범위가 정확히 그것이다.
```

### (b) finding-mode 서술 정리

**현재 (24행 안, finding-mode 단락)**: `/repair-milestone`·`/repair-acceptance`가 per-task 결함을 위임한다는 전제가 담겨 있다.

**변경 — finding-mode 자체는 남기고 «호출 주체»만 바꾼다.** 폐지하면 `/implement-workitem` 3-R (1)의 «선행 task repair» 경로가 끊긴다 — 그 선행 task의 report는 대개 `Pass`라 report 가드에 먼저 걸리기 때문이다. **첫 괄호와 단락 꼬리 두 곳을 고친다** — 꼬리를 그대로 두면 «위임한 skill»이라는 존재하지 않는 주체가 후속 검증을 맡는 것으로 서술돼, 사용자가 직접 호출한 경우 누가 `/validate-workitem`·`/finalize-workitem`을 돌리는지가 거짓으로 안내된다.

**현재 (24행 finding-mode 단락 첫 부분)**:
```
   - **단, 인자에 finding 요약(`/repair-milestone`·`/repair-acceptance`가 per-task 결함을 위임할 때 넘기는 "<finding>")이 있으면 위 종료 조건 전부에 걸리지 않고 그 finding을 대상으로 진행한다(finding-mode)**
```
**변경**:
```
   - **단, 인자에 finding 요약이 있으면 위 종료 조건 전부에 걸리지 않고 그 finding을 대상으로 진행한다(finding-mode)** — **호출 주체는 사용자, 또는 `/implement-workitem` 3-R (1)의 «선행 task 산출 누락» 경로를 따르는 메인 세션이다. `/repair-milestone`·`/repair-acceptance`는 더 이상 위임하지 않는다(ADR-068 D1).** 이 모드는 폐쇄 *전* task 층에서만 성립한다 — 2-G가 마일스톤 층 진입을 이미 막는다
```

**같은 단락의 꼬리 — 「위임한 skill」 전제 3곳을 교체한다.**

**현재**:
```
**`stale`을 여기 명시하는 것이 중요하다** — 위임하는 skill이 이미 다른 파일을 고친 상태로 부르므로 report는 stale인 것이 정상이고, 앞의 stale 가드가 먼저 걸리면 위임 연쇄가 **첫 고리에서 죽는다.** … (b) QA_FINDINGS·IMPROVEMENT_GUIDE는 건드리지 않으며(status 종료는 위임한 skill 책임 — 본 skill의 "다른 산출물 미접근" 계약 유지), (c) … **위임한 skill이 그 재실행과 이어지는 `/finalize-workitem`까지 자기 루프 안에서 실행하므로, 사용자에게 수동 실행을 요구하지 않는다.**
```
**변경** (가운데 (a)·(c) 항목과 "비판적 재점검" 문장은 그대로 둔다):
```
**`stale`을 여기 명시하는 것이 중요하다** — 호출 시점에 이미 다른 파일이 바뀌어 있는 것이 정상이라 report는 stale이고, 앞의 stale 가드가 먼저 걸리면 이 경로가 **첫 고리에서 죽는다.** … (b) QA_FINDINGS·IMPROVEMENT_GUIDE는 건드리지 않으며(원장 status 종료는 본 skill의 책임이 아니다 — "다른 산출물 미접근" 계약 유지), (c) … **그 재실행과 이어지는 `/finalize-workitem`을 누가 돌리는지는 호출 주체로 갈린다 — 메인 세션이 `/implement-workitem` 3-R (1) 경로로 호출했으면 그 세션이 이어서 실행하고, 사용자가 직접 호출했으면 사용자가 실행한다(그 경우 마지막 출력에 두 단계를 순서대로 명시한다).**
```

### (c) 수행 1의 재개방 절차 — 조건을 명시해 **유지**

**현재 (38행)**:
```markdown
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 수정한다. **대상 task가 `done`이었던 경우**: Adopt/Adopt-modified가 하나 이상이면 **첫 코드 수정 직전에** task `## 0. Status`를 `done → in-progress`로 갱신·기록한다(전부 Reject면 코드·status 무변경). 재개방 뒤 이 라운드가 중단되거나 실패하면 `in-progress`로 유지한다(임의로 `done`으로 되돌리지 않음) — 수정 완료 후 fresh `/validate-workitem` Pass를 거쳐 `/finalize-workitem`이 다시 `done`으로 커밋한다.
```

**변경 — 재개방 절차는 «폐쇄 전» 조건을 명시해 유지한다**(2-G가 이미 마일스톤 층을 거부하므로 여기 도달했다는 것은 task 층이라는 뜻이다):
```markdown
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 수정한다. **대상 task가 `done`이었던 경우**(2-G가 «아직 task 층»으로 통과시킨 경우에만 여기 도달한다): Adopt/Adopt-modified가 하나 이상이면 **첫 코드 수정 직전에** task `## 0. Status`를 `done → in-progress`로 갱신·기록한다(전부 Reject면 코드·status 무변경). 재개방 뒤 이 라운드가 중단되거나 실패하면 `in-progress`로 유지한다(임의로 `done`으로 되돌리지 않는다) — 수정 완료 후 fresh `/validate-workitem`을 거쳐 `/finalize-workitem`이 다시 `done`으로 커밋한다. **마일스톤 층에서는 이 경로에 도달하지 않는다**(2-G에서 종료).
```

### (d) 정책 근거 줄 갱신

**현재 (83행)**: `정책 근거: ... 판정값 3종은 ADR-065 D6.`

**변경 — 문장 끝에 추가**: ` `done` 재개방 폐지는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D1.`

## 5-3. `.claude/skills/validate-workitem/SKILL.md` — 폐쇄 가드 + 인용

### (a) 「반드시 먼저 할 일」에 가드 추가

**현재 (19~20행)**:
```markdown
반드시 먼저 할 일:
0. **감사 축 분할 + 병렬 validator 팬아웃 (orchestration)** — diff 규모로 분기한다.
```

**변경 — 0 앞에 삽입**:
```markdown
반드시 먼저 할 일:
0-G. **폐쇄 가드 (ADR-068 D1)**: 대상 task의 `## 0. Status`가 `done`이고 그 마일스톤 산하 **모든** task가 `done`이면, 그 마일스톤은 마일스톤 층이다 — 새 채점표를 만들지 않고 종료한다. 안내: *"이 마일스톤은 전 task가 `done`이라 마일스톤 층입니다. 졸업 판정은 task `## 8`의 `- closure`를 읽으므로 재validate가 필요하지 않습니다. 검증은 `/stabilize-milestone <M>`이 수행합니다."* 산하에 `done`이 아닌 task가 하나라도 있으면 통상 진행한다.
0. **감사 축 분할 + 병렬 validator 팬아웃 (orchestration)** — diff 규모로 분기한다.
```

### (b) ADR-067 인용 재지정

파일 안의 `ADR-067` 인용을 Phase 2-4의 매핑표대로 처리한다. 주요 지점:
- 36행 `(근거: ADR-067 D3 평가 규칙 ...)` → `ADR-068 D4`
- 101행 `(ADR-067 D3와 동일 원리)` → `ADR-068 D4`
- 102행 `졸업 item 4 (b)는 ... (ADR-067 D1)` → **문장 삭제**. 졸업 item 4에 (b)가 없다. 대신: `졸업 item 1은 이 판정값을 task `## 8`의 `- closure` 줄에서 읽는다(ADR-068 D3).`
- 37행 `이 축의 존재는 `## Orchestration`에도 남으므로 **졸업 item 4 (c)**가 그 값을 읽는다.` → **`ADR-067` 토큰이 없어 위 sweep에 안 걸리는 잔재다.** v3의 item 4에는 (c)가 없고 감사 미완은 closure의 `audit=` 칸을 거쳐 item 1이 읽는다. 아래로 교체:
  ```
  이 축의 존재는 `## Orchestration`에도 남고, `/finalize-workitem`이 그것을 `- closure`의 `audit=` 칸으로 옮겨 적으므로 졸업 item 1이 읽는다(ADR-068 D2·D3 item 1).
  ```
- 191행 `미발급은 졸업 item 4 (a')가 잡는다(ADR-067 D1)` → `미발급은 졸업 item 4가 잡는다(ADR-068 D3)`

> commit: `feat(skills): issue closure receipt at finalize and block post-closure task reopening`

---

# Phase 6 — 마일스톤 층 skill

## 6-1. `.claude/skills/stabilize-milestone/SKILL.md`

### (a) frontmatter — 플래그 제거

**현재 (4행)**:
```yaml
argument-hint: "[milestone id] [--dry-run | --feature F-NNN]"
```

**변경**:
```yaml
argument-hint: "<milestone-id>"
```

### (b) 도입부 인용

**현재 (9행)**:
```markdown
본 skill은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-067 D5).
```

**변경**:
```markdown
본 skill은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-068 D8).
```

**현재 (15행)**: `3. milestone 문서의 `## 8. 회고` 섹션 자동 채움 ([ADR-067](...) graduation contract ...)`

**변경**: 링크와 번호를 `[ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md)`으로 바꾸고, 같은 줄 16행의 회고 본문 설명에 `post-close 수정 줄`을 추가한다:
```markdown
   - 회고 본문: **graduation 줄(`YES|PENDING_ACCEPTANCE|NO|BLOCKED (날짜)` — 단계 8 판정 영속, ADR-057#amend-1·ADR-068 D4)** + `open 항목 스냅샷` + **`post-close 수정` 줄(ADR-068 D5)** + 4 항목: 목표 달성도 / scope creep / 비목표 위반 / 핵심 학습 3개 이내.
```

### (c) 입력 절 — 플래그 서술 전면 삭제

**현재 (25~28행)**:
```markdown
입력:
- `$ARGUMENTS`에는 milestone ID(예: `M1`)가 들어온다.
- `--dry-run` 플래그가 있으면 1.5 Graduation pre-check만 돌리고 종료(P0 검증 도구 — 전체 QA 없이 빠른 졸업 가능 여부 확인).
- `--feature F-NNN` 플래그(ADR-057 결정 6): **입력 검증 먼저 — ...** (한 문단 전체)
```

**변경 — 27·28행(두 플래그 불릿)을 통째로 삭제하고 아래로 교체**:
```markdown
입력:
- `$ARGUMENTS`에는 milestone ID(예: `M1`)가 들어온다. **`M[0-9]+` 패턴만 허용**(미일치 즉시 종료). 다른 인자·플래그는 없다 — 정의되지 않은 플래그를 받으면 안내 후 종료한다.
```

### (d) §1.5 전면 교체 ★ 가장 큰 편집

**현재 (131~160행, `### 1.5. Graduation pre-check (ADR-067)`부터 `--dry-run 플래그가 켜져 있으면...` 줄까지)** — 이 블록 **전체**를 아래로 교체한다.

```markdown
### 1.5. Graduation 판정 입력 수집 (ADR-068 D3)

MILESTONE 문서의 `## 5. 완료 기준` 각 항목을 아래 deterministic 평가로 계산한다(LLM 즉흥 판정 금지). **여기서는 계산만 하고 회고에 기록하지 않는다** — 최종 기록은 단계 8이다.

**정적 항목 (본 단계에서 확정하고 이후 재계산하지 않는다)** — 본 skill 자신이 단계 4~6에서 문서를 쓰므로, 그 쓰기가 아래 판정에 영향을 주지 않도록 여기서 값을 고정한다.

- **item 1 — 마감 스냅샷 유효**: 본 milestone에 속한 모든 task 파일(`docs/30-workitems/tasks/T-*.md`)에 대해
  1. `## 0. Status` 값이 `done`인가.
  2. `## 8. 메모`의 **HTML 주석 밖** 마지막 `- closure` 줄이 존재하는가.
  3. 그 줄의 `verdict`가 `Pass` 또는 `Pending Acceptance`인가. **`Needs Fix`는 미충족이다.**
  4. 그 줄의 `audit`가 `complete`인가. `미완:<축>`이면 미충족이며 graduation은 `BLOCKED (audit incomplete: <축>)`이다.
  - 하나라도 어긋나면 그 task를 미충족 목록에 넣는다(사유를 `status` / `closure 부재` / `verdict` / `audit`로 구분해 적는다). **`## 0. Status`가 `done`인데 `- closure` 줄만 없는 task**의 처방은 **«사용자가 그 task `## 8`에 `- closure` 줄을 직접 기재»** 다(ADR-068 D3 item 1). **`done`이 아닌 task에는 이 처방을 내지 않는다** — 그 task는 아직 task 층이고 단계 2가 종료시킨다. **`/validate-workitem`·`/finalize-workitem` 재실행도 처방하지 않는다** — 전자는 폐쇄 상태에서 종료하고 후자는 `done`에 read-only no-op이므로 그 처방은 실행 불가다. 수기 기재는 이 개선 이전에 마감된 task에서만 발생한다.
  - **채점표(`docs/40-validation/reports/`)를 읽지 않는다.** 졸업 판정은 커밋된 task 문서만 본다(ADR-068 D2).
- **item 4 — 관측 AC receipt 유효**: **각 task `## 6-1`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC를 전수 회수**하고, 그 AC마다 task `## 8`의 (HTML 주석 밖) **마지막 이벤트가 `- ac-acceptance`** 인가(ADR-065 D3 판독 규칙 2)를 본다. `- ac-pending`·`- invalidated`이거나 이벤트가 없으면 미충족. 관측 modality AC가 0건인 task는 해당 없음.
  - `- closure`의 `관측대기=` 목록은 **회수 편의용 색인**일 뿐이다. 그 목록만 읽으면 안 된다 — 수기 기재분이나 구 정의로 쓰인 closure 줄이 목록을 비워 둘 수 있고, 그러면 receipt 없는 관측 AC가 통과한다. **어긋나면 `## 6-1` 스캔 결과를 신뢰한다.**

**동적 항목 (단계 3~6 결과를 반영해 단계 8에서 확정한다)**

- **item 2 — 통합 `validate` Pass**: 단계 3에서 실행한 결과의 exit code 0. 마일스톤 층 수리가 추가한 회귀 테스트도 이 명령에 묶여 있으므로 함께 검사된다(ADR-068 D6).
- **item 3 — E2E Pass**: 단계 3의 e2e 상태 판정을 그대로 반영(ADR-052#amend-1 5상태).
  - **`NOT_APPLICABLE`** (비-UI ∧ item 6에 e2e 미선언) → 해당 없음(통과).
  - **`PASS`** → 통과.
  - **`EMPTY`** (선언된 e2e 디렉터리 하위에서 **실행된** 테스트 0개) → `졸업 가능: NO` (hard) + `Needs E2E Smoke`. 프로비저닝 단계와 달리 졸업 시점에는 차단한다(ADR-068 D3 item 3). *registry 미등록은 이 상태의 사유가 아니다* — 미등록은 `P1 [E2E-registry]` 기록 대상일 뿐이다.
  - **`FAIL`** → `졸업 가능: NO` (hard).
  - **`BLOCKED_ENV`** → **item 3 미충족** (hard, blocked-on-env). real failure가 아니므로 라벨을 구분해 출력하고 환경 복구를 안내한다. **최종 graduation은 `NO`가 아니라 단계 8이 확정하는 `BLOCKED (e2e blocked-on-env: <target>)`이다**(ADR-068 D4 — 우선순위 `BLOCKED` > `NO`).
- **item 5 — P0 severity finding 0건**: `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` 섹션에서 **`status: resolved`가 아닌 항목 수 0**. 단계 4의 qa 팬아웃이 새 P0를 등재할 수 있으므로 단계 8에서 확정한다.
- **item 6 — (선택) 본 마일스톤 한정 추가 기준**: 본문 텍스트 그대로 평가(사용자가 자유 기재한 영역 — 해당 항목만 LLM 해석 허용).

**본 단계의 출력** (판정을 회고에 쓰지 않는다):
- item 1 미충족 task 목록 (사유별 — status / closure 부재 / verdict / audit)
- item 4 미충족 `<task-id>:AC-N` 목록
- item 1·4가 전부 충족이면 그 사실 한 줄
- **조기 종료 옵션 (ADR-068 D3)**: **item 1이 미충족이면** 그 목록과 함께 조기 종료 옵션을 사용자에게 제시한다(강제 종료 아님 — 계속을 택할 수 있다). item 1이 깨진 상태로 단계 4~6 팬아웃을 끝까지 도는 것은 낭비다. **item 4만 미충족인 경우에는 제시하지 않는다** — 결함이 아니라 «사람 확인만 남은» 상태이므로 되돌아가 고칠 것이 없고, 그대로 진행해 단계 8에서 `PENDING_ACCEPTANCE`를 확정한다.
```

### (e) 두 플래그의 잔재 제거 — 파일 전체 sweep

(a)가 `argument-hint`를, (c)가 입력 절을, (d)가 §1.5 안의 `--dry-run` 분기를 이미 없앤다. 남는 것을 **검색으로 확인해 제거**한다.

```bash
grep -n -e "--dry-run" -e "--feature" .claude/skills/stabilize-milestone/SKILL.md
```
- 알려진 잔재는 **§3-V의 `` `--dry-run`에는 포함하지 않는다. `` 문장 하나**다 — 삭제한다.
- 그 밖에 잡히는 줄이 있으면 전부 삭제한다. **작업 후 위 명령이 빈 출력이어야 한다**(Phase 10 check #4와 같은 검사다).

### (f) 단계 8 — graduation 확정 규칙 교체

**현재 (300행, 책임 경계 두 번째 불릿)** — 그 불릿 전체를 아래로 교체한다.

```markdown
- 누적 문서 갱신 + milestone `## 8. 회고` 자동 채움 — **회고의 `graduation:` 줄은 §1.5의 정적 항목 값(item 1·4)과 단계 3~6의 동적 항목 값(item 2·3·5·6)을 합쳐 단계 8에서 1회만 기록한다**(ADR-068 D3·D4). **§1.5의 정적 값을 여기서 재계산하지 않는다** — 본 skill이 단계 4~6에서 QA_FINDINGS·IMPROVEMENT_GUIDE를 쓰므로 재계산하면 자기 쓰기가 판정에 섞인다. 값은 `YES|PENDING_ACCEPTANCE|NO|BLOCKED`+날짜 4종이며 우선순위는 `BLOCKED` > `NO` > `PENDING_ACCEPTANCE` > `YES`다.
  - **item 4만 미충족이고 1·2·3·5가 전부 충족이면 `PENDING_ACCEPTANCE (관측 AC 미발급: <task-id>:AC-N 목록)`** 으로 기록한다 — `NO`로 쓰지 않는다.
  - **감사 미완이 있으면 `BLOCKED (audit incomplete: <축>)`**, e2e 환경 불가면 `BLOCKED (e2e blocked-on-env: <target>)`. 이 값은 이전 라운드의 `YES`·`PENDING_ACCEPTANCE`를 덮어쓴다.
  - P0 기준은 `QA_FINDINGS.md`의 미해소 P0만 반영한다(qa 팬아웃分 — reviewer는 report-only로 미반영).
  - 회고의 `open 항목 스냅샷:` 줄도 여기서 채운다(ADR-068 D5).
  - **회고의 `post-close 수정:` 줄도 여기서 채운다 (ADR-068 D5)** — `IMPROVEMENT_GUIDE.md` `## 5. Repair decision log`의 본 마일스톤 `### M-N` 그룹 항목 수를 세고 각 항목의 `scope:` 값으로 in-AC/out-of-AC를 분해한다. 그룹이 없으면 `없음`.
  - 로드맵 파일은 안 건드린다(다음 plan-milestone R0가 이 줄을 읽어 재조정).
```

### (g) 단계 8 「다음 단계」 — 재validate 권고 제거

**현재 (277행 근처, `PENDING_ACCEPTANCE` 분기 안)**:
```markdown
       - **여기서 `/validate-workitem`·`/finalize-workitem` 재실행을 권장하지 않는다** — item 4 (a')는 채점표가 아니라 task `## 8`을 직접 읽으므로 receipt 발급만으로 충족된다.
```

**변경**:
```markdown
       - **여기서 `/validate-workitem`·`/finalize-workitem` 재실행을 권장하지 않는다** — 그 마일스톤은 이미 폐쇄됐고(ADR-068 D1), 졸업 item 4는 task `## 8`을 직접 읽으므로 receipt 발급만으로 충족된다.
```

**현재 (278행)**: `` 코드 변경이 있었으면 `/repair-acceptance <M>`이 자기 루프 안에서 후속을 끝낸다 — **재개방한 `in-AC` task는 `/validate-workitem` + `/finalize-workitem`까지, 재개방하지 않은 `out-of-AC` 영향 task는 `/validate-workitem`만**(그 task는 계속 `done`이라 마감할 것이 없다). ``

**변경**:
```markdown
       - 수용 라운드 뒤에는 그 skill의 출력이 지시하는 순서를 따른다. 코드 변경이 있었으면 `/repair-acceptance <M>`이 그 자리에서 고치고 회귀 테스트까지 끝낸다 — **task를 재개방하지 않으므로 사용자가 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다.** 사용자는 그 뒤 **본 skill을 한 번 더 실행**해 `YES`를 확정한다.
```

### (h) 나머지 ADR-067 인용

파일 전체에서 남은 `ADR-067`을 Phase 2-4 매핑표대로 처리한다(`ADR-067 D1 item 4 (a')` → `ADR-068 D3 item 4`, `ADR-067 D3` → `ADR-068 D4` 등).

### (i) §1.0 항목 3-1 pattern-scan 회수 — 폐쇄 정합

**현재 (57행)**: `` 3-1. **pattern-scan 범위 밖 잔존 회수 (deterministic)**: 본 마일스톤 산하 task 문서 `## 8`에서 ... ``

**변경 — 문단 첫 문장 뒤에 추가**:
```markdown
     - **폐쇄 후 라운드의 pattern-scan은 task `## 8`이 아니라 `IMPROVEMENT_GUIDE.md` `## 5`의 항목 하위 줄에 있다**(ADR-066#amend-1). 본 항목은 그 두 위치를 모두 읽는다 — task `## 8`은 폐쇄 전 `/repair-workitem` 라운드분, `## 5`는 폐쇄 후 마일스톤 층 라운드분이다.
```

### (j) `(a')` 하위 항목 표기 제거 — ADR-067 토큰 없이 남는 잔재

v3의 item 4에는 `(a')` 같은 하위 항목이 없다. 그런데 `(a')`를 쓰는 줄 중 일부는 `ADR-067` 문자열을 갖지 않아 (h)의 인용 sweep에서 빠진다. 아래 두 곳을 직접 고친다.

**현재 (단계 8 최종 출력)**:
```
   - **수용 대기 AC (item 4 (a') 미충족)**: `<task-id>:AC-N (<modality>)` 목록 / 해당없음.
```
**변경**:
```
   - **수용 대기 AC (item 4 미충족)**: `<task-id>:AC-N (<modality>)` 목록 / 해당없음.
```

**현재 (단계 8 「다음 단계」 분기 제목)**:
```
     - **졸업 가능 = PENDING_ACCEPTANCE** (item 4 (a')만 미충족):
```
**변경**:
```
     - **졸업 가능 = PENDING_ACCEPTANCE** (item 4만 미충족):
```

### (k) 7-T Telemetry — closure fallback 1줄

새 체크아웃에서는 채점표가 없어 telemetry가 통째로 비는데, 이제 같은 수치가 커밋된 `- closure` 줄에 있다.

**현재 (7-T 수집 소스 첫 줄)**:
```
- 본 마일스톤 산하 모든 task의 `docs/40-validation/reports/<task-id>.md` (존재 시).
```
**변경**:
```
- 본 마일스톤 산하 모든 task의 `docs/40-validation/reports/<task-id>.md` (존재 시). **부재하면 그 task `## 8`의 마지막 `- closure` 줄에서 `기계AC`·`자동화율`을 읽는다**(ADR-068 D2 — 새 체크아웃에서 telemetry가 통째로 비는 것을 막는다). 그 줄도 없으면 그 task를 «집계 불가»로 세고 출력에 건수를 남긴다.
```

> 7-T 집계 항목에 «검증 레벨 분포» 줄을 추가하는 것은 **Phase 9-2 (c)가 담당**한다 — 여기서 중복해 넣지 않는다.

### (l) inner-loop 호출을 «권하는» 문장 3곳 ★ ADR-068 D1 직접 위반

D1은 마일스톤 층 skill에 대해 «호출하지 않는다»뿐 아니라 **«사용자에게 그 호출을 권하지도 않는다»** 까지 금지한다. 본 skill은 단계 2에서 «전 task done»이 아니면 종료하므로 **항상 마일스톤 층**이다. 아래 셋은 (a)~(k)의 교체 범위 밖이라 그대로 두면 살아남는다.

| 위치 | 현재 | 변경 |
|---|---|---|
| 도입부 «그 외 변경은 금지한다» 다음 줄 | `` 후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 텍스트 제안만 출력한다. `` | `` 후속 작업이 필요하면 `/repair-milestone <M>`으로 텍스트 제안만 출력한다. **inner-loop 4종(`/implement-workitem`·`/validate-workitem`·`/repair-workitem`·`/finalize-workitem`)의 호출을 권하지 않으며 새 task 자동 추가도 하지 않는다** (ADR-068 D1 / ADR-057#amend-3 결정 6). `` |
| 단계 8 「다음 단계」 QA_FINDINGS 분기 | `` … repair-milestone이 4-판정 후 cross-cutting은 직접 수정하고, per-task 코드 결함은 finding 요약과 함께 repair-workitem에 위임(아래 finding-mode)한 뒤 QA_FINDINGS status를 닫는다. (직전 validate가 Needs Fix report를 남긴 task는 기존대로 `/repair-workitem T-NNN` 직접 — report 기반이라 정상.) `` | `` … **repair-milestone이 4-판정 후 per-task 귀속이든 cross-cutting이든 직접 수정하고**(재개방·위임 없음 — ADR-068 D1) QA_FINDINGS status를 닫는다. `` (괄호 문장 전체 삭제) |
| 단계 8 「다음 단계」 `[Spec-gap]` 분기 (i) | `` 담당 task가 있으면 **현재 M-N에서 `/repair-workitem`(단일) 또는 `/repair-milestone`(교차)**; `` | `` 담당 task가 있으면 **현재 M-N에서 `/repair-milestone M-N`이 직접 수정**(단일 task 귀속이든 교차든 — ADR-068 D1); `` |

**확인**: 작업 후 `grep -n "repair-workitem" .claude/skills/stabilize-milestone/SKILL.md`가 **부정문(«권하지 않는다»·«호출하지 않는다») 문맥만** 남겨야 한다 — Phase 10 check #3과 같은 판독이다.

## 6-2. `.claude/skills/repair-milestone/SKILL.md`

### (a) 재개방 금지 문단 추가

**위치**: 도입부 `disable-model-invocation: true — ...` 문단(12행) **바로 뒤**.

**추가**:
```markdown
**재개방 금지 (ADR-068 D1)**: 본 skill은 `/implement-workitem`·`/validate-workitem`·`/repair-workitem`·`/finalize-workitem`을 **호출하지 않는다.** task `## 0. Status`·validation report도 건드리지 않는다. task 문서에 쓰는 것은 **2-B의 `- invalidated` 한 줄뿐이다**(`## 8`의 AC 이벤트 로그 — D1의 예외 2종 중 하나). 특정 task에 귀속되는 결함이라도 **본 skill이 직접 고치고** `IMPROVEMENT_GUIDE.md` `## 5`에 `affected: T-NNN`으로 역참조한다. 사용자에게 «그 task를 다시 열어라»를 권하지 않는다 — 그 권고 자체가 금지 대상이다.
**연쇄도 없다** — 재개방이 없으므로 닫을 것이 없다. 본 라운드 수정의 즉시 검증은 2-V가, 전체 검증과 졸업 판정은 다음 `/stabilize-milestone`이 담당한다.
```

### (b) 수행 2 라우팅 — per-task 위임 삭제

**현재 (44~49행, `2. **라우팅 — finding의 scope에 따라 처리 주체가 다르다**:`로 시작하는 블록 전체)**

**변경**:
```markdown
2. **모든 Adopt/Adopt-modified 결함을 본 skill이 직접 수정한다 (ADR-068 D1 — 라우팅 분기 없음).** per-task 결함이든 cross-cutting이든 처리 주체는 같다. 대표 유형 4종:
   - **per-task 결함** (특정 `T-NNN`에 귀속되는 코드/AC 결함): 그 코드를 직접 고친다. **task status·계획 본문은 건드리지 않는다**(task 문서에 쓰는 것은 2-B의 `- invalidated` 한 줄뿐이다). 추적은 수행 4의 `affected: T-NNN` + `files:` + `scope:` 세 필드가 담당한다.
   - **doc-consistency finding** (deterministic preflight의 `[Doc-link]`/`[ADR-ref]`/`[Arch-iface-violation]`): 해당 문서를 직접 수정. **단 봉인으로 잠긴 계약 본문은 고치지 않는다** — feature `## 7. FAC`·`## 7-1` 매핑표·milestone `## 3`처럼 `ready` 봉인 대상인 절을 고쳐야 성립하는 finding(대표적으로 `[Spec-gap]`)은 **수정하지 않고 사용자 보고 + 다음 M 후보**로 남긴다(ADR-060 D6/D7 잠금 / ADR-057#amend-3 결정 6 / ADR-068 D6). 고칠 수 있는 것은 코드·테스트·잠기지 않은 문서(원장·ARCH 산문·링크·인덱스)뿐이다.
   - **e2e wiring scaffold/install**: 직접 scaffold·install.
   - **architecture debt**: 현재 M 약속(기존 task·AC) 위반이면 본 라운드에서 직접 수정하고, 구조 변경이 커서 *새 범위*가 되면 architect 호출을 텍스트로 제안하며 사용자에게 보고 + 다음 M 후보로 남긴다.
2-S. **scope 판별 (ADR-068 D6 — 수정마다 1회)**: 각 수정에 대해 «이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가»를 판정해 `scope: in-AC | out-of-AC`를 정한다. 계약의 범위는 여섯이다: task `## 6. AC` · task `## 3`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · `DESIGN.md` 계약. **애매하면 `out-of-AC`.** `out-of-AC`면 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 계약 부채를 `status: open`으로 등재한다(형식은 그 섹션 주석의 「② 계약 미반영」 스키마).
```

### (c) frontmatter description 교체 + 2-B 존치 + 2-E 이동

> 순서 규칙(`**순서 규칙 (중요)**: per-task 위임과 그 뒤의 2-C 연쇄 ①은 …`)은 (b)가 수행 2 블록을 통째로 교체하면서 **이미 함께 사라진다** — 별도 삭제 단계가 필요 없다. (b) 적용 후 그 문자열이 남아 있지 않은지만 확인한다.

**(c-1) frontmatter description** — skill 선택 시 모델이 읽는 첫 문장이라 실효가 크다.

**현재 (3행)**:
```yaml
description: Critically recheck milestone-level QA/improvement findings and fix real cross-cutting defects (code change allowed). Route per-task fixes to /repair-workitem.
```
**변경**:
```yaml
description: Critically recheck milestone-level findings and fix them directly (code change allowed). No task reopening — the milestone layer never calls the workitem skills.
```

**(c-2) 2-B는 그대로 둔다 (변경 없음 — 명시)** — `- invalidated`는 task `## 8`에 계속 append한다. ADR-068 D1의 예외 2종 중 하나이며, 졸업 item 4와 `/accept-milestone` R2가 **둘 다 task `## 8`의 마지막 이벤트만** 읽으므로 다른 파일로 옮기면 무효화가 어디에도 반영되지 않는다.

**(c-3) 2-E 실행 증거의 기록 위치 이동** — `/repair-acceptance` 5-E와 대칭을 맞춘다.

**현재 (2-E 안)**:
```
그 경계의 실행 증거를 다시 확보하고 그 task `## 8`에 `- exec-evidence` 줄을 새로 append한다(기존 줄은 지우지 않는다 — 이력이다).
```
**변경**:
```
그 경계의 실행 증거를 다시 확보하고 **수행 4의 `## 5` 항목 하위 줄에** `- exec-evidence <날짜> <경계 a|b|c>: …`를 적는다(ADR-068 D1/D6 — 폐쇄 후에는 task 문서에 쓰지 않는다. 형식 문자열은 ADR-064 D4의 것을 그대로 쓰고 위치만 바뀐다).
```

같은 2-E의 마지막 불릿도 정합을 맞춘다.

**현재**:
```
   - **per-task 위임분은 여기서 하지 않는다** — `/repair-workitem` 2-E가 같은 일을 한다.
```
**변경**:
```
   - 폐쇄 전 라운드에서 `/repair-workitem`이 남긴 task `## 8`의 `- exec-evidence` 줄은 건드리지 않는다(이력이다).
```

**(c-4) Codex wrapper 정정** — `.agents/skills/repair-milestone/SKILL.md:12`

**현재**:
```
**Codex 서브에이전트 — repo 미매핑**: source body의 per-task `/repair-workitem` 병렬 라우팅은 본 저장소가 Codex subagent로 아직 매핑하지 않아 …
```
**변경**:
```
**Codex parity**: 본 skill은 위임하지 않으므로(ADR-068 D1) 병렬 라우팅 자체가 없다 — Codex와 Claude 동작이 같다.
```

### (d) 2-A 삭제

**현재 (62행)**: `2-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: ... 재validate를 강제하는 것이 유일한 경로다. ...`

**변경 — 2-A 전체를 삭제하고 아래로 교체**:
```markdown
2-A. **채점표를 삭제하지 않는다 (ADR-068 D3)**: 졸업 판정이 채점표를 읽지 않으므로 무효화할 대상이 없다. `docs/40-validation/reports/`를 건드리지 않는다.
```

### (e) 2-C 전체 삭제

**현재 (66~75행, `2-C. **위임 후 연쇄 — 재개방한 task를 본 skill이 닫는다 ...**`로 시작해 `- **Codex**: 병렬 위임 parity가 없다 → ...`로 끝나는 블록 전체)**

**변경 — 블록 전체를 삭제한다. 대체 문단을 두지 않는다.**
- `2-C`라는 단계 번호 자체를 없앤다. 그 내용(«연쇄가 없다»)은 (a)의 재개방 금지 문단이 이미 담고 있고, **번호를 남기면 Phase 10 check #2가 `2-C` 문자열로 미완을 잡는다.**
- 이 파일 안의 다른 `2-C` 참조도 함께 사라져야 한다 — (f) 2-V의 순서 서술, (i) 마지막 출력의 «연쇄 실행 결과 (의무, 2-C)» 표, (j) 잔여 sweep의 책임 경계·커밋 안내가 각각 처리한다.

### (f) 2-V 검증 집합 보강

**현재 (77행)**: `2-V. **자체 검증 — 즉시 파손 감지 (실행 순서상 2-C ① 다음, 2-C ② *앞*이다)**: ... 내용은 둘이다: (i) ... (ii) ...`

**변경 — 첫 문장과 내용 열거를 아래로 교체**(뒤의 baseline·최대 3회·통합 명령 부재 불릿은 그대로 둔다):
```markdown
2-V. **자체 검증 — 즉시 파손 감지 (ADR-068 D6 검증 집합)**: 위 2·2-S·2-P·2-R·2-E·2-B를 마친 뒤 1회 수행한다. 내용은 넷이다: (i) 본 라운드에 추가한 회귀 테스트가 전부 Green이고 **통합 `validate`에 묶여 있는지** 확인한다(묶이지 않으면 졸업 item 2가 검사하지 못한다), (ii) 변경 파일과 교차하는 task의 `## 6-1` 자동 테스트 매핑 대상을 실행한다, (iii) 외부 경계·핵심 journey를 건드렸으면 해당 integration/e2e smoke를 실행한다, (iv) 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를(미지원이면 통합 `validate`를) 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다. e2e 전량·qa 팬아웃·문서 정합·졸업 판정은 `/stabilize-milestone` 책임이다.
```

### (g) 2-P pattern-scan 기록 위치

**현재 (51행)**: `2-P. **동일 패턴 전수 검색 (ADR-066 D6)**: ... 검색 결과는 마지막 출력에 ... **per-task 위임분의 패턴 검색은 `/repair-workitem` 2-H가 하므로 여기서 중복하지 않는다.**`

**변경 — 마지막 문장을 아래로 교체**:
```markdown
검색 결과는 수행 4의 `## 5` 항목 하위 줄에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>` 형식으로 영속하고(ADR-066#amend-1 — 폐쇄 후 task `## 8`에 쓰지 않는다) 마지막 출력에도 한 줄 남긴다.
```

### (h) 수행 4 — `## 5` 형식에 필수 필드 반영

**현재 (86~91행 형식 블록)**:
```
   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | status: applied | decision: Adopt
     - 발견 (stabilize <surface>): <한 줄 설명>.
     - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-context 사유 한 줄>.
```

**변경**:
```
   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | files: <경로 목록 또는 docs-only> | scope: <in-AC|out-of-AC> | status: applied | decision: Adopt
     - 발견 (stabilize <surface>): <한 줄 설명>.
     - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-context 사유 한 줄> / 회귀 테스트: <추가한 테스트 또는 면제 사유>.
     - pattern-scan: 범위 내 N건 수정 / 범위 밖 M건 <경로>.   ← 검색을 수행한 항목만
```

그리고 그 아래 설명 문단의 `**cross-cutting 항목에는 `affected: T-NNN`... 이 필수** ...` 문장을 아래로 교체한다:
```markdown
   **`affected: T-NNN` · `files:` · `scope:` 세 필드가 전부 필수다 (ADR-068 D6)** — 본 skill은 task를 재개방하지 않으므로 이 셋이 "어느 task의 산출물을, 어느 파일에서, 어떤 계약 근거로 고쳤는지"를 추적하는 유일한 경로다. `scope: out-of-AC`면 `## 4. 보류 항목` 등재도 함께 한다(2-S). 어느 task에도 귀속되지 않는 순수 cross-cutting은 `affected: —`.
```

### (i) 책임 경계·마지막 출력 정리

- 책임 경계에서 `- per-task 코드 결함은 직접 고치지 말고 `/repair-workitem`으로 위임한다 ...` 불릿을 **삭제**하고 `- task 문서·task status·validation report를 수정하지 않는다 — **예외는 2-B의 `- invalidated` 한 줄뿐이다**(task `## 8`의 AC 이벤트 로그. ADR-068 D1).`로 교체.
- 책임 경계의 `- workitem `## 0. Status`를 **직접** 변경하지 않는다 — 재개방은 `/repair-workitem`이 ...` 불릿을 `- workitem `## 0. Status`를 변경하지 않는다. **본 skill에는 재개방 경로가 없다** (ADR-068 D1 — 폐쇄 후 마일스톤 층).`로 교체.
- 마지막 출력에서 아래 항목을 **삭제**: `` `/repair-workitem`으로 위임한 task 목록 ``, `**연쇄 실행 결과 (의무, 2-C)**: ...` 표, `삭제한 채점표 (ADR-067 D1 item 4 (d)): ...`.
- 마지막 출력에 **추가**: `- 수정 파일 (files 필드 합계): <경로 목록>` / `- scope 분해: in-AC N건 / out-of-AC M건 (→ `## 4` 등재 ID 목록)`.
- 마지막 출력의 `후속 권장 액션 (순서 고정)`을 아래로 교체:
```markdown
- 후속 권장 액션 (순서 고정): ① `/stabilize-milestone <M-N>` 재실행으로 졸업 판정 갱신 → ② 판정이 `PENDING_ACCEPTANCE`면 `/accept-milestone <M-N>`, `YES`면 `/plan-milestone`로 다음 마일스톤. **사용자가 손으로 돌려야 할 `/validate-workitem`·`/finalize-workitem`은 없다 — 이 경로에 재개방이 없다.**
```
- 정책 근거 줄의 `ADR-067`을 `ADR-068`로 바꾸고, 끝에 ` 재개방 폐지·post-close 수리 계약은 ADR-068 D1·D6.`를 추가한다.
- Codex 단락(14행)의 `` 아래 cross-cutting 처리 단계의 `/repair-workitem` 병렬 라우팅·복수 task 동시 수정은 (현재) Claude 전용 배선 ``을 삭제하고 `본 skill은 위임하지 않으므로 병렬 라우팅 자체가 없다 — Codex와 동일하게 동작한다.`로 교체한다.

### (j) 잔여 위임·연쇄 문장 sweep ★ (a)~(i)가 덮지 않는 6곳

아래는 위 단계들의 교체 범위 **밖**에 흩어져 있어 그대로 두면 «위임이 있다»는 전제가 남는다. 각각 문자열로 찾아 고친다.

| 위치 | 현재 | 변경 |
|---|---|---|
| 2-R 마지막 불릿 | `- **per-task 위임분은 여기서 하지 않는다** — `/repair-workitem`이 자기 규율로 처리한다(중복 금지).` | `- 폐쇄 전 라운드에서 `/repair-workitem`이 이미 처리한 항목은 대상이 아니다(중복 금지).` |
| 수행 4 설명 문단 끝 | `per-task 위임 결과는 해당 task `## 8. 메모`에 `/repair-workitem`이 직접 append하므로 *여기 중복 기록 X* — 본 `## 5`에는 cross-cutting 결정과 "T-NNN으로 위임함" 한 줄 routing 기록만 둔다.` | `**폐쇄 후에는 위임이 없으므로 routing 기록도 없다** — per-task 결함이든 cross-cutting이든 본 `## 5`에 결정 전문을 적는다. 폐쇄 전 `/repair-workitem` 라운드가 task `## 8`에 남긴 이력은 그대로 두고 여기 옮겨 적지 않는다.` |
| 책임 경계 «커밋을 직접 하지 않는다» 불릿 | `2-C ①의 `/finalize-workitem`이 커밋하지만 … commit owner는 «task 마감분 = finalize / 그 밖 전부 = 사용자»로 갈린다.` | `본 경로에는 `/finalize-workitem` 호출이 없으므로 **commit owner는 사용자 하나다.**` |
| 마지막 출력 «커밋 안내» | `**2-C ①이 마감한 재개방 task의 파일은 그 `/finalize-workitem`이 이미 커밋했으므로 여기 목록에 없다** … *그 잔여분을 미커밋으로 두면* … (2-C ①이 cross-cutting 수정보다 먼저 도는 이유가 그것이다).` | `수정 파일과 원장 갱신을 **사용자가 직접 커밋한다.** 재개방이 없으므로 `/finalize-workitem` 커밋분은 존재하지 않는다.` |
| 마지막 출력 «AC acceptance 무효화» | `재발급 자체는 재validate를 요구하지 않는다(item 4 (a')가 task `## 8`을 직접 읽는다).` | `재발급 자체는 재validate를 요구하지 않는다(졸업 item 4가 task `## 8`을 직접 읽는다 — ADR-068 D3).` |
| 정책 근거 줄 | `위임 후 연쇄(2-C)와 status writer 고정은 [ADR-057](…)#amend-3 결정 5.` | `폐쇄 후 재개방·연쇄 폐지는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D1(ADR-057#amend-3 결정 5를 부분 supersede).` |

**확인**: 작업 후 아래에서 **`연쇄`를 뺀 나머지 토큰이 0건**이어야 한다.
```bash
grep -n "2-C\|(a')\|위임한다\|위임분\|위임 결과" .claude/skills/repair-milestone/SKILL.md
```
> `연쇄`를 패턴에 넣으면 **(a)가 넣은 «연쇄도 없다»와 아래 정책 근거의 «재개방·연쇄 폐지» 2줄이 정당하게 걸린다** — 부정문이라 지우면 안 된다. Phase 10 check #2가 `연쇄`를 제외하는 이유와 같다(«재개방»이라는 낱말을 세지 않는 것과 동형).

### (k) per-task 결함에도 같은 규율을 걸기 ★ (b)가 라우팅을 없앤 뒤 남는 한정어

(b)가 «per-task든 cross-cutting이든 처리 주체는 같다»로 바꿨으므로, 아래 규율에 붙은 **`cross-cutting` 한정어를 전부 떼야 한다.** 그대로 두면 per-task 수정이 **회귀 테스트 선행(ADR-068 D6 — 제약(강))·pattern-scan·실행 증거**에서 통째로 빠진다. `/repair-acceptance`는 (6-3 (k)가) 이미 «`scope`와 무관하게 전 항목»으로 고쳐 두므로 두 skill이 비대칭이 되기도 한다.

| 위치 | 현재 | 변경 |
|---|---|---|
| `2-P` 첫 문장 | `` 각 `Adopt` cross-cutting 결함에 대해 `` | `` **`Adopt`·`Adopt-modified`한 각 결함에 대해**(per-task 귀속이든 cross-cutting이든 — 본 skill이 전부 직접 고치므로 대상도 전부다) `` — `Adopt-modified` 추가는 [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D6(«`Adopt`·`Adopt-modified`한 각 결함마다 1회») 정합 |
| `2-R` 첫 문장 | `` **회귀 테스트 선행 (ADR-066 D4 준용)**: 수행 2의 cross-cutting 직접 수정마다 `` | `` **회귀 테스트 선행 (ADR-066 D4 준용 / ADR-068 D6)**: **수행 2의 직접 수정마다**(per-task 귀속이든 cross-cutting이든 — ADR-068 D6은 마일스톤 층 수리 전부에 이 규율을 건다) `` |
| `2-E` 첫 문장 | `본 라운드의 cross-cutting 직접 수정이` | `본 라운드의 직접 수정(per-task 귀속 포함)이` |
| 마지막 출력 첫 항목 | `- cross-cutting 직접 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지` | `- 직접 수정 파일 목록(per-task 귀속·cross-cutting 모두) + 어떤 finding을 어떻게 해소했는지` |
| 책임 경계 «자동 커밋하지 않는다» 불릿 | `` - 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 사용자/`/finalize-workitem`이 별도로 (ADR-047 D7 — finalize/user가 commit owner). `` | `` - 자동 커밋하지 않는다 — 결과만 반환하고 **커밋은 사용자가 별도로 한다** (ADR-047 D7). `` — (j)가 교체한 «commit owner는 사용자 하나다» 불릿과 모순되므로 함께 정리한다 |

## 6-3. `.claude/skills/repair-acceptance/SKILL.md`

### (a) 재개방 금지 문단 추가

**위치**: 도입부의 `` `/repair-milestone`과의 경계 (ADR-066 D5) — **입력 출처로 갈린다.** `` 로 시작하는 블록 **바로 앞**.

**추가**:
```markdown
**재개방 금지 (ADR-068 D1)**: 본 skill은 `/implement-workitem`·`/validate-workitem`·`/repair-workitem`·`/finalize-workitem`을 **호출하지 않는다.** task `## 0. Status`·validation report도 건드리지 않는다. task 문서에 쓰는 것은 **수행 4의 `- invalidated` 한 줄뿐이다**(`## 8`의 AC 이벤트 로그 — D1의 예외 2종 중 하나. `- ac-acceptance`는 `/accept-milestone` 소유). 사용자에게 «그 task를 다시 열어라»를 권하지 않는다 — 그 권고 자체가 금지 대상이다.
```

### (a-2) frontmatter description 교체

**현재 (3행)**:
```yaml
description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 수리한다. in-AC는 /repair-workitem에 위임(재개방), out-of-AC는 재개방 없이 직접 수정. 본 skill은 커밋하지 않는다 (ADR-066 D4).
```
**변경**:
```yaml
description: /accept-milestone이 수집한 사용자 수용 finding을 3+1 판정으로 직접 수리한다. task 재개방 없음 — scope(in-AC/out-of-AC)는 결정 이력의 분류값이다. 본 skill은 커밋하지 않는다 (ADR-066#amend-1 / ADR-068 D1).
```

### (b) 도입부 두 번째 문장 교체

**현재 (10행)**:
```markdown
**커밋하지 않는다.** task 재개방은 **finding이 기존 AC 안(in-AC)인지 밖(out-of-AC)인지에 따라 갈린다** — 아래 「재개방 판별」이 SSOT다. 재개방이 필요한 항목은 본 skill이 직접 status를 쓰지 않고 `/repair-workitem`에 위임한다(ADR-057#amend-3 결정 5 — task status writer는 `/repair-workitem` 하나다).
```

**변경**:
```markdown
**커밋하지 않는다.** **task 재개방은 없다** — `in-AC`든 `out-of-AC`든 본 skill이 직접 고친다(ADR-066#amend-1 / ADR-068 D1). `in-AC`·`out-of-AC` 판별은 라우팅 분기가 아니라 결정 이력의 **필수 분류값**으로만 남는다.
```

### (c) 「재개방 판별」 절 → 「scope 판별」로 교체

**현재 (27~48행, `## 재개방 판별 (`scope: in-AC | out-of-AC` — 3+1 판정과 함께 finding마다 1회)`부터 `- **마일스톤 문서·task 문서에는 쓰지 않는다.**`까지)**

**변경 — 절 제목과 그 아래 «판별 질문» 문단 + 불릿 4개(`in-AC` / `out-of-AC` / 애매하면 / `out-of-contract`와 혼동 금지)를 아래로 교체하고, `**`out-of-AC` 계약 부채 등재 (필수)**` 이하는 그대로 둔다** (대체 블록도 불릿 4개다 — 개수가 같으므로 1:1로 갈아끼운다):
```markdown
## scope 판별 (`scope: in-AC | out-of-AC` — 3+1 판정과 함께 finding마다 1회)

수용 라운드 finding은 «기존 계약이 약속한 것»과 «약속하지 않은 것»이 섞여 들어온다. **둘 다 본 skill이 직접 고치지만**, 계약 근거 유무는 기록해야 한다.

**판별 질문은 하나다 — «이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가».** 계약의 범위는 여섯이다: task `## 6. AC` · task `## 3. 구현 항목`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · `DESIGN.md` 계약(§2 토큰·§7 컴포넌트·§9 Don'ts·§10 voice). **AC 하나만 보지 않는다.**

- **`in-AC`(추적 가능)** → 직접 고친다. 결정 이력에 `scope: in-AC`를 적는다. 별도 부채 등재는 없다.
- **`out-of-AC`(추적 불가)** → 직접 고친다. 결정 이력에 `scope: out-of-AC`를 적고 **아래 계약 부채 등재를 반드시 수행한다.**
- **애매하면 `out-of-AC`로 본다** — 추적 부채를 남기는 쪽이 안전하다(놓친 계약 밖 변경은 조용히 영구화된다).
- **`out-of-contract`와 혼동하지 않는다**: `out-of-AC`는 «이번에 고칠 것»이고, `Out-of-contract`(3+1 판정)는 «이번에 안 고치고 다음으로 넘길 것»이다. 사용자 확인으로 갈린다.
```

### (d) 수행 3 — 위임 삭제

**현재 (66~67행, `3. **`in-AC` 항목은 `/repair-workitem ...`에 위임한다** ...`와 그 아래 `**순서 규칙 (중요)**: ...`)**

**변경 — 두 항목을 아래 하나로 교체**:
```markdown
3. **모든 항목을 본 skill이 직접 고친다 (ADR-068 D1).** `scope`와 무관하게 위임하지 않는다. 본 skill은 task `## 0. Status`를 쓰지 않고 `## 6 AC`·`## 3`·`## 6-1` 계획 본문도 고치지 않는다(잠긴 계약이다). **task 문서에 쓰는 것은 `## 8`의 `- invalidated` 한 종류뿐이다**(수행 4 — ADR-068 D1의 예외 2종 중 하나). 그 밖의 산출물별 목적지는 각 단계가 규정한다 — 코드(1·2), 채점표 미접근(4-A), pattern-scan·exec-evidence는 `## 5`(5·5-E), 원장 status(8), decision log(7), 계약 변경 등재(`Out-of-contract`).
```

### (e) 수행 4는 task `## 8` 유지 · 수행 5만 `## 5`로 이동

**(e-1) 수행 4 — `- invalidated`는 task `## 8`에 그대로 쓴다 (★ 위치를 옮기면 안 된다).**
졸업 item 4와 `/accept-milestone` R2의 필수 시나리오 산정이 **둘 다 task `## 8`의 «그 AC 마지막 이벤트»만** 읽는다. 다른 파일로 옮기면 그 AC의 마지막 이벤트가 여전히 `- ac-acceptance`로 남아 **졸업이 충족으로 읽고 다음 수용 라운드도 재확인 대상으로 잡지 않는다.** ADR-068 D1이 이 줄을 예외 2종 중 하나로 허용하는 이유가 그것이다.

**현재 (수행 4의 마지막 문장)**:
```
**`scope: in-AC` 위임분은 여기서 하지 않는다** — `/repair-workitem`도 무효화 writer이므로(ADR-065 D3) 중복이고, 그 task는 연쇄 ①이 이미 마감·커밋했으므로 사후 append가 미커밋 변경으로 남는다.
```
**변경 — 그 마지막 문장만 교체한다. 앞부분의 `- invalidated` append 지시는 손대지 않는다**:
```
**`scope`와 무관하게 본 skill이 직접 append한다** — 위임이 사라졌으므로 중복 writer가 없다. 이 append는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D1이 허용하는 예외 2종(`- ac-acceptance`·`- invalidated`) 중 하나이며, 그 AC 이벤트 로그의 일부라 `## 5`로 옮기면 졸업 item 4와 다음 수용 라운드가 무효화를 읽지 못한다. **이 줄은 사용자가 커밋한다**(본 skill은 커밋하지 않는다).
```

**(e-2) 수행 5 — pattern-scan만 `## 5`로 옮긴다.**

**현재 (70행)**: `5. **동일 패턴 전수 검색 (ADR-066 D6)**: ... 대상 task `## 8`에 `- pattern-scan ...`을 append한다 ...`

**변경**:
```markdown
5. **동일 패턴 전수 검색 (ADR-066 D6 / #amend-1)**: 각 Adopt 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색하고, **task `## 8`이 아니라** 수행 7의 `## 5` 항목 하위 줄에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>`를 적는다. 범위 밖은 고치지 않고 `/repair-milestone` 또는 다음 마일스톤으로 라우팅한다.
```

### (f) 4-A 교체 · 5-E 정리

**현재 (69행)**: `4-A. **영향 task report 무효화 ...**: ... 삭제한다 ...`

**변경**:
```markdown
4-A. **채점표를 삭제하지 않는다 (ADR-068 D3)**: 졸업 판정이 채점표를 읽지 않으므로 무효화할 대상이 없다. `docs/40-validation/reports/`를 건드리지 않는다.
```

**5-E**: `- **`scope: in-AC` 항목은 여기서 하지 않는다** — 위임받은 `/repair-workitem`의 2-E가 ...` 불릿을 삭제하고, `등급 1 증거로 새 파일을 만들었어도 task `## 4-1`은 건드리지 않는다` 문장은 유지하되 `그 경로는 `## 5. Repair decision log` 항목의 `files:`에 적는다.`로 끝을 바꾼다. 그리고 `task `## 8`에 `- exec-evidence` 줄을 새로 append한다`를 `수행 7의 `## 5` 항목 하위 줄에 `- exec-evidence ...`를 적는다`로 바꾼다.

### (g) 「수행 후 연쇄」 절 전체 삭제

**현재 (92~104행, `## 수행 후 연쇄 (사용자에게 미루지 않는다)` 절 전체)**

**변경 — 절 전체를 아래로 교체**:
```markdown
## 수행 후 (연쇄 없음 — ADR-068 D1)

본 라운드가 코드를 고쳤어도 **task를 재개방하지 않으므로 닫을 것이 없다.** `/repair-workitem`·`/validate-workitem`·`/finalize-workitem`을 호출하지 않는다.

1. 고친 것의 즉시 검증은 5-V(자체 검증)가 담당한다.
2. 전체 검증과 졸업 판정은 다음 `/stabilize-milestone <M>`이 담당한다.
3. `- invalidated`가 1건 이상이면 그 관측 AC의 receipt 재발급을 위해 `/accept-milestone <M>`을 먼저 재실행한다.
4. **커밋은 사용자가 한다.** 본 skill은 `git commit`을 실행하지 않으며(ADR-047 D7), 연쇄가 사라졌으므로 이 경로에서 `/finalize-workitem`이 커밋하는 일도 없다 — **commit owner는 사용자 하나다.**
```

### (h) 5-V 검증 집합 보강

`5-V`의 첫 문장에서 «① 다음, ② 앞» 순서 서술을 삭제하고, 내용을 6-2 (f)와 같은 넷(회귀 테스트 Green + validate 묶임 / 교차 task `## 6-1` 매핑 / 경계 smoke / `validate --changed`)으로 교체한다.

### (i) 마지막 출력 정리

- `- 재개방 판별: in-AC N건(위임한 task 목록) / out-of-AC M건(직접 수정)` → `- scope 분해: in-AC N건 / out-of-AC M건 (→ `## 4` 등재 ID 목록)`
- `- 삭제한 report ...` **삭제**
- `**연쇄 실행 결과 (의무)**: ... 표` **삭제**
- **추가**: `- 수정 파일 (files 필드 합계): <경로 목록>`
- `후속 권장 (순서 고정)`을 아래로 교체:
```markdown
- 후속 권장 (순서 고정): ① `- invalidated`가 1건 이상이면 `/accept-milestone <M>` 재실행(무효화된 관측 AC의 receipt 재발급) → ② `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정. **사용자가 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다.**
```
- 커밋 안내를 `본 skill은 커밋하지 않는다 — 수정 파일과 원장 갱신을 **사용자가 직접 커밋한 뒤** 다음 단계로 진행한다. 재개방이 없으므로 이 경로에 `/finalize-workitem` 커밋분은 없다.`로 교체.
- 정책 근거 줄 끝에 ` 재개방 폐지는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D1 · [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md)#amend-1.` 추가.

### (j) 수행 7 `## 5` 형식

수행 7의 형식 블록을 6-2 (h)와 같은 형태로 바꾼다(`files:` 추가, `scope:` 유지).

### (k) 잔여 위임·연쇄 문장 sweep ★ (a)~(j)가 덮지 않는 3곳

| 위치 | 현재 | 변경 |
|---|---|---|
| 수행 2(회귀 테스트 선행)의 마지막 불릿 | `- **`scope: in-AC` 위임분은 여기서 하지 않는다** — 위임받은 `/repair-workitem`이 자기 규율로 수정과 테스트를 처리한다(중복 금지). **`scope: out-of-AC`로 본 skill이 직접 고치는 항목만** 대상이다. 위임분의 테스트를 본 skill이 쓰면 … `Needs Review`로 멈춘다.` | `- **`scope`와 무관하게 본 라운드가 고치는 전 항목이 대상이다** — 위임이 없으므로 «누가 테스트를 쓰는가»가 갈리지 않는다. 추가한 테스트는 통합 `validate`에 묶는다(ADR-068 D6).` |
| 수행 7 설명 문단 끝 | `` `in-AC` 항목의 결정 근거는 `/repair-workitem`이 그 task `## 8`에 남기므로 **여기에는 «T-NNN으로 위임함» 한 줄 routing 기록만** 둔다(중복 기록 금지 …). `` | `**`scope`와 무관하게 결정 전문을 여기에 적는다** — 위임이 없으므로 routing 기록이라는 것이 존재하지 않는다.` |
| 책임 경계 «자동 커밋하지 않는다» 불릿 | `「수행 후 연쇄」 ①의 `/finalize-workitem`이 커밋하지만 … commit owner는 «task 마감분 = finalize / 그 밖 전부 = 사용자»로 갈린다.` | `본 경로에는 `/finalize-workitem` 호출이 없으므로 **commit owner는 사용자 하나다.**` |

**확인**: 작업 후 아래가 빈 출력이어야 한다.
```bash
grep -n "수행 후 연쇄\|위임한다\|위임분\|위임받은\|(a')" .claude/skills/repair-acceptance/SKILL.md
```

### (l) ADR 정합 2곳 — 면제 2종 · pattern-scan 대상

| 위치 | 현재 | 변경 |
|---|---|---|
| 수행 2의 «면제» 불릿 | `- **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정. 면제 사유를 결정 이력에 적는다.` | `- **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정, 그리고 **문서만 고치는 finding**(실행 가능한 테스트 대상이 아니다 — ADR-068 D6이 양 repair skill 공통으로 규정한 면제 2종). 면제 사유를 결정 이력에 적는다.` |
| 수행 5 첫 문장 (위 (e-2) 적용분) | `각 Adopt 결함에 대해` | `**`Adopt`·`Adopt-modified`한 각 결함에 대해**` — ADR-066 D6 원문 정합 |

> 면제 2종은 ADR-068 D6이 «`/repair-milestone`·`/repair-acceptance`» 양쪽에 동일하게 건 규정이다. `/repair-milestone` 2-R에는 이미 둘 다 있으므로 본 항목은 비대칭 해소다.

## 6-4. `.claude/skills/accept-milestone/SKILL.md`

### (a) 다음 단계 안내에서 연쇄 서술 제거

**현재 (107행)**: `` - 판정 = 승인: **① `(수용)` 태그를 단 개선 항목이 1건 이상이면 먼저 `/repair-acceptance <M>`** — ... (코드를 고치므로 그 skill이 자기 루프 안에서 후속을 끝낸다 — **재개방한 `in-AC` task는 `/validate-workitem`+`/finalize-workitem`까지, 재개방하지 않은 `out-of-AC` 영향 task는 `/validate-workitem`만**. 그 task는 계속 `done`이라 마감할 것이 없다). → ... ``

**변경 — 괄호 안 설명을 아래로 교체**:
```
(코드를 고치므로 그 skill이 그 자리에서 회귀 테스트까지 끝낸다 — **task를 재개방하지 않으므로 사용자가 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다**)
```

### (b) 책임 경계 정정

**현재 (117행)**: `- **task를 재개방하지 않고 `/validate-workitem`·`/finalize-workitem`을 호출하지 않는다** — 본 skill은 receipt만 남기고 판정 갱신은 `/stabilize-milestone`이 한다.`

**변경**:
```markdown
- **task를 재개방하지 않고 `/validate-workitem`·`/finalize-workitem`을 호출하지 않는다** — 본 skill은 receipt만 남기고 판정 갱신은 `/stabilize-milestone`이 한다. **본 skill의 task `## 8` `- ac-acceptance` append는 폐쇄 후 task 문서 불가침의 예외 2종 중 하나다**(ADR-068 D1 — 나머지 하나는 repair 2종이 쓰는 `- invalidated`).
```

### (c) receipt 재validate 서술

**현재 (105행)**: `` - **receipt 처리 결과**: ... **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4 (a')가 채점표가 아니라 task `## 8`을 직접 읽기 때문이다(ADR-067 D1). ... ``

**변경**: `졸업 item 4 (a')가 ... (ADR-067 D1)` 부분을 `졸업 item 4가 task `## 8`을 직접 읽기 때문이다(ADR-068 D3)`로 바꾼다.

### (d) 나머지 ADR-067 인용 재지정

파일 전체의 `ADR-067 D1 item 4 (a')` → `ADR-068 D3 item 4`, `ADR-067 D3` → `ADR-068 D4`, `ADR-067 D6` → `ADR-068 D8`.

**그리고 `ADR-067` 토큰 없이 `(a')`만 남은 1곳**을 함께 고친다 — (a)가 교체하는 괄호 *바깥*, 같은 줄 맨 끝의 문장이라 (a)·(d) 어느 쪽에도 안 걸린다.

**현재 (「판정 = 승인」 줄 마지막 문장)**:
```
receipt 발급은 재validate를 요구하지 않는다(item 4 (a')가 task `## 8`을 직접 읽는다).
```
**변경**:
```
receipt 발급은 재validate를 요구하지 않는다(졸업 item 4가 task `## 8`을 직접 읽는다 — ADR-068 D3).
```

**확인**: 작업 후 `grep -n "(a')" .claude/skills/accept-milestone/SKILL.md`가 빈 출력이어야 한다.

## 6-5. `.claude/skills/plan-milestone/SKILL.md` — R0 아카이브 회전

### (a) R0에 회전 규칙 추가

**위치**: R0의 `- `docs/40-validation/IMPROVEMENT_GUIDE.md`·`docs/40-validation/QA_FINDINGS.md`의 *open* 항목 ...` 불릿(53행) **바로 뒤**.

**추가**:
```markdown
- **아카이브 회전 (ADR-068 D7-2)**: 직전 마일스톤의 회고 `graduation:`이 **`YES`일 때만** 수행한다(`YES`가 아니면 아무것도 옮기지 않는다).
  - 대상: `QA_FINDINGS.md`의 그 `## M-N` 블록에서 `status: resolved`인 항목 + `IMPROVEMENT_GUIDE.md` `## 2`·`## 4`의 그 `### M-N` 그룹에서 `status: resolved`인 항목 + `## 5. Repair decision log`의 그 `### M-N` 그룹 **전체**(closed records라 전량 대상).
  - **`status: open` 항목은 옮기지 않는다** — 활성 파일에 남아 carry-over가 된다.
  - 목적지: `docs/40-validation/archive/<M>.md`. 파일이 없으면 아래 골격으로 만든다.
    ```markdown
    # <M> 아카이브 (졸업: <YYYY-MM-DD>)

    ## QA_FINDINGS

    ## IMPROVEMENT_GUIDE
    ```
    `## 5` 그룹은 `## IMPROVEMENT_GUIDE` 절 아래 `### Repair decision log` 하위 절에 넣는다.
  - **순서 고정**: ① 아카이브 파일에 append → ② 원본에서 제거. 중단으로 양쪽에 남으면 다음 R0가 «아카이브에 이미 있는 ID를 원본에서 제거»로 정리한다.
  - **회고 포인터 갱신 (ADR-068 D7-2)**: 그 마일스톤 문서 `## 8. 회고`의 `post-close 수정:` 줄이 `IMPROVEMENT_GUIDE ## 5 ### M<N>`를 가리키고 있으면, 그 그룹이 아카이브로 옮겨졌으므로 포인터를 `docs/40-validation/archive/<M>.md`로 바꾼다. 그 줄이 `없음`이면 손대지 않는다.
  - 아카이브는 커밋 대상이다(gitignore 아님). 옮긴 항목 수를 R0 출력에 한 줄 남긴다.
```

### (b) ADR-067 인용 재지정

파일 안의 `ADR-067` 인용을 Phase 2-4 매핑표대로 처리한다.

> commit: `feat(skills): close the milestone layer — remove task reopening chains`

---

# Phase 7 — `/amend-ssot` 신규

## 7-1. `docs/90-decisions/boilerplate/ADR-069-bounded-ssot-amendment.md` 신규 생성

```markdown
# ADR-069 — 상위 정본의 절 단위 부분 개정 (Bounded SSOT Amendment)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] 확정된 상위 정본(DISCOVERY·Charter·ARCHITECTURE·DESIGN)의 **한 절을 고치는 데** `/discover-product --update` 또는 `/bootstrap-project --apply` 같은 재생성 skill을 돌려야 한다. 그 skill들은 9개 파일을 읽고 architect sub-call로 문서를 통째로 다시 만든다 — 한 줄 수정에 과도하다.
- [관측됨] 경량 경로가 문서상 존재하기는 한다(`docs/00-meta/DELEGATION_STRATEGY.md`의 Mid-project 문서 갱신 동선 — "자연어로 메인 세션에 변경 요청 → planner 위임"). 그러나 **멱등성·전파 검사·봉인 충돌 검사·잔여 액션 안내가 계약화되어 있지 않아** 안전한 공식 경로로 쓰이지 못한다.
- [관측됨] 상위 문서를 고쳐야 한다는 사실이 하위(구현·검증)에서 드러나는 경우, 처방이 «사용자 보고»에서 끊긴다 — 사용자가 다음에 무엇을 칠지 알 수 없다.
- [관측됨] 어떤 변경이 `/stack-guard` 재실행을 요구하는지가 어디에도 결정적으로 적혀 있지 않아 사람의 기억에 의존한다.

## 결정

### D1. `/amend-ssot` 신규 skill
확정된 정본의 **절 단위 부분 개정 + 결정적 파생 전파** 전용 skill을 둔다.

- **하지 않는 것**: 발굴 라운드·재생성·시안 협상. 빈 문서를 채우는 authoring도 하지 않는다.
- `disable-model-invocation: true` — **사용자 호출 전용.** 상위 문서 변경은 되돌리기 비용이 크고 authority가 사용자에게 있다(ADR-060 D2). 다른 skill·agent는 `Needs SSOT Amendment: <문서/절/근거>` 제안만 만들고 자동 적용하지 않는다.
- 기본 동작은 **적용**이며 `--dry-run`으로만 미리보기한다. 사용자가 호출한 것 자체가 적용 의도이므로 확정된 소규모 변경에 별도 승인 플래그를 요구하지 않는다.

### D2. 변경 분류 4단 + 적용 강도
| 분류 | 정의 | 동작 |
|---|---|---|
| editorial | 오탈자·표현·형식 | 즉시 적용 |
| local semantic | 한 절 안에서 의미가 바뀌지만 파생 문서 전파가 없음 | 즉시 적용 |
| cross-SSOT | 파생 문서 전파가 발생(D3 전파표에 걸림) | change-set 제시 → **in-session 확인 1회** → 적용 |
| foundation | D4 라우팅 목록에 해당 | **거부 + heavy skill 라우팅** |

`user-*` authority 결정(ADR-060 D2)은 분류와 무관하게 Decision Brief 6블록으로 확인한다 — 그 절차의 SSOT는 ADR-060 D3이며 본 ADR이 재서술하지 않는다.

### D3. 전파표 (결정적 — 본 ADR이 SSOT)
| 바뀐 것 | 함께 볼 곳 | 잔여 액션 |
|---|---|---|
| DISCOVERY `## 2` 페르소나 · `## 6` 시나리오 | Charter `## 2.1` · `## 3.1` | snapshot 갱신 (본 skill 수행) |
| DISCOVERY `## 10` · `## 12` 가정 | Charter `## 9` | snapshot 갱신 |
| DISCOVERY `## 15` 인사이트 | ROADMAP `## Backlog` | **권장 등재 행을 출력에 낸다 — 본 skill은 그 파일에 쓰지 않는다**(writer 3종 고정, D5) |
| Charter `## 5` 비목표 | 현재 M 범위 · ARCH `## 2` 경계 | **충돌 검사** — 충돌 시 D5 |
| Charter `## 7` 제약의 **배포 라이선스 줄** | README 2종 `## License`·`## Contributing` · `LICENSE` | 투영 갱신. **그 줄 외의 `## 7` 제약(기술·시간·인력)은 전파 대상이 아니다** — 라이선스는 법률 선택이고 나머지는 기술 제약이라 소비자가 다르다 |
| ARCH `## 7-1`~`## 7-5` | 산하 task `Architecture-Iface` 링크 | **읽기 검사만** (task 미수정) |
| ARCH 도구·명령 변경 | `STACK_SETUP_PLAN.md` · verify 스크립트 | **`/stack-guard` 재실행 필요** 명시 |
| DESIGN `## 2`~`## 10` (Colors·Typography·Layout·Elevation·Shapes·Components·Motion·Don'ts·Voice — 시각 계약 전 절) | 승인 프로토타입 · Design Gate Adapter | design gate 재실행 필요 여부 판정 |

**본 skill은 `/stack-guard`·design gate를 직접 실행하지 않는다** — 필요 여부만 판정해 잔여 액션으로 출력한다.

> DESIGN 행이 [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D6의 «계약 여섯 범위»에 든 `DESIGN.md` 항목(§2·§7·§9·§10)보다 넓은 이유: D6은 *이미 한 변경을 기존 계약으로 거꾸로 추적*하는 목록이고, 본 표는 *앞으로 할 변경이 무엇을 무효화하는가*를 판정한다. 승인 프로토타입은 타이포그래피·레이아웃·모션까지 구현하므로 그 절의 변경도 design gate 재실행 판정 대상이다. 두 목록의 목적이 다르므로 같을 필요가 없다.

### D4. 에스컬레이션 — 절-키 고정 열거
기준은 «위험한가»가 아니라 **«답을 아직 모르고 그것을 찾는 라운드가 필요한가»** 다. 위험 관리는 D2의 확인 절차와 D5의 충돌 검사가 담당한다.

| foundation 트리거 | 라우팅 |
|---|---|
| DISCOVERY `## 1` 문제 한 줄 · `## 2` 페르소나 **교체** (문구 수정이 아니라 대상 변경) | `/discover-product --update` |
| ARCH의 T2 카테고리 결정(언어·런타임·프레임워크·DB·영속성·인증·배포 토폴로지) | `/bootstrap-stack --migrate` |
| DESIGN 시각 방향 전환(원칙·팔레트 교체 — concept 시안 재탐색이 필요한 변경) | `/bootstrap-design --update` |
| Charter 문제 정의 자체의 전면 재정의 | `/bootstrap-project --apply` |

이 넷에 해당하지 않으면 본 skill이 처리한다. **절 개수는 판정 기준이 아니다** — 보고용 부차 신호로만 쓴다.

### D5. 봉인 충돌
change-set이 **봉인된 계약**에 영향을 주면 그 문서를 수정하지 않는다(ADR-060 D6/D7 보호). 봉인 여부는 **milestone 문서의 `## 10. 봉인 기록` `- 봉인일:` 채움**으로 판정한다 — 그 섹션은 milestone에만 있으므로 feature·task는 부모 milestone을 본다. 정본만 고치고 충돌 사실을 아래로 처리한다.
- 정본 한 절이 더 바뀌어야 성립 → `DECISION_REGISTER.md`에 본 skill이 등재.
- 다음 M 후보로 넘어감 → `ROADMAP.md`의 `## Backlog`가 제자리이나 **본 skill은 그 파일의 writer가 아니다**(ADR-057#amend-4가 writer를 3종으로 고정). 권장 등재 행을 출력에 내고 사용자·`/plan-milestone` R0가 반영한다.

### D6. 기존 경로와의 관계
`--update`·`--apply`·`--migrate`는 **작은 수정 모드가 아니라 «무거운 skill을 두 번째로 안전하게 돌리는 모드»** 다. 본 skill은 그것들의 축소판이 아니라 **다른 종류의 연산**이며, 기존 플래그는 전부 그대로 유지된다.

## 결과
- 상위 정본의 소규모 개정에 재생성 라운드가 불필요해진다.
- `/stack-guard`·design gate 재실행 필요 여부가 전파표로 결정된다.
- 하위에서 드러난 상위 문서 결함에 처방이 생긴다.

## 정책 강도 (ADR-022)
- **enabling(약)**: D1 skill 신설, D2 분류, D6 관계.
- **제약(약)**: D4 라우팅 목록, D5 봉인 충돌 금지.

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/amend-ssot/SKILL.md` 신규 / DELEGATION Mid-project 동선 / STRUCTURE 로스터·산출물 표 / README·README_ko 자연어 호출 목록 / implement-workitem 3-R 근본 충돌 처방 / stabilize 단계 8 다음 단계 / plan-milestone R0 회수 처방.
2. **Failure mode** — (a) 한 줄 수정에 재생성 skill을 돌림 (b) 전파 대상 문서가 갱신되지 않아 SSOT drift (c) `/stack-guard` 재실행을 잊음 (d) 하위에서 드러난 상위 결함의 처방 부재.
3. **Predicted improvement** — 정본 소규모 개정이 1회 호출로 끝나고, 잔여 액션이 출력에 열거된다.
4. **Preserved invariants** — 정본 소유권(각 bootstrap skill) / 봉인 잠금(ADR-060 D6/D7) / 원장 5종 배타 범위 / authority 판정 절차(ADR-060 D2·D3) / `disable-model-invocation`.
5. **Falsifying evaluation** — dogfood에서 (a) 본 skill 호출이 D4 라우팅으로 자주 튕겨 실사용이 안 되거나, (b) 전파표가 놓친 파생 문서 drift가 stabilize preflight에서 반복 검출되면 D3·D4를 재조정한다.
6. **Rollback path** — 본 ADR superseded + skill 제거 + 로스터·README 목록 원복. 기존 heavy skill 경로는 건드리지 않았으므로 되돌림에 부작용이 없다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/amend-ssot/SKILL.md          — D1~D5 전체
- docs/00-meta/DELEGATION_STRATEGY.md         — D6 Mid-project 동선 표
- docs/00-meta/STRUCTURE.md                   — Canonical Owner 행 + 원장 writer

> `README.md`·`README_ko.md`의 자연어 호출 skill 목록은 **로스터 부기**이지 본 ADR의 결정을 집행하는 surface가 아니므로 등재하지 않는다(등재 기준 정합). 등재하면 `/stabilize-milestone` §1.0 항목 2의 Surfaces forward check가 «본문에 `ADR-069` 역참조 없음»으로 `P1 [Surface-backref]`를 자기 발화한다. 두 README의 목록 갱신은 Phase 7-3에서 별도로 수행하고, 그 정합은 §1.0 항목 7의 로스터 검사가 담당한다.

## 참고
- ADR-005(SSOT·정본 소유권), ADR-035(DISCOVERY=SSOT / Charter=snapshot), ADR-055(스택 taxonomy T1/T2/T3), ADR-058(design workflow), ADR-060(authority·Decision Brief·봉인).
```

## 7-2. `.claude/skills/amend-ssot/SKILL.md` 신규 생성

```markdown
---
name: amend-ssot
description: 확정된 상위 정본(DISCOVERY·Charter·ARCHITECTURE·DESIGN)의 절 단위 부분 개정 + 파생 문서 전파. 발굴·재생성 라운드는 하지 않고 heavy skill로 라우팅한다.
argument-hint: "\"<변경 요청>\" [--from <출처>] [--dry-run]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
---

이 skill은 **이미 확정된 정본 문서의 부분 개정**만 한다. 빈 문서를 채우거나(authoring), 발굴·스택 결정·시안 라운드를 돌지 않는다 — 그것은 각 bootstrap skill 소유다.

**Codex**: 본 skill은 wrapper 미보유(자연어 호출) — "Follow `.claude/skills/amend-ssot/SKILL.md`"로 호출한다(목록 SSOT = README, ADR-010#amend-3).

입력:
- `$ARGUMENTS`의 따옴표 문자열 = 변경 요청(무엇을 어떻게 바꿀지).
- `--from <출처>` (선택) — 이 변경이 어디서 나왔는지. `사용자` / `T-NNN` / finding ID.
- `--dry-run` (선택) — change-set만 출력하고 파일을 쓰지 않는다.
- **기본 동작은 적용이다.** 사용자 호출 자체가 적용 의도이므로 별도 승인 플래그를 두지 않는다.

## A0. 변경 요청 정규화
자연어 요청을 «어느 정본의 어느 절이 어떻게 바뀌는가»의 change-set으로 바꾼다. **대상 정본은 넷뿐이다** — `docs/10-charter/DISCOVERY.md` · `docs/10-charter/PROJECT_CHARTER.md` · `docs/20-system/ARCHITECTURE_OVERVIEW.md` · `docs/20-system/DESIGN.md`.
- **ADR은 대상이 아니다.** `docs/90-decisions/**/ADR-*.md`의 개정은 amend vs supersede 임계([ADR-045](../../../docs/90-decisions/boilerplate/ADR-045-doc-reference-contract.md) D6)와 작성 주체·시점 트리거([ADR-000](../../../docs/90-decisions/boilerplate/ADR-000-boilerplate-decision-policy.md)#amend-2)가 별도로 규율하며, boilerplate ADR은 fork 후 read-only이고 project ADR로 supersede하는 경로가 정해져 있다. ADR 개정 요청을 받으면 그 경로를 안내하고 종료한다.
- 대상 절을 특정할 수 없으면 **추측하지 않고** 후보 2~3개를 제시해 사용자에게 묻는다.
- 대상 파일이 없으면(예: 비-UI 프로젝트의 DESIGN.md) 그 사실을 알리고 종료한다.

## A1. 분류 (ADR-069 D2)
change-set을 넷 중 하나로 분류한다.
- **editorial** — 오탈자·표현·형식.
- **local semantic** — 한 절 안에서 의미가 바뀌나 A3 전파표에 걸리지 않음.
- **cross-SSOT** — A3 전파표에 걸림.
- **foundation** — 아래 라우팅 목록에 해당 → **거부하고 종료**한다.

**foundation 라우팅 (ADR-069 D4 — 절-키 고정. 판단이 아니라 열거다)**
| 트리거 | 안내할 명령 |
|---|---|
| DISCOVERY `## 1` 문제 한 줄 · `## 2` 페르소나 **교체** | `/discover-product --update` |
| ARCH의 T2 카테고리 결정(언어·런타임·프레임워크·DB·영속성·인증·배포 토폴로지) | `/bootstrap-stack --migrate` |
| DESIGN 시각 방향 전환(원칙·팔레트 교체) | `/bootstrap-design --update` |
| Charter 문제 정의 전면 재정의 | `/bootstrap-project --apply` |

페르소나 «문구 수정»은 foundation이 아니다 — **대상 자체가 바뀌는 교체**만 해당한다. 애매하면 사용자에게 «이건 다시 발굴해야 하는 변경입니까»를 1회 묻는다.

## A2. authority 판정 (ADR-060 D2 — 절차 SSOT는 그 ADR)
- 제품 의도·범위·우선순위·사용자 체감·외부 계약·데이터/보안·비용·위험 허용도·비가역 약속 → `user-choice`
- 스택·인증·데이터 경계·되돌리기 비싼 구조 → `user-approval`
- 승인된 경계 안의 가역적 내부 선택 → `agent-delegated`

`user-*`면 Decision Brief 6블록으로 제시해 확인받는다(ADR-060 D3). 사용자가 이미 그 문장을 말한 경우에는 **재진술 확인 1회**로 갈음한다 — 없던 선택지를 만들어 되묻지 않는다.

## A3. 전파 계산 (ADR-069 D3 전파표 적용)
change-set의 각 대상 절을 전파표에 대입해 «함께 볼 곳»과 «잔여 액션»을 산출한다. 전파표는 ADR-069 D3가 SSOT이며 여기에 재서술하지 않는다 — 그 절을 읽고 그대로 적용한다.
- **`/stack-guard`·design gate는 직접 실행하지 않는다** — 필요 여부만 판정해 A7의 잔여 액션에 낸다.
- ARCH `## 7-x` 변경 시 산하 task의 `Architecture-Iface` 링크는 **읽기 검사만** 한다. task 문서를 수정하지 않는다.

## A4. 봉인 충돌 검사 (ADR-069 D5)
**봉인 여부는 milestone 문서로 판정한다** — `- 봉인일:`이 있는 `## 10. 봉인 기록`은 **milestone 문서에만** 존재한다(feature·task 문서에는 없다). 영향받는 workitem이 feature·task면 그 **부모 milestone**의 `## 0. Status`가 `ready`이고 `## 10`에 `- 봉인일:`이 채워졌는지를 본다.

- 봉인된 계약에 영향이 있으면 **그 workitem 문서를 수정하지 않는다.** 정본만 고치고, 충돌 사실을 아래로 처리한 뒤 출력에 명시한다.
  - **정본 문서의 한 절이 더 바뀌어야 성립** → `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `- 발견: 봉인 후 (M<N>)`으로 **본 skill이 등재한다**(ADR-060 D11 writer 계열 — STRUCTURE의 원장 writer 목록에 본 skill이 등재돼 있다).
  - **다음 마일스톤 문서 하나가 생기면 해소** → `docs/30-workitems/ROADMAP.md`의 `## Backlog`가 제자리다. **본 skill은 그 파일에 쓰지 않고 «권장 등재 행»을 출력에 낸다** — `## Backlog`의 writer는 `/accept-milestone`·`/repair-acceptance`(append)와 `/plan-milestone`(정리·승격)으로 고정돼 있고([ADR-057](../../../docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-4), 본 skill을 writer로 늘리지 않는다. 사용자가 그 행을 붙여 넣거나 다음 `/plan-milestone` R0가 회수한다.
  - **한 항목을 양쪽에 쓰지 않는다** (ADR-005#amend-1 비중복 불변식).

## A5. 적용
- `--dry-run`이면 change-set과 A3·A4 결과만 출력하고 **파일을 쓰지 않고 종료**한다.
- 분류가 **cross-SSOT**면 change-set(파일별 before/after 요약)을 제시하고 **in-session 확인 1회**를 받은 뒤 적용한다.
- **editorial·local semantic**은 확인 없이 적용한다.
- 적용 순서는 **정본 → 파생** 이다. 정본이 먼저 확정돼야 파생 갱신의 근거가 생긴다.
- 지명되지 않은 절을 함께 고치지 않는다. 인접 정리·재포맷 금지(ADR-006).

## A6. 결정 기록
A2에서 `user-*`로 판정해 사용자가 확정한 항목은 `docs/10-charter/DECISION_REGISTER.md`에 `status: closed` + `정본:` 앵커로 등재한다(이미 있으면 상태·앵커만 갱신 — 중복 등재 금지). **항목 형식·필수 필드의 SSOT는 그 파일 상단의 「항목 형식」 블록과 [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md)이며 여기 재서술하지 않는다** — 신규 등재면 `D-NNN`·`authority`·`disposition`·`질문:`·`영향:`을 그 형식대로 채운다(`closed` + `user-*`는 승인 근거 필수 — 불변식 2). `agent-delegated`는 개별 등재하지 않고 출력의 일괄 확인으로만 처리한다.

## A7. 마지막 출력
- 분류: editorial | local semantic | cross-SSOT | foundation(라우팅)
- 수정한 파일 + 절 목록 (before/after 1줄 요약)
- 전파 결과: 함께 갱신한 파생 문서 / 읽기 검사만 한 대상
- **잔여 액션** (해당 시): `/stack-guard` 재실행 필요 / design gate 재실행 필요 / `/bootstrap-design --update` 권장 등
- 봉인 충돌: 등재한 항목 (DECISION_REGISTER D-NNN) / **권장 등재 행 (ROADMAP `## Backlog` — 붙여 넣을 수 있는 완성된 한 줄. 본 skill이 쓰지 않는다)** / 없음
- **원장 요약**: `closed N건 / deferred M건 / open K건`
- **커밋 안내**: 본 skill은 커밋하지 않는다 — 수정 파일을 사용자가 직접 커밋한다.

책임 경계:
- 발굴·재생성·시안 라운드를 돌지 않는다. foundation 변경은 A1에서 거부한다.
- 봉인된 M/F/task 문서를 수정하지 않는다.
- 코드를 수정하지 않는다. `/stack-guard`·design gate를 실행하지 않는다.
- 커밋하지 않는다.

정책 근거: [ADR-069](../../../docs/90-decisions/boilerplate/ADR-069-bounded-ssot-amendment.md) D1~D6. authority·Decision Brief는 [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D2/D3. 정본 소유권은 [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md).

## Context 정책 (ADR-019)
A0에서 특정한 대상 절과 A3 전파표가 지목한 파일을 읽는다. **절차 수행에 필요한 아래 셋도 해당 단계에서 읽는다** — [ADR-069](../../../docs/90-decisions/boilerplate/ADR-069-bounded-ssot-amendment.md) D3 전파표(A3) · 부모 milestone의 `## 0. Status`와 `## 10. 봉인 기록`(A4) · `docs/10-charter/DECISION_REGISTER.md`(A4·A6 등재 — `영향:` 색인으로 관련 항목만). 그 밖의 사전 fork-load는 금지한다.
```

## 7-3. 로스터 3곳 갱신

### (a) `docs/00-meta/STRUCTURE.md` — Claude skill 본문 행

**현재 (40행)**: `| Claude skill 본문 | `.claude/skills/<name>/SKILL.md` (25종 — bootstrap-project/.../accept-milestone/repair-acceptance) | ...`

**변경**: `25종`을 `26종`으로 바꾸고 괄호 목록 맨 끝에 `/amend-ssot`를 추가한다.

### (b) `README.md` 두 곳

**119행** — `Remaining skills (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack)` → `Remaining skills (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack, amend-ssot)`

**126행** — `` For remaining skills (`discover-product`, `review-doc`, `boilerplate-context`, `bootstrap-design`, `research-pack`) `` → 끝에 `` , `amend-ssot` `` 추가

### (c) `README_ko.md` 두 곳

**118행**, **125행** — 위와 동일하게 목록 끝에 `amend-ssot`를 추가한다.

> 두 README의 목록은 서로 **정확히 일치**해야 한다. `/stabilize-milestone` §1.0 항목 7이 `(.claude/skills 집합) − (.agents/skills wrapper 집합)`과 대조해 불일치를 `P1 [Roster-drift]`로 잡는다.

### (d) `docs/90-decisions/boilerplate/README.md` — ADR-069 행 추가

068 행 아래에 삽입:
```
| 069 | 상위 정본의 절 단위 부분 개정 (Bounded SSOT Amendment) | accepted | — | /amend-ssot 신설 — 분류 4단 + 결정적 전파표 + 절-키 에스컬레이션 + 봉인 충돌 라우팅 |
```

### (e) `docs/00-meta/STRUCTURE.md` — 원장 writer 2곳에 amend-ssot 등재

본 skill이 `DECISION_REGISTER.md`에 쓰므로 원장 writer 목록에 반영해야 한다(미등재면 «누가 쓰는가»가 어긋난다).

**(e-1) 산출물 표의 `decision register` 행** — 생성 주체 칸 끝의 `— 정책 ADR-060` **앞**에 ` · /amend-ssot (정본 부분 개정 시 확정 결정 등재·봉인 충돌 등재 — ADR-069)`를 추가한다.

**(e-2) `### 원장 5종 배타 범위` 표의 `결정 원장` 행** — writer 칸이 `단일 writer 없음 — 발견한 skill이 등재, 닫는 것은 사용자`다. **변경하지 않는다** — 이미 «발견한 skill이 등재»로 열려 있어 amend-ssot가 그 안에 든다.

**(e-3) 같은 표의 `로드맵` 행** — **변경하지 않는다.** `## Backlog` writer는 3종으로 고정이며 amend-ssot는 그 파일에 쓰지 않는다(권장 행만 출력).

## 7-4. `docs/00-meta/DELEGATION_STRATEGY.md` — Mid-project 동선 표 교체

**먼저 표 바로 위 도입 문장을 고친다** — 표에 `/amend-ssot` 행이 들어오면 «별도 skill 없이»가 거짓이 된다.

**현재**: `charter/architecture는 Living Doc로 분류돼 진행 중 재진입이 필요하다. 별도 skill 없이 다음 경로를 따른다.`
**변경**: `charter/architecture는 Living Doc로 분류돼 진행 중 재진입이 필요하다. 갱신 종류에 따라 아래 경로를 따른다.`

**현재 (135~142행)**:
```markdown
| 갱신 종류 | 경로 |
|----------|------|
| charter 부분 갱신 | 자연어로 메인 세션에 변경 요청 → `planner` agent에 fork 위임 |
| charter 전면 재정의 | `/discover-product` 재실행(또는 산출물만 갱신) → `/bootstrap-project`로 charter 재생성 |
| architecture 스택 변경 (T2 — ...) | `/bootstrap-stack --migrate` ... |
| 라이브러리 몇 개 추가 (T3 — 토대 미변경) | ... |
| architecture 시스템 경계만 갱신 | 자연어 + `architect` 단발 호출 |
```

**변경**:
```markdown
| 갱신 종류 | 경로 |
|----------|------|
| **정본의 절 단위 부분 개정** (charter 한 절·ARCH 시스템 경계·DESIGN 토큰 등 — 답을 이미 알고 문장만 넣으면 되는 변경) | **`/amend-ssot "<변경>"`** — 분류·authority 판정·파생 전파·봉인 충돌 검사를 한 번에 수행 (ADR-069) |
| charter 전면 재정의 (문제 정의 자체가 바뀜) | `/discover-product --update` 재실행(또는 산출물만 갱신) → `/bootstrap-project --apply`로 charter 재생성 |
| 페르소나 교체·pain 재발굴 | `/discover-product --update` |
| architecture 스택 변경 (T2 — 언어/런타임/프레임워크/DB/인증 등 토대 변경, ADR-055) | `/bootstrap-stack --migrate` (타깃 미정이면 DEEP 라운드로 수렴) 후 `/stack-guard` 이어 실행 |
| 라이브러리 몇 개 추가 (T3 — 토대 미변경) | 해당 마일스톤의 `/plan-workitem M<N>`이 task `## 3` install line-item으로 처리 (ADR-040#amend-1). 누적이 T2 임계를 넘으면 stabilize `[Stack-drift]`가 ADR-101 갱신을 감지 |
| 시각 방향 전환 (concept 시안 재탐색 필요) | `/bootstrap-design --update` |

> 판별 기준은 «위험한가»가 아니라 **«답을 아직 모르고 그것을 찾는 라운드가 필요한가»** 다(ADR-069 D4). 위험 관리는 `/amend-ssot`의 authority 확인·전파 검사·봉인 충돌 검사가 담당한다.
```

**그리고 위임 표(`## 위임 트리거`)에 행 하나를 추가**한다:
```markdown
| 확정된 상위 정본의 절 단위 부분 개정 | 메인 세션 (amend-ssot) | `/amend-ssot "<변경>" [--from <출처>] [--dry-run]`. 사용자 호출 전용 — 다른 skill·agent는 `Needs SSOT Amendment: <문서/절/근거>` 제안만 만든다. 발굴·재생성 라운드는 하지 않고 foundation 변경은 heavy skill로 라우팅 (ADR-069) |
```

## 7-5. 제안 발화 지점 3곳 배선

### (a) `.claude/skills/implement-workitem/SKILL.md` — 3-R 근본 충돌 처방

**현재 (22행 안)**: `(2) **상위 기획·계약 자체가 틀림**(참조 프로토타입 경로 삭제·상위 `## 7`/INV 변경 등 계획 전제 붕괴): 그 task만 **중단하고 사용자에게 보고**(근본 충돌 — 자동 재계획하지 않음; §4.5b amend-3 결정 3, 변경은 다음 마일스톤).`

**변경 — 문장 끝에 추가**:
```
 보고 시 `Needs SSOT Amendment: <문서 §절> — <무엇이 어긋났는지 1줄>`을 함께 출력하고 처방으로 `/amend-ssot "<변경>"`을 안내한다(ADR-069 D1 — 자동 호출 금지, 사용자 발화 전용).
```

### (b) `.claude/skills/stabilize-milestone/SKILL.md` — §6.5 staleness 처방

**현재 (210행)**: `*"DISCOVERY ↔ Charter drift 의심 — /bootstrap-project --apply 또는 수동 갱신 권장."*`

**변경**:
```
*"DISCOVERY ↔ Charter drift 의심 — 절 단위 부분 갱신이면 `/amend-ssot`, 전면 재정의면 `/bootstrap-project --apply` 권장."*
```

### (c) `.claude/skills/plan-milestone/SKILL.md` — R0 회수 처방

R0의 open 항목 회수 불릿(53행) 끝에 추가:
```
 회수한 항목 중 «상위 정본의 한 절을 고치면 해소되는» 것은 `/amend-ssot "<변경>"`을 처방으로 함께 안내한다(ADR-069).
```

> commit: `feat(skills): add /amend-ssot for bounded SSOT amendments`

---

# Phase 8 — 메타 문서 정합

## 8-1. `docs/00-meta/WORKFLOW.md`

### (a) 33~34행 — 재검증 안내 교체

**현재**:
```markdown
> Note: validation report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore`된 **checkout-local 임시 파일**이다(커밋되지 않음). 따라서 `/validate-workitem`과 `/finalize-workitem`은 **같은 worktree/checkout**에서 연속 실행해야 한다 — 다른 worktree에서 나눠 실행하면 finalize가 report를 못 찾아 `Needs Validation`으로 종료한다.
> **새 체크아웃·다른 worktree에서 마일스톤을 재검증할 때**: 졸업 item 4의 **(a)(b)(c)(d)** 는 report를 읽으므로 report가 없으면 전 task가 그 항들에서 미충족으로 나온다(ADR-067 D1). ... 재검증 순서는 **① 각 task `/validate-workitem` 재실행(report 생성) → ② `/stabilize-milestone` 실행**이다. ...
```

**변경 — 두 번째 Note 줄 전체를 삭제하고 첫 줄만 남긴 뒤 아래를 추가**:
```markdown
> Note: validation report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore`된 **checkout-local 임시 파일**이다(커밋되지 않음). 따라서 `/validate-workitem`과 `/finalize-workitem`은 **같은 worktree/checkout**에서 연속 실행해야 한다 — 다른 worktree에서 나눠 실행하면 finalize가 report를 못 찾아 `Needs Validation`으로 종료한다.
> **졸업 판정은 report를 읽지 않는다** — `/finalize-workitem`이 task `## 8`에 남긴 `- closure` 줄(커밋됨)이 입력이다(ADR-068 D2). 새 체크아웃·다른 worktree에서도 재validate 없이 `/stabilize-milestone`만 실행하면 된다.
```

### (b) 단계 4 — 재개방 서술 정리

**현재 (35행)**: `- 검증 실패 시 `/repair-workitem`으로 report의 실패 항목을 수정한다.`

**변경 — 그 뒤에 한 줄 추가**:
```markdown
- **산하 task가 전부 `done`이 되면 그 마일스톤은 «마일스톤 층»이다** — 이후 task 문서·task status·validation report는 불변이며(**예외는 `## 8`의 AC receipt 2종** — `- ac-acceptance`·`- invalidated`), 네 inner-loop skill을 호출하지 않는다(ADR-068 D1). 수리는 `/repair-milestone`·`/repair-acceptance`가 직접 수행한다.
```

### (c) 5-1 수용 단계 — 재개방 서술 교체

**현재 (74행)**: `` 결함이 있으면 `/repair-acceptance <M>`이 3+1 판정으로 수리한다. ... **`in-AC`(추적 가능)면 `/repair-workitem`에 위임해 그 task를 재개방하고, `out-of-AC`(추적 불가)면 재개방 없이 직접 고친 뒤 ...** ... 재개방한 `in-AC` task는 `/validate-workitem` + `/finalize-workitem`까지, 재개방하지 않은 `out-of-AC` 영향 task는 `/validate-workitem`만 돈다 ... ``

**변경**:
```markdown
- 결함이 있으면 `/repair-acceptance <M>`이 3+1 판정으로 수리한다. 판별 질문은 «이 변경 줄을 기존 계약(AC·`## 3` line item·FAC·INV·승인 프로토타입·DESIGN)으로 거꾸로 추적할 수 있는가»이며, **그 답은 라우팅이 아니라 결정 이력의 `scope: in-AC | out-of-AC` 분류값**이다(ADR-066#amend-1). **어느 쪽이든 그 skill이 직접 고치고 task를 재개방하지 않는다** — `out-of-AC`면 계약 부채를 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 `status: open`으로 등재한다. **사용자가 손으로 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다.**
```

### (d) lifecycle 그림 교체

**현재 (108~116행)**:
```
   → implement → validate ─┬─Pass──────────────→ finalize → stabilize(+UI: 경험 게이트)
                           ├─Pending Acceptance→ finalize (## 8에 ac-pending 기록 — 마감을 막지 않는다)
                           └─Needs Fix─────────→ repair → (validate 재실행)
(opt-in, ADR-054) stabilize → validate-milestone (별 세션) → repair-milestone (원본 세션)
(ADR-066) stabilize ─┬─YES──────────────────→ 졸업 → plan-milestone (다음 M)
                     ├─PENDING_ACCEPTANCE──→ accept-milestone <M> ─┬─승인─→ stabilize 재실행 → 졸업
                     │                                             ├─보류─→ repair-acceptance (in-AC: validate+finalize / out-of-AC: validate) → accept-milestone 재실행
                     ├─NO──────────────────→ repair-milestone (in-AC: validate+finalize / out-of-AC: validate) → stabilize 재실행
                     └─BLOCKED─────────────→ 감사 미완: 그 축 재감사 / e2e blocked-on-env: 환경 복구 (repair 대상 아님 — ADR-067 D3) → stabilize 재실행
```

**변경**:
```
   → implement → validate ─┬─Pass──────────────→ finalize (## 8에 closure 기록) → 다음 task
                           ├─Pending Acceptance→ finalize (## 8에 closure + ac-pending)
                           └─Needs Fix─────────→ repair → (validate 재실행)
   ── 산하 전 task done ⇒ 여기부터 «마일스톤 층». task 문서·status·report 불변 (예외: ## 8의 AC receipt 2종 — ADR-068 D1) ──
   → stabilize(+UI: 경험 게이트)
(opt-in, ADR-054) stabilize → validate-milestone (별 세션) → repair-milestone (원본 세션)
(ADR-066) stabilize ─┬─YES──────────────────→ 졸업 → plan-milestone (다음 M)
                     ├─PENDING_ACCEPTANCE──→ accept-milestone <M> ─┬─승인─→ stabilize 재실행 → 졸업
                     │                                             ├─보류─→ repair-acceptance (직접 수정 — 재개방 없음) → accept-milestone 재실행
                     ├─NO──────────────────→ repair-milestone (직접 수정 — 재개방 없음) → stabilize 재실행
                     └─BLOCKED─────────────→ 감사 미완: 그 축 재감사 / e2e blocked-on-env: 환경 복구 (repair 대상 아님 — ADR-068 D4) → stabilize 재실행
```

### (e) 문서 상태 전이 — `done → in-progress` 삭제

역전이는 **삭제하지 않는다 — 조건을 붙인다.** 폐쇄 전 task 층의 재개방은 유효하고(`/implement-workitem` 3-R (1)이 그 경로를 명시 지시한다), 폐지된 것은 폐쇄 후의 재개방뿐이다.

**현재 (147행, 상태 전이 그림)**:
```
done → in-progress (검증된 완료 결함을 repair-workitem이 재개방할 때만 — ADR-057#amend-3 결정 5)
```
**변경**:
```
done → in-progress (검증된 완료 결함 — **폐쇄 전 task 층에서만.** repair-workitem 단독 writer. ADR-068 D1)
```

**현재 (159행, 전이 표)**:
```
| done → in-progress | 검증된 완료 결함 — `/repair-workitem`이 4-판정에서 Adopt/Adopt-modified 시에만 재개방(writer: repair-workitem 한정, ADR-057#amend-3 결정 5) |
```
**변경**:
```
| done → in-progress | 검증된 완료 결함 — `/repair-workitem`이 4-판정에서 Adopt/Adopt-modified 시에만 재개방(writer: repair-workitem 한정). **산하 task가 전부 `done`인 마일스톤에서는 불가**(ADR-068 D1이 ADR-057#amend-3 결정 5를 부분 supersede) |
```

**그리고 표 아래에 한 줄 추가**:
```markdown
> 산하 전 task가 `done`이 되면 그 마일스톤은 «마일스톤 층»이고 위 역전이가 닫힌다 — 그 뒤의 결함은 `/repair-milestone`·`/repair-acceptance`가 재개방 없이 직접 고친다 (ADR-068 D1).
```

### (f) `## 5. 마일스톤 안정화` — 후속 경로 교체

**현재 (63행)**: `- 후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 연결.`

**변경**:
```markdown
- 후속 작업이 필요하면 `/repair-milestone <M>`으로 연결한다. **task 재개방·새 task 자동 추가는 하지 않는다** (ADR-068 D1 / ADR-057#amend-3 결정 6).
```

### (g) Mid-project 갱신 동선 링크 문장

**현재 (179행)**: `charter/architecture/스택 관련 mid-project 갱신 경로는 [DELEGATION_STRATEGY.md — Mid-project 문서 갱신 동선](DELEGATION_STRATEGY.md#delegation-midproject)을 참조한다.`

**변경 — 문장 끝에 추가**: ` 정본의 절 단위 부분 개정은 `/amend-ssot`가 담당한다 (ADR-069).`

### (h) 남은 ADR-067 인용 3곳 재지정

(a)~(g)가 덮지 않는 줄이다. 각각 문자열로 찾아 고친다.

| 위치 | 현재 | 변경 |
|---|---|---|
| `## 5-1` 첫 불릿 | `그 receipt 없이 졸업 item 4 (a')를 충족하지 못하므로(ADR-065 D1 / ADR-067 D1)` | `그 receipt 없이 졸업 item 4를 충족하지 못하므로(ADR-065 D1 / ADR-068 D3)` |
| `## 5-1` 둘째 불릿 끝 | `그 상태의 graduation이 `PENDING_ACCEPTANCE`다(ADR-067 D3)` | `그 상태의 graduation이 `PENDING_ACCEPTANCE`다(ADR-068 D4)` |
| `## 5-1`의 receipt 불릿 | **불릿 전체**: `` - **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4 (a')가 채점표가 아니라 task `## 8`을 직접 읽는다(ADR-067 D1). **재validate가 필요한 것은 «코드가 바뀐 task»뿐이다.** `` | `` - **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4가 채점표가 아니라 task `## 8`을 직접 읽는다(ADR-068 D3). **코드가 바뀌어도 per-task 재validate를 하지 않는다** — 수용 라운드의 수리는 이미 마일스톤 층이므로, 검증은 `/repair-acceptance` 5-V의 넷(회귀 테스트 Green·교차 task `## 6-1` 매핑 실행·경계 smoke·`validate --changed`)과 다음 `/stabilize-milestone`의 통합 validate·e2e가 담당한다(ADR-068 D6). `` — **인용 번호만 바꾸면 안 된다**: 꼬리 문장이 per-task 재validate를 지시해 바로 다음 불릿(«사용자가 손으로 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다»)과 정면 충돌한다 |

> `## 5-1`의 lifecycle 그림 안 `ADR-067 D3`은 (d)의 그림 교체가 이미 처리한다.

## 8-2. `docs/00-meta/STRUCTURE.md`

### (a) 산출물 표 — 아카이브 행 추가

`| qa findings | ... |` 행 **뒤**에 삽입:
```
| 원장 아카이브 (졸업 마일스톤의 닫힌 항목) | `docs/40-validation/archive/<M>.md` | `/plan-milestone` R0 (ADR-068 D7-2) | Record | generated |
```

### (b) 산출물 표 — validation report 행 주석

`| validation report | ... | ephemeral | generated |` 행의 생성 주체 칸 끝에 ` (졸업 판정의 입력이 아니다 — ADR-068 D2)`를 추가한다.

### (c) Canonical Owner 표 — graduation 행 교체

**현재**: `| Milestone graduation checklist 5+1 | [ADR-067](...) (정책 SSOT — 구 계약 통합 재발행). → ADR-067 `## Surfaces` 참조. |`

**변경**:
```
| Milestone graduation checklist 5+1 + 마일스톤 층 폐쇄 경계 | [ADR-068](../90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) (정책 SSOT — ADR-067 통합 재발행. 현재 SSOT: ADR-068). → ADR-068 `## Surfaces` 참조. |
```
> 괄호 안 끝의 `현재 SSOT: ADR-068`은 **검사 제외 마커**다(2-3(d)의 014 행과 같은 이유) — 이 칸은 supersede 계보라 `ADR-067` 문자열이 남는데, 마커가 없으면 **Phase 10 check #1이 이 한 줄 때문에 끝까지 통과하지 못한다.** Phase 8이 `ADR-067` sweep의 마지막 구간이므로 여기서 반드시 붙인다.

### (d) Canonical Owner 표 — amend-ssot 행 추가

```
| 정본의 절 단위 부분 개정 + 파생 전파 (전파표·에스컬레이션·봉인 충돌) | [ADR-069](../90-decisions/boilerplate/ADR-069-bounded-ssot-amendment.md) (정책 SSOT). → ADR-069 `## Surfaces` 참조. |
```

### (e) skill 로스터 — Phase 7-3 (a)에서 이미 처리

## 8-3. `docs/00-meta/DELEGATION_STRATEGY.md` — 실행 순서

### (a) 8·8.5·8.6·8.7 교체

**현재 (117~121행)** — 그 다섯 항목을 아래로 교체한다.

```markdown
8. 마일스톤의 모든 task가 `done`이 되면 **그 마일스톤은 «마일스톤 층»이다** — task 문서·task status·validation report는 불변이고(**예외는 `## 8`의 AC receipt 2종** — `- ac-acceptance`·`- invalidated`) 네 inner-loop skill을 호출하지 않는다(ADR-068 D1). `/stabilize-milestone`으로 통합 점검(코드 수정·커밋·status 변경 금지).
   - `/stabilize-milestone`은 evaluator-optimizer pattern의 evaluator orchestration이다 (ADR-068 D8) — generator=`/implement-workitem`, optimizer=`/repair-milestone`.
8.5. `/accept-milestone M-N` — 사람이 직접 실행·확인. **8의 graduation이 `PENDING_ACCEPTANCE`면 이 단계가 유일한 처방이고, `YES`면 선택이다** (ADR-068 D4/D8). 승인 시 8.7로(단 `(수용)` 태그로 이번 M 수리를 택한 개선 제안이 있으면 8.6을 먼저 — ADR-066 D5), 보류 시 8.6으로, `미완`이면 환경 복구·사용자 재개 후 8.5 재실행(라운드 카운터 미소모).
8.6. (보류 시 · 또는 위 `(수용)` 개선 항목이 있을 때) `/repair-acceptance M-N` → **재개방 없이 직접 고치고 회귀 테스트(Red→Green)를 통합 `validate`에 묶는다**(ADR-068 D6). `- invalidated`가 있으면 `/accept-milestone M-N` 재실행. 라운드 상한 3.
8.7. `/stabilize-milestone M-N` 재실행 — 수리·receipt 변경을 재검증하고 졸업 판정을 확정한다. **사용자가 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다** (ADR-068 D1).
```

### (b) 위임 표 두 행 교체

- `stabilize cross-review 결과 회수 + 종합` 행의 `**per-task 결함은 `/repair-workitem`에 위임하고, 그 뒤 `/validate-workitem`·`/finalize-workitem`까지 자기 루프에서 실행해 재개방 루프를 닫는다**(ADR-057#amend-3 결정 5).` → `**per-task 결함도 직접 고친다 — 재개방하지 않는다**(ADR-068 D1). 추적은 `IMPROVEMENT_GUIDE ## 5`의 `affected`·`files`·`scope` 세 필드가 담당한다.`
- `사용자 수용 finding 수리` 행의 `**in-AC는 `/repair-workitem` 위임(재개방) / out-of-AC는 직접 수정 + 계약 부채 등재**, 수정 뒤 후속 연쇄를 자기 루프에서 실행(...)` → `**scope와 무관하게 직접 수정**(재개방 없음 — ADR-068 D1). `out-of-AC`는 계약 부채 등재. 후속 연쇄 없음.`

### (c) 남은 ADR-067 인용 3곳 재지정

(a)가 실행 순서 8~8.7을 통째로 교체하므로 그 구간의 인용은 함께 처리된다. 남는 것은 **위임 표 2행 + 실행 순서 5.5** 셋이다.

| 위치 | 현재 | 변경 |
|---|---|---|
| 위임 표 «마일스톤 결과의 사용자 직접 확인» 행 | `미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-067 D3)` | `미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-068 D4)` |
| 위임 표 «task AC의 사용자·플랫폼 관측 receipt 발급» 행 | `(ADR-065 D1/D6 · ADR-066 D1 · ADR-067 D1)` | `(ADR-065 D1/D6 · ADR-066 D1 · ADR-068 D3)` |
| 실행 순서 5.5 | `미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-066 D1 / ADR-067 D1 item 4 (a'))` | `미발급 상태는 졸업 `PENDING_ACCEPTANCE`가 잡는다 (ADR-066 D1 / ADR-068 D3 item 4)` |

## 8-4. `AGENTS.md` — 1줄 추가

**위치**: `## 깊은 운영 원칙은 다음 문서를 따른다` 목록의 `- [기획 결정 마감 + 마일스톤 봉인](...)` 줄 **뒤**.

**추가**:
```markdown
- [마일스톤 층 폐쇄 경계 + 졸업 계약](docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) (산하 전 task done ⇒ task 문서·status·report 불변 — 예외는 `## 8`의 AC receipt 2종, 재개방 없음)
```

> 100줄 hard cap을 지킨다 — 현재 56줄이므로 여유가 있다.

## 8-5. 나머지 skill·agent의 ADR-067 인용

아래 파일에서 `ADR-067`을 Phase 2-4 매핑표대로 처리한다.
```
.claude/skills/stack-guard/SKILL.md
.claude/skills/validate-plan/SKILL.md
.claude/skills/plan-workitem/SKILL.md
.claude/agents/reviewer.md
```
`[MP-graduation]` 항목은 **번호 재지정만** 하면 된다 — 두 파일 모두 `graduation 5+1(ADR-067)` 형태로만 참조하고 개별 졸업 항목 이름을 담고 있지 않다(그 이름은 MILESTONE_TEMPLATE에 있고 Phase 4-2가 이미 처리했다).

| 파일 | 현재 | 변경 |
|---|---|---|
| `.claude/skills/validate-plan/SKILL.md` | `graduation 5+1(ADR-067) 정합` | `graduation 5+1(ADR-068) 정합` |
| `.claude/agents/reviewer.md` | `graduation 5+1(ADR-067) + e2e 선언(ADR-052)` | `graduation 5+1(ADR-068) + e2e 선언(ADR-052)` |

> commit: `docs(meta): propagate closure boundary to workflow, structure, and delegation`

---

# Phase 9 — enabling 개선

## 9-1. CI 기본값 뒤집기

### (a) `.claude/skills/stack-guard/SKILL.md` — CI 권장 출력 절 교체

**현재 (339행)**:
```markdown
## CI 권장 출력 (ADR-025)
`.github/workflows/validate.yml` 형식 권장 텍스트를 출력한다. **스택 확정 후엔 출력에 그치지 말고 opt-in 파일 생성을 제안**한다 — 사용자가 명시 승인할 때만 `.github/workflows/validate.yml`을 생성(미승인 시 텍스트만; GUARDRAILS "강제 X" 정신). ...
```

**변경 — 첫 두 문장을 아래로 교체**(뒤의 hook 안내 문장은 그대로 둔다):
```markdown
## CI 생성 (ADR-025#amend-1)
**아래 두 조건이 모두 참이면 `.github/workflows/validate.yml`을 기본 생성한다** — (i) git remote가 GitHub이고(`git remote -v`로 확인), (ii) 스택 판정이 끝나 통합 `validate` 명령이 존재한다. 생성 사실과 파일 경로를 출력에 명시하고, `docs/00-meta/STACK_SETUP_PLAN.md`에 `CI: generated (.github/workflows/validate.yml)` 한 줄을 기록한다.
- **`--no-ci` 플래그가 있으면 생성하지 않고** `CI: opt-out (사용자 지정)`을 기록한다.
- 위 두 조건 중 하나라도 거짓이면(GitHub 아님·스택 미정) 생성하지 않고 **형식 권장 텍스트만** 출력하며 `CI: n/a (<사유>)`를 기록한다.
- **이미 `.github/workflows/validate.yml`이 있으면 덮어쓰지 않는다** — `CI: existing (preserved)`를 기록하고 커버리지 부족만 출력에 보고한다(`## 재실행 계약` 정합). brownfield 첫 실행의 정상 결과이며 `generated`·`n/a` 어느 쪽으로도 적지 않는다.
- **생성하는 YAML은 fresh runner에서 실제로 도는 것이어야 한다.** checkout 뒤 곧바로 `validate`만 부르면 런타임·의존성이 없어 실패한다. 감지한 스택에 맞춰 아래 3단계를 반드시 포함한다 — ① 런타임 setup(`actions/setup-node@v4` + `node-version` / `actions/setup-python@v5` / `actions/setup-go@v5` / `subosito/flutter-action@v2` 등 1종), ② 의존성 설치(수행-6-2와 같은 명령 — lockfile 있으면 frozen), ③ 통합 `validate` 실행. **e2e는 기본 워크플로에 넣지 않는다**(브라우저·device 프로비저닝이 필요해 실패 소음이 된다 — 별도 워크플로는 사용자 결정).
```

**frontmatter의 `argument-hint`**에 `[--no-ci]`를 추가하고, **입력 절에도 한 줄 등재한다** — 입력 절이 «`$ARGUMENTS`가 있으면 스택 요약을 받아 사용한다»뿐이라 플래그만 넘기면 스택 요약으로 오해될 수 있다(`/discover-product`가 `--fast`를 입력 절에 열거하는 것과 동형).

**추가 위치**: 입력 절의 `- 비어 있으면 …스택을 추정한다.` 줄 뒤.
```markdown
- `--no-ci` 플래그가 있으면 CI workflow를 생성하지 않는다(`## CI 생성` 절 참조). **플래그는 스택 요약으로 해석하지 않는다** — 플래그만 넘어오면 스택 추정은 위 규칙을 따른다.
```

★ **같은 절의 예시 YAML 블록과 그 아래 «권장만» 문장도 함께 고친다** — 위 산문이 «3단계를 반드시 포함»을 요구하는데 바로 아래 예시가 `checkout` + `validate` 2단계로 남으면, 에이전트는 산문보다 옆의 예시를 복사해 **fresh runner에서 깨지는 CI**를 만든다. 9-1(c)의 템플릿 예시와 같은 형태로 맞춘다.

**현재**:
```yaml
    steps:
      - uses: actions/checkout@v4
      - run: <stack의 validate 명령>
```
그 아래: `GUARDRAILS_STRATEGY *"OS/셸 종속 hook 강제 X"* 정신 — 권장만.`

**변경**:
```yaml
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4  # 스택에 맞는 런타임 setup (setup-python/setup-go/flutter-action 등 1종)
        with:
          node-version: <버전>
      - run: <의존성 설치 명령>
      - run: <stack의 validate 명령>
```
그 아래: `GUARDRAILS_STRATEGY *"OS/셸 종속 hook 강제 X"* 정신 — **로컬 PostToolUse hook은 언제나 권장만**이고, 위 CI 파일은 조건 충족 시 기본 생성한다(ADR-025#amend-1).`

### (b) `docs/90-decisions/boilerplate/ADR-025-external-deps-and-ci-recommendation.md` — Amendment 추가

파일 끝에 append:
```markdown

<a id="adr-025-amend-1"></a>
## Amendment 1 (<적용일 YYYY-MM-DD>) — CI workflow 기본 생성 (환경 판정 시)

### 배경
- [관측됨] agentic coding에서 로컬 `validate`를 실행하는 주체가 에이전트 자신이다. CI는 그 판정의 **독립 재실행**이 일어나는 유일한 자리이며, 이는 ADR-063(검증 장치의 실측 검증) 정신과 정합한다.
- 결정 2의 «권장 텍스트만 출력»은 환경을 알 수 없던 시점의 보수적 기본값이었다. `/stack-guard`는 스택과 git remote를 실측하므로 환경을 안다.

### 결정
- 결정 2를 다음으로 대체한다: **git remote가 GitHub이고 스택 판정이 끝났으면 `.github/workflows/validate.yml`을 기본 생성**하고, `--no-ci`로만 opt-out한다. 선택 결과를 `STACK_SETUP_PLAN.md`에 기록한다.
- 두 조건 중 하나라도 거짓이면 기존대로 권장 텍스트만 출력한다 — **환경을 모르는 곳에 파일을 만들지 않는다**(GUARDRAILS "환경 종속 hook 강제 X" 정합).
- 기존 파일은 덮어쓰지 않는다.

### 강도 (ADR-022)
- enabling(약) — 기본값 방향 전환이며 차단은 없다.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md
```

`docs/90-decisions/boilerplate/README.md`의 025 행 Amendments 칸에 `(+#amend-1: CI 기본 생성 — 환경 판정 시)`를 적고, **같은 행의 요약 칸도 현재 정책으로 갱신한다** — 요약이 «CI 권장, 강제 X»로 남으면 index-first recall에서 기본 생성 전환을 놓친다(ADR-038·052 행의 선례와 동형).

**변경 후 요약 칸**: `bootstrap-stack 외부 의존 출력 + stack-guard CI — #amend-1이 «권장만»을 **«GitHub remote + 스택 확정 시 기본 생성»**(`--no-ci` opt-out, 기존 파일 보존)으로 전환. 로컬 hook은 권장만`

### (c) `docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md` — 절 제목·문구 정합

**현재 (`## CI 권장 출력 (ADR-025)` 절)**: 「파일 자동 생성 X」 취지의 문구가 남아 있다.

**변경**: 절 제목을 `## CI (ADR-025#amend-1)`로 바꾸고, 그 아래에 상태 줄 1개를 둔다(값은 `/stack-guard`가 채운다).
```markdown
## CI (ADR-025#amend-1)
- CI: <generated (.github/workflows/validate.yml) | existing (preserved) | opt-out (사용자 지정) | n/a (<사유>)>
<!-- git remote가 GitHub이고 스택이 확정되면 /stack-guard 가 기본 생성한다. --no-ci 로 opt-out.
     기존 파일은 덮어쓰지 않고 `existing (preserved)`로 기록한다. 생성 YAML은 런타임 setup → 의존성 설치 → 통합 validate 3단계를 포함한다. -->
```
기존 예시 YAML 블록은 남겨 두되 「권장」 문구를 「생성 형식」으로 바꾸고, 위 3단계를 반영한다.

**그리고 ADR-025 Amendment 1의 `### 적용 surface`에 이 파일을 추가**한다:
```
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md
```

## 9-2. AC 검증 레벨 태그 (관측 전용)

### (a) `docs/30-workitems/_templates/TASK_TEMPLATE.md` — `## 6-1` 주석에 추가

modality 설명 불릿 목록 **뒤**에 추가:
```
     **검증 레벨 태그 (선택 — 관측 전용, `[자동 테스트]` AC에만)**: modality 뒤에 `{unit|integration|contract|e2e}`를 붙일 수 있다.
     예: `- AC-1 [자동 테스트]{integration} → jest::tests/api/session.spec.ts::test_AC_1_...`
     미기재 시 validate가 테스트 경로로 추론한다(`e2e/`→e2e, `tests/integration/`→integration, 그 외→unit).
     **관측 2종(`[사용자 관측]`·`[플랫폼 관측]`)과 `[산출물 검사]`는 테스트 경로가 없어 이 축의 대상이 아니다** — 경로 추론을 적용하지 않고 분포에서 `비자동`으로만 센다.
     **차단하지 않는다** — report와 stabilize telemetry에 분포만 집계한다. 경계(외부 API·DB)를 넘는 AC가
     unit으로만 덮여 있으면 그 사실이 수치로 보이게 하는 것이 목적이다.
```

### (b) `.claude/skills/validate-workitem/SKILL.md` — report 양식에 한 줄

`## AC ↔ 검증 매핑` 양식의 `- **충족률: ... · 자동화율: ...**` 줄 **뒤**에 추가:
```
- **검증 레벨 분포: unit N / integration M / contract K / e2e L · 비자동 P** — **`[자동 테스트]` AC만 레벨 분포 대상**(명시 `{레벨}` 태그 우선, 미기재는 테스트 경로 추론). 관측 2종·`[산출물 검사]`는 테스트 경로가 없어 `비자동`으로만 센다 (기록 등급)
```

### (c) `.claude/skills/stabilize-milestone/SKILL.md` — 7-T 집계 항목 추가

집계 항목 목록의 `- AC↔검증 매핑: ...` 줄 뒤에 추가:
```
- AC 검증 레벨 분포: unit N / integration M / contract K / e2e L · 비자동 P  (`[자동 테스트]` AC만 레벨 대상 — 출처: task `## 6-1`)
```
그리고 출력 형식 예시 블록에도 같은 줄을 추가한다 — **예시 숫자는 바로 위 `AC↔검증 매핑` 줄의 충족/전체·자동화율과 산술이 맞아야 한다**(예: 전체 36 · 자동화율 88.9% → 자동 32 = `unit 20 / integration 9 / contract 2 / e2e 1`, `비자동 4`).

**그리고 수집 소스에 한 줄을 추가한다** — 7-T 수집 소스는 채점표(ephemeral)와 6-1(k)가 넣은 `- closure` fallback뿐인데, closure에는 `기계AC`·`자동화율`만 있고 레벨 분포가 없다. 새 체크아웃에서 이 지표를 산출할 근거가 사라지므로 커밋된 task `## 6-1`을 출처로 명시한다.

**위치**: 수집 소스의 `- 본 마일스톤 산하 feature의 `## 7-1. FAC ↔ AC 매핑표`.` 줄 **앞**.
```markdown
- **검증 레벨 분포는 산하 task의 `## 6-1`에서 직접 집계한다** — 채점표에도 `- closure`에도 그 값이 없으므로(closure는 `기계AC`·`자동화율`만 담는다) 커밋된 `## 6-1`이 유일한 항구 출처다. 판정 규칙은 `/validate-workitem`과 같다(**`[자동 테스트]` AC만 레벨 대상**, 명시 `{레벨}` 태그 우선, 미기재는 테스트 경로 추론, 나머지는 `비자동`).
```

> commit: `feat: default CI workflow generation and AC verification-level annotation`

---

# Phase 10 — 최종 검증

**«전부 빈 출력»이 아니다 — 검사마다 기대값이 다르다.** 각 검사에 적힌 기대값을 그대로 읽는다.

명령은 **Git Bash(POSIX)** 기준이다. 모든 재귀 grep에 `--exclude-dir=.git --exclude=IMPROVE-GUIDE.md`를 붙인다 — 이 가이드에는 «현재» 원문이 인용돼 있어 제외하지 않으면 모든 검사가 오염된다.

### 1. ADR-067 잔존 인용 — 기대: **빈 출력**
```bash
grep -rn "ADR-067" --include="*.md" --exclude-dir=.git --exclude=IMPROVE-GUIDE.md . \
  | grep -v "^\./docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2\.md:" \
  | grep -v "^\./docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3\.md:" \
  | grep -v "현재 SSOT: ADR-068"
```
> **필터 주의**: `grep -v "ADR-067-milestone-graduation-v2.md:"` 처럼 *파일명 문자열*로 거르면 링크형 인용 `[ADR-067](…/ADR-067-milestone-graduation-v2.md)` 이 든 줄까지 함께 걸러져 **재지정 누락이 조용히 통과한다.** 반드시 `^\./경로:` 로 «그 파일의 줄»만 걸러야 한다.
> **두 파일을 경로로 제외하는 이유**: superseded ADR(067)의 자기 파일은 역사 기록이고, superseding ADR(068)의 자기 파일은 supersede 계보 서술이다(`## 대체`·D3·D4·D5·Rollback path 등 11곳 — 1-1 전문 그대로이며 고치면 안 된다. 그 줄들은 `(현재 SSOT: 본 ADR)` 형식이라 마커 필터에 안 걸린다). **이 둘 외의 정당한 잔존은 전부 줄 단위 마커(`(현재 SSOT: ADR-068)`)로 처리한다** — 파일 단위 제외를 더 늘리면 재지정 누락이 숨는다.

### 2. 마일스톤 층의 위임 잔재 — 기대: **빈 출력**
「재개방」이라는 낱말은 금지·부분폐지 서술로 정당하게 남으므로 세지 않는다. **위임을 실제로 지시하는 구조물**만 본다.
```bash
grep -n "2-C\|수행 후 연쇄\|repair-workitem <T-NNN>\|repair-workitem <\|위임한다" \
  .claude/skills/repair-milestone/SKILL.md \
  .claude/skills/repair-acceptance/SKILL.md
```

### 3. 마일스톤 층 skill의 inline 호출 서술 — 기대: **남는 줄이 전부 부정문**
```bash
grep -n "repair-workitem\|validate-workitem\|finalize-workitem" \
  .claude/skills/repair-milestone/SKILL.md \
  .claude/skills/repair-acceptance/SKILL.md \
  .claude/skills/accept-milestone/SKILL.md \
  .claude/skills/stabilize-milestone/SKILL.md
```
→ 출력된 줄을 눈으로 확인한다. 「호출하지 않는다 / 없다 / 권장하지 않는다」 문맥만 남아야 하고, 위임·연쇄 **지시**가 남아 있으면 안 된다.

### 4. 폐지한 두 플래그 — 기대: **빈 출력**
```bash
grep -n -e "--dry-run" -e "--feature" \
  .claude/skills/stabilize-milestone/SKILL.md \
  .agents/skills/stabilize-milestone/SKILL.md
```
> `-e`를 쓰는 이유: `grep -- "--dry-run" --include="*.md"` 처럼 `--` 뒤에 옵션을 두면 `--include=…`가 **파일명으로 해석돼 명령이 깨진다.**
> 저장소 전체에는 `--dry-run`·`--feature`가 정당하게 남는다 — `amend-ssot`의 `--dry-run`, ADR-014·ADR-067(역사·superseded), ADR-057 결정 6과 부분 supersede 노트, ADR-056, SIMULATION_RUN(실행 기록). 그래서 전체 grep이 아니라 **위 두 파일**만 본다.

### 5. 고아 status 필드 — 기대: **빈 출력**
```bash
grep -n "^## 0. Status" \
  docs/10-charter/PROJECT_CHARTER.md \
  docs/20-system/ARCHITECTURE_OVERVIEW.md \
  docs/10-charter/_templates/DISCOVERY_TEMPLATE.md
```
> `docs/20-system/DESIGN.md`는 **남아 있어야 한다**(writer·reader 모두 존재) — 대상에 넣지 않는다.

### 6. 폐지한 원장 섹션 참조 — 기대: **2줄** (결번 주석 + ADR-068 폐지 선언)
```bash
grep -rn "즉시 수정할 항목\|권장 리팩토링" --include="*.md" --exclude-dir=.git --exclude=IMPROVE-GUIDE.md .
```
→ **2줄만** 남아야 한다 — ① `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 3` 결번 주석, ② `ADR-068` D7-1의 폐지 선언(절을 폐지한다고 쓰려면 그 이름을 불러야 하므로 **제거 불가**). skill 5곳(`repair-milestone`·`repair-acceptance`×2·`repair-plan`·`stabilize-milestone`×2)에 남아 있으면 Phase 3-3 미완이다.

### 7. `- invalidated`의 위치 — 기대: **task `## 8` 유지**
```bash
grep -n "invalidated" \
  .claude/skills/repair-milestone/SKILL.md \
  .claude/skills/repair-acceptance/SKILL.md \
  .claude/skills/repair-workitem/SKILL.md
```
→ 세 파일 모두 **task `## 8`에 append**로 남아야 한다. `## 5`에 적으라는 지시가 있으면 **되돌린다** — 졸업 item 4와 `/accept-milestone` R2가 둘 다 task `## 8`의 마지막 이벤트만 읽으므로 무효화가 반영되지 않는다.

### 8. `- exec-evidence`·`- pattern-scan`의 폐쇄 후 위치 — 기대: **`## 5`**
```bash
grep -n "exec-evidence\|pattern-scan" \
  .claude/skills/repair-milestone/SKILL.md \
  .claude/skills/repair-acceptance/SKILL.md
```
→ 두 파일 모두 `## 5` 항목 하위 줄에 적도록 돼 있어야 한다(task `## 8` 아님).

### 9. frontmatter description 2종 — 기대: **옛 계약 문구 0건**
```bash
grep -n "^description:" .claude/skills/repair-milestone/SKILL.md .claude/skills/repair-acceptance/SKILL.md
```
→ `Route per-task fixes to /repair-workitem` · `in-AC는 /repair-workitem에 위임(재개방)` 이 남아 있으면 안 된다.

### 10. Codex wrapper — 기대: **위임 서술 0건**
```bash
grep -rn "repair-workitem\|재개방\|병렬 라우팅" .agents/skills/
```
→ `.agents/skills/repair-milestone/SKILL.md`의 «per-task `/repair-workitem` 병렬 라우팅» 문장이 남아 있으면 Phase 6-2 (c-4) 미완이다.

### 11. `## 5` 필수 필드 3종 — 기대: **3개 파일 전부에서 검출**
```bash
grep -rln "files:" \
  .claude/skills/repair-milestone/SKILL.md \
  .claude/skills/repair-acceptance/SKILL.md \
  docs/40-validation/IMPROVEMENT_GUIDE.md
```

### 12. closure receipt 배선 — 기대: **5개 파일 이상**
```bash
grep -rl -- "- closure" --include="*.md" --exclude-dir=.git --exclude=IMPROVE-GUIDE.md .
```
→ 최소 `ADR-068` · `TASK_TEMPLATE.md` · `MILESTONE_TEMPLATE.md` · `finalize-workitem/SKILL.md` · `stabilize-milestone/SKILL.md` 다섯이 나와야 한다.
> `grep -c ""`는 **총 줄 수**를 셀 뿐 파일 수가 아니다 — 파일 목록이 필요하면 `-rl`이다.

### 13. 아카이브 배선 — 기대: `.gitkeep` + 2곳 검출
```bash
ls -a docs/40-validation/archive/
grep -n "archive" docs/00-meta/STRUCTURE.md .claude/skills/plan-milestone/SKILL.md
```

### 14. skill 로스터 — 기대: **6개가 정확히 일치**
```bash
comm -23 <(ls .claude/skills | sort) <(ls .agents/skills | sort)
```
→ `amend-ssot` · `boilerplate-context` · `bootstrap-design` · `discover-product` · `research-pack` · `review-doc` 여섯이 나와야 한다(= wrapper 없는 자연어 호출 skill 집합).
```bash
for s in amend-ssot boilerplate-context bootstrap-design discover-product research-pack review-doc; do
  printf "%-20s README:%s  README_ko:%s  STRUCTURE:%s\n" "$s" \
    "$(grep -c "$s" README.md)" "$(grep -c "$s" README_ko.md)" "$(grep -c "$s" docs/00-meta/STRUCTURE.md)"
done
```
→ README·README_ko는 각 skill이 **2회 이상**(자연어 목록 두 곳), STRUCTURE는 **1회 이상** 나와야 한다.

### 15. ADR 인덱스 — 기대: 5행 (067은 `superseded`)
```bash
grep -n "^| 06[5-9] " docs/90-decisions/boilerplate/README.md
```

### 16. 부분 supersede 노트 2건 — 기대: 각 1건
```bash
grep -n "부분 supersede" \
  docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md \
  docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md
```
→ **건수가 아니라 «있어야 할 노트»로 확인한다** — ADR-052에 `> **부분 supersede (<적용일>)**` 1건(신규), ADR-057에 그 형식 2건(기존 2026-07-29 + 신규). ADR-057에서 함께 잡히는 나머지 4건은 정상이며 지우지 않는다: **2-5가 지시한 `## Surfaces` 2행의 `(부분 supersede: ADR-068 D1)` 병기** + 선재 2건(결정 1 산문 · 참고 절의 «ADR-051 D4 부분 supersede»).

### 17. 미치환 placeholder — 기대: **빈 출력**
```bash
grep -rn "<적용일 YYYY-MM-DD>" --include="*.md" --exclude-dir=.git --exclude=IMPROVE-GUIDE.md .
```

> commit: `chore: verify closure boundary rollout consistency`

---

# 부록 — 이번에 하지 않는 것

아래는 검토했으나 **의도적으로 제외**한 항목이다. 나중에 "왜 안 했지?"를 다시 계산하지 않도록 남긴다.

| 항목 | 제외 사유 |
|---|---|
| stale 채점표 임시 패치(제외 목록 축소 + 정적/동적 분리) | Phase 6-1의 §1.5 재작성이 근본 제거하므로 불필요. 정적/동적 분리는 (f)에 흡수됨 |
| 두 원장 중첩 순서 뒤집기 | IMPROVEMENT_GUIDE의 1차 키가 «누가 언제 회수하는가»(`## 2`=이번 M / `## 4`=다음 M / `## 5`=회수 없음)라 현재가 맞다 |
| 원장 요약 인덱스 블록 신설 | 폐지한 `## 0. 요약`·`## 1. 우선순위`가 그 실패 사례다. Phase 3의 회전이 같은 문제를 부작용 없이 해소 |
| `repair-milestone`·`repair-acceptance` 통합 | 사용자 관측을 `Reject-false-positive`로 기각할 수 없다는 authority 차이가 두 skill을 가르는 근거로 유효 |
| Risk 기반 TDD 전환 | 실행 시점 자기평가 다이얼은 게이트를 스스로 낮추는 레버가 된다. `Type`(ADR-039) 축으로 충분 |
| production safety 신규 lifecycle 단계 | ADR-067 비결정이 기각했고, 배포 후 관측은 `[플랫폼 관측]` modality + 졸업 item 6으로 표현 가능 |
| coverage % 목표 | 충족률·자동화율 2수치 + telemetry가 이미 대체 |
| 소규모 코드 변경 fast lane | `implement` 3-G ①(같은 M에 draft task 없음)과 «`ready` 부여는 seal 단독»(ADR-060 D7)을 깨뜨린다. seal 계약 개정이 필요한 별도 라운드 |
| 원장 writer 동시 실행 금지 규칙 | 마일스톤 층 skill이 전부 `disable-model-invocation: true`라 사용자만 시작할 수 있고, stabilize에 이미 명시 금지가 있다 |
| closure receipt의 사후 무효화 | closure는 **마감 시점의 스냅샷**이며 그 이후 코드 변경으로 무효화하지 않는다(ADR-068 D2). 무효화를 두면 폐쇄 후 수리마다 재validate가 필요해져 본 개선의 목적이 무너진다. 폐쇄 후 변경의 *현재성*은 졸업 item 2(회귀 테스트가 묶인 통합 `validate`)와 item 5가, *추적성*은 `## 5`의 `files`·`scope`가 담당한다 |
| 폐쇄 후 per-task 감사 축(diff-trace·Arch-iface·Design inventory·MCP) 재실행 | 의도적 제거다. 마일스톤 층 수정은 그 task의 AC로 역추적되지 않아 diff-trace가 **구조적으로 반드시** `추적 불가`를 낸다. 대체 장치가 이미 있다 — Arch-iface/Design은 stabilize §1.0의 5-3·5-4 + reviewer 팬아웃이 마일스톤 층에서, 추적성은 `## 5`의 세 필드가 담당한다 |
| 기존 MILESTONE 문서의 `## 5` 항목명 마이그레이션 | 구 템플릿으로 만든 M 문서는 옛 항목명을 갖는다. `## 5`는 사람이 읽는 체크리스트이고 실제 판정은 `/stabilize-milestone` §1.5가 하므로 기능 영향이 없다 — 그 M을 다음에 열 때 사용자가 4-2의 새 항목으로 갈아 끼운다 |

## 선재 결함 — 이번 범위 밖 (기록만)

아래는 이번 개선이 만든 것이 **아니고** 원래 있던 문제다. 고치려면 별도 판단이 필요하므로 손대지 않는다.

| 위치 | 증상 |
|---|---|
| `.claude/skills/repair-milestone/SKILL.md` 입력 절 | `argument-hint`와 예시는 `M1 "P0만, doc-consistency 먼저"` 같은 부분 지정을 제공하는데, 바로 아래 sanitization이 «공백 포함 시 즉시 종료»라 그 기능을 실제로 쓸 수 없다. `/repair-acceptance`도 같은 형태 |
| `.claude/skills/stabilize-milestone/SKILL.md` §1.0 항목 1 | Windows PowerShell 분기의 `markdown-link-check` 호출에 `ignorePatterns` config가 없어 «외부 URL 무시» 약속이 그 OS에서만 지켜지지 않는다 |
| `docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 8` | `- exec-evidence`의 writer 목록이 ADR-064 D4의 작성자 규정과 원래부터 어긋나 있었다(Phase 4-1 (b)가 부수적으로 함께 정리한다) |
