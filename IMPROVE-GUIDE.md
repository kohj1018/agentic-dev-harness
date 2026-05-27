# 문서/구조 정합 개선 가이드

> **사용법**: 위에서부터 순서대로 따라간다. 각 항목은 `📍 위치 → ❌ 현재(before) → ✅ 수정(after) → 🧪 검증 → 💬 커밋` 구조다.
> 대부분은 `❌ 현재` 문자열을 `✅ 수정` 문자열로 치환하면 되지만, 일부는 *지정 위치에 추가/삽입*이다(각 항목이 "…에 추가"·"다음에 추가"·"바로 위에" 등으로 명시 — 예: 항목 3·6·8·9·10). 각 항목의 `✅ 수정` 지시문을 그대로 따른다. 인용된 **줄번호는 "수정 전" 기준 locator**이며, 앞 항목을 이미 적용해 줄이 밀렸으면 줄번호 대신 헤딩/섹션 텍스트로 위치를 찾는다. **Tier 1(필수) → Tier 2(권장) → Tier 3(선택)** 순으로 처리한다.
> 커밋 메시지는 각 항목 끝에 한 줄로 제공한다. 항목별 개별 커밋을 권장하되, 묶어도 되는 그룹은 마지막 "커밋 전략"에 정리했다.

---

## 0. 요약표

| # | 우선순위 | 파일 | 한 줄 요약 |
|---|----------|------|-----------|
| 1 | 🔴 HIGH | `.codex/config.toml` | Codex에 secrets 읽기 차단 프로파일이 없음 — ADR-010이 요구하는 보안 baseline 누락(Claude만 차단 중) |
| 2 | 🟠 MED | `docs/00-meta/PROJECT_START_CHECKLIST.md` | `/plan-workitem`이 `/bootstrap-stack`보다 먼저 — README·DELEGATION의 stack→plan 순서와 모순 |
| 3 | 🟠 MED | `docs/90-decisions/boilerplate/ADR-010-*.md` | "자연어 Codex skill 4개"라고 박혀 있으나 실제 README는 7개 — 카운트 drift + 거짓 주장 |
| 4 | 🟠 MED | `docs/00-meta/WORKFLOW.md` | 4-A 면제가 "finalize가 IMPROVEMENT_GUIDE에 보고"한다고 하지만 finalize는 그 동작을 하지 않음 |
| 5 | 🟠 MED | `docs/00-meta/STRUCTURE.md` | milestone/feature 생성주체에 `/bootstrap-project` 누락(실제로 M1/F-001을 만듦) |
| 6 | 🟠 MED | `docs/90-decisions/boilerplate/ADR-044-*.md` | ADR-038을 "mirror"한다면서 Codex wrapper 결정만 설명 없이 빠짐 |
| 7 | 🟡 LOW | `.github/PULL_REQUEST_TEMPLATE/default.md` | 문서 체크리스트가 canonical entry인 AGENTS.md 대신 CLAUDE.md를 가리킴 |
| 8 | 🟡 LOW | `docs/90-decisions/boilerplate/ADR-037-*.md` | `## Amendment 1`에 stable anchor 없음 — ADR-046이 `ADR-037#amend-1`로 cross-cite(ADR-045 D2 미준수, enabling/약) |
| 9 | 🟡 LOW | `docs/00-meta/WORKFLOW.md` | validation report가 gitignore된 checkout-local 파일임을 명시 안 함 → worktree 분리 시 finalize가 막힐 수 있음 |
| 10 | 🟡 LOW | `docs/00-meta/WORKFLOW.md` | 비-UI fork가 DESIGN.md 삭제 시 AGENTS.md의 DESIGN 링크가 dangling됨 |
| T3 | ⚪ 선택 | (여러 ADR) | `## 상태`/`## Status` 혼재, ADR-024/040 stale 참조, 로컬 settings 위생 |

---

# Tier 1 — 필수 (정합/보안에 직접 영향)

## 1. 🔴 Codex secrets 읽기 차단 — permissions 프로파일로 이행

**📍 위치**: `.codex/config.toml`

**❌ 현재** — 파일 전체(`[permissions...]` 테이블이 통째로 없음):
```toml
# Codex CLI project config — see ADR-010
# References:
#   https://developers.openai.com/codex/config-reference
#   https://developers.openai.com/codex/config-advanced

model = "gpt-5.5"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[sandbox_workspace_write]
network_access = true

[windows]
sandbox = "unelevated"
```
- `.claude/settings.json`은 `Read(./.env)` / `Read(./.env.*)` / `Read(./secrets/**)`를 deny하지만, Codex 쪽에는 대응 차단이 **전혀 없다**.
- `sandbox_mode = "workspace-write"`는 워크스페이스 전체 읽기를 허용하므로 Codex 세션은 `.env`/`secrets/`를 그대로 읽을 수 있다.
- ADR-010이 이 대칭을 명시적으로 요구: `ADR-010:21`(D5 "secrets 차단"), `ADR-010:46`(surface 표 — Codex `permissions.boilerplate-secure.filesystem`, "양쪽 동시"), `ADR-010:51`("boilerplate-secure permissions 프로파일 포함"). 즉 **config가 자신의 governing ADR과 모순**이며 보안 baseline이 한쪽에서 깨져 있다.

