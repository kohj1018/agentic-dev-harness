---
name: repair-milestone
description: Critically recheck milestone-level QA/improvement findings and fix real cross-cutting defects (code change allowed). Route per-task fixes to /repair-workitem.
argument-hint: "[milestone id] [optional notes]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Agent Skill
---

이 skill은 `/stabilize-milestone`이 누적 기록한 milestone-level finding을 **비판적으로 재점검**한 뒤, 진짜 결함만 수정한다. 메인 세션에서 실행되므로 풀 프로젝트 컨텍스트로 판단한다.
**stabilize와 달리 코드 수정이 명시적으로 허용된다** — 단, 새 기능 추가·milestone 범위 밖 변경·자동 커밋은 금지한다.

`disable-model-invocation: true` — stabilize와 동일하게 사용자가 명시적으로 `/repair-milestone <M-N>`을 호출할 때만 실행한다(파괴적·광범위 수정 권한이라 묵시 트리거 차단).

**Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** — 아래 cross-cutting 처리 단계의 `/repair-workitem` 병렬 라우팅·복수 task 동시 수정은 (현재) Claude 전용 배선. Codex는 task를 한 개씩 순차로 `$repair-workitem`에 위임한다.

입력:
- `$ARGUMENTS`에는 milestone ID와 (선택) 부분 지정 메모가 들어온다.
  - 예: `M1`
  - 예: `M1 "P0만, doc-consistency 먼저"` — 일부 severity/카테고리만 대상
- **milestone-id sanitization 강제**: `M[0-9]+` 패턴만 허용. `/`, 공백, glob 메타문자(`*`, `?`, `[`) 포함 시 *즉시 종료* (repair-plan과 동형 — 본 skill은 ID로 QA_FINDINGS/IMPROVEMENT_GUIDE의 `## M-N` / `### M-N` 헤더를 grep하므로 안전 전제).

반드시 먼저 할 일:
1. milestone 문서를 읽고 포함된 feature/task 목록을 회수한다 (`## 8. 회고`의 기존 repair 결정 이력 맥락 포함).
2. `docs/40-validation/QA_FINDINGS.md`의 본 milestone 헤더(`## M-N`) 아래 `### P0` / `### P1` / `### P2` 항목을 회수한다. **다른 마일스톤 헤더의 미해소(`status`≠`resolved`) P0/P1은 색인 스캔만 하고 — 본 skill은 본 milestone만 수정(책임 경계) — 고치지 말고 `carry-over 미해결: M-X → /repair-milestone M-X 권장`으로 flag한다**(index-first recall — 본 milestone 헤더로만 자르면 carry-over 누락). *IMPROVEMENT_GUIDE 회수(step 3)도 다른 마일스톤 `### M-X` 미해소 P0/P1을 동일 기준으로 색인 스캔·flag(대칭).*
3. `docs/40-validation/IMPROVEMENT_GUIDE.md`의 본 milestone sub-section(`### M-N` 그룹)에서 `status: open` 항목을 회수한다 — `## 2. 열린 항목` 안의 그룹. **`## 5. Repair decision log`는 회수 대상 아님** (closed records — 이미 지나간 판단).
3-1. `IMPROVEMENT_GUIDE.md`의 `P1 [Pattern-spread]` 항목을 회수한다 — 이는 `/repair-workitem`·`/repair-acceptance`가 task 범위 밖이라 고치지 못한 **동일 패턴의 다른 출현**이다. cross-cutting 결함으로 취급해 4-판정 후 직접 수정하거나(범위 내), 새 범위면 사용자 보고 + 다음 M 후보로 남긴다. 해소하면 그 ID의 `status`를 `resolved`로 토글한다(수행 5와 동일 경로 — 그러면 stabilize가 재등재하지 않는다).
3-2. **`(수용)` 태그 항목은 본 skill의 수정 대상이 아니다 (ADR-066 D5)**: `QA_FINDINGS.md`·`IMPROVEMENT_GUIDE.md`에서 `(수용)` 태그가 붙은 항목은 **사용자 관측이 우선 authority**이므로 `/repair-acceptance`가 처리한다. 본 skill은 그 항목을 4-판정하지 않고, `/repair-acceptance`가 이미 해소한 항목이면 `status: resolved` 토글만 수행한다(미해소면 그대로 두고 출력에 `수용 finding 미처리 — /repair-acceptance <M> 필요` 한 줄).
4. `docs/40-validation/stabilize-reviews/<M>.*.md` glob으로 peer 리뷰 파일 회수(경로 목록 메모리 보관 — 삭제 시 재glob 금지). (ADR-054 — cross-LLM stabilize 리뷰 종합)
   - QA_FINDINGS `## M-N`도 IMPROVEMENT_GUIDE `### M-N`도 *그리고 stabilize-reviews 파일*도 모두 비어 있으면 *"수정 대상 finding 없음 — 다른 세션에서 `/stabilize-milestone <M-N>`을 먼저 실행하세요. (다른 세션·worktree에서 `/validate-milestone`를 돌렸다면 그 리뷰 파일을 이 checkout의 `docs/40-validation/stabilize-reviews/`로 옮긴 뒤 재실행하세요.)"* 안내 후 종료. 문서 수정 금지.
5. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
6. 회수한 finding 전부를 우선순위(P0 > P1 > P2)로 정렬한다.

비판적 재점검 (수정 *전* 1회 — stabilize의 qa/reviewer/deterministic preflight가 틀리거나 맥락을 놓쳤을 수 있다):
**peer 리뷰 finding 종합 (ADR-054)**: stabilize-reviews 회수 파일의 finding도 동일 4-판정(Adopt/Adopt-modified/Reject-FP/Reject-context) 처리. **3중 dedup**: (a) 태그 간 동일 finding, (b) peer finding이 이미 QA_FINDINGS/IMPROVEMENT_GUIDE에 기록된 finding, (c) open-item 상태 중복. 동일 `<라벨> <file:line> <증상>` 1건만 남긴다.
각 finding마다 *실제 코드·문서·milestone 완료 기준을 직접 확인*해 4가지 중 하나로 판정하고 한 줄 근거를 남긴다 (repair-workitem과 동형):
- **Adopt** — 진짜 결함. finding 제안대로 수정.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수정 (다른 수정 + 사유).
- **Reject-false-positive** — stabilize 단계가 잘못 봄 (예: 이미 충족됨 / deterministic preflight 휴리스틱 오탐 / placeholder 오인 / 이미 존재하는 link를 누락이라고 본 경우).
- **Reject-context** — stabilize가 milestone 범위·상위 제약을 놓침 (예: charter `## 5. 비목표`상 의도된 미구현 / ARCH 결정상 정당한 동작).
> 자기 판단을 신뢰하되, 애매하면 Adopt 쪽으로 보수적으로. Reject는 *근거가 코드/문서로 확인될 때만*.

