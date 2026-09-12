# ADR-074 — 모델·추론 강도·턴 예산 정책 v2 (Model, Effort & Turn-Budget Policy)

> scope: boilerplate
> area: tooling/process

## Status
accepted

> 대체: [ADR-004](ADR-004-model-alias-policy.md)를 통합 재발행으로 supersede한다(개정 9개 — ADR-045 D6 임계 초과, amend-4~9는 grandfather 대상 아님). ADR-004는 `superseded`로 history 잔존. 본 ADR은 ADR-004 base + amend-1~9의 net 규칙에 **에이전트 정의의 세션 고정 관측(D12)**을 더한 것이다. 오케스트레이션(foreman·fan-out·slice 분할 주체)은 [ADR-075](ADR-075-main-session-orchestration-v2.md), 하청 회수 규율도 그쪽이 소유한다.

## 현재 유효 결정
- shared 설정 파일에는 모델·추론 강도 키를 두지 않는다(D1). 별칭은 agent frontmatter `model:`에서만(D2). `effort`는 허용 축이나 현재 어느 agent에도 지정하지 않는다(D5).
- 턴 예산은 «쓰기 도구 보유» 축으로 잡고 산식 `maxTurns = max(8, 회수 문서 수) + 3 × 산출물 수`, builder 60 예외(D8). 본문 예산 절에는 «산출물을 먼저 나열한다 + 턴 수를 적지 않는다»만 남긴다 — 행동 지시 3종(중간 보고·write-first·부분 보고 형식)은 실측에서 각각 미준수·미준수·성립 불가로 판명돼 제거했고, 상한 중단 회수는 호출자 몫이다(D9·D10).
- 에이전트 정의는 세션 시작 시점에 고정된다 — 파일 수정 후 검증은 새 세션에서(D12). 재측정은 조건당 새 세션(D13).

## 배경
- [관측됨] ADR-004는 base 결정 + 개정 9개가 쌓여 net 규칙을 한 번에 읽을 수 없다. amend-6→7→8→9는 같은 날 falsifier 발화로 연쇄됐고 서로를 부분 대체한다.
- [관측됨] amend-4는 «frontmatter `effort`가 세션 effort를 덮고 몇 초 안에 반영된다»를 [외부실증]으로 전제했고 amend-5는 «hot-reload 지연»으로 진단했다. Round 12 발견 74가 둘 다 정정한다 — 세션 중 편집한 에이전트 정의는 그 세션의 dispatch에 **반영되지 않는다**(본문 마커 + 0-tool probe, 편집 6분 뒤에도 미반영). 변형 파일(`builder-a`~`d`)도 세션 시작 후 생성되면 같은 이유로 보이지 않는다.
- [관측됨] builder `effort: medium`은 완료율 이득 없이 소요·토큰 약 2배(Round 11 n=1). Round 13 Flutter 재측정(n=1)은 **반대 방향**이다 — (b)·(d)가 (a)보다 누적 출력 토큰이 각각 29.1%·40.6% 적고 완료 AC는 같았다. 기준 조건 (a)는 dispatch 중 네트워크 단절로 **소요 시간이 비교 불가**여서 판정 축이 출력 토큰 하나뿐이었다. 스택별 상이로 기록하고 값은 뒤집지 않는다(D5).
- [관측됨] 팬아웃 단위가 보고 0건으로 상한에 걸린 관측 7건(Round 11·12) — 원인은 예산 축 오분류(쓰기 에이전트를 report-only로 취급)와 위임 단위 크기였다. Round 13 새 세션 0-tool probe에서 planner·builder는 amend-8·9 문구를 전부 보유했으나(reviewer만 amend-8 결정 3 누락), 실제 dispatch에서는 중간 보고 0/6·write-first 0/5·상한 도달 시 부분 보고 0/2로 문구 보유와 실행 준수가 완전히 분리됐다(D9).

## 결정