> ⚠️ **치명적 주의 — `sandbox_mode`와 permissions 프로파일을 섞지 말 것**
> Codex 공식 문서: *"Permission profiles do not compose with the older sandbox settings. Configure either `default_permissions` and `[permissions]`, or `sandbox_mode` / `sandbox_workspace_write`, but not both."* 그리고 *"If `sandbox_mode` appears in any active config layer ... Codex uses those older sandbox settings instead of `default_permissions`."* ([codex/permissions](https://developers.openai.com/codex/permissions))
> → 즉 현재 config처럼 `sandbox_mode`를 **남긴 채** `default_permissions`를 추가하면 **프로파일이 통째로 무시되어 secrets 차단이 안 된다**. 보호되는 줄 착각하게 만들어 *현 상태보다 더 위험*하다. 반드시 legacy sandbox 설정을 **제거**하고 permissions 프로파일로 *완전 이행*해야 한다.

**✅ 수정** — `sandbox_mode`·`[sandbox_workspace_write]`를 **삭제**하고 permissions 프로파일 단독으로 전환한다. 파일 최종본(권장 출발점):
```toml
# Codex CLI project config — see ADR-010
# References:
#   https://developers.openai.com/codex/permissions

model = "gpt-5.5"
approval_policy = "on-request"
default_permissions = "boilerplate-secure"

# boilerplate-secure: workspace 읽기/쓰기 + 네트워크는 허용하되 비밀 파일 읽기를 deny.
# (legacy sandbox_mode/workspace-write를 대체 — 둘을 함께 두면 프로파일이 무시되므로 제거함)
[permissions.boilerplate-secure.filesystem]
":workspace" = "read"
glob_scan_max_depth = 4

[permissions.boilerplate-secure.filesystem.":workspace_roots"]
"." = "write"
"**/.env" = "deny"
"**/.env.*" = "deny"
"**/secrets" = "deny"
"**/secrets/**" = "deny"

[permissions.boilerplate-secure.network]
enabled = true

[windows]
sandbox = "unelevated"
```
- `deny`는 공식 문서상 **deny-read 규칙**(우선순위 `deny > write > read`) → `.env`/`secrets/` 읽기 차단.
- `[permissions.boilerplate-secure.network] enabled = true`는 기존 `sandbox_workspace_write.network_access = true`를 새 시스템으로 옮긴 것(네트워크 유지). 네트워크가 필요 없으면 `enabled = false`로.
- `[windows] sandbox = "unelevated"`가 새 permissions 시스템과 호환되는지는 설치 버전에서 확인(아래 검증 2). 충돌하면 일시 제거 후 재확인.

**🧪 검증** (외부 도구 스키마 의존 — **테스트 전 커밋 금지**):
1. `https://developers.openai.com/codex/permissions`에서 본인 설치 버전의 정확한 토큰(`:workspace` / `:workspace_roots` / `glob_scan_max_depth` / `permissions.<n>.network.enabled`)을 확인한다. 버전에 따라 키가 다를 수 있다.
2. `codex` 실행 → 설정 파싱 에러 없이 기동되는지 확인. (`sandbox_mode`가 어떤 config layer에도 남아 있지 않은지 — 남으면 프로파일이 무시된다.)
3. Codex 세션에서 (a) `.env` 읽기 시도 → **차단**, (b) 워크스페이스 일반 파일 읽기/쓰기 → **가능**, (c) (네트워크 필요 시) 외부 접근 → **가능** 을 각각 실측.
4. 적용된 최종 문법을 `ADR-010`의 `## 결과` 또는 `## 후속 작업`에 한 줄 기록(ADR-010:65 "적용된 fallback 패턴 명시" 이행 + 추적성). **그리고 ADR-010 본문이 *legacy `sandbox_mode`/`sandbox_workspace_write` 키를 직접 전제로* 쓴 서술이 있으면 permissions 프로파일 모델과 정합하게 다듬는다.** — surface 표(ADR-010:46)는 이미 `permissions.boilerplate-secure.filesystem` 기반이라 정합하고, D5(line 21)의 "sandbox"는 *일반 sandboxing* 의미(프로파일도 sandboxing을 제공)라 그대로 둬도 무방하다. *legacy 키 이름을 직접 가정*하는 표현(있다면)만 정정하면 된다.

> 🛟 **검증 불가 시 보수적 대안**: 설치된 Codex 버전에서 위 스키마를 확신할 수 없으면, *secrets가 차단되는 척하는 config를 커밋하지 말 것*. 둘 중 하나를 택한다 — (A) 완전 이행 후 위 3번 실측을 통과시켜 커밋, 또는 (B) 현행 `sandbox_mode`를 유지하되 **ADR-010 `## 후속 작업`에 "Codex secrets-read 차단 미적용 — permissions 프로파일 이행 + 실측 후 적용 예정" P1으로 명시**해 *false sense of security*를 만들지 않는다. (B)는 갭을 닫지 못하므로 임시 조치다.

**💬 커밋**: `fix(codex): migrate to boilerplate-secure permissions profile blocking .env/secrets reads (ADR-010)`

---

## 2. 🟠 시작 체크리스트 순서를 stack→plan으로 정렬

**📍 위치**: `docs/00-meta/PROJECT_START_CHECKLIST.md` (현재 §2가 `/plan-workitem`, §4가 `/bootstrap-stack`)

**❌ 현재** — `/plan-workitem`(§2)이 스택 확정·`/bootstrap-stack`(§4)보다 **먼저** 온다. 그러나:
- `README.md:21-23` 흐름: `/bootstrap-project → /bootstrap-stack → /stack-guard → /bootstrap-design → /plan-workitem`
- `DELEGATION_STRATEGY.md:96-105` 스킬 순서: bootstrap-project(1) → bootstrap-stack(2) → plan-workitem(3)
- 즉 두 권위 문서는 **stack→plan**인데 체크리스트만 **plan→stack**. ARCH 7-x/DESIGN 결정이 plan 품질에 영향을 주므로, 체크리스트 순서대로 하면 인터페이스/디자인 참조가 빠진 task가 생길 수 있다. 또한 체크리스트에는 `/bootstrap-design` 단계가 아예 빠져 있다.

**✅ 수정** — `## 2.`부터 `## 4.`까지(현재 22~47행)를 아래 블록으로 **통째 치환**한다(섹션 순서를 운영결정 → 스택/guardrail → 작업구조로 재배치):
````markdown
## 2. 운영 결정 (스택 확정)
- [ ] 운영 OS/셸 전제를 정했다
- [ ] 언어/프레임워크를 정했다
- [ ] 패키지 매니저를 정했다
- [ ] 테스트 도구를 정했다
- [ ] lint/typecheck 도구를 정했다

## 3. guardrail 추가
- [ ] `docs/00-meta/GUARDRAILS_STRATEGY.md`를 읽었다
- [ ] 스택이 정해진 뒤 `/bootstrap-stack [스택 설명]`을 실행했다

  ```
  /bootstrap-stack Next.js 16 + TypeScript + pnpm + Supabase + Playwright + Vercel
  ```
- [ ] `STACK_SETUP_PLAN.md`를 검토한 뒤 `/stack-guard`를 실행해 통합 `validate` 진입점·verify 스크립트를 생성했다
- [ ] (프론트엔드 스택이면) `/bootstrap-design`을 실행해 `docs/20-system/DESIGN.md`를 채웠다
- [ ] 필요하면 `.claude/settings.local.json`에 개인 자동화를 추가했다
- [ ] shared 설정에 환경 종속적인 hook를 바로 넣지 않았다

## 4. 작업 구조 준비
- [ ] `/plan-workitem [milestone-id]`를 실행해 milestone/feature/task 문서를 분해했다
  ```
  /plan-workitem M1
  ```
- [ ] bootstrap 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md / M1 / F-001의 `## 0. Status`를 `draft → ready`로 전환했다
- [ ] `docs/30-workitems/milestones`에 첫 milestone 문서가 있다
- [ ] `docs/30-workitems/features`에 첫 feature 문서가 있다
- [ ] 필요하면 `docs/30-workitems/tasks`에 task 문서를 만들었다
````
- §5(의사결정 기록)·§6(첫 커밋 전)은 그대로 둔다 — 번호가 자연히 이어진다.

**🧪 검증**: 체크리스트 §1→§2→§3→§4 흐름이 README.md:21-23 / DELEGATION_STRATEGY.md:96-105의 stack→plan 순서와 일치하는지 눈으로 확인.

**💬 커밋**: `docs(checklist): order stack setup before plan-workitem to match README and DELEGATION`

---

## 3. 🟠 ADR-010 자연어 Codex skill 목록 SSOT를 README로 단일화 (카운트 drift 차단)

**📍 위치**: `docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md` (Amendment 2, 94/98/105행)

**❌ 현재** — `ADR-010:94` "정확한 카운트는 **4개**(discover-product, review-doc, boilerplate-context, bootstrap-design)", `ADR-010:98` "README.md / README_ko.md는 **4개**를 정확히 나열", `ADR-010:105` "재평가 풀은 **4개**".
- 실제 `README.md:117`·`README_ko.md:116`은 **7개**를 나열: 위 4개 + `research-pack`(ADR-040 신설) + `validate-discovery` + `repair-discovery`(ADR-044 신설).
- ADR-040/ADR-044가 skill을 추가하면서 ADR-010(=Codex 어댑터 SSOT)의 Phase-2 목록을 갱신하지 않음 → 카운트 drift + "README는 4개를 나열"이라는 **거짓 주장**. (README 자체는 이미 7개로 정확하므로 README는 수정 불필요.)

> ⚠️ **근본원인 = amend churn, "7"을 또 박지 말 것.** amend-1="3개"→amend-2="4개"로 이미 한 번 정정됐다. 여기서 "7개"를 다시 핀하면 *다음 skill 추가 때 또 정정 amend가 필요*하다 — ADR-045 D5·D6이 경계하는 바로 그 패턴. 따라서 개수를 박는 대신 **README를 목록 SSOT로 선언**해 재발을 끊는다. (amend-3은 3번째 개정이라 D6의 supersede 하드 트리거 "4개+" 미도달 + churn을 끊는 정리성 변경이므로, 통합 재발행이 아니라 amend로 처리한다.)

**✅ 수정 (a)** — 파일 맨 끝(amend-2의 "없음 — count 정정만." 다음)에 Amendment 3을 **추가**한다:
```markdown

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
```

**✅ 수정 (b)** — ADR 인덱스의 amend 카운트도 함께 갱신한다(누락하면 stabilize preflight가 `P1 [ADR-index]`로 본문 `## Amendment N` 수 ↔ 인덱스 불일치를 보고한다 — stabilize SKILL.md:49). `docs/90-decisions/boilerplate/README.md:17`의 ADR-010 행 Amendments 컬럼만 치환(제목·요약 컬럼 보존):

❌ 현재:
```markdown
| 010 | Multi-agent compatibility (AGENTS.md as canonical entry) | accepted | (+#amend-1: Phase 2.5 stack-guard wrapper 승격, +#amend-2: bootstrap-design 자연어 호출 명시) | AGENTS.md를 캐노니컬 진입 페이지로, Codex CLI도 동일 워크플로우 동작 |
```
✅ 수정:
```markdown
| 010 | Multi-agent compatibility (AGENTS.md as canonical entry) | accepted | (+#amend-1: Phase 2.5 stack-guard wrapper 승격, +#amend-2: bootstrap-design 자연어 호출 명시, +#amend-3: 자연어 Codex skill 목록 SSOT를 README로 단일화) | AGENTS.md를 캐노니컬 진입 페이지로, Codex CLI도 동일 워크플로우 동작 |
```

**✅ 수정 (c, 권장 — ADR-045 D5/D6)** — ADR-010은 이제 *정정성 amendment*(amend-2·amend-3)를 가진 다개정 ADR이다. ADR-045 D5는 이런 ADR에 `## 현재 유효 결정` 요약(≤6줄)을 권장하고, D6 grandfather 절은 "기존 ADR은 *다음 변경이 발생할 때* `## 현재 유효 결정` 정리"를 지시한다 — 지금이 그 시점. ADR-010 `## 상태`의 `accepted` 다음 줄에 추가한다(D-번호는 ADR-010 자체 결정 D1~D8). ⚠️ 이 삽입은 ADR-010 이후 줄번호를 ~5줄 밀어내므로, ADR-010을 줄번호로 참조하는 다른 작업(예: 항목 1 검증 4)은 이 삽입 **전에** 끝내거나 헤딩 텍스트로 위치를 잡는다. 추가할 내용:
```markdown

## 현재 유효 결정 (요약 — 상세는 본문·amend SSOT)
- AGENTS.md = 캐노니컬 진입 페이지, CLAUDE.md = `@AGENTS.md` import (D1·D2).
- 워크플로우 본문 SSOT = `.claude/skills/<name>/SKILL.md`, `.agents/skills/`는 얇은 wrapper (D3·D4).
- Codex wrapper는 inner-loop 빈도 높은 skill에만 둔다. *자연어 호출* Codex skill의 목록·개수는 README가 SSOT — 본 ADR에 개수를 핀하지 않는다 (#amend-3).
- `.codex/config.toml` = 안전 baseline(secrets 차단 포함) + Codex 모델 ID 추적 (D5·D8).
```

**🧪 검증**: (a) ADR-010 본문에 자연어 skill 개수를 *현행으로 단정*하는 표현이 더 남지 않는지(amend-1/2의 과거 숫자는 Record로 보존하되 #amend-3이 정정임이 명확). (b) 본문 `## Amendment N` 개수(3) ↔ 인덱스 Amendments 컬럼 `#amend-N` 개수(3) 일치 — stabilize `[ADR-index]` 미보고. (c) (수정 c 적용 시) `## 현재 유효 결정`이 ≤6줄인지.

**💬 커밋**: `docs(adr-010): make README the SSOT for natural-language Codex skill list and sync ADR index`

---

## 4. 🟠 WORKFLOW 4-A 면제 보고 동선을 실제 동작과 일치시키기

**📍 위치**: `docs/00-meta/WORKFLOW.md:39`

**❌ 현재** (39행):
```markdown
면제 적용 시 `/finalize-workitem` 단계에서 IMPROVEMENT_GUIDE.md에 *"상위 문서 후행 갱신 필요"* P2 보고 — 다음 stabilize 라운드에서 상위 문서 sync 추적.
```
- `.claude/skills/finalize-workitem/SKILL.md` 본문에는 IMPROVEMENT_GUIDE.md에 쓰는 단계가 **없다**(status 갱신 + 명시적 add + commit만 수행). 또 IMPROVEMENT_GUIDE의 정식 owner는 `/stabilize-milestone`이다(STRUCTURE.md:44, stabilize SKILL.md:13-15의 "정상 책임" 3종). 즉 **존재하지 않는 동작에 의존하는 dead-end**이고, 면제를 쓴 사용자는 추적이 seed되지 않는다.

**✅ 수정** — 39행을 아래로 치환한다(기록 위치를 task 문서 메모로 이동 — finalize가 task 문서를 커밋에 포함하므로 영속됨):
```markdown
면제 적용 시 해당 task 문서 `## 8. 메모`에 *"상위 문서 후행 갱신 필요 (WORKFLOW 4-A 면제) — <어떤 상위 문서>"* 를 기록한다. `/finalize-workitem`이 이 task 문서를 커밋에 포함하므로 기록이 영속되고, 다음 `/plan-workitem` 또는 `/stabilize-milestone` 라운드에서 이 메모를 회수해 상위 문서 sync용 후속 task로 연결한다.
```
- (선택 강화) stabilize가 이 메모를 자동 회수하게 하려면, `stabilize-milestone/SKILL.md`의 1.0 deterministic preflight에 "task 문서 `## 8. 메모`에서 `WORKFLOW 4-A 면제` 문자열 grep → 발견 시 IMPROVEMENT_GUIDE에 `P2 [Doc-presync]` 기록" 한 줄을 추가하면 완전 자동화된다(별도 커밋 권장, 본 가이드 범위 밖 옵션).

**🧪 검증**: `finalize-workitem/SKILL.md`에 IMPROVEMENT_GUIDE 쓰기 단계가 없음을 재확인 → WORKFLOW.md:39가 더 이상 finalize의 비존재 동작을 가리키지 않는지 확인.

**💬 커밋**: `docs(workflow): record 4-A doc-presync exemption in task memo instead of nonexistent finalize write`

---

## 5. 🟠 STRUCTURE 산출물 표의 milestone/feature 생성주체 보완

**📍 위치**: `docs/00-meta/STRUCTURE.md:36-37`

**❌ 현재**:
```markdown
| milestone | `docs/30-workitems/milestones/M*-*.md` | `/plan-workitem` | Living | generated |
| feature | `docs/30-workitems/features/F-*-*.md` | `/plan-workitem` | Living | generated |
```
- `bootstrap-project/SKILL.md:49-50`이 `M1-foundation.md`·`F-001-core-value.md`를 직접 생성한다(ADR-007도 동일). 같은 표의 task 행(38행)은 생성주체를 둘(`/plan-workitem`, `/implement-workitem`) 적었는데 milestone/feature 행만 `/bootstrap-project`가 빠져 있다.

**✅ 수정**:
```markdown
| milestone | `docs/30-workitems/milestones/M*-*.md` | `/bootstrap-project`, `/plan-workitem` | Living | generated |
| feature | `docs/30-workitems/features/F-*-*.md` | `/bootstrap-project`, `/plan-workitem` | Living | generated |
```

**🧪 검증**: bootstrap-project가 M1/F-001을 만든다는 사실(SKILL.md:49-50)과 표가 일치하는지 확인.

**💬 커밋**: `docs(structure): list bootstrap-project as a milestone/feature creator`

---

## 6. 🟠 ADR-044에 Codex 호환(자연어 전용) 결정 명문화

**📍 위치**: `docs/90-decisions/boilerplate/ADR-044-cross-llm-discovery-validation.md`

**❌ 현재** — `ADR-044:13`은 "ADR-038 `/validate-plan` 패턴의 discovery 층 mirror"라 선언한다. 그러나 ADR-038은 **D5에서 `.agents/skills/validate-plan`·`repair-plan` wrapper를 생성**해 Codex가 `$validate-plan`으로 호출하게 했는데, ADR-044의 `## Surfaces`(28-31행)에는 Codex wrapper가 없고 그 차이에 대한 설명도 없다. cross-LLM 검토의 핵심은 *다른 도구(Codex)에서 실행*하는 것이라 "mirror"라면서 핵심 결정만 빠진 것이 어색하다. (실제로는 README가 자연어 호출 경로를 제공하므로 hard dead-end은 아님.)

**✅ 수정** — `## 결과`(23행) 다음에 결정 근거 한 줄을 추가한다:
```markdown
- **Codex 호환 (의도적 비대칭)**: `validate-discovery`·`repair-discovery`는 *자연어 호출*만 제공한다(`.agents/skills/` wrapper 미생성). ADR-038은 inner-loop 빈도가 높아 wrapper를 만들었으나, discovery cross-review는 호출 빈도가 낮아 ADR-010 Phase 2 자연어 정책을 따른다(자연어 호출 Codex skill의 목록 SSOT = README.md / README_ko.md — ADR-010 #amend-3). — ADR-038 D5와 의도적으로 다른 점을 명시.
```

**🧪 검증**: ADR-044가 wrapper 부재를 명시적 결정으로 설명하는지 확인. (대안: 자연어가 불충분하다고 판단되면 대신 `.agents/skills/validate-discovery/`·`repair-discovery/` wrapper를 ADR-038 패턴대로 생성하고 README의 자연어 호출 Codex skill 목록(SSOT)에서 두 skill을 제외 — 이 경우 커밋 메시지는 `feat(codex): add validate/repair-discovery wrappers`로.)

**💬 커밋**: `docs(adr-044): document discovery cross-review as natural-language-only on Codex (vs ADR-038 D5)`

---

# Tier 2 — 권장 (저비용 정합 개선)

## 7. 🟡 PR 템플릿 문서 체크박스를 AGENTS.md로 교체

**📍 위치**: `.github/PULL_REQUEST_TEMPLATE/default.md:13`

**❌ 현재**:
```markdown
- [ ] `CLAUDE.md`
```
- canonical entry는 `AGENTS.md`(ADR-010 D1)이고 `CLAUDE.md`는 `@AGENTS.md` import 한 줄뿐이다. 진입 지침을 바꾸면 실제로 편집하는 파일은 AGENTS.md다.

**✅ 수정**:
```markdown
- [ ] `AGENTS.md` (canonical entry — `CLAUDE.md`는 `@AGENTS.md` import)
```

**🧪 검증**: PR 템플릿 "문서 반영 여부"가 canonical entry를 가리키는지 확인.

**💬 커밋**: `docs(pr-template): check AGENTS.md as canonical entry instead of CLAUDE.md`

---

## 8. 🟡 ADR-037 Amendment 1에 안정 앵커 추가

**📍 위치**: `docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md:33`

**❌ 현재** (33행, 앵커 없음 — 같은 파일 amend-2는 59행에 `<a id="adr-037-amend-2"></a>` 보유):
```markdown
## Amendment 1 (2026-05-16) — FAC ↔ AC 매핑표 영속 SSOT 위치
```
- `ADR-046:11`이 `ADR-037#amend-1`로 cross-cite(인라인 토큰)하는데 대상에 stable anchor가 없다. ADR-045 **D2**는 *다른 파일에서 인용되는 amendment 헤딩 위에 명시 anchor*를 요구하고(강도는 enabling/약), **D1**은 `#amend-M`을 *클릭 anchor*로 규정한다(`#dK`만 grep 토큰). 헤딩 `## Amendment 1 (2026-05-16) — …`의 GitHub 자동 anchor는 한글·날짜·em-dash 슬러그라 `#amend-1`과 매칭되지 않으므로, anchor 없이는 정규 토큰이 해상되지 않고 heading-edit rot에도 취약하다.
- (정정) **stabilize는 이걸 보고하지 않는다**: stabilize preflight(SKILL.md:45)는 `## Amendment M` 헤딩 *또는* `<a id>` 중 *하나만* 있어도 통과한다. ADR-037에는 `## Amendment 1` 헤딩이 실재하므로 현재 `[Ref-anchor]`로 보고되지 않는다. 이 수정은 *checker가 시켜서*가 아니라 **ADR-045 D2 정책 준수**를 위한 것이다(부수 발견: checker가 D2의 anchor 요구를 강제하지 않는 lenient gap — 경미, D2가 enabling이라 별도 조치 불요).

**✅ 수정** — 33행 바로 위에 앵커 한 줄 추가:
```markdown
<a id="adr-037-amend-1"></a>
## Amendment 1 (2026-05-16) — FAC ↔ AC 매핑표 영속 SSOT 위치
```

**🧪 검증**: 정규 토큰 `ADR-037#amend-1`이 stable anchor(`adr-037-amend-1`)로 해상되는지 확인(D2 준수). stabilize는 헤딩만으로도 통과하므로 이 항목은 checker 출력 변화로는 검증되지 않는다 — anchor 실재만 확인한다.

**💬 커밋**: `docs(adr-037): add stable anchor for Amendment 1 cross-cited by ADR-046`

---

## 9. 🟡 validation report의 checkout-local 제약 명시

**📍 위치**: `docs/00-meta/WORKFLOW.md` (§4 구현 및 검증, 현재 23행 근처)

**❌ 현재** — report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore:14`로 ignore되는 ephemeral 파일인데(STRUCTURE.md:40), `finalize-workitem/SKILL.md:26`은 최신 report가 없으면 `Needs Validation`으로 종료하고 stabilize 1.5도 report로 졸업을 판정한다. README는 `claude --worktree`로 병렬 implement를 권장하므로, validate(worktree A)와 finalize(다른 tree)를 나누면 report가 안 보여 막힐 수 있다. 이 제약이 어디에도 명시돼 있지 않다.

**✅ 수정** — §4의 `- 검증은 /validate-workitem으로 수행한다 ...` 줄 다음에 blockquote 노트를 추가:
```markdown
> Note: validation report(`docs/40-validation/reports/<task-id>.md`)는 `.gitignore`된 **checkout-local 임시 파일**이다(커밋되지 않음). 따라서 `/validate-workitem`과 `/finalize-workitem`은 **같은 worktree/checkout**에서 연속 실행해야 한다 — 다른 worktree에서 나눠 실행하면 finalize가 report를 못 찾아 `Needs Validation`으로 종료한다.
```

**🧪 검증**: 노트가 추가되어 worktree 사용자가 same-checkout 제약을 알 수 있는지 확인.

**💬 커밋**: `docs(workflow): note validation reports are checkout-local and not shared across worktrees`

---

## 10. 🟡 비-UI fork의 DESIGN.md 삭제 시 AGENTS.md 링크도 제거

**📍 위치**: `docs/00-meta/WORKFLOW.md:10`

**❌ 현재** (10행):
```markdown
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다.
```
- 비-UI fork가 DESIGN.md를 삭제하면 `AGENTS.md:38`의 `[시각 디자인](docs/20-system/DESIGN.md) (UI 프로젝트 한정)` 링크가 dangling된다(AGENTS.md는 canonical entry라 가장 눈에 띄는 위치).

**✅ 수정** — 10행 끝에 한 문장 추가:
```markdown
- `docs/20-system/DESIGN.md`는 baseline placeholder(presence: conditional). UI 프로젝트는 `/bootstrap-design`이 본 파일을 채우고, 비-UI 프로젝트는 fork 직후 본 파일을 삭제한다. **삭제 시 `AGENTS.md`의 `[시각 디자인](docs/20-system/DESIGN.md)` 링크 줄(약 38행)도 함께 제거한다**(dangling 방지).
```

**✅ 수정(보강, 권장)** — `PROJECT_START_CHECKLIST.md`에는 현재 DESIGN.md 삭제 단계가 아예 없다. `## 6. 첫 커밋 전`(항목 2의 §2~§4 재배치 후에도 번호 유지)에 확인 체크박스 한 줄을 추가하면 비-UI 포커가 놓치지 않는다:
```markdown
- [ ] (비-UI 프로젝트) `docs/20-system/DESIGN.md`를 삭제하고 `AGENTS.md`의 DESIGN 링크 줄도 제거했다
```

**🧪 검증**: 비-UI 삭제 절차가 AGENTS.md 링크 정리까지 포함하는지 + 체크리스트에서 한 번 더 상기되는지 확인.

**💬 커밋**: `docs(workflow): instruct non-UI forks to drop the AGENTS.md DESIGN link when deleting DESIGN.md`

---

# Tier 3 — 선택 (cosmetic / 로컬 위생 / 판단 필요)

> 아래는 기능·정합에 직접 영향이 적거나, 보일러플레이트 산출물이 아닌 항목이다. 시간이 되면 처리한다.

### T3-a. ADR 상태 헤더 표기 통일 (`## 상태` vs `## Status`) — ⚠️ 단독 수정 금지
- 현재 `## 상태`(14개)와 `## Status`(나머지)가 혼재. 이건 cosmetic이 아니라 **잠재 버그**다: 세 surface가 서로 어긋나 있다.
  - `_ADR_GUIDE.md:10,33`은 섹션명을 **`상태`**(한글)로 정의.
  - `stabilize-milestone/SKILL.md:48`은 죽은 ADR 인용 점검에서 **`## Status`(영문)를 grep** — 즉 `## 상태` 헤더 ADR은 이 체커가 *조용히 건너뛴다*. (현재는 모든 ADR이 `accepted`라 표면화 안 됐을 뿐, 언젠가 `## 상태` ADR이 superseded되면 미검출.)
- 따라서 **한쪽 헤더만 바꾸면 새 모순이 생긴다.** 방향을 먼저 정하고 *세 곳을 같은 커밋에서* 고쳐야 한다:
  - **옵션 A (`## Status`로 통일)**: 14개 ADR 헤더를 `## Status`로 + `_ADR_GUIDE.md:10,33`을 `Status`로 갱신. (stabilize grep은 변경 불필요 — 이미 `## Status`.)
  - **옵션 B (`## 상태`로 통일)**: 나머지 ADR 헤더를 `## 상태`로 + `stabilize-milestone/SKILL.md:48`의 grep을 `## 상태`(또는 양쪽 매칭)로 갱신. (`_ADR_GUIDE`는 이미 `상태`.)
- **값은 건드리지 말 것**(전부 `accepted`). 옵션 결정은 사용자 몫 — 정하기 전에는 손대지 않는 게 안전하다.
- 💬 커밋(옵션 A 예): `docs(adr): normalize status heading to '## Status' and update _ADR_GUIDE`

### T3-b. ADR-024 / ADR-040 stale 참조에 주석
- `ADR-024:18`이 `docs/00-meta/TEMPLATE_GUIDE.md`·`docs/30-workitems/README.md`(둘 다 ADR-012가 삭제)를 참조 — 과거 cleanup 액션 기록이라 무해하나 경로가 dangling. 한 줄 `(ADR-012로 삭제됨)` 주석 추가 권장.
- `ADR-040:11`이 researcher 반환 cap을 "1,000~2,000 토큰"으로 인용 — 현행은 ADR-046의 ≤600(`researcher.md:33`). `(현재 cap은 ADR-046 ≤600 참조)` 한 줄 추가 권장.
- 💬 커밋: `docs(adr): annotate stale path/cap references in ADR-024 and ADR-040`

### T3-c. (로컬 전용, 비커밋) `.claude/settings.local.json` 권한 정리
- 이 파일은 `.gitignore:10`으로 ignore되어 **보일러플레이트에 포함되지 않는다**(보일러플레이트 결함 아님). 다만 현재 워크스페이스 로컬 파일에 `Bash(git reset *)`(11행), `Bash(git *)`(7행), `PowerShell(Move-Item *)`(54행) 같은 광범위 allow가 누적돼 있어 실수 비용이 크다.
- 수정(선택): `git reset *`·`git *`를 제거하거나 `git status`/`git diff`/`git log` 등 read-only로 좁히고, `Move-Item *`를 구체 경로로 좁힌다. 이전 감사 과정에서 누적된 일회성 grep·스크립트(`_audit_*.py` 등) 관련 allow 항목도 함께 정리.
- 커밋 불필요(ignored).

### T3-d. (참고) 템플릿 예시 링크는 깨진 링크가 **아님**
- 다른 감사가 P2로 든 `TASK_TEMPLATE.md:67`(`[M1-foundation](...)`) 등은 모두 `<!-- 예: ... -->` **HTML 주석 안**에 있어 실제 링크가 아니다. stabilize의 내장 link 체커는 주석을 무시하므로 false positive가 안 난다.
- 조치: 템플릿을 바꾸지 말 것. 만약 외부 링크 체커(예: 워크스페이스의 `_audit_links.py`)가 이를 깨진 링크로 잡는다면, **체커가 HTML 주석을 먼저 strip**하도록 고친다(템플릿이 아니라 체커 쪽 문제).

---

# 커밋 전략 (요약)

개별 커밋을 권장한다. 묶고 싶다면 아래 그룹으로:

1. **보안 (단독)**: 항목 1 → `fix(codex): migrate to boilerplate-secure permissions profile blocking .env/secrets reads (ADR-010)`
2. **워크플로 순서/정합**: 항목 2, 5 → `docs: align bootstrap/plan ordering and workitem-creator inventory`
3. **ADR 카운트/호환 정합**: 항목 3, 6 → `docs(adr): make README SSOT for Codex skill list and document discovery wrapper decision`
4. **WORKFLOW 정합**: 항목 4, 9, 10 → `docs(workflow): fix 4-A exemption routing, report locality, and non-UI DESIGN link`
5. **링크/메타 정합**: 항목 7, 8 → `docs: point PR template at AGENTS.md and anchor ADR-037 amend-1`
6. **(선택) Tier 3**: T3-a, T3-b → 각 커밋 메시지는 해당 항목 참조

> ⚠️ 커밋 규약(ADR-008): `git add -A`/`git add .` 금지 — 변경 파일을 명시 add. `--no-verify`/`--amend`/`git push` 금지. footer에 가능하면 `Refs:` 포함.

---

# 부록 — 검증했지만 정상(수정 불필요)

- 교차참조 무결성: 깨진 markdown 링크·내부 앵커·ADR 참조 **0건**. (항목 8의 amend-1은 *stable anchor 미설정* = ADR-045 D2 미준수이지, 깨진 *링크*는 아니다 — ADR-046:11이 클릭 링크가 아닌 인라인 토큰으로 인용하고 stabilize는 헤딩만으로 통과.)
- `AGENTS.md` 길이: 54줄 — 100줄 hard cap / 80줄 soft cap 준수.
- README EN/KO: 흐름·skill 목록·카운트 실질 동기화(둘 다 자연어 Codex skill 7개 나열).
- 모델 별칭(ADR-004): 7개 sub-agent 모두 `opus`/`sonnet` 별칭만 사용. tool allowlist 정합(qa/researcher read-only, validator report-only).
- `gpt-5.5`: ADR-010이 추적하는 Codex 모델 ID(이전 감사에서 라이브 OpenAI 모델 문서와 1회 대조됨). 모델 ID는 변동하므로 보일러플레이트 진화 시 재확인 대상 — ADR-010이 갱신 책임.
- `plansDirectory` 부재(ADR-024 정합).
