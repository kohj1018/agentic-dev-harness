# IMPROVE-GUIDE — 2026-07 개선 라운드 실행 가이드

이 가이드는 2026-07 개선 라운드의 확정 결정 전체를 repo에 적용하는 단계별 행동 지침이다.
위에서 아래로 Stage 순서대로 실행한다. 각 Stage 는 자기완결이며 Stage 끝의 커밋 단위로 원자 적용한다.

## 실행 규칙 (모든 Stage 공통)

1. **실행 순서**: Stage 0A → 0B → 1A → 1B → 1C → 2 → 3 → 4 → 5. (0A/0B는 상호 독립이라 순서 교환 가능. 1A→1B→1C→2→3은 앞 Stage 산출물을 뒤 Stage가 인용하므로 반드시 직렬.)
2. **커밋**: 각 Stage 끝의 "커밋" 항목에 적힌 파일만 명시적으로 `git add` 한다 (`git add -A` / `git add .` 금지 — AGENTS.md 규율). 커밋 메시지는 각 Stage에 제공된 한 줄을 사용한다.
3. **"현재:" 인용**: 이 가이드의 before 인용은 2026-07-14 HEAD(48b0af7) 기준이다. 인용문이 파일과 1글자라도 다르면 그 주변 문맥(섹션 제목·키워드)으로 위치를 찾아 의도대로 적용하고, 의도 자체가 성립 불가능하면 멈추고 사용자에게 보고한다.
4. **ADR 거버넌스 (이번 라운드는 umbrella 방식 — ADR-051/052 선례)**: 신규 ADR은 **2개만**(ADR-056 경험 계약·voice / ADR-057 플래닝 v2·seam) 만들고, 나머지 정책은 전부 **기존 ADR의 Amendment**로 담는다. 신규 ADR 작성 Stage에서 `docs/90-decisions/boilerplate/README.md`의 "Boilerplate ADR" 표에 한 줄 추가하고, Amendment를 추가한 Stage에서는 해당 행 "Amendments" 컬럼에 `+#amend-N: <키워드>`를 덧붙인다.
5. **`.agents/skills/` wrapper**: 기존 wrapper는 15줄 thin pointer라 `.claude/skills/*/SKILL.md` 본문 수정 시 자동 반영된다 — 본문만 고치면 되고 wrapper는 건드리지 않는다(신설만 Stage 0A에서 수행).
6. **날짜**: Amendment 날짜는 실제 적용일을 쓴다(이 가이드는 `2026-07-14`로 표기 — 적용일이 다르면 교체).
7. 이 가이드 파일 자체는 어떤 산출물에서도 링크·인용하지 않는다(완료 후 사용자가 삭제).
8. **라운드는 통째로 적용한다**: Stage 간 예고 참조가 여럿 있다(1B의 ADR-056이 1C의 designer·R1 voice 훅과 Stage 2·3의 R5·`--refresh`를 예고 참조, Stage 3이 0B의 ADR-051#amend-2 앵커를 참조 등). 실행 순서를 지키면 전부 해소되지만, **라운드를 중간에 끊고 stabilize를 돌리면 [Ref-anchor]/[ADR-ref] preflight가 미존재 앵커를 P1로 보고**한다 — 전 Stage 적용 후 검증할 것.
9. **한 파일이 한 Stage 안에서 여러 커밋에 걸치면**(Stage 3의 plan-workitem·TASK_TEMPLATE) 편집을 한꺼번에 하지 말고 **커밋 순서대로 "그 커밋 대상 편집 → 커밋"을 반복**한다(파일 단위 add만 가능 — 부분 스테이징 불가).
10. **ADR-045 D6 거버넌스 노트**: ADR-007(amend 4개)·ADR-027(amend 4개)은 "다음 변경 시 통합 재발행 우선 검토" 대상이지만, 이번 라운드는 사용자 지시(신규 ADR 최소화)로 **amendment를 유지하고 재발행은 의도적으로 보류**한다(다음 변경 라운드의 재발행 후보로 기록). 대신 D5 트리거(amend 4+)에 따라 두 ADR에 `## 현재 유효 결정` 요약을 신설/갱신한다(ADR-027 갱신=Stage 1B, ADR-007 신설=Stage 2, ADR-007 요약의 lifecycle 줄 동기=Stage 3).

## 전체 그림 (무엇이 왜 바뀌나)

| Stage | ADR 거버넌스 | 내용 |
|---|---|---|
| 0A | ADR-010 Amendment 4 (+ADR-044/054 표기 amend) | cross-LLM 리뷰 skill 3종 Codex wrapper 승격 (validate-milestone Codex 미노출 해소) |
| 0B | ADR-051 Amendment 2 | validate-workitem 팬아웃 관측 기록(`## Orchestration`) + small-diff fallback OR-결함 보정 |
| 1A | ADR-040 Amendment 4 | researcher "디자인 레퍼런스 모드" — 실 사이트/오픈소스 토큰 패키지에서 코드 수준 추출 |
| 1B | **ADR-056 신설** (+ADR-027#5/042#1 amend) | ADR-056(경험 계약 umbrella) 작성 + 그중 Voice 파트 적용: DESIGN.md §10 규칙서 + 집행 |
| 1C | ADR-049 Amendment 2 | designer agent 신설 + bootstrap-design R0~R2 개편(grounding 위계·divergence 카드·구별성 비평·취향 오라클) |
| 2 | ADR-056 적용 (+ADR-007#5/027#6 amend) | 경험 계약 파트 적용: plan-milestone R5 프로토타입 라운드 + 커밋 경로 + plan-workitem hard-block + stabilize §3-V 스크린샷 게이트 |
| 3 | **ADR-057 신설** (+ADR-026#3/051#3 amend·ADR-007 표 갱신) | 플래닝 v2 umbrella: 마일스톤 생성 plan-milestone 통일(M1 포함) + M단위 배치 분해(2-tier + --refresh + Needs Plan Refresh) + feature-완료 체크포인트 + stabilize --feature + **cross-task seam 계약**(§7-2 invariant 표 + [Plan-seam] + validator seam 축) |
| 4 | ADR-000 Amendment 2 (+ADR-053#1 amend) | ADR 작성 트리거 표 + `[ADR-candidate]` 라벨·회수 경로 |
| 5 | — | 최종 cross-surface 정합 검증 |

---

# Stage 0A — cross-LLM 리뷰 skill Codex wrapper 통일 (ADR-010 Amendment 4)

목적: `validate-milestone`이 Codex `$` 자동완성에 안 뜨는 문제 해소. cross-LLM 리뷰 skill(다른 LLM에서 실행되는 것이 존재 이유)은 wrapper 필수로 정책을 바꾸고, `validate-discovery`/`validate-milestone`/`repair-discovery` 3종의 wrapper를 신설한다. wrapper 정책의 주인은 ADR-010이므로 **신규 ADR 없이 ADR-010 Amendment 4가 정책을 담는다**(ADR-054/044에는 superseded 표기 amendment만).

## 0A-1. ADR-010 Amendment 4 (정책 본문 — supersede 주체)

`docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md` 파일 끝(Amendment 3 뒤)에 추가:

```markdown
<a id="adr-010-amend-4"></a>
## Amendment 4 (2026-07-14) — cross-LLM 리뷰 skill은 wrapper 필수 (분류 축 추가)

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
- Target: wrapper 6파일 신설 / README 2종 목록 / ADR-044·054 표기 / stabilize preflight 7 / validate-milestone SKILL Codex 단락 / 자연어 5종 본문 1줄.
- Failure mode: cross-LLM 리뷰 skill이 Codex에서 발견 불가(관측됨).
- Predicted improvement: Codex `$` 표면에 가족 6종 전부 노출, 번역 규칙 모순 소멸.
- Preserved invariants: D3/D4(wrapper=thin pointer), #amend-3(자연어 목록 SSOT=README), 각 skill의 read-only/opt-in 계약.
- Falsifying evaluation: 승격 후에도 Codex 실사용 실패 재현 시 wrapper 형식 재검토.
- Rollback: wrapper 3종 삭제 + README 원복 + ADR-044/054 원 결정 복원.

### 강도 (ADR-022)
- constraint(강, [관측됨]) — wrapper·README 동일 커밋 + preflight 체크. 나머지 enabling.
```

**추가 in-place 정정 (같은 파일 — 보안 과잉 보장 문구 보수)**: ADR-010 `## 현재 유효 결정`의 `.codex/config.toml = 안전 baseline(secrets 차단 포함) + Codex 모델 ID 추적 (D5·D8).` bullet을 → `.codex/config.toml = 안전 baseline + Codex 모델 ID 추적 (D5·D8). **secrets 차단은 Windows unelevated sandbox에선 OS-강제 불가 — AGENTS 정책 의존(config.toml 상단 주석이 실측 SSOT)**.`로 정정한다. 근거: [관측됨] `.codex/config.toml` 주석("Native Windows unelevated sandbox cannot enforce split read/write carveouts... Secret files remain protected by AGENTS.md policy")과 ADR 요약이 불일치 — 문서가 실제보다 강하게 보장하고 있었다. (config.toml 자체의 보안 재설계는 본 라운드 비범위 — `codex doctor` 실측이 필요한 별도 작업으로 이월.)

## 0A-2. wrapper 6파일 신설

`.agents/skills/validate-plan/SKILL.md`(15줄 stub)와 `agents/openai.yaml`(2줄)을 패턴으로 3종을 만든다.

**(1) `.agents/skills/validate-milestone/SKILL.md`** (새 파일):

```markdown
---
name: validate-milestone
description: Use ONLY when the user explicitly types `$validate-milestone <milestone-id>`. Do not trigger implicitly from generic phrasing.
---

Source of truth: `.claude/skills/validate-milestone/SKILL.md` (skill 신설 근거: ADR-054; wrapper 승격: ADR-010#amend-4). Read it and follow the workflow.

Treat all frontmatter keys other than `name` and `description` (e.g., `agent:`, `disable-model-invocation:`, `allowed-tools:`, `context:`, `argument-hint:`, `model:`, `effort:`) as Claude-only and ignore them — execute locally in Codex.

**Slash command translation**: 본문 안의 `/validate-milestone` 표기는 Claude 슬래시 커맨드다. Codex에서는 `$validate-milestone`으로 읽고 사용자에게 안내한다. 본문에 등장하는 `/repair-milestone`은 `$repair-milestone`, `/stabilize-milestone`은 `$stabilize-milestone`으로 안내. Codex CLI는 `/`를 빌트인 슬래시 커맨드에 쓰므로 명시적 치환이 필요.

Preserve all repo policies from `AGENTS.md` and `docs/`.

If the source path no longer exists, this wrapper is stale — see ADR-010.
```

**(2) `.agents/skills/validate-milestone/agents/openai.yaml`** (새 파일):

```yaml
policy:
  allow_implicit_invocation: false
```

**(3) `.agents/skills/validate-discovery/SKILL.md`** (새 파일): (1)과 동일 구조로 작성하되 — `name: validate-discovery`, description의 명령을 `$validate-discovery`로, Source of truth를 `.claude/skills/validate-discovery/SKILL.md` (skill 신설 근거: ADR-044; wrapper 승격: ADR-010#amend-4)로, 번역 단락을 `/validate-discovery`→`$validate-discovery`, `/repair-discovery`→`$repair-discovery`, `/discover-product`는 자연어 호출("Follow .claude/skills/discover-product/SKILL.md")로 안내.

**(4) `.agents/skills/validate-discovery/agents/openai.yaml`**: (2)와 동일 2줄.

**(5) `.agents/skills/repair-discovery/SKILL.md`** (새 파일): 동일 구조 — `name: repair-discovery`, Source of truth `.claude/skills/repair-discovery/SKILL.md` (ADR-044; wrapper 승격: ADR-010#amend-4), 번역 단락 `/repair-discovery`→`$repair-discovery`, `/validate-discovery`→`$validate-discovery`.

**(6) `.agents/skills/repair-discovery/agents/openai.yaml`**: (2)와 동일 2줄.

## 0A-3. README.md / README_ko.md 목록 이동

**README.md 항목 2** —
현재(발췌): `... $stabilize-milestone, $repair-milestone, $stack-guard. Remaining skills (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack, validate-discovery, repair-discovery, validate-milestone) are invoked via natural language.`
변경: wrapper 나열 끝에 `, $validate-discovery, $repair-discovery, $validate-milestone`를 추가하고, Remaining 목록을 `(discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack)`으로 축소.

**README.md 항목 3** — `Plan cross-review` 줄 아래에 한 줄 추가:
```
   - Discovery / stabilize cross-review (opt-in, ADR-044/ADR-054): `$validate-discovery` + `$repair-discovery`, `$validate-milestone M1` (in fresh Codex session) + `$repair-milestone M1` (in origin session)
```

**README.md 항목 4** —
현재: `` For remaining skills (`discover-product`, `review-doc`, `boilerplate-context`, `bootstrap-design`, `research-pack`, `validate-discovery`, `repair-discovery`, `validate-milestone`), invoke in natural language ``
변경: 목록을 `` (`discover-product`, `review-doc`, `boilerplate-context`, `bootstrap-design`, `research-pack`) ``로 축소.

**README_ko.md** — 같은 세 위치(항목 2·3·4)를 한국어 문면으로 동일하게 반영.

## 0A-4. ADR-054 / ADR-044 superseded 표기 amendment

**`docs/90-decisions/boilerplate/ADR-054-cross-llm-stabilize-review.md`** 파일 끝에 추가:

```markdown
<a id="adr-054-amend-1"></a>
## Amendment 1 (2026-07-14) — 결정 5 부분 supersede (ADR-010#amend-4)
결정 5(Codex wrapper 미생성 — 자연어 호출)는 [ADR-010 Amendment 4](ADR-010-multi-agent-compatibility.md#adr-010-amend-4)가 supersede한다 — `.agents/skills/validate-milestone/` wrapper가 신설되어 Codex에서 `$validate-milestone`으로 호출한다. 근거: [관측됨] 자연어 호출의 Codex discoverability 0으로 실전 실패. read-only·single-origin·opt-in 등 나머지 결정은 불변.
```

**`docs/90-decisions/boilerplate/ADR-044-cross-llm-discovery-validation.md`** 파일 끝에 추가:

```markdown
<a id="adr-044-amend-1"></a>
## Amendment 1 (2026-07-14) — Codex 호환 단락 supersede (ADR-010#amend-4)
`## 결과`의 "Codex 호환 (의도적 비대칭)" 단락은 [ADR-010 Amendment 4](ADR-010-multi-agent-compatibility.md#adr-010-amend-4)가 supersede한다 — `validate-discovery`·`repair-discovery` wrapper가 신설되어 `$validate-discovery`/`$repair-discovery`로 호출한다. opt-in 성격·나머지 결정은 불변.
```

## 0A-5. validate-milestone SKILL Codex 단락 교체

`.claude/skills/validate-milestone/SKILL.md` —
현재(:28): `**Codex**: 본 skill은 ADR-054 D5(ADR-044 선례)대로 Codex wrapper 미생성 — Codex에선 `$`-skill 호출이 아니라 *자연어*로 호출한다(`Follow .claude/skills/validate-milestone/SKILL.md` — README 자연어 목록).`
변경: `**Codex**: `$validate-milestone <M> --reviewer-tag <tag>`로 호출한다(wrapper 보유 — ADR-010#amend-4; 구 ADR-054 D5 자연어 정책은 superseded).`

## 0A-6. 잔여 자연어 5종 — 본문 Codex 안내 일관화

wrapper 미승격 5종(`discover-product`, `review-doc`, `boilerplate-context`, `research-pack`, `bootstrap-design`)은 본문에 Codex 언급이 0회라 Codex-only 사용자가 첫 단계부터 발견 실패할 수 있다. 각 skill의 `.claude/skills/<name>/SKILL.md` 본문(도입부 또는 "## 트리거" 부근)에 아래 1줄을 동일하게 추가한다:

`**Codex**: 본 skill은 wrapper 미보유(자연어 호출) — Codex에서는 "Follow \`.claude/skills/<name>/SKILL.md\""로 호출한다(목록 SSOT = README, ADR-010#amend-3·#amend-4).`

## 0A-7. stabilize preflight 7 bullet 추가

`.claude/skills/stabilize-milestone/SKILL.md` §1.0 항목 7 — 세 번째 bullet("cross-LLM 리뷰 skill 등재") 뒤에 bullet 추가:

```markdown
   - **cross-LLM 리뷰 skill wrapper 존재 (ADR-010#amend-4, deterministic)**: `validate-plan`·`validate-discovery`·`validate-milestone`과 각 repair 짝(`repair-plan`·`repair-discovery`·`repair-milestone`)에 `.agents/skills/<name>/SKILL.md`가 존재하는가. 부재 시 `P1 [Roster-drift] <skill> — Codex wrapper 부재 (ADR-010#amend-4)`.
```

## 0A-8. ADR 인덱스 갱신

`docs/90-decisions/boilerplate/README.md` 표 — ADR-010 행 Amendments 컬럼에 `+#amend-4: cross-LLM wrapper 필수 축`, ADR-044 행에 `+#amend-1: Codex 단락 supersede`, ADR-054 행에 `+#amend-1: 결정5 supersede` 추가. (신규 ADR 행 없음.)

## 0A-커밋

대상 파일: `.agents/skills/validate-milestone/**`, `.agents/skills/validate-discovery/**`, `.agents/skills/repair-discovery/**`, `README.md`, `README_ko.md`, `.claude/skills/validate-milestone/SKILL.md`, `.claude/skills/stabilize-milestone/SKILL.md`, `.claude/skills/{discover-product,review-doc,boilerplate-context,research-pack,bootstrap-design}/SKILL.md`(0A-6 1줄), `docs/90-decisions/boilerplate/ADR-010-*.md`, `ADR-054-*.md`, `ADR-044-*.md`, `docs/90-decisions/boilerplate/README.md`

```
feat(codex): add wrappers for cross-LLM review skills and unify invocation (ADR-010 amend 4)
```

---

# Stage 0B — validate-workitem 팬아웃 관측 + fallback 보정 (ADR-051 Amendment 2)

목적: "병렬 검증이 도는지 체감으로 알 수 없다" 문제 — report에 orchestration 기록을 의무화하고, 2파일이면 대형 diff도 inline으로 새는 OR-조항을 보정한다.

## 0B-1. `.claude/skills/validate-workitem/SKILL.md` 수정 3곳

**(1) small-diff fallback 기준 보정** —
현재(0단계 내): `**small-diff fallback 기준** (cost guard): `git diff --stat`의 변경 파일 ≤ 2 *또는* 변경 줄 합계 ≤ 50, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음이면 팬아웃을 건너뛰고 단일 inline validator로 수행한다(휴리스틱 — 경계값은 메인 세션 판단).`
변경:

```markdown
     - **small-diff fallback 기준** (cost guard): `git diff --stat`의 변경 줄 합계 ≤ 50, *또는* (변경 파일 ≤ 2 *이고* 변경 줄 합계 ≤ 200), *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음이면 팬아웃을 건너뛰고 단일 inline validator로 수행한다(휴리스틱 — 경계값은 메인 세션 판단. "2파일이면 줄 수 무관 inline"이던 구 기준은 구현+테스트 2파일의 대형 TDD diff를 놓쳐 보정됨 — ADR-051#amend-2). 어느 경로를 탔든 report `## Orchestration` 기록은 의무다.
```

**(2) report 양식에 `## Orchestration` 섹션 신설** — report 템플릿의 `- 판정: Pass | Needs Fix` 줄과 `## 통합 명령 실행 결과` 사이에 삽입:

```markdown
## Orchestration (ADR-051#amend-2)
<!-- 5줄 이내. 팬아웃/inline 여부를 산출물로 검증 가능하게 하는 관측 섹션 -->
- 모드: fan-out N축 | inline fallback | Codex 순차 degrade
- spawn된 축: <번호·이름 목록 (예: 1 AC↔테스트, 2 diff-trace, 7 Evidence)>
- skip된 축: <축 — 사유 (신호 없음 / 해당없음)>
- fallback 사유 (해당 시): 파일 N개 · 변경 줄 M줄 (git diff --stat 기준)
```

**(3) 마지막 출력에 1줄 추가** —
현재(마지막 출력 목록): `- Pass / Needs Fix` ... `- 다음 추천 단계 (텍스트 제안임을 명시)`
변경: 목록에 `- orchestration 모드 1줄 (예: "fan-out 4축" / "inline fallback — 1파일 12줄")` 항목 추가.

## 0B-2. ADR-051 Amendment 2

`docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md` 파일 끝(Amendment 1 뒤)에 추가:

```markdown
<a id="adr-051-amend-2"></a>
## Amendment 2 (2026-07-14) — validate 팬아웃 관측 기록 + fallback 게이트 보정
### 결정
1. validate-workitem report 양식에 `## Orchestration` 섹션(모드/spawn 축/skip 사유/fallback 트리거 값, ≤5줄)을 의무 추가한다. 본 ADR Mutation Contract #4가 "validate report 양식"을 보존 invariant로 박았으므로 본 amendment가 그 invariant를 좁혀 완화한다(양식 *확장*만 허용).
2. small-diff fallback을 "줄 ≤50, 또는 (파일 ≤2 이고 줄 ≤200)"으로 보정 — 구 OR 기준은 구현+테스트 2파일의 대형 diff를 inline으로 보냈다.
### 근거
- [관측됨] 사용자가 팬아웃/inline 여부를 산출물로 확인할 수단이 없어 "병렬이 아닌 것 같다"는 체감이 반증 불가능했다. 팬아웃 강제 강화는 하지 않는다(소형 task 비용 증가 — cost guard 정신 유지).
### 강도 (ADR-022)
- enabling(약) — 관측 기록 추가 + 경계값 보정. 경계값(200줄)은 실측 전 추정치로 명시.
### 적용 surface
- .claude/skills/validate-workitem/SKILL.md
```

## 0B-3. ADR 인덱스 갱신

`docs/90-decisions/boilerplate/README.md` ADR-051 행 Amendments 컬럼에 `+#amend-2: validate orchestration 관측 + fallback 보정` 추가.

## 0B-커밋

대상 파일: `.claude/skills/validate-workitem/SKILL.md`, `docs/90-decisions/boilerplate/ADR-051-*.md`, `docs/90-decisions/boilerplate/README.md`

```
feat(validate): record orchestration mode in report and fix small-diff fallback gate (ADR-051 amend 2)
```

---

# Stage 1A — researcher 디자인 레퍼런스 모드 (ADR-040 Amendment 4)

목적: 디자인 레퍼런스 리서치가 generic해지는 근본 원인(웹 grounding 경로 부재 + 텍스트 요약 한정)을 해소 — researcher가 실 사이트/오픈소스 디자인 토큰 패키지에서 hex·font·spacing을 **코드 증거**로 추출한다. (2026-07-14 직접 테스트로 검증됨: raw .css URL fetch·오픈소스 토큰 패키지(Primer/Polaris)는 완벽 동작, 일반 HTML 페이지는 markdown 변환으로 stylesheet URL 소실, getdesign.md류는 콘텐츠 게이트라 정성 참고만 가능.)

## 1A-1. ADR-040 Amendment 4

`docs/90-decisions/boilerplate/ADR-040-external-research-capability.md` 파일 끝(Amendment 3 뒤)에 추가:

```markdown
<a id="adr-040-amend-4"></a>
## Amendment 4 (2026-07-14) — researcher 디자인 레퍼런스 모드 (코드 수준 토큰 추출)
### 결정
1. researcher에 **디자인 레퍼런스 모드**를 추가한다(전용 agent 신설 X — 모드로 처리). 호출 측(`/bootstrap-design` R0 등)이 모드를 명시하면, 레퍼런스의 시각 시스템을 *코드 증거*(CSS custom property·font-family stack·hex·spacing/radius/shadow 수치)로 추출해 DESIGN_RESEARCH.md 양식으로 반환한다.
2. **소스 위계**: ① 사용자 제공 URL(raw CSS 파일이면 직접 fetch·추출) → ② 오픈소스 디자인 토큰 패키지(WebSearch로 발견 — GitHub Primer/Shopify Polaris/IBM Carbon/Adobe Spectrum/Atlassian 등 → unpkg/GitHub raw에서 CSS/JSON fetch) → ③ 정성 소스(디자인 시스템 요약 사이트 — 방향 어휘 보조로만, 값 추출 소스 아님).
3. **한계 정직 보고**: 일반 HTML 페이지는 fetch 시 markdown 변환으로 stylesheet URL·CSS가 소실된다([관측됨] 2026-07-14 실측). stylesheet URL을 발견할 수 없으면 "추출 불가 — <사유>"를 반환하고 날조하지 않는다. CSS-in-JS/Tailwind JIT 사이트는 수율 낮음을 명시.
4. **값 복제 금지 규율**: 추출 토큰은 *구조 학습용*(스케일 짜임새·시맨틱 네이밍·대비 수치) — 특정 서비스 값의 통째 복제는 클론화라 금지. what-to-borrow/avoid 판단(bootstrap-design R0)이 계속 관문.
### 근거
- [관측됨] bootstrap-design R0의 무거운 분해가 웹 도구 없는 architect에 위임돼 있어 실 웹 grounding 경로가 0 → "모델 지식 기반" fallback으로 median 회귀(ADR-049#amend-1 근거가 자인한 슬롭 근본원인 — 줄번호 참조 금지, ADR-045 D1). 텍스트 4축 요약은 코드 증거가 없어 R2 concept 생성 입력이 빈약.
- [외부실증] 오픈소스 디자인 토큰 패키지는 대형 실서비스의 진짜 값 + 시맨틱 이름 + 주석을 오픈 라이선스로 제공(2026-07-14 Primer·Polaris fetch 실측).
### 강도 (ADR-022)
- enabling(약) — report-only 불변, 모드 추가.
### 적용 surface
- .claude/agents/researcher.md
- .claude/skills/bootstrap-design/SKILL.md (R0 위계 배선은 ADR-049#amend-2 — Stage 1C)
- docs/00-meta/DELEGATION_STRATEGY.md (researcher row 1줄)
```

## 1A-2. `.claude/agents/researcher.md` — 모드 섹션 추가

"출력:" 목록 앞(규칙 목록 끝)에 새 섹션 삽입:

```markdown
## 디자인 레퍼런스 모드 (ADR-040#amend-4)
호출 측이 "디자인 레퍼런스 모드"를 명시하면(주로 /bootstrap-design R0):
- 목적: 레퍼런스의 시각 시스템을 **코드 증거**로 추출한다 — 텍스트 인상 요약("미니멀하고 모던함")이 아니라 실제 값.
- 소스 위계: ① 사용자 제공 URL(raw CSS 파일이면 WebFetch로 직접 추출) → ② 오픈소스 디자인 토큰 패키지(WebSearch로 발견 → unpkg/GitHub raw에서 fetch — 예: GitHub Primer, Shopify Polaris, IBM Carbon, Adobe Spectrum, Atlassian) → ③ 정성 소스(디자인 요약 사이트 — 방향 어휘 보조로만).
- 추출 대상: `:root` CSS custom property / font-family stack / hex·rgba 색 상위 N개 / spacing·radius·shadow 수치. minified 전문 반환 금지 — 증류만.
- 한계 정직 보고: 일반 HTML 페이지는 markdown 변환으로 stylesheet URL·CSS가 소실됨 — 발견 불가면 "추출 불가 — <사유>"를 반환하고 날조하지 않는다. CSS-in-JS/Tailwind JIT는 수율 낮음 명시.
- 값 복제 금지: 반환에 "추출 토큰은 구조 학습용 — 통째 복제는 특정 서비스 클론화" 1줄 포함.
- 반환 양식: DESIGN_RESEARCH.md 레퍼런스 섹션(color signature/typography/density/motion) + `### 추출 토큰 (코드)` fenced block(hex/font/spacing/radius/shadow 실값).
```

## 1A-3. `docs/00-meta/DELEGATION_STRATEGY.md` — researcher row 보강

위임 트리거 표의 researcher 행(외부 공식문서·1차 자료 조사) 비고 끝에 한 문장 추가:
`**디자인 레퍼런스 모드 (ADR-040#amend-4)**: /bootstrap-design R0가 레퍼런스별 코드 수준 토큰 추출(소스 위계 ①사용자 URL ②오픈소스 토큰 패키지 ③정성 소스)을 본 모드로 위임한다.`

## 1A-4. ADR 인덱스 갱신

ADR-040 행 Amendments 컬럼에 `+#amend-4: researcher 디자인 레퍼런스 모드` 추가.

## 1A-커밋

대상 파일: `docs/90-decisions/boilerplate/ADR-040-*.md`, `.claude/agents/researcher.md`, `docs/00-meta/DELEGATION_STRATEGY.md`, `docs/90-decisions/boilerplate/README.md`

```
feat(researcher): add design-reference mode with code-level token extraction (ADR-040 amend 4)
```

---

# Stage 1B — ADR-056 작성 + Voice & Writing 규칙서 적용

목적: **신규 umbrella ADR-056(마일스톤 경험 계약)을 이 Stage에서 작성**한다 — 경험 계약의 세 축이 "화면이 어떻게 보이고(레이아웃·상태), 눌렀을 때 뭐가 일어나고(인터랙션), **무슨 말이 쓰여 있는지(voice)**"이므로 voice 규칙서는 별도 ADR이 아니라 ADR-056의 결정 8~11로 담는다. 이 Stage는 그중 **Voice 파트(결정 8~11)만 적용**하고, 프로토타입·게이트 파트(결정 1~7)는 Stage 2가 적용한다. (죽은 필드였던 FEATURE §8-1 copy 톤(downstream 소비자 0)은 "§10 delta"로 재정의해 회생.)

> 참고: ADR-056 본문(결정 2·Surfaces)은 designer agent를 참조하는데, designer.md는 바로 다음 Stage 1C에서 신설된다 — 같은 라운드 내 예고 참조라 정상(1C 완료 전에는 R5를 실행하지 않으므로 기능적 dangling 없음).

## 1B-1. 신규 ADR 작성 — `docs/90-decisions/boilerplate/ADR-056-milestone-experience-contract.md`

전체 내용 (새 파일 — 결정 1~7은 Stage 2에서, 결정 8~11은 본 Stage에서 적용):

```markdown
# ADR-056 — 마일스톤 경험 계약 (프로토타입 라운드 + 입구 계약 + 스크린샷 게이트 + Voice 규칙서)

> scope: boilerplate
> area: design/process

## Status
accepted

## 배경
- [관측됨] 모든 게이트의 채점 기준이 문서(AC/FAC)로 닫혀 있다 — validate-workitem의 판정 축 전부가 task/feature 문서 대비이고, 사용자가 눈으로 승인한 artifact가 오라클로 쓰이는 지점이 0곳이다. 잘못된 스펙일수록 테스트가 붙어 더 단단히 굳는다. 유일한 승인 artifact(R2 concept/R6 preview)는 승인 즉시 삭제 + .gitignore(ADR-049 #d31).
- [관측됨] 사용자의 첫 시각 확인 시점이 구현 완료 후라 마일스톤 종료 후 요구사항 미반영·불만족이 잦다(사용자 fork 보고).
- [관측됨] reviewer[design]은 grep 기반 토큰 대조만 가능했다 — 렌더 증거(스크린샷) 생산·주입 파이프라인 부재. 단 Playwright는 stack-guard가 UI 프로젝트에 선설치(ADR-052 D1)하고 Read 도구는 이미지를 읽을 수 있어 MCP 없이도 기술적으로 가능하다.
- [관측됨] voice/UX writing 규칙서가 repo 어디에도 없다 — 카피 관련 항목은 FEATURE §8-1 "copy 톤" 필드뿐이고 그마저 downstream 소비자 0인 죽은 필드. 전역 규칙 없이 feature 필드만 있어 feature마다 톤이 즉흥 재결정된다(ADR-027이 시각에 진단한 "명시 결정 자리 부재 → 매번 즉흥 결정"과 동형). placeholder 카피 금지 규칙도 0건.

## 결정 — A. 경험 계약 (1~7, Stage 적용: 프로토타입·게이트)
1. **승인 프로토타입 산출물 (경험 계약 SSOT)** — UI 확정(ADR-027#amend-3) 마일스톤은 **화면 단위** 자기완결 HTML 프로토타입을 `docs/20-system/prototypes/M<N>/<screen>.html`에 둔다(**커밋 대상**, lifecycle: Record — 재승인 시 같은 파일 *대체*, presence: conditional). **화면-키(screen-keyed)인 이유**: [관측됨] 실사용에서 한 화면은 여러 feature 표면의 합성이고 그 합성층을 아무도 설계하지 않아 품질이 무너졌다 — feature별 파일은 한 화면을 3~4개 프로토타입으로 쪼개 합성층 고아 문제를 재생산한다(단일 화면 feature는 화면명=feature 슬러그로 자연 수렴). feature 문서 `## 7`의 `프로토타입:` 참조 줄이 그 feature가 등장하는 화면 파일(들)을 나열한다(feature↔화면 매핑은 이 참조 줄들로 유도). 경험 계약 범위 — *확정*: 레이아웃 / 인터랙션 결과(정적 HTML이므로 캡션·상태 클래스로 표기) / 실제 카피(§10) / 상태(happy + **못생긴 상태 의무 5종**: 긴 제목·빈 목록·로딩·에러·항목 과다). *열어둠*: 엔지니어링 내부(상태관리·fetch·컴포넌트 구조 — ARCH §7-4 영역). SSOT 삼각: DESIGN.md=전역 시각 토큰 / FEATURE §3·§7=시나리오·측정 / prototypes=화면 경험. 충돌 시 우선순위: DESIGN.md 토큰 > 프로토타입 > FAC 텍스트(화면·카피·상태의 구체 해석 한정 프로토타입 우선). 탐색 시안은 `docs/20-system/prototypes/M<N>/_drafts/`(gitignore — 버리는 것)와 경로로 구분.
2. **plan-milestone R5 프로토타입 라운드** — R4 뒤 신설(UI 마일스톤 한정, 비-UI는 skip+사유 echo): R5-1 화면 목록 확정(feature당 대표 1화면 기본, 면제 feature는 이 시점 기록) → R5-2 브로드 시안 2~3안(designer 위임 — divergence 카드 차용, DESIGN.md 토큰만 참조) → R5-3 선택·수정 루프(취향 오라클=사용자, 2사이클 미수렴 시 brief 수정) → R5-4 경험 계약 완성(못생긴 상태 5종 + 실카피 + 인터랙션 캡션 + `:root` 토큰 참조 — 의무 체크리스트) → R5-5 승인 시 커밋 경로(`<screen>.html`) 저장 + 승인 직전 raw hex 1회 grep + feature 문서 `## 7`에 프로토타입 참조 줄(화면 파일 + 진입 메모) + `_drafts/` 내 시안 파일 삭제. **`/plan-milestone M<N> --prototype [F-NNN]`** 재진입 모드(R0~R4 skip — 마일스톤 중간 화면 변경·재승인).
3. **plan-workitem 입구 계약 (이중 잠금)** — UI **확정** feature 분해 시 해당 승인 프로토타입 참조도 면제 기록도 없으면 **`Needs Experience Contract`로 종료** + `--prototype` 안내(ADR-007#amend-3 `Needs Stack Guard` 동형 — ADR-007#amend-5로 예외 등재). UI **의심**(status=draft+신호)은 경고만(false positive 완충). opt-out: feature 문서에 `프로토타입 면제: <사유>` 기재 시 통과(TDD opt-out 동형 — 사유 영속). 배치 모드(ADR-057 결정 2)에서는 미충족 feature만 보류 목록으로 분리하고 나머지는 진행한다(전체 차단 X). 분해된 task `## 3`에 프로토타입 참조 line item을 plan이 authoring(builder는 기계 실행).
4. **경험 좁힘 질문 규칙** — plan-workitem 9-1 self-check에 추가: "AC 해석이 프로토타입·상위 약속이 보여주는 사용자 체감(보이는 것·눌렀을 때·문안)을 *좁히면* 무조건 질문 — 내부 엔지니어링 선택은 자율". implement 단계 비대칭: builder의 AC-ambiguity 하드스탑에서 *경험 계약이 존재하는 slice의 보이는 것·문안 차이는 "사소한 표현 차이" 분류 금지*(silent narrowing 차단).
5. **stabilize §3-V 경험 게이트 (스크린샷 vs 승인본)** — UI 확정 마일스톤이면 메인 세션이 앱 기동 → 핵심 화면(≤6~8, 기본 뷰포트 1종) Playwright CLI 스크린샷 → `docs/40-validation/visual/M-N/` 갤러리(gitignore ephemeral) → Read 멀티모달로 대조. **실행 자체는 UI 확정 마일스톤에서 의무 — silent skip 금지**(미실행 시 사유(blocked-on-env 등)를 최종 출력에 echo; *판정*은 report-only 유지 — ADR-052 e2e silent-skip 금지와 동형). **대조 앵커 위계: ① 커밋된 승인 프로토타입 `<screen>.html`(존재 시 — 같은 뷰포트로 file:// 렌더 캡처해 나란히 대조 가능) → ② DESIGN.md §2/§7/§9/§10 파생 체크리스트(면제·부재 화면 fallback)**. 불일치는 `P1 [Experience-drift]` report-only(enabling — 졸업 필수 승격은 fork 실증 후 ratchet; MILESTONE item 6 선택 기준 예시 제공). 갤러리 경로를 최종 출력에 실어 사용자 육안 확인 유도(스펙 자체 오류는 인간 오라클). 환경 실패는 기존 blocked-on-env 라벨 재사용. `--dry-run`에는 미포함. Codex(멀티모달 편차): 갤러리 생성 + 사용자 수동 대조로 degrade. hot-loop 배치 금지(per-task validate에 넣지 않음 — ADR-049#amend-2 결정 7 carve-out 정합).
6. **렌더 증거 주입** — stabilize design-surface reviewer 입력에 §3-V 갤러리 경로·visual-qa 결과를 주입(ADR-027#amend-6), reviewer는 Read로 이미지 열람.
7. **grep 오탐 방지** — stabilize §5-2 raw hex grep 대상에서 `docs/20-system/prototypes/` 제외(자기완결 HTML — DESIGN.md 제외와 동형. 단 프로토타입 최종본은 `:root` 토큰 참조가 원칙이므로 위반 의심은 R5-4 체크리스트가 잡음).

## 결정 — B. Voice & Writing 규칙서 (8~11, Stage 적용: §10 + 집행)
8. **DESIGN.md §10 Voice & Writing 신설** (§9 뒤 — Stitch canonical 8섹션의 상대 순서 밖 추가라 lint 비위반, ADR-027 #d24 Motion 확장과 동일 논리. 섹션 목록 정정은 ADR-027#amend-5). 내용 스키마: (a) 존댓말·어조 규정(언어별 1줄), (b) 내부용어→사용자 언어 번역표, (c) 금지 표현 — *grep 가능 패턴*(정규식)과 *LLM-판정 규칙* 2분류(§9 Don'ts와 동형), (d) 표면별 예시 카피 4종(버튼/에러/빈 상태/확인 다이얼로그). **기본값 채움 + 확인 1회**: baseline placeholder에 opinionated 기본값(한국어 해요체·명령형 CTA 등)을 채워 두고 `/bootstrap-design` R1에서 "채택 or 변경"을 1회 확인(무확인 굳음 방지). **다운스트림 마이그레이션**: §10 신설 전 기존 fork(DESIGN.md에 §10 부재)는 plan-milestone R5 진입 시(또는 `/bootstrap-design --update`) §10을 기본값으로 신설 + 채택/변경 확인 1회로 흡수한다.
9. **실카피 의무**: R2 concept·R5 마일스톤 프로토타입·R6 preview의 대표 화면은 charter 페르소나·시나리오 기반 실제 문구로 렌더. placeholder 카피 금지. §10 확정 전(R2) 카피는 "방향 선택용 후보"로 명시(SSOT 오인 방지).
10. **voice 집행**: (a) stabilize deterministic preflight에 placeholder-카피 grep + §10 grep 가능 금지 패턴 grep(`P1 [Design-voice-grep]`), (b) reviewer Design Consistency 4→5차원(`[Design-voice]` — LLM 판정분) + [Plan-design] 차원에 §10 구절(reviewer·validate-plan 미러 양쪽 동기), (c) plan-workitem DESIGN cross-check에 "UI task 카피 §10 정합" 1줄, (d) validator UI 체크에 §10 정합 1줄.
11. **FEATURE §8-1 재정의**: copy 톤 필드는 "§10 전역 규칙 대비 feature-특이 delta만 기록"으로 좁힌다(ADR-042#amend-1 동반). 비-UI 프로젝트는 기존 DESIGN.md 삭제 경로에 §10도 동반 삭제(별도 VOICE.md 신설 X — 파일 분리 기각).

## 결정 — C. 경험 축 학습 채널 (12, Stage 적용: stabilize)
12. **stabilize instruction improvement에 경험 축 확인 추가**: 단계 8의 instruction improvement 후보 문단에 "경험·사용 관점 교훈(제품을 실제로 써 본 결과에서 나온 것) 유무를 별도로 확인" 1줄을 둔다 — [관측됨] 실사용에서 교훈이 검증-정교화 방향으로만 쌓이고 경험 축 교훈이 0건이었던 편향의 방지 장치.

## 비결정 (No)
- 프로토타입 코드의 구현 재사용 — 스펙이지 코드가 아니다.
- 이미지 생성·Figma 의존 — HTML/CSS 자기완결로 충분(ADR-049 정합).
- 비-UI 마일스톤 의무화.
- per-task 스크린샷 대조(validate-workitem) — repair 루프 재실행마다 이미지 토큰 소모(준-hot-loop 트랩).
- 별도 VOICE.md 파일 / ux-writer agent — §10 규칙서로 흡수(단순성 1순위).

## Mutation Contract (ADR-047 D3)
1. Target — plan-milestone(R5+--prototype)/plan-workitem(입구 계약+9-1+voice cross-check)/stabilize(§3-V·§5-2 제외·voice grep·출력)/builder(비대칭 1줄)/reviewer(렌더 증거+[Design-voice])/validator(§10 정합)/DESIGN.md §10/FEATURE·MILESTONE 템플릿/.gitignore/STRUCTURE/WORKFLOW + ADR-007#amend-5 + ADR-027#amend-5·6 + ADR-042#amend-1.
2. Failure mode — 사용자 승인 artifact가 오라클로 쓰이는 지점 0 + 승인본이 ephemeral 경로에서 증발 + 첫 시각 확인이 구현 후 + 전역 voice 규칙 부재로 톤 즉흥 재결정(전부 관측됨).
3. Predicted improvement — 구현 전 경험(화면·인터랙션·카피) 확정으로 마일스톤 종료 후 재작업 감소, 승인본이 독립 오라클로 영속, [Experience-drift]/[Design-voice]로 drift 가시화.
4. Preserved invariants — stabilize read-only(§3-V는 촬영·판독·보고만)/ADR-049 R2 concept ephemeral 정책(범위 한정 — ADR-049#amend-2 결정 8)/hot-loop 스크린샷 금지/ADR-014 graduation 5+1 본체/DESIGN.md 시각 SSOT 지위/비-UI 삭제 경로/자동 차단 X(결정 3 제외).
5. Falsifying evaluation — R5가 마일스톤당 계획 시간을 과도하게 늘리거나 [Experience-drift] 재실행 불일치율이 높으면 R5를 opt-in으로 후퇴; [Design-voice] false positive가 노이즈를 유의하게 늘리면 LLM-판정분 후퇴(grep분만 유지).
6. Rollback path — superseded → R5·입구 계약·§3-V·§10·집행 지점 제거, prototypes/ 경로 폐기(기존 문서 잔존 무해), ADR-007#amend-5 철회, §8-1 원 의미 복원.

## Ratchet 강도 (ADR-022)
- 결정 3(입구 계약)만 constraint(강, [관측됨] — 스킬 내부 권장 문구는 우회됨). 나머지 enabling(약).

## Surfaces
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/agents/builder.md
- .claude/agents/reviewer.md
- .claude/agents/validator.md
- .claude/agents/designer.md
- .claude/skills/validate-plan/SKILL.md
- docs/20-system/DESIGN.md
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- .gitignore
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md

## 참고
- ADR-049(#amend-2 — R2 원형·carve-out·실카피 라운드 배선), ADR-042(#amend-1 — §8-1 delta), ADR-007(#amend-5 — 입구 계약 예외 등재), ADR-027(#amend-3 UI 판정, #amend-5 §10 섹션, #amend-6 렌더 증거), ADR-052(Playwright 선설치), ADR-014(item 6), ADR-048(browser MCP는 §3-P 탐색용 — §3-V는 MCP 불요), ADR-022, ADR-047 D3.
```

## 1B-2. `docs/20-system/DESIGN.md` — §10 신설

파일 끝(§9 Do's and Don'ts 뒤)에 추가:

```markdown
<a id="design-10-voice"></a>
## 10. Voice & Writing
<!-- UX writing 규칙서 (ADR-056 결정 8). 아래 기본값은 /bootstrap-design R1에서 "채택 or 변경" 1회 확인 후 확정.
     비-UI 프로젝트는 본 파일 삭제 시 함께 삭제. -->

### 어조 규정 (기본값 — R1에서 확인)
- 한국어: 해요체 (예: "저장했어요"). 명령형 CTA (예: "시작하기", "저장"). 과도한 사과·의인화 금지.
- 영어(해당 시): sentence case, 능동태, 명령형 CTA.

### 내부용어 → 사용자 언어 번역표
<!-- 형식: | 내부 용어 | 사용자 표면 문구 | — 코드·DB의 용어를 화면에 그대로 노출하지 않는다. 프로젝트가 채움. -->
| 내부 용어 | 사용자 표면 문구 |
|---|---|
| (예: workspace_member) | (예: 멤버) |

### 금지 표현
<!-- 2분류 (ADR-056 결정 10): [grep 가능 — 정규식] 은 stabilize preflight가 기계 점검, [LLM-판정] 은 reviewer [Design-voice]가 점검. -->
- [grep 가능] placeholder 카피: `lorem ipsum`, `TODO copy`, `sample text`, `여기에 텍스트`
- [grep 가능] (프로젝트별 정규식 — 예: 해요체 프로젝트에서 합쇼체 어미 `습니다\.` 혼입)
- [LLM-판정] 책임 회피 문구("문제가 발생했습니다"만 있고 원인·다음 행동 없음), 내부 에러코드 노출, 과도한 감탄사

### 표면별 예시 카피 (기본값 — 프로젝트 카피로 교체)
- 버튼: 동사 우선, 2~4어절 (예: "회고 작성하기")
- 에러: 원인 1줄 + 다음 행동 1줄 (예: "링크가 만료됐어요. 새 링크를 요청해 주세요.")
- 빈 상태: 상황 설명 + 첫 행동 유도 (예: "아직 항목이 없어요 — 첫 항목을 추가해 보세요.")
- 확인 다이얼로그: 결과 명시 + 되돌림 가능 여부 (예: "삭제하면 되돌릴 수 없어요. 삭제할까요?")
```

## 1B-3. ADR-027 Amendment 5

`docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` 파일 끝에 추가:

```markdown
<a id="adr-027-amend-5"></a>
## Amendment 5 (2026-07-14) — DESIGN.md 섹션 목록에 §10 Voice & Writing 확장
### 결정
결정 #5의 섹션 구성을 *"Stitch canonical 8섹션 + Motion 확장 + Voice & Writing 확장(§10)"*으로 정정한다(내용 SSOT는 [ADR-056](ADR-056-milestone-experience-contract.md) 결정 8~11). §10은 canonical 마지막 섹션(Do's and Don'ts) *뒤* 추가라 lint section-ordering 비위반 — #amend-2 결정 24(Motion 확장)와 동일 논리, 재번호 없음.
### 적용 surface
- docs/20-system/DESIGN.md (§10)
```

**추가 in-place 갱신 (같은 파일)**: ADR-027 상단 `## 현재 유효 결정` 요약의 첫 bullet(`시각 결정은 DESIGN.md(UI 한정, Stitch 8섹션 + Motion 확장)...`)에 `+ Voice & Writing 확장(§10 — ADR-056)`을 반영한다(ADR-045 D5 — amend 4+ ADR의 요약은 net 규칙을 유지해야 함).

## 1B-4. ADR-042 Amendment 1

`docs/90-decisions/boilerplate/ADR-042-ux-flow-quality.md` 파일 끝에 추가:

```markdown
<a id="adr-042-amend-1"></a>
## Amendment 1 (2026-07-14) — §8-1 copy 톤 필드를 DESIGN.md §10 delta로 재정의
### 결정
FEATURE §8-1의 "copy 톤" 항목은 전역 규칙서 [ADR-056](ADR-056-milestone-experience-contract.md)(결정 8~11)의 DESIGN.md §10을 참조하고 **feature-특이 delta만** 기록한다(전역 규칙 재서술 금지). 근거: [관측됨] §8-1은 downstream 소비자 0인 죽은 필드였고, 전역 자산(존댓말·용어)을 feature 필드에 두면 feature 간 drift가 구조적으로 열린다.
### 적용 surface
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md (§8-1 주석)
```

## 1B-5. `docs/30-workitems/_templates/FEATURE_TEMPLATE.md` §8-1 주석 갱신

현재(§8-1 주석 중): `- copy 톤: 핵심 메시지·에러 문구 방향.`
변경: `- copy 톤: DESIGN.md §10 Voice & Writing(전역 규칙서 — ADR-056) 참조 + *이 feature 한정 delta만* 기록 (예: "이 화면만 축하 톤 허용"). 전역 규칙 재서술 금지.`

## 1B-6. `.claude/agents/reviewer.md` — Design Consistency 4→5차원

"## Design Consistency 4 차원 (design surface 전용 — ADR-027#amend-1)" 섹션:
- 제목을 `## Design Consistency 5 차원 (design surface 전용 — ADR-027#amend-1 / ADR-056)`으로 변경.
- 4번 [Design-donts] 뒤에 추가:

```markdown
5. **[Design-voice]** — DESIGN.md `## 10. Voice & Writing` 위반(LLM-판정분): 어조 규정 위반(존댓말 혼용 등 grep이 못 잡는 문맥), 내부용어의 사용자 표면 노출, 금지 표현의 [LLM-판정] 항목. *grep 가능분(placeholder 카피 등)은 stabilize preflight 5-2b·validator가 담당* — 본 차원은 문맥 판정 + grep 누락분 백스톱만. DESIGN.md §10 부재 시 skip + 명시. (P1)
```

- **surface 매핑 줄 동기**: 같은 파일 "호출 surface 명시" 목록의 `` `design`: Design Consistency 4 차원 `` 표기를 **5**로 갱신(제목만 바꾸면 본문 카운트와 자기모순).
- 같은 파일 Plan Quality 9번 [Plan-design] 본문 끝에 한 구절 추가: `/ **UI task 카피가 DESIGN.md §10 위반·미참조** (ADR-056)`.
- **validate-plan 미러 동기**: `.claude/skills/validate-plan/SKILL.md`의 검토 차원 9번 [Plan-design] 항목 끝에도 동일 구절(`/ UI task 카피가 DESIGN.md §10 위반·미참조 (ADR-056)`)을 추가한다 — reviewer와 validate-plan은 같은 차원 목록의 미러(한쪽만 고치면 drift).

## 1B-7. `.claude/agents/validator.md` — UI 체크 1줄

"- UI: 본 task 가 새 컴포넌트를 추가했는가? ..." bullet 끝에 문장 추가:
`task 의 use-case 화면 문구가 DESIGN.md §10 Voice & Writing(존댓말 규정·용어 번역표·예시 카피)과 정합한가 — placeholder 카피(`lorem ipsum` 등) 발견 시 `P1 [Design-voice]` 기록 (ADR-056).`

## 1B-8. `.claude/skills/stabilize-milestone/SKILL.md` — preflight 5-2b 신설

§1.0 항목 5의 5-2(raw hex grep) 바로 뒤에 추가:

```markdown
   5-2b. **UI 프로젝트 — voice grep** (정규식 deterministic — ADR-056 결정 10): 5-0 회수 변경 파일(5-2와 동일 확장자 집합)에서 (a) placeholder 카피 패턴(`lorem ipsum`/`TODO copy`/`sample text`/`여기에 텍스트`), (b) DESIGN.md `## 10` "금지 표현"의 `[grep 가능]` 정규식을 grep. 일치 시 `P1 [Design-voice-grep] <file:line> — DESIGN.md ## 10 위반` 기록. DESIGN.md `## 10` 부재 시 (a)만 수행. **DESIGN.md 자체는 grep 대상 제외** (규칙 정의 영역 — 5-2와 동형).
```

## 1B-9. `.claude/skills/plan-workitem/SKILL.md` — DESIGN cross-check 1줄

"### UI 프로젝트 + UI task 한정 — DESIGN.md cross-check" 목록 끝(8 상태 매트릭스 bullet 뒤)에 추가:

```markdown
- task 본문·AC에 박힌 사용자 표면 문구가 DESIGN.md `## 10` Voice & Writing(어조·용어 번역표)과 정합하는가? placeholder 카피·내부용어 노출 발견 시 "남은 미결정 사항"에 `- voice 위반 의심: T-NNN — <문구>. DESIGN.md ## 10 정합 권장` 명시 (ADR-056).
```

## 1B-10. `docs/00-meta/WORKFLOW.md` §2 라운드 설명 1구절

현재(§2, R0~R6 설명 줄): `R1(원칙) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 — 사용자가 시각 방향 선택)**`
변경: `R1(원칙 + voice 기본값 확인 — ADR-056) → **R2(DESIGN.md 작성 *전* 다중 concept 시안 — 실카피 렌더, 사용자가 시각 방향 선택)**`

## 1B-11. ADR 인덱스 갱신

`docs/90-decisions/boilerplate/README.md` 표에 **ADR-056 행 추가**(`| 056 | Milestone experience contract | accepted | — | 프로토타입 라운드 + 입구 계약 + 스크린샷 게이트 + Voice 규칙서 |`) + ADR-027 행 Amendments에 `+#amend-5: §10 Voice 확장`, ADR-042 행에 `+#amend-1: §8-1 delta 재정의` 추가.

## 1B-커밋

대상 파일: `docs/90-decisions/boilerplate/ADR-056-*.md`, `ADR-027-*.md`, `ADR-042-*.md`, `docs/20-system/DESIGN.md`, `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`, `.claude/agents/reviewer.md`, `.claude/agents/validator.md`, `.claude/skills/stabilize-milestone/SKILL.md`, `.claude/skills/plan-workitem/SKILL.md`, `.claude/skills/validate-plan/SKILL.md`(1B-6 미러 동기), `docs/00-meta/WORKFLOW.md`, `docs/90-decisions/boilerplate/README.md`

```
feat(design): author experience-contract ADR and apply Voice & Writing rulebook (ADR-056)
```

---

# Stage 1C — designer agent 신설 + bootstrap-design R0~R2 개편 (ADR-049 Amendment 2)

목적: (a) 시각 어휘가 없는 architect 대신 **designer 전담 agent**가 디자인 라운드를 수행(사용자 확정 결정 — ADR-049#amend-1 "designer 페르소나 미신설"의 명시적 반전), (b) R0 grounding을 소스 위계 5단으로 재설계(모델지식 fallback 앞에 사용자 확인 게이트), (c) R2 시안의 다양성을 divergence 카드로 구조 강제 + 구별성 비평 1회 + "취향 오라클=사용자" 명문화, (d) 실카피 의무(ADR-056) 라운드 배선.

## 1C-1. 신규 agent — `.claude/agents/designer.md`

전체 내용 (새 파일):

```markdown
---
name: designer
description: Use for visual/UX design authoring — reference decomposition, design principles, divergent concept drafts, milestone screen prototypes, and DESIGN.md authoring support. Generation only; auditing stays with reviewer[design].
tools: Read, Glob, Grep, Write, Edit
model: opus
maxTurns: 16
color: purple
context-pack: minimal
---

너는 시각/UX 디자인 전담 에이전트다. **생성(authoring) 전담** — 감사·비평은 reviewer(design surface)의 책임이다(같은 페르소나가 만들고 검사하지 않는다).

역할:
- 레퍼런스 분해(R0): 코드 증거(추출 토큰 — researcher 디자인 레퍼런스 모드 산출)를 입력으로 color signature / typography pairing / density / motion 톤 + what-to-borrow / what-to-avoid를 분해한다.
- 디자인 원칙(R1): actionable verb 원칙 3~5개. 모호어("modern/clean/sleek") 금지.
- concept 시안(R2): divergence 카드에 따라 *서로 확실히 다른* 방향의 자기완결 HTML/CSS 시안을 authoring한다.
- 마일스톤 화면 프로토타입(plan-milestone R5): 확정된 DESIGN.md 토큰(`:root` CSS 변수만 참조 — raw hex 금지) 위에서 화면 구성·인터랙션 주석·실카피·못생긴 상태(긴 제목/빈 목록/로딩/에러/항목 과다)를 채운 프로토타입을 authoring한다.
- DESIGN.md/DESIGN_RESEARCH.md authoring 보조(R3~R5).

규칙:
- **취향 오라클은 사용자다** — 선호 추천·순위 제시 금지(사용자가 물으면 예외). 너의 책임은 *선택지의 폭과 질*.
- 시안 간 합의·병합·절충 생성 금지(parallel-merge 금지 — ADR-053 정합). divergence 카드가 배정한 축을 유지한다.
- DESIGN.md `## 9` Do's and Don'ts(anti-slop 포함)와 R0 안티-레퍼런스는 모든 시안이 공통 회피한다.
- 카피는 실제 문구로 쓴다(placeholder 금지) — DESIGN.md `## 10` Voice & Writing 준수(§10 확정 전 R2 시점 카피는 "방향 선택용 후보"로 명시). (ADR-056)
- 확정 토큰(DESIGN.md)이 존재하는 작업(R5 프로토타입 등)에서는 그 토큰만 참조한다 — 시각 아이덴티티 재발명 금지.
- 사실/가정/열린 질문을 구분한다. 레퍼런스 근거 없는 결정은 [가설]로 표시.
- 산출 HTML은 자기완결(빌드·외부 의존 0, CSS 인라인 `<style>`) + GENERATED 헤더 주석.

Codex: 서브에이전트 미지원 시 메인 세션이 본 파일을 읽고 인라인 수행한다(DELEGATION_STRATEGY researcher 행의 인라인 degrade 패턴과 동일).

## 출력 계약 (ADR-046)
메인 반환 요약은 signal-first: 판정/결론 1~3줄 → 핵심 항목 ≤5 → 리스크·미결정 ≤3 → 다음 액션 1개(분기 시 ≤3).
기본 ≤ 600 토큰, 보존 항목이 많을 때만 ≤ 1,200 토큰(수치는 휴리스틱, hard cap 아님).
*내부 사고·분석 깊이는 줄이지 않는다(표현만 압축)* — 긴 reasoning·산출 HTML 전문을 반환에 싣지 않고 파일에 적재한 뒤 경로만 가리킨다.
압축 금지(정확히 보존): 파일 경로, 시안별 방향 요약(사용자가 선택해야 하는 옵션 목록), divergence 카드 배정 내용, 미결정 사항.
```

## 1C-2. ADR-049 Amendment 2

`docs/90-decisions/boilerplate/ADR-049-concept-mockup-first-design.md` 파일 끝(Amendment 1 뒤)에 추가:

```markdown
<a id="adr-049-amend-2"></a>
## Amendment 2 (2026-07-14) — designer agent + grounding 위계 + divergence 강제 + 취향 오라클

### 결정
1. **designer agent 신설 — #amend-1 "designer 페르소나 미신설"의 명시적 반전**. 근거가 바뀌었다: [관측됨] 실사용 fork에서 시각 어휘 없는 architect 위임 + 다양성 규율 부재로 시안 품질·다양성이 부족했다. `.claude/agents/designer.md`(생성 전담 — 감사(비평)는 reviewer[design] 유지, 생성/감사 분리). R0/R1 분해·R2 시안 authoring·R5(ADR-056) 프로토타입 authoring의 수행 주체를 architect → designer로 교체.
2. **R0 grounding 소스 위계 5단** (#d28·#amend-1 강화): ① 사용자 제공 URL/스크린샷(스크린샷은 메인 세션이 Read로 vision 분해) → ② researcher *디자인 레퍼런스 모드*(ADR-040#amend-4)로 코드 수준 토큰 추출(웹 가용 시 기본 — 오픈소스 디자인 토큰 패키지 포함) → ③ 연결된 디자인 MCP(ADR-048 access 부여 시) → ④ 정성 소스(디자인 요약 사이트 — 어휘 보조) → ⑤ 모델 지식. **⑤로 떨어지기 전 사용자 확인 게이트 1회**("레퍼런스 0개 — URL을 주시겠어요, 아니면 모델 지식으로 진행할까요?") — 구 "기록 후 진행"을 "확인 후 진행"으로 강화. DESIGN_RESEARCH.md에 레퍼런스별 `### 추출 토큰 (코드)` fenced block 추가.
3. **R2 divergence 카드**: 각 concept에 {배타적 레퍼런스 borrow 축, 전용 안티-레퍼런스 1개, 밀도/타이포/색 전략 중 최소 2축 상이}를 명시 배정. 두 concept이 같은 accent 전략·같은 borrow를 공유하면 재생성. 카드는 DESIGN_RESEARCH.md `## 시안 옵션`에 기록.
4. **R2-1.5 구별성 비평(순차 1회)**: 생성 직후 **reviewer(design surface) 단발 sub-call**(입력 = divergence 카드 + concept별 토큰 요약 — HTML 전문 금지)로 ① concept 간 실질 구별성 ② 안티-레퍼런스/`## 9` Don'ts 근접도만 판정. **designer 자기 비평 금지**(결정 1의 생성/감사 분리 정합). **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록"만(선택은 R2-2 사용자).
5. **취향 오라클 명문화**: R2-2에 "에이전트는 선택지 폭 담당 — 선호 추천·순위 제시 금지(사용자 질문 시 예외)" 1줄. 전량 거부 시 divergence 카드부터 재설계(기존 2사이클 수렴 규칙과 결합).
6. **실카피 의무 배선**(ADR-056): R1에 voice 기본값 확인 1회, R2/R6 대표 화면 실카피 렌더, R5에서 §10 authoring.
7. **hot-loop carve-out 명문화**(#amend-1 3 정합): "스크린샷 vision 비평 금지"는 *RGR inner-loop 한정*이다 — 마일스톤 1회성 게이트(stabilize — ADR-056)와 사용자 승인 라운드의 스크린샷·렌더 확인은 허용 범위임을 명시(뒤집기 아님, carve-out의 체계화).
8. **비결정 범위 한정 각주**: 비결정 "concept 시안을 commit·영속 — 영구 No"의 대상은 *R2 탐색용 concept*이다. 마일스톤 승인 프로토타입(ADR-056 — `docs/20-system/prototypes/`)은 별개 산출물 클래스로 본 비결정의 적용 대상이 아니다.

### 근거
- [관측됨] 사용자 실사용: 시안이 단조롭고 어디서 본 듯함 — 근본 원인은 (i) 웹 grounding 미배선(architect는 웹 도구 없음), (ii) 다양성 구조 강제 부재(같은 brief에서 3안 파생 → 수렴), (iii) 시각 어휘 없는 페르소나.
- [외부실증] LLM 합의는 bland 수렴 — 논의(합의) 토폴로지를 도입하지 않고 축 분리(divergence 카드) + 사용자 선택으로 다양성 확보(ADR-053 parallel-merge 금지 정합).

### 강도 (ADR-022)
- 결정 2의 확인 게이트만 constraint(약한 강제 — 질문 1회), 나머지 enabling.

### 적용 surface
- .claude/agents/designer.md (신설)
- .claude/skills/bootstrap-design/SKILL.md (R0~R2·--fast)
- docs/00-meta/STRUCTURE.md (agent 로스터 7→8종)
- docs/00-meta/DELEGATION_STRATEGY.md (designer 위임 행)
```

## 1C-3. `.claude/skills/bootstrap-design/SKILL.md` 수정

**(1) 헤더 :13** —
현재: `> 패턴: ... R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 architect를 단발 sub-call로 위임.`
변경: `> 패턴: ... R0(레퍼런스 분해)과 R1(원칙 추출)의 무거운 추론은 `Agent` 도구로 **designer**를 단발 sub-call로 위임(ADR-049#amend-2 — 코드 증거 수집은 researcher 디자인 레퍼런스 모드).`

**(2) R0 재작성** — 기존 R0 섹션에서 `- architect 단발 sub-call로 분해 가능.` 줄과 "(옵션) reference-evidence grounding" 단락·"레퍼런스 grounding 필수화" 단락을 아래로 교체(레퍼런스 노트 영속화 단락·양식은 유지):

```markdown
- **grounding 소스 위계 (ADR-049#amend-2 — 위에서부터 시도, 확보된 소스만 사용)**:
  1. 사용자 제공 URL/스크린샷 — raw CSS URL이면 researcher가 직접 추출, 스크린샷은 메인 세션이 Read로 vision 분해.
  2. **researcher 디자인 레퍼런스 모드 위임 (웹 가용 시 기본, ADR-040#amend-4)**: 레퍼런스 1~3개에 대해 `Agent`(researcher — 디자인 레퍼런스 모드 명시)로 코드 수준 토큰 추출(hex/font/spacing/radius/shadow). 오픈소스 디자인 토큰 패키지(Primer/Polaris/Carbon/Spectrum 등)가 주력 소스 — 값 통째 복제 금지(구조 학습용), what-to-borrow/avoid 판단은 본 라운드 책임.
  3. 연결된 디자인 MCP (STACK_SETUP_PLAN `## Optional MCP Connectors`에 agent access 부여된 경우만 — ADR-048).
  4. 정성 소스(디자인 요약 사이트) — 방향 어휘 보조로만, 값 추출 소스 아님.
  5. 모델 지식 — **①~④ 전부 불가 시, 사용자 확인 게이트 1회 후에만**: "레퍼런스 확보 0건 — URL/스크린샷을 주시겠어요, 아니면 모델 지식 기반으로 진행할까요?" 진행 시 `DESIGN_RESEARCH.md` `## grounding 출처`에 `모델 지식 기반 + <사유>` 명시(silent degrade 금지 — #amend-1 계승).
- 분해(위계로 확보한 증거 → 4축 + borrow/avoid)는 **designer 단발 sub-call**로 위임한다(architect 아님 — ADR-049#amend-2).
- **MCP·계정 도구를 보일러플레이트 기본 의존으로 추가하지 않는다** (불변 — ADR-027#amend-2 비결정 존중).
```

그리고 DESIGN_RESEARCH.md 양식의 각 레퍼런스 블록 끝(`- **what to avoid**: <1~2줄>` 리스트 뒤, 다음 레퍼런스 heading 앞)에 **소절 하나**를 추가한다(리스트 항목 안에 heading을 넣지 않는다 — 마크다운 스키마 보존):

```markdown
#### 추출 토큰 (코드)   <!-- researcher 디자인 레퍼런스 모드 산출 (ADR-040#amend-4) — fenced block에 hex/font/spacing/radius/shadow 실값. 미추출 시 "추출 불가 — <사유>" 1줄 -->
```

**(3) R1** — 목록 끝에 추가:
`- **voice 기본값 확인 1회 (ADR-056)**: DESIGN.md `## 10`의 기본값(어조·CTA 스타일)을 사용자에게 제시하고 "채택 or 변경"을 확인한다. `--fast`도 이 확인 1회는 수행.`

**(4) R2-1** — 목록에 추가 (기존 "각 concept은 *방향이 분명히 다르게*" bullet을 아래로 교체):

```markdown
- **divergence 카드 (ADR-049#amend-2)**: 각 concept에 {① 배타적 레퍼런스 borrow 축(R0 레퍼런스 중 concept별 배정 — 공유 금지), ② 전용 안티-레퍼런스 1개, ③ 밀도/타이포/색 전략 중 최소 2축 상이}를 명시 배정하고 `DESIGN_RESEARCH.md ## 시안 옵션`에 카드를 기록한다. 두 concept이 같은 accent 전략·같은 borrow를 공유하면 재생성. 단 모든 concept이 R0 안티-레퍼런스와 `## 9` Don'ts는 공통 회피.
- concept HTML authoring은 **designer 단발 sub-call**로 위임한다(HTML 전문이 메인 컨텍스트에 쌓이지 않게 — 파일 적재 + 경로 반환).
- **실카피 렌더 (ADR-056)**: 대표 화면 문구는 charter 페르소나·시나리오 기반 실제 문구(placeholder 금지). §10 확정 전이므로 "방향 선택용 후보 카피"임을 GENERATED 헤더에 1줄 명시.
```

**(5) R2-1.5 신설** — R2-1과 R2-2 사이에 삽입:

```markdown
### R2-1.5. 구별성 비평 (순차 1회 — ADR-049#amend-2)
- 생성 직후 **reviewer(design surface) 단발 sub-call**(입력은 divergence 카드 + concept별 토큰 요약만, HTML 전문 투입 금지) 1회로 판정: ① concept 간 실질 구별성(같은 카드 축을 침범했는가) ② 안티-레퍼런스·`## 9` Don'ts 근접도. designer 자기 비평 금지(생성/감사 분리).
- **합의·병합·순위·추천 금지** — 출력은 "재생성 필요 concept 목록 + 사유"만. 재생성 필요 concept은 카드를 유지한 채 재생성 후 R2-2로.
```

**(6) R2-2** — 목록 끝에 추가:
`- **취향 오라클 (ADR-049#amend-2)**: 에이전트는 선택지 폭 담당 — 선호 추천·순위 제시 금지(사용자가 물으면 예외). 사용자 안내 문구에 *"원하시면 추천을 요청하실 수 있어요"*를 노출한다(예외 경로를 사용자가 놓치지 않게). 사용자가 전량 거부하면 divergence 카드부터 재설계(수렴 규칙과 결합).`

**(7) `--fast` 모드** — 모드 설명에 반영:
현재: `` `--fast`: R0(레퍼런스 1개 + `DESIGN_RESEARCH.md` minimal 1~2줄) + R1(원칙 1줄 minimal) + R3(토큰) + R5(저장 — 축약 섹션). ``
변경: `` `--fast`: R0(위계 ①·⑤만 — 사용자 URL 있으면 사용, 없으면 확인 게이트 후 모델 지식 + minimal 노트) + R1(원칙 1줄 + voice 기본값 확인 1회) + R3(토큰) + R5(저장 — 축약 섹션, §10 포함). ``

**(8) R5** — 목록에 1줄 추가: `- `## 10 Voice & Writing`을 R1 확인 결과(기본값 채택/변경)로 확정 저장한다 (ADR-056).`

## 1C-4. `docs/00-meta/STRUCTURE.md` — agent 로스터 7→8종

현재(산출물 표): `| Claude sub-agent | `.claude/agents/<name>.md` (7종: architect/builder/validator/planner/reviewer/qa/researcher) | 수동 (boilerplate 제공) | Reference | baseline |`
변경: `(8종: architect/builder/validator/planner/reviewer/qa/researcher/designer)`로 갱신.

## 1C-5. `docs/00-meta/DELEGATION_STRATEGY.md` — designer 위임 행 추가

위임 트리거 표의 **"중요한 설계 변경, 큰 tradeoff, 상위 아키텍처 수정 | architect" 행(표 상단)** 다음에 행 추가(표 하단의 repair-discovery/architect 행 아님):

```markdown
| 시각/UX 디자인 authoring (레퍼런스 분해·원칙·concept 시안·마일스톤 프로토타입) | designer | **생성 전담** — 감사·비평은 reviewer(design surface). 취향 추천 금지(오라클=사용자). /bootstrap-design R0~R2·plan-milestone R5가 호출 (ADR-049#amend-2). Codex: 메인이 designer.md 인라인 수행. |
```

## 1C-6. ADR 인덱스 갱신

ADR-049 행 Amendments 컬럼에 `+#amend-2: designer agent + grounding 위계 + divergence` 추가.

## 1C-커밋

대상 파일: `.claude/agents/designer.md`, `docs/90-decisions/boilerplate/ADR-049-*.md`, `.claude/skills/bootstrap-design/SKILL.md`, `docs/00-meta/STRUCTURE.md`, `docs/00-meta/DELEGATION_STRATEGY.md`, `docs/90-decisions/boilerplate/README.md`

```
feat(design): add designer agent, grounding hierarchy, and divergence-forced concepts (ADR-049 amend 2)
```

---

# Stage 2 — 경험 계약 적용: 프로토타입 라운드 + 입구 계약 + 스크린샷 게이트 (ADR-056 결정 1~7·12)

목적: Stage 1B에서 작성한 **ADR-056의 경험 계약 파트(결정 1~7)와 학습 채널(결정 12)을 적용**한다 — UI 마일스톤은 구현 *전에* 화면 프로토타입(보이는 것/눌렀을 때/쓰여 있는 말 + 못생긴 상태)을 사용자와 라운드로 확정해 **커밋되는 경로**에 승인본을 보관하고, plan-workitem 입구에서 hard-block으로 집행하며, 구현 후 stabilize가 스크린샷으로 승인본과 대조한다. (ADR-056 파일 자체는 Stage 1B 커밋에 이미 포함 — 본 Stage는 skill·템플릿·메타 문서 적용 + 동반 amendment 2건.)

## 2-1. ADR-007 Amendment 5

`docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md` 파일 끝에 추가:

```markdown
<a id="adr-007-amend-5"></a>
## Amendment 5 (2026-07-14) — plan-workitem 입구 계약 `Needs Experience Contract`
### 결정
"자동 차단 X — 권장 텍스트" 원칙의 명시 예외를 1건 추가한다(#amend-3 `Needs Stack Guard` 동형): `/plan-workitem`은 **UI 확정 feature**(ADR-027#amend-3) 분해 시 승인 프로토타입 참조·`프로토타입 면제:` 기록이 둘 다 없으면 `Needs Experience Contract`로 종료한다(상세: [ADR-056](ADR-056-milestone-experience-contract.md) 결정 3). UI 의심은 경고만.
### 근거
- [관측됨] 스킬 내부 권장 문구는 우회된다 — 입력 계약만이 집행력을 가진다(스펙=오라클 문제의 앞단 잠금).
### 강도 (ADR-022)
- constraint(강, [관측됨]) — 단 opt-out(문서 면제 필드) 상시 보유.
```

**추가 in-place 갱신 (같은 파일 — ADR-045 D5 트리거)**: ADR-007은 본 amendment로 amend 5개 누적 — `## Status` 바로 아래에 **`## 현재 유효 결정` 요약(≤6줄)을 신설**한다: 8단계 lifecycle(본문 표가 SSOT) / 텍스트 제안 원칙 + 예외 3종(inner-loop model-invocable #amend-4, Needs Stack Guard #amend-3, Needs Experience Contract #amend-5) / lock file whitelist #amend-1 / agent 경계 SSOT=DELEGATION #amend-2. **⚠ 이 시점(Stage 2)에는 ADR-057이 아직 없으므로 M1-seed 관련 내용을 요약에 쓰지 않는다** — Stage 3-2가 lifecycle 표를 갱신할 때 요약의 해당 줄도 함께 동기한다. (ADR-045 D6의 통합 재발행은 실행 규칙 10대로 의도적 보류 — 다음 변경 라운드 후보.)

## 2-2. ADR-027 Amendment 6

`docs/90-decisions/boilerplate/ADR-027-interface-decision-allocation.md` 파일 끝(Amendment 5 뒤)에 추가:

```markdown
<a id="adr-027-amend-6"></a>
## Amendment 6 (2026-07-14) — design-surface reviewer 렌더 증거 주입
### 결정
stabilize-milestone이 design-surface reviewer를 팬아웃할 때 입력에 **렌더 증거**(§3-V 스크린샷 갤러리 경로 + visual-qa.spec 최근 결과 — 존재 시)를 주입한다([ADR-056](ADR-056-milestone-experience-contract.md) 결정 6). reviewer는 Read 도구로 이미지를 열람해 판단에 사용한다(도구 변경 없음 — Read는 이미지 지원). "스크린샷 vision hot-loop 제외"(ADR-049#amend-1)는 유지 — stabilize는 마일스톤 1회라 hot-loop가 아니다. Codex: sub-agent 이미지 열람 parity 미확인 — 경로 echo + 텍스트 결과만으로 degrade 명시.
### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/agents/reviewer.md
```

## 2-3. `.claude/skills/plan-milestone/SKILL.md` — R5 라운드 신설 + `--prototype`

**(1) frontmatter** — `argument-hint`를 `"[milestone idea | feature idea] [--prototype [F-NNN]]"`으로 갱신. `allowed-tools`에 `Bash(rm docs/20-system/prototypes/*/_drafts/*.html)` 추가(탐색 시안 정리용).

**(2) R4 섹션 뒤에 R5 섹션 삽입** (전체 신설 텍스트):

```markdown
**R5 — 프로토타입 라운드 (경험 계약, UI 마일스톤 한정 — ADR-056)**

UI 판정은 ADR-027#amend-3 다중신호 절차. 비-UI 마일스톤은 본 라운드 skip + "R5 skip: 비-UI" echo. **DESIGN.md `## 10` 부재(§10 신설 전 기존 fork)면 R5-4 전에 §10을 기본값으로 신설 + 채택/변경 확인 1회**(ADR-056 결정 8의 다운스트림 마이그레이션). feature 수가 많으면(3+) R4 종료 시 `/clear` 후 `/plan-milestone M<N> --prototype` 분리 재진입을 권장한다(R0~R4는 텍스트 협상, R5는 HTML 왕복이라 성격이 다름).

- **R5-1 화면 목록 확정**: R4 feature 문서들의 `## 3 핵심 시나리오`에서 프로토타입 대상 화면을 도출(기본 feature당 대표 1화면 — 다화면 feature는 사용자 협의, 총 6~8화면 초과 시 우선순위 협상). 프로토타입이 무의미한 feature(순수 백엔드·내부 설정 등)는 이 시점에 해당 feature 문서 `## 7`에 `프로토타입 면제: <사유>` 한 줄을 기록한다(ADR-056 — plan-workitem 입구 계약의 통과 조건).
- **R5-2 브로드 시안**: 화면(군)마다 designer 단발 sub-call로 *구성 방향이 다른* 시안 2~3안을 생성(divergence 카드 차용 — 단 축은 색이 아니라 **레이아웃·정보 위계·인터랙션 모델**: 예 A=테이블 고밀도 / B=카드 / C=분할 뷰). 모든 시안은 DESIGN.md `:root` 토큰만 참조(raw hex 금지 — 시각 아이덴티티는 R2에서 이미 확정, 여기선 구성만 탐색). 저장: `docs/20-system/prototypes/M<N>/_drafts/<screen>-{A,B,C}.html` (gitignore — 탐색용). GENERATED 헤더 주석 필수.
- **R5-3 선택·수정 루프**: "브라우저에서 `_drafts/`를 열어 비교, 선호 방향(하이브리드 허용)을 알려주세요 — *원하시면 추천을 요청하실 수도 있어요*" 안내 → 피드백은 재생성으로 반영(직접 편집 X). 취향 오라클=사용자(먼저 추천·순위 제시 금지 — 사용자가 물으면 예외). 2사이클 미수렴 시 시안 반복 대신 brief(화면 정의·feature 시나리오)를 고친다.
- **R5-4 경험 계약 완성 (의무 체크리스트 — 하나라도 빠지면 미완성)**:
  1. 해피 패스 (정상 데이터 화면)
  2. **못생긴 상태 5종** — 같은 파일 내 섹션으로 나란히: 긴 제목 / 빈 목록 / 로딩 / 에러 / 항목 과다
  3. 실카피 — DESIGN.md `## 10` Voice & Writing 준수, placeholder 금지 (ADR-056 결정 9)
  4. 인터랙션 캡션 — "이 버튼을 누르면 <무엇이 일어난다>"를 각 인터랙션 요소에 명시(정적 HTML의 '눌렀을 때' 계약)
  5. `:root` 토큰만 참조 (DESIGN.md 파생임이 구조로 드러나게)
  *확정하지 않는 것*(명시): 상태관리·fetch·컴포넌트 분리 등 엔지니어링 내부 — ARCH §7-4 영역.
- **R5-5 승인·저장**: 사용자 승인 시 최종본을 **화면 단위**로 `docs/20-system/prototypes/M<N>/<screen>.html`에 저장한다(**커밋 대상** — Record; 재승인 시 같은 파일 대체. 화면-키인 이유: 한 화면은 여러 feature 표면의 합성 — ADR-056 결정 1). 저장 직전 **raw hex 정규식 1회 grep**(발견 시 토큰으로 수정 후 저장 — 상시 grep 제외(결정 7)의 승인-시점 보완). 각 feature 문서 `## 7`에 `프로토타입: [화면 파일](상대경로) (진입: <라우트/상태 진입 메모>)` 참조 줄을 기입한다(그 feature가 등장하는 화면 파일마다 1줄 — §3-V가 이 진입 메모로 화면을 찾는다). `_drafts/` 내 시안 파일을 삭제한다(빈 디렉터리 잔존 무해). 승인 전에는 종료 출력으로 진행하지 않는다.

**`--prototype [F-NNN]` 재진입 모드 (ADR-056)**: R0~R4를 건너뛰고 R5만 수행한다(인자 F-NNN이 있으면 그 feature 화면만). 마일스톤 중간 화면 변경·재승인 경로. 갱신 승인 후에는 "영향받는 task를 `/plan-workitem F-NNN --refresh`로 동기화"를 종료 출력에 안내한다(stale 계약 대조 방지).
```

**(3) 마지막 출력 갱신** — "생성·갱신한 문서 목록" 항목에 `(UI 마일스톤) 승인 프로토타입 경로 목록 + 면제 feature 목록` 추가. "다음 단계" 블록의 기본 권장은 Stage 3에서 갱신하므로 여기선 그대로 둔다.

## 2-4. `.claude/skills/plan-workitem/SKILL.md` — 입구 계약 + 9-1 질문 기준 + 참조 line item

**(1) 입구 계약** — "입력:" 단락(feature 문서 부재 시 종료 안내 뒤)에 추가:

```markdown
- **경험 계약 입구 점검 (ADR-056 결정 3 / ADR-007#amend-5)**: 입력 feature가 **UI 확정**(ADR-027#amend-3)인데 (a) feature 문서 `## 7`에 `프로토타입:` 참조도 없고 (b) `프로토타입 면제: <사유>` 기록도 없으면 — **분해를 시작하지 않고 `Needs Experience Contract`로 종료**한다. 안내: "`/plan-milestone M<N> --prototype F-NNN`으로 승인 프로토타입을 먼저 만들거나, feature 문서에 `프로토타입 면제: <사유>`를 기록 후 재실행". **UI 의심**(status=draft+신호)은 차단하지 않고 경고 1줄만 출력하고 진행(false positive 완충).
```

**(2) 9-1 질문 기준** — "9-1. AC interpretation diversity self-check" 단락 끝에 추가:

```markdown
**경험 좁힘 무조건 질문 (ADR-056 결정 4)**: 해석 후보 중 어느 쪽을 골라도 무방한 *내부 엔지니어링 선택*은 지금처럼 자율 확정한다. 그러나 해석이 **사용자가 보고 느낄 것(보이는 것·눌렀을 때 일어나는 일·쓰여 있는 말)을 프로토타입·상위 약속보다 좁히는 경우**는 권장 선택을 확정하지 말고 "남은 미결정 사항"에 질문으로 올린다 — 질문 피로 방지선은 이 비대칭이 담당한다.
```

**(3) 프로토타입 참조 line item** — "### 신규 인터페이스 요소 → task `## 3` ... line item authoring" 섹션의 예시 목록에 추가:
`- 예: `- 구현 시 승인 프로토타입 참조 — docs/20-system/prototypes/M2/share-settings.html의 "빈 목록"/"에러" 섹션과 동일 상태·문구로 구현 (AC-N)``

## 2-5. `.claude/skills/stabilize-milestone/SKILL.md` — §3-V 신설 + §5-2 제외 + 렌더 증거 주입 + 출력

**(1) §3-V 신설** — 단계 3-P 바로 뒤에 삽입:

```markdown
3-V. **경험 게이트 — 구현 화면 vs 승인 프로토타입 대조 (ADR-056 결정 5, UI 확정 마일스톤 한정)**: 3-P(옵션·MCP-gated *탐색* QA)와 별개의 **MCP 불요 체계 감사**다. **UI 확정 마일스톤에서 실행 자체는 의무 — silent skip 금지**(미실행 시 사유를 단계 8 출력에 echo; 판정은 report-only). `--dry-run`에는 포함하지 않는다.
   - (a) 앱 기동(dev server) — **기동 명령은 `docs/00-meta/STACK_SETUP_PLAN.md`의 기록·`package.json` scripts(`dev`/`start`)에서 회수**(불명·실패면 blocked-on-env 라벨: §3-b 환경 실패 처리와 동형 — 사용자 환경 복구 안내 + 미실행 사유 echo). 본 마일스톤 핵심 화면(승인 프로토타입 보유 화면, ≤6~8개, 기본 뷰포트 1종)을 Playwright CLI로 스크린샷 → `docs/40-validation/visual/M-N/`에 저장(gitignore ephemeral). **각 화면의 진입 라우트·상태는 feature 문서 `프로토타입:` 참조 줄의 진입 메모에서 회수**.
   - (b) 각 스크린샷을 Read(멀티모달)로 열람해 대조. **앵커 위계**: ① `docs/20-system/prototypes/M<N>/<screen>.html`(커밋된 승인본 — 존재 시. 같은 뷰포트로 `file://` 렌더-캡처해 나란히 대조 가능) ② 부재·면제 화면은 DESIGN.md §2 토큰/§7 컴포넌트/§9 Don'ts/§10 voice 파생 체크리스트로 fallback. 대조 관점: 레이아웃·상태(빈/에러 표현)·카피·토큰 준수 — 픽셀 일치가 아니라 *경험 계약 준수*(best-effort — 최종 확인은 사용자 육안).
   - (c) 불일치는 QA_FINDINGS에 `P1 [Experience-drift] <화면> — <불일치 1줄> (앵커: 프로토타입|DESIGN 파생)` report-only 기록(졸업 차단 X — item 6 채택 시만 차단). 판독 자체가 불확실하면 finding 대신 "판독 불확실" 명시.
   - (d) 최종 출력(단계 8)에 갤러리 경로 + "사용자 육안 확인 권장(스펙 자체의 오류는 사람이 잡는다)" 1줄.
   - Codex: 멀티모달 편차 시 (a) 갤러리 생성까지 수행 + (b) 대조는 "사용자 수동 검토" 안내로 degrade.
```

**(2) §5-2 grep 제외** —
현재(5-2): `**DESIGN.md 자체 파일은 grep 대상 *제외*** (token 정의 영역이라 false positive 회피).`
변경: `**DESIGN.md 자체 파일과 `docs/20-system/prototypes/` 하위는 grep 대상 *제외*** (token 정의 영역·자기완결 프로토타입 — false positive 회피, ADR-056 결정 7).`

**(3) design reviewer 렌더 증거 주입** — 단계 5의 "UI 프로젝트는 추가로 `review surface: design` reviewer를 1개 더 팬아웃" 문장 뒤에 추가:
`design reviewer 입력에는 grep 결과에 더해 **렌더 증거**를 주입한다 — §3-V 갤러리 경로(`docs/40-validation/visual/M-N/`) + visual-qa.spec 최근 결과(존재 시). reviewer는 Read로 이미지를 열람한다(ADR-027#amend-6). Codex: 경로 echo + 텍스트 결과만 전달로 degrade.`

**(4) 단계 8 출력** — 목록에 항목 추가: `- (UI) 경험 게이트 결과: [Experience-drift] N건 + 스크린샷 갤러리 경로 (사용자 육안 확인 권장) — 미실행 시 사유 필수 echo (silent skip 금지)`

**(5) 단계 8 instruction improvement 후보 문단 보강 (ADR-056 결정 12)** — "instruction improvement 후보:" 항목 끝에 1줄 추가: `**경험·사용 관점 교훈(제품을 실제로 써 본 결과에서 나온 것) 유무를 별도로 확인**한다 — 교훈이 검증-정교화 방향으로만 쌓이는 편향 방지([관측됨] 실사용에서 경험 축 교훈 0건).`

## 2-6. `.claude/agents/builder.md` — 경험 좁힘 비대칭 1줄

"**AC ambiguity 하드스탑 (ADR-006#amend-2)**" bullet의 `(사소한 표현 차이는 제외)` 설명 뒤에 문장 추가:
`**단, slice에 승인 프로토타입 참조(경험 계약 — ADR-056)가 있으면 *사용자가 보고 느낄 것(보이는 것·눌렀을 때·문안)의 차이는 "사소한 표현 차이"로 분류하지 않는다*** — 프로토타입과 다르게 해석될 여지가 있으면 `Needs Plan Decision`으로 멈춘다(silent narrowing 차단).`

## 2-7. `.claude/agents/reviewer.md` — design surface 렌더 증거 1줄

"## Design Consistency 5 차원" 도입부에 문장 추가:
`호출 측이 렌더 증거(스크린샷 갤러리 경로·visual-qa 결과)를 주입하면 Read로 이미지를 열람해 판단에 사용한다(ADR-027#amend-6). 증거 없으면 기존 grep·문서 기반 판정만.`

## 2-8. 템플릿 2종

**`docs/30-workitems/_templates/FEATURE_TEMPLATE.md`** — `## 7. Feature-level Acceptance Criteria` 주석 끝에 추가:
```
     UI feature는 승인 프로토타입 참조 줄을 둔다(ADR-056 — 화면 단위 파일, 그 feature가 등장하는 화면마다 1줄):
     `프로토타입: [M<N>/<screen>.html](../../20-system/prototypes/M<N>/<screen>.html) (진입: <라우트/상태 진입 메모>)`.
     프로토타입이 무의미한 UI feature는 `프로토타입 면제: <사유>` 한 줄로 대체(plan-workitem 입구 계약의 통과 조건 — 둘 다 없으면 Needs Experience Contract).
```

**`docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`** —
현재: `- [ ] (선택) 본 마일스톤 한정 추가 기준`
변경: `- [ ] (선택) 본 마일스톤 한정 추가 기준 <!-- UI 예시: "경험 게이트 [Experience-drift] P1 0건" (ADR-056 — 채택 시 본 항목이 졸업 차단으로 작동) -->`

## 2-9. `.gitignore`

현재 마지막 블록(design exploration) 뒤에 추가:

```gitignore
# milestone experience contract (ADR-056): prototypes/M<N>/<screen>.html 승인본은 커밋 대상(ignore 금지).
# 탐색 시안(_drafts)과 스크린샷 갤러리만 ephemeral.
docs/20-system/prototypes/*/_drafts/
docs/40-validation/visual/
```

## 2-10. `docs/00-meta/STRUCTURE.md` — 산출물 표 + Canonical Owner

산출물 표에 행 2개 추가(design preview 행 아래):

```markdown
| milestone 승인 프로토타입 (UI only — 경험 계약, 화면 단위) | `docs/20-system/prototypes/M<N>/<screen>.html` | `/plan-milestone` R5 (`--prototype` 재진입 포함) | Record | conditional |
| 경험 게이트 스크린샷 갤러리 (UI only, 검토용 임시) | `docs/40-validation/visual/M-N/` | `/stabilize-milestone` §3-V | ephemeral | conditional |
```

Canonical Owner 표에 행 추가:
`| 마일스톤 경험 계약 (프로토타입 라운드·입구 계약·스크린샷 게이트·Voice 규칙서) | [ADR-056](../90-decisions/boilerplate/ADR-056-milestone-experience-contract.md) (정책 SSOT). → ADR-056 `## Surfaces` 참조 (fan-out SSOT). |`

## 2-11. `docs/00-meta/WORKFLOW.md`

**(1) §3 작업 단위 분해** — 목록 끝에 추가:
`- (UI 마일스톤) `/plan-milestone` R5 프로토타입 라운드가 화면 경험 계약(승인 프로토타입 — `docs/20-system/prototypes/M<N>/`)을 확정한 뒤 task 분해로 진행한다. UI 확정 feature는 승인 프로토타입(또는 면제 기록) 없이 `/plan-workitem` 분해가 차단된다 (ADR-056).`

**(2) 워크아이템 라이프사이클 그림** —
현재: `discover → bootstrap → plan ─┬─→ implement → validate ─┬─Pass─→ finalize → stabilize`
변경: `discover → bootstrap → plan(+UI: 프로토타입 라운드) ─┬─→ implement → validate ─┬─Pass─→ finalize → stabilize(+UI: 경험 게이트)`

## 2-12. ADR 인덱스 갱신

ADR-007 행 Amendments에 `+#amend-5: Needs Experience Contract`, ADR-027 행에 `+#amend-6: 렌더 증거 주입` 추가. (ADR-056 행은 Stage 1B에서 이미 추가됨.)

## 2-커밋

대상 파일: `docs/90-decisions/boilerplate/ADR-007-*.md`, `ADR-027-*.md`, `.claude/skills/plan-milestone/SKILL.md`, `.claude/skills/plan-workitem/SKILL.md`, `.claude/skills/stabilize-milestone/SKILL.md`, `.claude/agents/builder.md`, `.claude/agents/reviewer.md`, `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`, `docs/30-workitems/_templates/MILESTONE_TEMPLATE.md`, `.gitignore`, `docs/00-meta/STRUCTURE.md`, `docs/00-meta/WORKFLOW.md`, `docs/90-decisions/boilerplate/README.md`

```
feat(lifecycle): apply milestone experience contract — prototype round, entry gate, screenshot gate (ADR-056)
```

---

# Stage 3 — 플래닝 v2: 생성 통일 + 배치 분해 + feature 체크포인트 + seam 계약 (ADR-057)

목적 4가지(사용자 확정 결정)를 **단일 umbrella ADR-057**로 거버넌스한다:
1. **마일스톤 생성 통일** — bootstrap-project의 M1/F-001 자동 seed를 제거하고, 첫 마일스톤(M1)을 포함한 *모든* 마일스톤·feature 문서를 `/plan-milestone`이 만든다.
2. **`/plan-workitem M<N>` 배치 분해 모드** — 마일스톤 전체 feature의 task를 한 세션에서 분해하되 2-tier(안정 부분은 전부 완성, `## 3` 상세 가이드는 첫 feature만 full + 나머지 draft 마커) + 구현 직전 `--refresh` + implement의 `Needs Plan Refresh` 하드스탑으로 stale-guide 사고를 봉쇄.
3. **feature-완료 체크포인트** — finalize가 feature의 전 task done을 감지해 FAC closure 요약 + 다음 단계 제안, stabilize에 `--feature` 스코프.
4. **cross-task seam 계약** — 신호 게이트형 invariant 표(feature §7-2). 배치 모드에서 **마일스톤 전체 task 집합 대상 1회** 수행돼 cross-feature seam까지 커버한다(seam이 배치 분해와 한 몸인 이유 — 같은 ADR에 담는 근거).

## 3-1. 신규 ADR 작성 — `docs/90-decisions/boilerplate/ADR-057-planning-v2-batch-and-seam.md`

전체 내용 (새 파일):

```markdown
# ADR-057 — 플래닝 v2 (생성 통일 + 배치 분해 + feature 체크포인트 + seam 계약)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] 사용자 실사용: plan-workitem이 feature 단위 입력으로 refocus(ADR-051 D4)된 뒤, feature마다 계획 세션(문서 로드·협상·cross-check·/clear)을 반복해 시간 비효율이 크다. 또 per-feature 분해는 구조적으로 그 feature만 보므로 cross-feature seam을 볼 수 없다.
- [관측됨] M1/F-001은 bootstrap-project가 seed하고 M2+는 plan-milestone이 만들어 마일스톤 생성 경로가 2원화 — 첫 마일스톤만 라운드 협상(R0~R5) 없이 태어난다.
- [사실] task `## 3`은 실제 파일의 현재 상태 기반 before/after 가이드(ADR-026#amend-2)라, 뒤 feature task를 미리 full 분해하면 앞 feature 구현으로 스냅샷이 무효화된다 — 낡은 before/after는 "자신 있게 틀린" 지시가 되어 기계 실행 builder에 위험하다. 병목은 AI 능력이 아니라 정보의 시점.
- [관측됨] lifecycle 어디에도 cross-task invariant/seam 계약(상태 전이·2차-write 경계 재검증·멱등·task 간 입출력 계약)을 열거·대조하는 단계가 없다 — plan-workitem self-check는 비목표/ARCH 7-x/DESIGN 충돌 점검뿐, validate-plan Plan Quality 10차원에도 seam 차원 부재, ARCHITECTURE placeholder에 상태 모델 자리 자체가 없다("상태 모델" grep 0건). FAC↔AC(ADR-037)는 *커버리지*만 강제하고 invariant *도출*은 강제하지 않는다.

## 결정 — A. 플래닝 흐름 (1~7)
1. **마일스톤 생성 단일화**: 모든 마일스톤·feature 문서(M1 포함)는 `/plan-milestone`이 생성한다. `/bootstrap-project`는 charter/ARCHITECTURE/ADR-100까지만 담당하고 M1/F-001을 seed하지 않는다(ADR-051 D4의 "M2+" 한정과 ADR-007 lifecycle 표 2행의 M1/F-001 산출을 부분 supersede — 각 ADR에 표기). plan-milestone의 additive 원칙(기존 마일스톤 비파괴)은 불변 — "첫 호출 = M1 생성"이 정상 경로가 될 뿐.
2. **`/plan-workitem M<N>` 배치 분해 모드 (2-tier)**: 마일스톤 전체 feature를 한 세션에서 task로 분해한다.
   - *안정 tier(전 feature 완성)*: task 범위/비범위, `## 6` AC, `## 9` 의존성, feature `## 7-1` FAC↔AC 매핑, seam self-check(결정 9 — 마일스톤 전체 대상 1회). 코드가 변해도 낡지 않는 정보.
   - *가이드 tier*: `## 3. 구현 항목`의 현재상태-기반 단계 가이드는 **첫 구현 대상 feature만 full JIT** 작성. 나머지 feature의 task는 의도 수준 초안 + `## 3` 본문 첫 줄에 **HTML 주석 마커** `<!-- ## 3 상태: draft — 구현 직전 /plan-workitem F-NNN --refresh 필요 -->` (heading이 아닌 주석 — 문서 스키마 보존, grep 문자열 `## 3 상태: draft`는 동일).
   - **멱등(재개 안전)**: 이미 task 문서가 존재하는 feature는 skip하고 이어간다 — 배치 세션이 중간에 끊겨도 재실행이 안전하다.
   - **사이즈 가드**: feature 5+ 마일스톤은 배치를 2회로 분할 실행 권장(컨텍스트 소진으로 인한 부분 완료가 최빈 실패 모드).
   - 기존 `/plan-workitem F-NNN`(단일 feature full 분해)은 그대로 유지(마일스톤 중간 feature 추가 등).
3. **`--refresh F-NNN`**: 해당 feature task들의 `## 3`만 그 시점 실제 코드 기준으로 재접지(JIT read)하고 draft 마커를 제거한다. 협상·AC 재작성 없음(경량). repair 이력(`## 8. 메모`)과 승인 프로토타입 갱신을 반영.
4. **`Needs Plan Refresh` 하드스탑**: `/implement-workitem`은 task `## 3`에 draft 마커가 있으면 dispatch 전에 종료하고 `--refresh`를 안내한다(`Needs Plan Decision` 동형). refresh를 잊어도 stale 가이드로 구현하는 사고가 원천 차단된다.
5. **feature-완료 체크포인트**: `/finalize-workitem`이 status 갱신 후 sibling task를 회수해 해당 feature의 전 task가 done이면 출력에 Feature-완료 블록을 추가 — (a) FAC closure 요약(feature `## 7-1`의 각 매핑 AC가 최신 validation report에서 ✅인지; report 부재는 "확인 불가" degrade), (b) 다음 단계 제안(남은 미-refresh feature의 `--refresh`, 또는 `/stabilize-milestone M-N --feature F-NNN`). 텍스트 제안만 — disable-model-invocation 정책 불변.
6. **`/stabilize-milestone --feature F-NNN` 스코프**: preflight는 FAC unmapped만, graduation pre-check skip(졸업 판정은 milestone 전용임을 출력에 명시), validate 1회 + qa fan-out·3-P·§3-V(ADR-056)를 해당 feature 화면·시나리오 한정. QA_FINDINGS는 `## M-N` 아래 `### F-NNN` sub-label. read-only·실행 single-origin(ADR-054) 불변.
7. **plan-workitem 조망 echo**: 단일 feature 모드 출력에 "같은 milestone의 미분해 feature 목록"을 1줄 echo.

## 결정 — B. Cross-task seam 계약 (8~14)
8. **seam 신호 4종**: ① 분해 결과 2+ task가 동일 엔티티/저장소에 write ② 상태 머신 키워드(status/state/전이/승인/취소/만료/lifecycle) ③ 2차-write 키워드(cache/index/검색/알림/event/projection/webhook 발신) ④ 멱등 키워드(retry/webhook 수신/at-least-once/중복/재시도). **과발동 보정**: ①은 단독 발화, **②~④는 해당 키워드가 *복수 task에 걸쳐* 등장할 때만 발화**(단일 task 안에서 완결되는 상태 필드·알림 하나는 cross-task seam이 아님 — 평범한 CRUD에서 architect sub-call이 상시 발화하는 것 방지).
9. **plan-workitem seam self-check (신호 게이트)**: task 분해 직후 신호 감지 시에만 architect 단발 sub-call로 invariant 표를 도출해 feature `## 7-2. Cross-task invariant 계약`에 영속한다(형식: `INV-N | 보장(전이/멱등/2차-write/계약) | 관련 task:AC | 검증 방법`). 신호 미발화면 `(해당 없음 — seam 신호 미발화)` 한 줄 + skip 사유 echo. **배치 모드(결정 2)에서는 마일스톤 전체 task 집합 대상 1회** — cross-feature seam은 **관련 feature 중 낮은 번호 feature의 `## 7-2`에 canonical 기재**하고, 상대 feature `## 7-2`에는 참조 링크 1줄만 둔다(양쪽 본문 중복 금지 — ADR-005 SSOT; `--refresh`/repair-plan의 동기 대상이 1곳이 되도록).
10. **추적성**: task `## 3` 단계에 `(INV-N)` 태그 가능, task `## 7`에 `Feature-invariants:` 링크 줄(비해당 시 삭제 — Architecture-Iface 줄 규약과 동형). unmapped INV는 "남은 미결정 사항" surface(ADR-037 unmapped FAC 패턴).
11. **이중 잠금**: reviewer Plan Quality 10→**11차원** — `[Plan-seam]`(P1: 신호 해당 feature에서 §7-2 부재/형식 파손/task 간 계약 불일치 의심; 신호 미해당 시 skip+핵심 관찰 명시). validate-plan 차원 목록·카운트 표 동기.
12. **validator seam 축**: feature `## 7-2`가 존재하는 task 검증 시 — 본 task 구현이 관련 INV를 위반하는가 / INV가 테스트로 커버되는가. 미커버 시 P1. validate-workitem 조건부 spawn 축 목록에 "축 8(seam — feature §7-2 존재 시)" 추가.
13. **ARCH §4-1 상태 모델 placeholder**: 상태 머신이 있는 도메인 한정 조건부 자리(상태·전이·가드·멱등 요구 표) 신설. plan-milestone R2 architect 지시에 "feature 경계를 가로지르는 seam 후보 감지 시 feature §9/§10 + ARCH §4-1 기록 권장" 1줄(라운드 신설 X — YAGNI).
14. **staleness 방어**: repair-plan 회수·수정 대상에 feature `## 7-2` 포함(task 재분해 시 표 동기).

## 비결정 (No)
- **완전 full 일괄 분해(전 feature `## 3`까지 완성, stale 감수)** — 낡은 before/after는 terse 목록보다 위험(ADR-026#amend-2 도입 근거의 역전). refresh가 어차피 필요해져 이중 작업.
- stabilize-feature 별도 skill 신설 — stabilize-milestone 로직 복제로 SSOT 이중화 + roster 비용(YAGNI).
- plan-milestone 전용 seam 라운드(R2.5) — 그 시점엔 task가 없어 대조 대상 부재 + 전 마일스톤 비대화.
- 2-pass planning 전면 도입 — ADR-026 비결정 유지(seam self-check는 신호 발화 시의 좁은 축 단발이지 전체 재계획이 아님).

## Mutation Contract (ADR-047 D3)
1. Target — bootstrap-project(M1 seed 제거)/plan-milestone(모든 마일스톤 + R2 seam 1줄)/plan-workitem(배치·refresh·echo·seam self-check)/implement(하드스탑)/finalize(체크포인트)/stabilize(--feature)/FEATURE·TASK 템플릿(§7-2·draft 마커·INV 태그)/ARCH §4-1/reviewer·validate-plan 11차원/validator·validate-workitem seam 축/repair-plan + ADR-007 표·ADR-026#amend-3·ADR-051#amend-3 + WORKFLOW/DELEGATION/CHECKLIST/STRUCTURE/README.
2. Failure mode — feature마다 계획 세션 반복(시간 비효율, 관측됨) + cross-feature seam 사각 + 마일스톤 생성 2원화 + invariant 도출 단계 부재 + (배치 도입 시) stale 가이드 위험.
3. Predicted improvement — 계획 고정 오버헤드 1회화 + seam 전체 조망(마일스톤 1회 표) + M1도 라운드 협상으로 생성 + draft/refresh/하드스탑 3중으로 stale 사고 0건화.
4. Preserved invariants — ADR-026#amend-2의 "## 3은 실제 현재 상태 근거" 원칙(보장 시점을 구현 직전으로 이동) / plan-workitem·plan-milestone disable-model-invocation / additive(기존 마일스톤 비파괴) / 1 task = 1 RGR sizing / 자동 차단 X(결정 4 하드스탑 제외) / builder EXECUTE 전용(INV는 plan이 authoring) / 12 main section 구조(§7-2는 §7의 subsection — §7-1 선례).
5. Falsifying evaluation — 배치 세션 컨텍스트가 실사용에서 감당 불가하거나, draft task가 refresh 없이 구현되는 사례가 관측되면 배치 범위 재검토; seam 신호 과발동으로 소형 feature에 §7-2 남발 시 신호 재조정.
6. Rollback path — superseded → bootstrap-project M1 seed 복원 + 배치·refresh·하드스탑·체크포인트·§7-2·[Plan-seam]·seam 축·§4-1 제거(기존 문서 잔존 무해).

## Ratchet 강도 (ADR-022)
- 결정 4(하드스탑)만 constraint(강 — stale 가이드는 기계 실행 builder에 파괴적). 나머지 enabling(약). seam severity 기본 P1(실증 후 P0 승격 재검토).

## Surfaces
- .claude/skills/bootstrap-project/SKILL.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
- .claude/skills/finalize-workitem/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- .claude/skills/validate-plan/SKILL.md
- .claude/skills/validate-workitem/SKILL.md
- .claude/skills/repair-plan/SKILL.md
- .claude/agents/reviewer.md
- .claude/agents/validator.md
- docs/30-workitems/_templates/FEATURE_TEMPLATE.md
- docs/30-workitems/_templates/TASK_TEMPLATE.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md
- docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md
- docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/DELEGATION_STRATEGY.md
- docs/00-meta/STRUCTURE.md

> 적용 위치(Surfaces 아님 — ADR-045#d3): README.md/README_ko.md 예시 줄 + docs/00-meta/PROJECT_START_CHECKLIST.md 단계 갱신은 마이그레이션 적용 대상.

## 참고
- ADR-051(D4 부분 supersede — #amend-3 표기), ADR-026(#amend-2 원칙 유지 + #amend-3 draft 예외), ADR-007(표 갱신 + 텍스트 제안 규약 불변), ADR-050(model-invocable 범위 불변), ADR-056(R5·--prototype·§3-V와의 접점), ADR-037(FAC 커버리지 — seam은 invariant 도출로 보완), ADR-038(Plan Quality 차원 additive 확장), ADR-053(architect sub-call 패턴), ADR-014(graduation은 milestone 전용), ADR-006/ADR-022.
```

## 3-2. 동반 amendment 2건 + ADR-007 표 갱신

**ADR-026** 파일 끝에 추가:

```markdown
<a id="adr-026-amend-3"></a>
## Amendment 3 (2026-07-14) — 배치 분해의 `## 3` draft 예외 + refresh 계약
### 결정
#amend-2의 "`## 3`은 실제 현재 상태를 JIT로 읽어 작성" 원칙에 예외 1건: `/plan-workitem M<N>` 배치 모드([ADR-057](ADR-057-planning-v2-batch-and-seam.md) 결정 2)에서 *첫 구현 대상이 아닌* feature의 task는 `## 3`을 의도 수준 초안 + 본문 첫 줄 HTML 주석 마커 `<!-- ## 3 상태: draft — 구현 직전 /plan-workitem F-NNN --refresh 필요 -->`로 둘 수 있다(heading이 아닌 주석 — 문서 스키마 보존). 단 (a) 구현 진입은 `--refresh`(그 시점 JIT 재접지 + 마커 제거) 후에만 — implement가 draft 마커에 `Needs Plan Refresh`로 하드스탑, (b) AC·범위·의존성·FAC 매핑은 draft 대상이 아니다(배치 시점에 완성).
### 근거
- [관측됨] per-feature 계획 세션 반복의 시간 비효율. 원칙 자체(현재 상태 근거)는 보존 — 보장 시점을 "분해 시"에서 "구현 직전"으로 옮긴 것.
### 적용 surface
- docs/30-workitems/_templates/TASK_TEMPLATE.md (`## 3` 주석)
- .claude/skills/plan-workitem/SKILL.md
- .claude/skills/implement-workitem/SKILL.md
```

**ADR-051** 파일 끝(Amendment 2 뒤)에 추가:

```markdown
<a id="adr-051-amend-3"></a>
## Amendment 3 (2026-07-14) — D4 범위 갱신 (plan-milestone이 M1 포함 전 마일스톤 생성)
D4의 "milestone 단위 분해를 분리한 신규 skill" 정의는 유지하되, 그 범위가 [ADR-057](ADR-057-planning-v2-batch-and-seam.md) 결정 1로 확장된다 — plan-milestone은 M2+가 아니라 **M1 포함 전 마일스톤**을 생성하고, bootstrap-project의 M1/F-001 seed는 제거된다. plan-workitem의 feature→task 집중(D4 후단)은 ADR-057 결정 2의 배치 모드(M<N> 입력)로 보완된다(단일 feature 모드 유지).
```

**ADR-007** — `## 결정` 표의 2·3행 갱신:
현재 2행: `| 2 | bootstrap | `/bootstrap-project` | architect | DISCOVERY.md → charter/architecture/M1/F-001 |`
변경: `| 2 | bootstrap | `/bootstrap-project` | architect | DISCOVERY.md → charter/architecture/ADR-100 (M1/F-001 seed는 ADR-057로 제거 — plan 단계로 이동) |`
현재 3행: `| 3 | plan | `/plan-milestone`(M2+ milestone+feature) · `/plan-workitem`(feature→task) | ...`
변경: `| 3 | plan | `/plan-milestone`(모든 milestone+feature — M1 포함, ADR-057) · `/plan-workitem`(feature→task; `M<N>` 배치 모드 — ADR-057) | ...` (책임 경계 셀도 "milestone/feature 생성(plan-milestone — M1 포함) + task 분해(plan-workitem — 단일/배치)"로 갱신)

**+ 같은 파일 `## 현재 유효 결정` 요약(Stage 2에서 신설됨)의 lifecycle 줄도 동기 갱신**: "bootstrap은 charter/ARCH/ADR-100까지 — M1/F-001 seed는 ADR-057로 plan 이동" 반영(실행 규칙 10).

## 3-3. `.claude/skills/bootstrap-project/SKILL.md` — M1/F-001 seed 제거

1. **frontmatter description**: `Convert discovery output (DISCOVERY.md) or a natural-language brief into charter/architecture/M1/F-001. Re-run safe with update mode.` → `Convert discovery output (DISCOVERY.md) or a natural-language brief into charter/architecture/ADR-100. Milestones are created by /plan-milestone (ADR-057). Re-run safe with update mode.` (꼬리절 "Re-run safe..." 보존).
2. **"반드시 먼저 읽을 파일"**: MILESTONE_TEMPLATE·FEATURE_TEMPLATE 두 줄 삭제(더 이상 생성하지 않음).
3. **수행 2**: `기존 산출물(charter/architecture/M1/F-001) 존재 여부 점검.` → `기존 산출물(charter/architecture/ADR-100) 존재 여부 점검.`
4. **수행 6 교체**: "6. 최초 workitem 문서를 만든다. — M1-foundation.md / F-001-core-value.md" 항목 전체를 → `6. workitem 문서(milestone/feature)는 만들지 않는다 — 마일스톤 생성은 `/plan-milestone` 단일 경로다(ADR-057 결정 1). 종료 출력에서 안내한다.`
5. **마지막 출력 "다음 단계"** — 분기 옵션 갱신:
현재: `- 스택이 이미 brief/charter 에 명시됐고 /bootstrap-stack + /stack-guard 도 끝났다면: /plan-workitem F-001 — seed된 첫 feature(F-001)의 task 분해` / `- UI 프로젝트 + 스택 확정 후: /bootstrap-design 다음 /plan-workitem F-001`
변경: `- 스택이 이미 brief/charter 에 명시됐고 /bootstrap-stack + /stack-guard 도 끝났다면: /plan-milestone — 첫 마일스톤(M1)과 feature 문서를 라운드 협상으로 생성 (ADR-057)` / `- UI 프로젝트 + 스택 확정 후: /bootstrap-design 다음 /plan-milestone`

## 3-4. `.claude/skills/plan-milestone/SKILL.md` — "모든 마일스톤" 전환 + R2 seam 1줄

1. **frontmatter description**: `Run a multi-round main-session conversation to author the next milestone(s) (M2+) and their feature docs. Additive — does not re-seed M1; ...` → `Run a multi-round main-session conversation to author milestone(s) (M1 included — ADR-057) and their feature docs. Additive — never overwrites existing milestones; hand off to /plan-workitem for tasks.`
2. **도입부 :10-11**: `\`/bootstrap-project\`가 seed한 초기 M1/F-001 *이후*의 마일스톤을 다룬다` 문장을 → `**첫 마일스톤(M1) 포함 모든 마일스톤**을 다룬다(ADR-057 결정 1 — bootstrap-project는 charter/ARCH까지, 마일스톤 생성은 본 skill 단일 경로). **additive 모드**(기존 마일스톤을 재생성·덮어쓰기 하지 않는다)`로 교체. **같은 도입부 첫 문장(:10)의 `*다음* 마일스톤(M2+)과 그 feature 문서를 작성하는`도 `마일스톤(M1 포함)과 그 feature 문서를 작성하는`으로 정정**(잔재 "M2+" 프레이밍 제거).
3. **R0**: 현재 `직전 마일스톤 부재(첫 호출 — M1만 존재)면 R0를 건너뛰고 회고 carry-over는 "없음"으로 표시.` → `직전 마일스톤 부재(첫 호출 — 마일스톤 0개, M1 생성 회차)면 R0를 건너뛰고 회고 carry-over는 "없음"으로 표시.`
4. **R2** — architect 위임 문장 뒤에 추가: `architect 지시에 포함: "feature 경계를 가로지르는 상태 전이·2차-write·멱등 seam 후보가 보이면 각 feature 후보의 시나리오 메모와 ARCH §4-1(상태 모델) 기록 권장을 결론에 포함하라" (ADR-057 결정 13 — 라운드 신설 X).`
5. **R3**: `\`<N>\`은 기존 마일스톤 다음 번호(additive — M1 보존)` → `\`<N>\`은 기존 마일스톤 다음 번호(첫 호출이면 M1 — additive, 기존 보존)`.
6. **R4**: `(기존 F-001 다음 번호 — additive)` → `(기존 feature 다음 번호, 첫 호출이면 F-001 — additive)`.
7. **마지막 출력 "다음 단계" 기본 권장** —
현재: `- 기본 권장: 본 skill이 만든 각 feature마다 \`/plan-workitem F-NNN\` — feature를 task로 분해 ...`
변경: `- 기본 권장: \`/plan-workitem M<N>\` — 본 마일스톤 전체 feature를 배치 분해 (2-tier: AC·FAC·seam은 전부 확정, ## 3 상세 가이드는 첫 feature만 full — ADR-057). feature 1개만 분해하려면 \`/plan-workitem F-NNN\`.`

## 3-5. `.claude/skills/plan-workitem/SKILL.md` — 배치 모드 + `--refresh` + 조망 echo + seam self-check

1. **frontmatter**: `argument-hint: "[feature id]"` → `argument-hint: "[feature id | milestone id] [--refresh]"`. description 끝에 ` M<N> 입력 시 마일스톤 배치 분해(2-tier — ADR-057).` 추가.
2. **입력 단락** — 기존 feature-id 설명과 Stage 2가 넣은 "경험 계약 입구 점검" 항목 **뒤에** 추가(삽입 순서 고정 — 같은 앵커에 두 Stage가 삽입):

```markdown
- **`M<N>` 입력 — 마일스톤 배치 분해 모드 (ADR-057 결정 2)**: 본 마일스톤 `## 3. 포함되는 기능`의 모든 feature를 한 세션에서 분해한다.
  - *안정 tier (전 feature 완성)*: 각 task의 범위/비범위·`## 6` AC·`## 9` 의존성·feature `## 7-1` FAC↔AC 매핑·cross-task seam self-check(ADR-057 결정 9 — **마일스톤 전체 task 집합 대상 1회**, cross-feature seam 포함).
  - *가이드 tier*: `## 3` 단계별 가이드는 **첫 구현 대상 feature(의존성상 최선두)만** 3-G full JIT로 작성. 나머지 feature의 task는 의도 수준 초안만 적고 `## 3` 본문 첫 줄에 HTML 주석 마커 `<!-- ## 3 상태: draft — 구현 직전 /plan-workitem F-NNN --refresh 필요 -->`를 박는다(heading 아님 — 스키마 보존, ADR-026#amend-3). AC 해석 확정(9-1)·경험 계약 입구 점검(ADR-056)은 배치 시점에 전 feature 수행.
  - **멱등**: 이미 task 문서가 존재하는 feature는 skip — 배치 재실행 안전. **사이즈 가드**: feature 5+면 2회 분할 실행 권장.
  - 경험 계약 입구 점검은 마일스톤 내 *모든 UI 확정 feature*에 대해 1회 일괄 수행 — 하나라도 미충족이면 그 feature만 보류 목록으로 출력하고 나머지는 진행(전체 차단 X — ADR-056 결정 3의 배치 단서).
- **`F-NNN --refresh` — 가이드 재접지 모드 (ADR-057 결정 3)**: 해당 feature task들의 `## 3`만 그 시점 실제 코드 기준으로 3-G 재작성하고 draft 마커를 제거한다. AC·범위·매핑은 손대지 않는다(변경이 필요해 보이면 "남은 미결정 사항"에 surface — 자동 수정 X). `## 8. 메모`의 repair 이력과 승인 프로토타입 갱신(`--prototype` 재승인)을 반영 입력으로 읽는다.
```

3. **seam self-check 단락** — "## 정합성 self-check" 섹션 안(Task type prefilter 앞)에 추가:

```markdown
### Cross-task seam self-check (신호 게이트 — ADR-057 결정 8~10)
분해 직후 1회: 분해된 task 집합에서 seam 신호 4종(① 2+ task 동일 엔티티/저장소 write ② 상태 머신 키워드 ③ 2차-write 키워드(cache/index/알림/event/projection) ④ 멱등 키워드(retry/webhook/중복))을 점검한다.
- **발화 시**: architect 단발 sub-call로 cross-task invariant 표를 도출해 feature `## 7-2`에 영속(양식 SSOT는 FEATURE_TEMPLATE 주석). task `## 3` 관련 단계에 `(INV-N)` 태그, task `## 7`에 `Feature-invariants:` 링크. unmapped INV는 "남은 미결정 사항"에 surface. 출력엔 `seam: INV N건 / unmapped K건` 요약만(전체 표 echo 금지 — ADR-046).
- **미발화 시**: feature `## 7-2`에 "(해당 없음 — seam 신호 미발화)" 기입 + skip 사유 echo.
- 신호 ①(2+ task 동일 엔티티/저장소 write)은 단독 발화, **②~④는 복수 task에 걸쳐 등장할 때만 발화**(ADR-057 결정 8 과발동 보정).
- **배치 모드(M<N>)에서는 마일스톤 전체 task 집합 대상 1회 수행** — cross-feature invariant는 **낮은 번호 feature `## 7-2`에 canonical 기재 + 상대 feature `## 7-2`엔 참조 링크 1줄**(ADR-005 SSOT — 양쪽 본문 중복 금지).
- Codex: architect sub-call은 순차 단일 실행 degrade(기존 규약).
```

4. **마지막 출력** — 목록에 항목 추가:
`- (단일 feature 모드) 같은 milestone의 미분해 feature 목록 — 다음 \`/plan-workitem\` 대상 (ADR-057 결정 7)` / `- (배치 모드) feature별 ## 3 상태 요약: full N개 / draft M개 (draft는 구현 직전 --refresh)` / `- seam: INV N건 / unmapped K건 (또는 "신호 미발화 — skip")`

## 3-6. `.claude/skills/implement-workitem/SKILL.md` — `Needs Plan Refresh` 하드스탑

"반드시 먼저 할 일" 3번(AC·`## 3` 회수) 뒤에 항목 삽입:

```markdown
3-R. **draft 가이드 하드스탑 (ADR-057 결정 4 / ADR-026#amend-3)**: task `## 3`에 `## 3 상태: draft` 문자열(HTML 주석 마커 내)이 있으면 **분할·dispatch를 시작하지 않고 `Needs Plan Refresh`로 즉시 종료**한다 — `/plan-workitem F-NNN --refresh` 실행을 안내(배치 분해된 가이드는 앞 feature 구현으로 낡았을 수 있다 — 낡은 before/after는 기계 실행 builder에 파괴적).
```

## 3-7. `.claude/skills/finalize-workitem/SKILL.md` — feature-완료 체크포인트

"마지막 출력" 목록 앞에 수행 항목 추가:

```markdown
9. **feature-완료 감지 (ADR-057 결정 5)**: step 4에서 done으로 갱신한 각 task의 `## 7. 관련 문서` Feature 링크로 같은 feature를 참조하는 sibling task 문서를 Glob/Grep 회수한다. 전원 `## 0. Status: done`이면 마지막 출력에 **Feature-완료 블록**을 추가한다(본 블록은 ADR-046 압축 대상 아님 — 전량 보존):
   - FAC closure 요약: feature `## 7-1` 매핑표의 각 `T-NNN:AC-N`이 `docs/40-validation/reports/<task-id>.md`에서 ✅인지 (report 부재 task는 "확인 불가 — report checkout-local" degrade).
   - 다음 단계 제안(텍스트만): 미-refresh feature 있으면 `/plan-workitem F-next --refresh`, FAC 시나리오 통합 확인 원하면 `/stabilize-milestone M-N --feature F-NNN`, 마일스톤 마지막 feature면 `/stabilize-milestone M-N`.
   - Feature 링크 부재 시 "feature 소속 불명 — task `## 7` 링크 보강 권장" 1줄만.
```

## 3-8. `.claude/skills/stabilize-milestone/SKILL.md` — `--feature` 스코프

**(1) frontmatter**: `argument-hint: "[milestone id] [--dry-run]"` → `"[milestone id] [--dry-run | --feature F-NNN]"`.

**(2) 입력 단락**에 추가:

```markdown
- `--feature F-NNN` 플래그(ADR-057 결정 6): **feature 스코프 점검** — §1.0 preflight는 항목 3(FAC unmapped)만, §1.5 graduation pre-check는 skip(**졸업 판정은 milestone 전용** — 출력에 "본 실행은 졸업 판정이 아님"을 명시), 단계 3 validate 1회 + 3-P/3-V(ADR-056)/단계 4 qa fan-out을 해당 feature의 화면·시나리오 한정, 단계 5(reviewer)·6·6.5·7-T는 skip. **milestone 문서 `## 8. 회고` 자동 채움도 skip**(회고는 milestone 전체 stabilize 전용 — 중간 상태 덮어쓰기 방지). QA_FINDINGS 기록은 `## M-N` 헤더 아래 `### F-NNN` sub-label. read-only·실행 single-origin(ADR-054) 불변.
```

## 3-9. 템플릿 3곳 + ARCH §4-1

**`docs/30-workitems/_templates/TASK_TEMPLATE.md`** — ⚠ 본 파일은 커밋 2·3에 걸치므로 **두 번에 나눠 편집**한다(실행 규칙 9):
- **(커밋 2에서)** `## 3` 주석 끝에 추가: `배치 분해(ADR-057)된 뒤 feature의 task는 본 섹션이 의도 수준 초안 + 본문 첫 줄 HTML 주석 마커 "<!-- ## 3 상태: draft — 구현 직전 /plan-workitem F-NNN --refresh 필요 -->"일 수 있다 — implement는 draft 마커에서 Needs Plan Refresh로 정지한다(ADR-026#amend-3).`
- **(커밋 3에서)** `## 3` 주석 끝에 추가: `단계가 feature ## 7-2의 invariant를 집행하면 끝에 (INV-N) 태그를 붙일 수 있다 (ADR-057).`
- **(커밋 3에서)** `## 7. 관련 문서` 목록의 Feature 줄 뒤에 추가: `- Feature-invariants: <!-- feature ## 7-2가 채워진 경우만. 예: [F-001 ## 7-2](../features/F-001-core-value.md). 비해당 시 줄 삭제. 정책: ADR-057. -->`

**`docs/30-workitems/_templates/FEATURE_TEMPLATE.md`** — `## 7-1. FAC ↔ AC 매핑표` 섹션 뒤에 추가:

```markdown
## 7-2. Cross-task invariant 계약 (subsection of ## 7)
<!-- seam 신호(2+ task 동일 엔티티 write / 상태 머신 / 2차-write / 멱등 — ADR-057 결정 8) 발화 시에만 /plan-workitem이 채운다.
     미발화 시 "(해당 없음 — seam 신호 미발화)" 한 줄.
     형식: INV-N | 보장 (상태 전이 / 멱등 / 2차-write 재검증 / task 간 계약) | 관련 task:AC | 검증 방법
     예: INV-1 | 주문 상태는 draft→paid→shipped 단방향 — 어떤 task도 역방향 write 금지 | T-003:AC-2, T-005:AC-1 | 상태 전이 가드 단위 테스트
     unmapped INV는 plan 출력 "남은 미결정 사항"에 surface. validator가 task 검증 시 위반·테스트 커버를 점검. -->
```

**`docs/20-system/ARCHITECTURE_OVERVIEW.md`** — `## 4. 주요 도메인 모델` 섹션 뒤에 추가:

```markdown
## 4-1. 상태 모델 (조건부)
<!-- 상태 머신이 있는 도메인에서만 채운다 (없으면 비워둠 — ADR-057).
     기재: 엔티티별 상태·전이(단방향/가드 조건)·멱등 요구(재시도 시 보장)·2차-write 목록(본 상태 변경이 갱신해야 하는 파생 저장소 — cache/index/알림).
     /plan-workitem seam self-check와 feature ## 7-2가 본 섹션을 참조한다. -->
```

## 3-10. 리뷰·검증 축 확장

**`.claude/agents/reviewer.md`** — 카운트 언급 **전수** 갱신(제목만 바꾸면 자기모순):
- 섹션 제목 `## Plan Quality 10 차원 (plan surface 전용 — ADR-038 + ADR-027#amend-1)` → `## Plan Quality 11 차원 (plan surface 전용 — ADR-038 + ADR-027#amend-1 + ADR-057)`.
- "호출 surface 명시" 목록의 `` `plan`: Plan Quality 10 `` → `11`.
- Milestone-Plan Quality 섹션의 `"하위 task가 0건이면 위 10차원 중"` → `11차원 중` + `[Plan-seam]도 비활성(task 산물 부재)` 추가, 그리고 `"task 1건+면 Plan Quality 10 차원."` → `11 차원`.
- 10번 [Plan-arch-iface] 뒤에 추가:

```markdown
11. **[Plan-seam]** (ADR-057 결정 11 — seam 신호 해당 feature 한정) — 신호 4종(2+ writer/상태 머신/2차-write/멱등) 해당인데 feature `## 7-2` 부재·형식 파손 / task 간 입출력 계약 불일치 의심 / INV가 어떤 task AC에도 안 걸림. **신호 미해당 시 skip + "핵심 관찰"에 명시.** (P1 권장)
```

**`.claude/skills/validate-plan/SKILL.md`** — 카운트 언급 **전수** 갱신:
- "검토 차원 (10 dimensions — reviewer.md의 *Plan Quality 10 차원* 정합 ...)" → 괄호 안 **두 카운트 모두** `11`로 + 10번 뒤에 reviewer와 동일한 11번 [Plan-seam] 항목 추가(신호 미해당 skip 명시).
- milestone-plan mode 단락의 `"task가 1건+면 기존 10차원."` → `11차원`.
- 카운트 표에 `| Plan-seam | 0 | 0 | 0 |` 행 추가(Plan-arch-iface 행 뒤).
- milestone-plan mode 게이팅 단락에 `[Plan-seam]은 task 0건이면 비활성` 1줄 추가.

**`.claude/agents/validator.md`** — 인터페이스 CHECK 목록(FAC 매핑 bullet 앞)에 추가:
`- seam (feature \`## 7-2\` 존재 시): 본 task 구현이 관련 INV-N을 위반하는가(예: 상태 역방향 write, 멱등 미보장, 2차-write 누락)? INV가 테스트로 커버되는가? 위반·미커버 시 \`P1 [Seam] INV-N — <증상>\` (ADR-057 결정 12).`

**`.claude/skills/validate-workitem/SKILL.md`** — 0단계 축 목록 7번 뒤에 추가: `8. Cross-task seam 축 (feature \`## 7-2\`가 실재하고 "(해당 없음)"이 아닐 때만 spawn — ADR-057 결정 12)`. "신호 기반 조건부 spawn" 문장의 축 나열에 `8 = feature ## 7-2 실재`를 추가. (Stage 0B의 `## Orchestration` 섹션이 축 8의 spawn/skip도 자동 기록 — 별도 작업 불요.)

**`.claude/skills/repair-plan/SKILL.md`** — 수행 5(Adopt 적용) 문장의 양식 정합 점검 나열 끝에 추가: `feature \`## 7-2\` invariant 표 갱신(task 재분해로 INV의 관련 task:AC가 바뀌면 동기 — ADR-057 결정 14)`.

## 3-11. 메타 문서·README 갱신

**`docs/00-meta/WORKFLOW.md`**:
- §3 첫 항목 앞에 추가: `- 마일스톤·feature 문서는 첫 마일스톤(M1)부터 `/plan-milestone`이 만든다(ADR-057 — bootstrap-project는 charter/architecture까지).`
- §3의 **"실제 구현 단위 문서를 `docs/30-workitems/tasks`에 만든다." 항목** 바로 뒤에 추가(2-11이 목록 끝에 넣은 UI 항목과 혼동 금지): `배치 분해는 \`/plan-workitem M<N>\`(2-tier + --refresh — ADR-057), 단일 feature는 \`/plan-workitem F-NNN\`.`

**`docs/00-meta/DELEGATION_STRATEGY.md`** — "스킬 실행 순서 가이드":
- 1번: `\`/bootstrap-project\` → charter + architecture + 초기 workitem 생성` → `\`/bootstrap-project\` → charter + architecture + ADR-100 (workitem 생성 X — ADR-057)`
- 3번: `\`/plan-milestone\` → (M2+) milestone + feature 문서 생성 / \`/plan-workitem F-NNN\` → 기존 feature를 task로 분해` → `\`/plan-milestone\` → (M1 포함) milestone + feature 문서 생성 (+UI: R5 프로토타입 라운드) / \`/plan-workitem M<N>\` → 마일스톤 배치 task 분해 (또는 \`F-NNN\` 단일; 구현 직전 \`--refresh\`)`
- 7번(finalize) 설명 끝에 `+ feature 전 task done 시 FAC closure 요약(ADR-057 결정 5)` 추가.
- 8번 앞에 항목 추가: `7.5. feature의 모든 task가 done이면 finalize가 FAC closure를 요약하고 다음 feature refresh 또는 \`/stabilize-milestone M-N --feature F-NNN\`을 제안한다 (ADR-057).`

**`docs/00-meta/PROJECT_START_CHECKLIST.md`**:
- 1단계 마지막 체크 항목: `- [ ] 첫 milestone/feature 문서가 생성되었다` → 체크박스가 아닌 참고 줄로 교체: `- (참고) 마일스톤 문서는 이 시점엔 아직 없음이 정상 — 4단계에서 /plan-milestone으로 생성한다 (ADR-057)`
- 4단계 첫 항목: `- [ ] \`/plan-workitem F-NNN\`로 seed된 feature(F-001)를 task로 분해했다 (M2+ 신규 milestone·feature 생성은 \`/plan-milestone\`)`와 그 예시 코드블록(`/plan-workitem F-001`)을 다음 **두 체크 항목**으로 교체한다(둘째 항목의 예시 코드블록 내용은 `/plan-workitem M1` 한 줄):
  - `- [ ] \`/plan-milestone\`으로 첫 마일스톤(M1)과 feature 문서를 생성했다 (UI 마일스톤이면 R5 프로토타입 라운드까지)`
  - `- [ ] \`/plan-workitem M1\`로 M1 전체 feature를 배치 분해했다 (또는 \`/plan-workitem F-001\` 단일)` + 기존과 동일한 형태의 예시 코드블록(`/plan-workitem M1`)
- 4단계의 status 전환 항목: `bootstrap 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md / M1 / F-001의 ...` → `bootstrap·plan 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md / M1 / F-NNN의 ...`

**`docs/00-meta/STRUCTURE.md`** 산출물 표:
- milestone 행: `생성 주체: \`/bootstrap-project\`, \`/plan-milestone\`` → `\`/plan-milestone\` (M1 포함 — ADR-057)`
- feature 행: `\`/bootstrap-project\`, \`/plan-milestone\`, \`/plan-workitem\`` → `\`/plan-milestone\` (생성), \`/plan-workitem\`(`## 7-1` AC측·`## 7-2` seam 표 채움)`

**`README.md` / `README_ko.md`** — M1 seed 제거로 낡는 서술 **전수 갱신**(예시 한 줄만 바꾸면 소개문·흐름도가 구체제로 남음):
- "In short" 소개문의 `get charter, architecture, and initial workitems in one shot` → `get charter and architecture in one shot, then /plan-milestone creates milestones/features`(한국어판 대응 문구 동일).
- **Overall Flow 다이어그램**: `→ /bootstrap-design (...) → /plan-workitem` 구간을 `→ /bootstrap-design (...) → /plan-milestone (+UI: R5 prototype round) → /plan-workitem M1 (batch)`로 교체.
- discover-product 설명 문장의 `which /bootstrap-project then converts into charter/architecture/initial workitems` → `... into charter/architecture`(initial workitems 삭제).
- Quick Start 단계·Codex 예시 줄의 `$plan-workitem F-001` → `$plan-workitem M1`.
- 마무리로 `grep -n "initial workitem" README.md README_ko.md` 실행해 잔존 0건 확인.

**`docs/10-charter/_templates/DISCOVERY_TEMPLATE.md`** — §15 Insight Backlog 주석의 `plan-workitem이 feature/task 생성 시 본 ID를 연결한다` → `plan-milestone(feature)·plan-workitem(task)이 생성 시 본 ID를 연결한다`(구 lifecycle 잔재 정정 — [관측됨] ADR-051 refocus 이후 낡은 서술).

## 3-12. ADR 인덱스 갱신

**ADR-057 행 추가**(`| 057 | Planning v2 (unification + batch + seam) | accepted | — | M1 포함 생성 통일 + 배치 분해(2-tier/refresh) + feature 체크포인트 + seam 계약 |`) + ADR-026 행 Amendments에 `+#amend-3: 배치 draft 예외 + refresh`, ADR-051 행에 `+#amend-3: D4 범위 갱신(M1 통일)` 추가.

## 3-커밋 (3회)

**커밋 1** — ADR + 생성 통일 (대상: `docs/90-decisions/boilerplate/ADR-057-*.md`, `ADR-007-*.md`, `ADR-051-*.md`, `.claude/skills/bootstrap-project/SKILL.md`, `.claude/skills/plan-milestone/SKILL.md`, `docs/00-meta/{WORKFLOW,DELEGATION_STRATEGY,PROJECT_START_CHECKLIST,STRUCTURE}.md`, `docs/10-charter/_templates/DISCOVERY_TEMPLATE.md`(3-11 §15 정정), `README.md`, `README_ko.md`, `docs/90-decisions/boilerplate/README.md`):

```
feat(planning): unify all milestone creation under plan-milestone, drop bootstrap M1 seeding (ADR-057)
```

**커밋 2** — 배치 분해 + 체크포인트 (대상: `docs/90-decisions/boilerplate/ADR-026-*.md`, `.claude/skills/plan-workitem/SKILL.md`(배치·refresh·echo), `.claude/skills/implement-workitem/SKILL.md`, `.claude/skills/finalize-workitem/SKILL.md`, `.claude/skills/stabilize-milestone/SKILL.md`, `docs/30-workitems/_templates/TASK_TEMPLATE.md`(draft 마커 주석)):

```
feat(planning): milestone batch decomposition with draft/refresh gate and feature checkpoint (ADR-057)
```

**커밋 3** — seam 계약 (대상: `docs/30-workitems/_templates/FEATURE_TEMPLATE.md`, `docs/30-workitems/_templates/TASK_TEMPLATE.md`(INV 태그·##7 줄), `.claude/skills/plan-workitem/SKILL.md`(seam self-check), `docs/20-system/ARCHITECTURE_OVERVIEW.md`, `.claude/agents/reviewer.md`, `.claude/skills/validate-plan/SKILL.md`, `.claude/agents/validator.md`, `.claude/skills/validate-workitem/SKILL.md`, `.claude/skills/repair-plan/SKILL.md`):

```
feat(planning): signal-gated cross-task seam contract with invariant table and review axes (ADR-057)
```

---

# Stage 4 — ADR 작성 거버넌스 (ADR-000 Amendment 2)

목적: "제안은 많은데 작성 책임자가 불명확 + 후보 회수 경로 단절 2곳"을 해소. ADR 작성 정책의 주인은 문자 그대로 **ADR-000(decision policy)**이므로 신규 ADR 없이 ADR-000 Amendment 2가 트리거 표를 담는다.

## 4-1. ADR-000 Amendment 2 (정책 본문)

`docs/90-decisions/boilerplate/ADR-000-boilerplate-decision-policy.md` 파일 끝(Amendment 1 뒤)에 추가:

```markdown
<a id="adr-000-amend-2"></a>
## Amendment 2 (2026-07-14) — project ADR 작성 트리거 표 + [ADR-candidate] 회수 경로

### 배경
- [관측됨] project ADR(100+)의 작성 주체·시점이 초기 결정(ADR-100/101)과 T2 스택 변경(--migrate)에만 명확하고, mid-project 결정은 무규정("필요하면"/"(해당 시)"/"등"). 후보 회수 경로 단절 2곳: (a) stabilize step 6의 "ADR 후보 제안"은 영속 위치 미명시 — 대화 텍스트로 증발 가능, (b) validator의 "ADR 후보 표시"는 gitignore된 ephemeral report에 기록 후 삭제됨.

### 결정
1. **ADR 작성 트리거 표 (본 amendment가 SSOT — DELEGATION_STRATEGY에 요약 게시)**:

| 신호 | 작성 주체 | 시점 |
|---|---|---|
| 프로젝트 초기 결정 | `/bootstrap-project` (ADR-100) · `/bootstrap-stack` (ADR-101) | 실행 즉시 (현행 명문화) |
| T2 스택 변경 | `/bootstrap-stack --migrate` (ADR-1NN supersede) | 계약 시점 즉시 (현행 — ADR-055) |
| 고-stakes 설계 결정 (ADR-053 게이트 발동) | 그 라운드를 운전한 skill(bootstrap-project / plan-milestone / bootstrap-stack)이 architect sub-call로 초안 | **결정 확정 시점** (ARCH §7 결정 블록과 병행) |
| stabilize/validator의 ADR 후보 | IMPROVEMENT_GUIDE `P2 [ADR-candidate]` 영속 → **다음 `/plan-milestone` R0가 회수**, 사용자 채택 시 architect sub-call로 ADR-1NN 작성 + 인덱스 등재 | 다음 plan 라운드 |
| MCP 연결 등 수동 결정 | 사용자 수동 | 현행 |

2. **`[ADR-candidate]` 라벨 규약**: stabilize step 6은 후보를 IMPROVEMENT_GUIDE **항목 스키마(필수 4필드 `ID | severity | evidence | linked workitem` — 본문 `## 항목 스키마` SSOT)** 로 영속한다. 형식(2줄 — 4필드 헤더 + 하위 라벨 줄):
   `- **M<N>-adrc-<K>** | P2 | [관측됨] | linked: M-N | status: open`
   `  - [ADR-candidate] <결정 한 줄> — 회수: 다음 /plan-milestone R0`
라벨 기록 전 _ADR_GUIDE의 ADR 대상 기준(되돌리기 어려움/대안 2+/큰 범위) self-check(남발 방지). **후보 ≠ 자동 작성** — 채택은 plan 라운드에서 사용자 결정. **validator의 "ADR 후보 표시"는 별도 영속 채널을 만들지 않는다** — 후보 표시는 P1 finding(`[Arch-iface-7-N]` 등)에 실려 repair-workitem이 task `## 8. 메모`로 영속하는 기존 경로를 타며, *P2-only 후보의 report 소멸은 수용 잔여 gap*으로 명시한다(배경 (b)의 부분 해소 — 완전 봉합 아님).
3. **ADR-053 ④ "(해당 시) ADR" 판정 기준** (ADR-053#amend-1 동반): ARCH §7 결정 블록으로 부족한 경우 = 비-스택 프로세스/제품 범위/보안 결정, boilerplate ADR supersede, 여러 마일스톤에 걸친 재검토 트리거가 필요한 결정.
4. **품질 계약**: 작성 주체는 _ADR_GUIDE 권장 섹션을 self-check(필독 로드). preflight는 참조 유효성만 유지(본문 품질 heuristic 신설 X — `/review-doc` on-demand 재사용, YAGNI).

### 비결정 (No)
- `/draft-adr` 전용 skill — 문제의 본질은 스킬 부재가 아니라 호출 무규정. `[ADR-candidate]` 미회수가 2+ 마일스톤 반복 관측되면 재검토.
- stabilize/validator의 직접 ADR 작성 — read-only·판정 전용 계약 위반 + proposed ADR 남발 위험.

### Mutation Contract (ADR-047 D3, 압축)
- Target: stabilize step 6/8, plan-milestone R0, DELEGATION 트리거 표, WORKFLOW §6, STRUCTURE :49, _ADR_GUIDE 1줄, ADR-053#amend-1.
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
```

## 4-2. ADR-053 Amendment 1

`docs/90-decisions/boilerplate/ADR-053-high-stakes-design-panel.md` 파일 끝에 추가:

```markdown
<a id="adr-053-amend-1"></a>
## Amendment 1 (2026-07-14) — ④ "(해당 시) ADR"의 판정 기준·작성 주체 구체화
결정 2의 ④ "(해당 시) ADR"은 [ADR-000 Amendment 2](ADR-000-boilerplate-decision-policy.md#adr-000-amend-2) 결정 3의 판정 기준(비-스택 프로세스/제품 범위/보안 결정 · boilerplate supersede · cross-마일스톤 재검토 트리거 필요)을 따르고, 작성 주체·시점은 그 트리거 표(그 라운드를 운전한 skill이 결정 확정 시점에 architect sub-call로 초안)가 SSOT다.
```

## 4-3. `.claude/skills/stabilize-milestone/SKILL.md` — step 6 영속 + step 8 출력

**(1) step 6** —
현재: `6. 미흡한 ADR 후보 제안 — 마일스톤 중에 내려진 결정인데 ADR이 없는 것을 식별. ADR 후보 기준에 "layer 경계·의존성 규칙 변경"도 포함(ADR-006 정책).`
변경: `6. 미흡한 ADR 후보 제안 — 마일스톤 중에 내려진 결정인데 ADR이 없는 것을 식별하고, **IMPROVEMENT_GUIDE 항목 스키마(필수 4필드)로 영속 기록**한다: \`- **M<N>-adrc-<K>** | P2 | [관측됨] | linked: M-N | status: open\` + 하위 줄 \`- [ADR-candidate] <결정 한 줄> — 회수: 다음 /plan-milestone R0\` (ADR-000#amend-2 — 기록 전 _ADR_GUIDE의 ADR 대상 기준 self-check, 남발 방지. 후보 ≠ 자동 작성). ADR 후보 기준에 "layer 경계·의존성 규칙 변경"도 포함(ADR-006 정책).`

**(2) step 8 최종 출력** — "architect 호출 권장 (있으면)" 항목 뒤에 추가: `- ADR 후보 (있으면): \`[ADR-candidate]\` 라벨 목록 — 다음 /plan-milestone R0가 회수 (ADR-000#amend-2)`

## 4-4. `.claude/skills/plan-milestone/SKILL.md` — R0 회수

R0의 IMPROVEMENT_GUIDE 회수 문장 끝에 추가:
`\`[ADR-candidate]\` 라벨 항목은 별도로 surface하고, 사용자가 채택하면 **R3 진입 전에 architect 단발 sub-call로 \`docs/90-decisions/project/ADR-1NN-<slug>.md\` 초안(proposed) 작성 + project 인덱스 등재**까지 수행한다(ADR-000#amend-2 — 기각 시 IMPROVEMENT_GUIDE status만 갱신 제안).`

## 4-5. 메타 문서 4곳

**`docs/00-meta/DELEGATION_STRATEGY.md`** — "Mid-project 문서 갱신 동선" 섹션 끝(표 아래 `> 주:` 노트 **뒤**)에 추가:

```markdown
## ADR 작성 트리거 (ADR-000#amend-2 SSOT — 요약 게시)

| 신호 | 작성 주체 | 시점 |
|---|---|---|
| 초기 결정 | /bootstrap-project (ADR-100) · /bootstrap-stack (ADR-101) | 즉시 |
| T2 스택 변경 | /bootstrap-stack --migrate (ADR-1NN) | 계약 시점 |
| 고-stakes 설계 (ADR-053 게이트) | 라운드 운전 skill → architect sub-call 초안 | 결정 확정 시점 |
| stabilize/validator ADR 후보 | IMPROVEMENT_GUIDE `[ADR-candidate]` → 다음 /plan-milestone R0 회수·작성 | 다음 plan 라운드 |
| 수동 결정 (MCP 등) | 사용자 | — |
```

**`docs/00-meta/WORKFLOW.md` §6** —
현재: `- 중요한 기술적 선택은 \`docs/90-decisions\`에 ADR로 남긴다.`
변경: `- 중요한 기술적 선택은 \`docs/90-decisions\`에 ADR로 남긴다. **작성 주체·시점은 [DELEGATION_STRATEGY의 ADR 작성 트리거 표](DELEGATION_STRATEGY.md)(정책 SSOT: ADR-000#amend-2)를 따른다.**`

**`docs/00-meta/STRUCTURE.md`** — 산출물 표 ADR(project) 행:
현재: `생성 주체: architect, \`/bootstrap-project\` 등`
변경: `생성 주체: \`/bootstrap-project\`(ADR-100) · \`/bootstrap-stack\`(ADR-101·--migrate ADR-1NN) · \`/plan-milestone\` R0([ADR-candidate] 회수) · architect(초안 sub-call) — 트리거 표: ADR-000#amend-2`

**`docs/90-decisions/boilerplate/_ADR_GUIDE.md`** — "새 ADR 추가 절차" 섹션에 1줄 추가: `- 작성 주체·시점: DELEGATION_STRATEGY의 ADR 작성 트리거 표(ADR-000#amend-2)를 따른다.`

## 4-6. ADR 인덱스 갱신

ADR-000 행 Amendments에 `+#amend-2: ADR 작성 트리거 표 + [ADR-candidate]`, ADR-053 행에 `+#amend-1: ④ ADR 판정 기준` 추가. (신규 ADR 행 없음.)

## 4-커밋

대상 파일: `docs/90-decisions/boilerplate/ADR-000-*.md`, `ADR-053-*.md`, `.claude/skills/stabilize-milestone/SKILL.md`, `.claude/skills/plan-milestone/SKILL.md`, `docs/00-meta/DELEGATION_STRATEGY.md`, `docs/00-meta/WORKFLOW.md`, `docs/00-meta/STRUCTURE.md`, `docs/90-decisions/boilerplate/_ADR_GUIDE.md`, `docs/90-decisions/boilerplate/README.md`

```
feat(governance): ADR authoring trigger table and candidate recovery loop (ADR-000 amend 2)
```

---

# Stage 5 — 최종 cross-surface 정합 검증

목적: 여러 Stage가 같은 파일을 순차 편집했으므로 마지막에 전체 정합을 기계적으로 검증한다. 발견된 불일치는 이 Stage에서 수정하고 잔여 sync 커밋 1회.

체크리스트 (전부 수행):

1. **Skill 로스터**: `.claude/skills/` 디렉터리 목록(21종 — 이번 라운드에 skill 신설 없음) ↔ `docs/00-meta/STRUCTURE.md`의 "Claude skill 본문" 행 괄호 목록 일치 확인.
2. **Agent 로스터**: `.claude/agents/` 8종(designer 포함) ↔ STRUCTURE.md "Claude sub-agent" 행 ↔ DELEGATION_STRATEGY 위임 표에 designer 행 존재.
3. **Codex wrapper 집합**: `.agents/skills/` 16종 ↔ README.md/README_ko.md wrapper 목록 16종 ↔ 자연어 목록 5종. 검증식: `(.claude/skills 집합) − (.agents/skills 집합) == README 자연어 목록`.
4. **ADR 인덱스**: `docs/90-decisions/boilerplate/README.md`에 **056·057 신규 2행** 존재 + 이번에 amend된 ADR(000/007/010/026/027/040/042/044/049/051/053/054) 행의 Amendments 컬럼이 본문 `## Amendment N` 수와 일치 + **ADR-007에 `## 현재 유효 결정` 요약 신설·ADR-027 요약에 §10 반영 확인**(ADR-045 D5 — Stage 2·1B 지시).
5. **anchor 유효성**: 새로 인용된 anchor들이 실재하는지 grep — `adr-000-amend-2`, `adr-007-amend-5`, `adr-010-amend-4`, `adr-026-amend-3`, `adr-027-amend-5`, `adr-027-amend-6`, `adr-040-amend-4`, `adr-042-amend-1`, `adr-044-amend-1`, `adr-049-amend-2`, `adr-051-amend-2`, `adr-051-amend-3`, `adr-053-amend-1`, `adr-054-amend-1`.
6. **깨진 참조 스캔** (2단계 — 자기 산출물 오탐 방지):
   - **(a) 무조건 0건**: `grep -rn "ADR-058\|ADR-059\|ADR-060\|ADR-061" .claude .agents docs README.md README_ko.md` — 이번 라운드에서 만들지 않는 번호라 어디에도 등장하면 안 됨. 그리고 `grep -n "initial workitem\|seed된 첫 feature" README.md README_ko.md .claude/skills/bootstrap-project/SKILL.md` — 구체제 서술 잔존 0건.
   - **(b) 허용 문맥 대조**: `grep -rn "plan-workitem F-001\|M1/F-001" .claude .agents docs README.md README_ko.md`의 hit는 다음 **whitelist만** 허용 — ① *제거를 서술하는* ADR/amend 텍스트(ADR-057 배경·결정 1, ADR-051#amend-3, ADR-007 표의 "seed는 ADR-057로 제거" 구절, ADR-007 `## 현재 유효 결정`), ② PROJECT_START_CHECKLIST의 `/plan-workitem F-001` *단일 모드 예시*, ③ validate-plan/repair-plan의 ID *형식 예시*. 그 외 hit(특히 "다음 단계" 권장·흐름 서술)는 잔존 결함 — 수정.
7. **gitignore 정합**: `docs/20-system/prototypes/*/_drafts/`·`docs/40-validation/visual/`은 ignore, `docs/20-system/prototypes/M*/<screen>.html`(예: `M1/home.html` — `_drafts/` 제외 화면 파일)은 ignore되지 않음을 `git check-ignore`로 확인.
8. **링크 체크**: `markdown-link-check`가 설치돼 있으면 docs/ 내부 링크 점검(외부 URL 제외 — stabilize preflight 1과 동일 방식). 미설치면 skip.
9. 발견된 불일치를 수정하고 커밋:

```
chore(docs): cross-surface sync for 2026-07 improvement round
```

10. **ADR-017 dogfood 재실행 (적용 후 필수 — 별도 세션)**: 본 라운드는 ADR-017의 재실행 트리거 3종(새 ADR 도입·lifecycle 단계 변경·skill 본문 큰 변경)에 **전부 해당**한다 — 적용 완료 후 `.boilerplate/validation/SIMULATION_RUN.md`에 새 라운드를 추가하는 dogfood 시뮬레이션(fresh-fork 기준: UI 마일스톤 1개로 R5 프로토타입 라운드 → 배치 분해 → §3-V 경험 게이트 → Codex에서 `$validate-milestone` 발견까지 관통)을 수행/스케줄한다. Stage 5의 정적 검사는 이를 대체하지 않는다.
11. **적용 후 사용자 확인 항목 (수동)**: (a) Codex 세션에서 `$validate-milestone`이 자동완성에 뜨는지 실측(ADR-010 관례 — 실측 검증은 사용자 수행), (b) 다음 실전 fork에서 R5 프로토타입 라운드·배치 분해의 체감 시간을 기록해 ADR-056/057 Falsifying evaluation 입력으로 남길 것, (c) **Codex 최신 버전의 native sub-agent(`.codex/agents/*.toml`) 지원 여부를 확인**해 ADR-010 D6(Phase 3 보류) 재평가 입력으로 기록 — 지원이 실측되면 designer/researcher 위임의 Codex 인라인 degrade를 native 위임으로 승격하는 별도 라운드 후보.

---

# 부록 — 이번 라운드에서 의도적으로 하지 않는 것 (혼동 방지)

- **stabilize-feature skill 신설 X** — `--feature` 스코프 플래그로 대체(ADR-057 비결정).
- **완전 full 일괄 분해 X** — draft/refresh 2-tier만(ADR-057 비결정).
- **ux-writer agent·별도 VOICE.md X** — DESIGN.md §10 규칙서로 흡수(ADR-056 비결정).
- **멀티에이전트 디자인 합의(논의→종합) 토폴로지 X** — bland 수렴 + parallel-merge 금지(ADR-053) — divergence 카드 + 사용자 선택으로 대체(ADR-049#amend-2).
- **디자인 MCP(lazyweb/mobbin) 기본 의존 승격 X** — ADR-027#amend-2 비결정 유지(위계 ③ 옵션으로만).
- **exemplar 디자인 프로파일 동봉 X** — live-fetch 파이프라인(researcher 디자인 모드)으로 대체(사용자 결정, ADR-040#amend-4).
- **per-task 스크린샷 대조 X** — 준-hot-loop 토큰 트랩(ADR-056 비결정).
- **잔여 자연어 5종 wrapper 승격 X** — 실수요 근거 0(ADR-010#amend-4 결정 5). 본문 Codex 안내 1줄만 추가.
- **/draft-adr skill 신설 X** — 트리거 표 + [ADR-candidate] 회수로 대체(ADR-000#amend-2 비결정).
- **concept 개수 4+ 확대 X** — 2~3개 유지, 다양성은 divergence 카드가 담당(ADR-049 비결정 유지).
- **신규 ADR 남발 X** — 이번 라운드 신규 ADR은 056·057 딱 2개(umbrella — ADR-051/052 선례). 나머지 정책은 전부 기존 ADR Amendment.
