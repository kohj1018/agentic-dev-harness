---
name: repair-milestone
description: Critically recheck milestone-level findings and fix them directly (code change allowed). No task reopening — the milestone layer never calls the workitem skills.
argument-hint: "[milestone id] [optional notes]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash Agent Skill
---

이 skill은 `/stabilize-milestone`이 누적 기록한 milestone-level finding을 **비판적으로 재점검**한 뒤, 진짜 결함만 수정한다. 메인 세션에서 실행되므로 풀 프로젝트 컨텍스트로 판단한다.
**stabilize와 달리 코드 수정이 명시적으로 허용된다** — 단, 새 기능 추가·milestone 범위 밖 변경·자동 커밋은 금지한다.

`disable-model-invocation: true` — stabilize와 동일하게 사용자가 명시적으로 `/repair-milestone <M-N>`을 호출할 때만 실행한다(파괴적·광범위 수정 권한이라 묵시 트리거 차단).

**재개방 금지 (ADR-068 D1)**: 본 skill은 `/implement-workitem`·`/validate-workitem`·`/repair-workitem`·`/finalize-workitem`을 **호출하지 않는다.** task `## 0. Status`·validation report도 건드리지 않는다. task 문서에 쓰는 것은 **2-B의 `- invalidated` 한 줄뿐이다**(`## 8`의 AC 이벤트 로그 — D1의 예외 2종 중 하나). 특정 task에 귀속되는 결함이라도 **본 skill이 직접 고치고** `IMPROVEMENT_GUIDE.md` `## 5`에 `affected: T-NNN`으로 역참조한다. 사용자에게 «그 task를 다시 열어라»를 권하지 않는다 — 그 권고 자체가 금지 대상이다.
**연쇄도 없다** — 재개방이 없으므로 닫을 것이 없다. 본 라운드 수정의 즉시 검증은 2-V가, 전체 검증과 졸업 판정은 다음 `/stabilize-milestone`이 담당한다.

