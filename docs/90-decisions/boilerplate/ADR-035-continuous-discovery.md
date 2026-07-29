# ADR-035 — DISCOVERY.md Living Doc + Assumption Tracker

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- `DISCOVERY_TEMPLATE`은 **14섹션 + 결번 11**(기존 11 + `## 12` Assumption Tracker·`## 13` Opportunity Backlog + #amend-2의 `## 14` Evidence Log·`## 15` Insight Backlog; `## 11. 열린 질문`은 ADR-060 D1이 폐지 — #amend-3). 번호는 재사용하지 않는다.
- 미검증 가정의 차단 강도는 **위험도 4단계**(#amend-3 = ADR-060 D5) — 현재 마일스톤 목표를 무효화하는 핵심 가설과 검증 계획 없는 가정은 `/seal-milestone` 차단, 나머지는 검증 방법·판정일·중단 기준 3필드를 갖춘 `risk-accepted`로 `DECISION_REGISTER.md`에 등재해 통과. 결정 1의 "미검증 - 행동 차단"은 이 표로 대체됐다.
- `/stabilize-milestone` §6.5의 staleness P1 보고(4 시그널 — #amend-1·#amend-2)는 *구현 후 회수 채널*로 그대로 유지된다(봉인 차단과 시점이 다르다).
- Evidence(`## 14`) → Insight(`## 15`) → Assumption(`## 12`)/Opportunity(`## 13`) → feature 흐름은 #amend-2가 SSOT.
- DISCOVERY=SSOT / Charter=snapshot, `--update` 모드, ID 매칭 idempotency는 결정 2~4 그대로 유효하다.

## 배경
- [관측됨+외부실증] `DISCOVERY_TEMPLATE.md`는 11섹션 placeholder. STRUCTURE.md는 "Living Doc"으로 분류했지만 *어떻게 살아 있는가* 정의 부재. mid-project pivot 시 재호출 절차 부재.
- [외부실증] Cagan dual-track Agile + Teresa Torres continuous discovery — discovery는 1회성 event가 아니라 ongoing. assumption tracker가 없으면 가설이 검증 없이 구현으로 이어진다.
- [관측됨] DISCOVERY → Charter *1방향 박기*만 정의 → 피벗 시 SSOT 모호.

## 결정

### 1. DISCOVERY_TEMPLATE 13섹션 (기존 11 + 신설 2)
- `## 12. Assumption Tracker` — 핵심 가정의 검증 결과 누적. 빈 결과 = "미검증 - 행동 차단", stabilize가 보고.
- `## 13. Opportunity Backlog` — 기각·검증실패 후보까지 보존 (Torres OST opportunity space).

### 2. `/discover-product` `--update` 모드
- 기존 DISCOVERY.md 있으면: R0→R1·R2→R3→R4 갱신 경로.
- `--fast --update`: assumption tracker만 갱신 (가장 빈번한 mid-project use case).

### 3. Idempotency
ID 매칭 — 기존 ID(A-1·A-2)면 *검증일·다음 행동만 갱신*, 새 가정이면 새 ID 부여.

### 4. DISCOVERY=SSOT / Charter=snapshot 명문화
- DISCOVERY.md = persona/scenario/assumption SSOT.
- Charter는 snapshot view — DISCOVERY 갱신 시 Charter는 자동 sync 안 됨.
- AGENTS.md에 1줄 명시. PROJECT_CHARTER.md 본문 끝에 안내 comment.

## 결과
- mid-project pivot 시 `/discover-product --update`로 DISCOVERY.md 갱신 → Charter 갱신 제안 흐름 확보.
- assumption tracker로 "왜 이걸 만들었지?" 질문에 즉각 답 가능.

## 잔여 모니터링
assumption tracker 빈 결과율 — stabilize가 "미검증 가정 N건" 형태로 보고.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT)
- AGENTS.md                                            — DISCOVERY=SSOT 1줄
- docs/10-charter/PROJECT_CHARTER.md                   — 본문 끝 staleness 안내
- docs/10-charter/_templates/DISCOVERY_TEMPLATE.md     — #amend-2 §14 Evidence / §15 Insight
- .claude/skills/stabilize-milestone/SKILL.md          — #amend-1 §6.5 staleness (#amend-2 4번째 시그널)
- .claude/skills/discover-product/SKILL.md             — #amend-2 R-E Evidence 회수 / --update

## 참고
- ADR-022 (Ratchet Principle — [관측됨+외부실증] 라벨)
- ADR-007 (workitem lifecycle)

<a id="adr-035-amend-1"></a>
## Amendment 1 (2026-05-16) — Charter 본문 staleness 보고 흡수

### 결정
ADR-035 *잔여 모니터링*의 *"assumption tracker 빈 결과율 보고"*를 다음 3 시그널로 확장한다.

- DISCOVERY.md mtime > PROJECT_CHARTER.md mtime
- Assumption Tracker 미검증 항목 수
- PROJECT_CHARTER `## 2.1 / 3.1 / 9` 섹션 stale

`/stabilize-milestone` step 6.5에서 점검 + IMPROVEMENT_GUIDE.md에 P1 보고.

### 근거
mid-project pivot 시 DISCOVERY만 갱신하고 Charter는 그대로일 경우 SSOT silent divergence 차단.

<a id="adr-035-amend-2"></a>
## Amendment 2 (2026-05-27) — Evidence Log + Insight Backlog (데이터→인사이트→기획 루프)

### 배경
- [관측됨] DISCOVERY는 정성 발굴(persona/pain/JTBD)에서 곧장 가정으로 점프 — *raw 증거(인터뷰 원문 요약·정량 지표·딥리서치 결과)를 적재할 1급 자리*가 없었다. 검증 "결과"는 §12의 한 칸 텍스트로만 남았다.
- [외부실증] Teresa Torres Opportunity Solution Tree / Cagan dual-track — discovery는 evidence → insight → opportunity → solution 흐름이 끊기지 않아야 한다.

### 결정
1. DISCOVERY_TEMPLATE에 **§14 Evidence Log**(source/date/type/finding/linked/confidence) + **§15 Insight Backlog**(insight/근거 evidence/status/linked feature) 신설. type: `qual | quant | research | external-research`. **append(재번호 X)** — 기존 13섹션 보존, 총 **13 → 15섹션**(ADR-035#d1의 "13섹션" 표현을 본 amend가 갱신).
2. 흐름: Evidence(§14) → Insight(§15) → Assumption(§12)/Opportunity(§13) → feature(plan-workitem이 §15 ID 연결).
3. `/discover-product --update`가 새 증거(§14 신규 행 + `docs/10-charter/insights/` 리서치 노트)를 회수해 §15·§12·§13 갱신. `--fast --update`는 §12 + §14만 빠르게 갱신.
4. `/stabilize-milestone` §6.5 staleness에 4번째 시그널 추가: §15 Insight Backlog의 `status=open`(미반영) 인사이트 수 → 있으면 P1 보고.

### 결과
- 데이터/인터뷰/딥리서치가 같은 입구(§14)로 수렴 → 반복 루프(계측→데이터→증거→인사이트→기획)가 닫힌다.

### Ratchet 강도 (ADR-022)
- enabling(약, [관측됨]+[외부실증]) — 표는 선택적 채움, 자동 차단 X.

### 적용 surface
- `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md` §14·§15
- `.claude/skills/discover-product/SKILL.md` --update 단락
- `.claude/skills/stabilize-milestone/SKILL.md` §6.5
- `.claude/skills/plan-workitem/SKILL.md` feature/task evidence 연결

<a id="adr-035-amend-3"></a>
## Amendment 3 (2026-07-29) — 미검증 가정의 차단 강도 정합 (위험도 4단계)

### 배경
- [관측됨] 결정 1은 `## 12. Assumption Tracker`의 빈 결과를 **"미검증 - 행동 차단"**으로 규정하는데, `DISCOVERY_TEMPLATE.md`는 같은 항목을 **"stabilize가 P1으로 보고(자동 차단 X)"**로 적는다. 정책 강도가 서로 다르다.

### 결정
둘 중 하나를 택하지 않고 **위험도로 분기**한다([ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D5와 동일 표):

| 유형 | 처리 |
|------|------|
| 실패 시 현재 마일스톤 목표가 무효가 되는 핵심 가설 | **봉인 차단** — 검증 후 진행 |
| 마일스톤 자체가 그 가설을 검증하는 실험 | `risk-accepted` 허용 — 검증 방법·판정일·중단 기준 3필드 필수 |
| 낮은 위험의 가역적 가설 | 동일 3필드 갖춘 `risk-accepted` |
| 검증 계획 없는 미검증 가설 | **봉인 차단** |

차단 판정 지점은 `/seal-milestone`이고, `stabilize`의 P1 보고는 *구현 후 회수 채널*로 그대로 유지한다(시점이 다르므로 충돌하지 않는다).
`risk-accepted`는 `docs/10-charter/DECISION_REGISTER.md`에 `authority: user-*`로 등재해야 성립한다. **`DISCOVERY.md`가 없는 프로젝트(discovery 생략 — PROJECT_START_CHECKLIST 1단계는 선택)는 본 검사를 skip하고 사유를 echo한다.**

**섹션 수 정정(동반)**: #amend-2가 규정한 "총 13 → 15섹션"은 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D1이 `## 11. 열린 질문`을 폐지(결번)하므로 **14섹션 + 결번 11**이 된다. 번호는 재사용하지 않는다.

### 적용 surface
- docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md
- docs/10-charter/_templates/DISCOVERY_TEMPLATE.md
- .claude/skills/seal-milestone/SKILL.md

### 강도 (ADR-022)
- constraint(강) — 1·4행은 봉인 차단.
- **Mutation delta (ADR-047 D3)**: failure=핵심 가설이 검증·수용 없이 구현으로 흘러감 / falsifier=3필드 없는 가정이 봉인을 통과 / rollback=4단계 표 제거 후 P1 보고로 원복.
