---
name: validate-discovery
description: 다른 세션·다른 LLM에서 DISCOVERY.md(제품 기획 SSOT)를 비판적으로 교차 검토하고 임시 리뷰 파일 1개를 작성한다. DISCOVERY/charter 수정 X (ADR-044).
argument-hint: "[--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
context: fork
agent: reviewer
context-pack: minimal
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. DISCOVERY.md / PROJECT_CHARTER.md / 코드 일체 수정 금지. (ADR-038 `/validate-plan` 패턴의 discovery 층 mirror)

**호출 시나리오**: 원본 discovery 세션과 *다른 터미널·다른 세션·다른 LLM*에서 호출. 출력 리뷰 파일은 원본 세션의 `/repair-discovery`가 회수한다.

**⚠ 같은 checkout 제약**: 리뷰 파일은 `docs/40-validation/discovery-reviews/`의 로컬·gitignore 파일. 두 skill을 같은 checkout에서 실행하거나, 다른 worktree면 원본 checkout으로 파일 이동 후 `/repair-discovery`.

입력:
- `--reviewer-tag <tag>` (미지정 시 `default`). tag 형식 `[A-Za-z0-9._-]{1,32}`, 미일치 시 *즉시 종료*(silent overwrite 회피).
- 기존 `docs/40-validation/discovery-reviews/DISCOVERY.<tag>.md` 존재 시 `<tag>-2.md`/`<tag>-3.md`로 자동 suffix 부여.

반드시 먼저 읽을 파일:
- `docs/10-charter/DISCOVERY.md` (부재 시 종료 — `/discover-product` 선행 안내).
- (참조) `docs/10-charter/PROJECT_CHARTER.md` — DISCOVERY와의 drift 점검용.

검토 차원 (Discovery Quality 8 — reviewer.md `discovery` surface 정합):
1. `[Disc-persona]` 페르소나가 증거 기반인가, 추측이면 가정으로 표시됐나. (P1)
2. `[Disc-pain]` pain이 빈도×고통으로 실재·우선순위화됐나 vs 가정. (P1)
3. `[Disc-jtbd]` JTBD가 진짜 job인가(solution-in-disguise 아님). (P1)
4. `[Disc-scope]` MVP 범위/비범위가 ruthless한가(scope creep). (P0)
5. `[Disc-assumption]` 가장 위험한 가정이 식별·검증계획 있나(§10/§12). (P0)
6. `[Disc-metric]` 성공 기준이 측정 가능한가(§9). (P1)
7. `[Disc-evidence]` §14 Evidence 신뢰도 라벨 적절·가설↔사실 분리(ADR-035#amend-2). §14 부재 시 본 차원 skip + "핵심 관찰"에 명시. (P1)
8. `[Disc-bias]` confirmation bias / leading 질문 / 단일 출처 과신. (P1)

판정 규칙: **NEEDS_CHANGES**(P0 ≥1) / **ALL_GOOD**(P0=0; P1/P2는 막지 않음). *리뷰 라벨이지 워크플로 차단 아님*(ADR-038 정합).

마지막 단계 — 리뷰 파일 작성: `docs/40-validation/discovery-reviews/DISCOVERY.<reviewer-tag>.md`. 양식은 validate-plan 리뷰 파일과 동형 — 판정 / 발견(P0/P1/P2 + 카테고리 라벨) / 카테고리 카운트 표 / 핵심 관찰(3개 이내) / 다음 권장 액션(`원본 세션에서 /repair-discovery`).

마지막 출력(메인에 텍스트로): 판정 + 사용된 tag + P0/P1/P2 카운트 + 리뷰 파일 경로 + "원본 세션에서 `/repair-discovery`".

가드: DISCOVERY/charter/코드/다른 산출물 일체 수정 금지. 커밋 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 자료는 발화 시 인용 — 사전 fork-load 금지.
