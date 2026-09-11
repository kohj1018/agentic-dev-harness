# QA 결과

> 본 문서는 마일스톤 단위로 누적된다. 각 마일스톤별 P0/P1/P2/관찰 메모를 중첩 헤더로 분리한다.
> 마일스톤이 정해지지 않은 초기 프로젝트는 `## 일반` 한 묶음만 둔다.

## 항목 스키마

각 발견 항목은 다음 형식으로 박는다.

- 필수 4필드: `ID | severity | evidence label | linked workitem`
- 처리 후 필수 2필드(P0·P1): `status | decision` — 6-S 검토(ADR-070 D2)나 `/repair-milestone` 4-판정(ADR-070 D3)을 거친 P0·P1은 두 필드가 비어 있을 수 없다. P2와 미처리 항목은 권장.
- `decision` 값: `confirmed | rejected-fp | rejected-context | needs-confirmation | unsubstantiated`(ADR-070 D2). P0 항목은 하위 줄 `- 재현: <명령/단계> → <관측 출력>`이 필수이며, 미시도면 `- 재현: 미시도 — <사유>` + evidence `[가설]`(ADR-070 D1).
- evidence label은 [boilerplate/ADR-022](../90-decisions/boilerplate/ADR-022-ratchet-principle.md)의 `[관측됨]` / `[외부실증]` / `[가설]` (+ 합성 표기) 중 1개.
- **선택 마커 `- 수렴-보류:`**: 수렴 실패 브리프에서 사용자가 선택지 B를 택한 항목에 붙는 하위 줄 — `- 수렴-보류: 회수 <시점> | 조건: <…>`. `status`는 `open`으로 유지한다(졸업 item 5 계수 불변). `/repair-milestone`이 그 라운드 수리 대상에서 제외하는 유일한 신호이며 문자열 정확 일치로 grep된다(ADR-070 D5).
- **선택 태그 `(수용)`**: `/accept-milestone`이 사용자 수용 라운드에서 등재한 항목에 붙인다. **위치는 굵은 ID 바로 뒤·첫 `|` 앞으로 고정한다** — `- **M1-003** (수용) | P0 | ...`. 이 태그가 `/repair-acceptance`의 유일한 회수 신호이며 문자열 `(수용)` 정확 일치로 grep된다(ADR-066 D5). `/repair-milestone`은 이 태그가 붙은 항목을 4-판정하지 않는다.

예시:
```
- **F-M1-001** | P0 | [관측됨] | linked: T-002 | status: open | decision: confirmed
  - 발견 (qa): 세션 만료 후 재요청이 500을 낸다.
  - 재현: `npm run validate:e2e -- --grep expired` → `Expected 401, received 500`
  - 출처: qa
```

## 다운스트림 마이그레이션 가이드
이 보일러플레이트는 빈 템플릿이라 적용 즉시 변경 가능하다. 그러나 본 보일러플레이트로 시작한 다운스트림 프로젝트가 이미 평면 양식의 누적 데이터를 가질 수 있다.
- (1) 기존 평면 항목들을 `## M1` 또는 `## 일반` 한 묶음으로 감싼다(편집 1회).
- (2) 다음 회차부터 새 마일스톤 헤더로 누적한다.
- (3) 기존 항목의 decision 값이 자유 텍스트면 위 5값 중 하나로 정규화한다(불명이면 needs-confirmation).

---

## 일반

### P0

### P1

### P2

### 관찰 메모
