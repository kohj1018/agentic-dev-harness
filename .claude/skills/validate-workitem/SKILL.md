---
name: validate-workitem
description: Validate whether a completed workitem implementation matches its documented scope and is ready for the next step.
argument-hint: "[task identifier]"
allowed-tools: Read Glob Grep Write Agent Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *) Bash(git diff *) Bash(git log *) Bash(git status *) Bash(wc *)
---

이 skill은 **판정 + report 기록 전용**이다. status 변경, 코드 수정, 커밋은 하지 않는다.

너의 역할은 지정된 workitem 구현 결과를 검증하고 표준 양식의 report를 기록하는 것이다.
큰 diff에서는 **메인 세션이 감사 축(audit AXIS)별 validator를 병렬 팬아웃**하고(아래 0단계),
각 validator가 반환한 **partial verdict**(findings + 그 축의 evidence)를 *메인이 집계해
단일 report 1개를 작성*한다. **report 작성과 confidence 산정은 집계자(메인 세션) 책임이다 —
validator는 report 파일을 쓰지 않는다**(clobber 방지: report 경로는 `<task-id>.md` 단일 파일).

입력:
- `$ARGUMENTS`에는 task ID가 들어온다 (feature 단위 검토는 `/validate-plan` 책임). FAC↔AC spec coverage 점검 시 본 task 의 상위 feature 문서를 *참조로* 읽는다.

