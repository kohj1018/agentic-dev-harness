# 마일스톤 로드맵

> 요약 지도 — 각 마일스톤 상세는 링크된 Mx 문서가 SSOT. 이 파일은 `/plan-milestone`만 갱신한다(R3 생성/갱신, R0 재조정). 상태는 `stabilize-milestone`이 마일스톤 회고에 남긴 graduation 판정에서 파생 (ADR-057#amend-1).
> **얇음 규율**: Next/Later 행은 "목표 1줄 + 확신도"만 — 기능·AC·졸업 칸을 만들지 않는다(아직 안 정한 걸 정한 척 금지). M 번호는 Done/Now만 발급, Next/Later는 `(M3?)`처럼 잠정. 날짜·%·story point 기본 제외. Now 기본 1개(병렬은 명시 결정 시만).

## Done
<!-- 졸업한 마일스톤 스냅샷만. -->
| id | candidate-key | 목표 | 졸업 | 주요 기능 |
|----|---------------|------|------|-----------|

## Now
<!-- 현재 진행(기본 1개). 진척 스냅샷만 — 상세는 Mx 문서. -->
| id | candidate-key | 목표 | 진척 | 주요 기능 | 의존 |
|----|---------------|------|------|-----------|------|

## Next
<!-- 다음 후보 — `candidate-key` + 목표 1줄 + 확신도만. 상세 문서 없음.
     형식: - (M3?) `<candidate-key>` <목표 1줄> — 확신도: <높음/중간/낮음>
     첫 backtick 토큰 = 안정 candidate key(목표 슬러그, 예 `offline-merge`) — R0 재조정이 *이 key로* 중복 생성·Now 승격을 매칭한다(목표 문구가 바뀌어도 key는 고정). 예: - (M3?) `offline-merge` 오프라인 편집 병합 — 확신도: 낮음 -->

## Later
<!-- 그 뒤 후보 한 줄. 같은 `candidate-key` 형식. 예: - `team-collab` 팀 협업 — 확신도: 낮음 -->
