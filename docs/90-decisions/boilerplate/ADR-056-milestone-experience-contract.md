# ADR-056 — 마일스톤 경험 계약 (프로토타입 라운드 + 입구 계약 + 스크린샷 게이트 + Voice 규칙서)

> scope: boilerplate
> area: design/process

## Status
accepted

## 현재 유효 결정
- UI 마일스톤 경험 계약은 `/plan-milestone M<N>`의 R5에서 사용자 피드백·게이트를 거쳐 최종 화면 HTML로 승인한다. 같은 draft M 재실행만 미완 R5를 재개하며, M/F `ready` 뒤 `--prototype` 재진입·재승인·부분 보류는 없다. 변경은 다음 M(#amend-1, ADR-057#amend-3).
- 각 새/변경 경험 결정은 `PX-M<N>-<screen>-NN`; 승인 HTML 마커가 source, 구현 feature 한 곳의 `## 7` 인벤토리가 mirror. `/plan-workitem M<N>` 1회가 PX↔AC를 매핑하고 unmapped·중복·drift를 `[Plan-FAC-coverage]`가 검사(#amend-1).
- 프로토타입 raw hex는 custom-property 정의 라인만 예외이며 사용처는 검사한다(#amend-2). 마일스톤 `## 9` 화면 전환표의 존재 path(primary/failure/recovery)는 프로토타입·AC가 커버한다(#amend-3).
- stabilize의 경험 스크린샷 대조·DESIGN.md §10 voice·비-UI 면제 등 나머지 base 결정은 유지한다.

## 배경
- [관측됨] 모든 게이트의 채점 기준이 문서(AC/FAC)로 닫혀 있다 — validate-workitem의 판정 축 전부가 task/feature 문서 대비이고, 사용자가 눈으로 승인한 artifact가 오라클로 쓰이는 지점이 0곳이다. 잘못된 스펙일수록 테스트가 붙어 더 단단히 굳는다. 유일한 승인 artifact(R2 concept/R6 preview)는 승인 즉시 삭제 + .gitignore(ADR-058).
- [관측됨] 사용자의 첫 시각 확인 시점이 구현 완료 후라 마일스톤 종료 후 요구사항 미반영·불만족이 잦다(사용자 fork 보고).
- [관측됨] reviewer[design]은 grep 기반 토큰 대조만 가능했다 — 렌더 증거(스크린샷) 생산·주입 파이프라인 부재. 단 Playwright는 stack-guard가 UI 프로젝트에 선설치(ADR-052 D1)하고 Read 도구는 이미지를 읽을 수 있어 MCP 없이도 기술적으로 가능하다.
- [관측됨] voice/UX writing 규칙서가 repo 어디에도 없다 — 카피 관련 항목은 FEATURE §8-1 "copy 톤" 필드뿐이고 그마저 downstream 소비자 0인 죽은 필드. 전역 규칙 없이 feature 필드만 있어 feature마다 톤이 즉흥 재결정된다(ADR-027이 시각에 진단한 "명시 결정 자리 부재 → 매번 즉흥 결정"과 동형). placeholder 카피 금지 규칙도 0건.

## 결정 — A. 경험 계약 (1~7 — 프로토타입 라운드·게이트)
1. **승인 프로토타입 산출물 (경험 계약 SSOT)** — UI 확정(ADR-027#amend-3) 마일스톤은 **화면 단위** 자기완결 HTML 프로토타입을 `docs/20-system/prototypes/M<N>/<screen>.html`에 둔다(**커밋 대상**, lifecycle: Record — 재승인 시 같은 파일 *대체*(**`plan-milestone` R5 반복 내 덮어쓰기로 한정** — `ready` 확정 후 재승인 없음, 변경은 다음 M<N> — #amend-1), presence: conditional). **화면-키(screen-keyed)인 이유**: [관측됨] 실사용에서 한 화면은 여러 feature 표면의 합성이고 그 합성층을 아무도 설계하지 않아 품질이 무너졌다 — feature별 파일은 한 화면을 3~4개 프로토타입으로 쪼개 합성층 고아 문제를 재생산한다(단일 화면 feature는 화면명=feature 슬러그로 자연 수렴). feature 문서 `## 7`의 `프로토타입:` 참조 줄이 그 feature가 등장하는 화면 파일(들)을 나열한다(feature↔화면 매핑은 이 참조 줄들로 유도). 경험 계약 범위 — *확정*: 레이아웃 / 인터랙션 결과(정적 HTML이므로 캡션·상태 클래스로 표기) / 실제 카피(§10) / 상태(happy + **못생긴 상태 의무 5종**: 긴 제목·빈 목록·로딩·에러·항목 과다). *열어둠*: 엔지니어링 내부(상태관리·fetch·컴포넌트 구조 — ARCH §7-4 영역). SSOT 삼각: DESIGN.md=전역 시각 토큰 / FEATURE §3·§7=시나리오·측정 / prototypes=화면 경험. 충돌 시 우선순위: DESIGN.md 토큰 > 프로토타입 > FAC 텍스트(화면·카피·상태의 구체 해석 한정 프로토타입 우선). 탐색 시안은 `docs/20-system/prototypes/M<N>/_drafts/`(gitignore — 버리는 것)와 경로로 구분.
2. **plan-milestone R5 프로토타입 라운드** — R4 뒤 신설(UI 마일스톤 한정, 비-UI는 skip+사유 echo): R5-1 화면 목록 확정(feature당 대표 1화면 기본, 면제 feature는 이 시점 기록) → R5-2 브로드 시안 2~3안(designer 위임 — divergence 카드 차용, DESIGN.md 토큰만 참조) → R5-3 선택·수정 루프(취향 오라클=사용자, 2사이클 미수렴 시 brief 수정) → R5-4 경험 계약 완성(못생긴 상태 5종 + 실카피 + 인터랙션 캡션 + `:root` 토큰 참조 — 의무 체크리스트) → R5-5 승인 시 커밋 경로(`<screen>.html`) 저장 + 승인 직전 raw hex 1회 grep(`:root` 토큰 *정의* 블록 제외 — 자기완결 파일의 정의값 hex는 정상) + feature 문서 `## 7`에 프로토타입 참조 줄(화면 파일 + 진입 메모) + `_drafts/` 내 시안 파일 삭제. **재개**: 미완 R5는 같은 draft `M<N>` 재실행으로 이어간다(#amend-1 — 별도 `--prototype` 재진입 모드는 폐기; `ready` 확정 후 변경은 다음 M<N>).
3. **plan-workitem 입구 계약 (이중 잠금)** — UI **확정** feature 분해 시 해당 승인 프로토타입 참조도 면제 기록도 없으면 **`Needs Experience Contract`로 종료** + 같은 draft `/plan-milestone M<N>`에서 프로토타입/면제를 완성하도록 안내(ADR-007#amend-3 `Needs Stack Guard` 동형 — ADR-007#amend-5로 예외 등재). UI **의심**(status=draft+신호)은 경고만(false positive 완충). opt-out: feature 문서에 `프로토타입 면제: <사유>` 기재 시 통과(TDD opt-out 동형 — 사유 영속). 배치 모드(ADR-057 결정 2)에서는 **한 feature라도 계약 미비면 task를 쓰기 전에 일괄 중단**한다(부분 계획 금지 — §4.12 입구 preflight; #amend-1 정정 — 미충족 feature만 보류하고 나머지 진행하던 구 단서 폐기). 분해된 task `## 3`에 프로토타입 참조 line item을 plan이 authoring(builder는 기계 실행).
4. **경험 좁힘 질문 규칙** — plan-workitem 9-1 self-check에 추가: "AC 해석이 프로토타입·상위 약속이 보여주는 사용자 체감(보이는 것·눌렀을 때·문안)을 *좁히면* 무조건 질문 — 내부 엔지니어링 선택은 자율". implement 단계 비대칭: builder의 AC-ambiguity 하드스탑에서 *경험 계약이 존재하는 slice의 보이는 것·문안 차이는 "사소한 표현 차이" 분류 금지*(silent narrowing 차단).
5. **stabilize §3-V 경험 게이트 (스크린샷 vs 승인본)** — UI 확정 마일스톤이면 메인 세션이 앱 기동 → 핵심 화면(≤6~8, 기본 뷰포트 1종) Playwright CLI 스크린샷 → `docs/40-validation/visual/M-N/` 갤러리(gitignore ephemeral) → Read 멀티모달로 대조. **실행 자체는 UI 확정 마일스톤에서 의무 — silent skip 금지**(미실행 시 사유(blocked-on-env 등)를 최종 출력에 echo; *판정*은 report-only 유지 — ADR-052 e2e silent-skip 금지와 동형). **대조 앵커 위계: ① 커밋된 승인 프로토타입 `<screen>.html`(존재 시 — 같은 뷰포트로 file:// 렌더 캡처해 나란히 대조 가능) → ② DESIGN.md §2/§7/§9/§10 파생 체크리스트(면제·부재 화면 fallback)**. 불일치는 `P1 [Experience-drift]` report-only(enabling — 졸업 필수 승격은 fork 실증 후 ratchet; MILESTONE item 6 선택 기준 예시 제공). 갤러리 경로를 최종 출력에 실어 사용자 육안 확인 유도(스펙 자체 오류는 인간 오라클). 환경 실패는 기존 blocked-on-env 라벨 재사용. `--dry-run`에는 미포함. Codex(멀티모달 편차): 갤러리 생성 + 사용자 수동 대조로 degrade. hot-loop 배치 금지(per-task validate에 넣지 않음 — ADR-058 carve-out 정합).
6. **렌더 증거 주입** — stabilize design-surface reviewer 입력에 §3-V 갤러리 경로·visual-qa 결과를 주입(ADR-027#amend-6), reviewer는 Read로 이미지 열람.
7. **grep 오탐 방지** — stabilize §5-2 raw hex grep 대상에서 `docs/20-system/prototypes/` 제외(자기완결 HTML — DESIGN.md 제외와 동형. 단 프로토타입 최종본은 `:root` 토큰 참조가 원칙이므로 위반 의심은 R5-4 체크리스트가 잡음).

## 결정 — B. Voice & Writing 규칙서 (8~11 — §10 규칙서 + 집행)
8. **DESIGN.md §10 Voice & Writing 신설** (§9 뒤 — Stitch canonical 8섹션의 상대 순서 밖 추가라 lint 비위반, ADR-027 #d24 Motion 확장과 동일 논리. 섹션 목록 정정은 ADR-027#amend-5). 내용 스키마: (a) 존댓말·어조 규정(언어별 1줄), (b) 내부용어→사용자 언어 번역표, (c) 금지 표현 — *grep 가능 패턴*(정규식)과 *LLM-판정 규칙* 2분류(§9 Don'ts와 동형), (d) 표면별 예시 카피 4종(버튼/에러/빈 상태/확인 다이얼로그). **기본값 채움 + 확인 1회**: baseline placeholder에 opinionated 기본값(한국어 해요체·명령형 CTA 등)을 채워 두고 `/bootstrap-design` R1에서 "채택 or 변경"을 1회 확인(무확인 굳음 방지). **다운스트림 마이그레이션**: §10 신설 전 기존 fork(DESIGN.md에 §10 부재)는 plan-milestone R5 진입 시(또는 `/bootstrap-design --update`) §10을 기본값으로 신설 + 채택/변경 확인 1회로 흡수한다.
9. **실카피 의무**: R2 concept·R5 마일스톤 프로토타입·R6 preview의 대표 화면은 charter 페르소나·시나리오 기반 실제 문구로 렌더. placeholder 카피 금지. §10 확정 전(R2) 카피는 "방향 선택용 후보"로 명시(SSOT 오인 방지).
10. **voice 집행**: (a) stabilize deterministic preflight에 placeholder-카피 grep + §10 grep 가능 금지 패턴 grep(`P1 [Design-voice-grep]`), (b) reviewer Design Consistency 4→5차원(`[Design-voice]` — LLM 판정분) + [Plan-design] 차원에 §10 구절(reviewer·validate-plan 미러 양쪽 동기), (c) plan-workitem DESIGN cross-check에 "UI task 카피 §10 정합" 1줄, (d) validator UI 체크에 §10 정합 1줄.
11. **FEATURE §8-1 재정의**: copy 톤 필드는 "§10 전역 규칙 대비 feature-특이 delta만 기록"으로 좁힌다(ADR-042#amend-1 동반). 비-UI 프로젝트는 기존 DESIGN.md 삭제 경로에 §10도 동반 삭제(별도 VOICE.md 신설 X — 파일 분리 기각).

## 결정 — C. 경험 축 학습 채널 (12 — stabilize)
12. **stabilize instruction improvement에 경험 축 확인 추가**: 단계 8의 instruction improvement 후보 문단에 "경험·사용 관점 교훈(제품을 실제로 써 본 결과에서 나온 것) 유무를 별도로 확인" 1줄을 둔다 — [관측됨] 실사용에서 교훈이 검증-정교화 방향으로만 쌓이고 경험 축 교훈이 0건이었던 편향의 방지 장치.

## 비결정 (No)
- 프로토타입 코드의 구현 재사용 — 스펙이지 코드가 아니다.
- 이미지 생성·Figma 의존 — HTML/CSS 자기완결로 충분(ADR-058 정합).
- 비-UI 마일스톤 의무화.
- per-task 스크린샷 대조(validate-workitem) — repair 루프 재실행마다 이미지 토큰 소모(준-hot-loop 트랩).
- 별도 VOICE.md 파일 / ux-writer agent — §10 규칙서로 흡수(단순성 1순위).

## Mutation Contract (ADR-047 D3)
1. Target — plan-milestone(R5, 같은 draft M<N> 재실행으로 미완 라운드 재개)/plan-workitem(입구 계약+9-1+voice cross-check)/stabilize(§3-V·§5-2 제외·voice grep·출력)/builder(비대칭 1줄)/reviewer(렌더 증거+[Design-voice])/validator(§10 정합)/DESIGN.md §10/FEATURE·MILESTONE 템플릿/.gitignore/STRUCTURE/WORKFLOW + ADR-007#amend-5 + ADR-027#amend-5·6 + ADR-042#amend-1.
2. Failure mode — 사용자 승인 artifact가 오라클로 쓰이는 지점 0 + 승인본이 ephemeral 경로에서 증발 + 첫 시각 확인이 구현 후 + 전역 voice 규칙 부재로 톤 즉흥 재결정(전부 관측됨).
3. Predicted improvement — 구현 전 경험(화면·인터랙션·카피) 확정으로 마일스톤 종료 후 재작업 감소, 승인본이 독립 오라클로 영속, [Experience-drift]/[Design-voice]로 drift 가시화.
4. Preserved invariants — stabilize read-only(§3-V는 촬영·판독·보고만)/ADR-058 R2 concept ephemeral 정책(범위 한정 — ADR-058)/hot-loop 스크린샷 금지/ADR-067 graduation 5+1 본체/DESIGN.md 시각 SSOT 지위/비-UI 삭제 경로/자동 차단 X(결정 3 제외).
5. Falsifying evaluation — R5가 마일스톤당 계획 시간을 과도하게 늘리거나 [Experience-drift] 재실행 불일치율이 높으면 R5를 opt-in으로 후퇴; [Design-voice] false positive가 노이즈를 유의하게 늘리면 LLM-판정분 후퇴(grep분만 유지).
6. Rollback path — superseded → R5·입구 계약·§3-V·§10·집행 지점 제거, prototypes/ 경로 폐기(기존 문서 잔존 무해), ADR-007#amend-5 철회, §8-1 원 의미 복원.

## Ratchet 강도 (ADR-022)
- 결정 3(입구 계약)만 constraint(강, [관측됨] — 스킬 내부 권장 문구는 우회됨). 나머지 enabling(약).

## Surfaces
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/agents/builder.md
- .claude/agents/reviewer.md
- .claude/agents/validator.md
- .claude/agents/designer.md
- .claude/skills/validate-plan/SKILL.md
- docs/20-system/DESIGN.md
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- docs/30-workitems/_templates/TASK_TEMPLATE.md
- .gitignore
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md

## 참고
- ADR-058(R2 원형·carve-out·실카피 라운드 배선 — ADR-049 supersede), ADR-042(#amend-1 — §8-1 delta), ADR-007(#amend-5 — 입구 계약 예외 등재), ADR-027(#amend-3 UI 판정, #amend-5 §10 섹션, #amend-6 렌더 증거), ADR-052(Playwright 선설치), ADR-067(item 6), ADR-048(browser MCP는 §3-P 탐색용 — §3-V는 MCP 불요), ADR-022, ADR-047 D3.

<a id="adr-056-amend-1"></a>
## Amendment 1 (2026-07-26) — 프로토타입 경험 결정 PX 커버리지 (계획 단계 coverage 대조)

### 배경
- [관측됨] SIMULATION_RUN Round 4 — 프로토타입의 "입력창 sticky-pin" 구성 결정이 어떤 task AC에도 안 내려갔고, 단위·E2E·per-task validate 전부 green이었는데 마일스톤 끝 §3-V 스크린샷 대조에서야 처음 발견됐다(되돌리기 비용 큼). 입구 계약(결정 3)은 프로토타입 *존재*만, 경험 좁힘(결정 4)은 *해석 분기*만 본다 — coverage 점검이 없다.

### 결정
1. **PX 식별자 (마일스톤 번호 = 버전)**: 승인 프로토타입의 각 *경험 결정*(레이아웃·인터랙션 결과·핵심 카피·못생긴 상태 처리 등, 결정 단위 — 화면당 대략 3~8개)에 **`PX-M<N>-<screen>-NN`** id를 부여한다(예 `PX-M1-dashboard-01` — 마일스톤·화면 슬러그·번호). designer가 R5-4/R5-5에서 프로토타입 HTML에 `<!-- PX-M<N>-<screen>-NN: <한 줄 결정> -->` 마커를 **의무로** 단다(이 HTML 마커가 PX의 *단일 source*, R5-5가 그대로 복사). **마일스톤 번호가 버전이다 (핵심)**: `/plan-milestone M<N>`에서 프로토타입을 사용자 피드백으로 여러 번 고쳐 **최종 승인**한 뒤 M<N>·feature를 확정하며, 그 시점부터 M<N>의 화면·PX는 **잠긴다**. 마일스톤 진행 중에는 프로토타입·기획을 바꾸지 않는다 — 다음 마일스톤에서 그 화면이 바뀌면 **새 마일스톤 id로 `PX-M2-<screen>-NN`**(별도 화면 revision·재승인·원자 교체·retire 없음 — *마일스톤 경계가 곧 버전 경계*). **PX는 그 마일스톤에서 *새로 도입·변경하는* 경험 결정만 표시**한다 — 합성 화면에 함께 보이는 *이전 마일스톤의 변경 없는* 영역은 시각적 문맥일 뿐 새 PX·AC 매핑 대상이 아니다(M2가 안 바꾼 M1 영역까지 범위에 끌려오지 않게). 승인 前 draft 반복·게이트 repair는 최종 승인본 하나로 수렴할 뿐 별도 버전을 남기지 않는다(`_drafts/` 시안은 R5-5 승격 후 삭제 — 최종 승인 화면 HTML만 커밋되고 이전 draft는 보존하지 않는다). **문법(정확 매칭)**: `^PX-M<N>-<screen>-\d{2,}$`(`<screen>`는 delimiter-anchored 정확 일치 — `user`가 `user-settings`를 오매칭하지 않음; 번호 2자리+). **불변식**: 한 화면 HTML 내 id 중복 금지 · id의 `M`/`<screen>`이 파일 경로 `M<N>/<screen>.html`와 일치 · 각 PX는 구현 feature 정확히 1곳 `## 7`에만. **소유(per-PX · 화면단위 합성 HTML)**: 최종 프로토타입은 feature별이 아니라 **여러 feature가 합성된 화면 단위 HTML**이다 — 각 PX를 *구현하는* feature 하나의 `## 7`에 기록(화면 통째로 대표 feature에 몰지 않음 — 비소유 feature의 plan-workitem이 자기 PX를 못 매핑하는 INST-1 사각 방지). 화면-공통(shell/layout) 결정은 shell 담당 feature 귀속 또는 DESIGN.md §4로 승격(PX 아님); cross-feature 정합은 owner가 아니라 `## 7-2` INV/seam(ADR-057#amend-2).
2. **PX 인벤토리 (계획 미러 — 재추출 금지)**: plan-milestone R5-5가 최종 승인 시 프로토타입 HTML의 PX 마커를 **그대로 복사**(재추출·재해석 금지 — drift 차단)해 각 구현 feature `## 7`의 `프로토타입:` 참조 아래 `경험 결정(PX):` 블록에 `- PX-M<N>-<screen>-NN: <한 줄>`로 기입한다. 한 화면이 여러 feature에 걸치면 PX별로 구현 feature에 분산 기록. (마일스톤 확정 후 프로토타입은 잠기므로 revision 원자 교체·재승인 재기입은 없다 — 변경은 다음 마일스톤의 새 M<N>.)
3. **PX ↔ AC 매핑 (마일스톤 단위 — 1회 완성)**: `/plan-workitem M<N>`이 **한 번의 실행으로 전 feature의** task·AC를 만들고 각 PX를 구현 AC로 매핑해 feature `## 7-3. 프로토타입 경험(PX) ↔ AC 매핑` subsection에 영속(형식 `PX-M<N>-<screen>-NN → T-NNN:AC-M`, FAC↔AC `## 7-1`과 동형; ADR-036 12-section에 main section 신설 X — subsection). task `## 6` AC는 `(PX-M<N>-<screen>-NN)` 태그 가능. **사용자-facing 계약 = `/plan-workitem M<N>` 하나**(feature 단위 `F-NNN` 호출·`--refresh` 모두 없음 — 내부 feature별 순차 authoring은 허용하되 M<N> 1회 실행으로 전 task·AC·PX↔AC 완성). 프로토타입이 마일스톤 확정 시점에 잠겨 있으므로 계획 후 재동기(refresh)가 필요 없다 — 프로토타입·기획을 바꾸려면 다음 마일스톤에서 새 M<N>로 처리(구현 중 근본 충돌이 드러나면 자동 재계획 없이 사용자에게 중단·보고).
4. **coverage 대조**: 어떤 AC도 참조하지 않는 PX(unmapped PX)를 골라낸다 — plan-workitem self-check가 "남은 미결정 사항"에 surface, `[Plan-FAC-coverage]`(reviewer·validate-plan 미러) 차원이 unmapped FAC와 **동일하게 unmapped PX도 P0**로 잡는다(새 차원 신설 X — 기존 coverage 차원 확장). *별도 parser는 없다 — unmapped 판정은 매핑 표 기준의 coverage 점검을 reviewer/self-check(LLM)가 수행*(마커 복사(R5-5)만 verbatim으로 기계적). 이러면 §3-V는 "정말 놓친 것"만 잡는 최후 보루로 정상화.
5. **base 결정 정정 (refresh·재승인·`--prototype`·부분-보류 폐기 — ADR-057#amend-3 정합)**: 본 라운드가 이들을 폐기하므로 ADR-056 base 결정도 다음으로 **정정(supersede)**한다 — **base 결정 1**의 "재승인 시 같은 파일 대체"는 *plan-milestone R5 반복 내 덮어쓰기*로만 한정(확정=`ready` 후 재승인 없음, 변경은 다음 M<N>); **base 결정 2**의 R5 `--prototype [F-NNN]` 재진입 모드는 **제거**(같은 `/plan-milestone M<N>` 재실행이 미완 R5를 이어감 — §4.11); **base 결정 3**의 배치 단서 "하나라도 미충족이면 그 feature만 보류하고 나머지 진행"은 **"한 feature라도 계약 미비면 task를 쓰기 전에 일괄 중단"**으로 정정(부분 계획 금지 — §4.12 입구 preflight). ADR-056 `## 현재 유효 결정`이 있으면 이 정정을 반영.
   ADR-056 base `## Mutation Contract`의 Target도 `plan-milestone(R5+--prototype)`을 **`plan-milestone(R5, 같은 draft M<N> 재실행으로 미완 라운드 재개)`**로 고친다. Mutation Contract가 폐기된 사용자 진입을 다시 canonical surface처럼 보이게 두지 않는다.

### 적용 surface
- .claude/skills/plan-milestone/SKILL.md (R5-5 PX 인벤토리)
- .claude/skills/plan-workitem/SKILL.md (3-P PX↔AC + self-check)
- .claude/skills/validate-plan/SKILL.md ([Plan-FAC-coverage] 확장)
- .claude/agents/reviewer.md ([Plan-FAC-coverage] 미러)
- .claude/agents/designer.md (PX 마커)
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (## 7 PX 인벤토리 + ## 7-3)
- docs/30-workitems/_templates/TASK_TEMPLATE.md (## 6 (PX-M<N>-<screen>-NN) 태그)

### 강도 (ADR-022)
- enabling(약) — coverage surface + self-check. 자동 차단은 [Plan-FAC-coverage] 기존 강도(P0 권장, 차단 아님)를 따른다.
- **D6 override (ADR-045)**: 본 amend는 surface 5+ 추가(7 surface)라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-056 통합 재발행. (ADR-056은 grandfather 아님 — 2026-07-16 생성.)
- **Mutation delta (ADR-047 D3)**: failure=PX가 어떤 AC에도 안 매핑돼 dead field · PX가 실제 구현 feature와 다른 feature에 귀속(오배정) / falsifier=unmapped PX·오배정을 `[Plan-FAC-coverage]`(구조+의미, plan 단계)가 못 잡음 / rollback=PX 인벤토리·매핑·`(PX-…)` 태그 제거.

<a id="adr-056-amend-2"></a>
## Amendment 2 (2026-07-26) — raw hex 스캔의 토큰 정의 예외

### 배경
- [관측됨] SIMULATION_RUN Round 4 — stabilize §5-2 raw-hex grep이 fork의 DTCG 토큰 *정의* CSS(`src/index.css`의 `:root`)를 위반으로 오탐(false positive). 정의(당연히 hex가 있어야 함)와 사용처를 구분하지 못했다. 현행 제외는 DESIGN.md 자체 + `docs/20-system/prototypes/`뿐.

### 결정
1. §5-2 raw-hex grep 결과에서 **CSS custom property *정의* 라인**(`--<name>: #hex` 형태)은 제외한다(토큰 정의는 정상 — dogfood의 `src/index.css :root` 오탐 케이스가 이걸로 해소). 검사 대상은 정의 밖 *사용처*(`color:#hex` / `background:#hex` 등)의 raw hex.
2. **파일명 기반 전체 제외는 하지 않는다** — 파일명(`theme`/`tokens` 등)으로 파일 전체를 빼면 그 파일 안의 *사용처* 위반도 함께 숨는다(false negative). 정의/사용처 구분은 오직 (1)의 *라인 형태*로만 판정(정밀). 프로젝트가 순수 정의 파일 경로를 밝히고 싶으면 DESIGN.md §2에 적되, 검사 기준은 여전히 (1) 라인.
3. **전면 제외 금지**: 모든 `:root` 블록을 무조건 빼면 진짜 위반이 숨으므로, 오직 (1)의 *정의 라인*만 예외 — `:root` 안이라도 사용처 hex는 검사.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md (§5-2)

### 강도 (ADR-022)
- enabling(약) — 오탐 제거(검사는 report-only라 코드 차단 아님).
- **Mutation delta (ADR-047 D3)**: failure=토큰 *정의*를 위반으로 오탐하거나 `:root` 내 *사용처* hex를 놓침 / falsifier=`--x: #hex` 정의 라인이 다시 flag되거나 정의 밖 hex가 통과 / rollback=정의-라인 예외 제거(전면 grep 복귀).

<a id="adr-056-amend-3"></a>
## Amendment 3 (2026-07-26) — 화면 사이 흐름: 전환 표 + downstream 소비자 (다화면·복구 흐름 한정)

### 배경
- [관측됨] 화면 *안*(색·글꼴·컴포넌트)은 다중 감사받지만 화면 *사이* 흐름은 약하다. FEATURE §8-1(primary task·empty/loading/error 복구·a11y·HEART)은 이미 있으나 **downstream 소비자가 없어 dead field**이고, cross-screen 전환(A→행동→B, 실패/복구)을 담는 자리가 없다. *가설 — static prototype 실험이 화면 전환을 직접 검증하지 못함(다화면·복구 흐름에 한정 채택).*

### 결정
1. **plan-milestone R5-1 전환 표**: 마일스톤 문서에 `## 9. 화면 전환 (UI)` 표를 도출한다 — `path type(primary/failure/recovery) | 현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | owner feature | prototype`(**각 행이 하나의 path type** — primary happy-path, failure 전이, recovery 복귀; downstream이 문장 해석 없이 행 단위로 소비). **트리거는 *화면 수*가 아니라 *비가역 동작·분기·복구 상태의 존재*다**: (i) 화면 2개 이상(다화면 전환), 또는 (ii) **단일 화면이라도** 비가역/파괴적 동작(삭제·결제·전송)·분기·다단계 오류→복구(submit→error→retry)·modal·확인 dialog가 있으면 그 상태·복구 경로를 `## 9`에 적는다. 둘 다 아니면(순수 정적 단일 화면·비-UI) "(해당 없음)".
2. **downstream 소비자 배선** (안 그러면 §8-1처럼 또 dead field): plan-workitem이 분해하는 feature가 전환 표의 owner인 행을 회수해 그 **존재하는 각 path type 행(primary/failure/recovery)**이 task AC로 커버되게 하고(FEATURE §8-1의 복구 흐름과 정합; 모든 흐름에 failure·recovery를 억지로 만들 필요는 없다 — *표에 존재하는* 행만), validate-plan `[Plan-design]`이 **owner의 존재하는 각 path type 행이 프로토타입·AC에 존재**하는지 점검한다.
3. ADR-042 결정 3("흐름 점검은 기존 시나리오·상태 self-check가 담당, plan-workitem에 별도 UX self-check 안 둠")과의 관계: 본 결정은 별도 UX self-check 신설이 아니라 *기존 [Plan-design] 차원 확장 + §8-1 소비 배선*이다(ADR-042 정신 유지).

### 적용 surface
- .claude/skills/plan-milestone/SKILL.md (R5-1)
- .claude/skills/plan-workitem/SKILL.md (owner 행 회수)
- .claude/skills/validate-plan/SKILL.md ([Plan-design] recovery path)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md (## 9 화면 전환)

### 강도 (ADR-022)
- enabling(약) — 다화면·복구 흐름 한정 조건부. *가설*이라 design-eval 재검토 트리거류 실측 전 정책 확정 아님.
- **Mutation delta (ADR-047 D3)**: failure=화면 사이 흐름이 §8-1처럼 dead field / falsifier=owner 행을 plan-workitem이 회수 안 하거나 recovery path가 AC에서 누락 / rollback=`## 9` 표·downstream 소비 배선 제거.
