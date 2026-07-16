---
name: validate-milestone
description: 다른 세션·다른 LLM에서 stabilize 대상 마일스톤을 읽기 전용 교차 리뷰하고 임시 리뷰 파일 1개를 작성한다. 코드·문서·실행 일체 없음 (ADR-054).
argument-hint: "[milestone id] [--reviewer-tag <tag>]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
---

이 skill은 **판정 + 임시 리뷰 파일 기록 전용**이다. 코드·문서 수정 금지, **`validate`/`validate:e2e`/`npm audit` 등 실행 금지**(실행 금지의 본체는 skill instruction의 행동 계약이다 — allowed-tools에 Bash가 없으면 실행 시 권한 프롬프트가 뜨는 *마찰*일 뿐 사용자 승인 시 실행 가능하고, `disable-model-invocation`은 skill *자동 로딩*만 막을 뿐 도구 실행은 막지 않는다. Claude의 allowed-tools는 hard 제한이 아니라 사전승인 목록이며 진짜 hard 제한은 `disallowed-tools`이므로, "Bash 없음=원천 차단"은 부정확). stabilize-milestone(origin)이 실행·졸업판정·문서기록을 단일 수행하고, 본 skill은 *추가 모델의 읽기전용 2nd opinion*만 만든다.

**⚠ 같은 checkout 제약**: 리뷰 파일은 `docs/40-validation/stabilize-reviews/`의 gitignore된 로컬 파일. origin의 `/repair-milestone`이 회수하려면 *같은 checkout*에서 실행(다른 worktree면 수동 이동).

입력:
- `$ARGUMENTS`: milestone id(`M1`) + 선택 `--reviewer-tag <tag>`.
- tag `[A-Za-z0-9._-]{1,32}`, milestone-id `M[0-9]+`만 허용(미일치 즉시 종료). **`--reviewer-tag` 미지정 시 `default` 사용.** 파일 존재 시 자동 suffix(`-2`,`-3`) — validate-plan과 동형. **다중 리뷰어 동시 실행 시 서로 다른 tag 명시 권장**(예: `--reviewer-tag codex`) — 미지정 시 모두 `default`로 저장돼 suffix로만 구분된다.

반드시 먼저 읽을 파일:
- milestone 문서 + 산하 feature/task + (있으면) `docs/40-validation/reports/<task>.md`
- `docs/10-charter/PROJECT_CHARTER.md`, `docs/20-system/ARCHITECTURE_OVERVIEW.md`, `DESIGN.md`(UI 한정)

검토 (읽기 전용): stabilize의 *판단* 단계를 리뷰로 재수행 — qa 엣지케이스·회귀 + reviewer 리팩토링/디자인 부채. **결정적 preflight(grep)와 validate/e2e/audit는 재실행 안 함**(origin과 동일 결과). 발견 P0/P1/P2 + file:line.

리뷰 파일: `docs/40-validation/stabilize-reviews/<M>.<reviewer-tag>.md` — 양식(판정 ALL_GOOD/NEEDS_CHANGES + 발견 + 카운트 표 + 핵심 관찰 ≤3)은 validate-plan 차용. **단, 카운트 표의 카테고리 축은 plan 차원이 아니라 *stabilize 판단 층 라벨*을 쓴다** — qa(회귀/엣지케이스)·reviewer(리팩토링/디자인 부채). 각 발견은 `<라벨> <file:line> <증상>` 형식(QA_FINDINGS 라벨 체계 정합 — `/repair-milestone` dedup 입력).

가드: 코드·문서·실행·커밋 금지. 마지막 출력: 판정 + 카운트 + 파일 경로 + "origin에서 `/repair-milestone <M>`이 종합" 안내.

**Codex**: `$validate-milestone <M> --reviewer-tag <tag>`로 호출한다(wrapper 보유 — ADR-010#amend-4; 구 ADR-054 D5 자연어 정책은 superseded).

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 최소 충분.