### D1. shared 설정 파일 비고정 (ADR-004 base + #amend-2·#amend-3 승계)
`.claude/settings.json`·`.codex/config.toml`에 모델·추론 강도 키를 두지 않는다. 사용자 계층과 CLI 기본값이 승계한다. Codex는 별칭이 없으므로 키 생략이 곧 자동 최신 경로다(ADR-010#amend-6).

### D2. 별칭의 자리 (base + #amend-1·#amend-3 승계)
`sonnet`/`opus`/`haiku` 별칭은 `.claude/agents/<name>.md` frontmatter `model:`에서만 쓴다. 전체 버전 ID 금지. agent 이름은 역할 중심이며 모델명을 붙이지 않는다.

### D3. 예외 절차 (base 결정 3 승계)
특정 버전·강도를 강제해야 하면 별도 ADR에 사유와 갱신 책임자를 남기고 그 자리에서만 고정한다.

### D4. Codex parity (#amend-4 결정 6 승계)
Codex는 `.claude/agents/*.md`를 읽지 않으므로(persona 매핑 없음 — ADR-010) 본 ADR의 agent 축은 Codex 경로에 영향이 없다. `.codex/config.toml`의 비지정 정책은 D1이 소유한다.

### D5. `effort` 축 (#amend-4 결정 1·4 + #amend-5 결정 1·2·3 승계 + 정정)
- `effort: low|medium|high|xhigh|max`는 agent frontmatter에서만 허용되는 축이다. **현재 어느 agent에도 지정하지 않는다** — 세션 effort를 상속한다.
- 판정 3갈래(역할별 실험 결과에 적용): 저하 없이 시간이 줄면 확장 후보 / 완료율·검증이 나빠지면 제거 / **저하 없이 시간·토큰이 늘면 제거**. builder는 세 번째 갈래로 제거됐다(Round 11: medium 338.9s·309.5s 대 상속 132.5s·161.8s). Round 13 Flutter(n=1): (a)는 dispatch 중 네트워크 단절로 **소요 비교 불가**(활성 시간 재구성이 233~688초로 흔들린다)라 **누적 `output_tokens` 하나로 판정했다** — (b) 18,464 · (d) 15,477 대 (a) 26,044로 각각 **29.1%·40.6% 적고**, tool_uses는 (b) 37 대 (a) 36으로 작업량이 사실상 같다. 완료 AC는 네 조건 모두 3/3·validate 통과이되 (c)는 계측 이벤트가 실앱에서 발행되지 않는 공허한 충족이라 「완료율 동일」을 무조건으로 읽지 않는다. task-notification이 보고하는 「subagent 토큰」은 마지막 요청 1건의 컨텍스트 규모이지 누적 사용량이 아니다(D13). Round 11과 반대 방향이라 값을 뒤집지 않고 **«스택별 상이 — 결론 보류, Round 14 재측정»**으로 적는다.
- 사용자 환경: 메인 세션은 사용자 계층에서 `high` 이상을 권장하고, `CLAUDE_CODE_EFFORT_LEVEL`을 전역 환경변수로 두지 않는다(두면 agent `effort`가 무력화된다).
- «frontmatter effort가 세션 effort를 덮는다»는 문서상 사양이며 본 저장소에서 직접 실측되지 않았다(effort를 지정한 조건은 세션 시작 뒤 편집이라 D12에 걸렸다). 실측은 D13 프로토콜로만 유효하다.

### D6. builder `maxTurns` (#amend-4 결정 2 → #amend-5 → #amend-7 결정 2 승계)
builder는 `maxTurns: 60`이다. 45에서 상한 중단 2건(Round 12 R4 — 작업이 거의 끝난 자리)이 관측돼 60으로 올렸다. Round 13: (c)·(d) 모두 20턴에서 잘렸다(완주에 각각 총 33·29 tool_uses가 필요했다) — **maxTurns 60 유지가 재확인됐다**. 60에서도 보고 0건 상한 도달이 1회라도 나면 값이 아니라 slice 크기 문제다(D9-2 — foreman 집행은 ADR-075 D1).

### D7. 예산 축 = 쓰기 도구 보유 (#amend-8 결정 1 + #amend-9 결정 2 승계)
`Write`·`Edit`를 가진 agent(builder·planner·architect·designer·reviewer)는 «쓰는 쪽»이고 산출물 규모로 예산을 잡는다. report-only(qa·validator·researcher·analyst·security·marketer·counsel·strategist)는 보고 1건이 산출물이다. reviewer는 쓰기 도구가 있고(review-doc 리뷰 파일) 회수 문서가 많은 dispatch(stabilize 단계 5 code·design surface, design-milestone R6-4 렌더 증거)를 받으므로 쓰는 쪽 산식을 적용한다(amend-8의 예외를 amend-9가 철회). `/validate-plan`은 세션 인라인 실행이라 이 예산의 대상이 아니다(Round 13 Phase 1 실측 — amend-9 배경의 «validate-plan 15+ 문서»는 Round 12의 ad hoc 위임 실행 기록이다).

### D8. 산식과 현재 값 (#amend-9 결정 3 승계)
`maxTurns = 읽기 예산 + 3 × 산출물 수`, 읽기 예산 = `max(8, 회수 문서 수)`. builder는 60 예외(slice 단위 구현 + 검증). 현재 값:

| agent | maxTurns | 근거 |
|---|---:|---|
| builder | 60 | D6 |
| reviewer | 24 | 읽기 max(8, ~12: stabilize 단계 5 code/design surface·R6-4 렌더 증거) + 3×4 = 24 — **미실측**(실측 자리는 `/stabilize-milestone` 단계 5의 reviewer dispatch다. `/validate-plan`은 세션 인라인이라 대상이 아니다 — D7) |
| planner · designer · architect | 20 | 읽기 8 + 3×4 |
| counsel · strategist | 20 | 자문 문서 회수량 |
| qa · validator · analyst · security · marketer | 16 | 보고 1건 |
| researcher | 12 | 보고 1건, 회수 소량 |
값을 바꾸면 이 표와 frontmatter를 같은 커밋에서 고친다(손 동기화 — 어긋나면 표가 아니라 frontmatter가 SSOT다).
#amend-9 결정 4(«회수 문서 10개 이상이면 축·범위를 나눈다»)는 dispatch 분할 규칙이라 본 ADR이 아니라 ADR-075 D11 (b)가 승계한다.

### D9. 에이전트 본문의 예산 절 — 행동 지시를 걷어낸다 (#amend-6 결정 2·#amend-8 결정 3·#amend-9 결정 1을 **실측으로 폐기**; #amend-7 결정 1은 «산출물 나열·턴 수 금지»만, 결정 3은 slice 크기 기준으로 승계)
쓰는 쪽 agent 본문에 «작업 예산» 절 하나를 둔다. **남는 내용은 둘뿐이다.**
1. **산출물을 먼저 나열**한다. **턴 수는 어디에도 적지 않는다** — 에이전트는 자기 턴을 셀 수 없다(amend-6이 그 지시로 실패했다).
2. **slice 크기 기준 = 산출물 4개**(#amend-7 결정 3 승계 — 값의 정의는 여기 한 곳): foreman(`/implement-workitem`·`/design-milestone` R4)은 넘으면 쪼개고, builder는 «slice가 산출물 4개를 넘으면 착수 전에 그렇게 보고한다 — 쪼개는 것은 foreman의 일이다»(builder 쪽은 미측정 — 유지). ADR-075 D1은 이 값을 인용한다.

**제거한 셋과 사유(Round 13 실측)**:
- «절반 시점 중간 보고» — 관측 6회(Round 12의 4 + Round 13 (c)·(d)) 전부 미발생. 지시로 행동이 바뀌지 않았다.
- «write-first(골격만으로 먼저 쓴다)» — 「첫 쓰기 이전에 연 입력 수」가 5/5에서 0이 아니었다(planner 10 · builder 15·11·11·8). 에이전트 2종·스택 2종·effort 2조건에 예외 없음.
- «상한 도달 시 부분 보고 형식» — **성립 불가**다. 상한은 마무리 턴 없이 작업 중간에서 잘리고(두 관측 모두 마지막 텍스트가 절단 지점보다 2호출 앞), 로그 전체에 상한 접근 경고가 0건이며, 위 1번이 스스로 「턴 수를 셀 수 없다」고 못박는다. **알 수 없는 사건을 조건으로 삼는 지시는 어떤 에이전트도 만족시킬 수 없다.** 그 자리는 D10의 호출자 규칙이 받는다.

세 문장을 지우는 것은 지시를 더 다듬는 대신 **slice 크기(D9-2 기준 — foreman 분할은 ADR-075 D1)를 유일한 방어선으로 삼겠다**는 뜻이다 — 사전 등록된 falsifier 대응을 그대로 집행한 결과다.

### D10. 회수 dispatch — 「쓴 파일 목록」은 호출자가 만든다 (#amend-8 결정 4 승계 + 삭제된 «부분 보고 형식»의 이관처)
하청이 상한에 닿아 미완이면 호출자는 1회 재개하되 **이미 쓴 파일 목록**을 넘긴다(다시 읽고 다시 쓰는 낭비 방지). **그 목록은 하청에게 받는 것이 아니라 호출자가 워킹트리를 직접 읽어 만든다** — 상한 중단은 마무리 턴 없이 잘리므로 하청이 목록을 낼 기회가 없다(D9 제거 사유 3). Round 13 (c)에서 foreman이 실제로 그렇게 복구했고 재개 1회로 완주했다. 재개 규율 자체(1회 재개 → 실패 시 직접 회수)는 ADR-075 D13이 소유한다.

### D11. stabilize 7-T 계수 (#amend-8 결정 5 승계)
`턴 소진 0건 보고: N회`. 1회 이상이면 D14의 조건이 발화한다.

### D12. 에이전트 정의의 반영 시점 — 이 환경에서는 세션 시작에 고정된다 (신규 — 발견 74)
- [관측됨] Claude Code(2026-09, `.claude/agents/`, 저장소 루트 세션)에서 세션 중에 편집한 에이전트 정의는 그 세션의 이후 dispatch에 **반영되지 않았다**. 편집 6분 뒤 0-tool probe도 편집 전 정의를 반환했다. 새로 만든 변형 파일도 같은 세션에서는 보이지 않았다. amend-5 결정 4의 «hot-reload 지연» 진단은 오진이다.
- 공식 문서는 agents 디렉터리 변경을 감시해 다음 위임에 반영한다고 적는다. 본 관측은 그 사양과 어긋나며 **버전·경로·실행 방식에 한정된 사실**로 기록한다 — 일반 법칙으로 쓰지 않는다.
- **규칙**: 에이전트 파일을 고친 뒤 그 효과의 관측·검증은 **새 세션**에서 한다. 같은 세션에서 «적용됐다»고 적지 않는다. 반영이 확인된 버전이 나오면 본 D12를 amend로 완화한다(재검토 트리거 1).
- **반영 확인 수단**: 본문에 임시 마커 한 줄(«반환문 첫 줄에 `조건=… turns=… effort=…`를 적어라»)을 두고, 도구 0개 probe dispatch로 마커가 오는지 본다(1.9초, 결정적). 마커는 측정 뒤 제거한다.

### D13. 역할별 예산 실험 프로토콜 (#amend-4 결정 3 + #amend-5 결정 4 대체)
조건별 측정은 **조건마다 세션을 새로 시작**한다: (i) 에이전트 파일을 그 조건으로 편집(커밋하지 않음) → (ii) 새 세션 → (iii) 0-tool probe로 반영 확인 → (iv) 격리 사본에 바이트 동일 slice dispatch → (v) 반환·사후 검증 기록 → (vi) 원복. 변형 파일 방식은 세션 분리와 함께 쓸 때만 성립한다. **프롬프트는 파일에서 그대로 읽어 보내고, dispatch 뒤 실행 로그에서 조건 간 바이트 동일을 실제로 대조한다** — Round 13에서 「바이트 동일하게 쓴다」는 지시만으로는 지켜지지 않아 두 조건에 호출자용 문장이 섞여 들어갔다. 측정 항목: 소요·tool_uses·**누적 `output_tokens`**·완료 AC·validate·회수 턴·Red 보고 완전성·첫 쓰기 이전에 연 입력 수(실행 로그의 도구 호출 순서에서 읽는다). **task-notification의 「subagent 토큰」은 마지막 요청 1건의 컨텍스트 규모이지 누적 사용량이 아니다** — 조건 비교에는 로그에서 요청 ID로 중복 제거한 누적값을 쓴다. 조건 표는 SIMULATION_RUN이 소유한다.

### D14. ADR-047 D3 «예산 영향» 필드 — 이미 채택됨 (#amend-8 근거의 조건은 소멸)
#amend-8은 «D9 적용 뒤에도 보고 0건 상한 도달이 나면 ADR-047 D3에 «예산 영향» 항목을 넣는다»를 조건부로 남겼다. 그 항목은 ADR-047#amend-3(2026-09-12)으로 **이미 채택됐다**(D3 7번째 필드, 소급 적용 없음). 본 ADR은 그 필드를 채워 쓴다. 남는 규칙은 하나다 — D11 계수가 1회 이상이면 예산 상향이 아니라 D9-2 slice 기준의 하향 검토로 간다(집행은 ADR-075 D1).

## 대안과 제약 (ADR-053)
- A. amend-10을 더한다 — ADR-045 D6 위반. 기각.
- B. 예산 규칙을 DELEGATION_STRATEGY 산문으로만 — 근거·falsifier가 사라진다. 기각.
- C. 채택 — net 규칙 재발행 + 세션 고정 관측 + 프로토콜.

## 신뢰도
Medium — D1~D4·D12는 관측됨. D5·D6·D8 값은 n=1~2 실측 기반이라 재검토 트리거를 둔다. **D9는 제거 근거가 High** — 중간 보고 0/6, write-first 0/5, 부분 보고는 구조적 성립 불가(상한 경고 부재 + 마무리 턴 부재)로 셋 다 실측에 기반한다.

## 재검토 트리거
1. Claude Code 문서·실측에서 세션 중 에이전트 파일 반영이 확인되면 D12를 완화한다.
2. D11 계수가 마일스톤당 1회 이상이면 예산 상향이 아니라 D9-2 slice 기준의 하향을 검토한다(D14).
3. 다른 스택 dogfood에서 medium이 빠르게 나오면 D5 재측정(D13 프로토콜).
4. **write-first의 프롬프트층 처방(미시험)**: Round 13은 「에이전트 본문 지시만으로는 순서가 바뀌지 않는다」(n=5)까지만 확인했고, **dispatch 프롬프트가 「첫 산출물 파일을 만든 뒤 나머지 입력을 연다」를 직접 지시하는 조건은 시험하지 않았다**. 그 조건을 한 번이라도 재면 결과를 기록하고, 효과가 있으면 write-first를 **호출자 프롬프트 규약**으로 되살린다(에이전트 본문으로는 되돌리지 않는다).
5. **상한 신호가 생기면 «부분 보고 형식» 재도입 검토**: 하네스가 「상한 N턴 남음」류 신호를 에이전트에게 주기 시작하면 부분 보고 형식의 성립 불가 사유가 사라진다 — 그때 D10의 호출자 규칙과 함께 재검토한다.

## 정책 강도 (ADR-022)
- 제약(강, [관측됨]): D1·D2·D12.
- 제약(중, [관측됨]): D9 «턴 수를 적지 않는다», D13 «조건당 새 세션», D10 «쓴 파일 목록은 호출자가 만든다».
- enabling(약): D5·D6·D8 값, D9-2(builder slice 4개 초과 사전 보고 — 미측정), D11·D14.

## Mutation Contract (ADR-047 D3)
1. Target — `.claude/agents/*.md`(frontmatter 값·예산 절 인용 재지정) / `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델·예산 표기 정책` / `.claude/skills/{implement-workitem,design-milestone,plan-workitem,validate-plan,stabilize-milestone}/SKILL.md`(인용 재지정) / `.codex/config.toml` 주석 / `docs/00-meta/GUARDRAILS_STRATEGY.md` / `docs/90-decisions/boilerplate/README.md` 인덱스 / ADR-010·ADR-047 인용.
2. Failure mode — net 규칙을 개정 9개에서 조립해야 함 / 세션 중 편집을 반영된 것으로 오인해 실험이 무효가 됨 / 예산 축 오분류로 팬아웃 단위가 보고 0건으로 잘림 / **에이전트가 알 수 없는 사건(상한 도달)을 조건으로 삼은 지시가 본문에 남아 「규칙을 두었다」는 거짓 안심을 만듦** (전부 관측됨).
3. Predicted improvement — Round 14에서 상한 중단이 **slice 크기 판정으로 예방**되고(지시로 완화되는 것이 아니라), 중단이 나더라도 호출자가 워킹트리에서 목록을 만들어 1회 재개로 복구되며, 에이전트 파일 변경 뒤 새 세션 검증이 기록에 일관 등장하고, 예산 값이 표 하나로 읽힘.
4. Preserved invariants — shared 비고정 / 별칭 자리 / Codex 비지정 / graduation·오케스트레이션 계약(ADR-075) 불변.
5. Falsifying evaluation — **(선행 이력) Round 13 판정은 amend별로 갈린다** — ADR-004#amend-8 (a)(「쓰기 도구 보유 에이전트의 보고 0건 상한 도달」)는 **2회 발화**했고 #amend-9의 (a)·(b)는 **미발화**다. 따라서 «부분 보고 형식» 제거는 amend-8 (a) 발화 + 구조적 성립 불가에 근거하고, «write-first»·«중간 보고» 제거는 falsifier 발화가 아니라 **직접 미준수 실측**(각각 5/5·0/6)에 근거한다. D9는 amend-8 (a)의 사전 등록 대응(「지시를 더 만지지 말고 slice 강제만 남긴다」)을 집행한 결과다. 이제 남는 것은 제거 자체의 falsifier다 — (a) 행동 지시 3종을 걷어낸 뒤 **산출물 손실이 동반된 상한 중단**(재개로도 복구되지 않는 미완)이 마일스톤당 1회 이상 나오면 slice 강제만으로는 부족한 것이므로 D9-2의 산출물 임계(4)를 내리고(report-only dispatch는 ADR-075 D11 (b)의 회수 문서 10개) — 지시를 되살리지 않는다 — 그 사실을 적는다 (b) D12의 반영 확인 수단이 반영된 정의에서도 마커를 못 받으면 수단 재설계 (c) D8 값의 dispatch가 매번 상한의 절반 아래로 끝나면 산식 하향.
6. Rollback path — 본 ADR superseded → ADR-004 net 규칙으로 회귀(에이전트 파일 값 원복), D12는 관측 기록으로만 잔존.
7. 예산 영향 — 없음(값을 바꾸지 않는다. D8 표는 현재 frontmatter와 동일).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/agents/builder.md                  — D6·D8·D9
- .claude/agents/planner.md                  — D8·D9
- .claude/agents/architect.md                — D8·D9
- .claude/agents/designer.md                 — D8·D9
- .claude/agents/reviewer.md                 — D8·D9
- .claude/agents/qa.md                       — D8
- .claude/agents/validator.md                — D8
- .claude/agents/researcher.md               — D8
- .claude/agents/analyst.md                  — D8
- .claude/agents/security.md                 — D8
- .claude/agents/marketer.md                 — D8
- .claude/agents/counsel.md                  — D8
- .claude/agents/strategist.md               — D8
- docs/00-meta/DELEGATION_STRATEGY.md        — D1·D2·D5·D8·D12 요약
- docs/00-meta/GUARDRAILS_STRATEGY.md        — D1 인용
- .codex/config.toml                         — D1 주석
- docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md — D1 인용(#amend-6 Codex 비지정)
- .claude/skills/implement-workitem/SKILL.md — D9-2·D10
- .claude/skills/design-milestone/SKILL.md   — D9-2
- .claude/skills/plan-workitem/SKILL.md      — D10
- .claude/skills/stabilize-milestone/SKILL.md — D11
- .boilerplate/validation/SIMULATION_RUN.md  — D13 조건 표·실측

## 참고
- ADR-004(superseded — 승계 원천), ADR-010(#amend-6 Codex 비지정), ADR-075(오케스트레이션·회수·slice), ADR-047 D3(D14 조건), ADR-045 D6·D10, ADR-022.
