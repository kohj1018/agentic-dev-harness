# IMPROVE-GUIDE — lifecycle skill 개선 실행 가이드

> 모드: How-to (단계별 행동 지침). 이 문서 하나만 위에서 아래로 따라가면 모든 개선이 끝나도록 작성했다.
> 작성일 기준: 2026-06-05. 대상 저장소: agentic-dev-harness (문서 중심 멀티-agent 보일러플레이트).

---

## 0. 이 가이드가 하는 일 (요약)

사용자가 요청한 5개 개선을 **종속관계 순서**로 묶어 9개 Phase로 정리했다.

| 개선 항목 (사용자 요청) | 다루는 Phase |
|------------------------|-------------|
| ① 7개 skill을 `context: fork`(서브에이전트) → **메인 세션** 실행으로 | Phase 1·2·3 |
| ② repair-plan / repair-workitem이 리뷰·검증을 **비판적으로 재점검**하고 본인 판단으로만 수정 + 끝나면 **리뷰/report 파일 삭제** | Phase 5 (repair-workitem 동작 신설) / repair-plan은 이미 보유 — Phase 2-C 확인 단락 |
| ③ 라이브러리 설치를 **plan에서 반영**(필요 시 researcher로 최신 버전·사용법 조회) + **implement에서 실제 설치** | Phase 7 |
| ④ plan-workitem의 task를 **그대로 따라 하면 개선이 끝나는 단계별 구현 가이드**로 작성 | Phase 6 |
| ⑤ implement / validate / repair / finalize-workitem의 `disable-model-invocation: true` **해제** | Phase 3·4 |

**핵심 사실 3가지 (왜 이렇게 바꾸는가):**

1. `context: fork`가 있으면 SKILL.md 본문이 **격리된 서브에이전트**에서 돈다. 제거하면 본문이 **메인 세션 대화에 주입**되어 메인 에이전트가 직접 수행한다 → 전체 컨텍스트·사용자 판단·실시간 권한 응답이 가능해진다. (사용자가 겪은 "리뷰 파일 삭제가 안 됨"은 fork가 권한 프롬프트에 응답할 수 없어 `rm`이 막힌 정황과 일치 — 메인 세션 전환으로 해소.)
2. `context: fork`를 지우면 `agent:`는 **무시되는 죽은 필드**가 된다(서브에이전트 persona 미적용). `context-pack: minimal`은 이 저장소의 메인 세션 skill(`discover-product` 등)도 유지하므로 **그대로 둔다**. `model:`/`effort:`는 인라인에서도 적용되지만, 본 가이드는 무거운 추론을 architect/researcher **sub-call**로 위임하는 기존 패턴(`discover-product`·`bootstrap-design`)을 따르므로 bootstrap 2종에서는 제거한다.
3. `disable-model-invocation: true`를 지우면 **모델이 Skill 도구로 그 skill을 직접 호출**할 수 있다. 이는 이 저장소가 명문화한 **"스킬 자동 호출 금지"** 규약(ADR-007·ADR-046·ADR-047 D3의 보존 invariant "skill auto-invocation 금지")과 **정면으로 충돌**한다 → Phase 8에서 이 규약을 **4개 실행 skill에 한해 의도적으로 완화**하는 ADR/문서 정합 작업이 반드시 따라와야 한다.

> ⚠️ **읽고 넘어갈 것 (Phase 4 / Phase 8 관련):** 개선 ⑤는 단순 frontmatter 한 줄 삭제가 아니라 **정책 역전**이다. skill 파일만 고치고 ADR/WORKFLOW/DELEGATION 문서를 그대로 두면 `/validate-plan`·`/stabilize-milestone`의 정합 점검이 "문서-구현 drift"로 잡는다. Phase 8(문서·ADR 정합)은 **선택이 아니라 ⑤를 완성하는 필수 절반**이다.

---

## 변경 매트릭스 (skill별 최종 상태)

| skill | `context: fork` | `disable-model-invocation` | `agent:` | 비고 |
|-------|:---:|:---:|:---:|------|
| bootstrap-project | **제거** | 유지 | **제거** | `Agent` 추가, `model/effort` 제거, 본문 2줄 수정 |
| bootstrap-stack | **제거** | 유지 | **제거** | `Agent` 추가, `model/effort` 제거, 본문 1줄 수정 |
| stack-guard | **제거** | 유지 | **제거** | frontmatter만 |
| validate-plan | **제거** | 유지 | **제거** | frontmatter만 |
| repair-plan | **제거** | 유지 | **제거** | frontmatter + persona 문구 1줄 정리 (삭제·4판정 동작 이미 보유) |
| validate-workitem | **제거** | **제거** | **제거** | 본문 "자동 호출 아님" 2줄 완화 |
| repair-workitem | **제거** | **제거** | **제거** | + **비판적 재점검 + report 삭제 동작 신설** |
| implement-workitem | 유지(fork) | **제거** | 유지 | + 라이브러리 설치 실행 동작 |
| finalize-workitem | 유지(fork) | **제거** | 유지 | frontmatter만 |
| plan-workitem | 유지(fork) | 유지 | 유지 | + 상세 구현 가이드 authoring + 라이브러리 설치 authoring |

> implement/finalize가 fork를 **유지**하는 이유: 구현은 테스트 실행·대량 편집으로 컨텍스트가 폭증하고, finalize는 git 조작이라 **격리가 이득**이다. 반대로 validate/repair는 검증 정확성 판단·풀 컨텍스트가 필요해 **메인 세션이 이득**이다. 사용자의 선택(implement/finalize fork 유지, validate/repair de-fork)은 이 구분과 정합한다.
>
> Codex wrapper(`.agents/skills/<name>/SKILL.md`)는 **수정 불필요** — 모두 `.claude/skills/<name>/SKILL.md`를 "source of truth"로 읽고 Claude 전용 frontmatter를 무시하므로, 본 가이드의 frontmatter·본문 변경이 자동 반영된다 (ADR-010 parity).

---

## Phase 0 — 준비

```bash
git checkout -b feat/main-session-lifecycle-skills
```

- 작업 브랜치를 만든다(현재 `main`). 모든 변경은 이 브랜치에서.
- 각 Phase는 독립 커밋이다. Phase 1~7(skill 본체) 먼저, Phase 8~9(문서·ADR 정합) 나중. **Phase 9까지 끝나야 저장소가 자기-정합 상태**가 된다(Phase 6·7이 인용한 `ADR-026#amend-2`·`ADR-040#amend-1`을 Phase 9가 실재화하므로).

---

## Phase 1 — bootstrap-project / bootstrap-stack 메인 세션 전환

