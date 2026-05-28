# ADR 작성 가이드

## ADR로 남길 결정의 기준
- 되돌리기 어려운 기술 선택 (프레임워크, DB, 인증 방식 등)
- 두 가지 이상 합리적인 대안이 있었던 결정
- 프로젝트 범위나 아키텍처를 크게 바꾸는 결정

일상적인 구현 결정(변수명, 함수 분리 등)은 ADR 대상이 아니다.

## Status 값
- `proposed`: 제안됨, 아직 확정 아님
- `accepted`: 팀/개인이 수용함
- `superseded`: 새 ADR로 대체됨
- `deprecated`: 더 이상 유효하지 않음
- `reserved`: 번호만 잡힌 placeholder. 본문 미작성.
- `parked`: 본문은 있으나 트리거 미달로 보류.

## 대체 절차
새 ADR이 기존 ADR을 대체할 때:
1. 기존 ADR 상태를 `superseded`로 변경한다.
2. 기존 ADR 상단에 "대체: ADR-xxx"를 기록한다.
3. 새 ADR에서 기존 ADR을 참조한다.

## amend / supersede / 신규 ADR 기준 (ADR-045#d6)
- 문구 정정·surface 1~2개 추가·충돌 없는 확장 → `## Amendment N` 추가.
- 정책 의미 변경·기존 결정 뒤집기·surface 5+ 추가 → 신규 ADR로 supersede.
- 개정(amend) 4개 이상 누적 → 통합 재발행(supersede)로 클린 ADR 재작성, 구 ADR은 `superseded`로 잔존.

## area 태그 (장기 분류 — project ADR 권장)
ADR 첫 줄 `> scope:` 다음에 선택적 `> area:` 한 줄을 둔다 — 값: `product | design | dev | infra | process | tooling`. project ADR이 쌓일 때 종류별 필터·sprawl 추적에 쓴다(폴더 분리 대신 메타데이터 — 단순성).

## 권장 섹션
- Status
- 현재 유효 결정 (amend ≥4 또는 정정성 amend 포함 시 필수 — ADR-045#d5)
- 배경 (왜 이 결정이 필요했는가)
- 결정 (무엇을 선택했는가)
- 근거 (왜 이 선택인가, 대안은 무엇이었는가)
- 결과 (이 결정으로 무엇이 달라지는가)
- Surfaces (여러 파일에 동기 반영되는 정책이면 필수 — fan-out SSOT, ADR-045#d3)
- 후속 작업
- Mutation Contract (harness surface 수정 ADR 한정 — 대상 surface 정의: [ADR-047](ADR-047-code-as-agent-harness.md) D3)

## 새 ADR 추가 절차
1. ADR 본문을 작성한다(번호 정책: [상위 README 허브](../README.md) "새 ADR을 어디 박는가" 참조 — boilerplate는 100 미만, project는 ADR-100+).
2. [README.md](README.md) 인덱스 표에 한 줄 추가(번호, 제목, 상태, 한 줄 요약).
3. 관련 agent/skill 본문에 ADR 링크를 박는다(정책 설명을 길게 박지 않는다).

## 참조 표기 (ADR-045#d1·#d2)
- ADR 간 참조는 정규 ID로: `ADR-027` / `ADR-027#amend-1` / `ADR-027#d5`. **줄번호 참조 금지** — 대신 내용 서술자나 섹션 anchor.
- 다른 파일에서 인용되는 amendment 헤딩 위에 stable anchor를 둔다: `<a id="adr-027-amend-1"></a>` (결정은 anchor 없이 `#dK` 토큰).
- `## Surfaces`에 등록된 파일은 본문에 `ADR-NNN` 역참조를 둔다(양방향 정합 — stabilize preflight가 점검).

## 참고
- 짧아도 된다. 핵심은 "왜 이 선택을 했는가"를 기록하는 것이다.
- ADR-001-doc-hierarchy.md를 예시로 참고한다.

## Ratchet Principle (ADR-022)
새 ADR을 박을 때는 [ADR-022](ADR-022-ratchet-principle.md)의 적용 범위 표를 따른다. 본 ADR의 `## 배경`은 [관측됨]·[외부실증]·[가설] 중 어디에 근거하는지 명시한다.

## Harness Mutation Contract (ADR-047)

본 ADR이 `.claude/skills` / `.claude/agents` / `AGENTS.md` / `.agents/skills` / `.codex/config.toml` / lifecycle ADR 중 *어느 하나라도* 수정한다면 ([ADR-047](ADR-047-code-as-agent-harness.md) D3 대상 surface), 본문에 `## Mutation Contract` 섹션 6 필드(Target / Failure mode / Predicted improvement / Preserved invariants / Falsifying evaluation / Rollback path)를 명시한다. ADR-022와 양립 — evidence label은 그대로, Mutation Contract는 변경 governance 양식.