수행:
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 처리한다.
2. **라우팅 — finding의 scope에 따라 처리 주체가 다르다**:
   - **per-task 결함** (특정 `T-NNN`에 귀속되는 코드/AC 결함): 직접 고치지 말고 `/repair-workitem <T-NNN> "<finding 요약>"`로 위임한다(repair-workitem이 finding-mode로 report Pass·부재여도 그 finding을 수정 — validate 선행 불요). 위임 반영 후 해당 finding의 QA_FINDINGS/IMPROVEMENT_GUIDE status는 수행 5(원본 finding status 갱신)에서 resolved로 닫는다. (Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 task별로 순차 단일 실행.) **순서 규칙 (중요)**: per-task 위임과 그 뒤의 2-C 연쇄 ①은 **본 skill 자신의 cross-cutting 직접 수정·2-P·2-R·2-E·2-A·2-B·2-V·수행 4·5·6보다 먼저** 수행한다. 그 순서를 지키면 `/finalize-workitem` 시점의 working tree에 **그 task의 변경만** 남아 수행 5-(4)의 범위 비교를 통과한다. 반대로 cross-cutting 수정과 원장 쓰기를 먼저 하면 그 파일들이 task `## 4-1` 밖 변경으로 보여 finalize가 `Needs Review`로 멈춘다(본 skill 마지막 출력의 커밋 안내가 경고하는 그 상태다).
   - **cross-cutting 결함** (단일 task에 귀속되지 않는 milestone-level 결함): 본 skill이 **직접 수정**한다. 대표 3종:
     - **doc-consistency finding** (예: deterministic preflight가 올린 `[Doc-link]`/`[ADR-ref]`/`[Spec-gap]`/`[Arch-iface-violation]`): 해당 문서·매핑표를 직접 수정.
     - **e2e wiring scaffold/install** (E2E 미정의 스택에 재현 케이스를 영속 테스트로 묶는 scaffold, `validate:e2e` 배선, 의존성 install): 직접 scaffold·install.
     - **architecture debt** (layer 경계·의존성 규칙 위반 등 ARCH 정합 결함): **현재 M 약속(기존 task·AC) 위반이면 본 라운드 cross-cutting repair로 직접 수정**하고, 구조 변경이 커서 *새 범위*가 되면 architect 호출을 텍스트로 제안하며 **사용자에게 보고 + 다음 M 후보**로 남긴다(현재 M에 새 task를 제안하지 않는다 — 과대 수정 금지, ADR-057#amend-3 결정 6).

2-P. **동일 패턴 전수 검색 (ADR-066 D6)**: 각 `Adopt` cross-cutting 결함에 대해 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색한다. 마일스톤 범위 안이면 본 라운드에서 함께 고치고, 범위 밖이면 고치지 않고 `IMPROVEMENT_GUIDE.md`에 `P1 [Pattern-spread]` 항목으로 등재한다(반드시 먼저 할 일 3-1이 다음 라운드에 회수하는 그 항목이다). 검색 결과는 마지막 출력에 `범위 내 N건 수정 / 범위 밖 M건 <경로>`로 남긴다. **per-task 위임분의 패턴 검색은 `/repair-workitem` 2-H가 하므로 여기서 중복하지 않는다.**

2-R. **회귀 테스트 선행 (ADR-066 D4 준용)**: 수행 2의 cross-cutting 직접 수정마다 **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤**(Red) 고치고, **그 테스트가 통과하는 것까지 확인한다**(Green). Red·Green 두 관측 결과를 수행 4의 결정 이력에 1줄로 남긴다 — Red만 적고 Green을 확인하지 않으면 «고쳤다고 적었지만 안 고쳐진» 항목이 통과한다.
   - **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정, 그리고 **문서만 고치는 finding**(`[Doc-link]`·`[ADR-ref]`·`[Spec-gap]` 등 — 실행 가능한 테스트 대상이 아니다). 면제 사유를 결정 이력에 적는다.
   - 테스트 작성이 불가능하면 그 사유를 적고 다음 라운드 확인 대상으로 남긴다.
   - **per-task 위임분은 여기서 하지 않는다** — `/repair-workitem`이 자기 규율로 처리한다(중복 금지).

2-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 cross-cutting 직접 수정이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, **그 경계의 실행 증거를 다시 확보하고 그 task `## 8`에 `- exec-evidence` 줄을 새로 append한다**(기존 줄은 지우지 않는다 — 이력이다). 증거 등급·안전 규정·waiver 규정은 `/implement-workitem` 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다.
   - **per-task 위임분은 여기서 하지 않는다** — `/repair-workitem` 2-E가 같은 일을 한다.
   - 등급 1 증거로 새 파일을 만들었어도 **task `## 4-1`은 건드리지 않는다**(계획 본문 불가침 — 본 skill의 책임 경계). 그 경로는 `## 5. Repair decision log` 항목에 적는다.

2-A. **영향 task report 무효화 (ADR-067 D1 item 4 (d) 보완)**: 본 라운드의 cross-cutting 직접 수정이 어떤 task의 **산출물 동작 또는 validate 입력 계약**(ARCH `## 7-x` 인터페이스 결정·FAC↔AC 매핑·DESIGN 계약 등 — report의 축 판정이 그 문서를 근거로 산출된다)을 바꿨으면, 그 task의 `docs/40-validation/reports/<task-id>.md`를 **삭제한다**(`/repair-workitem`의 report 삭제 규율과 동형 — **삭제 전 `삭제 예정: <경로>` echo 강제**, 경로를 미리 회수해 하나씩 `rm`). 수정 파일이 `## 4-1`에 없어 mtime 비교로는 잡히지 않으므로, report 부재(=졸업 item 4 미충족)로 만들어 **재validate를 강제**하는 것이 유일한 경로다. 마지막 출력에 삭제한 report 목록과 `/validate-workitem <task-id>` 재실행 안내를 남긴다.

2-B. **AC acceptance 무효화 (ADR-065 D3 — writer 3종 중 하나)**: 그 수정이 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-milestone cross-cutting 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다 — 이력이다). **새 receipt를 대신 쓰지 않는다**(사용자 authority).