**목표:** fork 격리를 풀고, 무거운 아키텍처 추론은 `Agent` 도구로 **architect 단발 sub-call**에 위임하는 메인 세션 패턴(`discover-product`·`bootstrap-design`과 동일)으로 바꾼다.

### 1-A. `.claude/skills/bootstrap-project/SKILL.md`

**frontmatter — 변경 전 (5~11행):**
```yaml
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
context: fork
agent: architect
model: opus
effort: max
context-pack: minimal
```
**변경 후:**
```yaml
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
```
> `context: fork`·`agent: architect`·`model: opus`·`effort: max` 4줄 삭제, `allowed-tools` 끝에 ` Agent` 추가. `disable-model-invocation`·`context-pack`은 유지(개선 ⑤ 대상 아님).

**본문 — 변경 전 (41행):**
```
   - 있으면 **갱신 모드** — 본 skill은 `context: fork`에서 실행되므로 사용자에게 실시간 확인을 받을 수 없다.
```
**변경 후:**
```
   - 있으면 **갱신 모드** — 본 skill은 메인 세션에서 실행된다. 기존 산출물 덮어쓰기는 사고 방지를 위해 명시적 승인(`--apply` 또는 사용자 확인)을 요구한다.
```

**본문 — 변경 전 (44행):**
```
3. 현재 architect agent가 산출물을 직접 생성/갱신한다 — 입력은 DISCOVERY.md 또는 자연어 입력 + 기존 산출물(있으면). 본 skill은 frontmatter `agent: architect` + `context: fork`로 이미 architect 컨텍스트에서 fork되어 실행되므로 별도 sub-call이 필요 없고 `Agent` 권한도 보유하지 않는다.
```
**변경 후:**
```
3. 메인 세션이 본 절차를 직접 운전한다(discover-product·bootstrap-design 패턴). 무거운 아키텍처 추론(charter 구조화·ARCHITECTURE 결정·ADR-100 초안)은 `Agent` 도구로 **architect 단발 sub-call**에 위임하고, 반환된 결론을 본 skill이 파일에 반영한다(architect agent의 `model: opus`가 추론 품질을 보장). 종료 후 사용자에게 `/clear` 또는 새 세션 권장.
```

### 1-B. `.claude/skills/bootstrap-stack/SKILL.md`

**frontmatter — 변경 전 (5~11행):**
```yaml
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit
context: fork
agent: architect
model: opus
effort: max
context-pack: minimal
```
**변경 후:**
```yaml
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
context-pack: minimal
```

**본문 — 변경 전 (94행, `## --recommend 모드` 안):**
```
2. (옵션) 최신 프레임워크/라이브러리 지형이 필요하면 *먼저* `/research-pack <스택 후보 주제>`를 돌려 insights 노트를 만들어 두고 본 모드가 이를 참조한다 — 지식 컷오프 보완. (bootstrap-stack은 fork+Agent 미보유라 본 skill에서 직접 researcher 위임은 불가.)
```
**변경 후:**
```
2. (옵션) 최신 프레임워크/라이브러리 지형이 필요하면 `Agent` 도구로 **researcher에 직접 위임**(메인 세션 실행이라 가능)하거나, 먼저 `/research-pack <스택 후보 주제>`로 insights 노트를 만들어 참조한다 — 지식 컷오프 보완.
```

> bootstrap-stack 본문 43~44행("API 스택 감지 시: architect 단발 sub-call로 7-1...")은 이미 sub-call을 가정하고 있었다 — 메인 세션 + `Agent`로 이제 모순 없이 동작한다(수정 불필요).

**커밋:**
```
refactor(skills): run bootstrap-project and bootstrap-stack in the main session via architect sub-call
```

---

## Phase 2 — stack-guard / validate-plan / repair-plan 메인 세션 전환 (frontmatter만)

**목표:** 이 3종은 frontmatter 2줄씩(`context: fork` + `agent:`) 제거가 핵심이다. 단 repair-plan만 본문 persona 문구 1줄을 함께 다듬는다(2-C). 동작은 동일하되 메인 세션에서 돈다.

### 2-A. `.claude/skills/stack-guard/SKILL.md` (7·8행 삭제)
```yaml
# 삭제:
context: fork
agent: builder
```
> 본문 141행 "첫 fork에서 결정"의 *fork*는 **보일러플레이트 fork(새 프로젝트 복제)**를 뜻한다 — `context: fork`가 아니므로 그대로 둔다.

### 2-B. `.claude/skills/validate-plan/SKILL.md` (7·8행 삭제)
```yaml
# 삭제:
context: fork
agent: reviewer
```
> validate-plan은 "다른 세션·다른 LLM에서 실행"이 설계다. 메인 세션 실행은 그 **다른 세션의 메인 컨텍스트**에서 돈다는 뜻일 뿐 — "다른 터미널" 전제와 충돌하지 않는다.

### 2-C. `.claude/skills/repair-plan/SKILL.md` (7·8행 삭제)
```yaml
# 삭제:
context: fork
agent: planner
```
> repair-plan은 **이미** 4-판정(Adopt / Adopt-modified / Reject-false-positive / Reject-conflict)으로 "리뷰어가 틀렸을 수 있음"을 비판적으로 다루고(수행 step 2), **리뷰 파일을 삭제**한다(수행 step 6, `allowed-tools`의 `Bash(rm docs/40-validation/plan-reviews/*.md)`). 따라서 개선 ②의 repair-plan 쪽은 **메인 세션 전환만으로 충분** — 메인 세션에서 `rm` 권한 프롬프트가 정상 응답되어 삭제가 안정적으로 동작한다.
>
> **본문 persona 문구 점검 (1줄 수정)**: repair-plan 본문 38행 `자동 합의 / 다수결 X — *planner agent 판단 책임*`을 `자동 합의 / 다수결 X — *본 skill(메인 세션) 판단 책임*`으로 다듬는다(de-fork 후 planner 서브에이전트로 돌지 않음). 그 외 cross-ref(예: validate-plan 47행 `reviewer.md의 Plan Quality 10 차원 정합`)는 *rubric SSOT 포인터*라 `.claude/agents/reviewer.md`가 존재하는 한 그대로 둔다. validate-workitem·stack-guard 본문에는 persona-주장 문구가 없어 수정 불필요(grep으로 확인 완료).

**커밋:**
```
refactor(skills): run stack-guard, validate-plan, and repair-plan in the main session
```

---

## Phase 3 — validate-workitem / repair-workitem: 메인 세션 + 모델 호출 허용 (frontmatter)

