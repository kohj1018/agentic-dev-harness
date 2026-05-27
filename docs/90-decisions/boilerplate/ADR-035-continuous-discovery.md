# ADR-035 — DISCOVERY.md Living Doc + Assumption Tracker

> scope: boilerplate

## Status
accepted

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
