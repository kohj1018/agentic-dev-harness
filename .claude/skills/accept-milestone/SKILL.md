---
name: accept-milestone
description: 마일스톤 결과를 사람이 직접 실행·확인하는 수용 단계. 환경을 띄우고 시나리오를 안내하고 피드백을 3갈래로 라우팅한다. 코드 수정·커밋 없음 (ADR-066).
argument-hint: "<milestone-id>"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
---

이 skill은 **사람이 직접 확인하는 단계**다. `/stabilize-milestone`(AI 검증) 뒤에 **마일스톤 단위로만** 실행한다 — task 단위 수용 스코프는 없다(ADR-066 D1). 관측 modality AC(`[사용자 관측]`·`[플랫폼 관측]`)의 receipt는 task를 마감할 때가 아니라 **이 라운드에서 한꺼번에** 발급된다.
**코드를 수정하지 않고 커밋하지 않으며 workitem status를 바꾸지 않는다.** 정상 write 대상은 아래 넷이다.

1. `docs/40-validation/acceptance-reviews/<M>.r<N>.md` — 본 라운드 세션 원본(gitignore ephemeral)
2. `docs/40-validation/QA_FINDINGS.md` / `docs/30-workitems/ROADMAP.md` `## Backlog` / `docs/40-validation/IMPROVEMENT_GUIDE.md` — 피드백 3갈래 라우팅 (ADR-066 D2). **예외 1건**: 정본 문서(charter·ARCH·DESIGN)를 고쳐야 성립하는 계약 변경만 `docs/10-charter/DECISION_REGISTER.md`에 등재한다(아래 R5-2 예외 — ADR-005#amend-1 / ADR-060 D11)
3. 마일스톤 문서 `## 11. 수용 기록` — 수용 판정 receipt
4. 해당 task `## 8` — `사용자 관측`·`플랫폼 관측` AC의 `- ac-acceptance` 줄 (사용자 응답을 그대로 옮겨 적는다 — ADR-065 D3)

**이 라운드는 관측 modality AC가 0건인 마일스톤에서만 «권장(선택)»이다**(ADR-068 D8). `[사용자 관측]`·`[플랫폼 관측]` AC가 **1건이라도 있으면** 그 receipt 없이는 졸업 item 4를 충족하지 못하므로(ADR-068 D3) 사실상 필수 경로가 되며, 그때까지 그 마일스톤의 graduation은 `PENDING_ACCEPTANCE`다(ADR-068 D4). 졸업 판정 자체는 `/stabilize-milestone`이 소유한다.

입력 (ADR-066 D1):
- `$ARGUMENTS` = milestone id. **`M[0-9]+` 패턴만 허용**(미일치 즉시 종료). **다른 스코프는 없다** — `--task` 같은 인자를 받으면 «마일스톤 단위로만 실행한다»를 안내하고 종료한다.
- **라운드 번호는 마일스톤 문서 `## 11. 수용 기록`의 `- 라운드:` 값 + 1이다.** 세션 파일 수로 세지 않는다 — 그 파일은 라운드가 끝나면 삭제되므로(승인 시 본 skill, 보류 시 `/repair-acceptance`) 상한이 무력화된다. **`- 라운드:` 판독은 HTML 주석(`<!-- ... -->`) 밖의 줄만 센다** — 템플릿이 `## 11` 안에 형식 설명을 주석으로 넣어 두므로, 주석 안의 예시 줄을 세면 아직 한 번도 안 돈 마일스톤이 2회차로 시작한다. 주석 밖에 `- 라운드:`가 없으면 1회차다. **상한 3** — 4회차 진입 시 남은 항목을 다음 마일스톤으로 이관할지 사용자에게 확인하고 종료한다.

## 수용 라운드 흐름 (`<M>`) — 아래 R0~R6

## R0. 맥락 회수 (ADR-019 minimal — 필요한 것만)
1. 마일스톤 문서 `## 3`(포함 기능)·`## 5`(완료 기준)·`## 8`(회고 — graduation 값)·`## 9`(화면 전환, 있으면).
2. 산하 feature `## 7-1`(FAC↔AC)·`## 7-3`(PX↔AC, UI 한정)·`## 7`의 `프로토타입:` 참조 줄.
3. 산하 task `## 6-1`에서 **`[사용자 관측]`·`[플랫폼 관측]` modality AC 전량**과 `## 8`의 기존 `- ac-acceptance`/`- invalidated` 줄.
4. 각 task `docs/40-validation/reports/<task-id>.md`의 `## Evidence Bundle → 검증하지 못한 것(oracle gap)` 섹션 — **기계가 확인하지 못한 것의 목록이며 본 단계의 1차 시나리오 재료다.**
5. `QA_FINDINGS.md` 본 마일스톤 헤더 — AI가 이미 찾은 것(중복 보고 방지용으로만 쓴다. 사용자에게 미리 알려 주지 않는다 — 선입견 차단).
6. `docs/40-validation/visual/M-N/`(있으면) — §3-V 갤러리 경로.
- **graduation 값에 따라 분기한다 (ADR-068 D4 — 4종)**:
  - **`PENDING_ACCEPTANCE`** — 이 단계를 부르라고 나온 값이다. 그대로 R1로 간다(본 라운드의 표준 진입 상태).
  - **`YES`** — 이미 졸업한 마일스톤이다(관측 AC가 0건이거나, 이전 라운드에서 전부 receipt를 받았다). "졸업 확정 상태 — 본 라운드는 선택입니다"를 알리고 사용자가 원하면 R1로 간다.
  - **`NO`/`BLOCKED`** — 그 사유를 출력하고 "먼저 `/repair-milestone` 또는 환경 복구 후 `/stabilize-milestone` 재실행 권장"을 안내한 뒤 **사용자가 계속을 원할 때만** R1로 간다(미완 상태 확인도 유효하다).

## R1. 실행 환경 기동
1. 기동 명령을 **회수**한다(발명하지 않는다): `docs/00-meta/STACK_SETUP_PLAN.md`의 기록 → `package.json` scripts(`dev`/`start`) → Flutter는 `flutter run -d <device id>`(device는 `flutter devices --machine` 실측) → CLI/라이브러리는 진입 명령.
2. **표면별 확인 수단**:
   | 표면 | 사용자에게 제공할 것 |
   |---|---|
   | 웹 UI | dev server URL + 확인할 라우트 목록 |
   | 모바일 | 실행 device·에뮬레이터 + 진입 화면 |
   | API 서버 | 서버 기동 + 요청 예시(curl 또는 `.http` 파일 경로) |
   | CLI | 실행할 명령 시퀀스 + 테스트용 작업 디렉터리 경로 |
   | 배치·스케줄러 | dry-run 명령 + 산출물 확인 경로 |
   | 라이브러리 | 스니펫 파일 경로 + 실행 명령 |
3. **데이터 전제**: 확인에 데이터가 필요하면 **테스트 전용 자원에만** seed한다(일회용 DB·로컬 컨테이너·에뮬레이터·임시 디렉터리). 프로젝트가 제공하는 seed/fixture 수단을 재사용하고, **없으면 새 도메인 seed를 발명하지 않는다** — 그 사실을 알리고 사용자에게 준비를 요청한다. 운영 환경 접속·파괴적 호출·자격증명 요구 자동 실행은 금지(ADR-064 D1 안전 규정).
4. **readiness 확인**(포트 응답/프로세스 기동) 후 사용자에게 알린다. 기동 PID를 보관한다.
5. 기동 실패·불명이면 **blocked-on-env**로 처리한다 — 정확한 명령을 출력해 사용자가 직접 실행하도록 안내하고 R2로 계속한다(단계를 중단하지 않는다).
- **Codex**: 백그라운드 장기 기동 parity가 없다 → 기동을 대행하지 않고 **정확한 명령 시퀀스를 출력해 사용자가 실행**하도록 degrade한다(이후 라운드는 동일).

## R2. 안내된 시나리오 확인 (핵심)
1. 시나리오를 **필수 + 보완** 두 묶음으로 뽑는다. **필수는 개수 상한이 없다** — 상한을 걸면 receipt가 필요한 AC가 잘려 나가 그 task가 영구 미충족이 된다.
   - **필수**: 이 마일스톤 산하 task의 `[사용자 관측]`·`[플랫폼 관측]` modality AC 중 **아직 유효한 receipt가 없는 것 전부**(task `## 8`의 그 AC 마지막 이벤트가 `- ac-acceptance`가 아닌 것 — 미발급이거나 `- invalidated`로 무효화된 것). **판독 규칙**: 그 AC의 `## 8` 마지막 이벤트가 `- ac-acceptance`가 아닌 것이 대상이며 — `- ac-pending`(finalize가 남긴 미발급 표시)·`- invalidated`·이벤트 없음이 전부 여기 해당한다 — **HTML 주석 밖의 줄만 센다**(ADR-065 D3 판독 규칙). `- ac-pending`은 receipt가 아니므로 그 AC는 여전히 미발급이다. 이미 유효 receipt가 있는 AC는 재확인하지 않는다(직전 수용 라운드에서 발급됐거나 사용자가 직접 기재한 경우다 — ADR-065 D1. **task 층 발급 경로는 없다** — 이 라운드가 유일한 발급 자리다). 하나라도 확인하지 못하면 R6 판정은 `승인`이 될 수 없다.
   - **보완(5~8개)**: ① `## 9. 화면 전환`의 존재하는 각 path type(primary/failure/recovery) → ② oracle gap 카테고리 중 이 마일스톤 표면에 해당하는 것 → ③ PX↔AC의 경험 결정 → ④ FAC의 핵심 시나리오. 이 우선순위로 채운다.
   - 필수가 이미 많으면(예: 10건) 보완을 줄인다. 필수를 줄이지 않는다.
2. **한 번에 하나씩** 제시한다. 형식은 3줄로 고정한다.
   ```
   [N/M] <무엇을 할까요 — 구체적 조작 1~2줄>
   기대: <무엇이 보이거나 일어나야 하는가>
   근거: <AC-N | PX-... | 프로토타입 경로 | oracle gap 카테고리>
   ```
3. 사용자 응답을 받는다. **"기대와 달랐다"면 R4의 재현 3필드를 그 자리에서 채운다.**
4. `[사용자 관측]`·`[플랫폼 관측]` AC는 **충족/미충족을 명시적으로 물어** 그 자리에서 판정을 확정한다(뭉뚱그리지 않는다 — 이 응답이 receipt가 된다).
5. UI 마일스톤이면 승인 프로토타입 경로(`docs/20-system/prototypes/M<N>/<screen>.html`)를 함께 제시해 사용자가 나란히 비교할 수 있게 한다.

## R3. 자유 탐색
"이제 자유롭게 만져 보세요. 이상한 점·기대와 다른 점을 말씀해 주세요"로 열고, 사용자가 말하는 것을 받는다. **AI가 먼저 결함을 지목하지 않는다**(사용자 관점을 오염시키지 않는다).

## R4. 피드백 구조화
각 피드백을 아래 3필드로 되물어 확정한다. 사용자는 편하게 말하고, 구조화는 skill이 한다.
```
- 무엇을 했나: <조작 순서>
- 기대: <사용자가 기대한 것>
- 실제: <관측된 것>
```
- 재현이 불확실하면 그 자리에서 1회 재시도를 요청한다. 그래도 불확실하면 `재현 불확실`로 표시하고 **버리지 않는다.**
- UI면 해당 화면 스크린샷 경로 또는 프로토타입 대조 결과를 함께 적는다.

## R5. 3갈래 분류 + 라우팅 (ADR-066 D2)
각 피드백을 아래로 분류하고 **사용자에게 확인받은 뒤** 기록한다.
1. **계약 위반(결함)** — 이번 마일스톤이 약속한 AC·승인 프로토타입·DESIGN 계약을 안 지킴 → `QA_FINDINGS.md` 본 마일스톤 `### P0/P1/P2`에 기존 스키마로 등재(항목 문두에 `(수용)` 태그). 라벨은 기존 체계를 쓴다(`[Experience-drift]`·`[Design-voice]` 등). severity 기준: 사용자가 진행 불가·데이터 손상·약속한 핵심 시나리오 실패 = P0.
2. **계약 변경(범위)** — 계약 자체를 바꾸려는 것(방향 변경·새 기능) → **`docs/30-workitems/ROADMAP.md`의 `## Backlog`에 한 줄 등재**한다. 형식: `- `<candidate-key>` <한 줄 요약> — 출처: 수용 라운드 M<N> r<라운드> / 확신도: <높음/중간/낮음>`. `<candidate-key>`는 목표 슬러그이며(예: `offline-merge`) 이후 `/plan-milestone` R0이 이 key로 회수·승격한다. **현재 마일스톤에서 고치지 않는다.**
   - **`DECISION_REGISTER.md`에 쓰지 않는다.** 두 원장의 배타 범위는 «해소되면 무엇이 남는가»로 갈린다 — 정본 문서(charter·ARCH·DESIGN)의 한 절이 바뀌면 register, 다음 마일스톤 문서 하나가 생기면 Backlog다. 계약 변경 제안은 후자다.
   - **예외 — 정본 문서를 고쳐야 성립하는 항목**(예: charter `## 5. 비목표`를 뒤집는 요구)은 `DECISION_REGISTER.md`에 `status: open` + `- 발견: 수용 라운드 (M<N>)`으로 등재한다(ADR-060 D11). **한 항목을 양쪽에 동시에 쓰지 않는다.**
3. **개선 제안** — 계약 위반은 아니고 더 나은 방식 → `IMPROVEMENT_GUIDE.md`에 등재. **이번 마일스톤에서 고칠지 사용자에게 묻고**(3갈래 중 이 갈래만 «사용자 선택»이다 — ADR-066 D2), **고치기로 택한 항목에만 문두에 `(수용)` 태그를 단다** — 그 태그가 `/repair-acceptance`의 유일한 회수 신호이며, 없으면 그 선택이 실행되지 않는다(ADR-066 D5). 택하지 않은 항목은 태그 없이 남겨 다음 마일스톤 후보가 된다.
- **분류가 애매하면 사용자에게 그대로 묻는다**: "이건 약속한 것을 안 지킨 걸까요(이번에 고칩니다), 아니면 계약을 바꾸는 걸까요(다음 마일스톤입니다)?"
- `[사용자 관측]`·`[플랫폼 관측]` AC의 충족 판정은 해당 task `## 8`에 `- ac-acceptance` 줄로 기록한다(형식은 ADR-065 D3). **미충족이면 receipt를 쓰지 않고** 1번(결함)으로 라우팅한다.

## R6. 정리 + 판정
1. **R1이 기동한 프로세스를 종료한다**(보관한 PID). 이미 떠 있던 것을 재사용했으면 종료하지 않는다. 종료 결과를 출력에 보고한다.
2. 세션 원본을 `docs/40-validation/acceptance-reviews/<M>.r<N>.md`에 기록한다 — 확인한 시나리오·사용자 발언·재현 3필드·분류 결과. **저장 전 마스킹 의무**: 자격증명·토큰·개인정보·내부 식별자는 제거하거나 대체한다. 확실하지 않으면 원문을 싣지 않고 구조 요약만 남긴다(ADR-066 D3 — ADR-064 D5 준용). task `## 8`의 `- ac-acceptance` 줄은 커밋되므로 더 엄격히 적용한다.
3. 마일스톤 `## 11. 수용 기록`을 **덮어쓴다**(append가 아니라 최신 상태 1블록 유지 — `## 10` 봉인 기록과 동형). `- 라운드:`는 **판정이 `승인`·`보류`일 때만** 이번 회차 번호로 갱신하고, `미완`이면 **이전 값을 그대로 둔다**(확인을 못 했으므로 회차로 세지 않는다). 판정은 셋이다.
   - **승인** — 1번(결함) 라우팅 0건 **이고** R2의 필수 시나리오(= 유효 receipt가 없던 관측 modality AC 전부)를 모두 확인했다. `- 판정: 승인`. **이 판정이 나면 그 마일스톤의 관측 AC는 전부 receipt를 갖는다** — 즉 `/stabilize-milestone` 재실행 시 graduation이 `PENDING_ACCEPTANCE`에서 벗어난다.
   - **보류** — 결함 1건 이상. `- 판정: 보류(백로그 N건)`.
   - **미완** — 환경 기동 실패(blocked-on-env)나 사용자 중단으로 필수 시나리오를 다 확인하지 못했다. `- 판정: 미완(<사유> — 확인 K/M건)`. **결함 0건이어도 승인으로 쓰지 않는다** — 확인하지 못한 것을 승인으로 기록하면 이 단계의 의미가 사라진다.
3-1. **판정이 `승인`이고 `(수용)` 태그를 단 개선 항목이 0건이면 본 skill이 세션 파일을 삭제한다** — 그때는 `/repair-acceptance`가 호출되지 않으므로 삭제 주체가 없어진다. `삭제 예정: <경로>` echo 후 `rm`으로 이번 라운드 파일 하나만 지운다(판정 결과는 `## 11`과 3원장에 이미 영속). `보류`·`미완`이거나 **`승인`이지만 `(수용)` 태그 개선 항목이 1건 이상이면 보존한다**(각각 `/repair-acceptance`가 회수·삭제 / 다음 라운드가 이어받는다).
4. 최종 출력:
   - 판정 + 라운드 번호(상한 3 중 N회차)
   - 확인한 시나리오 수 / 발견 3갈래 카운트
   - `[사용자 관측]`·`[플랫폼 관측]` AC의 receipt 발급 결과(AC-N 목록)
   - 종료한 프로세스 / 세션 파일 처리 결과(`승인`이면 삭제한 경로, `보류`·`미완`이면 보존한 경로)
   - **커밋 안내**: 본 skill이 갱신한 tracked 파일 목록(`QA_FINDINGS.md`·`docs/30-workitems/ROADMAP.md`(`## Backlog`)·`IMPROVEMENT_GUIDE.md`·마일스톤 문서·task 문서, 그리고 정본 문서 변경이 필요해 등재한 경우 `DECISION_REGISTER.md`)을 나열하고 **사용자가 직접 커밋해야 함**을 명시한다. 미커밋으로 두면 후속 task의 `/finalize-workitem`이 그 파일을 범위 밖 변경으로 보고 `Needs Review`로 멈춘다.
   - **receipt 처리 결과**: 발급한 task·AC 목록과 무효화(`- invalidated`)한 task·AC 목록. **receipt 발급만으로는 재validate가 필요 없다** — 졸업 item 4가 채점표가 아니라 task `## 8`을 직접 읽기 때문이다(ADR-068 D3). 본 skill은 코드를 고치지 않으므로 채점표를 stale하게 만들지도 않는다.
   - **다음 단계**:
     - 판정 = 승인: **① `(수용)` 태그를 단 개선 항목이 1건 이상이면 먼저 `/repair-acceptance <M>`** — 그 항목의 유일한 실행 경로이며(ADR-066 D5), 수리 후에는 그 skill 출력이 지시하는 순서를 따른다(코드를 고치므로 그 skill이 그 자리에서 회귀 테스트까지 끝낸다 — **task를 재개방하지 않으므로 사용자가 돌릴 `/validate-workitem`·`/finalize-workitem`은 없다**). → **② `/stabilize-milestone <M>` 재실행으로 졸업 판정 확정.** `(수용)` 태그 항목이 0건이면 **②만** 수행한다 — receipt 발급은 재validate를 요구하지 않는다(졸업 item 4가 task `## 8`을 직접 읽는다 — ADR-068 D3).
     - 판정 = 보류: 기본 권장 `/repair-acceptance <M>` — 수용 finding 수리 후 `/accept-milestone <M>` 재실행
     - 판정 = 미완: 환경 복구(또는 사용자 재개) 후 `/accept-milestone <M>` 재실행. **라운드 카운터를 소모하지 않는다**(확인을 못 했으므로 회차로 세지 않는다 — `## 11`의 `- 라운드:` 값을 올리지 않고 `- 판정: 미완`만 기록한다).
     - 프롬프트 동봉 권장: 미해소 결함 라벨 목록 + `재현 불확실` 항목

책임 경계:
- 코드 수정·커밋·workitem status 변경 금지.
- `- ac-acceptance` 줄은 **사용자 응답을 옮겨 적는 것**이다 — 사용자가 판정하지 않은 AC에 receipt를 쓰지 않는다(ADR-065 D1).
- 결함을 직접 수리하지 않는다 — `/repair-acceptance`로 라우팅한다.
- 다른 마일스톤의 원장 항목을 건드리지 않는다.
- **task를 재개방하지 않고 `/validate-workitem`·`/finalize-workitem`을 호출하지 않는다** — 본 skill은 receipt만 남기고 판정 갱신은 `/stabilize-milestone`이 한다. **본 skill의 task `## 8` `- ac-acceptance` append는 폐쇄 후 task 문서 불가침의 예외 2종 중 하나다**(ADR-068 D1 — 나머지 하나는 repair 2종이 쓰는 `- invalidated`).

정책 근거: [ADR-066](../../../docs/90-decisions/boilerplate/ADR-066-milestone-acceptance.md) D1/D2/D3 (단일 스코프·라우팅·세션 파일), [ADR-065](../../../docs/90-decisions/boilerplate/ADR-065-ac-verification-contract.md) D1/D3 (receipt authority·형식), [ADR-068](../../../docs/90-decisions/boilerplate/ADR-068-milestone-closure-and-graduation-v3.md) D3 item 4·D4 `PENDING_ACCEPTANCE`·D8 (졸업과의 관계), [ADR-005](../../../docs/90-decisions/boilerplate/ADR-005-ssot.md)#amend-1 (원장 배타 범위 — 계약 변경은 ROADMAP `## Backlog`), [ADR-060](../../../docs/90-decisions/boilerplate/ADR-060-decision-closure-and-milestone-seal.md) D11 (봉인 후 결정 등재).

## Context 정책 (ADR-019)
R0의 회수 목록이 *최소 충분*이다 — 사전 fork-load 금지. R1의 기동 명령 회수(`STACK_SETUP_PLAN.md`·`package.json` 등)와 시나리오·피드백에서 발화한 문서는 그 시점에 추가로 읽는다.
