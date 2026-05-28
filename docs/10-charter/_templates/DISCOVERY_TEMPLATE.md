# Discovery: <프로젝트 이름>

## 0. Status
draft

## 1. 문제 한 줄
<!-- R0: 무엇이 핵심 문제인가 — 한 문장 -->

## 2. 페르소나
<!-- R0: 선택된 페르소나(persona-template.md 양식). 페르소나가 2명 이상이면 ### Persona A, ### Persona B로 분리. -->

## 3. Pain Inventory
<!-- R1: pain-template.md 양식의 표. 빈도 × 고통으로 정렬. -->

## 4. 핵심 Pain (상위 1~3개)
<!-- R1: 사용자가 선택한 핵심 pain. -->

## 5. JTBD (Jobs To Be Done)
<!-- R1: 가장 큰 pain의 JTBD 한 줄. -->

## 6. 시나리오
<!-- R1: happy path / alternate path / fail path 각 5~7단계. -->

### Happy path

### Alternate path

### Fail path
<!-- 사용자가 끊을 지점과 수용 가능한 fail을 명시 -->

## 7. MVP 범위
<!-- R2: 최소 기능 묶음 -->

## 8. MVP 비범위
<!-- R2: 의도적으로 미루는 것 -->

## 9. 성공 기준
<!-- R2: 측정 가능한 1~3개 -->

## 10. 핵심 가정
<!-- R3: 추측으로 답한 항목들. 가장 위험한 1~3개에 검증 방법 1줄 동봉. -->

## 11. 열린 질문
<!-- R3: 아직 답이 없는 중요한 질문 -->

## 12. Assumption Tracker
<!-- ## 10 핵심 가정의 *검증 결과 누적*. 빈 결과 = "미검증" — stabilize가 P1으로 보고(자동 차단 X; 가장 위험한 가정이면 "행동 차단 권장"으로 표시).
     ID 매칭: 기존 ID(A-N 형식, 예: A-1)면 *검증 결과·검증일·다음 행동을 갱신*(가정·검증 방법 열은 고정), 새 가정이면 새 ID 부여. -->
| ID  | 가정                   | 검증 방법    | 검증 결과  | 검증일 | 다음 행동 |
|-----|----------------------|------------|----------|------|---------|
| A-1 | (예: 타겟이 매주 이력서 갱신) | (예: 5명 인터뷰) | (미검증) | - | - |

<!-- /repair-discovery가 본 라운드의 P0/P1 결정을 1줄씩 append하는 `### Repair history` 보조 단락이 본 §12 표 아래에 들어선다 (ADR-047 D7 durable correction history + D1 inspectability + ADR-044 정합). -->

## 13. Opportunity Backlog
<!-- 기각·검증실패 후보까지 보존 (Torres OST opportunity space 정신).
     pain 발굴 → MVP 미포함 → 기각된 항목도 여기 남긴다. -->
| Pain | 빈도×고통 | 현재 상태 | 비고 |
|------|---------|---------|-----|
| (예: 협업자 권한 관리) | (가끔×하) | parked | M3 이후 재평가 |

## 14. Evidence Log
<!-- raw 증거 적재(인터뷰 요약·정량 지표 스냅샷·딥리서치). Evidence → Insight(§15) → Assumption(§12)/Opportunity(§13) 흐름의 입구.
     /discover-product --update 가 새 증거를 회수해 §15·§12·§13을 갱신. /research-pack 노트(docs/10-charter/insights/)도 external-research 항목으로 옮긴다.
     type: qual(인터뷰·관찰) | quant(지표·실험) | research(내부 정리) | external-research(외부 1차 자료). 정책: ADR-035#amend-2. -->
| ID  | source | date | type | finding | linked (A-N 가정 / I-N 인사이트) | confidence |
|-----|--------|------|------|---------|------------------------------|-----------|
| E-1 | (예: 사용자 인터뷰 5명) | 2026-05-27 | qual | (예: 3/5가 주간 갱신 안 함) | A-1 | 중 |

## 15. Insight Backlog
<!-- Evidence(§14)를 해석한 인사이트. status: open(미반영) | planned(feature 연결됨) | rejected.
     plan-workitem이 feature/task 생성 시 본 ID를 연결한다. 미반영 open 인사이트는 stabilize §6.5가 보고. -->
| ID  | insight (so-what) | 근거 evidence | status | linked feature | 비고 |
|-----|-------------------|--------------|--------|----------------|-----|
| I-1 | (예: 갱신 리마인더가 핵심 가치) | E-1 | open | - | M1 후보 |