**목표:** 개선 ①(de-fork)과 ⑤(model-invocable)을 이 두 skill에 동시에 적용. (repair-workitem의 *동작* 변경은 Phase 5에서 별도 커밋.)

### 3-A. `.claude/skills/validate-workitem/SKILL.md`

**frontmatter — 변경 전 (5~9행):**
```yaml
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *) Bash(git diff *) Bash(git log *) Bash(git status *)
context: fork
agent: validator
context-pack: minimal
```
**변경 후 (3줄 삭제 — `disable-model-invocation`, `context: fork`, `agent: validator`):**
```yaml
allowed-tools: Read Glob Grep Write Bash(pnpm validate) Bash(pnpm validate *) Bash(npm run validate) Bash(npm run validate *) Bash(make validate) Bash(make validate *) Bash(task validate) Bash(task validate *) Bash(git diff *) Bash(git log *) Bash(git status *)
context-pack: minimal
```

**본문 — 변경 전 (124·125행, `## 다음 권장 액션` report 양식 안):**
```
- Pass: `/finalize-workitem <task-id>` (자동 호출 아님 — 사용자 또는 메인 세션이 발화한다)
- Needs Fix: `/repair-workitem <task-id>` (자동 호출 아님)
```
**변경 후:**
```
- Pass: `/finalize-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
- Needs Fix: `/repair-workitem <task-id>` (메인 세션이 이어서 직접 발화하거나 사용자가 발화 — ADR-050)
```

### 3-B. `.claude/skills/repair-workitem/SKILL.md` (frontmatter만 — 동작은 Phase 5)

**frontmatter — 변경 전 (5~9행):**
```yaml
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Bash
context: fork
agent: builder
context-pack: minimal
```
**변경 후 (3줄 삭제):**
```yaml
allowed-tools: Read Glob Grep Write Edit Bash
context-pack: minimal
```
> `Bash`(full)는 유지 — builder가 repair 중 테스트·빌드를 돌려야 하고, full Bash가 report `rm`까지 사전 승인한다(Phase 5에서 사용).

**커밋:**
```
feat(skills): run validate-workitem and repair-workitem in the main session and allow model invocation
```

---

## Phase 4 — implement-workitem / finalize-workitem: 모델 호출 허용 (fork 유지)

**목표:** 개선 ⑤만 적용. 이 둘은 **fork를 유지**(격리 이득)하면서 모델이 직접 호출할 수 있게 한다.

### 4-A. `.claude/skills/implement-workitem/SKILL.md`
- 5행 `disable-model-invocation: true` **한 줄만 삭제**. (`context: fork`, `agent: builder`, `context-pack: minimal`은 그대로.)

### 4-B. `.claude/skills/finalize-workitem/SKILL.md`
- 5행 `disable-model-invocation: true` **한 줄만 삭제**.
> 본문 44행 "본 skill은 `context: fork` 환경에서 실행되므로 사용자에게 실시간 확인을 받을 수 없다"는 finalize가 **fork를 유지**하므로 **여전히 참**이다 — 수정하지 않는다.

**커밋:**
```
feat(skills): let the model invoke implement-workitem and finalize-workitem
```

---

## Phase 5 — repair-workitem: 검증을 비판적으로 재점검 + report 삭제 (개선 ②)

**목표:** repair-workitem이 validate-workitem report의 실패 항목을 **기계적으로 다 수정**하는 대신, 각 항목이 진짜인지 **본인 판단으로 재점검**(repair-plan의 4-판정과 동형)하고, 처리한 뒤 **report 파일을 삭제**한다. 메인 세션 실행(Phase 3)이라 풀 컨텍스트로 판단할 수 있고 `rm`도 정상 동작한다.

> 설계 정합: 이 흐름은 repair-plan(ADR-038)과 **동형**이다(4-판정 구조 동일) — "리뷰어/validator가 틀릴 수 있다 → 실행자가 4-판정으로 결정 → 결정 이력 영속 → 소비한 파일 삭제". 단 4번째 판정은 repair-plan의 `Reject-conflict`(다중 리뷰어 충돌) 대신 **`Reject-context`**(validator는 단일 출처라 *task 범위·상위 제약 놓침*으로 대응)를 쓴다. 결정 이력 영속 위치는 task scope이므로 **task `## 8. 메모`**(ADR-047 D7 durable correction history가 이미 지정한 자리)다.
>
> report 삭제가 안전한 이유: 흐름이 `repair → validate 재실행 → finalize`라, 삭제된 report는 다음 `/validate-workitem`이 **새로** 생성한다. 따라서 stale한 Needs Fix report를 지우는 것은 오히려 **깨끗한 재검증을 강제**한다. **단, defer는 금지** — report를 삭제하면 미처리 항목이 영속 산출물에서 사라지므로, repair-plan과 동일하게 한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결한 뒤 삭제한다(작업량을 줄이려면 사용자가 인자 `T-001 "P0만"`으로 범위를 명시 지정). 이는 ADR-007 `## 결과`의 "P0/P1만 처리, P2 defer" 정책을 대체한다(그 defer는 report를 *영속*하던 시절 정책 — Phase 8-C에서 명문 갱신).

`.claude/skills/repair-workitem/SKILL.md`의 본문(frontmatter `---` 이후 ~ `## Context 정책` 이전)을 아래로 **교체**한다:

```markdown
이 skill은 직전 `/validate-workitem`이 남긴 report의 실패 항목을 **비판적으로 재점검**한 뒤, 진짜 결함만 수정한다. 메인 세션에서 실행되므로 풀 프로젝트 컨텍스트로 판단한다.
**새 기능 추가, 범위 밖 변경, 자동 커밋은 금지한다.**

입력:
- `$ARGUMENTS`에는 task ID와 (선택) 부분 지정 메모가 들어온다.
  - 예: `T-001`
  - 예: `T-001 "P0 #1, P1 #3만"` — report의 일부 항목만 대상

반드시 먼저 할 일:
1. 관련 task 문서를 읽는다 (`## 6 AC`, `## 8 메모`의 기존 `해석 확정`/repair 결정 이력 포함).
2. `docs/40-validation/reports/<task-id>.md`를 읽는다.
   - 파일이 없거나 stale(파일 mtime이 task 문서/구현 파일보다 오래됨)하면 `/validate-workitem` 선행을 안내하고 종료한다.
   - 파일이 `Pass`이면 `/finalize-workitem`을 안내하고 종료한다(repair 대상 없음).
3. 사용자가 인자로 부분 지정을 줬으면 그 부분만 대상으로 한다.
4. 실패 항목을 우선순위(P0 > P1 > P2)로 정렬한다.

