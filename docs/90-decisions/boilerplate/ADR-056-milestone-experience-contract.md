# ADR-056 — 마일스톤 경험 계약 (프로토타입 라운드 + 입구 계약 + 스크린샷 게이트 + Voice 규칙서)

> scope: boilerplate
> area: design/process

## Status
accepted

## 배경
- [관측됨] 모든 게이트의 채점 기준이 문서(AC/FAC)로 닫혀 있다 — validate-workitem의 판정 축 전부가 task/feature 문서 대비이고, 사용자가 눈으로 승인한 artifact가 오라클로 쓰이는 지점이 0곳이다. 잘못된 스펙일수록 테스트가 붙어 더 단단히 굳는다. 유일한 승인 artifact(R2 concept/R6 preview)는 승인 즉시 삭제 + .gitignore(ADR-049 #d31).
- [관측됨] 사용자의 첫 시각 확인 시점이 구현 완료 후라 마일스톤 종료 후 요구사항 미반영·불만족이 잦다(사용자 fork 보고).
- [관측됨] reviewer[design]은 grep 기반 토큰 대조만 가능했다 — 렌더 증거(스크린샷) 생산·주입 파이프라인 부재. 단 Playwright는 stack-guard가 UI 프로젝트에 선설치(ADR-052 D1)하고 Read 도구는 이미지를 읽을 수 있어 MCP 없이도 기술적으로 가능하다.
- [관측됨] voice/UX writing 규칙서가 repo 어디에도 없다 — 카피 관련 항목은 FEATURE §8-1 "copy 톤" 필드뿐이고 그마저 downstream 소비자 0인 죽은 필드. 전역 규칙 없이 feature 필드만 있어 feature마다 톤이 즉흥 재결정된다(ADR-027이 시각에 진단한 "명시 결정 자리 부재 → 매번 즉흥 결정"과 동형). placeholder 카피 금지 규칙도 0건.

## 결정 — A. 경험 계약 (1~7 — 프로토타입 라운드·게이트)
1. **승인 프로토타입 산출물 (경험 계약 SSOT)** — UI 확정(ADR-027#amend-3) 마일스톤은 **화면 단위** 자기완결 HTML 프로토타입을 `docs/20-system/prototypes/M<N>/<screen>.html`에 둔다(**커밋 대상**, lifecycle: Record — 재승인 시 같은 파일 *대체*, presence: conditional). **화면-키(screen-keyed)인 이유**: [관측됨] 실사용에서 한 화면은 여러 feature 표면의 합성이고 그 합성층을 아무도 설계하지 않아 품질이 무너졌다 — feature별 파일은 한 화면을 3~4개 프로토타입으로 쪼개 합성층 고아 문제를 재생산한다(단일 화면 feature는 화면명=feature 슬러그로 자연 수렴). feature 문서 `## 7`의 `프로토타입:` 참조 줄이 그 feature가 등장하는 화면 파일(들)을 나열한다(feature↔화면 매핑은 이 참조 줄들로 유도). 경험 계약 범위 — *확정*: 레이아웃 / 인터랙션 결과(정적 HTML이므로 캡션·상태 클래스로 표기) / 실제 카피(§10) / 상태(happy + **못생긴 상태 의무 5종**: 긴 제목·빈 목록·로딩·에러·항목 과다). *열어둠*: 엔지니어링 내부(상태관리·fetch·컴포넌트 구조 — ARCH §7-4 영역). SSOT 삼각: DESIGN.md=전역 시각 토큰 / FEATURE §3·§7=시나리오·측정 / prototypes=화면 경험. 충돌 시 우선순위: DESIGN.md 토큰 > 프로토타입 > FAC 텍스트(화면·카피·상태의 구체 해석 한정 프로토타입 우선). 탐색 시안은 `docs/20-system/prototypes/M<N>/_drafts/`(gitignore — 버리는 것)와 경로로 구분.
2. **plan-milestone R5 프로토타입 라운드** — R4 뒤 신설(UI 마일스톤 한정, 비-UI는 skip+사유 echo): R5-1 화면 목록 확정(feature당 대표 1화면 기본, 면제 feature는 이 시점 기록) → R5-2 브로드 시안 2~3안(designer 위임 — divergence 카드 차용, DESIGN.md 토큰만 참조) → R5-3 선택·수정 루프(취향 오라클=사용자, 2사이클 미수렴 시 brief 수정) → R5-4 경험 계약 완성(못생긴 상태 5종 + 실카피 + 인터랙션 캡션 + `:root` 토큰 참조 — 의무 체크리스트) → R5-5 승인 시 커밋 경로(`<screen>.html`) 저장 + 승인 직전 raw hex 1회 grep(`:root` 토큰 *정의* 블록 제외 — 자기완결 파일의 정의값 hex는 정상) + feature 문서 `## 7`에 프로토타입 참조 줄(화면 파일 + 진입 메모) + `_drafts/` 내 시안 파일 삭제. **`/plan-milestone M<N> --prototype [F-NNN]`** 재진입 모드(R0~R4 skip — 마일스톤 중간 화면 변경·재승인).
3. **plan-workitem 입구 계약 (이중 잠금)** — UI **확정** feature 분해 시 해당 승인 프로토타입 참조도 면제 기록도 없으면 **`Needs Experience Contract`로 종료** + `--prototype` 안내(ADR-007#amend-3 `Needs Stack Guard` 동형 — ADR-007#amend-5로 예외 등재). UI **의심**(status=draft+신호)은 경고만(false positive 완충). opt-out: feature 문서에 `프로토타입 면제: <사유>` 기재 시 통과(TDD opt-out 동형 — 사유 영속). 배치 모드(ADR-057 결정 2)에서는 미충족 feature만 보류 목록으로 분리하고 나머지는 진행한다(전체 차단 X). 분해된 task `## 3`에 프로토타입 참조 line item을 plan이 authoring(builder는 기계 실행).
4. **경험 좁힘 질문 규칙** — plan-workitem 9-1 self-check에 추가: "AC 해석이 프로토타입·상위 약속이 보여주는 사용자 체감(보이는 것·눌렀을 때·문안)을 *좁히면* 무조건 질문 — 내부 엔지니어링 선택은 자율". implement 단계 비대칭: builder의 AC-ambiguity 하드스탑에서 *경험 계약이 존재하는 slice의 보이는 것·문안 차이는 "사소한 표현 차이" 분류 금지*(silent narrowing 차단).
5. **stabilize §3-V 경험 게이트 (스크린샷 vs 승인본)** — UI 확정 마일스톤이면 메인 세션이 앱 기동 → 핵심 화면(≤6~8, 기본 뷰포트 1종) Playwright CLI 스크린샷 → `docs/40-validation/visual/M-N/` 갤러리(gitignore ephemeral) → Read 멀티모달로 대조. **실행 자체는 UI 확정 마일스톤에서 의무 — silent skip 금지**(미실행 시 사유(blocked-on-env 등)를 최종 출력에 echo; *판정*은 report-only 유지 — ADR-052 e2e silent-skip 금지와 동형). **대조 앵커 위계: ① 커밋된 승인 프로토타입 `<screen>.html`(존재 시 — 같은 뷰포트로 file:// 렌더 캡처해 나란히 대조 가능) → ② DESIGN.md §2/§7/§9/§10 파생 체크리스트(면제·부재 화면 fallback)**. 불일치는 `P1 [Experience-drift]` report-only(enabling — 졸업 필수 승격은 fork 실증 후 ratchet; MILESTONE item 6 선택 기준 예시 제공). 갤러리 경로를 최종 출력에 실어 사용자 육안 확인 유도(스펙 자체 오류는 인간 오라클). 환경 실패는 기존 blocked-on-env 라벨 재사용. `--dry-run`에는 미포함. Codex(멀티모달 편차): 갤러리 생성 + 사용자 수동 대조로 degrade. hot-loop 배치 금지(per-task validate에 넣지 않음 — ADR-049#amend-2 결정 7 carve-out 정합).
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
- 이미지 생성·Figma 의존 — HTML/CSS 자기완결로 충분(ADR-049 정합).
- 비-UI 마일스톤 의무화.
- per-task 스크린샷 대조(validate-workitem) — repair 루프 재실행마다 이미지 토큰 소모(준-hot-loop 트랩).
- 별도 VOICE.md 파일 / ux-writer agent — §10 규칙서로 흡수(단순성 1순위).

## Mutation Contract (ADR-047 D3)
1. Target — plan-milestone(R5+--prototype)/plan-workitem(입구 계약+9-1+voice cross-check)/stabilize(§3-V·§5-2 제외·voice grep·출력)/builder(비대칭 1줄)/reviewer(렌더 증거+[Design-voice])/validator(§10 정합)/DESIGN.md §10/FEATURE·MILESTONE 템플릿/.gitignore/STRUCTURE/WORKFLOW + ADR-007#amend-5 + ADR-027#amend-5·6 + ADR-042#amend-1.
2. Failure mode — 사용자 승인 artifact가 오라클로 쓰이는 지점 0 + 승인본이 ephemeral 경로에서 증발 + 첫 시각 확인이 구현 후 + 전역 voice 규칙 부재로 톤 즉흥 재결정(전부 관측됨).
3. Predicted improvement — 구현 전 경험(화면·인터랙션·카피) 확정으로 마일스톤 종료 후 재작업 감소, 승인본이 독립 오라클로 영속, [Experience-drift]/[Design-voice]로 drift 가시화.
4. Preserved invariants — stabilize read-only(§3-V는 촬영·판독·보고만)/ADR-049 R2 concept ephemeral 정책(범위 한정 — ADR-049#amend-2 결정 8)/hot-loop 스크린샷 금지/ADR-014 graduation 5+1 본체/DESIGN.md 시각 SSOT 지위/비-UI 삭제 경로/자동 차단 X(결정 3 제외).
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
- .gitignore
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md

## 참고
- ADR-049(#amend-2 — R2 원형·carve-out·실카피 라운드 배선), ADR-042(#amend-1 — §8-1 delta), ADR-007(#amend-5 — 입구 계약 예외 등재), ADR-027(#amend-3 UI 판정, #amend-5 §10 섹션, #amend-6 렌더 증거), ADR-052(Playwright 선설치), ADR-014(item 6), ADR-048(browser MCP는 §3-P 탐색용 — §3-V는 MCP 불요), ADR-022, ADR-047 D3.