본 skill은 위임하지 않으므로 병렬 라우팅 자체가 없다 — Codex와 동일하게 동작한다.

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
2. **모든 Adopt/Adopt-modified 결함을 본 skill이 직접 수정한다 (ADR-068 D1 — 라우팅 분기 없음).** per-task 결함이든 cross-cutting이든 처리 주체는 같다. 대표 유형 4종:
   - **per-task 결함** (특정 `T-NNN`에 귀속되는 코드/AC 결함): 그 코드를 직접 고친다. **task status·계획 본문은 건드리지 않는다**(task 문서에 쓰는 것은 2-B의 `- invalidated` 한 줄뿐이다). 추적은 수행 4의 `affected: T-NNN` + `files:` + `scope:` 세 필드가 담당한다.
   - **doc-consistency finding** (deterministic preflight의 `[Doc-link]`/`[ADR-ref]`/`[Arch-iface-violation]`): 해당 문서를 직접 수정. **단 봉인으로 잠긴 계약 본문은 고치지 않는다** — feature `## 7. FAC`·`## 7-1` 매핑표·milestone `## 3`처럼 `ready` 봉인 대상인 절을 고쳐야 성립하는 finding(대표적으로 `[Spec-gap]`)은 **수정하지 않고 사용자 보고 + 다음 M 후보**로 남긴다(ADR-060 D6/D7 잠금 / ADR-057#amend-3 결정 6 / ADR-068 D6). 고칠 수 있는 것은 코드·테스트·잠기지 않은 문서(원장·ARCH 산문·링크·인덱스)뿐이다.
   - **e2e wiring scaffold/install**: 직접 scaffold·install.
   - **architecture debt**: 현재 M 약속(기존 task·AC) 위반이면 본 라운드에서 직접 수정하고, 구조 변경이 커서 *새 범위*가 되면 architect 호출을 텍스트로 제안하며 사용자에게 보고 + 다음 M 후보로 남긴다.
2-S. **scope 판별 (ADR-068 D6 — 수정마다 1회)**: 각 수정에 대해 «이 변경 줄을 기존 계약으로 거꾸로 추적할 수 있는가»를 판정해 `scope: in-AC | out-of-AC`를 정한다. 계약의 범위는 여섯이다: task `## 6. AC` · task `## 3`의 line item · feature `## 7. FAC` · feature `## 7-2`의 INV · 승인 프로토타입 · `DESIGN.md` 계약. **애매하면 `out-of-AC`.** `out-of-AC`면 `IMPROVEMENT_GUIDE.md` `## 4. 보류 항목`에 계약 부채를 `status: open`으로 등재한다(형식은 그 섹션 주석의 「② 계약 미반영」 스키마).

2-P. **동일 패턴 전수 검색 (ADR-066 D6)**: **`Adopt`·`Adopt-modified`한 각 결함에 대해**(per-task 귀속이든 cross-cutting이든 — 본 skill이 전부 직접 고치므로 대상도 전부다) 같은 패턴의 다른 출현을 저장소 전체에서 **읽기 전용**으로 검색한다. 마일스톤 범위 안이면 본 라운드에서 함께 고치고, 범위 밖이면 고치지 않고 `IMPROVEMENT_GUIDE.md`에 `P1 [Pattern-spread]` 항목으로 등재한다(반드시 먼저 할 일 3-1이 다음 라운드에 회수하는 그 항목이다). 검색 결과는 수행 4의 `## 5` 항목 하위 줄에 `- pattern-scan <날짜> <패턴>: 범위 내 N건 수정 / 범위 밖 M건 <경로>` 형식으로 영속하고(ADR-066#amend-1 — 폐쇄 후 task `## 8`에 쓰지 않는다) 마지막 출력에도 한 줄 남긴다.

2-R. **회귀 테스트 선행 (ADR-066 D4 준용 / ADR-068 D6)**: **수행 2의 직접 수정마다**(per-task 귀속이든 cross-cutting이든 — ADR-068 D6은 마일스톤 층 수리 전부에 이 규율을 건다) **그 결함을 재현하는 실패 테스트를 먼저 추가해 실패를 관측한 뒤**(Red) 고치고, **그 테스트가 통과하는 것까지 확인한다**(Green). Red·Green 두 관측 결과를 수행 4의 결정 이력에 1줄로 남긴다 — Red만 적고 Green을 확인하지 않으면 «고쳤다고 적었지만 안 고쳐진» 항목이 통과한다.
   - **면제**: 코드 3줄 이하 + 외부 행동 불변인 표기·간격·문구 수정, 그리고 **문서만 고치는 finding**(`[Doc-link]`·`[ADR-ref]`·`[Spec-gap]` 등 — 실행 가능한 테스트 대상이 아니다). 면제 사유를 결정 이력에 적는다.
   - 테스트 작성이 불가능하면 그 사유를 적고 다음 라운드 확인 대상으로 남긴다.
   - 폐쇄 전 라운드에서 `/repair-workitem`이 이미 처리한 항목은 대상이 아니다(중복 금지).

2-E. **실행 증거 갱신 (ADR-064 D4 — 외부 경계 코드를 고쳤을 때만)**: 본 라운드의 직접 수정(per-task 귀속 포함)이 (a) 영속 저장소 쓰기 · (b) 외부 네트워크 호출 · (c) 실행 진입점 코드를 건드렸으면, 그 경계의 실행 증거를 다시 확보하고 **수행 4의 `## 5` 항목 하위 줄에** `- exec-evidence <날짜> <경계 a|b|c>: …`를 적는다(ADR-068 D1/D6 — 폐쇄 후에는 task 문서에 쓰지 않는다. 형식 문자열은 ADR-064 D4의 것을 그대로 쓰고 위치만 바뀐다). 증거 등급·안전 규정·waiver 규정은 `/implement-workitem` 6-E와 동일하다. 확보하지 못하면 `Needs Execution Evidence: <경계 종류> — <사유>`를 출력에 남긴다.
   - 폐쇄 전 라운드에서 `/repair-workitem`이 남긴 task `## 8`의 `- exec-evidence` 줄은 건드리지 않는다(이력이다).
   - 등급 1 증거로 새 파일을 만들었어도 **task `## 4-1`은 건드리지 않는다**(계획 본문 불가침 — 본 skill의 책임 경계). 그 경로는 `## 5. Repair decision log` 항목에 적는다.

2-A. **채점표를 삭제하지 않는다 (ADR-068 D3)**: 졸업 판정이 채점표를 읽지 않으므로 무효화할 대상이 없다. `docs/40-validation/reports/`를 건드리지 않는다.

2-B. **AC acceptance 무효화 (ADR-065 D3 — writer 3종 중 하나)**: 그 수정이 어떤 AC의 동작 경로를 건드렸고 그 AC의 modality가 `[사용자 관측]`·`[플랫폼 관측]`이면 그 task `## 8`에 `- invalidated <날짜> <AC-N>: repair-milestone cross-cutting 수정으로 재확인 필요`를 append한다(기존 `- ac-acceptance`는 지우지 않는다 — 이력이다). **새 receipt를 대신 쓰지 않는다**(사용자 authority).

2-V. **자체 검증 — 즉시 파손 감지 (ADR-068 D6 검증 집합)**: 위 2·2-S·2-P·2-R·2-E·2-B를 마친 뒤 1회 수행한다. 내용은 넷이다: (i) 본 라운드에 추가한 회귀 테스트가 전부 Green이고 **통합 `validate`에 묶여 있는지** 확인한다(묶이지 않으면 졸업 item 2가 검사하지 못한다), (ii) 변경 파일과 교차하는 task의 `## 6-1` 자동 테스트 매핑 대상을 실행한다, (iii) 외부 경계·핵심 journey를 건드렸으면 해당 integration/e2e smoke를 실행한다, (iv) 통합 검증 명령이 `--changed`를 지원하면 `validate --changed`를(미지원이면 통합 `validate`를) 1회 실행한다. **이것은 전체 검증이 아니다** — 「방금 한 수정이 즉시 깨졌는가」만 본다. e2e 전량·qa 팬아웃·문서 정합·졸업 판정은 `/stabilize-milestone` 책임이다.
   - **고치는 대상은 본 라운드 수정이 만든 실패로 한정한다.** baseline은 직전 `/stabilize-milestone` 단계 3의 통합 validate 결과다(같은 메인 세션이면 컨텍스트에 있고, 없으면 본 라운드 시작 시 1회 실행해 잡는다). baseline에 이미 있던 실패는 고치지 않고 출력에 명시한다.
   - 실패를 고치면 다시 실행한다. **최대 3회.** 초과하면 `Needs Follow-up: <실패 목록>`으로 명시하고 종료한다.
   - 통합 명령이 없으면 (ii)를 skip하고 사유를 출력에 남긴다(별도 hardstop 없음).

3. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan/repair-workitem과 동형). defer 금지 — 4결정 카테고리 외의 deferred drop은 허용 X. 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다(`M1 "P0만"`).
4. **결정 이력 영속화 (ADR-047 D7 durable correction history + D1 inspectability)** — 본 라운드의 P0/P1 항목 전부를 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 `## 5. Repair decision log` 안 `### M-N` 그룹(없으면 신설)에 IMPROVEMENT_GUIDE 스키마로 append. P2는 영속화 X (cap 보호 — 재출현해도 milestone 졸업 게이트를 막지 않아 무해).

   **영속 형식** (IMPROVEMENT_GUIDE `## 항목 스키마` SSOT 정합):
   ```
   - **M1-repair-1** | P0 | [관측됨] | linked: M1 | affected: T-004 | files: <경로 목록 또는 docs-only> | scope: <in-AC|out-of-AC> | status: applied | decision: Adopt
     - 발견 (stabilize <surface>): <한 줄 설명>.
     - 결정: <Adopt|Adopt-modified|Reject-FP|Reject-context 사유 한 줄> / 회귀 테스트: <추가한 테스트 또는 면제 사유>.
     - pattern-scan: 범위 내 N건 수정 / 범위 밖 M건 <경로>.   ← 검색을 수행한 항목만
   ```
   ID 컨벤션: `<milestone-id>-repair-<N>` (예: `M1-repair-1`, `M1-repair-2`) — milestone ID 그대로 prefix + `-repair-` + 본 라운드 시퀀스. `linked` 필드로 원본 milestone 역참조. **evidence label은 기본 `[관측됨]`** (finding 자체가 stabilize의 *로컬 문서/코드 관측*에서 나옴).
   **`affected: T-NNN` · `files:` · `scope:` 세 필드가 전부 필수다 (ADR-068 D6)** — 본 skill은 task를 재개방하지 않으므로 이 셋이 "어느 task의 산출물을, 어느 파일에서, 어떤 계약 근거로 고쳤는지"를 추적하는 유일한 경로다. `scope: out-of-AC`면 `## 4. 보류 항목` 등재도 함께 한다(2-S). 어느 task에도 귀속되지 않는 순수 cross-cutting은 `affected: —`.
   **폐쇄 후에는 위임이 없으므로 routing 기록도 없다** — per-task 결함이든 cross-cutting이든 본 `## 5`에 결정 전문을 적는다. 폐쇄 전 `/repair-workitem` 라운드가 task `## 8`에 남긴 이력은 그대로 두고 여기 옮겨 적지 않는다.

5. **원본 finding status 갱신** — Adopt/Adopt-modified로 해소한 IMPROVEMENT_GUIDE `### M-N`의 open 항목은 `status: open` → `status: resolved`로 갱신(closed records인 `## 5`로 옮기지 않고 *open 항목의 status만* 토글 — open items와 closed records의 의미 분리 유지). QA_FINDINGS `## M-N`의 해소된 항목도 동일하게 `status: resolved` 표기.
6. **stabilize-reviews 파일 삭제 (echo-then-rm, ADR-054)**: 한 파일의 *전 severity finding이 4-판정 완결됐을 때만* 그 파일을 삭제한다 — 부분 범위(`M1 "P0만"` 등)로 미처리 finding이 남은 파일은 *삭제하지 않고 보존*하고 출력에 "미처리 잔존 — 보존: <경로>"를 명시한다(stabilize-reviews는 gitignore된 ephemeral이라 삭제 시 그 안의 peer finding이 어디에도 안 남는다 — repair-workitem report 삭제 가드와 동형). **삭제 전 경로 echo 강제** — `삭제 예정: <경로>` 출력 후 Bash `rm`으로 한 개씩 정확히 삭제. 미리 회수한 경로 목록을 사용(삭제 후 재glob 금지 — 삭제된 파일이 목록에 없는 다른 파일까지 재수집 오인 방지).

책임 경계:
- 새 기능을 추가하지 않는다.
- milestone 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 **커밋은 사용자가 별도로 한다** (ADR-047 D7).
- workitem `## 0. Status`를 변경하지 않는다. **본 skill에는 재개방 경로가 없다** (ADR-068 D1 — 폐쇄 후 마일스톤 층).
- 본 경로에는 `/finalize-workitem` 호출이 없으므로 **commit owner는 사용자 하나다.**
- 폐쇄 전 라운드에서 `/repair-workitem`이 이미 처리한 항목은 대상이 아니다(중복 금지).
- QA_FINDINGS / IMPROVEMENT_GUIDE에서 본 milestone(`## M-N` / `### M-N`) 외 다른 milestone 그룹은 건드리지 않는다.
- task 문서·task status·validation report를 수정하지 않는다 — **예외는 2-B의 `- invalidated` 한 줄뿐이다**(task `## 8`의 AC 이벤트 로그. ADR-068 D1).

마지막 출력:
- 4-판정 카운트: Adopted M / Adopt-modified K / Reject-FP I / Reject-context J
- 직접 수정 파일 목록(per-task 귀속·cross-cutting 모두) + 어떤 finding을 어떻게 해소했는지
- 수정 파일 (files 필드 합계): <경로 목록>
- scope 분해: in-AC N건 / out-of-AC M건 (→ `## 4` 등재 ID 목록)
- 수정 파일과 원장 갱신을 **사용자가 직접 커밋한다.** 재개방이 없으므로 `/finalize-workitem` 커밋분은 존재하지 않는다.
- 동일 패턴 전수 검색 (2-P): 범위 내 N건 수정 / 범위 밖 M건(경로 + `[Pattern-spread]` 등재 결과)
- 회귀 테스트 (2-R): 추가 N건 / 면제 M건(사유) / 작성 불가 K건(사유)
- 실행 증거 갱신 (ADR-064 D4): 갱신 N건(경계 종류) / 해당없음(외부 경계 코드 미수정) / `Needs Execution Evidence`
- 자체 검증 (즉시 파손 감지): pass / skip(사유) / `Needs Follow-up: <목록>`
- Reject한 항목 + 근거 (있으면)
- `## 5. Repair decision log` `### M-N` append 줄 수 (P0+P1 합)
- status: open → resolved 토글한 finding 수
- architect 호출 권장 (architecture debt가 구조 변경을 요할 때)
- 미해결 항목 (있으면)
- AC acceptance 무효화 (ADR-065 D3): N건(AC-N 목록) / 해당없음 — **무효화가 1건 이상이면 그 마일스톤의 graduation은 `PENDING_ACCEPTANCE`가 되므로 `/stabilize-milestone` 뒤에 `/accept-milestone <M>`으로 receipt를 재발급한다.** 재발급 자체는 재validate를 요구하지 않는다(졸업 item 4가 task `## 8`을 직접 읽는다 — ADR-068 D3).
- 후속 권장 액션 (순서 고정): ① `/stabilize-milestone <M-N>` 재실행으로 졸업 판정 갱신 → ② 판정이 `PENDING_ACCEPTANCE`면 `/accept-milestone <M-N>`, `YES`면 `/plan-milestone`로 다음 마일스톤. **사용자가 손으로 돌려야 할 `/validate-workitem`·`/finalize-workitem`은 없다 — 이 경로에 재개방이 없다.**

정책 근거: 비판적 재점검·전 severity 완결은 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-workitem·repair-plan 대칭. milestone 졸업 contract는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md). 결정 이력 영속·commit owner 분리는 [ADR-047](../../../docs/90-decisions/boilerplate/ADR-047-code-as-agent-harness.md) D7. 단순성·범위 추적은 [ADR-006](../../../docs/90-decisions/boilerplate/ADR-006-simplicity-and-architecture.md). repair-milestone 신규 skill 거버넌스: [ADR-052](../../../docs/90-decisions/boilerplate/ADR-052-stack-provisioning-and-e2e-readiness.md) D4. 동일 패턴 전수 검색(2-P)은 [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D6. 폐쇄 후 재개방·연쇄 폐지는 [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D1(ADR-057#amend-3 결정 5를 부분 supersede). 재개방 폐지·post-close 수리 계약은 ADR-068 D1·D6.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 finding 본문에서 발화 시 인용 — 사전 fork-load 금지.
