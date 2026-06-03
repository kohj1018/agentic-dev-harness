# ADR-049 — Concept-mockup-first 디자인 흐름 + 레퍼런스 리서치 노트

> scope: boilerplate
> area: design

## Status
accepted

## 현재 유효 결정
- `/bootstrap-design`의 *워크플로우 라운드 구조*는 본 ADR이 SSOT: R0(레퍼런스 추출 + `DESIGN_RESEARCH.md` 노트) → R1(원칙) → R2(다중 concept 시안 — DESIGN.md 작성 *전* 시각 방향 선택) → R3(토큰, 선택 concept에서 추출) → R4(컴포넌트) → R5(DESIGN.md 저장) → R6(DESIGN.md 파생 preview 최종 확인 + 정리).
- 시각 방향 *선택*은 R2 concept 시안(다중)이 PRIMARY, R6 preview는 SSOT 렌더 충실도 확인(사용자 생략 가능).
- ADR-027은 *DESIGN.md 내용*(#5 Stitch 8섹션+Motion, #6 3-tier 토큰, #7/#23 Don'ts)과 *ARCH 7-x 인터페이스 할당* SSOT를 유지. *라운드 구조·시안 시점·preview lifecycle(gitignore 포함)·R0 grounding*은 본 ADR이 ADR-027 #3/#13/#21/#d22/#d26/#27을 supersede(ADR-027 본문은 accepted 유지, 흐름만 이관). #d22의 design-preview.html *산출물 자체*는 R6이 계속 쓰지만 *삭제 시점(R5-3→R6-3)·gitignore 정책(보존 요청 시→기본 등재)*은 본 ADR이 갱신.

## 배경
- [외부실증] [prg.sh — Why Your AI Keeps Building the Same Purple Gradient](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) — 시각 결정 입력 없이는 median 미감(purple gradient SaaS) 회귀 (ADR-027 배경 계승).
- [관측됨] ADR-027 #d21의 R5 시안은 DESIGN.md를 *먼저 쓰고 나서* 단일 preview를 보여준다 → 사용자가 시각 방향을 *선택*할 자리가 없고, 텍스트(토큰)만으로 방향을 확정한 뒤에야 눈으로 본다. 방향이 틀리면 DESIGN.md 전면 재작성 비용.
- [관측됨] ADR-027 #d26의 R0 reference grounding은 what-to-borrow / what-to-avoid를 DESIGN.md `## 1 Overview`에 *1줄씩*만 남긴다 → 레퍼런스 분해 근거가 문서로 보존되지 않아 재검토·재디자인 시 소실.
- [가설] 다중 안 제시 후 선택은 단일안 반복보다 해 공간 탐색이 넓다 — 본 보일러 ADR-038(plan cross-validation 다중 관점) 정신과 정합. fork 데이터로 실증 회수 예정(후속 작업).

## 결정 (4)
> **부분 supersede 패턴 + 결정 번호 28~ 근거 명시** (ADR-045 D6 보강): ADR-027은 *내용·인터페이스 SSOT*로 accepted 유지하고, 본 ADR은 ADR-027의 *디자인 흐름 결정 시퀀스만* 이어받는다. 그래서 결정 번호를 1이 아니라 ADR-027 마지막 결정(#27) 다음인 **28부터** 잇는다(흐름 결정의 연속성 표시). D6의 amend|supersede 이분법(supersede 시 status→superseded)을 넘는 의도적 선택 — 근거: *내용 SSOT 생존* + *최소 변경*(ADR-006). checker/유지보수자가 "ADR-027 accepted인데 일부 결정만 historical"을 혼동하지 않도록 본 줄로 명문화.

28. **R0 레퍼런스 리서치 노트 영속화 + R2 선택 근거 누적** — R0가 레퍼런스(1~3) + 안티-레퍼런스(1~2)를 `docs/20-system/DESIGN_RESEARCH.md`에 *문서로* 남긴다: 조사일 + 각 레퍼런스의 color signature / typography pairing / density / motion 톤 분해 + what-to-borrow / what-to-avoid + grounding 출처(사용자 제공 URL·스크린샷 / 연결된 디자인 MCP[ADR-048] / 사전추출 라이브러리 refero·getdesign.md). **R2 선택 후 *시안 옵션별 근거 + 최종 선택 이유*도 본 노트에 누적**한다(DESIGN.md는 최종 *결정* SSOT, 본 노트는 *왜 그 방향인가*의 근거 — 재디자인 추적성). 파일명은 형제 SSOT 문서(`DESIGN.md`/`ARCHITECTURE_OVERVIEW.md`)와 동일한 UPPER_SNAKE. DESIGN.md `## 1 Overview`는 본 노트를 상대경로 링크 + 핵심 1~2줄 요약 + `선택 concept: <X>` 1줄. presence: conditional(UI 한정) / lifecycle: Reference(커밋됨 — 재디자인 입력).
29. **R2 다중 concept 시안 (DESIGN.md 작성 전)** — R1 원칙 + R0 레퍼런스 + Don'ts에 근거해 **서로 다른 시각 방향 2~3개**를 각각 자기완결 HTML/CSS로 `docs/20-system/design-concepts/concept-{A,B,C}.html`에 생성(빌드·외부 의존 0, 인라인 `<style>`, GENERATED 헤더). 모든 concept은 charter `## 2.1 페르소나` / `## 3.1 핵심 시나리오` 기반 *동일 대표 화면*을 렌더해 직접 비교 가능. 사용자에게 제시 → *방향 선택*(단일 또는 하이브리드 "A 색 + B 타이포"). 선택 전에는 R3~R6로 진행하지 않는다. presence: conditional / lifecycle: ephemeral(R6에서 정리).
30. **R3~R5는 선택 concept에서 파생** — 토큰(R3)은 선택된 concept의 CSS에서 추출(3-tier DTCG — ADR-027#d6 양식 유지), 컴포넌트(R4) 동일, DESIGN.md(R5)는 선택 concept + 토큰 + 컴포넌트로 authoring. DESIGN.md `## 1 Overview`에 `선택 concept: <X>(+하이브리드 메모)` 한 줄 기록.
31. **R6 = DESIGN.md 파생 최종 preview + 정리** (구 ADR-027 #d21 R5 계승, *시점만 후행*) — DESIGN.md(SSOT) 토큰/컴포넌트만으로 단일 `design-preview.html` 재생성(`:root` CSS 변수만 참조 — raw hex 금지) → SSOT 렌더 충실도 확인 루프 → 승인 시 **concept 시안 전체 + preview 삭제**. concept은 탐색용이고 확정 방향은 DESIGN.md(SSOT)에 반영됨. preview·concept 직접 편집 금지(ADR-005). 사용자가 R2 concept 승인으로 충분하다 판단하면 R6 preview는 생략 가능(승인 후 concept만 정리).

`--fast`: R0(레퍼런스 1 + minimal 노트) + R1(1줄) + R3(토큰) + R5(저장). **R2 concept·R4·R6 생략** — concept이 필요하면 종료 후 사용자가 명시 발화 시 R2만 단독 수행.
`--update`(ADR-027#amend-4 계승): 시각 *방향 전환* 시에만 R2 concept 재탐색. 토큰/컴포넌트 부분 갱신은 R3/R4만(§1~§9 구조 보존, 전면 재작성 X). 대규모 재디자인(브랜드 전환)은 결정 근거를 project ADR로 권장.

## 비결정 (영구 No)
- concept 시안을 commit·영속 — 탐색용 ephemeral, DESIGN.md가 SSOT(ADR-005). concept/preview ephemeral HTML은 `.gitignore`에 *기본 등재*한다(reports·plan-reviews ephemeral 처리와 동일 — 커밋 방지). 삭제(R6)가 정상 경로이고 gitignore는 *중단 세션·로컬 보존* 대비 안전망(ADR-027#d22의 "보존 요청 시에만 gitignore"를 *기본 gitignore*로 정렬 — repo의 다른 ephemeral 처리와 일관).
- 이미지 생성·image-to-code 의존 — HTML/CSS 자기완결 시안으로 충분(ADR-006 / ADR-027#amend-2 비결정 계승).
- concept 개수 4+ — 2~3개로 비교 인지 부하 제한(YAGNI).
- DESIGN.md repo root 이동 — ADR-027#d8 유지.

## Mutation Contract (ADR-047 D3)
1. **Target** — bootstrap-design SKILL R0~R6 라운드 재구성 + `allowed-tools`(concept 정리 rm) / DESIGN.md `## 1 Overview` reference 링크 + `## 0` placeholder 주석 R0~R6 + 선택 concept 기록 / STRUCTURE.md 산출물(DESIGN_RESEARCH, design-concepts) + canonical owner / WORKFLOW.md §2 concept 선택 게이트 / PROJECT_START_CHECKLIST 3단계 design flow / README·README_ko 흐름 1줄 / .gitignore ephemeral HTML ignore / ADR-027 현재 유효 결정 + Surfaces 라벨(부분 supersede 표기).
2. **Failure mode** — DESIGN.md를 먼저 쓰고 단일 preview를 마지막에 보여줘 시각 *방향 선택* 자리가 없음 + 레퍼런스 분해 근거 미보존(관측됨, ADR-027 #d21/#d26).
3. **Predicted improvement** — R2 concept 선택 후 DESIGN.md 작성 → DESIGN.md 전면 재작성률↓, `DESIGN_RESEARCH.md` 존재율↑(UI 프로젝트). dogfood UI 라운드에서 "방향 확정 후 재작성" 감소.
4. **Preserved invariants** — DESIGN.md가 시각 SSOT / preview·concept는 derived·ephemeral(ADR-005) / Stitch 8섹션+Motion 구조·3-tier 토큰·anti-slop Don'ts(ADR-027 #5/#6/#7/#23) / skill auto-invocation 금지 / 비-UI는 DESIGN.md 삭제(파일 부재 시 중단) / `--fast`·`--update` 존재 / 종료 후 `/clear` 권장.
5. **Falsifying evaluation** — ADR-017 dogfood UI 라운드에서 concept 시안이 토큰 미확정 상태라 3안이 사실상 동일하거나, 사용자 선택 단계가 흐름을 과도하게 늘리면 결정 29를 `--concepts` opt-in으로 후퇴(기본은 R0→R1→R3→R5 직행 + R6 preview).
6. **Rollback path** — 본 ADR superseded → ADR-027 #3/#13/#21/#d22/#d26/#27 라운드 구조로 복귀(R2 concept·DESIGN_RESEARCH 제거, 단일 preview를 DESIGN.md 후행으로 환원).

## 정책 강도 (ADR-022)
- enabling(약) — 라운드 재구성·새 산출물·opt-out(`--fast`) 보유, 되돌리기 쉬움. 결정 28(노트 영속)도 enabling, fork 데이터 회수 후 재평가.

## 결과
- 사용자가 *DESIGN.md 작성 전* 다중 concept 시안으로 시각 방향을 눈으로 선택하고, 레퍼런스 분해 근거가 `DESIGN_RESEARCH.md`로 보존된다. ADR-027은 DESIGN.md 내용·인터페이스 할당 SSOT로 유지.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- .claude/skills/bootstrap-design/SKILL.md  — #d28~#d31 R0~R6 + --fast/--update
- docs/20-system/DESIGN.md                  — #d28 §1 DESIGN_RESEARCH 링크 + §0 주석 R0~R6 + #d30 선택 concept 기록
- docs/00-meta/STRUCTURE.md                  — #d28 DESIGN_RESEARCH 행 + #d29 design-concepts 행 + canonical owner
- docs/00-meta/WORKFLOW.md                   — #d29 §2 concept 선택 게이트
- .gitignore                                 — #d31 concept/preview ephemeral ignore

> 적용 위치(Surfaces 아님 — ADR-045#d3 "README·요약·문맥 언급 등재 금지"): `README.md`/`README_ko.md` 흐름 1줄 + `docs/00-meta/PROJECT_START_CHECKLIST.md` design flow 단계는 *마이그레이션 적용 대상*이지 fan-out surface가 아니다(단순 참조 `[ADR-049]` 토큰만 유지, 역방향 미점검 — ADR-045#d4).

## 참고
- ADR-027 (DESIGN.md 내용·인터페이스 할당 SSOT — 본 ADR이 라운드 구조 #3/#13/#21/#d22/#d26/#27 supersede. ADR-027은 accepted 유지)
- ADR-005 (SSOT — concept/preview는 derived view)
- ADR-048 (디자인 MCP grounding access — R0 reference grounding이 연결된 디자인 MCP를 쓸 때)
- ADR-040 (research-pack — R0 reference grounding 보조), ADR-022 (Ratchet), ADR-047 D3 (Mutation Contract), ADR-019 (context minimal)