비판적 재점검 (수정 *전* 1회 — validator가 틀리거나 맥락을 놓쳤을 수 있다):
각 실패 항목마다 *실제 코드·문서·task AC를 직접 확인*해 4가지 중 하나로 판정하고 한 줄 근거를 남긴다 (repair-plan과 동형):
- **Adopt** — 진짜 결함. report 제안대로 수정.
- **Adopt-modified** — 결함은 맞지만 더 나은 방식으로 수정 (다른 수정 + 사유).
- **Reject-false-positive** — validator가 잘못 봄 (예: 이미 충족됨 / 자연어 매핑 휴리스틱 오탐 / placeholder 오인). 수정하지 않는다.
- **Reject-context** — validator가 task 범위·상위 제약을 놓침 (예: task `## 4. 제외 항목`·charter 비목표상 의도된 동작). 수정하지 않는다.
> 자기 판단을 신뢰하되, 애매하면 Adopt 쪽으로 보수적으로. Reject는 *근거가 코드/문서로 확인될 때만*.

수행:
1. Adopt / Adopt-modified 항목을 우선순위(P0 > P1 > P2) 순으로 수정한다.
2. **한 라운드에 P0/P1/P2를 *모두* 4-판정으로 완결**한다(repair-plan과 동형). report를 삭제하므로 defer 금지 — 미처리 항목을 남기면 삭제 시 정보가 사라진다. 작업량을 줄이려면 사용자가 인자로 부분 범위를 지정한다(`T-001 "P0 #1, P1 #3만"`).
3. **결정 이력 영속화 (ADR-047 D7)** — 본 라운드의 P0/P1 항목 전부에 대해 task 문서 `## 8. 메모`에 한 줄씩 append(P2는 cap 보호로 미영속):
   `- repair-workitem <YYYY-MM-DD> <severity> <category>: <Adopt|Adopt-modified|Reject-FP|Reject-context> — <근거 ≤80자>`
   (P0/P1은 Adopt·Reject 모두 기록 — 다음 validate가 같은 항목을 다시 올릴 때 사람이 판단 이력을 본다. P2는 미영속 — 재출현해도 finalize의 AC 게이트를 막지 않아 무해.)
4. **report 삭제** — 대상 항목 *전부*(P0/P1/P2)를 수정 또는 Reject로 완결한 뒤(미처리 항목이 남아 있으면 삭제하지 않는다):
   - **삭제 전 echo 강제**: 메인 세션 출력에 삭제 대상 경로를 명시 (예: `삭제 예정: docs/40-validation/reports/T-001.md`) — 사용자가 눈으로 확인.
   - `rm docs/40-validation/reports/<task-id>.md` 1개를 정확히 삭제한다 (다른 task의 report는 건드리지 않는다).
   - 삭제 후, 다음 `/validate-workitem <task-id>`가 새 report를 생성한다는 안내를 출력에 포함.

책임 경계:
- 새 기능을 추가하지 않는다.
- task 범위 밖 파일을 수정하지 않는다.
- 자동 커밋하지 않는다 — 결과만 반환하고 커밋은 `/finalize-workitem` 또는 사용자가 별도로.
- 본 task-id의 report만 삭제. 다른 산출물(QA_FINDINGS / IMPROVEMENT_GUIDE / 다른 report)은 건드리지 않는다.

마지막 출력:
- 4-판정 카운트: Adopted M / Adopt-modified K / Reject-FP I / Reject-context J
- 수정 파일 목록 + 어떤 실패 항목을 어떻게 해소했는지
- Reject한 항목 + 근거 (있으면)
- `## 8. 메모` append 줄 수
- 삭제한 report 경로
- 미해결 항목 (있으면)
- 다음 권장 액션: `/validate-workitem <task-id>` 재실행 (새 report 생성 → Pass면 `/finalize-workitem`)

