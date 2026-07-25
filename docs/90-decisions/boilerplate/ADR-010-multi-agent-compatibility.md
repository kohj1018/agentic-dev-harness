# ADR-010 다중 에이전트 도구 호환 (AGENTS.md as canonical entry)

> scope: boilerplate

## Status
accepted

## 현재 유효 결정 (요약 — 상세는 본문·amend SSOT)
- AGENTS.md = 캐노니컬 진입 페이지, CLAUDE.md = `@AGENTS.md` import (D1·D2).
- 워크플로우 본문 SSOT = `.claude/skills/<name>/SKILL.md`, `.agents/skills/`는 얇은 wrapper (D3·D4).
- Codex wrapper는 inner-loop 빈도 높은 skill + **cross-LLM 리뷰 skill과 그 repair 짝(빈도 무관 필수 — #amend-4)**에 둔다. *자연어 호출* Codex skill의 목록·개수는 README가 SSOT — 본 ADR에 개수를 핀하지 않는다 (#amend-3).
- `.codex/config.toml` = 안전 baseline + Codex 모델 ID 추적 (D5·D8). **secrets 차단은 Windows unelevated sandbox에선 OS-강제 불가 — AGENTS 정책 의존(config.toml 상단 주석이 실측 SSOT)**.
- 도구별 memory(Claude MEMORY.md·Codex memories)는 비캐노니컬 — 지속될 결정은 checked-in 문서(마일스톤/feature/ADR)에도 (#amend-5).

## 배경
이 보일러플레이트는 Claude Code 표면(`CLAUDE.md`, `.claude/`)에만 묶여 있어, 사용자가 Claude Code의 사용량 한도에 걸리거나 다른 사정으로 OpenAI Codex CLI로 전환할 때 동일 워크플로우를 이어가지 못한다.

본 ADR은 **같은 저장소에서 Claude Code와 Codex CLI 양쪽 모두 동일한 워크플로우를 따라 작업할 수 있게** 만든다. 단, 단순성(ADR-006)과 SSOT(ADR-005)을 절대 위반하지 않는다.

## 결정

| ID | 결정 |
|---|---|
| D1 | `AGENTS.md`를 캐노니컬 진입 페이지로 둔다 (프로젝트 루트). |
| D2 | `CLAUDE.md`는 `@AGENTS.md` import + Claude-only 추가지침 섹션만. |
| D3 | `.claude/skills/<name>/SKILL.md`가 워크플로우 본문의 canonical owner. |
| D4 | `.agents/skills/<name>/SKILL.md`는 얇은 wrapper만 — 본문은 D3 위치를 가리킴. |
| D5 | `.codex/config.toml`은 안전 baseline 최소 설정만 (sandbox, approval, 모델. **secrets 차단은 Windows unelevated에서 OS-강제 불가 — AGENTS 정책 의존, 파일 주석 참조**). |
| D6 | `.codex/agents/*.toml` custom subagents는 보류 (Phase 3). |
| D7 | 본 ADR은 ADR-005 SSOT 패턴 1·4를 그대로 적용. 패턴 5("CLAUDE.md = 진입 페이지")는 본 ADR로 표현이 갱신됨 — 캐노니컬 진입 페이지가 `AGENTS.md`로 이동, `CLAUDE.md`는 `@AGENTS.md` import 한 줄. 매핑 표는 본 ADR 본문에 흡수, 별도 `AGENT_TOOL_MATRIX.md` 신설하지 않음. |
| D8 | Codex는 모델 별칭 체계 없음 — 본 ADR이 Codex 모델 ID 추적 책임. ADR-004(별칭 정책)는 본문상 Claude의 별칭만 다루므로 amend 없이 implicit scope를 본 ADR이 명문화. |

## 근거
- 단순성 (ADR-006): 어댑터 표면 최소화.
- SSOT (ADR-005): canonical owner 1곳, 다른 곳은 링크. 정책=ADR 패턴.
- 공식 1차 출처: Claude Code memory 문서가 `@AGENTS.md` 패턴을 명시 권장 ([code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)).
- 가역성: AGENTS.md는 Codex의 공식 진입 파일이고 다른 도구와의 호환 가능성도 높아 Codex 사용을 중단해도 변경 대부분이 무해. (다른 도구 호환은 1차 출처가 아닌 기대 효과 — 검증된 사실은 Codex 측만.)
- Cross-platform 안정성: Windows symlink 의존 회피.

## 도구 표면 매핑 (Claude ↔ Codex)

| 영역 | Claude Code | Codex CLI | SSOT |
|---|---|---|---|
| 진입 페이지 | `CLAUDE.md` (← `@AGENTS.md` import) | `AGENTS.md` (자동 로드) | `AGENTS.md` |
| 정책·워크플로우·ADR | `docs/` (그대로) | `docs/` (그대로) | `docs/` |
| 도구 설정 | `.claude/settings.json` | `.codex/config.toml` | 각자 — 단 보안 baseline은 양쪽 동시 |
| 사용자 설정 | `.claude/settings.local.json` | `~/.codex/config.toml` | 각자 |
| Skill 본문 (canonical workflow) | `.claude/skills/<name>/SKILL.md` | `.claude/skills/<name>/SKILL.md` (wrapper가 가리키는 본문) | `.claude/skills/` |
| Skill discovery surface | `/<skill-name>` | `$<skill-name>` 또는 `/skills` (`.agents/skills/<name>/SKILL.md`는 wrapper body) | 도구별 진입 표면, 본문은 위 행 SSOT |
| Custom subagent | `.claude/agents/<name>.md` (markdown) | `.codex/agents/<name>.toml` (TOML) | Phase 3 보류 |
| Hooks | `.claude/settings.json` 안 | `.codex/hooks.json` 또는 `[hooks]` | 본 작업 비범위 |
| 모델 지정 | 별칭(`opus`/`sonnet`) — ADR-004 | 직접 ID(`gpt-5.5`) — 본 ADR 추적 | 도구별 다름 (구조적 차이) |
| Read 차단 (.env, .env.*, secrets/**) | `.claude/settings.json` `permissions.deny` | `AGENTS.md 정책 의존 (Windows unelevated sandbox — OS-강제 불가, config.toml 주석 참조)` | Claude=OS-강제 / Codex=정책 의존 (비대칭 — config.toml 주석 SSOT) |

## 결과
- AGENTS.md 신설 — **프로젝트 루트 1곳만** 둔다(Codex가 root→cwd 누적 32 KiB cap이므로 nested AGENTS.md를 만들면 잘릴 위험). nested 지침이 필요하면 docs/ 하위 마크다운으로 분리.
- CLAUDE.md는 `@AGENTS.md` import.
- `.codex/config.toml` 안전 baseline (legacy `sandbox_mode` 유지 — `boilerplate-secure` 프로파일은 미적용, 한계는 파일 주석 참조. upstream default는 박지 않음).
- `.agents/skills/` wrapper 4개 (Phase 1: `implement/validate/repair/finalize-workitem`).
- ADR-004 본문은 Claude의 별칭만 다루므로 amend 없이 implicit scope를 본 ADR이 명문화 — Codex는 본 ADR이 모델 ID 추적.
- 본 ADR은 ADR-005 SSOT 패턴 1·4를 그대로 적용, 패턴 5는 본 ADR로 표현이 갱신됨 (entry page = `AGENTS.md`).
- **운영 안내 1**: `docs/` 본문(예: `docs/00-meta/WORKFLOW.md`, `DELEGATION_STRATEGY.md`)에 등장하는 `/<skill-name>` 표기는 Claude 슬래시 커맨드다. Codex 사용자는 동일 skill을 `$<skill-name>`으로 읽는다 (Step 6 wrapper와 동일 변환).
- **운영 안내 2**: `.claude/skills/<name>/SKILL.md`는 D3에 의해 canonical SSOT이므로 직접 편집은 Claude Code 측에서 수행한다. 현재 `.codex/config.toml` baseline에는 `.claude/skills/**` read-only 룰을 박지 않음 (project root `.` = write 만 박혀 있음) — Codex 측에서 `.claude/skills/<name>/SKILL.md` 직접 편집으로 SSOT drift가 발생하는 사례가 *관측되면* 본 ADR을 amend해 `.codex/config.toml` `permissions.boilerplate-secure.filesystem`에 명시적 read 룰을 박는다 (단, 현 config.toml에는 `boilerplate-secure` 프로파일 자체가 없어 그 시점엔 프로파일 신설부터 필요 — Windows unelevated에서 OS-강제 가능 여부도 재확인 대상, 파일 주석 참조). 현재 baseline은 *관측된 실패 없음*([ADR-022](ADR-022-ratchet-principle.md) ratchet 약 정합).

## 후속 작업
- Phase 1.5 (적용됨): plan-workitem, bootstrap-project, bootstrap-stack, stabilize-milestone 4개 wrapper 추가. 근거 — fork 직후 첫 진입 시나리오(charter → architecture → 첫 분해)에서 자연어 호출 대비 wrapper 가성비가 inner-loop와 동등.
- Phase 2 자연어 호출 skill: 목록·개수는 README.md / README_ko.md가 SSOT (#amend-3) — 본 ADR은 핀하지 않는다. wrapper 승격 여부는 fork 데이터 회수 후 재평가 (amend-1 후속 작업과 동일 정책).
- Phase 3: Codex 서브에이전트는 GA(2026-07 확인 — `features.multi_agent` stable·on-by-default, 직접 요청·`AGENTS.md`/skill 지침으로 spawn, 내장 default/worker/explorer agent로 커스텀 persona 없이도 fan-out 가능, 병렬 `agents.max_threads` 기본 6). 본 저장소는 Claude 전용 persona(builder/researcher/qa/reviewer/architect)·라우팅을 Codex subagent로 아직 매핑하지 않아 순차/인라인 degrade를 보수적 기본값으로 둔다 — 실제 Codex fan-out 배선은 별도 설계(Stage 5 item 11c).
- Codex 모델 ID 갱신은 본 ADR을 새 ADR로 superseding.
- (Step 0-1에서 `gpt-5.5` 미접근 발견 시) 본 ADR "후속 작업"에 사용된 대체 ID와 갱신 책임자 명시.
- ADR-005 SSOT 패턴 5("CLAUDE.md = 진입 페이지")의 표현을 "entry page (AGENTS.md)"로 갱신하는 후속 ADR 또는 in-place 수정 검토. 본 ADR 채택 후 캐노니컬 진입점이 AGENTS.md로 옮겨가므로 패턴 5의 단어가 어긋난다.
- (Step 0-2에서 스키마 변경 또는 `.` 비상속 발견 시) 적용된 fallback 패턴을 본 ADR "결과" 또는 "후속 작업"에 명시해 추적성 유지.
- **[정정 2026-07-16: 본 프로파일은 현재 config.toml에 적용돼 있지 않다(legacy workspace-write 유지 — Windows unelevated 한계, 파일 주석 참조). 아래는 이력 보존용 서술.]** `boilerplate-secure` permissions 프로파일 적용 (2026-05-28): `extends = ":workspace"`로 빌트인 워크스페이스 프로파일 상속 + `:workspace_roots` 하위 `**/.env`·`**/.env.*`·`**/secrets`·`**/secrets/**` deny + `network.domains "*" = "allow"`(domains 비우면 모든 도메인 차단됨). legacy `sandbox_mode`/`sandbox_workspace_write` 제거(프로파일과 공존 시 프로파일이 통째로 무시 — ADR-010 item 1 이행). `:workspace`는 filesystem path key가 아니라 built-in 프로파일 이름이므로 `extends`로만 사용한다는 점도 함께 정합화. **실측 검증**(`codex doctor` startup warning 0개 + `.env` read deny + 외부 네트워크 접근)은 커밋 직전 사용자 수행 책임.

## Amendment 1 (2026-05-16) — Phase 2.5: stack-guard wrapper 승격

### 결정

기존 Phase 2 보류 4개 skill 중 **stack-guard 1개를 wrapper로 승격**한다. 나머지 3개(discover-product, review-doc, boilerplate-context)는 Phase 2 보류 유지.

### 근거

- 본 ADR Phase 2 보류 판단은 *"호출 빈도 낮음"* 기준이었으나, *영향도* 기준 재평가 결과 stack-guard만 별도 분류 필요.
- [SIMULATION_RUN.md Round 1](../../../.boilerplate/validation/SIMULATION_RUN.md) 직접 관측: 생성된 `validate` 명령이 실 환경 실패 → lifecycle 전체(validate-workitem / finalize-workitem / stabilize-milestone) 신뢰성 영향.
- 빈도는 낮으나 *실패 시 영향이 lifecycle 전체*에 미친다 — 자연어 호출이 *완전 정합 보장이 약한* surface를 inner-loop와 동등 wrapper로 박는다.

### 적용 surface

- `.agents/skills/stack-guard/SKILL.md` wrapper 신설 (기존 wrapper 8종과 동일 패턴 — `name:` 값은 `$` 없이).
- `README.md` / `README_ko.md`에서 `stack-guard`를 *Core workflow Codex wrapper* 목록으로 이동.
- 본 ADR D3·D4·D6은 변경 없음 — wrapper 본문은 여전히 `.claude/skills/<name>/SKILL.md` SSOT를 가리키는 얇은 stub.

### 후속 작업

- 향후 Phase 3에서 나머지 3개(discover-product, review-doc, boilerplate-context) 승격 여부 재평가는 *fork 데이터 회수 후* 결정 (현재 0건).

<a id="adr-010-amend-2"></a>
## Amendment 2 (2026-05-16) — bootstrap-design 자연어 호출 skill 명시

### 결정

[ADR-027](ADR-027-interface-decision-allocation.md)로 신설된 `/bootstrap-design`을 *Phase 2 보류 자연어 호출 skill*의 4번째 항목으로 명시한다. 본 ADR #amend-1의 "나머지 3개(discover-product, review-doc, boilerplate-context)" 표기는 *역사적 기록*으로 보존하되, 현재 상태의 정확한 카운트는 **4개**다 (discover-product, review-doc, boilerplate-context, bootstrap-design).

### 근거

- ADR-027이 `/bootstrap-design` skill을 신설했으나 본 ADR Phase 2 분류에 반영되지 않음 → canonical(ADR-010) vs README(`README.md` / `README_ko.md`는 4개를 정확히 나열) 사이 count drift.
- bootstrap-design은 UI 한정 + 호출 빈도 낮음 + 메인 세션이 R0~R4를 직접 운전(discover-product 패턴) — 자연어 호출이 inner-loop wrapper보다 적합. wrapper 승격 보류 유지.

### 적용 surface

- 본 ADR #amend-1 본문 "나머지 3개" 문구는 보존(Record 라이프사이클). 본 #amend-2가 정정 SSOT.
- README.md / README_ko.md 본문 변경 없음 — 이미 4개 정합.
- Phase 3 wrapper 승격 재평가 풀은 **4개** (3개 → 4개로 갱신).

### 후속 작업

없음 — count 정정만.

<a id="adr-010-amend-3"></a>
## Amendment 3 (2026-05-28) — 자연어 호출 Codex skill 목록 SSOT를 README로 단일화

### 결정

Phase 2 *자연어 호출* Codex skill의 **목록·개수는 README.md / README_ko.md가 단일 SSOT**다(ADR-005). 본 ADR은 더 이상 개수를 핀하지 않는다. #amend-1의 "3개"·#amend-2의 "4개" 및 "README는 4개를 정확히 나열" 표기는 이후 [ADR-040](ADR-040-external-research-capability.md)(research-pack)·[ADR-044](ADR-044-cross-llm-discovery-validation.md)(validate-discovery·repair-discovery) 신설로 stale해졌으므로 *폐기*한다 — README가 현행 목록을 이미 정확히 반영한다.

### 근거

- 개수를 ADR에 박으면 skill이 추가/이관될 때마다 정정 amendment가 쌓인다(amend churn — [ADR-045](ADR-045-doc-reference-contract.md) D5·D6이 경계). 목록 SSOT를 README 1곳으로 단일화해 재발을 차단한다.
- ADR-010의 역할은 *Phase 분류 정책*과 *Codex 모델 ID 추적*이지 변동성 큰 목록의 미러가 아니다(ADR-005 — 정의 1곳).

### 적용 surface

- #amend-1 "3개" / #amend-2 "4개" 문구는 Record로 보존(덮어쓰기 X). 본 #amend-3이 정정 SSOT — 이후 카운트·목록은 README만 참조.
- Phase 3 wrapper 승격 재평가 풀 = "현재 README의 자연어 호출 목록"(숫자 대신 목록 참조).

### 후속 작업

없음.

<a id="adr-010-amend-4"></a>
## Amendment 4 (2026-07-16) — cross-LLM 리뷰 skill은 wrapper 필수 (분류 축 추가)

### 결정
1. wrapper 부여 기준에 축 하나를 추가한다: 기존 "호출 빈도" 기준 위에, **실행 표면이 정의상 타 LLM인 cross-LLM 리뷰 skill(validate-plan/validate-discovery/validate-milestone)과 그 repair 짝은 빈도와 무관하게 wrapper 필수**.
2. 이에 따라 `validate-milestone`·`validate-discovery`·`repair-discovery` wrapper를 신설한다(`.agents/skills/<name>/{SKILL.md, agents/openai.yaml}` — validate-plan 패턴 복제). **ADR-054 결정 5와 ADR-044 결과의 "Codex 호환(의도적 비대칭)" 단락을 본 amendment가 부분 supersede**한다(각 ADR에 superseded-by 표기).
3. README.md/README_ko.md의 wrapper 목록 13→16종, 자연어 호출 목록 8→5종(discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack). **wrapper 신설과 README 갱신은 동일 커밋**(stabilize preflight 7 집합 검사가 어긋나면 P1 Roster-drift 발보).
4. **재발 방지**: stabilize preflight 7에 "cross-LLM 리뷰 skill과 repair 짝의 wrapper 존재" deterministic 체크 추가.
5. 잔여 자연어 5종은 승격하지 않는다(Codex 호출 실수요 근거 0건 — ADR-006 YAGNI, Phase 3 재평가 풀 유지). 단 그 5종의 skill 본문에 Codex 자연어 호출 안내 1줄을 일관 추가한다(discoverability 보수).

### 근거
- [관측됨] 사용자가 Codex에서 `$validate-milestone`을 호출했으나 wrapper 부재로 실패. '호출 빈도' 분류는 cross-LLM 리뷰 skill에 범주 오류 — 1차 실행 표면 자체가 Codex인데 Codex discoverability가 0이면 skill이 무력화된다. 같은 가족 내 validate-plan만 wrapper 보유(3층 3패턴 비일관)였고, 블랭킷 번역 규칙("docs의 `/skill`은 `$skill`로")이 stabilize 본문의 `/validate-milestone` 표기와 결합해 사용자를 정확히 실패 경로로 유도했다.
- 본 개정은 ADR-054 Falsifying evaluation의 후퇴가 아니라 *접근성 수정* — read-only/single-origin·opt-in 성격은 전부 보존.

### Mutation Contract (ADR-047 D3, 압축)
- Target: wrapper 6파일 신설 / README 2종 목록 + 트리 라벨 / ADR-044·054 표기 amendment + `## 현재 유효 결정` 신설 / ADR-010 본문 과잉보장 정정 4곳 + 요약 정정 2곳 / stabilize preflight 7 / validate-milestone SKILL Codex 단락 / 자연어 5종 본문 1줄.
- Failure mode: cross-LLM 리뷰 skill이 Codex에서 발견 불가(관측됨).
- Predicted improvement: Codex `$` 표면에 가족 6종 전부 노출, 번역 규칙 모순 소멸.
- Preserved invariants: D3/D4(wrapper=thin pointer), #amend-3(자연어 목록 SSOT=README), 각 skill의 read-only/opt-in 계약.
- Falsifying evaluation: 승격 후에도 Codex 실사용 실패 재현 시 wrapper 형식 재검토.
- Rollback: wrapper 3종 삭제 + README 원복 + ADR-044/054 원 결정 복원.

### 강도 (ADR-022)
- constraint(강, [관측됨]) — wrapper·README 동일 커밋 + preflight 체크. 나머지 enabling.

<a id="adr-010-amend-5"></a>
## Amendment 5 (2026-07-25) — 도구별 memory는 비캐노니컬 (필수 결정은 checked-in 문서에)

### 배경
- [관측됨] Claude Code는 내장 `MEMORY.md`, Codex도 native Memories 기능(`~/.codex/memories/`)을 갖는다 — *둘 다 존재*한다("Codex엔 memory 없음"은 오류). 단 Codex 쪽은 **버전에 따라 experimental·기본 비활성일 수 있다**(예: 일부 codex-cli 배포에서 memories=experimental off — 구체 버전은 핀하지 않는다). on이든 off든 본 amend 결정(비캐노니컬)은 불변이다. 둘 다 로컬·생성물이라 cross-machine sync가 없고 비캐노니컬이다.
- 위험: "OAuth는 M3로 미룸" 같은 결정이 *오직 도구 memory에만* 있으면, 다른 도구·다른 머신·fresh 세션으로 이어받은 사람은 그걸 못 보고 다시 계획한다(연속성 깨짐 + SSOT 위반).

### 결정
1. **도구별 memory(Claude `MEMORY.md`·Codex memories 둘 다)는 로컬 가속기일 뿐 사실의 유일 소유자가 되면 안 된다.** 지속돼야 할 결정(범위·마일스톤 순서·연기 결정·기술 선택 등)은 반드시 checked-in 문서(마일스톤/feature 문서 또는 ADR)에도 내려가야 한다.
2. 프로젝트 시작 시 1회 점검(PROJECT_START_CHECKLIST).

### 적용 surface
- docs/00-meta/PROJECT_START_CHECKLIST.md

### 강도 (ADR-022)
- enabling(약) — 규율 + 프로젝트 시작 시 점검(강제 불가 — 내장 memory는 자동 기록).
- **Mutation Contract delta**(base 승계): failure = 결정이 memory에만 남아 다른 도구·머신·세션에서 증발; falsifier(ADR-047#amend-1) = dogfood에서 checked-in 없이 memory에만 기록되는지; rollback = 체크리스트 §5 항목 제거.
