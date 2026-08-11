# 마일스톤 로드맵

> 요약 지도 — 각 마일스톤 상세는 링크된 Mx 문서가 SSOT. **`Done`/`Now`/`Next`/`Later`는 `/plan-milestone`만 갱신한다**(R3 생성/갱신, R0 재조정). **`## Backlog`만 append-only 다중 writer**다 — `/accept-milestone`(수용 라운드 계약 변경)·`/repair-acceptance`(`Out-of-contract`)가 행을 **추가만** 하고 다른 구간은 건드리지 않으며, 정리·승격은 `/plan-milestone`이 한다 (ADR-057#amend-1·#amend-4). 상태는 `stabilize-milestone`이 마일스톤 회고에 남긴 graduation 판정에서 파생하며 **Done 전환은 `YES`일 때만**이다.
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

## Backlog
<!-- 마일스톤 미배정 후보 (ADR-057#amend-4). Next/Later와 같은 얇음 규율 + `출처` 한 칸.
     형식: - `<candidate-key>` <목표 1줄> — 출처: <어디서 나왔나> / 확신도: <높음/중간/낮음>
     예:   - `offline-merge` 오프라인 편집 병합 — 출처: 수용 라운드 M1 r2 / 확신도: 중간
     writer: /plan-milestone(정리·승격 + 다른 원장에서 재분류해 온 항목 등재) + /accept-milestone·/repair-acceptance(append only)
     회수: 다음 /plan-milestone R0가 읽어 R1 재료로 합류. Next로 승격되면 이 구간에서 제거(candidate-key로 매칭).
     여기에 담는 것: «할 것은 정해졌고 언제만 남은» 마일스톤 단위 후보.
       — 수용 라운드의 «계약 변경» 피드백이 이 구간으로 온다 (ADR-066 D2 3갈래 라우팅의 목적지).
     여기에 담지 않는 것: 아직 정해야 할 결정(→ DECISION_REGISTER) / task 이하의 개선·부채(→ IMPROVEMENT_GUIDE).
     판별 기준 SSOT: docs/00-meta/STRUCTURE.md `## Canonical Owner 매핑` (ADR-005#amend-1). -->
