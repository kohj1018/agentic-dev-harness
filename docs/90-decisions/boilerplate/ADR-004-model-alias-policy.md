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