2-C. **위임 후 연쇄 — 재개방한 task를 본 skill이 닫는다 (사용자에게 미루지 않는다)**: 수행 2의 per-task 위임은 그 task를 `in-progress`로 재개방하고, 2-A의 채점표 삭제는 다른 task의 채점표를 없앤다. **두 상태를 남긴 채 끝내지 않는다.** 단 **두 경우의 처방이 다르다** — 재개방된 task는 다시 `done`으로 마감해야 하지만, 채점표만 없어진 task는 계속 `done`이므로 마감할 것이 없다.

   - **① 재개방된 task (per-task 위임분) — validate + finalize.** 수행 2에서 위임한 각 `T-NNN`에 대해, **그 `/repair-workitem` 호출이 끝난 직후** `/validate-workitem <T-NNN>` → 판정이 `Pass`·`Pending Acceptance`면 `/finalize-workitem <T-NNN>` 을 순서대로 실행한다(여기서 `/repair-workitem`을 **다시** 부르지 않는다 — 수행 2가 이미 불렀다). **이 ①은 위 「순서 규칙」대로 cross-cutting 수정·원장 쓰기보다 먼저, task 한 개씩 순차로** 돈다(한 task를 finalize가 커밋해 tree가 다시 깨끗해진 뒤 다음 task로 간다).
     - `Needs Fix`면 `/repair-workitem <T-NNN>`을 한 번 더 보내고 **다시 `/validate-workitem <T-NNN>` → 판정이 `Pass`·`Pending Acceptance`면 `/finalize-workitem <T-NNN>`** 까지 같은 순서로 끝까지 돈다 — **`/repair-workitem` 호출은 task당 최대 2회**. **2회째 validate도 `Needs Fix`면** 그 task를 `미해결 (Needs Fix ×2)`로 명시하고 다음 task로 넘어간다(무한 루프 금지). **2회째가 통과했는데 finalize를 부르지 않으면 그 task가 `in-progress`로 남아 졸업 item 1이 미충족이 된다** — 2-C가 존재하는 이유가 그것이다.
     - **정상 마감도 `Needs Fix`도 아닌 종료값(`Needs Validation`·`Needs Review`·`Needs Rationale`·`Needs Stack Guard`)이 나오면 그 task를 `미해결 (<종료값>)`로 명시하고, 사용자가 그대로 칠 수 있는 복구 명령을 함께 출력한다** — 조용히 멈추지 않는다. `Needs Review`(범위 비교 불일치)의 복구 안내는 «tree의 무관 변경을 커밋하거나 그 task `## 4-1`을 보강한 뒤 `/finalize-workitem <T-NNN>` 재실행»이다.
   - **② 채점표만 삭제된 task (2-A의 영향 task) — validate만. 그리고 2-V(자체 검증)를 마친 뒤에 돈다.** `/repair-workitem`도 `/finalize-workitem`도 부르지 않고 **`/validate-workitem <T-NNN>` 하나만** 실행한다. **2-V가 무언가를 고치면 ②가 방금 만든 채점표가 다시 stale이 되므로 ②는 반드시 2-V 다음이다** — 즉 이 라운드의 실행 순서는 «① → cross-cutting 수정·2-P·2-R·2-E·2-A·2-B → 2-V → ②»다. 고칠 것은 본 skill이 이미 고쳤고, **그 task는 재개방되지 않아 계속 `done`이므로 마감할 것이 없다** — finalize를 부르면 1-G의 read-only no-op에 걸려 아무 일도 안 하면서 «마감»으로 보이는 거짓 신호만 남는다. 졸업 item 4가 요구하는 것은 **새 채점표**이며 그것은 재validate가 만든다.
     - 재validate 결과의 채점표에 cross-cutting 수정 줄이 `추적 불가`로 잡혀 `P1` 라벨이 붙을 수 있다. **정상이며 차단이 아니다** — diff-trace audit에서 `Needs Fix` 트리거는 (c) pre-existing dead code 삭제 하나뿐이다. 그 라벨은 출력에 한 줄 요약만 남긴다.
   - **③ 2-B로 `- invalidated`만 append한 task**는 이 연쇄 대상이 아니다 — 졸업 item 4 (a')가 task `## 8`을 직접 읽으므로 재validate 없이도 무효화가 반영된다. receipt 재발급은 다음 `/accept-milestone <M>` 라운드가 담당한다.
   - **④ 커밋 경계는 그대로다 (ADR-047 D7 / ADR-052 D4).** 본 연쇄에서 커밋이 일어나는 유일한 자리는 ①의 `/finalize-workitem`이고, 그것이 커밋하는 것은 **그 task의 `## 4-1` 파일 + 그 task 문서**뿐이다. **본 skill의 cross-cutting 수정 파일·원장 갱신은 여전히 사용자가 커밋한다** — 본 skill이 스스로 커밋하지 않는다는 계약은 유지된다.
   - **Codex**: 병렬 위임 parity가 없다 → task를 한 개씩 순차로 같은 연쇄를 돈다(①은 애초에 순차이므로 차이는 없다). `Skill` 도구가 없는 환경에서는 각 skill의 `SKILL.md`를 읽어 그 절차를 같은 순서로 직접 수행한다.

2-V. **자체 검증 — 즉시 파손 감지 (실행 순서상 2-C ① 다음, 2-C ② *앞*이다)**: 위 2의 cross-cutting 직접 수정·2-P·2-R·2-E·2-A·2-B를 마친 뒤 1회 수행한다. **2-C ①(재개방 task 연쇄)은 이 시점에 이미 끝나 있고, 2-C ②(채점표 삭제 task 재validate)는 아직 돌리지 않은 상태다** — 본 단계가 무언가를 고치면 ②가 만들 채점표가 곧바로 stale이 되기 때문이다. 내용은 둘이다: (i) 본 라운드에 추가한 회귀 테스트가 전부 Green인지 확인하고, (ii) 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를(미지원이면 통합 `validate`를) 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다. e2e·qa 팬아웃·문서 정합·졸업 판정은 `/stabilize-milestone` 책임이다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과다(같은 메인 세션이면 컨텍스트에 있고, 없으면 본 라운드 시작 시 1회 실행해 잡는다). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다.
   - 통합 명령이 없으면 (ii)를 skip하고 사유를 출력에 남긴다(별도 hardstop 없음).

3. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan/repair-workitem과 동형). defer 금지 — 4결정 카테고리 외의 deferred drop은 허용 X. 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다(`M1 "P0만"`).
4. **결정 이력 영속화 (ADR-047 D7 durable correction history + D1 inspectability)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 IMPROVEMENT_GUIDE 스키마로 append. P2는 영속화 X (cap 보호 — 재출현해도 milestone 졸업 게이트를 막지 않아 무해).

   **영속 형식** (IMPROVEMENT_GUIDE `## 항목 스키마` SSOT 정합):
   ```
   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | status: applied | decision: Adopt
     - 발견 (stabilize <surface>): <한 줄 설명>.
     - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-context 사유 한 줄>.
   ```
   ID 컨벤션: `<milestone-id>-repair-<N>` (예: `M1-repair-1`, `M1-repair-2`) — milestone ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked` 필드로 원본 milestone 역참조. **evidence label은 기본 `[관측됨]`** (finding 자체가 stabilize의 *로컬 문서/코드 관측*에서 나옴). **cross-cutting 항목에는 `affected: T-NNN`(영향 task 목록, 없으면 `affected: —`)이 필수** — 본 skill은 task 계획 본문을 건드리지 않으므로 이 역참조가 "어느 task의 산출물을 나중에 누가 왜 고쳤는지"를 추적하는 유일한 경로다(`/repair-acceptance` 규율과 동형). per-task 위임 결과는 해당 task `## 8. 메모`에 `/repair-workitem`이 직접 append하므로 *여기 중복 기록 X* — 본 `## 5`에는 cross-cutting 결정과 "T-NNN으로 위임함" 한 줄 routing 기록만 둔다.

