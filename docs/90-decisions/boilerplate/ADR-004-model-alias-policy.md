# ADR-004 모델 별칭 우선 정책

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- shared 기본값(`.claude/settings.json`, `.codex/config.toml`)에 **모델·추론 강도의 버전을 고정하지 않는다** (#amend-2).
- shared 도구 설정 파일은 **모델 키 자체를 두지 않는다** — Claude Code `.claude/settings.json`(#amend-3) · Codex `.codex/config.toml`([ADR-010](ADR-010-multi-agent-compatibility.md)#amend-6) 양쪽 다. 승계 대상은 사용자 계층 또는 계정·CLI 기본값.
- 별칭(`sonnet`/`opus`/`haiku`)은 **역할별 고정이 필요한 자리에서만** 쓴다 — `.claude/agents/<name>.md` frontmatter `model:`. 전체 버전 ID 금지는 불변.
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
- ~~`.claude/settings.json`: `"model": "opus"` (default 별칭 — 어느 별칭이 default인지는 본 ADR의 강제 사항이 아니다. 정책 본질은 "shared 기본값에서 별칭만 쓴다".)~~ **[#amend-3으로 폐기 — 키 자체를 제거]**
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
- ~~`.claude/settings.json`의 `"model": "opus"`는 이미 별칭이라 변경 없음 — 본 amendment는 그 표기를 그대로 승인한다.~~ **[#amend-3이 supersede — 별칭이어도 shared 파일에서 제거]**

### 강도 (ADR-022)
- constraint(강, [관측됨]+[외부실증]) — shared 기본값에 모델·추론 강도 고정 금지. 예외는 위 3의 별도 ADR 경로.

<a id="adr-004-amend-3"></a>
## Amendment 3 (2026-08-28) — Claude shared 파일에서도 모델 키 제거 (별칭조차 두지 않음)

### 배경
- #amend-2 는 "shared 기본값에서 버전을 고정하지 않는다"를 도구 무관 원칙으로 세우면서도, `.claude/settings.json` 의 `"model": "opus"` 는 *이미 별칭이라* 예외로 승인했다.
- [관측됨] 그 별칭 하나가 사용자 계층을 덮는다. 설정 우선순위가 shared project > user 이므로, 사용자가 `~/.claude/settings.json` 에 `"model": "opus[1m]"` 을 두고 `/model` 로 골라도 다음 실행에서 저장소 pin 이 되돌린다. 별칭은 *버전* staleness 는 막지만 *사용자 선택* 을 덮는 문제는 그대로였다.
- [외부실증] `model` 은 세션이 시작하는 모델을 정하는 initial selection 이다 — enforcement 가 아니고, 세션 중 `/model` 전환을 막지도 않는다 ([model-config 문서](https://code.claude.com/docs/en/model-config)).
- [관측됨] 이 저장소의 sub-agent 13개는 전부 frontmatter 에 `model:` 을 각자 박고 있어(`opus` 7 / `sonnet` 6) 세션 모델을 상속하지 않는다. 즉 shared 세션 pin 제거가 역할별 추론 품질 하한선을 건드리지 않는다.

### 결정
1. `.claude/settings.json` 에서 `"model"` 키를 **제거**한다. shared 도구 설정 파일에는 Claude·Codex 양쪽 모두 모델 키를 두지 않는다 — #amend-2 의 예외를 없애 원칙을 일관화한다.
2. 별칭의 자리는 **`.claude/agents/<name>.md` frontmatter `model:`** 로 한정한다. 여기서는 역할별 고정이 목적이므로 별칭을 계속 쓴다(전체 버전 ID 금지 불변).
3. 세션 시작 모델은 사용자 계층(`~/.claude/settings.json` · `.claude/settings.local.json`) 또는 계정 기본값이 승계한다. 팀 차원 강제가 필요하면 프로젝트 자체 정책 ADR-100+ 로 박는다.

### 대안과 제약 (ADR-053)
- **A. 별칭 유지(`"model": "opus"`)** — 편익: fork 사용자의 메인 세션 추론 품질 하한선을 저장소가 보장. 제약: 사용자 계층을 매 실행 덮어 개인 선택(`opus[1m]` 등)이 무효화되고, 그 사실이 문서 어디에도 없었다.
- **B. 키 제거(채택)** — 편익: 사용자·계정 기본값 승계, #amend-2 원칙 일관화, `/model` 선택이 지속됨. 제약: **Pro·Team Standard 좌석 fork 사용자의 메인 세션이 계정 기본값(Sonnet 5)으로 시작**한다. 메인 세션에서 도는 lifecycle skill(ADR-050)이 그 모델로 돌므로 무거운 판정의 품질이 좌석에 따라 달라진다. 완화: 무거운 추론은 `architect`(`model: opus`) 등 sub-agent 위임 경로가 이미 존재하고(bootstrap-project·plan-workitem 본문이 그 위임을 지시), 개인은 `.claude/settings.local.json` 1줄로 원복 가능.
- **C. shared 를 `"opus[1m]"` 로 변경** — 편익: 1M 컨텍스트 기본화. 제약: 1M 이 좌석에 자동 포함되지 않는 환경에서 usage credit 과금·미가용으로 갈 수 있어 비용을 fork 사용자에게 전가. 기각.

### 적용 surface
- `.claude/settings.json` — `"model"` 키 제거(`permissions.deny` 불변).
- 본 ADR `## 현재 유효 결정` 2줄 재작성 / `## 결과` 첫 줄 폐기 표기 / #amend-2 `적용 surface` 마지막 줄 supersede 표기.
- `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델 표기 정책`.
- `docs/90-decisions/boilerplate/README.md` 인덱스 행.
- 변경 없음: `.claude/agents/*.md` frontmatter 13개, `.codex/config.toml`(이미 키 부재), `effortLevel` 정책(#amend-2), `permissions.deny`.

### 강도 (ADR-022)
- constraint(강, [관측됨]+[외부실증]) — shared 도구 설정 파일에 모델 키 금지. 예외는 #amend-2 3의 별도 ADR 경로.

<a id="adr-004-amend-4"></a>
## Amendment 4 (2026-09-11) — agent frontmatter `effort` 허용 + builder 실험

### 배경
- [관측됨] 보조 AI(sub-agent)가 메인 세션의 추론 깊이를 그대로 물려받아, 이미 문서로 결정된 slice를 구현하는 builder가 과도하게 오래 생각한다(사용자 fork 보고 — 중간 중단 다수, SIMULATION_RUN Round 4 INST-1~5).
- [외부실증] Claude Code sub-agent frontmatter는 `effort: low|medium|high|xhigh|max`를 지원하며 세션 effort를 덮는다. 단 환경변수 `CLAUDE_CODE_EFFORT_LEVEL`이 설정돼 있으면 그것이 우선한다. `maxTurns`는 행동 횟수 상한이며 속도를 높이지 않는다(부분 출력 마커만 남긴다).
- [관측됨] 이 저장소의 sub-agent 13개는 `model:`만 고정하고 `effort:`는 어디에도 없다. Codex는 `.claude/agents/*.md`를 읽지 않으므로(persona 매핑 없음 — ADR-010) 이 키는 Codex 경로에 영향이 없다.

### 결정
1. **`effort`는 역할별 고정 대상이다** — 별칭(`model:`)과 같은 자리(`.claude/agents/<name>.md` frontmatter)에서만 쓴다. shared 설정 파일(`.claude/settings.json`)에는 여전히 두지 않는다(#amend-2·#amend-3 불변). 값은 `low|medium|high|xhigh|max` 중 하나이며 버전 고정이 아니므로 본 정책의 «비고정» 원칙과 충돌하지 않는다.
2. **1차 적용은 builder만**: `maxTurns: 20 → 45`, `effort: medium` 추가. 근거 — builder는 «이미 문서화된 결정을 집행»하는 역할이라 깊이보다 완주가 중요하다. 판단 역할(architect·designer·reviewer·qa·validator·planner·researcher·자문 5종)은 변경하지 않는다.
3. **실험 설계(ADR-047#amend-1 — 대조군)**: Round 11 dogfood의 같은 task 1개를 네 조건으로 돌린다 — (a) 현재(20·effort 없음) (b) effort만(20·medium) (c) 턴만(45·effort 없음) (d) 둘 다(45·medium). 측정: 소요 시간, 완료율(AC 충족), foreman 회수 턴, `validate` 실패 수, Red 관측 보고 누락. 결과를 SIMULATION_RUN `## Builder Effort Experiment`에 기록한다.
4. **확장 규칙**: (d)가 (a) 대비 완료율·검증 실패에서 저하 없이 시간이 줄면 validator·qa에 `effort: medium`을 다음 라운드 후보로 올린다(별도 amendment). 저하가 있으면 builder의 `effort`를 제거하고 `maxTurns`만 유지한다.
5. **사용자 환경 안내**: 메인 세션은 사용자 계층에서 `high` 이상을 권장하고, `CLAUDE_CODE_EFFORT_LEVEL`을 전역 환경변수로 두지 않는다(두면 agent `effort`가 무력화된다). 이 안내는 DELEGATION_STRATEGY `## 모델 표기 정책`에 둔다.
6. **Codex parity**: 본 저장소는 Claude persona 위임을 Codex subagent로 매핑하지 않아 builder가 메인 인라인으로 돈다(ADR-010). 따라서 본 실험은 Codex 경로에 적용하지 않으며, Codex 쪽 추론 강도는 `.codex/config.toml`의 비지정 정책(ADR-010#amend-6)을 그대로 둔다. Codex subagent별 effort 지원 여부는 매핑을 도입할 때 확인한다.

### 적용 surface
- `.claude/agents/builder.md` — frontmatter
- `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델 표기 정책`
- `.boilerplate/validation/SIMULATION_RUN.md` — 실험 기록
- `docs/90-decisions/boilerplate/README.md` 인덱스 행

### 강도 (ADR-022)
- enabling(약, [관측됨]+[외부실증]) — 1개 agent 한정 + 대조군 실험. 확장은 실측 후.

### Mutation delta (ADR-047 D3)
- failure = builder가 slice 중간에 턴 소진으로 멈추거나 과도한 추론으로 지연 / falsifier = (d)에서 완료율·검증 실패가 (a)보다 나쁨 → 그때는 결정 4대로 `effort`만 제거하고 `maxTurns: 45`는 유지한다 / rollback = **본 amend superseded** 시 frontmatter 두 줄 원복(`effort` 삭제 + `maxTurns: 20`).

<a id="adr-004-amend-5"></a>
## Amendment 5 (2026-09-11) — builder `effort` 제거(실측 결과) + 결정 4의 세 번째 갈래 규정

### 배경
- [관측됨] #amend-4 결정 3의 대조군 실험을 dogfood Round 11에서 실제로 돌렸다(기록: `.boilerplate/validation/SIMULATION_RUN.md ## Builder Effort Experiment`). 같은 task(T-002 — 승인 UI 2개 배선 + 도메인 연결 + 계측 + 테스트 3건)를 격리 사본 4개에서 **바이트 동일한 slice 프롬프트**로 돌렸다. **각 셀 n=1이다 — 통계가 아니라 경향 신호다.**

  | 조건 | maxTurns | effort | 소요(ms) | tool_uses | 토큰 | 완료 AC | validate | 회수 턴 |
  |---|---:|---|---:|---:|---:|---|---|---:|
  | (a) | 20 | — (세션 `xhigh` 상속) | 132,522 | 17 | 42,761 | 3/3 | OK | 0 |
  | (b) | 20 | medium | 338,873 | 23 (1차 20에서 상한 중단) | 62,019 | 3/3 | OK | 1 |
  | (c) | 45 | — (세션 `xhigh` 상속) | 161,769 | 18 | 49,451 | 3/3 | OK | 0 |
  | (d) | 45 | medium | 309,489 | 22 | 76,199 | 3/3 | OK | 0 |

- **완료율·검증 실패는 4조건 동일**(AC 3/3, `validate` 전 단계 통과, 승인 UI 바이트 무변경)인데 **`medium` 두 조건의 소요가 상속 두 조건의 약 2배**이고 토큰도 높다. #amend-4 결정 2의 채택 근거(«깊이보다 완주»)와 반대 방향이다.
- [관측됨] `maxTurns` frontmatter 는 실제로 적용된다 — (b) 1차가 `tool_uses` 정확히 20에서 잘렸다. 단 **편집 직후 dispatch 하면 이전 정의가 쓰인다**(같은 라운드 preflight 에서 `maxTurns: 1` 이 3 step 완주). 조건 전환 사이 대기가 필요하다.
- [관측됨] 품질 편차는 조건 축과 정렬되지 않았다 — 도달 불가능한 계측 분기를 (a)·(d)는 코드에 넣고 (b)·(c)는 거부해 2:2로 갈렸다.

### 결정
1. **`builder` frontmatter 에서 `effort: medium` 을 제거한다. `maxTurns: 45` 는 유지한다.** 근거: 완료율·검증 실패에 이득이 없는데 소요·토큰이 약 2배다. `maxTurns: 45` 는 필요 없을 때 비용이 0이고 필요할 때 foreman 왕복 1회를 없앤다((b) 1차가 그 왕복을 실제로 치렀다).
2. **#amend-4 결정 4에 세 번째 갈래를 규정한다.** 기존 두 갈래는 «저하 없이 시간이 줄면 확장 / 저하가 있으면 제거»뿐이라, 관측된 «**저하는 없으나 시간·토큰이 늘었다**»가 어느 쪽에도 걸리지 않았다. 세 번째 갈래: **완료율·검증 실패에 저하가 없어도 소요·토큰이 유의하게 늘면 그 `effort` 지정을 제거한다** — 채택 근거가 속도였으므로 속도가 반증되면 근거가 남지 않는다.
3. **`effort` 를 다른 agent 로 확장하지 않는다.** #amend-4 결정 4의 확장 후보(validator·qa)는 근거가 사라졌으므로 올리지 않는다.
4. **Round 12 재측정 트리거**: 같은 실험을 Flutter 배선 task 로 1회 더 돌려 n=2 로 만든다. **그때는 `.claude/agents/builder.md` 를 반복 수정하지 않고 `builder-a`~`builder-d` 변형 파일로 돌린다** — 조건마다 canonical 파일을 고치면 (i) 매번 self-modification 승인이 필요하고 (ii) hot-reload 지연 때문에 «어느 정의가 실제로 쓰였는가»가 불확실해진다. 변형 파일은 **측정 전용이며 측정 후 삭제한다**(상시 두면 `docs/00-meta/STRUCTURE.md` 의 sub-agent 로스터 13종과 어긋난다). 각 조건마다 **적용 확인 로그**(그 조건의 `maxTurns` 가 실제로 걸렸는지 보이는 관측)를 남긴다.
   - 재측정 결과가 본 결정 1을 뒤집으면(= `medium` 이 더 빠르거나 동등) 그때 다시 amend 한다.

### 강도 (ADR-022)
- **제약 완화(약)** — 지정을 *제거*하는 방향이라 새 제약을 만들지 않는다. 근거는 [관측됨] n=1 이며 그 한계를 결정 4가 명시한다.

### Mutation delta (ADR-047 D3)
- failure = builder 가 slice 중간에 턴 소진으로 멈춘다 / falsifier = `maxTurns: 45` 에서도 상한 중단이 반복되면(회수 턴 ≥1 이 2회 이상) 45 가 부족한 것이므로 값을 다시 본다. 반대로 Round 12 재측정에서 `medium` 이 상속보다 빠르면 결정 1을 뒤집는다 / rollback = 본 amend superseded → `effort: medium` 복원.

### 적용 surface
- .claude/agents/builder.md                      — frontmatter (`effort` 제거)
- docs/00-meta/DELEGATION_STRATEGY.md            — `## 모델 표기 정책` 의 effort 문구
- .boilerplate/validation/SIMULATION_RUN.md      — 실험 기록·Round 12 재측정

<a id="adr-004-amend-6"></a>
## Amendment 6 (2026-09-11) — 에이전트가 자기 `maxTurns` 를 알고 예산을 잡는다

### 배경
dogfood Round 11·12 에서 **팬아웃 단위가 보고 0건 상태로 상한에 걸리는 일이 세 번** 났다(발견 24·39).

- [관측됨] stabilize 마일스톤 팬아웃 5단위 중 **4단위**가 보고 전에 소진(qa 22·reviewer 25·reviewer 34·qa 21 tool_uses).
- [관측됨] `/repair-milestone` 2-V (v) 영향 반경 재감사의 qa 단발 sub-call 이 **tool_uses 20 / 16턴**에서 보고 0건으로 중단.
- [관측됨] stabilize 2회차 reviewer(design) 단발이 **12턴**에서 보고 0건으로 중단.
- [관측됨] **위임 프롬프트에 턴 예산을 적어도 효과가 없었다.** 그 세 번 중 둘은 프롬프트에 「30턴 안에 보고를 마쳐라」·「25턴 안에」가 적혀 있었는데, 대상 agent 의 실제 상한은 **16·12** 였다. 호출자는 그 값을 모른다 — agent 파일을 열어 frontmatter 를 읽지 않는 한 알 방법이 없고, 위임 시점에 그것을 읽게 하는 규정도 없다.
- 세 번 모두 **회수 규율 ①(1회 재개)이 흡수했다** — 재개 뒤 전부 완전한 보고를 냈다. 규율은 설계대로 작동했으나 매번 왕복 한 번을 쓴다.

### 결정
1. **각 report-only agent 파일이 자기 `maxTurns` 와 «보고 시작 턴» 을 본문에 명시한다.** 보고 시작 턴은 `maxTurns − 4` 로 둔다. 그 절이 위임 프롬프트의 턴 문구를 **이긴다** — 호출자는 피호출자의 상한을 모르기 때문이다.
2. **미완 보고를 정상 산출로 규정한다**: 조사가 안 끝났으면 «확정한 사실 + 미확인 항목»을 나눠 보고하고 무엇이 왜 남았는지 적는다. 침묵하다 상한에 걸리는 것보다 항상 낫다.
3. **`maxTurns` 값 자체는 이번에 올리지 않는다.** 세 번 다 재개로 완주했으므로 상한이 근본적으로 모자란다는 근거가 아직 없고, 값을 올리면 비용은 전 호출에 걸리는데 이득은 소수 단위에만 간다. 결정 1·2 를 적용한 뒤에도 «보고 0건 상한 도달»이 반복되면 그때 값을 본다(falsifier).

### 근거
- 대안 「팬아웃 단위를 더 잘게」는 기각하지 않고 **보류**했다 — 단위 크기는 skill 마다 다르고, 잘게 쪼개면 호출 수와 종합 비용이 는다. 결정 1·2 는 단위 크기와 무관하게 듣는다.
- 대안 「호출자가 위임 전에 agent frontmatter 를 읽어 예산을 계산한다」는 기각했다 — 호출 경로가 많고(스킬 10여 개) 값이 바뀌면 전부 어긋난다. **값을 아는 쪽이 예산을 잡는 것이 옳다.**
- 대가: agent 파일마다 한 줄이 늘고 그 줄이 `maxTurns` 와 **손으로 동기화**돼야 한다. 어긋나면 예산이 틀리지만 방향은 안전한 쪽(더 이르게 보고)이다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 1 의 «이 절이 위임 프롬프트를 이긴다».
- enabling(약, [관측됨]): 결정 2·3.

### Mutation delta (ADR-047 D3)
- failure = 팬아웃 단위가 보고 없이 상한에 걸려 회수 왕복을 소모한다(관측 3건).
- predicted = Round 13 에서 «보고 0건 상한 도달» 0건, 미완 보고가 있으면 «확정/미확인» 두 묶음으로 온다.
- falsifier = (a) 결정 1·2 적용 뒤에도 보고 0건 상한 도달이 2회 이상이면 결정 3 을 뒤집고 `maxTurns` 를 올린다 (b) 에이전트가 예산을 지키느라 **조사를 너무 일찍 접어** 놓친 결함이 다음 라운드에 나오면 보고 시작 턴을 `maxTurns − 2` 로 늦춘다.
- rollback = 본 amend superseded → agent 본문의 「턴 예산」 절 삭제.

### 적용 surface
- .claude/agents/qa.md · reviewer.md · validator.md · researcher.md · designer.md · planner.md · analyst.md · security.md · counsel.md · strategist.md · marketer.md — 결정 1·2
- .claude/agents/builder.md — 결정 1·2 (**2026-09-11 편입**). 최초 작성 시 «report-only 가 아니고 상한 45 라 제외» 로 뒀으나, 같은 날 Round 12 R6-1 테마 배선 dispatch 가 **45턴 상한에서 보고 0건으로 중단**됐다 — 상한이 높아도 같은 실패가 난다. builder 는 문구가 다르다: «41턴째에는 새 작업을 시작하지 말고 마무리와 보고», 그리고 «slice 가 41턴에 안 끝날 크기면 착수 전에 보고» 를 더한다(쪼개는 것은 foreman 의 일이다).

<a id="adr-004-amend-7"></a>
## Amendment 7 (2026-09-11) — amend-6 의 falsifier (a)가 발화했다: 턴 수 지시를 작업량 지시로 바꾸고 builder 상한을 올린다

### 배경
**같은 날 오후에 amend-6 이 반증됐다.** amend-6 결정 1 은 각 에이전트 본문에 「`maxTurns − 4` 턴째에 보고를 시작한다」를 넣었고, falsifier (a)는 «적용 뒤에도 보고 0건 상한 도달이 **2회 이상**이면 결정 3(값 유지)을 뒤집고 `maxTurns` 를 올린다»였다.

- [관측됨] Round 12 R4 의 **두 builder dispatch 가 둘 다** 45턴 상한에서 **보고 0건**으로 멈췄다(웹: 마지막 출력 「Now the stories file.」 / 모바일: 「Now let's run `dart format`…」). 둘 다 `builder.md` 의 41턴 문구 **와** dispatch 프롬프트의 같은 문장을 받은 상태였다.
- [관측됨] **둘 다 작업 자체는 거의 끝나 있었다** — 웹은 파일 4개가 다 있었고 모바일은 `flutter analyze` 클린 + 34 테스트 통과까지 갔다. 죽은 자리는 **최종 검증 단계**다.
- [관측됨] 같은 amend-6 을 받은 **report-only 에이전트(designer 브리프 3종·reviewer 브리프 비평)는 정상 보고했다.** 실패는 builder 에 몰려 있다.
- 원인 분석: 규칙이 **관측 불가능한 것을 지시한다**. 에이전트에게 「지금 몇 턴째인가」를 보여 주는 장치가 없다 — 「41턴째에」는 지킬 수 없는 지시다. report-only 가 살아남은 것은 규칙을 지켜서가 아니라 **일이 상한보다 작았기 때문**으로 읽는 것이 정직하다(발견 59).

### 결정
1. **턴 수 지시를 «작업량» 지시로 바꾼다** (결정 1 대체). 에이전트 본문의 문구를 관측 가능한 신호로 교체한다 — 「slice 를 받으면 **먼저 산출물을 나열하고**, 그 목록의 **절반을 끝낸 시점에 남은 것을 점검한다.** 남은 일이 이미 한 것보다 많아 보이면 **그때 중간 보고**를 내고 계속한다. 끝내지 못한 채 멈추는 것보다 절반 보고가 항상 낫다.」 턴 수는 어디에도 적지 않는다.
2. **`builder` 의 `maxTurns` 를 45 → 60 으로 올린다** (결정 3 뒤집기 — falsifier (a)가 규정한 응답). 두 관측 다 «상한이 조금 모자랐다»에 가깝다(작업이 거의 끝난 자리에서 죽었다). report-only 에이전트의 값은 **건드리지 않는다** — 그쪽에서는 실패가 없었고, 값을 올리면 비용만 는다.
3. **slice 크기 규율을 foreman 쪽에 명시한다**: 한 dispatch 에 «화면 1개 + fixtures + 스토리/테스트 + 검증»을 넣으면 60턴도 빠듯하다. `/design-milestone` R4 와 `/implement-workitem` 은 **화면·slice 를 나눌 때 «산출물 4개 이상이면 쪼갠다»** 를 기준으로 삼는다.

### 근거
- 결정 1 의 대안 「턴 수를 프롬프트에 더 크게 적는다」는 이미 실패했다 — 두 dispatch 다 프롬프트에 41을 받았다. **지시의 강도가 아니라 관측 가능성이 문제다.**
- 결정 2 만 하고 결정 1 을 안 하면 60턴에서 같은 일이 난다(벽이 옮겨갈 뿐). 결정 1 만 하고 2 를 안 하면 falsifier 가 규정한 응답을 어긴다. **둘 다 한다.**
- 대가: `maxTurns: 60` 은 실패한 dispatch 의 비용 상한을 올린다. 그 대가를 결정 3 의 slice 규율로 상쇄한다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 3 의 «산출물 4개 이상이면 쪼갠다».
- enabling(약, [관측됨]): 결정 1·2.

### Mutation delta (ADR-047 D3)
- failure = builder 가 거의 끝낸 일을 보고 없이 잃고 회수 왕복을 쓴다(관측 2건, 같은 라운드).
- predicted = Round 13 에서 builder 의 «보고 0건 상한 도달» 0건, 중간 보고가 있으면 «완료/미완» 두 묶음으로 온다.
- falsifier = (a) `maxTurns: 60` 에서도 보고 0건 상한 도달이 1회라도 나면 **상한 문제가 아니다** — 결정 2 를 되돌리고 결정 3(slice 쪼개기)만 남긴다 (b) 중간 보고가 «절반»을 자의적으로 잡아 매번 초반에 나오면 결정 1 의 기준을 산출물 수로 더 좁힌다.
- rollback = 본 amend superseded → amend-6 의 턴 수 문구 복원 + `maxTurns: 45`.

### 적용 surface
- .claude/agents/builder.md — 결정 1·2 (`maxTurns` frontmatter + 「턴 예산」 절 교체)
- .claude/agents/qa.md · reviewer.md · validator.md · researcher.md · designer.md · planner.md · analyst.md · security.md · counsel.md · strategist.md · marketer.md — 결정 1 (문구만 교체, `maxTurns` 불변)
- .claude/skills/design-milestone/SKILL.md · .claude/skills/implement-workitem/SKILL.md — 결정 3 slice 크기 기준

## Amendment 8 (2026-09-12) — amend-7 의 분류가 틀렸다: 예산 축은 «쓰기 도구 보유»이고, 예산은 산출물 규모로 잡는다

### 배경
amend-7 결정 2 는 **「report-only 에이전트의 값은 건드리지 않는다 — 그쪽에서는 실패가 없었다」**를 근거로 `builder` 만 45 → 60 으로 올렸다. 그 분류가 dogfood Round 12 에서 반증됐다.

- [관측됨] `/plan-workitem M1` dispatch 가 `planner` 의 `maxTurns: 12` 상한에서 **보고 0건**으로 멈췄다(1회차 28 tool_use / 136.3K 토큰 / 360초, 텍스트 출력 없음).
- [관측됨] 회수 dispatch 에 **산출물 목록·우선순위·「침묵으로 끝나면 통째로 미반환이 된다」를 명시해** 다시 보냈는데도 **또 보고 0건**으로 멈췄다(2회차 12 tool_use / 162.0K 토큰 / 257초, 마지막 출력 「Now F-002.」 — builder 실패 때의 「Now the stories file.」과 같은 문장 형태다). 3회차에 완주했고 **누계 463K 토큰 · 약 15분**이 들었다.
- [관측됨] `planner.md` 에는 amend-7 결정 1 문구가 **전문 그대로** 있다. 지시가 없어서가 아니다.
- [관측됨] **`planner` 는 report-only 가 아니다.** `tools: Read, Glob, Grep, Write, Edit` 이고 이번 산출물은 task 문서 5개 + feature 3개의 `## 7-1`·`## 7-2`·`## 7-3` = **11 산출물**이었다. 로스터에서 쓰기 도구를 가진 에이전트는 `builder`·`planner`·`architect`·`designer`·`reviewer` 5종이다.
- [관측됨] `architect` 는 **`maxTurns` 자체가 없고** amend-7 의 「작업 예산」 문구도 없다 — amend-7 fan-out 이 빠뜨렸다(적용 surface 목록에 `architect.md` 가 없다).
- [관측됨] 더 깊은 원인: Round 11 의 `d3119d3` 이 `/plan-workitem` 에 **3-S 승인 표면 대조**(매니페스트·브리프·DESIGN `## 7`·승인 컴포넌트 시그니처 읽기)를 얹어 위임 단위의 작업량을 늘렸는데, **규칙을 늘릴 때 그 규칙을 수행할 에이전트의 예산을 보는 단계가 없다.**

### 결정
1. **예산 축을 «쓰기 도구 보유»로 다시 긋는다.** `planner`·`architect`·`designer` 를 `builder` 와 같은 «쓰는 쪽»으로 분류한다(`reviewer` 는 쓰기 도구가 있으나 산출물이 보고 1건이므로 현행 유지).
2. **예산은 산출물 규모로 잡는다** — `maxTurns = 읽기 기본 8 + 산출물당 3`. slice 상한이 4 산출물(amend-7 결정 3)이므로 문서 산출 에이전트의 값은 **8 + 4×3 = 20** 이다. `planner` 12 → **20**, `designer` 16 → **20**, `architect` 미지정 → **20**. `builder` 는 **60 유지** — 한 산출물이 코드+테스트+검증 루프라 같은 산식이 맞지 않고, amend-7 falsifier (a)가 그 값에 걸려 있다.
3. **쓰기 에이전트의 부분 보고 형식을 고정한다** — 「**쓴 파일 목록 + 남은 것 1줄**」. 서술을 요구하지 않는다(서술을 요구하면 예산이 남아 있을 때만 낼 수 있다).
4. **회수 dispatch 는 이미 쓴 파일 목록을 넘긴다.** 호출자가 그 목록을 읽어 전달하므로 재개한 에이전트가 같은 파일을 다시 열지 않는다.
5. **`/stabilize-milestone` 7-T 에 계수 한 줄을 더한다** — `턴 소진 0건 보고: N회`. 이 실패는 지금까지 사람이 알아채야만 보였다.

### 근거
- 결정 1 의 근거는 관측이지 이론이 아니다 — amend-7 은 「report-only 는 실패가 없었다」를 규칙으로 승격했는데, **`planner` 를 report-only 로 센 것이 오류**였다. 같은 오류로 `architect` 는 값도 문구도 못 받았다.
- 결정 2 의 대안 「planner 도 60」을 택하지 않았다: 실패한 dispatch 의 비용 상한만 올린다. 산출물 규모 산식은 slice 규율(amend-7 결정 3)과 한 몸으로 움직여서, **slice 를 지키면 20 으로 충분하고 slice 를 어기면 60 도 모자란다**(이번 관측이 정확히 그 경우다 — 11 산출물).
- **ADR-047 D3 Mutation Contract 에 «예산 영향» 항목을 지금 넣지 않는다** (사용자 확정 2026-09-12) — Round 13 후보로 남긴다. 채택 조건: **결정 1·2·3·4 적용 뒤에도 쓰기 도구 보유 에이전트가 «보고 0건 상한 도달» 을 1회라도 내면 채택한다.** ADR-047 은 하네스의 중심 계약이라 관측 하나로 항목을 늘리지 않는다.
- 대가: 문서 산출 에이전트의 실패 비용 상한이 12~16 → 20 으로 는다. slice 규율이 그 대가를 상쇄한다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 2 의 산식과 값.
- 제약(약, [관측됨]): 결정 3·4·5.

### Mutation delta (ADR-047 D3)
- failure = 쓰기 도구를 가진 에이전트가 산출물을 거의 다 만들어 놓고 보고 없이 멈춰, 호출자가 회수 dispatch 를 반복한다(관측 2회 연속, 누계 463K 토큰).
- predicted = Round 13 에서 `planner`·`designer`·`architect` 의 «보고 0건 상한 도달» 0건. 상한에 닿으면 「쓴 파일 목록 + 남은 것 1줄」이 온다.
- falsifier = (a) 결정 1~4 뒤에도 쓰기 도구 보유 에이전트의 «보고 0건 상한 도달» 이 **1회라도** 나면 **지시로 풀리는 문제가 아니다** — ADR-047 D3 에 «예산 영향» 항목을 넣고(위 근거의 Round 13 후보 채택) 예산 상향 대신 slice 강제로 간다 (b) 산식 `8 + 3×산출물` 이 과다해 20턴 dispatch 의 실사용이 매번 12턴 아래로 끝나면 산식을 재측정해 낮춘다.
- rollback = 본 amend superseded → `planner` 12 · `designer` 16 · `architect` 미지정 복원, 부분 보고 형식·7-T 계수 제거.

### 적용 surface
- .claude/agents/planner.md · designer.md · architect.md — 결정 1·2·3 (`maxTurns` frontmatter + 「작업 예산」 절)
- .claude/agents/builder.md — 결정 3 (부분 보고 형식만; `maxTurns: 60` 불변)
- .claude/skills/plan-workitem/SKILL.md — 결정 4 + amend-7 결정 3 의 slice 규율 적용
- .claude/skills/stabilize-milestone/SKILL.md — 결정 5 (7-T 계수)

## Amendment 9 (2026-09-12) — amend-8 의 falsifier (a)가 당일 발화했다: 지시를 «보고»에서 «산출물 먼저»로 바꾸고 읽기 축을 산식에 넣는다

### 배경
amend-8 falsifier (a)는 «결정 1~4 뒤에도 쓰기 도구 보유 에이전트가 보고 0건으로 상한에 닿으면 1회라도 채택»이었다. **같은 날 발화했다.**

- [관측됨] `/validate-plan M1` 의 `reviewer` 가 `maxTurns: 12` 상한에서 **보고 0건**으로 멈췄다(29 tool_use / 176.0K 토큰 / 455초). 마지막 출력이 **「리뷰 파일 골격을 지금 쓰겠다(early write per budget discipline)」** — 즉 **early-write 지시를 받았고, 그것을 실행하려다 죽었다.**
- [관측됨] 회수 dispatch 에 **「이번 턴에 제일 먼저 파일을 써라. 새 파일을 열기 전에 반드시 파일을 한 번 써 둔 상태여야 한다」**를 넣자 **즉시 완주했다** — 12차원 전부 + 신규 4검사, 미검토 0건, P0 0 / seal-blocking P1 2건.
- [관측됨] 같은 실패의 **5번째**다: builder 2(Round 12 R4) · planner 2(`/plan-workitem`) · reviewer 1. **중간 보고는 5/5 에서 한 번도 나오지 않았다.**
- [관측됨] amend-8 은 `reviewer` 를 예산 상향에서 **명시적으로 제외**했다 — 「쓰기 도구가 있으나 산출물이 보고 1건이므로」. 그 근거가 틀렸다. reviewer 의 부담은 산출물 수가 아니라 **회수 문서 수**다: `/validate-plan M<N>` 은 charter·원장·ARCH·DESIGN·M·feature 3·task 5·매니페스트·`source[]` PX grep 을 읽는다(15+ 문서).

### 결정
1. **지시의 형태를 바꾼다 — «멈추기 전에 보고해라» → «산출물을 먼저 만들고 채워 나가라».** 에이전트 본문의 예산 절에 한 줄을 박는다: 「**주 산출물 파일을 골격만으로 먼저 쓴다. 새 입력을 더 열기 전에 그 파일이 디스크에 있어야 한다.** 그 뒤 차원·항목을 진행하며 갱신한다. 못 본 것은 파일 안에 `미검토: <무엇> — <이유>` 로 남긴다.」 **관측 가능한 지시다** — 「지금 몇 턴째인가」와 달리 「그 파일이 있는가」는 에이전트가 볼 수 있다.
2. **`reviewer` 를 쓰는 쪽으로 옮긴다** (amend-8 결정 1 의 예외 철회). `maxTurns` 12 → **24**.
3. **산식에 읽기 축을 넣는다** (amend-8 결정 2 대체): `maxTurns = 읽기 예산 + 3 × 산출물 수`, **읽기 예산 = `max(8, 회수 문서 수)`**. 검증: planner(산출물 4 · 문서 8) = 8 + 12 = **20**(amend-8 값과 같다) · reviewer(`/validate-plan M<N>`: 산출물 1 · 문서 15+ · PX grep 훑기) = 21 → 올림 **24** · builder 는 **60 유지**(한 산출물이 코드+테스트+검증 루프라 3턴 환산이 맞지 않는다).
4. **slice 기준에 읽기 축을 더한다** (amend-7 결정 3 확장): 「산출물 4개 이상이면 쪼갠다」 **또는 「회수 문서 10개 이상이면 축·범위를 나눈다」**. `/validate-plan` 의 기존 «큰 milestone budget 가이드»가 그 형태다.

### 근거
- **결정 1 이 이번 amendment 의 핵심이고, 나머지는 보조다.** 다섯 번의 실패가 전부 「거의 끝났는데 산출물이 없다」였다. 에이전트는 **언제 멈출지 예측할 수 없지만 일의 순서는 바꿀 수 있다** — 산출물을 먼저 만들면 상한 중단이 «전부 잃음»에서 «부분 산출물 + 회수»로 내려간다. amend-6(턴 수 지시)·amend-7(작업량 지시)·amend-8(부분 보고 형식)은 셋 다 **멈추는 순간에 무엇을 하라**는 지시였고 셋 다 0/5 였다. 결정 1 은 **멈추기 전에 무엇을 먼저 하라**는 지시다.
- 결정 1 의 근거 관측은 **n=1 의 강한 형태**다(약한 형태 「일찍 써라」는 같은 dispatch 에서 실패했다). 그래서 falsifier 를 좁게 건다.
- 결정 2·3 의 대가: reviewer 실패 dispatch 의 비용 상한이 2배가 된다. 결정 4 의 slice 규율이 그것을 상쇄한다.
- 결정 3 의 대안 「읽기 기본을 일괄 16 으로 올린다」는 기각했다 — 읽기가 가벼운 위임 단위까지 값을 올려 실패 비용만 는다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 1·4.
- 제약(약, [관측됨]): 결정 2·3.

### Mutation delta (ADR-047 D3 — 7 필드)
- target = `.claude/agents/*.md` 예산 절 · `reviewer.md` frontmatter · `.claude/skills/validate-plan/SKILL.md`·`plan-workitem/SKILL.md` slice 규율.
- failure = 위임 단위가 산출물을 만들기 **직전에** 상한에 닿아 전부 잃는다(관측 5건: builder 2 · planner 2 · reviewer 1, 중간 보고 0/5).
- predicted = Round 13 에서 상한 중단이 나도 **주 산출물 파일이 부분 상태로 디스크에 남는다.** `/stabilize-milestone` 7-T 의 `턴 소진 0건 보고` 가 0 이거나, 1 이상이어도 그 dispatch 의 산출물 파일이 존재한다.
- preserved = report-only 에이전트의 반환 형식 · signal-first cap · `builder` 60 · 자동 차단 없음.
- falsifier = (a) 결정 1 적용 뒤에도 «상한 중단 + 산출물 파일 0건» 이 1회라도 나면 순서 지시도 듣지 않는 것이므로 **예산·지시를 더 만지지 말고 slice 강제(결정 4)만 남기고 dispatch 를 기계적으로 쪼갠다** (b) 골격만 쓰고 내용을 안 채운 파일이 반복되면(«미검토» 가 절반 초과) 결정 1 이 형식만 만든 것이므로 되돌린다.
- rollback = 본 amend superseded → amend-8 의 산식·`reviewer` 12 복원, 결정 1 문구 제거.
- **예산 영향** = 본 변경이 곧 예산 변경이다 — `reviewer` 12 → 24, 산식에 읽기 축 추가, slice 기준에 회수 문서 수 추가. 다른 위임 단위의 작업량은 늘지 않는다(결정 1 은 순서만 바꾼다).

### 적용 surface
- .claude/agents/reviewer.md — 결정 1·2 (`maxTurns` frontmatter + 예산 절)
- .claude/agents/builder.md · planner.md · architect.md · designer.md · validator.md · qa.md · researcher.md · analyst.md · security.md · counsel.md · strategist.md · marketer.md — 결정 1 (예산 절 한 줄)
- .claude/skills/validate-plan/SKILL.md — 결정 4 (회수 문서 10개 이상이면 축을 나눈다)
