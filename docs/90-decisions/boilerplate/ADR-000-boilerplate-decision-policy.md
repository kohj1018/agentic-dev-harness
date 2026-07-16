# ADR-000 — Boilerplate decision policy (메타)

> scope: boilerplate

## Status
accepted

## 배경
- 본 디렉터리의 ADR-001/004~010은 *이 보일러플레이트 자체*의 정책 결정이다.
- fork된 프로젝트가 자기 ADR을 박을 때 (a) 보일러플레이트 결정과 자기 결정의 시각적 구분 부재, (b) supersede 권한 모호, (c) 새 ADR 번호 시작점 모호의 마찰을 갖는다.

## 결정

### A. scope 라벨링
모든 ADR 첫 줄(제목 다음)에 다음 표시를 둔다.
- `> scope: boilerplate` — 본 보일러플레이트 자체 결정. fork 후 supersede 가능.
- `> scope: project` — fork된 프로젝트의 자체 결정.

본 보일러플레이트가 박는 모든 ADR은 `scope: boilerplate`로 박는다. **ADR-002 / ADR-003은 legacy reserved placeholder** — 본 번호는 재사용하지 않는다. fork 사용자의 *initial project decisions* / *stack selection* ADR은 `/bootstrap-project` / `/bootstrap-stack`이 `project/ADR-100` / `project/ADR-101`에 생성한다 (#amend-1 참조).

### B. README 섹션 분리
`docs/90-decisions/README.md`를 두 섹션으로 분리.
1. **Boilerplate ADR** (fork 후 supersede 가능)
2. **Project ADR** (fork된 프로젝트의 결정)

### C. fork 후 ADR 번호 정책
- fork 사용자는 보일러플레이트 ADR 번호 범위(001~099)를 그대로 사용하지 않는다.
- 새 프로젝트 ADR은 **ADR-100부터** 시작한다(예: `ADR-100-<slug>.md`. 결정 A대로 `/bootstrap-project`=ADR-100 / `/bootstrap-stack`=ADR-101).
- 보일러플레이트 ADR을 supersede할 경우 본인 번호(ADR-100+)에서 박은 뒤 본문 첫 줄에 `Supersedes ADR-NNN (boilerplate)` 표기.
- **ADR-002, ADR-003은 legacy reserved**: 새 project ADR은 무조건 ADR-100부터 시작한다 (#amend-1로 정정. boilerplate/README.md *Reserved / Parked / Dropped 번호* 표 참조).

### D. supersede 권한
- fork 사용자는 boilerplate ADR을 자유롭게 supersede할 수 있다.
- supersede ADR은 *왜* 뒤집는지(프로젝트 컨텍스트·제약)를 본문에 1단락 명시.

## 결과
- fork 직후 사용자가 *어느 ADR이 내 결정인가*를 1초 안에 식별 가능.
- ADR 번호 충돌 영구 회피.

## 후속 작업
없음

<a id="adr-000-amend-1"></a>
## Amendment 1 (2026-05-16) — docs/90-decisions/ 폴더 분리

### 결정
`docs/90-decisions/`를 다음 2 sub-folder로 분리한다.
- `boilerplate/` — 보일러플레이트 자체 ADR (000~099). fork 후 read-only.
- `project/` — fork 사용자가 박는 프로젝트 ADR (100+).
- `docs/90-decisions/README.md` — 두 인덱스 허브.

### 근거
라벨 수준 분리(`> scope:`)는 *읽어야 알 수 있는* signal이지만 폴더 분리는 *읽지 않고도 보이는* signal. 6개월 운영 후 fork 사용자 시야에서 *내 ADR vs 보일러플레이트 ADR* 즉시 구분.

### supersede 흐름
`project/ADR-100-...`에서 `Supersedes ADR-006 (boilerplate)` 형식으로 cross-folder 참조 유지. 본 amend로 ADR-000 D 정책의 *boilerplate ADR 자유 supersede* 권한 그대로 작동.

<a id="adr-000-amend-2"></a>
## Amendment 2 (2026-07-16) — project ADR 작성 트리거 표 + [ADR-candidate] 회수 경로

### 배경
- [관측됨] project ADR(100+)의 작성 주체·시점이 초기 결정(ADR-100/101)과 T2 스택 변경(--migrate)에만 명확하고, mid-project 결정은 무규정("필요하면"/"(해당 시)"/"등"). 후보 회수 경로 단절 2곳: (a) stabilize step 6의 "ADR 후보 제안"은 영속 위치 미명시 — 대화 텍스트로 증발 가능, (b) validator의 "ADR 후보 표시"는 gitignore된 ephemeral report에 기록 후 삭제됨.

### 결정
1. **ADR 작성 트리거 표 (본 amendment가 SSOT — DELEGATION_STRATEGY에 요약 게시)**:

| 신호 | 작성 주체 | 시점 |
|---|---|---|
| 프로젝트 초기 결정 | `/bootstrap-project` (ADR-100) · `/bootstrap-stack` (ADR-101) | 실행 즉시 (현행 명문화) |
| T2 스택 변경 | `/bootstrap-stack --migrate` (ADR-1NN supersede) | 계약 시점 즉시 (현행 — ADR-055) |
| 고-stakes 설계 결정 (ADR-053 게이트 발동) | 그 라운드를 운전한 skill(bootstrap-project / plan-milestone / bootstrap-stack)이 architect sub-call로 초안 | **결정 확정 시점** (ARCH §7 결정 블록과 병행) |
| stabilize의 ADR 후보 (validator 후보는 결정 2의 P1-finding 경로 — 별도 영속 X) | IMPROVEMENT_GUIDE `P2 [ADR-candidate]` 영속 → **다음 `/plan-milestone` R0가 회수**, 사용자 채택 시 architect sub-call로 ADR-1NN 작성 + 인덱스 등재 | 다음 plan 라운드 |
| MCP 연결 등 수동 결정 | 사용자 수동 | 현행 |

2. **`[ADR-candidate]` 라벨 규약**: stabilize step 6은 후보를 IMPROVEMENT_GUIDE **항목 스키마(필수 4필드 `ID | severity | evidence label | linked workitem` — 본문 `## 항목 스키마` SSOT)** 로 영속한다. 형식(2줄 — 4필드 헤더 + 하위 라벨 줄):
   `- **M<N>-adrc-<K>** | P2 | [관측됨] | linked: M<N> | status: open`
   `  - [ADR-candidate] <결정 한 줄> — 회수: 다음 /plan-milestone R0`
라벨 기록 전 _ADR_GUIDE의 ADR 대상 기준(되돌리기 어려움/대안 2+/큰 범위) self-check(남발 방지). **후보 ≠ 자동 작성** — 채택은 plan 라운드에서 사용자 결정. **validator의 "ADR 후보 표시"는 별도 영속 채널을 만들지 않는다** — 후보 표시는 P1 finding(`[Arch-iface-7-N]` 등)에 실려 repair-workitem이 task `## 8. 메모`로 영속하는 기존 경로를 타며, *P2-only 후보의 report 소멸은 수용 잔여 gap*으로 명시한다(배경 (b)의 부분 해소 — 완전 봉합 아님). **회수·처리 후 해당 후보 항목 status를 갱신한다(채택→resolved / 기각→rejected) — 미갱신 시 다음 R0가 이미 처리된 후보를 재surface해 중복 ADR을 낳는다.**
3. **ADR-053 ④ "(해당 시) ADR" 판정 기준** (ADR-053#amend-1 동반): ARCH §7 결정 블록으로 부족한 경우 = 비-스택 프로세스/제품 범위/보안 결정, boilerplate ADR supersede, 여러 마일스톤에 걸친 재검토 트리거가 필요한 결정.
4. **품질 계약**: 작성 주체는 _ADR_GUIDE 권장 섹션을 self-check(필독 로드). preflight는 참조 유효성만 유지(본문 품질 heuristic 신설 X — `/review-doc` on-demand 재사용, YAGNI).

### 비결정 (No)
- `/draft-adr` 전용 skill — 문제의 본질은 스킬 부재가 아니라 호출 무규정. `[ADR-candidate]` 미회수가 2+ 마일스톤 반복 관측되면 재검토.
- stabilize/validator의 직접 ADR 작성 — read-only·판정 전용 계약 위반 + proposed ADR 남발 위험.

### Mutation Contract (ADR-047 D3, 압축)
- Target: stabilize step 6/8, plan-milestone R0, DELEGATION 트리거 표, WORKFLOW §6, STRUCTURE 산출물 표 ADR(project) 행, _ADR_GUIDE 1줄, ADR-053#amend-1.
- Failure mode: ADR 후보가 세션 종료와 함께 증발 / mid-project 결정의 작성 책임 부재(관측됨 — 경로 단절).
- Predicted improvement: 후보가 IMPROVEMENT_GUIDE open 항목으로 잔존해 증발 차단, 회수·작성 주체가 결정적.
- Preserved invariants: stabilize read-only(IMPROVEMENT_GUIDE 기록은 기존 정상 책임 범위) / validate 판정 전용 / ADR-055 tier 라우팅 / _ADR_GUIDE 양식.
- Falsifying evaluation: [ADR-candidate] 남발로 plan R0가 비대해지면 라벨 기준 강화; 미회수 반복이면 /draft-adr 재검토.
- Rollback: 라벨·표 제거(기록된 후보는 일반 P2로 잔존, 무해).

### 강도 (ADR-022)
- enabling(약) — 표는 소프트 규범, 후보는 보고. 강제 게이트 없음.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- docs/00-meta/DELEGATION_STRATEGY.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/STRUCTURE.md
- docs/90-decisions/boilerplate/_ADR_GUIDE.md
- docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md