5. **원본 finding status 갱신** — Adopt/Adopt-modified로 해소한 IMPROVEMENT_GUIDE `### M-N`의 open 항목은 `status: open` → `status: resolved`로 갱신(closed records인 `## 5`로 옮기지 않고 *open 항목의 status만* 토글 — open items와 closed records의 의미 분리 유지). QA_FINDINGS `## M-N`의 해소된 항목도 동일하게 `status: resolved` 표기.
6. **stabilize-reviews 파일 삭제 (echo-then-rm, ADR-054)**: 한 파일의 *전 severity finding이 4-판정 완결됐을 때만* 그 파일을 삭제한다 — 부분 범위(`M1 "P0만"` 등)로 미처리 finding이 남은 파일은 *삭제하지 않고 보존*하고 출력에 "미처리 잔존 — 보존: <경로>"를 명시한다(stabilize-reviews는 gitignore된 ephemeral이라 삭제 시 그 안의 peer finding이 어디에도 안 남는다 — repair-workitem report 삭제 가드와 동형). **삭제 전 경로 echo 강제** — `삭제 예정: <경로>` 출력 후 Bash `rm`으로 한 개씩 정확히 삭제. 미리 회수한 경로 목록을 사용(삭제 후 재glob 금지 — 삭제된 파일이 목록에 없는 다른 파일까지 재수집 오인 방지).

