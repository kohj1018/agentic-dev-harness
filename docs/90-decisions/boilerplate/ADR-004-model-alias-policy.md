# ADR-004 모델 별칭 우선 정책

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- shared 기본값(`.claude/settings.json`, `.codex/config.toml`)에 **모델·추론 강도의 버전을 고정하지 않는다** (#amend-2).
- 달성 수단은 도구별로 다르다 — 별칭 체계가 있는 Claude Code는 별칭(`sonnet`/`opus`/`haiku`), 별칭 체계가 없는 Codex는 **키 자체를 생략**한다 ([ADR-010](ADR-010-multi-agent-compatibility.md)#amend-6).
- 특정 버전·강도를 강제해야 하면 별도 ADR에 사유와 갱신 책임자를 남기고 그 자리에서만 고정한다.

## 배경
이 보일러플레이트의 핵심 가치는 "여러 프로젝트에서 반복 재사용"이다.
모델 ID를 전체 버전 표기(`claude-opus-4-N` 같은 형태)로 고정하면, fork된 새 프로젝트에서
시간이 지남에 따라 staleness가 누적되어 모델 갱신을 사람이 매번 기억해야 한다.

`.claude/settings.json`, agent 정의, skill 정의에 모델 표기가 흩어져 있고,
일부는 별칭(`sonnet`)을, 일부는 전체 ID를 사용하고 있어 표기 일관성이 없다.

## 결정
shared 기본값에서는 모델 별칭(`sonnet`, `opus`, `haiku`)만 사용한다.
특정 버전을 강제해야 하는 이유가 있으면 별도 ADR로 남기고 그 자리에서만 전체 ID를 사용한다.

## 근거
- Claude Code의 별칭은 자동 최신 매핑을 제공한다([model-config 문서](https://code.claude.com/docs/en/model-config)).
- 보일러플레이트의 "재사용 가능" 약속과 자동 최신 매핑이 가장 잘 맞는다.
- 사람이 모델 갱신을 잊어 staleness가 누적되는 것을 저비용으로 막는다.

## 결과
- `.claude/settings.json`: `"model": "opus"` (default 별칭 — 어느 별칭이 default인지는 본 ADR의 강제 사항이 아니다. 정책 본질은 "shared 기본값에서 별칭만 쓴다".)
- `.claude/agents/architect.md`: `model: opus`
- `.claude/skills/bootstrap-project/SKILL.md`, `.claude/skills/bootstrap-stack/SKILL.md`: `model: opus`
- 다른 sub-agent의 `model: sonnet` 표기는 그대로 유지(이미 별칭).

## 후속 작업
- 별칭 정책을 깰 때(특정 버전 강제)의 절차: 새 ADR로 이유와 갱신 책임자를 기록하고, 그 자리에서만 전체 ID를 사용한다.
- 사용자가 fork 직후 자기 환경의 비용 정책을 강제해야 하면 `.claude/settings.local.json`에서 model을 override한다.
- **Provider별 별칭 해석 차이 주의**: Anthropic API와 Bedrock/Vertex/Foundry에서 별칭이 매핑되는 ID·시점이 다를 수 있다. 특정 provider에서 재현성이 중요한 시점(릴리스 직전, 회계 감사 등)에는 그 provider 환경 변수 또는 settings 단에서 전체 ID로 임시 pinning한다(별도 ADR로 기록).

## Amendment 1 (2026-05-16) — agent 이름에서 모델 별칭 제거

### 결정
agent 이름은 **역할 중심**(`architect` / `builder` / `validator` / `planner` / `reviewer` / `qa`)으로 한다. 모델 선택은 agent 파일의 frontmatter `model:` 필드에서만 표기한다.

### 근거
- Codex 사용자의 의미 혼선 차단 — 모델 별칭 suffix가 붙은 builder 이름이 Codex에서 *어떤 모델*인지 자명하지 않은 문제 해소.
- 모델 갱신 시 이름 변경 비용 0 — ADR-004 본 정책의 *별칭 자동 갱신* 의도와 정합.
- ADR-006 단순성 1순위 — 이름은 한 가지 의미만 운반.

<a id="adr-004-amend-2"></a>
## Amendment 2 (2026-08-28) — 정책 축 확장: 도구 무관 "shared 비고정" + 추론 강도 포함

### 결정
1. **대상 축 확장** — 본 정책은 모델뿐 아니라 **추론 강도**(Claude `effortLevel` / Codex `model_reasoning_effort`)에도 적용한다. shared 기본값에 추론 강도를 고정하지 않는다.
2. **도구 축 확장** — 정책 본질을 "shared 기본값에서 별칭만 쓴다"에서 **"shared 기본값에서 버전을 고정하지 않는다"**로 일반화한다. 달성 수단만 도구별로 다르다:
   - 별칭 체계가 있는 도구(Claude Code) — 별칭(`sonnet`/`opus`/`haiku`)을 쓴다. 기존 결정과 동일.
   - 별칭 체계가 없는 도구(Codex) — **키 자체를 생략**한다. 비지정이 곧 자동 최신 경로다 ([ADR-010](ADR-010-multi-agent-compatibility.md)#amend-6이 이행).
3. 예외 절차는 기존과 동일 — 특정 버전·강도를 강제해야 하면 별도 ADR에 사유와 갱신 책임자를 남기고 그 자리에서만 고정한다.

### 근거
- [외부실증] Claude Code 별칭은 자동 최신 매핑을 제공하고, 추론 강도도 설정 파일이 비면 모델 기본값 또는 사용자 계층이 승계한다 ([model-config 문서](https://code.claude.com/docs/en/model-config)).
- [외부실증] Codex는 별칭이 없고 `model` 키가 정확한 slug만 받는다. 대신 *"If you don't specify a model, the ChatGPT desktop app, Codex CLI, or IDE extension uses a recommended model"* — 비지정이 별칭과 동등한 자동 최신 경로다 ([models 문서](https://learn.chatgpt.com/docs/models)).
- [관측됨] ADR-010 D8이 Codex 모델 ID 추적을 사람에게 지운 결과 `.codex/config.toml`에 `gpt-5.5`(previous-generation flagship)가 고정된 채 남았다 — 본 ADR이 막으려던 staleness가 별칭 없는 도구에서 그대로 재현됐다. 게다가 Codex 설정 계층은 project > user라서, 그 핀이 사용자의 최신 기본값을 이 저장소에서만 무효화했다.
- 추론 강도를 명문화하지 않으면 "팀 일관성"을 이유로 shared 파일에 `effortLevel`이 박혀 같은 staleness가 다른 축에서 재발한다. 현재 비어 있는 것은 정책이 아니라 우연이다.

### 적용 surface
- `.codex/config.toml` — 모델·추론 강도 키 부재 + 사유 주석 (실제 편집은 ADR-010#amend-6이 owning).
- `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델 표기 정책`.
- `docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md` — D5·D8 폐기 표기 (#amend-6).
- `docs/90-decisions/boilerplate/README.md` 인덱스 행.
- `.claude/settings.json`의 `"model": "opus"`는 이미 별칭이라 변경 없음 — 본 amendment는 그 표기를 그대로 승인한다.

### 강도 (ADR-022)
- constraint(강, [관측됨]+[외부실증]) — shared 기본값에 모델·추론 강도 고정 금지. 예외는 위 3의 별도 ADR 경로.
