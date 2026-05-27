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