책임 경계:
- 새 기능을 추가하지 않는다.
- milestone 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 사용자/`/finalize-workitem`이 별도로 (ADR-047 D7 — finalize/user가 commit owner).
- workitem `## 0. Status`를 **직접** 변경하지 않는다 — 재개방은 `/repair-workitem`이, 마감은 `/finalize-workitem`이 쓴다(ADR-057#amend-3 결정 5 — writer 고정). 본 skill은 2-C에서 그 둘을 **호출**할 뿐 status 줄을 스스로 편집하지 않는다.
- **커밋을 직접 하지 않는다 (ADR-052 D4 / ADR-047 D7 불변)** — 본 skill은 `git commit`을 실행하지 않는다. 2-C ①의 `/finalize-workitem`이 커밋하지만 그것이 커밋하는 것은 **그 task의 `## 4-1` 파일 + task 문서**뿐이며, **본 skill의 cross-cutting 수정 파일과 원장 갱신은 여전히 사용자가 커밋한다.** 즉 commit owner는 «task 마감분 = finalize / 그 밖 전부 = 사용자»로 갈리며, 본 skill이 스스로 커밋하는 경로는 없다.
- per-task 코드 결함은 직접 고치지 말고 `/repair-workitem`으로 위임한다 (task scope SSOT 침범 금지). cross-cutting 결함만 직접 수정.
- QA_FINDINGS / IMPROVEMENT_GUIDE에서 본 milestone(`## M-N` / `### M-N`) 외 다른 milestone 그룹은 건드리지 않는다.

마지막 출력:
- 4-판정 카운트: Adopted M / Adopt-modified K / Reject-FP I / Reject-context J
- cross-cutting 직접 수정 파일 목록 + 어떤 finding을 어떻게 해소했는지
- **커밋 안내**: cross-cutting 수정 파일과 원장 갱신은 repair-milestone 가 *커밋하지 않는다*(ADR-052 D4) — 사용자가 직접 커밋한 뒤 다음 단계로 진행한다. **2-C ①이 마감한 재개방 task의 파일은 그 `/finalize-workitem`이 이미 커밋했으므로 여기 목록에 없다** — 남는 것은 cross-cutting 수정분과 원장뿐이다. *그 잔여분을 미커밋으로 두면* 이후 다른 task 의 `/finalize-workitem` 이 그 파일을 task `## 4-1` 밖 변경으로 보고 `Needs Review` 로 멈춘다(2-C ①이 cross-cutting 수정보다 먼저 도는 이유가 그것이다).
- `/repair-workitem`으로 위임한 task 목록 (Codex 순차 degrade 여부 명시)
- **연쇄 실행 결과 (의무, 2-C)**: task별 `<T-NNN> | 경로(① 재개방 / ② 채점표삭제) | 실행한 skill | 최종 판정 | status` 표. **①은 validate+finalize를, ②는 validate만 실행하며 ②의 status는 `done` 유지다**(재개방되지 않았으므로 마감 대상이 아니다 — finalize를 부르지 않았다는 사실을 «미실행(불요)»으로 적는다). **사용자에게 재실행을 미루지 않는다.** 2회로도 `Needs Fix`인 task, 또는 정상 마감이 아닌 종료값이 나온 task는 `미해결 (<종료값>)`로 명시하고 복구 명령을 함께 적는다.
- 동일 패턴 전수 검색 (2-P): 범위 내 N건 수정 / 범위 밖 M건(경로 + `[Pattern-spread]` 등재 결과)
- 회귀 테스트 (2-R): 추가 N건 / 면제 M건(사유) / 작성 불가 K건(사유)
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
- Reject한 항목 + 근거 (있으면)
- `## 5. Repair decision log` `### M-N` append 줄 수 (P0+P1 합)
- status: open → resolved 토글한 finding 수
- architect 호출 권장 (architecture debt가 구조 변경을 요할 때)
- 미해결 항목 (있으면)
- 삭제한 채점표 (ADR-067 D1 item 4 (d)): <task-id 목록> — **재validate는 2-C가 이미 수행했다**(위 연쇄 실행 결과 표 참조) / 해당없음
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음 — **무효화가 1건 이상이면 그 마일스톤의 graduation은 `PENDING_ACCEPTANCE`가 되므로 `/stabilize-milestone` 뒤에 `/accept-milestone <M>`으로 receipt를 재발급한다.** 재발급 자체는 재validate를 요구하지 않는다(item 4 (a')가 task `## 8`을 직접 읽는다).
- 후속 권장 액션 (순서 고정): ① `미해결` task가 있으면 그것부터 해소 → ② `/stabilize-milestone <M-N>` 재실행으로 졸업 판정 갱신 → ③ 판정이 `PENDING_ACCEPTANCE`면 `/accept-milestone <M-N>`, `YES`면 `/plan-milestone`로 다음 마일스톤(M-(N+1))+feature 생성·확정 후 `/plan-workitem M-(N+1)`로 전체 계획. **①~② 사이에 사용자가 손으로 돌려야 할 `/validate-workitem`·`/finalize-workitem`은 없다** — 2-C가 이미 수행했다.

정책 근거: 비판적 재점검·전 severity 완결은 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-workitem·repair-plan 대칭. milestone 졸업 contract는 [ADR-067](../../../docs/90-decisions/boilerplate/ADR-067-milestone-graduation-v2.md). 결정 이력 영속·commit owner 분리는 [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7. 단순성·범위 추적은 [ADR-006](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md). repair-milestone 신규 skill 거버넌스: [ADR-052](../../../docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md) D4. 위임 후 연쇄(2-C)와 status writer 고정은 [ADR-057](../../../docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md)#amend-3 결정 5. 동일 패턴 전수 검색(2-P)은 [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D6.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 finding 본문에서 발화 시 인용 — 사전 fork-load 금지.