정책 근거: 비판적 재점검·전 severity 완결·report 삭제는 [ADR-050](../../../docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md) D3 / repair-plan(ADR-038) 대칭. 결정 이력 영속은 ADR-047 D7.
```

> `allowed-tools`는 Phase 3에서 정한 `Read Glob Grep Write Edit Bash` 그대로 — full `Bash`가 `rm`을 사전 승인하므로 추가 권한 변경 불필요. (더 좁히고 싶으면 `Bash(rm docs/40-validation/reports/*.md)`를 명시 추가할 수 있으나, builder가 테스트 실행에 full Bash를 쓰므로 권장하지 않는다.)

**커밋:**
```
feat(repair-workitem): critically re-check validator findings before fixing and delete the consumed report
```

---

## Phase 6 — plan-workitem: task를 "따라 하면 끝나는 단계별 구현 가이드"로 (개선 ④)

**목표:** plan-workitem이 만드는 task의 `## 3. 구현 항목`을, **기존 상태 → 변경 내용 → 확인 방법**이 명시된 번호 매긴 단계별 가이드로 작성하게 한다. 그 문서만 보고 따라가면 모든 개선이 끝날 만큼 구체적으로. (plan-workitem은 fork 유지 — planner fork가 대상 파일을 JIT로 읽어 정확한 before/after를 쓴다.)

### 6-A. `.claude/skills/plan-workitem/SKILL.md` — "반드시 수행할 일"에 단계 추가

3번 항목(범위/비범위) 뒤, **3-G로 신설**(또는 기존 번호 흐름에 맞춰 삽입):

```markdown
3-G. **`## 3. 구현 항목`을 *단계별 구현 가이드*로 작성 (ADR-026#amend-2)**:
   각 task의 `## 3`은 terse 목록이 아니라 *그 문서만 보고 따라 하면 구현이 끝나는* 번호 매긴 절차로 쓴다.
   - 작성 전, 그 task가 *건드릴 실제 파일*을 JIT로 읽는다(대상 파일에 한정 — ADR-019 minimal 정합). 추측이 아니라 *현재 코드/문서의 실제 상태*를 근거로 한다.
   - 각 단계 형식:
     `N. <파일경로[:라인/식별자]> — 현재: <지금 상태 한 줄> → 변경: <정확한 수정 내용(필요 시 before/after 코드·문자열)> → 확인: <어떤 테스트/명령/관찰로 검증>`
   - "X를 적절히 처리한다" 같은 모호 지시 금지 — *어디를, 무엇으로, 어떻게* 바꾸는지 명시.
   - AC(`## 6`)는 여전히 RGR 사이클의 측정 단위다. `## 3` 가이드는 그 AC를 충족시키는 *집행 절차*이고, 각 단계는 가능하면 `(AC-N)` 태그로 대응 AC를 가리킨다.
   - 단계가 5개 파일을 넘으면 기존 sizing self-check(아래)대로 분해 권장 텍스트를 함께 출력.
```

마지막 출력 단락(`마지막 출력:`)에 한 줄 추가:
```markdown
- 각 task의 `## 3. 구현 항목`이 *단계별 before/after 가이드*로 채워졌는지 self-check 결과 (모호 단계 N건 — 있으면 명시).
```

### 6-B. `docs/30-workitems/_templates/TASK_TEMPLATE.md` — `## 3` 주석 보강

**변경 전 (20행):**
```
## 3. 구현 항목
```
**변경 후:**
```
## 3. 구현 항목
<!-- plan-workitem이 *단계별 구현 가이드*로 채운다 (ADR-026#amend-2). 그 문서만 보고 따라 하면 구현이 끝날 만큼 구체적으로.
     각 단계 형식: `N. <파일경로[:라인/식별자]> — 현재: <상태> → 변경: <정확한 수정(필요 시 before/after)> → 확인: <검증 방법>` (가능하면 끝에 `(AC-N)` 태그).
     모호 지시("적절히 처리") 금지. 새 외부 의존이 필요하면 설치 단계도 명시 (ADR-040#amend-1) — 예: N. 의존성 설치 — `pnpm add <pkg>@<ver>` 실행 (용도: ...) (AC-N). -->
```

> 추적성 메모(ADR 정합): 이 변경의 정책 근거 ADR-026#amend-2는 Phase 9에서 작성한다.

**커밋:**
```
feat(plan-workitem): author tasks as step-by-step before/after implementation guides
```

---

## Phase 7 — 라이브러리 설치: plan에서 authoring + implement에서 실제 설치 (개선 ③)

**목표:** task가 새 라이브러리를 요구하면 (1) plan이 *설치 단계*를 `## 3`에 명시(필요 시 researcher로 최신 버전·사용법 확인)하고, (2) implement가 구현 중 *실제로 설치*한다.

### 7-A. `.claude/skills/plan-workitem/SKILL.md` — 의존성 설치 authoring

기존 "외부 라이브러리 docs-check line item (ADR-040)" 단락(186행 부근) **바로 뒤**에 신설:

```markdown
**의존성 설치 line item (ADR-040#amend-1)**: 분해된 task가 *새 외부 패키지*(charter `## 7. 제약 조건`에 없는 npm/pip/cargo/go 등)를 요구하면, 해당 task `## 3. 구현 항목`에 설치 단계를 명시적 line item으로 박는다:
- 형식 — 한 줄 line item으로, *설치 명령만* inline code로 감싼다(백틱 중첩 금지). 예: `- 의존성 설치 — pnpm add zod@^3 실행 (용도: 입력 스키마 검증) (AC-2)`. 패키지 매니저는 스택(ARCHITECTURE/STACK_SETUP_PLAN)에서 자연스러운 것 사용(pnpm/npm/pip/cargo/go get 등).
- **버전·사용법 불확실 시**: 모델 지식 컷오프 보완을 위해 `최신 버전·사용법 확인: /research-pack <pkg> 선행 권장 (또는 메인 세션이 researcher 위임)` 한 줄을 같은 task에 부기한다. 확인 후 정확한 버전으로 line item을 갱신한다. (plan-workitem은 fork라 직접 웹 접근 불가 — research-pack/researcher 경로를 *권장*만; ADR-040#5 패턴.)
- **wave/lockfile 정합**: 새 의존을 추가하는 task는 기존 step 11-(b) "lockfile race 경고"·`write_set`에 lock 파일(`pnpm-lock.yaml` 등)을 포함시켜 *단독 wave*로 표시한다(병렬 implement 시 lockfile 충돌 차단).
- 이 의존이 charter 제약 밖이면 기존 `architect 호출 권장 신호 #2`도 함께 발화(새 외부 의존 = 검토 대상).
```

### 7-B. `.claude/skills/implement-workitem/SKILL.md` — 설치 실행

"connected-MCP 사용 line item 처리 (ADR-048#d4)" 단락 **앞**에 신설(`외부 docs-check line item 처리` 뒤):

```markdown
의존성 설치 line item 처리 (ADR-040#amend-1):
- task `## 3. 구현 항목`에 plan이 박은 의존성 설치 line item(예: `pnpm add <pkg>@<ver>`)이 있으면, 그 패키지가 필요해지는 시점(보통 Green phase)에 **설치 명령을 먼저 실행**한다(`allowed-tools`의 `Bash` 활용 — 추가 권한 불필요). 설치는 기계적 작업이므로 *기본은 진행*이다.
- 설치 후 lock 파일 변경은 그대로 둔다 — `/finalize-workitem`이 lock 파일을 자동 화이트리스트로 add한다(ADR-007#amend-1).
- **보류는 *실제 실행 실패*일 때만**: 설치가 sandbox/네트워크/승인 차단으로 실제 실패하면 *날조·우회하지 않고* `Needs Install: <명령> — 메인 세션/사용자 실행 필요`를 출력하고, 그 의존이 필요 없는 다른 AC 구현은 계속한다.
- **research gate는 *설치*가 아니라 *API 사용*에만 적용**: 패키지를 깐 뒤에도 그 라이브러리의 *최신 사용법 확신*이 없으면(plan이 `/research-pack 선행 권장`을 부기한 경우 등) ADR-040 hardstop대로 **통합 코드 작성을 멈추고** `Needs Research: <pkg> — /research-pack <pkg> 실행 후 재개`를 출력한다. 즉 *설치 자체는 막지 않고*, 잘못된(stale) API로 코드를 쓰는 것만 막는다(builder는 웹 접근 없음 — 직접 조사 금지).
```

**커밋:**
```
feat(skills): plan dependency installs (with research) and run them during implementation
```

---

## Phase 8 — 문서·ADR 정합 ① : 메인 세션 + model-invocable 거버넌스 (필수)

**목표:** 개선 ①·⑤가 건드린 **명문 규약**(자동 호출 금지 / fork 전제)을 새 ADR-050으로 정리하고, 이를 참조하는 문서들을 동기 갱신한다. 이걸 빠뜨리면 `/validate-plan`·`/stabilize-milestone`이 drift로 잡는다. ADR-047 D3는 `.claude/skills/**` 수정 시 **Harness Mutation Contract 6필드**를 요구한다 → 새 ADR에 포함.

### 8-A. 새 파일 `docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md`

```markdown
# ADR-050 — 일부 lifecycle skill 메인 세션 실행 + 실행 inner-loop model-invocable

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] bootstrap/validate/repair류 skill이 `context: fork` 서브에이전트로 돌면, (1) 사용자 실시간 권한 응답이 불가해 리뷰·report 파일 `rm`이 막히고, (2) repair가 풀 프로젝트 컨텍스트로 "검증이 맞는지"를 판단하기 어렵다.
- [관측됨] task 실행 inner-loop(implement→validate→repair→finalize)를 메인 세션이 매번 슬래시 커맨드 재입력으로만 진행하게 하면, 메인이 흐름을 *직접 운전*할 수 없다.
- 기존 규약: ADR-007 `## 결정`("skill 간 흐름은 자동 호출이 아니라 텍스트 제안 → 사용자/메인이 발화"), ADR-047 D3 보존 invariant "skill auto-invocation 금지". 본 ADR은 이를 *실행 inner-loop 4종에 한해* 의도적으로 좁힌다.

## 결정

### D1. 일부 lifecycle skill을 메인 세션 실행으로 전환
다음 7종에서 `context: fork`(및 죽은 `agent:`)를 제거해 메인 세션 인라인 실행한다: bootstrap-project, bootstrap-stack, stack-guard, validate-plan, repair-plan, validate-workitem, repair-workitem.
- bootstrap-project/bootstrap-stack은 무거운 아키텍처 추론을 `Agent`로 architect sub-call 위임(discover-product·bootstrap-design 패턴). 나머지는 메인 세션이 직접 수행.
- `context-pack: minimal`은 유지(메인 세션 skill도 사용 — discover-product 선례).
- implement-workitem·finalize-workitem은 fork 유지(구현 컨텍스트 폭증·git 조작 격리 이득).

### D2. task 실행 inner-loop 4종 model-invocable
implement-workitem, validate-workitem, repair-workitem, finalize-workitem에서 `disable-model-invocation: true`를 제거해 **모델이 Skill 도구로 직접 호출**할 수 있게 한다.
- 효과: 메인 세션이 "다음 액션 추천"을 *제안*에 그치지 않고 직접 실행하는 단일-task inner-loop를 운전할 수 있다.
- **범위 한정**: 그 외 모든 skill은 `disable-model-invocation` 유지 — bootstrap-project/bootstrap-stack/stack-guard/discover-product/bootstrap-design/plan-workitem/stabilize-milestone + cross-session 리뷰 skill(validate-plan/repair-plan/validate-discovery/repair-discovery). 텍스트 제안 + 사용자/메인 명시 발화 규약을 그대로 둔다.

### D3. repair-workitem 비판적 재점검 + 전 severity 완결 + report 삭제
repair-workitem은 validator report를 기계적으로 수정하지 않고, repair-plan과 동형의 4-판정(Adopt / Adopt-modified / Reject-false-positive / Reject-context)으로 *검증의 정확성*을 먼저 점검한다. **report를 삭제하므로 defer 시 정보가 사라진다 → 한 라운드에 P0/P1/P2를 모두 4-판정으로 완결**한다(repair-plan과 동일). 이는 ADR-007 `## 결과`의 "repair 한 라운드는 P0/P1만 처리, P2 defer" 정책을 *대체*한다 — 그 defer는 report를 *영속*하던 시절 정책이고, report 삭제 도입으로 더는 성립하지 않는다(ADR-007#amend-4가 명문 갱신). 처리한 P0/P1 결정은 task `## 8. 메모`에 영속(ADR-047 D7, P2는 cap 보호로 미영속), 소비한 report는 삭제한다(다음 validate가 새로 생성).

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/{bootstrap-project,bootstrap-stack,stack-guard,validate-plan,repair-plan,validate-workitem,repair-workitem,implement-workitem,finalize-workitem}/SKILL.md` frontmatter·본문; ADR-007 `## 결정`·`## 결과` 자동 호출/repair 라운드 단락, WORKFLOW.md·DELEGATION_STRATEGY.md 자동 호출 단락.
2. **Failure mode** — fork 격리로 인한 권한 미응답(리뷰·report 파일 삭제 실패)·repair 맥락 부족; inner-loop를 메인이 직접 운전 불가 (관측됨).
3. **Predicted improvement** — repair 삭제 성공률 ↑, false-positive 수정 감소(4-판정 Reject 기록), 메인 세션 inner-loop 운전 가능.
4. **Preserved invariants** — validate report 양식·lifecycle 8단계 책임 경계·signal-first cap 유지. **단, ADR-047 D3 예시 invariant "skill auto-invocation 금지"는 본 ADR D2가 4개 실행 skill에 한해 의도적으로 좁힌다**(나머지 skill은 유지).
5. **Falsifying evaluation** — ADR-017 dogfood 재실행에서 model-invocation이 *원치 않는 자동 연쇄*(예: 사용자 확인 전 finalize 커밋)를 일으키면 D2 범위 재검토 또는 되돌림.
6. **Rollback path** — 본 ADR superseded + 해당 skill에 `context: fork`/`disable-model-invocation: true` 복원.

## 정책 강도 (ADR-022)
- D1·D3: enabling(약) — capability/품질 개선. D2: constraint 완화(약) — 자동 연쇄 남용 시 reviewer가 P1로 보고.

## 결과
- de-fork 7종 메인 세션 실행, inner-loop 4종 model-invocable, repair-workitem 판단형 + report 삭제.
- ADR-007 `## 결정` 자동 호출 규약은 *실행 inner-loop 한정*으로 좁혀짐(본 ADR이 amend 역할 — ADR-007#amend-4).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. ADR-045 정합 — 실제 파일 경로 1행 1개, 생략·comma-join 금지)
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/validate-plan/SKILL.md
- .claude/skills/repair-plan/SKILL.md
- .claude/skills/validate-workitem/SKILL.md
- .claude/skills/repair-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/skills/finalize-workitem/SKILL.md
- docs/00-meta/WORKFLOW.md                                       — 자동 호출 정책 + fork 분포 메모
- docs/00-meta/DELEGATION_STRATEGY.md                           — 스킬 자동 호출 단락 + 위임 트리거 표 정합 노트
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md   — `## 결정`·`## 결과` 자동 호출/repair 라운드 amend 포인터(#adr-007-amend-4)

## 참고
- ADR-007(lifecycle), ADR-038(repair-plan 4-판정 대칭), ADR-040(연구·의존성), ADR-046(signal-first), ADR-047(harness mutation), ADR-019(context-pack), ADR-014(evaluator-optimizer).
```

### 8-B. `docs/90-decisions/boilerplate/README.md` — 인덱스 갱신 (2곳)
인덱스 표 컬럼은 `| # | 제목 | Status | Amendments | 한 줄 요약 |`이다.
1. **ADR-050 행 추가** (ADR-049 줄 아래):
   ```
   | 050 | Main-session, model-invocable lifecycle skills | accepted | — | de-fork 7종 메인 세션 실행 + 실행 inner-loop 4종 model-invocable + repair-workitem 판단형/report 삭제 |
   ```
2. **ADR-007 행의 `Amendments` 컬럼에 `+#amend-4` 추가** — 현재 `(+#amend-1: ..., +#amend-2: ..., +#amend-3: ...)` 끝에 `, +#amend-4: 일부 lifecycle skill 메인 세션 + inner-loop model-invocable`을 넣는다. (README는 ADR별 amendment를 *Amendments* 컬럼으로 추적하므로 누락 시 stabilize/검증에서 drift로 잡힌다 — Phase 9에서 ADR-026/040도 동일.)

### 8-C. `docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md` — amend 포인터 추가
파일 끝(Amendment 3 뒤)에 추가:
```markdown
<a id="adr-007-amend-4"></a>
## Amendment 4 (2026-06-05) — 일부 lifecycle skill 메인 세션 실행 + 실행 inner-loop model-invocable
`## 결정`의 "skill 간 흐름은 자동 호출이 아니라 텍스트 제안" 규약은 **실행 inner-loop(implement/validate/repair/finalize-workitem)에 한해** [ADR-050](ADR-050-main-session-lifecycle-skills.md)이 좁힌다(이 4종은 model-invocable — 메인 세션이 직접 호출 가능). 그 외 skill은 본 규약 유지. 실행 컨텍스트(fork vs 메인 세션) 분포·근거도 ADR-050 SSOT.

또한 `## 결과`의 "repair 한 라운드는 P0/P1만 처리하고 P2 이하는 다음 라운드 추천" 정책은 **repair-workitem이 report를 삭제하게 되면서**(ADR-050 D3) 대체된다 — defer 시 삭제로 미처리 항목이 사라지므로 한 라운드에 P0/P1/P2를 모두 4-판정으로 완결한다(repair-plan 정합). 라운드 작업량 제한은 사용자의 부분 범위 인자(`T-001 "P0만"`)로 대신한다.
```

### 8-D. `docs/00-meta/WORKFLOW.md` — 자동 호출/ fork 문구 갱신

- **90행** 변경 후:
```
스킬 간 흐름은 기본적으로 **텍스트 제안 → 사용자/메인이 발화**한다. 단 task 실행 inner-loop(implement/validate/repair/finalize-workitem)는 model-invocable이라 메인 세션이 직접 호출할 수 있다 (ADR-050).
```
- **94행** — 끝 문장 `대부분 lifecycle skill 이 context: fork 라 sub-agent context 정합.`을 아래로 교체(앞부분 `...의 구체화.`는 유지):
```
... ADR-046#d1 "다음 액션 1개 (분기 시 ≤3)" 의 구체화. (lifecycle skill 의 실행 컨텍스트 — fork vs 메인 세션 — 분포는 ADR-050 참조.)
```
- **108행** 변경 후:
```
**자동 호출 정책 (ADR-050)**: bootstrap/plan/stabilize 및 cross-session 리뷰 skill은 텍스트 제안만 — 사용자/메인이 명시 발화. task 실행 inner-loop(implement/validate/repair/finalize-workitem)는 model-invocable이라 메인 세션이 제안을 직접 실행할 수 있다 (ADR-007 책임 경계 / ADR-046 signal-first / ADR-050).
```

### 8-E. `docs/00-meta/DELEGATION_STRATEGY.md` — 2곳 갱신

**(1) 113행 갱신** — 변경 후:
```
**스킬 자동 호출 (ADR-050)** — task 실행 inner-loop(implement/validate/repair/finalize-workitem)는 model-invocable이라 메인 세션이 "다음 액션 추천"을 직접 실행할 수 있다. 그 외 skill(bootstrap/plan/stabilize·cross-session 리뷰)은 텍스트 제안일 뿐이며 사용자/메인의 명시 발화로 진행한다.
```

**(2) 위임 트리거 표(26~40행) 직후에 정합 노트 1줄 추가** — de-fork 이후에도 표가 "skill=서브에이전트"로 오독되지 않도록:
```
> **실행 컨텍스트 노트 (ADR-050)**: 본 표의 agent 매핑은 *책임 경계 정의*다(ADR-007#amend-2). 일부 lifecycle skill(validate-workitem/repair-workitem 등)은 이제 메인 세션에서 실행되지만(ADR-050) **같은 책임 경계**를 따른다 — 메인 세션이 그 경계대로 직접 수행하거나, 같은 역할의 agent를 `Agent`로 직접 fork 위임할 수 있다. `.claude/agents/*.md` persona 파일은 그대로 존재한다.
```

**커밋:**
```
docs(adr): add ADR-050 for main-session, model-invocable lifecycle skills
```

---

## Phase 9 — 문서·ADR 정합 ② : plan 스키마(④) + 의존성(③) ADR amendment (필수)

**목표:** 개선 ③·④의 정책 근거를 canonical owner ADR에 amend로 박는다(ADR-026=plan 스키마, ADR-040=연구/의존성). Phase 6·7 본문이 이미 `ADR-026#amend-2`·`ADR-040#amend-1`을 인용하므로, 이 Phase가 그 참조를 실재화한다.

### 9-A. `docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md` 끝에 추가
```markdown
<a id="adr-026-amend-2"></a>
## Amendment 2 (2026-06-05) — task `## 3. 구현 항목`을 단계별 구현 가이드로
### 결정
plan-workitem은 각 task의 `## 3. 구현 항목`을 *그 문서만 보고 따라 하면 구현이 끝나는* 번호 매긴 절차로 작성한다. 단계 형식: `N. <파일[:라인]> — 현재: <상태> → 변경: <정확한 수정(필요 시 before/after)> → 확인: <검증>` (+ `(AC-N)` 태그). 작성 전 대상 파일을 JIT로 읽어 *실제 현재 상태*를 근거로 한다(ADR-019 minimal — 대상 파일 한정). AC(`## 6`)는 여전히 RGR 측정 단위이고 `## 3`은 그 집행 절차다.
### 근거
- [관측됨] terse line item만 있는 task는 implement 단계에서 재해석·왕복을 유발. before/after가 박힌 가이드는 builder의 해석 여지를 줄인다(ADR-006#amend-2 2-layer defense 강화).
### 강도 (ADR-022)
- enabling(약) — 모호 단계는 재분해 권장 텍스트만, 자동 차단 X.
### 적용 surface
- docs/30-workitems/_templates/TASK_TEMPLATE.md  — `## 3` 주석
- .claude/skills/plan-workitem/SKILL.md           — "반드시 수행할 일" 3-G + 마지막 출력 self-check
```

### 9-B. `docs/90-decisions/boilerplate/ADR-040-external-research-capability.md` 끝에 추가
```markdown
<a id="adr-040-amend-1"></a>
## Amendment 1 (2026-06-05) — 의존성 설치 authoring(plan) + 실행(implement)
### 결정
1. plan-workitem은 task가 *새 외부 패키지*를 요구하면 `## 3`에 설치 line item(`<pkg-manager> add <pkg>@<ver>` + 용도)을 박는다. 버전·사용법 불확실 시 `/research-pack <pkg>`(또는 researcher 위임) 선행을 권장 부기하고, 의존 추가 task의 `write_set`·lockfile race 경고에 lock 파일을 포함해 단독 wave로 표시한다.
2. implement-workitem은 그 line item의 설치 명령을 *먼저 실행*한다(기계적 — 기본은 진행). 설치가 sandbox/네트워크/승인 차단으로 *실제 실패*하면 `Needs Install`로 보류. 설치와 *별개로*, 라이브러리 *API 사용법* 확신이 없으면 `Needs Research`로 통합 코드 작성만 멈춘다(설치 자체는 막지 않음). 날조·우회 금지. lock 파일은 finalize 자동 화이트리스트(ADR-007#amend-1)가 add.
### 근거
- [관측됨] 의존성 설치가 어느 단계 책임인지 불명확해 사용자 수동 설치에 의존 → plan이 *결정*하고 implement가 *집행*하는 책임 분배로 정렬(ADR-027#amend-1 패턴).
### 강도 (ADR-022)
- enabling(약). 단 "API 사용법 불확실 → 통합 코드 작성 전 연구" hardstop은 constraint(약, ADR-040 정신 유지) — *설치 자체*는 막지 않는다.
### 적용 surface
- .claude/skills/plan-workitem/SKILL.md       — 의존성 설치 line item authoring
- .claude/skills/implement-workitem/SKILL.md  — 의존성 설치 line item 처리
- docs/30-workitems/_templates/TASK_TEMPLATE.md — `## 3` 주석(설치 단계 형식)
```

### 9-C. `docs/90-decisions/boilerplate/README.md` — ADR-026·040 Amendments 컬럼 갱신
- **ADR-026 행**: `Amendments` 컬럼 `(+#amend-1: planner self-check + architect 호출 신호)` 끝에 `, +#amend-2: task 단계별 구현 가이드`를 추가.
- **ADR-040 행**: `Amendments` 컬럼이 현재 `—` → `(+#amend-1: 의존성 설치 authoring/실행)`로 교체.

**커밋:**
```
docs(adr): record step-by-step task guides (ADR-026) and dependency installs (ADR-040)
```

---

## 최종 검증 체크리스트

작업 후 아래를 확인한다(메인 세션에서 직접):

- [ ] **frontmatter grep (라인 앵커 `^` 필수)** — `Grep "^context: fork" .claude/skills` → frontmatter 기준 결과에 implement/finalize/plan/validate-discovery/repair-discovery/review-doc만 남아야 함. (앵커 `^` 없이 치면 본문 백틱 문구 `context: fork`까지 잡혀 오탐.)
- [ ] **invocation grep** — `Grep "^disable-model-invocation" .claude/skills` → implement/validate/repair/finalize-workitem 4종에 **없어야** 함.
- [ ] **죽은 필드 (앵커 필수)** — `Grep "^agent:" .claude/skills` / `Grep "^model:" .claude/skills` / `Grep "^effort:" .claude/skills` → **de-fork 7종**(bootstrap-project/bootstrap-stack/stack-guard/validate-plan/repair-plan/validate-workitem/repair-workitem)에서 `agent:`가 사라졌는지. `^model:`/`^effort:`는 원래 bootstrap 2종에만 있었으므로 그 2종에서만 사라지면 됨. **`agent:` 유지가 정상인 곳**: implement/finalize/plan + 본 가이드 미대상 skill(review-doc/validate-discovery/repair-discovery 등). bootstrap 2종은 `Agent` 추가도 확인.
- [ ] **본문 잔재 (앵커 없이 — 본문 대상)** — `Grep "context: fork|fork되어|fork\+Agent|planner agent 판단" .claude/skills`로 메인 세션 전환 skill 본문에 fork·persona 전제 문구가 남지 않았는지(finalize 본문 44행 `context: fork` 문구는 *정상 — fork 유지*).
- [ ] **자동 호출 문구** — WORKFLOW 90/94/108·DELEGATION 113·ADR-007 amend-4가 ADR-050 범위 한정으로 갱신됐는지.
- [ ] **repair-workitem** — 본문에 4-판정 + `## 8` 영속 + report `rm` echo가 들어갔는지.
- [ ] **plan/implement** — `## 3` 단계 가이드 + 의존성 설치 line item authoring/실행이 들어갔는지. TASK_TEMPLATE `## 3` 주석 갱신.
- [ ] **ADR 실재화** — Phase 6/7 본문이 인용한 `ADR-026#amend-2`·`ADR-040#amend-1`·`ADR-050`이 실제로 존재하고 boilerplate/README 인덱스에 ADR-050이 등재됐는지.
- [ ] **Codex parity** — `.agents/skills/**`는 무수정이 정상(thin wrapper).
- [ ] (스택 확정 프로젝트면) `validate`가 있으면 1회 실행해 회귀 없는지.

---

## 부록 — 종속관계 한눈에

```
Phase 1 (bootstrap×2 de-fork)  ─┐
Phase 2 (stack-guard/validate-plan/repair-plan de-fork) ─┤  ← 서로 독립, 순서 무관
Phase 3 (validate/repair-workitem de-fork + invocable)  ─┘
Phase 4 (implement/finalize invocable)
Phase 5 (repair-workitem 동작)   ← Phase 3 이후(같은 파일 frontmatter 먼저)
Phase 6 (plan 상세 가이드 + TASK_TEMPLATE)
Phase 7 (plan/implement 의존성)  ← Phase 6과 같은 plan 파일, Phase 6 다음 권장
Phase 8 (ADR-050 + 문서 정합)    ← Phase 1~5 이후(최종 상태 반영)
Phase 9 (ADR-026/040 amend)      ← Phase 6~7 이후(최종 상태 반영)
```

**권장 실행 순서: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9.**
Phase 1~7은 skill 본체(사용자의 직접 요청), Phase 8~9는 저장소 자기-정합을 완성하는 필수 후속.
```
