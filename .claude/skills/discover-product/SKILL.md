---
name: discover-product
description: Run a multi-round discovery (persona / pain / JTBD / scenario / MVP / assumptions) and write DISCOVERY.md.
argument-hint: "[product description | --fast]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
---

이 skill은 메인 세션이 R0~R4 라운드를 직접 운전하는 절차서다.
무거운 추론(R0의 페르소나 후보, R1의 pain inventory)은 architect 단발 sub-call로 위임한다.
R0~R3 산출물은 메인 컨텍스트에 누적시키지 않고 `docs/10-charter/DISCOVERY.md`에 누적 적재한다.

**트레이드오프 명시** — 이 skill은 의도적으로 fork 격리를 풀고 메인 세션이 사용자 인터랙션을 직접 운전한다. R0~R3 산출물은 `DISCOVERY.md`에 적재해 메인 컨텍스트 부담을 최소화하지만, 라운드 요약 일부는 메인에 남는다. 종료 후 사용자가 `/clear` 또는 새 세션으로 컨텍스트를 정리할 것을 권장한다.

입력:
- `$ARGUMENTS`에 자연어 설명이 들어온다.
- `--fast` 플래그가 있으면 R0의 페르소나 후보 제시·선택을 건너뛰고 R3(가정 정리)도 생략한 채 R1+R2+R4만 도는 단축 흐름. 단, R1은 페르소나 입력이 필요하므로 다음 절차로 페르소나를 확보한다:
  1. `$ARGUMENTS`에 페르소나가 한 줄이라도 명시되어 있으면 그것을 그대로 사용한다(예: `--fast 회고 SaaS — 페르소나: 직장인 개인 사용자`).
  2. 명시되지 않았으면 architect 단발 sub-call로 페르소나 후보 1개를 *자동 선정*하고, 해당 페르소나를 가정으로 표시해 R1을 진행한다(출력에 "이 페르소나는 fast 모드의 R0 사용자 확인 단계를 생략한 자동 선정 결과이며, 가정으로 취급한다"를 명시).
  3. 사용자가 마음에 들지 않으면 `/discover-product` (fast 없이)로 재실행하면 된다는 안내를 출력에 포함.

사용자 응답 수단:
- 라운드별 응답은 자연어로만 받는다(`AskUserQuestion`은 [공식 문서](https://code.claude.com/docs/en/agent-sdk/user-input)의 Limitations 섹션 기준 sub-agent에서 사용 불가).
- 매 라운드 끝에 `skip` / `good` / `refine: ...`로 응답할 수 있다.

라운드 출력 포맷 (ADR-046 출력 스타일 — 사용자-facing 표면만 압축, 내부 분석·DISCOVERY.md 적재 내용은 불변):
각 라운드는 다음 고정 포맷으로 압축해 출력한다.
```
이번 결정: <1~2줄>
확인 필요: <있으면 ≤3개, 없으면 생략>
답변: skip / good / refine: …
```
단, 사용자가 *선택해야 하는* 옵션(R0 페르소나 후보·R1 pain 목록 등)은 선택 가능하도록 보존한다 — 압축은 framing·서술에만 적용하고 선택지 자체는 빠뜨리지 않는다(ADR-046#d3). architect 단발 sub-call의 *과정*만 대화에 풀어쓰지 않는다.

라운드 구성:

**R0 — 문제 한 줄 + 페르소나 확인**
- 입력 한 줄을 그대로 되돌려 "이 한 문장이 핵심 맞나" 확인.
- 동시에 페르소나 후보 2~3개를 한 단락씩 제시(직무·맥락·일과·압력 요소). architect 단발 sub-call로 위임해 후보 생성.
- 사용자가 1개를 고르거나 합쳐달라고 한다.

**R1 — 핵심 pain + JTBD + 시나리오**
- 선택된 페르소나의 pain 6~10개를 brainstorm 후 빈도×고통으로 정렬. architect 단발 sub-call.
- 상위 1~3개를 사용자가 고른다.
- 가장 큰 pain의 JTBD(Jobs To Be Done) 한 줄, happy path/alternate path/fail path를 5~7단계로 같이 적는다.
- 사용자가 끊을 지점·수용 가능 fail을 정한다.

**R2 — MVP 범위 vs 비범위 / 성공 기준**
- R1 시나리오를 충족시키는 최소 기능 묶음과 의도적으로 미루는 것을 분리.
- 측정 가능한 성공 기준 1~3개.

**R3 — 핵심 가정 + 열린 질문**
- R0~R2에서 사용자가 추측으로 답한 모든 항목을 가정으로 표시.
- 가장 위험한 가정 1~3개에 검증 방법 1줄.

**R4 — DISCOVERY.md 정리(저장 단계)**
- 위 결과를 `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` 양식에 맞춰 `docs/10-charter/DISCOVERY.md`에 저장.
- 이 skill은 charter/architecture/workitem을 만들지 않는다 — `/bootstrap-project`가 이어 수행한다(자동 호출 아님).

**단계별 출구 보장**: 어느 라운드에서 멈춰도 그때까지의 산출물이 `DISCOVERY.md`에 들어가 `/bootstrap-project`의 입력으로 의미가 있다.

**다국어**: 입력 언어를 따른다. 한국어 입력이면 산출물도 한국어, 영문 입력이면 영문.

마지막 출력:
- DISCOVERY.md 경로
- 핵심 가정과 열린 질문 요약
- 다음 권장 단계 (`/bootstrap-project` — DISCOVERY.md를 입력으로 사용)
- **(opt-in, ADR-044) 기획 품질 확신이 부족하면**: 다른 세션·다른 LLM에서 `/validate-discovery --reviewer-tag <tag>` 1+회 → 원본 세션에서 `/repair-discovery` 회수. 건너뛰어도 정상.

## --update 모드 (mid-project pivot, ADR-035#amend-2)
기존 DISCOVERY.md 있으면:
- **R-E (Evidence 회수)**: 지난 갱신 이후 추가된 §14 Evidence Log 신규 행 + `docs/10-charter/insights/`의 리서치 노트(/research-pack 산출)를 읽어 §15 Insight Backlog를 갱신(새 insight는 새 I-N, evidence는 §14에 적재).
- R0 (페르소나 재확인) → R1·R2 (opportunity backlog 갱신·새 pain 추가) → R3 (assumption tracker 갱신 — §14 evidence로 §12 검증 결과 갱신) → R4 저장.
- **`--fast --update`**: §12 Assumption Tracker + §14 Evidence Log만 빠르게 갱신 (가장 빈번한 mid-project use case).

## Idempotency (ADR-035)
ID 매칭 — 기존 ID(A-1·A-2)면 *검증일·다음 행동만 갱신*, 새 가정이면 새 ID 부여. DISCOVERY.md = persona/scenario/assumption SSOT, Charter는 snapshot view.

## 출력 스타일 (ADR-046)
라운드 표면 출력은 위 "라운드 출력 포맷"을 따른다 — 라운드 수·분석 깊이는 줄이지 않고 표면 분량만 압축한다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.