반드시 먼저 할 일:
0. **감사 축 분할 + 병렬 validator 팬아웃 (orchestration)** — diff 규모로 분기한다.
   - **diff가 작으면 (cost guard)**: 팬아웃하지 않고 메인 세션이 직접 단일 inline validator로 1~5단계를 그대로 수행한다(아래 fallback 기준).
   - **diff가 크면**: 메인 세션이 아래 **감사 축**을 독립 sub-task로 분할하고, [DELEGATION 병렬 패턴 #1](../../../docs/00-meta/DELEGATION_STRATEGY.md#병렬-패턴-3종)(한 turn에 `validator` sub-agent 다중 호출)로 *한 turn에* 팬아웃한다. 각 validator는 **자기 축 하나만** scoped로 받고 **partial verdict만 반환**한다(report 작성 금지).
     - 축 목록 (1축 = 1 validator sub-task):
       1. AC ↔ 검증 매핑 (modality별 증거 판정 — ADR-065 D1 + 테스트 선행 휴리스틱 + `[verify-placeholder]` / `[test-id-missing]` + 충족률·자동화율 산정)
       2. 범위 밖 변경 + diff trace audit (ADR-006#amend-1)
       3. FAC → AC spec coverage audit (ADR-037)
       4. Arch-iface 7-1/7-2/7-3/7-4/7-5 audit (API/CLI/백엔드/프론트/모바일)
       5. UI Design inventory audit (ADR-027#amend-1) — UI 프로젝트에 한해 spawn
       6. MCP 사용 audit (ADR-048#d5)
       7. Evidence Bundle 축(통합 명령 실행 결과 + oracle gap surface 점검 + ADR-064 receipt 판정 — 실행 증거/판정력/미실측 잔존, 전부 P1 기록 등급. 별도 축을 만들지 않는다)
       8. Cross-task seam 축 (feature `## 7-2`가 실재하고 "(해당 없음)"이 아닐 때만 spawn — ADR-057 결정 12)
     - **신호 기반 조건부 spawn (cost guard 확장)**: 축 3(FAC spec)·4(Arch-iface)·5(UI)·6(MCP)·8(seam — feature `## 7-2` 실재)는 *해당 신호가 있을 때만* spawn한다 — 3 = task가 feature에 연결(`## 7 Feature` 링크), 4 = API/CLI/백엔드/프론트 신호(7-x 키워드·path), 5 = UI 프로젝트(ADR-027#amend-3), 6 = task `## 3`에 MCP 사용 line item, 8 = feature `## 7-2` 실재. 신호 없는 축은 spawn하지 않고 메인이 "해당없음"으로 인라인 기록한다(중간 크기 task의 과다 팬아웃 방지). 축 1(AC↔검증)·2(diff-trace)·7(Evidence Bundle)은 항상 해당.
     - **통합 검증 명령(1단계)은 메인 세션이 1회만 실행**하고 그 결과(exit code + stdout/stderr 요약)를 7번 축 validator와 집계에 공유한다 — N개 validator가 `pnpm validate`를 중복 실행하지 않는다.
     - **small-diff fallback 기준 — 계산이 먼저, 초과 시 재량 0** (cost guard, ADR-051#amend-4): dispatch 전에 크기를 *결정적 명령으로 계산한다*. **tracked 줄 변경** = `git diff HEAD --numstat` 각 행의 (added+deleted) 합(**binary 파일은 numstat이 `-\t-`로 표기 → 0으로 취급**; rename 행 `{old => new}`도 숫자 열은 그대로라 합산 정상); **untracked 신규** = `git status --porcelain --untracked-files=all`(= `-uall`)의 `??` 항목 각 *파일* 줄 수 합(`wc -l`). **`-uall`이 핵심** — 기본 `git status --porcelain`은 untracked 디렉터리를 `?? dir/` 한 줄로 접어 파일 수를 놓치고 `wc -l`을 디렉터리에 돌리면 깨진다(예: untracked 대량 디렉터리가 1로 오계산). **L = 둘의 합, F = numstat 행 수 + untracked 파일 수.** **기준은 working tree 전체(HEAD 대비)** — 정상 lifecycle은 직전 task가 finalize로 커밋돼 tree엔 본 task 변경분만 남으므로 별도 '관련 파일' 선별이 불요하다. **over-count는 안전하다**(크게 세면 fan-out으로 기울 뿐 — 검증을 *더* 하는 쪽). 그래서 무관한 dirty/untracked가 섞여도 **임의 제외하지 말고**(제외가 재량 우회 창구가 된다) 전부 센 뒤 `## Orchestration`에 "오염 tree(무관 파일 포함 가능)" 사유만 적는다. 정확한 수가 필요하면 무관분을 stash 후 재계산해도 되지만 필수 아님 — **공유 worktree에서 사용자 변경을 강제 커밋/stash하지 않는다**. inline 허용은 **(L ≤ 50) 또는 (F ≤ 2 이고 L ≤ 200)**, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음 — **셋 다 충족일 때만**. 하나라도 미충족이면 **fan-out 필수 — inline 선택 불가(재량 0)**. 조건 충족이어도 "vertical slice라 하나로 본다" 류 사유로 inline을 택하려면 `## Orchestration`의 fallback 사유에 계산한 F·L + "임계 미달"을 명시 기록한다. **임계 초과인데 inline이면 규칙 위반**(산출물로 반증 가능 — SIMULATION_RUN Round 4 T-002 우회 재발 방지). 경계값(50/200)은 실측 전 추정치라 #amend-4가 재보정 창구다. 어느 경로를 탔든 report `## Orchestration` 기록은 의무다.
     - **축 미반환 회수 규율 (ADR-051#amend-4 결정 2)**: 위임한 validator가 구조화 partial verdict 없이 멈추면 ① 1회 재개(같은 축·같은 형식 명세로 재요청, 이미 확립한 finding 전량 포함을 명시) → ② 그래도 미반환이면 다른 validator에 재위임 → ③ 그래도 불가하면 메인이 그 축을 직접 감사 → ④ 그래도 불가하면 **`감사 미완(unavailable): <축>`으로 기록한다.** "결과 없음"을 조용히 통과시키지 않는다.
     - **④에 도달한 축이 하나라도 있으면 `Pass`를 낼 수 없다** (근거: ADR-067 D3 평가 규칙 — 미실행 감사가 입력을 주는 판정을 충족으로 단정하지 않는다). report `## 실패 항목`에 `[P0] 감사 미완(unavailable): <축> — 재검증 필요(수정 대상 아님)`을 적고 combined verdict는 `Needs Fix`로 낸다. 단 **후속 라우팅은 `/repair-workitem`이 아니라 `/validate-workitem` 재실행**이다(고칠 코드가 없다) — report `## 다음 권장 액션`에 그렇게 적고 자동 후속 호출을 하지 않는다(`[Spec-gap]`의 사용자 보고 라우팅과 동형). 이 축의 존재는 `## Orchestration`에도 남으므로 졸업 item 4 (c)가 그 값을 읽는다.
     - **Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** — 이 매핑이 없으므로(ADR-010) 위 축을 순차로 단일 실행해 같은 partial들을 모은 뒤 동일하게 메인이 집계·작성한다.
1. 통합 검증 명령(`pnpm validate` / `npm run validate` / `make validate` / `task validate` 중 하나)이 있으면 **항상 실행**하고 stdout/stderr를 수집한다 (메인 세션 연쇄 실행이라도 implement 이후 코드 상태가 바뀌었으므로 직전 결과를 재사용하지 않는다).
   - **명령이 없을 때 (ADR-007#amend-3)**: `docs/00-meta/STACK_SETUP_PLAN.md`가 *존재*하면(스택 확정) skip하지 않고 **`Needs Stack Guard`로 종료** + `/stack-guard` 실행 안내. STACK_SETUP_PLAN.md가 *없으면*(스택 미정) 기존대로 이 단계 skip하고 정적 판정만 한다.
   - 다른 빌더(`bun validate`, `mise run validate`, `just validate` 등)를 쓰는 스택은 본 skill의 `allowed-tools`에 해당 패턴(`Bash(bun validate)` 등)을 추가해야 자동 실행된다.
2. 관련 workitem 문서를 읽는다 — **메인 세션 연쇄 실행으로 직전 단계가 이미 같은 task 문서를 메인 컨텍스트에 올렸고 그 뒤 문서가 갱신되지 않았으면 재독을 생략**하고, 없거나 갱신됐으면 읽는다 (ADR-019 minimal sufficiency).
3. 필요한 상위 문서를 읽는다 (사전 fork-load 금지 — task 본문에서 발화 시 인용).
4. 최근 변경 파일 또는 diff를 기준으로 구현 결과를 본다 — **직전 단계 이후 코드/diff가 바뀌었으므로 diff는 항상 새로 확인**한다.

검증 기준:
- 문서 범위와 구현이 일치하는가
- 범위 밖 변경 + diff trace audit (ADR-006#amend-1):
  변경 파일 회수를 `git status --porcelain`(untracked 신규 파일 포함) 기준으로 한다 — tracked 변경은 `git diff HEAD`의 각 줄로(staged+unstaged 모두 — plain `git diff`는 staged를 놓침), untracked 신규 파일은 파일 전체 내용을 대상으로, 각각이 task의 AC-N 또는 명시 요청으로
  거꾸로 추적 가능한지 감사한다(신규 파일이 감사에서 누락되지 않게 — finalize의 `git status` 방식 정합). **원장(`DECISION_REGISTER.md`)의 `status: closed` + `authority: user-*` 항목(`D-NNN`) 을 이행해 추가된 줄은 대응 AC 가 없어도 "명시 요청"으로 보아 *추적 가능*으로 분류하고, 근거를 `D-NNN` + 7-x 앵커로 적는다 (ADR-061 D2 — ADR-006#amend-1 문구의 해석 고정).** 추적 불가 줄은 다음 카테고리 중 하나로 분류 보고.

  Needs Fix 트리거 (강 constraint, P0 라벨):
    (c) pre-existing dead code 삭제 — task 범위 밖 *파괴적 변경*. Pass 차단.

  Report only + reviewer 라벨 권장 (약 enabling, P1/P2 라벨):
    (a) 인접 코드 포맷팅/주석 정리 — P1
    (b) 무관 리팩토링 (행동 미변경 코드 구조 변경) — P1
    (d) 스타일 변경 (semicolon, quote, indent 등) — P2

  의도적 (c)는 task 문서에 명시 요청으로 박혀 있을 때만 Pass 통과.
- 빠진 검증 포인트가 있는가
- obvious regression risk가 있는가
- 통합 검증 명령(있으면) 결과는 통과인가
- AC ↔ 검증 매핑 (ADR-065 D1) — task `## 6-1`의 AC마다 `[modality]`를 읽고 그 modality가 요구하는 증거가 실재하는지 판정한다: `[자동 테스트]`=대응 테스트 실재(자연어 매칭 휴리스틱 또는 `AC_N` 식별자 매칭), `[산출물 검사]`=`## 6-1`에 기록된 검사 수단이 **통합 `validate`에 묶여 있고 그 실행이 통과**했는가(1단계에서 수집한 결과로 판정 — 검사 명령을 여기서 실행하지 않는다). 묶이지 않은 검사 수단은 충족 근거가 아니며 `P1 [Artifact-check-unbound] AC-N`으로 기록하고 그 AC는 미충족, `[사용자 관측]`·`[플랫폼 관측]`=task `## 8`에서 **그 AC의 마지막 이벤트가 `- ac-acceptance`**(ADR-065 D3 판독 규칙 2 — 마지막이 `- invalidated`면 미충족. HTML 주석 밖의 줄만 센다). **modality 표기가 없으면 `[자동 테스트]`로 간주해 판정한다(legacy 호환 — 아래 둘째 불릿)**. `## 6-2. TDD opt-out`은 충족의 예외가 아니다(ADR-065 D2 — 이 예외를 두면 `## 6-2` 두 줄로 AC 게이트가 사라진다). **`## 6-1`의 `VC-N` 행은 AC 행동으로 귀속되지 않는 판정력 확인용(positive control 등)이므로 본 매핑의 분자·분모 어디에도 넣지 않는다 (ADR-064 D2)** — 자동화율이 아래 confidence ladder의 입력이라 섞이면 등급이 이동한다. 대신 `VC-N`이 가리키는 테스트 줄은 diff trace audit에서 *추적 가능*으로 분류한다(추적 근거는 `AC-N | 명시 요청 | VC-N` 셋이다 — ADR-006#amend-1 문구의 해석 확장). **미충족 표현의 정본형 (중요)**: 어떤 modality든 미충족일 때 **`[modality]` 표기를 결과 라벨로 덮어쓰지 않는다.** `[사용자 관측]`·`[플랫폼 관측]`이 미충족이면 `- AC-N: ❌ [사용자 관측] receipt 대기 — `## 8`에 유효한 `- ac-acceptance` 없음` 형태로 적는다. **`[미관측]`은 «표기 부재 + 대응 테스트 없음»(legacy) 한 경우에만 쓴다**(ADR-065 D1). modality를 지우면 판정값(D6) 산출과 `/finalize-workitem` 분기가 «코드로 고칠 것»과 «사람이 볼 것»을 구분할 수 없다. **관측 AC의 미충족은 `## 실패 항목`에 적지 않는다** — 그 섹션은 `Needs Fix`일 때만 존재하고 이 AC는 판정을 `Needs Fix`로 만들지 않는다. 대신 `## Evidence Bundle`의 «검증하지 못한 것(oracle gap)» 하단에 `- receipt 대기: AC-N [<modality>] — 마일스톤 수용 라운드에서 발급` 한 줄을 남긴다.
- **modality 표기 부재 (ADR-065 D1 legacy 규칙)**: 표기가 없는 AC는 **`[자동 테스트]`로 간주**한다(기존 fork 호환 — 판정이 현행과 동일해진다). 그 AC에 대응 테스트가 없으면 기존과 같이 미충족이다. 표기 부재 자체는 `P2 [Modality-missing] AC-N`으로 기록만 한다(차단 X).
- **두 수치 (ADR-065 D4)**: `충족률`(전 modality)과 `자동화율`(`[자동 테스트]`+`[산출물 검사]`)을 따로 계산해 report에 적는다. **confidence ladder의 입력은 자동화율이다** — 사람·플랫폼 관측이 많은 task가 자동으로 High가 되지 않게 한다.
- **confidence 임계값 (본문 SSOT — 아래 report 양식의 주석은 이 값의 사본이다)**: 평가 순서는 Low → Medium → High이며 **첫 매치로 확정**한다.
  - **Low** (하나라도 매치): 통합 명령 미통과 / oracle gap 카테고리 미명시(누락 ≥2) / **자동화율 < 70%** / **미충족 «기계 검증» AC 있음**
  - **Medium** (잔여 등급 — Low도 High도 아닌 전부): Low 조건 모두 불일치 + High 조건을 전부 충족하지는 못함(예: 자동화율 70~89% / oracle gap 1개 누락 / diff trace audit 미통과). **미달 개수에 상한을 두지 않는다** — 상한을 두면 «Low 아님 + High 아님 + 3개 미달»이 어느 등급에도 들어가지 못해 아래 self-check ④가 만족 불가능해진다(`out-of-AC` 직접 수정분의 재validate가 diff trace 미통과 + 자동화율 하락을 동시에 만들므로 실제로 도달하는 조합이다).
  - **High**: 통합 명령 통과 + **자동화율 ≥ 90%** + diff trace audit 통과 + oracle gap 카테고리 전부 명시
  - **Low 조건의 «미충족 AC 있음»을 «기계 검증 AC 한정»으로 읽는 이유**: 사람·플랫폼 관측 비중은 자동화율 <70%가 이미 잡는다. 관측 AC의 receipt 미발급까지 세면 이중으로 깎여 정상 `Pending Acceptance` task가 무조건 Low가 된다(ADR-065 D6).
- **report 저장 전 self-check (5항목 — 하나라도 어긋나면 저장하지 않고 재계산한다)**: ① 관측 AC의 receipt 판독이 `## 8`의 «마지막 이벤트» 규칙대로인가 ② 판정값이 D6 우선순위의 첫 매치인가 ③ 충족률·자동화율의 분자·분모가 AC 행과 일치하는가(`VC-N` 제외) ④ confidence가 위 임계값의 첫 매치인가 ⑤ `## 다음 권장 액션`이 판정값과 일치하는가(`Pass`·`Pending Acceptance` → finalize / 감사 미완 → 재validate / **`P0 [Spec-gap]` 있음 → 사용자 보고**(아래 spec coverage audit의 «task 자동 추가 금지»가 일반 repair 안내보다 우선한다 — 계획 누락은 코드 수리로 해소되지 않는다) / 그 외 `Needs Fix` → repair).
  - `## 6-1. 테스트 시나리오` 항목이 `→ <runner>::<file>::<test-id>` 형식이고 *값에 angle-bracket placeholder(`<...>`)가 포함되지 않으면* path 우선 resolve (deterministic, ADR-047 D6 contract formation + D1 inspectability 정합).
  - 값에 `<runner>` / `<file>` / `<test-id>` 같은 angle-bracket placeholder가 잔존하면 *미설정*으로 간주 + 본 report에 P2 `[verify-placeholder]` 라벨로 기록 — 기록 위치: *Needs Fix 판정 시* `## 실패 항목` 하단에 한 줄, *`Pass`·`Pending Acceptance` 판정 시* `## Evidence Bundle` 의 *검증된 것* sub-section 하단에 한 줄(`## 실패 항목`은 Needs Fix일 때만 존재하므로). 자연어 매칭 fallback으로 계속 진행 (validate-workitem 책임 경계 정합 — IMPROVEMENT_GUIDE 직접 append는 stabilize-milestone이 reviewer 결과 받아 적는 영역).
- 테스트 선행 휴리스틱 — git log에서 동일 task 범위의 테스트 파일 추가/수정이 구현 파일보다 먼저(또는 동일 커밋) 들어왔는지. 단순 경고로만 보고하고 강제 종료하지 않는다(소규모 작업이 한 커밋에 묶이는 경우 정상).
- FAC → AC spec coverage audit ([ADR-037](../../../docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md)#amend-3):
  feature `## 7 FAC`의 각 항목이 본 task의 `## 6 AC` 또는 *연관 task의 AC*에
  매핑되는가? 매핑 안 된 FAC가 있으면 report의 "Spec coverage" 섹션에
  `P0 [Spec-gap] FAC-N → unmapped — 계획 누락, 사용자 결정 필요`로 기록한다.
  **task 자동 추가 금지** — P0라 combined verdict는 Needs Fix, 집계자는 이 라벨이 있으면 일반 `/repair-workitem` 안내보다 우선해 자동 후속 호출 없이 사용자 보고로 라우팅한다. legacy fallback은 plan-workitem SKILL.md의 "task 분해 + ## 7-1 AC 측 채움" 섹션 **Legacy fallback** 단락 참조.
- **UI 프로젝트 — Design inventory audit** (ADR-027#amend-1): 본 task 가 새 컴포넌트를 추가했는데 task `## 3. 구현 항목` 의 *등록 line item* (plan authoring) 이 실행 누락이면 `P1 [Design-inventory]`. 등록 line item 자체가 부재한데 신규 컴포넌트 출현이면 `P1 [Design-inventory-planless]` 기록하고 분기: 기존 task AC에 필요한 컴포넌트면 repair-workitem이 구현 또는 DESIGN 등록 누락을 고치고, 불필요하면 제거, 새 디자인 범위면 사용자 보고 + 다음 M 후보(ADR-057#amend-3 결정 6).
- **MCP 사용 audit** (ADR-048#d5): task `## 3. 구현 항목`에 `<capability> 작업 시 <mcp-name> MCP 사용` line item(plan authoring)이 있었는데 실행 흔적(diff / test / 출력)이 없으면 report에 `P2 [MCP-unused] <mcp-name> — plan이 박은 MCP 사용 line item 미실행` 기록. implement가 `Needs MCP Access`로 멈춘 경우(권한 미부여)는 `P2 [MCP-access] <mcp-name> — agent access 미부여(연결 절차 (e))`로 구분 기록. 자동 차단 X(report 신뢰 등급만 영향).
- **API/CLI/백엔드/프론트/모바일 — Arch-iface audit**: 본 task 가 ARCH `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` / `## 7-5` 의 기존 결정을 위반했거나, 신규 결정을 *7-x 본문 갱신 없이* 도입했으면 report 에 `[Arch-iface-7-N]` 기록 + 7-x 본문 갱신 권장 또는 ADR 후보 표시. **등급 분기 (ADR-061 D1)**: 위반된 7-x 항목이 [DECISION_REGISTER.md](../../../docs/10-charter/DECISION_REGISTER.md) 의 `status: closed` + `authority: user-choice|user-approval` 항목(그 항목의 `정본:` 앵커가 이 7-x 를 가리킴)으로 추적되거나, 그 7-x 의 `### Don'ts` 를 위반하면 **`P0 [Arch-iface-7-N]`** — Needs Fix 트리거다(사용자가 승인해 닫은 결정을 구현이 뒤집은 것을 보고만으로 통과시키지 않는다). **`Don'ts` 위반은 authority 와 무관하게 P0 다** — 금지 규정은 성질상 AC 로 회수될 수 없어 구현 시점 외에 검출 지점이 없다(ADR-060 D9 상 `Don'ts` 소항목 자체는 `agent-delegated` 이지만, 아래 P1 규칙보다 본 분기가 우선한다). 그 외(agent-delegated 컨벤션 불일치·7-x 본문 문구 미갱신 등)는 기존대로 **`P1`**. 원장 조회는 `## 결정 항목` 아래의 실제 `D-NNN` 항목만 대상으로 한다(설명 섹션의 형식 예시는 항목이 아니다 — ADR-019 색인 회수). 원장 파일이 없거나 해당 앵커 항목을 찾지 못하면 P1 로 두고 그 사실을 report 에 한 줄 기록한다.
- **Cross-task seam audit** (feature `## 7-2`가 실재하고 "(해당 없음)"이 아닐 때만 — ADR-057 결정 12): 본 task 구현이 관련 INV-N을 위반하는가(상태 역방향 write / 멱등 미보장 / 2차-write 누락)? INV가 테스트로 커버되는가? 위반·미커버 시 `P1 [Seam] INV-N — <증상>`. §7-2가 참조 링크형이면 canonical feature 의 표를 따라 읽는다. (inline·fan-out 축 8 동일 기준 — small-diff inline 경로에서도 누락 없이 점검.)
- **Evidence Bundle 양식 강제** (ADR-047 D8 oracle adequacy + D1 inspectability 정합): 위 양식의 "검증된 것 / 검증하지 못한 것 / 신뢰도" 3 sub-section을 *모두* 채운다. Pass 판정이라도 oracle gap이 명시 안 되면 *신뢰도: Low*로 강등 (자동 차단 X — report 신뢰 등급만 영향).
- **아래 세 판정의 공통 판독 규칙 (ADR-064 D4)**: `- 외부 경계:` · `[미실측]` · `- exec-evidence`/`- verify-power` 를 찾을 때는 **HTML 주석(`<!-- ... -->`) 밖의 줄만** 센다. TASK_TEMPLATE 주석에 같은 형식의 예시가 들어 있어, 주석까지 세면 앞의 둘은 모든 task에서 오탐이 나고 `- exec-evidence`는 항상 존재로 보여 검사가 조용히 죽는다(원장 조회의 "설명 섹션의 형식 예시는 항목이 아니다"와 동형).
- **실행 증거 판정** (ADR-064 D1/D7 — 본 skill은 실행하지 않고 *기록만 읽는다*): 본 task가 외부 경계를 건드렸는가를 diff와 task `## 2`의 `- 외부 경계:` 표시로 판정한다((a) 영속 저장소 쓰기 / (b) **외부** 네트워크 호출 — 같은 배포 단위 안의 서비스 간 호출은 제외 / (c) 실행 진입점). 해당하는 **경계 종류마다** task `## 8`에 `- exec-evidence` 줄이 있어야 한다. 없으면 `P1 [Exec-evidence-missing] <경계 종류>`. 사용자 waiver로 기록된 줄은 충족으로 보고 사유를 report에 인용한다. **줄의 존재 여부만 본다 — 신선도는 판정하지 않는다**(digest·커밋 비교는 도구가 없고, 줄 순서 기반 판정은 정상 repair 라운드에서 오탐이 난다. 근거는 ADR-064 D4). 증거 갱신은 코드를 고친 `/repair-workitem`의 책임이다. **본 항목은 기록 등급이며 Needs Fix를 트리거하지 않는다** — 실질 차단은 `/implement-workitem`의 `Needs Execution Evidence` 정지가 담당한다(ADR-064 D7).
- **판정력 판정** (ADR-064 D2/D7): **`[사용자 관측]`·`[플랫폼 관측]` modality AC는 대상에서 제외한다**(Red가 성립하지 않으므로 `- verify-power` 줄이 없는 것이 정상 — ADR-065 D1). 나머지 각 AC에 대해 task `## 8`에 `- verify-power` 줄이 있고 `red=` 값이 `observed|opt-out(사유)|characterization(사유)|unrecoverable(사유)` 중 하나인가. 없거나 값이 비면 `P1 [Verify-power-missing] AC-N`. **`opt-out`·`characterization`은 정상이며 결함이 아니다**(정당한 TDD opt-out·`Type: research-spike`·`Type: refactor`). `mutation=미승격`도 정상이다. 기록 등급 — Needs Fix를 트리거하지 않는다.
- **미실측 잔존 판정** (ADR-064 D3): task `## 3`에 `[미실측]` 표기가 남아 있으면 `P1 [Unmeasured-fact] <무엇> — 구현 시 해소되지 않음`. 기록 등급.

마지막 단계 — partial 집계 + report 파일 작성 (집계자=메인 세션 단독):
0단계에서 팬아웃했으면 각 validator가 반환한 partial verdict(축별 findings + 그 축의 evidence)를
*메인 세션이* 모아 아래 양식의 report 1개를 `docs/40-validation/reports/<task-id>.md`에 기록한다(이미 있으면 덮어쓴다).
validator는 이 파일을 쓰지 않는다(clobber 방지). inline fallback이면 메인 세션이 자기 판정을 그대로 기록한다.

집계 규칙 (combined verdict):
- **판정값 3종 (ADR-065 D6) — 우선순위 `Needs Fix` > `Pending Acceptance` > `Pass`, 먼저 성립하는 값으로 확정한다.**
  - **`Needs Fix`**: 어느 한 축이라도 P0 finding이 있거나 / 통합 검증 명령이 exit≠0이거나(통합 명령 부재 스택은 해당 없음) / **`[사용자 관측]`·`[플랫폼 관측]`이 아닌 미충족 AC**가 하나라도 있으면(`미관측` 포함).
  - **`Pending Acceptance`**: 위가 전부 아니고, **`[사용자 관측]`·`[플랫폼 관측]` AC의 receipt만 미발급**일 때. 이 AC에는 고칠 코드가 없다(receipt는 사용자만 발급한다 — ADR-065 D1).
  - **`Pass`**: 미충족 AC 0건.
  - P1/P2 라벨만 있는 것은 판정을 바꾸지 않는다(라벨은 report에 전수 기록).
  - **`감사 미완(unavailable)`은 `Pending Acceptance`가 아니다** — P0이므로 `Needs Fix`다. 고칠 것은 없지만 *판정할 수 없는* 상태이므로 `Pass` 계열을 낼 수 없다(ADR-067 D3와 동일 원리).
  - **하류가 이 값으로 갈린다**: `/finalize-workitem`은 `Pass`·`Pending Acceptance`를 통과시키고 `Needs Fix`를 차단한다. `/repair-workitem`은 `Pass`·`Pending Acceptance`면 종료한다. 졸업 item 4 (b)는 `Pass` 또는 `Pending Acceptance`를 허용한다(ADR-067 D1).
- 각 축의 partial findings(P0/P1/P2)·`[verify-placeholder]`·`[test-id-missing]`·`Spec Gap`·`[Design-inventory*]`·`[MCP-*]`·`[Arch-iface-7-N]`를 누락 없이 해당 report 섹션에 전수 합친다(ADR-046#d3 — cap 때문에 finding 누락 금지).
- **confidence는 메인 세션이 *집계 후* 재계산**한다(개별 validator의 신뢰도 추정을 그대로 신뢰하지 않는다). 아래 confidence ladder의 입력(통합 명령 통과 여부 / 자동화율 / diff trace 통과 / oracle gap 카테고리 명시 여부)을 *집계된 전체*에서 평가해 Low→Medium→High 첫 매치로 확정한다.

```markdown
# Validation Report: <task-id>

- 검증 시각: <ISO 8601 타임스탬프>
- task-id: <task-id>
- 판정: Pass | Pending Acceptance | Needs Fix

## Orchestration (ADR-051#amend-2)
<!-- 5줄 이내. 팬아웃/inline 여부를 산출물로 검증 가능하게 하는 관측 섹션 -->
- 모드: fan-out N축 | inline fallback | Codex 순차 degrade
- spawn된 축: <번호·이름 목록 (예: 1 AC↔검증, 2 diff-trace, 7 Evidence)>
- 회수된 축: <번호 목록> / 재개 1회로 회수: <번호 목록 또는 없음>
- 감사 미완(unavailable): <축 — 4단계 회수 전부 실패 사유 / 없음>  ← 1건 이상이면 판정은 Pass 불가
- skip된 축: <축 — 사유 (신호 없음 / 해당없음)>
- fallback 사유 (inline 모드일 때만 기록): 파일 F개 · 변경 줄 L줄 (`git status --porcelain` 기준 — tracked=`git diff HEAD`, untracked=파일 전체) — **임계 미달 확인**(inline 정당 근거). **임계 초과면 inline 불가(fan-out 필수)** — "임계 초과 예외 inline"은 없다(재량 0). fan-out 모드에선 본 필드를 비우고 spawn 축을 적는다.

## 통합 명령 실행 결과
<있으면 명령어와 stdout/stderr 요약, 없으면 "통합 명령 미설정 — 정적 판정만 수행">

## 실패 항목 (Needs Fix일 때만)
- [P0] <짧은 설명> — <관련 파일:라인>
- [P1] <...>
- [P2] <...>

## Diff trace audit (ADR-006#amend-1)
- 추적 가능 변경 줄: N개 (AC-1: M개, AC-2: ...)
- 추적 불가 변경 줄: K개
  - (a) 인접 포맷팅/주석: <file:line> ... [P1]
  - (b) 무관 리팩토링: ... [P1]
  - (c) pre-existing dead code 삭제: ... [P0 — Needs Fix 트리거]
  - (d) 스타일 변경: ... [P2]
- 판정 영향: <판정 유지 / Needs Fix 트리거 (오직 (c) 의도 외 발견 시)>

## AC ↔ 검증 매핑 (ADR-065)
- AC-1: ✅ [자동 테스트] tests/foo.spec.ts > test_AC_1_xxx
- AC-2: ✅ [산출물 검사] validate 통과 — insights 노트 필수 섹션 3개 검사(`scripts/verify` 내 docs 검사 단계)
- AC-3: ✅ [사용자 관측] ac-acceptance 2026-08-09 / authority: 사용자 / 환경: Chrome 128·로컬
- AC-4: ✅ [플랫폼 관측] ac-acceptance 2026-08-09 / authority: 사용자 / source: GH Actions run 12345
- AC-4b: ❌ [사용자 관측] receipt 대기 — `## 8`에 유효한 `- ac-acceptance` 없음 (수용 라운드에서 발급 — 판정은 `Pending Acceptance`)
- AC-5: ❌ [미관측] 표기 없음 → 자동 테스트 간주(legacy) — 대응 테스트 없음. `P2 [Modality-missing] AC-5` 병기
- **충족률: 4/6 (67%) · 자동화율: 2/6 (33%)**

## Spec coverage (FAC ↔ AC, ADR-037)
- FAC-1: ✅ T-001:AC-1
- FAC-2: ✅ T-001:AC-2
- FAC-3: ❌ `P0 [Spec-gap]` unmapped — 계획 누락, 사용자 결정 필요(task 자동 추가 금지)

## 실행 증거 · 판정력 (ADR-064 — 전부 기록 등급, Needs Fix 미트리거)
- 외부 경계: 해당(a 영속 저장소 / b 외부 네트워크 / c 진입점) | 해당없음
- exec-evidence: (a) ✅ 등급1 재실행 가능 / (b) ❌ `P1 [Exec-evidence-missing]` / waiver(<사유>) | 해당없음
- verify-power: AC-1 ✅ observed / AC-2 ✅ opt-out(spike) / AC-3 ❌ `P1 [Verify-power-missing]` / AC-4 해당없음(사용자 관측)
- VC-N: <등재 목록 또는 없음> (충족률·자동화율 집계 제외)
- 미실측 잔존: 0건 | `P1 [Unmeasured-fact] <무엇>`

## Evidence Bundle (ADR-047 D8 oracle adequacy 정합)
<!-- 본 검증 라운드가 *무엇을 봤고 무엇을 못 봤는지* 명시. green test가 곧 충분한 검증이라는 착각을 줄인다. -->

### 검증된 것 (verified)
- 통합 명령 exit code: <0 / non-zero / 미설정>
- AC↔검증 매핑: 충족 M개 / 미충족 K개 — 충족률 <%> · 자동화율 <%> (modality별 내역은 `## AC ↔ 검증 매핑`)
- diff trace audit: 추적 가능 N줄, 추적 불가 K줄(카테고리별)
- FAC↔AC spec coverage: <% / 부재>
- 기타 deterministic 점검: <markdown-link-check / static analysis 등 / 해당없음>

### 검증하지 못한 것 (oracle gap)
<!-- 다음 카테고리 중 *본 task의 surface area에 해당하는 것만* 명시. 해당없으면 "해당없음" 한 줄.
     UI 외에도 backend API에 i18n / 접근성 응답이 있으면 본 카테고리도 surface로 본다. -->
- 동시성·race condition 시나리오: <검증 가능 여부 / 가능 시 도구>
- 운영 환경 부하·성능: <검증 가능 여부>
- 외부 서비스 실패·timeout: <mocked / not covered>
- 보안 (인증 우회·권한 escalation·인젝션): <not covered / partial / not applicable>
- 접근성·국제화 (task surface가 해당하면): <not covered / partial / not applicable>
- 회귀: 이전 milestone의 어떤 시나리오를 본 변경이 깰 위험이 있나 — <명시 또는 "관련 없음">

### 신뢰도 (confidence)
<!-- 기준 (정의 — 같은 입력에 같은 판정 보장. 평가 순서: Low → Medium → High 의 *첫 매치* 등급으로 확정):
     - Low (어느 하나라도 매치): 통합 명령 미통과, 또는 oracle gap 카테고리 미명시(누락 카테고리 ≥2), 또는 **자동화율 <70%**, 또는 **미충족 «기계 검증» AC 있음**(`[자동 테스트]`·`[산출물 검사]`·표기 부재 한정 — 관측 modality의 receipt 미발급은 세지 않는다. 사람·플랫폼 관측 비중은 자동화율 <70%가 이미 잡으므로 이중으로 깎으면 정상 `Pending Acceptance` task가 무조건 Low가 된다. 본 조건의 SSOT는 skill 본문의 confidence 임계값이며 이 주석은 그 사본이다 — ADR-065 D6)
     - Medium (잔여 등급 — Low도 High도 아닌 전부): Low 조건 모두 불일치 + High 조건을 전부 충족하지는 못함 (예: 자동화율 70~89% / oracle gap 카테고리 1개 누락 / diff trace audit 미통과). 미달 개수에 상한을 두지 않는다 — 본 조건의 SSOT는 skill 본문의 confidence 임계값이며 이 주석은 그 사본이다
     - High: 통합 명령 통과 + **자동화율 ≥90%** + diff trace audit 통과 + oracle gap 카테고리 모두 명시(해당없음 포함)
     자동화율(ADR-065 D4)을 쓰는 이유: 충족률로 계산하면 사람·플랫폼 관측만으로 채운 task가 High가 된다. -->
- 본 판정의 신뢰도: <High / Medium / Low> — <한 줄 근거 (예: "통합 명령 + 자동화율 100% + diff trace 통과 + 외부 서비스 의존 없음" / "통합 명령만 통과, 동시성·외부 의존 미검증")>

## 다음 권장 액션
- Pass: `/finalize-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
- Needs Fix: `/repair-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
- Pending Acceptance: **`/finalize-workitem <task-id>`** — 이 modality는 마감을 막지 않는다(ADR-065 D1·D6). receipt는 마일스톤 수용 라운드(`/accept-milestone <M>` — ADR-066 D1)에서 발급되고 미발급은 졸업 item 4 (a')가 잡는다(ADR-067 D1). **`/repair-workitem`으로 보내지 않는다**(고칠 코드가 없어 순환에 빠진다)
- `감사 미완(unavailable)` 축 있음: `/validate-workitem <task-id>` 재실행 (수정 대상 아님)
```

마지막 출력 (메인 세션에 텍스트로):
- Pass / Pending Acceptance / Needs Fix
- 핵심 문제 최대 5개
- report 파일 경로
- orchestration 모드 1줄 (예: "fan-out 4축" / "inline fallback — 1파일 12줄")
- 다음 추천 단계 (텍스트 제안임을 명시)

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
메인 세션 연쇄 실행(implement→validate→repair, ADR-050) 시 직전 단계가 메인 컨텍스트에 올린 task 문서는 *갱신되지 않았으면 재독 생략*(ADR-051 D8 + ADR-019#amend-1 정합). 단 통합 검증 명령 재실행·diff 재확인·report 신규 작성은 항상 수행(코드 상태/산출물이 매 phase 변한다).
