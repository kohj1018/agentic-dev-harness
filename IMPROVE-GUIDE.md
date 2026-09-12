# 개선 실행 가이드 (2026-09 라운드 2 — 검증 부채 정리)

이 문서는 실행 지침이다. 위에서 아래로 따라가면 앞 라운드(ADR-070~073 도입 + dogfood Round 11·12)가 남긴 미해결 항목이 전부 닫힌다. 각 단계는 "현재 → 변경"으로 적었고, 문장 그대로 옮겨도 되는 텍스트는 코드 블록에 두었다. 커밋 메시지는 단계 끝에 있다. 이 문서 자체는 어떤 산출물에서도 링크하거나 인용하지 않는다. 완료 후 삭제한다.

---

## 0. 읽는 법과 전제

- **실행 위치**: 저장소 루트, `main` 브랜치 그대로. 브랜치를 만들지 않는다.
  ```bash
  git branch --show-current   # main 이어야 한다
  git status --short          # 시작 전 깨끗해야 한다
  ```
- **커밋 규율**: `git add`는 파일을 명시 열거한다(`-A`·`.` 금지). `--no-verify`·`--amend`·`push` 금지. 메시지는 Conventional Commits 한 줄. 본 문서가 지정한 지점에서만 커밋한다(더 잘게 나눠도 된다).
- **"현재" 인용은 grep 앵커다**: 각 단계의 `현재:` 문장은 파일에 실재하는 짧은 문자열이다(2026-09-12 실측). 못 찾으면 그 파일의 해당 절을 읽고 같은 뜻의 문장을 찾는다. 줄번호는 참고용이며 정확한 앵커는 문자열이다.
- **ADR 작성 규약**: `docs/90-decisions/boilerplate/_ADR_GUIDE.md`를 따른다. harness surface를 건드리는 ADR은 `## Mutation Contract` **7필드** 필수 — 7번째 «예산 영향»은 ADR-047#amend-3(2026-09-12)으로 이미 채택됐다(«늘리지 않으면 `없음` 한 줄»이 정상). 개정(amendment)의 `### Mutation delta`에도 `예산 영향 = …` 줄을 둔다. 인용은 정규 ID(`ADR-NNN`·`ADR-NNN#amend-M`·`ADR-NNN#dK`) 또는 저장소 관례의 읽기용 shorthand(`ADR-NNN D<k>`, `#amend-M 결정 N` — ADR-045 D1 허용)만 쓰고 줄번호 인용은 금지한다. 다른 파일이 인용하는 amendment 헤딩 위에는 `<a id="adr-NNN-amend-M"></a>`를 둔다. `## Surfaces`에 등재한 파일 본문에는 `ADR-NNN` 역참조를 둔다. 전수 grep은 부록 A의 `EXC` 배열(민감 파일 제외)을 그대로 쓴다.
- **supersede 후 인용 처리**: ADR-045 D10의 5종 분류(A 살아있는 규칙 → 재지정 / B 낡은 지시 → 재작성 / C 배경 서술 → 링크 제거 / D supersede 선언·인덱스 행 → 유지 + `(현재 SSOT: ADR-NNN)` 병기 / E 실행 기록 → 유지 + 병기)를 줄 단위로 적용한다.
- **«규칙은 지금, 탐지기는 나중»의 해석**: 앞 라운드가 보류한 탐지기 중 이번에 만드는 것은 «있는 부품의 조합·정적 검사·기록 등급»으로 한정한다. 이번 라운드에 차단 등급 탐지기는 없다 — 발견 53(뷰포트 커버리지)도 기록 등급 report로 두고, 차단 승격 조건을 P5-5 결정 2에 적었다.
- **에이전트 파일 규칙(이번 라운드의 핵심 관측)**: 이 환경(Claude Code 2026-09 버전·`.claude/agents/` 경로·저장소 루트 세션)에서 `.claude/agents/*.md`를 세션 중에 고치면 **같은 세션의 dispatch에는 반영되지 않았다**(Round 12 발견 74 — 본문 마커 + 0-tool probe, 편집 6분 뒤에도 미반영). 공식 문서는 agents 디렉터리 변경을 감시해 다음 위임에 반영한다고 적고 있으므로 이것은 버전·경로에 한정된 관측이다. 운영 규칙은 안전한 쪽으로 둔다 — **에이전트 파일을 고친 뒤 그 효과의 관측·검증은 새 세션에서 한다.** Phase 1·2는 이 규칙 때문에 존재한다.
- **날짜**: 본 라운드 기준일은 2026-09-12다. ADR·amendment 날짜에 실제 작성일을 쓴다.
- **환경 전제**: Node 20+, npm/pnpm, Flutter SDK(stable) + Android 에뮬레이터(Phase 2·8), 앞 라운드의 dogfood 복제본 2개(Phase 0에서 이전).

---

## 1. 남은 일 총람

앞 라운드 기록(`.boilerplate/validation/SIMULATION_RUN.md` Round 11·12·개정 목록·falsifier 표·Round 13 첫 과제)에서 «수정»으로 닫히지 않은 항목 전부다. 번호는 SIMULATION_RUN의 발견 번호다.

| 구분 | 항목 | 처리 Phase |
|---|---|---|
| Round 13 첫 과제 ③ | amend-8·9(에이전트 본문 규칙)를 새 세션에서 검증 | Phase 1 |
| Round 13 첫 과제 ② | builder 재측정을 조건당 새 세션으로 (a)~(d) | Phase 2 |
| Round 13 첫 과제 ① | ADR-004 통합 재발행(개정 9 > 임계 8) + 세션 고정 관측 반영 + amend-5 오진 정정 | Phase 3 |
| 미측정 falsifier | ADR-004#amend-5·7·8 (Phase 1·2에서 판정), ADR-072#amend-4 (Phase 8 선택 시나리오), ADR-071 (d) HYBRID·ADR-072 (e) 6화면 (재현 불가 — 기록만) | Phase 1·2·8 |
| ADR-005#amend-2 결정 4 | 보일러플레이트 → fork 갱신 절차(어느 경로를 어떤 순서로)는 «후속 라운드 과제»로 남아 있다 — Round 12 발견 73의 원인 | Phase 6 |
| 검토에서 새로 확인된 기존 결함 | 졸업 item 5 계수가 `- **ID** (수용) |` 형식을 못 셈 / `P0 [Spec-gap]`이 IMPROVEMENT_GUIDE에 기록돼 item 5가 못 봄 / stabilize 5-0이 폐쇄 후 수리의 `## 5` `files:`를 회수 안 함 / DESIGN.md §9 주석에 «source-verified current-v2» 잔존 / plan-milestone Exit의 «UI는 draft 유지»가 contract-ready 재진입과 충돌 / validator Evidence 축이 관측 AC의 verify-power 제외를 말하지 않음 | Phase 5·6 |
| 발견 5·16·17 | validate-workitem inline 임계·축 5 spawn 재보정 (ADR-051#amend-4가 예고한 통합 재발행) | Phase 4 |
| 발견 22·31·30 | hollow 매핑 구현 후 관찰(조건부)·계측 속성 도메인·같은 AC 다중 modality 행 | Phase 4 |
| 발견 27·32 | stabilize 5-2b voice grep 범위·5-0 회수 파일 수 echo | Phase 5 |
| 발견 28 | `[Guard-drift]` 방향 구분 + ADR-063 D4 (b) 낡은 문구 | Phase 5 |
| 발견 29 | 6.5 시그널 1 오탐(DISCOVERY `## 12` 갱신) | Phase 5 |
| 발견 25 | Bash 보유 report-only 에이전트의 프로젝트 쓰기 금지 | Phase 5 |
| 발견 20·53·23·40·9·58(자가 검사)·«승인본 충실도» | design gate·design-milestone 보류분 | Phase 5 |
| 발견 19 | visual-qa spec 전제 반영 단언 | Phase 5 |
| 기존 결함 1~11 (앞 가이드 부록 F) | finalize 커밋 실패 / seal↔repair-plan 파일 범위 / repair-plan 폐쇄 가드 / accept 회차 상한 / exec-evidence 신선도 / --migrate 활성 ADR / repair-discovery authority / golden↔CI / marketer·strategist 절 번호 / Surfaces 역참조 10건·죽은 인용 3줄(부록 A 기준선) / geometry known-good | Phase 6 |
| ADR-045 D5·D6 정비 | ADR-072 `## 현재 유효 결정` 부재, ADR-037 요약 미반영(#amend-4), ADR-058 요약 상충 불릿, ADR-045 D6 표 «4개» 잔존, ADR-004 amend-8·9 앵커 부재 | Phase 3·5·7 |
| 기록 | Round 13 절·falsifier 표 갱신·개정 목록 | Phase 8 |

«기록만이 맞는 것»으로 확정된 33(amend-3 이전 승인본의 영구 P1)은 손대지 않는다. dogfood 복제본 안의 열린 finding(가짜 제품 결함)은 harness 작업이 아니다.

---

## 2. 이름·번호 고정표

아래 이름을 그대로 쓴다. 바꾸면 하류 인용이 어긋난다.

**새 ADR (boilerplate, `docs/90-decisions/boilerplate/`)**

| 번호 | 파일명 | 제목 | 대체 관계 |
|---|---|---|---|
| ADR-074 | `ADR-074-model-effort-and-turn-budget-policy.md` | 모델·추론 강도·턴 예산 정책 v2 | **ADR-004 통합 재발행(supersede)** — 9개 개정 흡수 + 세션 고정 관측 |
| ADR-075 | `ADR-075-main-session-orchestration-v2.md` | 메인 세션 오케스트레이션 v2 (fan-out 크기 판정 실측 재보정) | **ADR-051 통합 재발행(supersede)** — 4개 개정 흡수 + 임계·축 신호 재보정 |

**개정(amendment)** — 번호는 2026-09-12 실측 개수 + 1이다.

| 대상 | 번호 | 내용 |
|---|---|---|
| ADR-035 | #amend-4 | §6.5 시그널 1을 mtime에서 «Charter 마지막 커밋 이후 DISCOVERY 변경 hunk 판정(`## 14`·`## 15`·Repair history 제외, `## 12`는 원장 상호참조만이면 제외)»으로 |
| ADR-050 | #amend-2 | Bash 보유 report-only 에이전트(qa·validator)의 프로젝트 트리 쓰기 금지 + 임시 스크립트 실행 방식 |
| ADR-005 | #amend-3 | 보일러플레이트 → fork 갱신 절차(순서·제외 규칙·확인 명령) — #amend-2 결정 4가 미룬 «새 경로» |
| ADR-058 | #amend-5 | visual-qa spec의 seed 반영 단언(vacuous pass 차단) + `## 현재 유효 결정` 상충 불릿 정정 |
| ADR-059 | #amend-2 | golden 테스트 태그(`@Tags`·`dart_test.yaml`) + CI 진입점 `validate:ci`(golden 제외) |
| ADR-063 | #amend-1 | D4 (b) copied-from 4방향 판정(canonical 갱신 / 사본 수정 / registry만 낡음 / 둘 다) + 낡은 «digest» 문구 정정 |
| ADR-066 | #amend-2 | 재확인 전용 라운드(`- invalidated` AC만)는 라운드 카운터를 소모하지 않음 |
| ADR-072 | #amend-5 | `--tokens-only` 스타일 객체 숫자·`Colors.transparent` 정합 / Flutter report (상태 × 뷰포트) 항목 + `viewport-coverage` report(기록 등급) + R4 group·PNG 규약 / 자가 검사 (e) 렌더 조건 / 하네스 주입·행동 변경 정적 관찰(기록 등급) / R1 화면 정의 / R6-5 «승인본 충실도» 묶음 / D8 재진입 상태 문구 |
| ADR-073 | #amend-2 | «UI surface 파일 집합» 정의(canonical) / 5-2b voice grep 대상·따옴표 문자열 한정·기록 등급 / 5-0 회수 출처 (d) `## 5` files + 파일 수 echo + `[Stabilize-scope-empty]` / `P0 [Spec-gap]` → QA_FINDINGS |

**참조 갱신 줄만 두는 ADR**: ADR-064 D4(exec-evidence 미확보 기록), ADR-045 D6(표 «4개» 행 끝에 #amend-1 임계 8 병기 — 원행은 Record 보존), ADR-037(Spec-gap 기록 위치 병기 + `## 현재 유효 결정` 불릿).

**라벨 신설**: `[Design-behavior-drift]`(승인 컴포넌트 행동 변경 고지 누락 — 기록 등급), `[Harness-injection-suspect]`(스토리 데코레이터·위젯 wrapper에 가시 요소 의심 — 기록 등급), `[Exec-evidence-stale]`(repair가 실행 증거를 재확보하지 못했다고 기록), `[Stabilize-scope-empty]`(preflight 회수 파일 0건 — 5-x 미실행), `[Modality-split-needed]`(한 AC에 modality 행이 둘). 게이트 report의 rule 이름 `viewport-coverage`·`harness-injection-suspect`는 라벨이 아니라 report 항목이다.

**용어**: «UI surface 파일 집합» = 웹 `*.tsx *.jsx *.vue *.svelte *.astro *.html *.css *.scss *.sass *.less` + Flutter `lib/**/*.dart` 중 경로에 `screens/`·`widgets/`·`features/`·`theme/`·`prototype/` 포함. «테스트 파일 집합» = `test/**`, `tests/**`, `__tests__/**`, `e2e/**`, `integration_test/**`, `**/*.test.*`, `**/*.spec.*`, `**/*_test.dart`. «문서 집합» = `docs/**`. **정의의 소유자**: UI surface 파일 집합은 ADR-073#amend-2(디자인 표면 — Phase 5), 테스트·문서 집합은 ADR-075 D11(크기 판정 — Phase 4). 다른 스킬·ADR은 그 둘을 인용만 한다(ADR-005 «정의 1곳»).

**dogfood 복제본 경로(Phase 0에서 이전 후)**: `~/harness-dogfood/dogfood-web`, `~/harness-dogfood/dogfood-flutter`, 도구 `~/harness-dogfood/tools/`.

---

## 3. 실행 순서와 의존 관계

```
Phase 0 준비 (복제본 이전 · 복제본 harness를 현재 main으로 동기화 · 검사 스크립트 · 기준선)
Phase 1 새 세션 검증 ③            ← 에이전트 파일은 세션 시작에 고정되므로 새 세션에서만 가능. Phase 3의 입력.
Phase 2 builder 재측정 ② (a)~(d)  ← 조건당 새 세션. Phase 3 D5·D8의 입력.
Phase 3 ADR-074 (ADR-004 재발행)   ← Phase 1·2 결과를 담는다. 에이전트 파일 인용 재지정.
         └ ADR-074 본문이 미발행 ADR-075를 링크하므로 Phase 3 커밋 시점엔 검사 1이 `MISSING ADR-075` + `BAD-LINK-TARGET` 2건을 낸다(회귀가 아니다 — Phase 4 발행으로 닫히고 P8-1이 최종 관문).
Phase 4 ADR-075 (ADR-051 재발행) + validate-workitem 재보정 ← 독립(Phase 3과 순서 무관하나 인덱스 행 충돌을 피하려 뒤에 둔다).
Phase 5 stabilize·게이트 보류 발견 묶음 (ADR-035·050·058·063·072·073 개정) ← 독립(ADR-075 D12가 ADR-073#amend-2 결정 1을 앞서 인용하는 전방 참조는 P8-1 검사 2의 앵커 실재로 닫힌다). 인덱스 행 순서 때문에 Phase 4 뒤.
Phase 6 기존 결함 11건               ← 독립. Phase 5의 게이트 자가 검사 변경 뒤(P6-11이 같은 함수를 만진다).
Phase 7 ADR 요약·인덱스 정비         ← Phase 3~6 뒤.
Phase 8 검증·기록·마감               ← 전부 뒤. 새 세션 1회 이상 필요(에이전트 파일 변경분 확인).
```

Phase 안의 단계 번호(`P1-1` 등)는 순서다. 한 Phase 안에서 ADR을 먼저 쓰고 surface를 고친다.

---

## Phase 0. 준비

### P0-1. 상태 확인
```bash
git status --short && git log --oneline -1
ls docs/90-decisions/boilerplate/ | grep -E 'ADR-07[45]' ; echo "(비어 있어야 정상)"
grep -c '^## Amendment' docs/90-decisions/boilerplate/ADR-004-model-alias-policy.md   # 9
grep -c '^## Amendment' docs/90-decisions/boilerplate/ADR-051-*.md                   # 4
```
074·075가 비어 있어야 한다. 아니면 다음 빈 번호로 밀고 본 문서의 번호를 전부 치환한다.

### P0-2. dogfood 복제본·도구 이전(휘발 경로 → 영속 경로)
앞 라운드의 복제본은 이전 세션의 scratchpad(`/private/tmp/claude-501/-Users-kbw-Desktop-dev-agentic-dev-harness/<session-id>/scratchpad/`) 아래에 있어 재부팅·정리로 사라질 수 있다. 먼저 옮긴다.
```bash
OLD=$(ls -d /private/tmp/claude-501/-Users-kbw-Desktop-dev-agentic-dev-harness/*/scratchpad/dogfood-web | head -1 | xargs dirname)
NEW=$(ls -d /private/tmp/claude-501/-Users-kbw-Desktop-dev-agentic-dev-harness/*/scratchpad/set-cond.py | head -1 | xargs dirname)
mkdir -p ~/harness-dogfood/tools
cp -R "$OLD/dogfood-web" "$OLD/dogfood-flutter" ~/harness-dogfood/
cp "$NEW/set-cond.py" "$NEW/check-cond.sh" ~/harness-dogfood/tools/ 2>/dev/null || true
cp "$OLD/exp-slice-prompt.txt" "$OLD/experiment-plan.md" ~/harness-dogfood/tools/ 2>/dev/null || true
(cd ~/harness-dogfood/dogfood-web && git log --oneline -1 && git status --short | head -3)      # a28f90c, clean
(cd ~/harness-dogfood/dogfood-flutter && git log --oneline -1 && git status --short | head -3)  # 0530a1e, clean
```
`set-cond.py`·`check-cond.sh`는 옛 Round 12 버전(인자 3개·옛 scratchpad 경로)이므로 **부록 B 버전으로 덮어쓴다**(2026-09-12 덮어씀 — `diff`로 부록 B와 같은지 확인). 두 복제본의 harness 사본은 dogfood-web이 `13f6485`, dogfood-flutter가 `f4d8b0d` 기준이다 — P0-2b에서 지금 한 번, P8-2에서 다시 한 번 동기화한다.

### P0-2b. 복제본 harness를 현재 main으로 동기화 (Phase 1·2의 전제)
dogfood-web의 harness 사본은 amend-8·9 이전 시점이다(`13f6485`: reviewer `maxTurns: 12`, planner에 «쓴 파일 목록»·«골격만으로 먼저 쓴다» 0건). dogfood-flutter(`f4d8b0d`)는 harness 파일이 이미 현재와 byte 동일해 커밋이 생기지 않는 것이 정상이다(2026-09-12 실측). 이대로 Phase 1을 돌리면 옛 정의를 재는 것이라 결과가 무효다. ADR-005#amend-2 결정 1~3(`presence: generated` 행 보존, 디렉터리 통째 동기화 금지)을 지켜 **파일 단위**로 맞춘다.
```bash
SHA=$(git rev-parse --short HEAD)   # 보일러플레이트(현재 디렉터리 = 저장소 루트)의 sha — 복제본 커밋 메시지에 쓴다
for f in dogfood-web dogfood-flutter; do
  D=~/harness-dogfood/$f
  rm -rf "$D/.claude/agents" "$D/.claude/skills" "$D/.agents"                       # 전 행 baseline인 경로만 비운다(복제본의 settings.local.json·worktrees/ 같은 로컬 파일은 남는다)
  git archive HEAD -- .claude .agents AGENTS.md docs/90-decisions/boilerplate docs/00-meta/_templates docs/30-workitems/_templates | tar -x -C "$D"   # tracked 파일만 추출 — project/ ADR·STACK_SETUP_PLAN.md(generated)는 건드리지 않는다
  for m in STRUCTURE WORKFLOW DELEGATION_STRATEGY GUARDRAILS_STRATEGY PROJECT_START_CHECKLIST; do cp "docs/00-meta/$m.md" "$D/docs/00-meta/"; done
  (cd "$D" && git status --porcelain -- docs/00-meta/STACK_SETUP_PLAN.md docs/90-decisions/project | wc -l)   # 0 이어야 한다
  (cd "$D" && git add -A -- .claude .agents docs/90-decisions/boilerplate docs/00-meta docs/30-workitems/_templates AGENTS.md && git commit -qm "chore: sync harness to $SHA, preserving generated artifacts")
done
```
`git add -A -- <경로>`는 열거한 경로 안에서만 동작한다(복제본 안에서의 동기화 커밋이라 허용). `CLAUDE.md`·`.codex/`·`.gitignore`는 Phase 1·2 결과에 영향이 없어 여기서는 건드리지 않고 P8-2(정식 절차)가 맞춘다. 동기화 뒤 **복제본 루트에서 연 세션**으로 두 복제본에서 `/stack-guard`를 한 번씩 돌려 `scripts/design-gate.mjs` 사본을 재실행 계약대로 갱신한다(무수정 사본은 새 canonical로 교체 + `copied-from` 갱신). dogfood-web은 사본이 registry와 같고 canonical과 다르므로 교체되고, dogfood-flutter는 사본이 이미 canonical과 같고 registry만 낡았는데, 현재 재실행 계약은 «사본 sha == copied-from일 때만 교체»라 이 경우를 «local modification(빈 diff) + 사용자 결정»으로 보고한다 — «registry 갱신»을 택한다(P5-2 결정 3이 이 경우를 자동 처리로 바꾼다)(2026-09-12 실측 sha: web canonical `faeaadf0`·사본 `e0cb8fc1`·registry `e0cb8fc1` / flutter canonical `faeaadf0`·사본 `faeaadf0`·registry `700eea38`).

### P0-2c. 실험 사본 위치
Phase 2의 실험 사본은 저장소 밖이 아니라 **저장소 안** `.dogfood-exp/`에 둔다(세션 cwd 밖 쓰기의 권한 프롬프트·범위 규율 마찰 회피). 커밋 대상이 아니므로 `.gitignore`가 아니라 로컬 전용 제외에 적는다:
```bash
echo ".dogfood-exp/" >> .git/info/exclude
```

### P0-3. 참조 무결성 검사 스크립트 저장 + 기준선
부록 A를 `/tmp/check-refs.sh`로 저장하고(`chmod +x`) 두 모드를 돌려 기준선을 적어 둔다.
```bash
bash /tmp/check-refs.sh > /tmp/improve-baseline.txt 2>&1; tail -1 /tmp/improve-baseline.txt      # 2026-09-12 기준 FAIL(검사 3 = 7) — 아래 실측 참조
bash /tmp/check-refs.sh --all-surfaces --all-dead >> /tmp/improve-baseline.txt 2>&1
grep -E "^count:" /tmp/improve-baseline.txt
```
2026-09-12 실측(부록 A 스크립트 그대로): **기본 모드 FAIL — 검사 3 `count: 7`**(`ADR-050 → bootstrap-project·finalize-workitem·implement-workitem·repair-plan·stack-guard·validate-plan` 6건 + `ADR-035 → plan-workitem` 1건 — ROUND_ADRS에 050·035가 들어 있어 기본 모드에서도 잡힌다), 전체 모드 검사 3 = 9(위 6 + ADR-009·047 + ADR-038 SURFACE-MISSING), 검사 4 = 3(ADR-073:101·146의 ADR-056 인용 2줄 + STRUCTURE.md:126). 앞 라운드의 «검사 4 = 11»은 구 스크립트 수치이며, 부록 A가 superseding ADR 자기 본문(ADR-068 안의 ADR-067)을 자동 제외하므로 3이 맞다. Phase 6 P6-10이 셋을 전부 0으로 만든다.

### P0-4. 읽을 파일(한 번)
`AGENTS.md`, `docs/00-meta/{STRUCTURE,WORKFLOW,DELEGATION_STRATEGY}.md`, `docs/90-decisions/boilerplate/_ADR_GUIDE.md`, `ADR-045`(D5·D6·D10), `ADR-047`(D3), `.boilerplate/validation/SIMULATION_RUN.md`의 `## Round 13 첫 과제`·`## Phase 7 개정 목록`·`## Falsifying evaluation 항목별 결과`·`## Builder Effort Experiment`. 그 외는 각 단계에서 지정한다.

---

## Phase 1. 새 세션 검증 — amend-8·9와 세션 고정 규칙 (Round 13 첫 과제 ③)

목표: 앞 라운드가 에이전트 파일에 넣었으나 같은 세션이라 한 번도 실행되지 않은 규칙(ADR-004#amend-8 결정 3 부분 보고 형식, #amend-9 결정 1 write-first, #amend-9 결정 2 reviewer 24)을 **새 세션**에서 관측한다. 결과는 Phase 3의 ADR-074 D9·D8에 그대로 들어간다.

**전제**: 이 Phase는 Phase 0 뒤 **새 Claude Code 세션**을 저장소 루트에서 열어 시작한다. 같은 세션에서 P1-1을 돌리면 결과가 무효다.

### P1-1. 0-tool probe — 본문 규칙이 live인지 확인
세 에이전트를 도구 없이 한 번씩 띄워 자기 지시문을 확인시킨다. `Agent` 도구로 아래 프롬프트를 그대로 보낸다(subagent_type = planner / reviewer / builder).
```
도구를 쓰지 말고 네 지시문(시스템 프롬프트)만 보고 답하라. 다음 세 문구가 네 지시문에 있으면 각각 YES, 없으면 NO를 한 줄에 적어라. 다른 말은 쓰지 마라.
1) «쓴 파일 목록 + 남은 것 1줄»
2) «골격만으로 먼저 쓴다»
3) «턴 수를 세려 하지 마라»
답 형식: probe=<agent> 1=<YES|NO> 2=<YES|NO> 3=<YES|NO>
```
기대: planner·builder는 1·2·3 전부 YES, reviewer는 2·3 YES + 1은 NO(2026-09-12 실측 — reviewer 본문에는 amend-8 결정 3 문장이 없다. Phase 3 P3-3에서 통일한다). 소요는 각 2초 안팎, tool_uses 0. 기대와 다르면 파일 내용과 세션 시작 시각을 대조해 SIMULATION_RUN에 사실만 적는다.

### P1-2. amend-9 결정 2 — reviewer 24턴으로 `/validate-plan` 완주
```bash
cd ~/harness-dogfood/dogfood-web
```
새 세션을 **복제본 루트**에서 연다(P0-2b 동기화 뒤라 복제본의 `.claude/agents/reviewer.md`가 `maxTurns: 24`인지 먼저 `grep -n maxTurns .claude/agents/reviewer.md`로 확인). `/validate-plan M1`을 실행한다 — 메인 세션 인라인 스킬이다(ADR-050 D1·DELEGATION 37행: 호출한 세션이 reviewer 페르소나의 12차원을 직접 적용한다. Round 12의 reviewer 위임 실행은 ad hoc이었다). **2026-09-12 실측: dispatch 0회로 완주(tool_uses 19)** — 따라서 reviewer `maxTurns: 24`는 여기서 시험되지 않는다. 그 실측 자리는 P8-3 (c)의 stabilize 단계 5 reviewer dispatch다. M1은 봉인돼 있지만 validate-plan은 읽기 전용 리뷰라 실행 가능하다. 관측할 것: (i) reviewer dispatch가 **회수(재개) dispatch 없이 완전한 보고**를 냈는가 — `tool_uses`는 턴 수가 아니므로 판정 근거로 쓰지 않는다(Round 12 실측: 12턴 상한에서 tool_uses 29), (ii) `docs/40-validation/plan-reviews/M1.*.md`가 생겼는가. 끝나면 그 리뷰 파일은 `/repair-plan M1`을 돌리지 않고 삭제한다(`rm docs/40-validation/plan-reviews/M1.*.md` — 봉인된 M의 리뷰를 남기면 implement 착수 게이트가 막힌다). P8-3 (f)(ii)에서 repair-plan의 산하 파일 회수를 시험하려면 그때 다시 만든다.

### P1-3. amend-8 결정 3 + amend-9 결정 1 — 상한 도달 시 부분 보고 형식과 write-first
planner를 **일부러 상한에 걸리게** 띄운다. 복제본 루트(dogfood-flutter)에서 연 **새 세션**에서 `Agent`(subagent_type = planner)로:
```
프로젝트 루트: ~/harness-dogfood/dogfood-flutter
아래 7개 파일을 docs/30-workitems/tasks/_probe/ 아래에 만들어라(디렉터리 생성 포함). 각 파일은 F-002 feature 문서(docs/30-workitems/features/F-002-*.md)의 ## 3 시나리오를 근거로 task 문서 골격(## 0 Status, ## 1 목적, ## 2 범위, ## 3 구현 항목 5개, ## 6 AC 3개)을 채운 것이어야 한다. 파일명: T-P01.md ~ T-P07.md.
읽어야 할 문서: F-002 feature 문서, docs/30-workitems/_templates/TASK_TEMPLATE.md, docs/20-system/DESIGN.md, docs/20-system/prototypes/M1/manifest.json, docs/10-charter/PROJECT_CHARTER.md.
```
관측: (i) 상한(20)에 걸렸는가, (ii) 걸렸다면 반환문이 «쓴 파일 목록 + 남은 것 1줄» 형식인가(amend-8 결정 3), (iii) **첫 `Write` 이전에 연 입력이 몇 건인가** — «새 입력을 더 열기 전에 파일이 디스크에 있어야 한다»의 검증(amend-9 결정 1). **반환 시점의 파일 실재만으로는 일괄 후작성과 구분되지 않으므로 그것을 근거로 쓰지 않는다**(2026-09-12 실측이 이 함정에 걸렸다). subagent 실행 로그(`~/.claude/projects/<slug>/subagents/agent-*.jsonl`)의 도구 호출 순서에서 첫 `Write`의 순번·그 앞의 Read/Glob 수·파일당 `Write` 횟수(1회 완성본인가 골격 후 갱신인가)·`미검토:` 줄 수를 본다, (iv) 상한에 안 걸리고 끝났으면 «형식 검증 불가(미도달)»로 적고 (iii)만 판정한다. 끝나면 `rm -r docs/30-workitems/tasks/_probe`.

### P1-4. 기록
`.boilerplate/validation/SIMULATION_RUN.md` 끝의 `## Builder Effort Experiment` 절 **앞**에 새 절을 만든다.
```markdown
## Round 13 (2026-09-XX~, 검증 부채 정리 — 세션 고정 규칙·재측정·재발행)

### 새 세션 검증 (첫 과제 ③)
| 항목 | 방법 | 관측 | 판정 |
|---|---|---|---|
| 0-tool probe (planner/reviewer/builder) | P1-1 프롬프트 | probe=… 3줄 | live / 불일치 |
| amend-9 결정 2 reviewer 24 | `/validate-plan M1` (dogfood-web) | tool_uses N · 회수 K회 | 완주 / 미완주 |
| amend-8 결정 3 부분 보고 형식 | planner 7파일 probe | 상한 도달 여부 · 반환 형식 | 형식 준수 / 위반 / 미도달 |
| amend-9 결정 1 write-first | 같은 dispatch (실행 로그의 도구 호출 순서) | 첫 Write 이전 입력 N건 · 파일당 Write 횟수 · `미검토:` 줄 수 | 준수 / 미준수 |
```
falsifier 판정을 같은 절에 적는다: amend-8 (a) «쓰기 에이전트 보고 0건 상한 도달 1회라도» → 발화 여부, amend-9 (a) «상한 중단 + 산출물 파일 0건» → 발화 여부, (b) «골격만 쓰고 미검토 절반 초과» → 발화 여부. **여기서 발화한 것이 있으면 Phase 3 D9·D14의 분기를 따른다.** 발화가 없더라도 **D9의 어느 항목이 「지시 적재 + 실행 미준수」로 나오면** 그 항목은 되돌리지 않고 Phase 3에서 신뢰도 하향 + 재검토 트리거로 처리한다 — 단일 표본으로 규칙을 빼지 않는다(P2-3·P4-1과 같은 규율).

### P1-5. 커밋
```
docs(validation): verify session-start agent rules and budget instructions in a fresh session
```

---

## Phase 2. builder 재측정 — 조건당 새 세션 (Round 13 첫 과제 ②)

목표: ADR-004#amend-5 결정 4가 요구한 n=2를 «조건마다 세션을 새로 여는» 프로토콜로 얻는다. 조건 (a)는 Round 12에서 실측 1건이 있다(SIMULATION_RUN `## Builder Effort Experiment` — T-002-today-list-wiring, 333,073ms · tool_uses 34 · 토큰 74,935 · AC 3/3). (a)~(d)를 같은 task·같은 프롬프트로 잰다.

| 조건 | maxTurns | effort | 상태 |
|---|---:|---|---|
| (a) 현재 기준값 | 60 | — (상속) | Round 12 실측 1건 있음 — **이번에 같은 본문·프롬프트로 다시 잰다**(옛 실측은 amend-8·9 이전 본문) |
| (b) effort만 | 60 | medium | 이번에 측정 |
| (c) 턴만 낮춤 | 20 | — (상속) | 이번에 측정 |
| (d) 둘 다 | 20 | medium | 이번에 측정 |

### P2-1. 사본·프롬프트 준비(한 번)
```bash
# 저장소(보일러플레이트) 루트에서 실행 — 사본은 .dogfood-exp/ 아래에 생긴다(P0-2c)
FL=~/harness-dogfood/dogfood-flutter
BASE=$(git -C "$FL" log --format=%H --diff-filter=A -- apps/mobile/lib/features/habits/today_list_controller.dart | tail -1)^   # T-002가 만든 컨트롤러의 생성 커밋 부모 = 매니페스트·승인 UI는 있고 T-002는 미구현
git -C "$FL" show --stat --oneline "$BASE" | head -3
for c in a b c d; do rm -rf .dogfood-exp/exp12-$c; mkdir -p .dogfood-exp/exp12-$c; git -C "$FL" archive "$BASE" | tar -x -C .dogfood-exp/exp12-$c; done
for c in a b c d; do (cd .dogfood-exp/exp12-$c/apps/mobile && flutter pub get >/dev/null && echo "exp12-$c ok"); done
```
컨트롤러 경로가 다르면 `git -C "$FL" log --oneline -- docs/30-workitems/tasks/T-002-today-list-wiring.md`로 `## 0. Status`가 `done`으로 바뀐 커밋을 찾아 그 부모를 쓴다. BASE 시점에 `docs/20-system/prototypes/M1/manifest.json`과 승인 UI(`apps/mobile/lib/screens/today_list/today_list_screen.dart`)가 실재하는지 `git -C "$FL" show "$BASE" --stat`으로 확인한다(check-cond.sh가 둘 다 요구).

slice 프롬프트는 `~/harness-dogfood/tools/exp12-slice-prompt.txt`로 **한 번** 만들고 네 조건에 바이트 동일하게 쓴다(루트 경로 한 줄만 조건별로 치환). 내용은 T-002 task 문서 `## 3` 전체 + `## 6` AC 3건 + `## 6-1` 테스트 이름 + 구현 규율(모듈 부재·컴파일 오류로 테스트 0건 실행은 Red가 아니다) + 보고 형식 4항목 — Round 11의 `exp-slice-prompt.txt`(부록 B-3 골격)와 같은 모양이다. 승인 UI 파일(`today_list_screen.dart`)은 바이트 무변경이어야 한다는 문장을 넣는다.

### P2-2. 조건별 절차(4회 반복 — 조건마다 **새 세션**)
1. 저장소 루트에서 builder.md를 그 조건으로 바꾼다(부록 B-1 `set-cond.py`): `python3 ~/harness-dogfood/tools/set-cond.py <a|b|c|d>`. 이 편집은 **커밋하지 않는다**.
2. **새 Claude Code 세션**을 저장소 루트에서 연다.
3. 0-tool probe: `Agent`(builder)에 «도구를 쓰지 말고 네 지시문 첫 문단에 있는 `측정 조건` 줄을 그대로 한 줄로 답하라» → `조건=<c> turns=<N> effort=<e>`가 오면 반영 확인. 오지 않으면 세션을 닫고 2로 돌아간다(그 사실을 기록).
4. `Agent`(builder)로 slice 프롬프트를 보낸다(루트 = `<저장소>/.dogfood-exp/exp12-<c>` — cwd 안이라 권한 마찰이 없다). task-notification의 `duration_ms`·`tool_uses`·subagent 토큰을 적는다. 상한 중단 시 회수 규율 ①(1회 재개)을 적용하고 회수 턴을 센다. **반환 뒤 subagent 실행 로그(`~/.claude/projects/<slug>/subagents/agent-*.jsonl`)에서 「첫 `Write`/`Edit` 이전에 연 입력 수」도 적는다** — D9-2 준수 신호이고 Phase 1이 n=1이라 여기서 4건을 더 얻는다. slice 프롬프트(부록 B-3)에는 Phase 1 probe와 달리 「읽어야 할 문서」 목록이 없어 그 교란 요인이 빠진 조건이다.
5. 사후 검증: `bash ~/harness-dogfood/tools/check-cond.sh <c>`(부록 B-2) — 승인 UI 바이트 무변경 / 컨트롤러·테스트 파일 실재 / `flutter analyze` / AC 테스트 3건 통과 / Red 보고 완전성(반환문에 AC별 어설션 실패 인용).
6. 원복: `git checkout -- .claude/agents/builder.md`.

### P2-3. 판정과 기록
SIMULATION_RUN `## Round 13` 절에 «### builder 재측정 (첫 과제 ②)» 표를 붙인다(열: 조건·maxTurns·effort·소요·tool_uses·토큰·완료 AC·validate·회수 턴·Red 보고·첫 쓰기 이전 입력 수). 판정 규칙(ADR-074 D5의 3갈래를 그대로 쓴다):
- 비교 기준은 **이번에 다시 잰 (a)**다(옛 Round 12 (a)는 본문이 달라 참고만). (b)·(d)가 (a)보다 완료율·검증에서 나쁘거나, 저하 없이 소요·토큰이 1.5배 이상이면 → «effort 미지정 유지» 확정(Round 11 결론 재현).
- (b)·(d)가 (a)보다 소요·토큰에서 유의하게 빠르고 완료율 동일이면 → Round 11과 상반 — ADR-074 D5에 «스택별 상이 — 결론 보류, Round 14 재측정» 으로 적는다(값을 뒤집지 않는다: n=1 대 n=1).
- (c)·(d)가 20턴에서 잘리면 → «maxTurns 60 유지» 확정(amend-5 falsifier 판정).
- **n=2의 의미**: Round 11(웹)과 Round 12·13(Flutter)은 플랫폼·task가 다르므로 «같은 결론이 다른 스택에서도 서는가»로만 읽고 그 한계를 결론 문장에 적는다.

### P2-4. 커밋
```
docs(validation): record builder budget re-measurement under per-session conditions
```

---

## Phase 3. ADR-004 통합 재발행 → ADR-074 (Round 13 첫 과제 ①)

목표: 개정 9개(임계 8 초과, amend-4~9는 ADR-045 이후라 grandfather 아님)를 클린 본문으로 재발행한다. 앞 라운드의 오진(amend-5 «hot-reload 지연», amend-4 «세션 effort를 덮는다» 전제)을 정정하고, Phase 1·2 결과를 담는다.

### P3-1. ADR-074 작성 — `docs/90-decisions/boilerplate/ADR-074-model-effort-and-turn-budget-policy.md`
아래 골격을 그대로 채운다. `<Phase 1 결과>`·`<Phase 2 결과>` 자리는 SIMULATION_RUN Round 13 절의 값으로 채운다.

```markdown
# ADR-074 — 모델·추론 강도·턴 예산 정책 v2 (Model, Effort & Turn-Budget Policy)

> scope: boilerplate
> area: tooling/process

## Status
accepted

> 대체: [ADR-004](ADR-004-model-alias-policy.md)를 통합 재발행으로 supersede한다(개정 9개 — ADR-045 D6 임계 초과, amend-4~9는 grandfather 대상 아님). ADR-004는 `superseded`로 history 잔존. 본 ADR은 ADR-004 base + amend-1~9의 net 규칙에 **에이전트 정의의 세션 고정 관측(D12)**을 더한 것이다. 오케스트레이션(foreman·fan-out·slice 분할 주체)은 [ADR-075](ADR-075-main-session-orchestration-v2.md), 하청 회수 규율도 그쪽이 소유한다.

## 현재 유효 결정
- shared 설정 파일에는 모델·추론 강도 키를 두지 않는다(D1). 별칭은 agent frontmatter `model:`에서만(D2). `effort`는 허용 축이나 현재 어느 agent에도 지정하지 않는다(D5).
- 턴 예산은 «쓰기 도구 보유» 축으로 잡고 산식 `maxTurns = max(8, 회수 문서 수) + 3 × 산출물 수`, builder 60 예외(D8). 본문 예산 절에는 «산출물을 먼저 나열한다 + 턴 수를 적지 않는다»만 남긴다 — 행동 지시 3종(중간 보고·write-first·부분 보고 형식)은 실측에서 각각 미준수·미준수·성립 불가로 판명돼 제거했고, 상한 중단 회수는 호출자 몫이다(D9·D10).
- 에이전트 정의는 세션 시작 시점에 고정된다 — 파일 수정 후 검증은 새 세션에서(D12). 재측정은 조건당 새 세션(D13).

## 배경
- [관측됨] ADR-004는 base 결정 + 개정 9개가 쌓여 net 규칙을 한 번에 읽을 수 없다. amend-6→7→8→9는 같은 날 falsifier 발화로 연쇄됐고 서로를 부분 대체한다.
- [관측됨] amend-4는 «frontmatter `effort`가 세션 effort를 덮고 몇 초 안에 반영된다»를 [외부실증]으로 전제했고 amend-5는 «hot-reload 지연»으로 진단했다. Round 12 발견 74가 둘 다 정정한다 — 세션 중 편집한 에이전트 정의는 그 세션의 dispatch에 **반영되지 않는다**(본문 마커 + 0-tool probe, 편집 6분 뒤에도 미반영). 변형 파일(`builder-a`~`d`)도 세션 시작 후 생성되면 같은 이유로 보이지 않는다.
- [관측됨] builder `effort: medium`은 완료율 이득 없이 소요·토큰 약 2배(Round 11 n=1). <Phase 2 결과 한 줄>.
- [관측됨] 팬아웃 단위가 보고 0건으로 상한에 걸린 관측 7건(Round 11·12) — 원인은 예산 축 오분류(쓰기 에이전트를 report-only로 취급)와 위임 단위 크기였다. <Phase 1 결과 한 줄 — amend-8·9 규칙이 새 세션에서 어떻게 관측됐는가>.

## 결정

### D1. shared 설정 파일 비고정 (ADR-004 base + #amend-2·#amend-3 승계)
`.claude/settings.json`·`.codex/config.toml`에 모델·추론 강도 키를 두지 않는다. 사용자 계층과 CLI 기본값이 승계한다. Codex는 별칭이 없으므로 키 생략이 곧 자동 최신 경로다(ADR-010#amend-6).

### D2. 별칭의 자리 (base + #amend-1·#amend-3 승계)
`sonnet`/`opus`/`haiku` 별칭은 `.claude/agents/<name>.md` frontmatter `model:`에서만 쓴다. 전체 버전 ID 금지. agent 이름은 역할 중심이며 모델명을 붙이지 않는다.

### D3. 예외 절차 (base 결정 3 승계)
특정 버전·강도를 강제해야 하면 별도 ADR에 사유와 갱신 책임자를 남기고 그 자리에서만 고정한다.

### D4. Codex parity (#amend-4 결정 6 승계)
Codex는 `.claude/agents/*.md`를 읽지 않으므로(persona 매핑 없음 — ADR-010) 본 ADR의 agent 축은 Codex 경로에 영향이 없다. `.codex/config.toml`의 비지정 정책은 D1이 소유한다.

### D5. `effort` 축 (#amend-4 결정 1·4 + #amend-5 결정 1·2·3 승계 + 정정)
- `effort: low|medium|high|xhigh|max`는 agent frontmatter에서만 허용되는 축이다. **현재 어느 agent에도 지정하지 않는다** — 세션 effort를 상속한다.
- 판정 3갈래(역할별 실험 결과에 적용): 저하 없이 시간이 줄면 확장 후보 / 완료율·검증이 나빠지면 제거 / **저하 없이 시간·토큰이 늘면 제거**. builder는 세 번째 갈래로 제거됐다(Round 11: medium 338.9s·309.5s 대 상속 132.5s·161.8s). <Phase 2 (b)(d) 결과 한 줄 + 판정>.
- 사용자 환경: 메인 세션은 사용자 계층에서 `high` 이상을 권장하고, `CLAUDE_CODE_EFFORT_LEVEL`을 전역 환경변수로 두지 않는다(두면 agent `effort`가 무력화된다).
- «frontmatter effort가 세션 effort를 덮는다»는 문서상 사양이며 본 저장소에서 직접 실측되지 않았다(effort를 지정한 조건은 세션 시작 뒤 편집이라 D12에 걸렸다). 실측은 D13 프로토콜로만 유효하다.

### D6. builder `maxTurns` (#amend-4 결정 2 → #amend-5 → #amend-7 결정 2 승계)
builder는 `maxTurns: 60`이다. 45에서 상한 중단 2건(Round 12 R4 — 작업이 거의 끝난 자리)이 관측돼 60으로 올렸다. <Phase 2 (c)(d) 결과 — 20에서 잘렸는가>. 60에서도 보고 0건 상한 도달이 1회라도 나면 값이 아니라 slice 크기 문제다(D9-2 — foreman 집행은 ADR-075 D1).

### D7. 예산 축 = 쓰기 도구 보유 (#amend-8 결정 1 + #amend-9 결정 2 승계)
`Write`·`Edit`를 가진 agent(builder·planner·architect·designer·reviewer)는 «쓰는 쪽»이고 산출물 규모로 예산을 잡는다. report-only(qa·validator·researcher·analyst·security·marketer·counsel·strategist)는 보고 1건이 산출물이다. reviewer는 쓰기 도구가 있고(review-doc 리뷰 파일) 회수 문서가 많은 dispatch(stabilize 단계 5 code·design surface, design-milestone R6-4 렌더 증거)를 받으므로 쓰는 쪽 산식을 적용한다(amend-8의 예외를 amend-9가 철회). `/validate-plan`은 세션 인라인 실행이라 이 예산의 대상이 아니다(Round 13 Phase 1 실측 — amend-9 배경의 «validate-plan 15+ 문서»는 Round 12의 ad hoc 위임 실행 기록이다).

### D8. 산식과 현재 값 (#amend-9 결정 3 승계)
`maxTurns = 읽기 예산 + 3 × 산출물 수`, 읽기 예산 = `max(8, 회수 문서 수)`. builder는 60 예외(slice 단위 구현 + 검증). 현재 값:

| agent | maxTurns | 근거 |
|---|---:|---|
| builder | 60 | D6 |
| reviewer | 24 | 읽기 max(8, ~12: stabilize 단계 5 code/design surface·R6-4 렌더 증거) + 3×4 = 24 — **미실측**(실측 자리는 `/stabilize-milestone` 단계 5의 reviewer dispatch다. `/validate-plan`은 세션 인라인이라 대상이 아니다 — D7) |
| planner · designer · architect | 20 | 읽기 8 + 3×4 |
| counsel · strategist | 20 | 자문 문서 회수량 |
| qa · validator · analyst · security · marketer | 16 | 보고 1건 |
| researcher | 12 | 보고 1건, 회수 소량 |
값을 바꾸면 이 표와 frontmatter를 같은 커밋에서 고친다(손 동기화 — 어긋나면 표가 아니라 frontmatter가 SSOT다).
#amend-9 결정 4(«회수 문서 10개 이상이면 축·범위를 나눈다»)는 dispatch 분할 규칙이라 본 ADR이 아니라 ADR-075 D11 (b)가 승계한다.

### D9. 에이전트 본문의 예산 절 — 행동 지시를 걷어낸다 (#amend-6 결정 2·#amend-8 결정 3·#amend-9 결정 1을 **실측으로 폐기**; #amend-7 결정 1은 «산출물 나열·턴 수 금지»만, 결정 3은 slice 크기 기준으로 승계)
쓰는 쪽 agent 본문에 «작업 예산» 절 하나를 둔다. **남는 내용은 둘뿐이다.**
1. **산출물을 먼저 나열**한다. **턴 수는 어디에도 적지 않는다** — 에이전트는 자기 턴을 셀 수 없다(amend-6이 그 지시로 실패했다).
2. **slice 크기 기준 = 산출물 4개**(#amend-7 결정 3 승계 — 값의 정의는 여기 한 곳): foreman(`/implement-workitem`·`/design-milestone` R4)은 넘으면 쪼개고, builder는 «slice가 산출물 4개를 넘으면 착수 전에 그렇게 보고한다 — 쪼개는 것은 foreman의 일이다»(builder 쪽은 미측정 — 유지). ADR-075 D1은 이 값을 인용한다.

**제거한 셋과 사유(Round 13 실측)**:
- «절반 시점 중간 보고» — 관측 6회(Round 12의 4 + Round 13 (c)·(d)) 전부 미발생. 지시로 행동이 바뀌지 않았다.
- «write-first(골격만으로 먼저 쓴다)» — 「첫 쓰기 이전에 연 입력 수」가 5/5에서 0이 아니었다(planner 10 · builder 15·11·11·8). 에이전트 2종·스택 2종·effort 2조건에 예외 없음.
- «상한 도달 시 부분 보고 형식» — **성립 불가**다. 상한은 마무리 턴 없이 작업 중간에서 잘리고(두 관측 모두 마지막 텍스트가 절단 지점보다 2호출 앞), 로그 전체에 상한 접근 경고가 0건이며, 위 1번이 스스로 「턴 수를 셀 수 없다」고 못박는다. **알 수 없는 사건을 조건으로 삼는 지시는 어떤 에이전트도 만족시킬 수 없다.** 그 자리는 D10의 호출자 규칙이 받는다.

세 문장을 지우는 것은 지시를 더 다듬는 대신 **slice 크기(D9-2 기준 — foreman 분할은 ADR-075 D1)를 유일한 방어선으로 삼겠다**는 뜻이다 — 사전 등록된 falsifier 대응을 그대로 집행한 결과다.

### D10. 회수 dispatch — 「쓴 파일 목록」은 호출자가 만든다 (#amend-8 결정 4 승계 + 삭제된 «부분 보고 형식»의 이관처)
하청이 상한에 닿아 미완이면 호출자는 1회 재개하되 **이미 쓴 파일 목록**을 넘긴다(다시 읽고 다시 쓰는 낭비 방지). **그 목록은 하청에게 받는 것이 아니라 호출자가 워킹트리를 직접 읽어 만든다** — 상한 중단은 마무리 턴 없이 잘리므로 하청이 목록을 낼 기회가 없다(D9 제거 사유 3). Round 13 (c)에서 foreman이 실제로 그렇게 복구했고 재개 1회로 완주했다. 재개 규율 자체(1회 재개 → 실패 시 직접 회수)는 ADR-075 D13이 소유한다.

### D11. stabilize 7-T 계수 (#amend-8 결정 5 승계)
`턴 소진 0건 보고: N회`. 1회 이상이면 D14의 조건이 발화한다.

### D12. 에이전트 정의의 반영 시점 — 이 환경에서는 세션 시작에 고정된다 (신규 — 발견 74)
- [관측됨] Claude Code(2026-09, `.claude/agents/`, 저장소 루트 세션)에서 세션 중에 편집한 에이전트 정의는 그 세션의 이후 dispatch에 **반영되지 않았다**. 편집 6분 뒤 0-tool probe도 편집 전 정의를 반환했다. 새로 만든 변형 파일도 같은 세션에서는 보이지 않았다. amend-5 결정 4의 «hot-reload 지연» 진단은 오진이다.
- 공식 문서는 agents 디렉터리 변경을 감시해 다음 위임에 반영한다고 적는다. 본 관측은 그 사양과 어긋나며 **버전·경로·실행 방식에 한정된 사실**로 기록한다 — 일반 법칙으로 쓰지 않는다.
- **규칙**: 에이전트 파일을 고친 뒤 그 효과의 관측·검증은 **새 세션**에서 한다. 같은 세션에서 «적용됐다»고 적지 않는다. 반영이 확인된 버전이 나오면 본 D12를 amend로 완화한다(재검토 트리거 1).
- **반영 확인 수단**: 본문에 임시 마커 한 줄(«반환문 첫 줄에 `조건=… turns=… effort=…`를 적어라»)을 두고, 도구 0개 probe dispatch로 마커가 오는지 본다(1.9초, 결정적). 마커는 측정 뒤 제거한다.

### D13. 역할별 예산 실험 프로토콜 (#amend-4 결정 3 + #amend-5 결정 4 대체)
조건별 측정은 **조건마다 세션을 새로 시작**한다: (i) 에이전트 파일을 그 조건으로 편집(커밋하지 않음) → (ii) 새 세션 → (iii) 0-tool probe로 반영 확인 → (iv) 격리 사본에 바이트 동일 slice dispatch → (v) 반환·사후 검증 기록 → (vi) 원복. 변형 파일 방식은 세션 분리와 함께 쓸 때만 성립한다. **프롬프트는 파일에서 그대로 읽어 보내고, dispatch 뒤 실행 로그에서 조건 간 바이트 동일을 실제로 대조한다** — Round 13에서 「바이트 동일하게 쓴다」는 지시만으로는 지켜지지 않아 두 조건에 호출자용 문장이 섞여 들어갔다. 측정 항목: 소요·tool_uses·**누적 `output_tokens`**·완료 AC·validate·회수 턴·Red 보고 완전성·첫 쓰기 이전에 연 입력 수(실행 로그의 도구 호출 순서에서 읽는다). **task-notification의 「subagent 토큰」은 마지막 요청 1건의 컨텍스트 규모이지 누적 사용량이 아니다** — 조건 비교에는 로그에서 요청 ID로 중복 제거한 누적값을 쓴다. 조건 표는 SIMULATION_RUN이 소유한다.

### D14. ADR-047 D3 «예산 영향» 필드 — 이미 채택됨 (#amend-8 근거의 조건은 소멸)
#amend-8은 «D9 적용 뒤에도 보고 0건 상한 도달이 나면 ADR-047 D3에 «예산 영향» 항목을 넣는다»를 조건부로 남겼다. 그 항목은 ADR-047#amend-3(2026-09-12)으로 **이미 채택됐다**(D3 7번째 필드, 소급 적용 없음). 본 ADR은 그 필드를 채워 쓴다. 남는 규칙은 하나다 — D11 계수가 1회 이상이면 예산 상향이 아니라 D9-2 slice 기준의 하향 검토로 간다(집행은 ADR-075 D1).

## 대안과 제약 (ADR-053)
- A. amend-10을 더한다 — ADR-045 D6 위반. 기각.
- B. 예산 규칙을 DELEGATION_STRATEGY 산문으로만 — 근거·falsifier가 사라진다. 기각.
- C. 채택 — net 규칙 재발행 + 세션 고정 관측 + 프로토콜.

## 신뢰도
Medium — D1~D4·D12는 관측됨. D5·D6·D8 값은 n=1~2 실측 기반이라 재검토 트리거를 둔다. **D9는 제거 근거가 High** — 중간 보고 0/6, write-first 0/5, 부분 보고는 구조적 성립 불가(상한 경고 부재 + 마무리 턴 부재)로 셋 다 실측에 기반한다.

## 재검토 트리거
1. Claude Code 문서·실측에서 세션 중 에이전트 파일 반영이 확인되면 D12를 완화한다.
2. D11 계수가 마일스톤당 1회 이상이면 예산 상향이 아니라 D9-2 slice 기준의 하향을 검토한다(D14).
3. 다른 스택 dogfood에서 medium이 빠르게 나오면 D5 재측정(D13 프로토콜).
4. **write-first의 프롬프트층 처방(미시험)**: Round 13은 「에이전트 본문 지시만으로는 순서가 바뀌지 않는다」(n=5)까지만 확인했고, **dispatch 프롬프트가 「첫 산출물 파일을 만든 뒤 나머지 입력을 연다」를 직접 지시하는 조건은 시험하지 않았다**. 그 조건을 한 번이라도 재면 결과를 기록하고, 효과가 있으면 write-first를 **호출자 프롬프트 규약**으로 되살린다(에이전트 본문으로는 되돌리지 않는다).
5. **상한 신호가 생기면 «부분 보고 형식» 재도입 검토**: 하네스가 「상한 N턴 남음」류 신호를 에이전트에게 주기 시작하면 부분 보고 형식의 성립 불가 사유가 사라진다 — 그때 D10의 호출자 규칙과 함께 재검토한다.

## 정책 강도 (ADR-022)
- 제약(강, [관측됨]): D1·D2·D12.
- 제약(중, [관측됨]): D9 «턴 수를 적지 않는다», D13 «조건당 새 세션», D10 «쓴 파일 목록은 호출자가 만든다».
- enabling(약): D5·D6·D8 값, D9-2(builder slice 4개 초과 사전 보고 — 미측정), D11·D14.

## Mutation Contract (ADR-047 D3)
1. Target — `.claude/agents/*.md`(frontmatter 값·예산 절 인용 재지정) / `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델·예산 표기 정책` / `.claude/skills/{implement-workitem,design-milestone,plan-workitem,validate-plan,stabilize-milestone}/SKILL.md`(인용 재지정) / `.codex/config.toml` 주석 / `docs/00-meta/GUARDRAILS_STRATEGY.md` / `docs/90-decisions/boilerplate/README.md` 인덱스 / ADR-010·ADR-047 인용.
2. Failure mode — net 규칙을 개정 9개에서 조립해야 함 / 세션 중 편집을 반영된 것으로 오인해 실험이 무효가 됨 / 예산 축 오분류로 팬아웃 단위가 보고 0건으로 잘림 / **에이전트가 알 수 없는 사건(상한 도달)을 조건으로 삼은 지시가 본문에 남아 「규칙을 두었다」는 거짓 안심을 만듦** (전부 관측됨).
3. Predicted improvement — Round 14에서 상한 중단이 **slice 크기 판정으로 예방**되고(지시로 완화되는 것이 아니라), 중단이 나더라도 호출자가 워킹트리에서 목록을 만들어 1회 재개로 복구되며, 에이전트 파일 변경 뒤 새 세션 검증이 기록에 일관 등장하고, 예산 값이 표 하나로 읽힘.
4. Preserved invariants — shared 비고정 / 별칭 자리 / Codex 비지정 / graduation·오케스트레이션 계약(ADR-075) 불변.
5. Falsifying evaluation — **(선행 이력) Round 13 판정은 amend별로 갈린다** — ADR-004#amend-8 (a)(「쓰기 도구 보유 에이전트의 보고 0건 상한 도달」)는 **2회 발화**했고 #amend-9의 (a)·(b)는 **미발화**다. 따라서 «부분 보고 형식» 제거는 amend-8 (a) 발화 + 구조적 성립 불가에 근거하고, «write-first»·«중간 보고» 제거는 falsifier 발화가 아니라 **직접 미준수 실측**(각각 5/5·0/6)에 근거한다. D9는 amend-8 (a)의 사전 등록 대응(「지시를 더 만지지 말고 slice 강제만 남긴다」)을 집행한 결과다. 이제 남는 것은 제거 자체의 falsifier다 — (a) 행동 지시 3종을 걷어낸 뒤 **산출물 손실이 동반된 상한 중단**(재개로도 복구되지 않는 미완)이 마일스톤당 1회 이상 나오면 slice 강제만으로는 부족한 것이므로 D9-2의 산출물 임계(4)를 내리고(report-only dispatch는 ADR-075 D11 (b)의 회수 문서 10개) — 지시를 되살리지 않는다 — 그 사실을 적는다 (b) D12의 반영 확인 수단이 반영된 정의에서도 마커를 못 받으면 수단 재설계 (c) D8 값의 dispatch가 매번 상한의 절반 아래로 끝나면 산식 하향.
6. Rollback path — 본 ADR superseded → ADR-004 net 규칙으로 회귀(에이전트 파일 값 원복), D12는 관측 기록으로만 잔존.
7. 예산 영향 — 없음(값을 바꾸지 않는다. D8 표는 현재 frontmatter와 동일).

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/agents/builder.md                  — D6·D8·D9
- .claude/agents/planner.md                  — D8·D9
- .claude/agents/architect.md                — D8·D9
- .claude/agents/designer.md                 — D8·D9
- .claude/agents/reviewer.md                 — D8·D9
- .claude/agents/qa.md                       — D8
- .claude/agents/validator.md                — D8
- .claude/agents/researcher.md               — D8
- .claude/agents/analyst.md                  — D8
- .claude/agents/security.md                 — D8
- .claude/agents/marketer.md                 — D8
- .claude/agents/counsel.md                  — D8
- .claude/agents/strategist.md               — D8
- docs/00-meta/DELEGATION_STRATEGY.md        — D1·D2·D5·D8·D12 요약
- docs/00-meta/GUARDRAILS_STRATEGY.md        — D1 인용
- .codex/config.toml                         — D1 주석
- docs/90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md — D1 인용(#amend-6 Codex 비지정)
- .claude/skills/implement-workitem/SKILL.md — D9-2·D10
- .claude/skills/design-milestone/SKILL.md   — D9-2
- .claude/skills/plan-workitem/SKILL.md      — D10
- .claude/skills/stabilize-milestone/SKILL.md — D11
- .boilerplate/validation/SIMULATION_RUN.md  — D13 조건 표·실측

## 참고
- ADR-004(superseded — 승계 원천), ADR-010(#amend-6 Codex 비지정), ADR-075(오케스트레이션·회수·slice), ADR-047 D3(D14 조건), ADR-045 D6·D10, ADR-022.
```

### P3-2. ADR-004 status 변경
- `## Status` 본문 `accepted` → `superseded`. 그 아래 첫 줄에 `> 대체: [ADR-074](ADR-074-model-effort-and-turn-budget-policy.md) — 통합 재발행(2026-09-XX). 본 문서는 history 잔존. (현재 SSOT: ADR-074)`.
- `## 현재 유효 결정`·본문·amendment는 원문 유지. amend-8·9 헤딩 위에 앵커가 없는데(`<a id="adr-004-amend-8">`·`-9`) 재발행 뒤 그 anchor를 인용하는 파일이 0이 되므로 추가하지 않는다.

### P3-3. 에이전트 파일 13개 — D9 행동 지시 3종 삭제
- frontmatter 값은 D8 표와 같아야 한다(2026-09-12 실측이 이미 표와 동일 — 값 변경 없음). `effort:` 키는 어디에도 없어야 한다.
- 각 파일 12행 근처 예산 절 헤딩: `**작업 예산 (ADR-004#amend-7)**:` (architect만 `(ADR-004#amend-7·#amend-8)`) → 전부 `**작업 예산 (ADR-074 D9)**:`.
- **삭제 1 — 절반 점검·중간 보고 (13/13 전부)**: `, 그 목록의 **절반을 끝낸 시점에 남은 것을 점검한다.**` 부터 `…두 번째 기회가 없다.` 까지를 지우고 앞 문장을 `**slice·요청을 받으면 먼저 산출물을 나열한다.**` 로 닫는다. 근거: 관측 6회 전부 중간 보고 미발생.
- **삭제 2 — write-first (13/13 전부)**: `**산출물을 먼저 만든다 (ADR-004#amend-9 결정 1)**:` 로 시작해 `**일의 순서는 바꿀 수 있다.**` 로 끝나는 문장 묶음 전체. 근거: 「첫 쓰기 이전에 연 입력 수」가 5/5에서 0이 아니었다.
- **삭제 3 — 부분 보고 형식 (해당 4개: architect·builder·designer·planner)**: `**상한에 닿아 끝내지 못했다면 보고 형식은 …**(ADR-004#amend-8 결정 3)` 로 시작해 `…같은 파일을 다시 열 필요가 없다.` 까지. 근거: 상한은 마무리 턴 없이 잘리므로 성립 불가. **reviewer·qa·validator에 이 문장을 새로 넣지 않는다**(앞 라운드 계획을 철회한다 — 넣었다면 같이 지운다).
- **유지 (13/13)**: `**턴 수를 세려 하지 마라** — … 기준은 **남은 산출물**이다.` (amend-6 재발 방지용 부정 지시). **유지 (builder만)**: `**slice 가 산출물 4개를 넘으면 착수 전에 그렇게 보고해라** — 쪼개는 것은 foreman 의 일이다.` → 인용을 `(ADR-074 D9-2)`로 단다.
- 삭제 후 각 파일의 예산 절이 **두 문장**(산출물 나열 + 턴 수 금지, builder는 + slice 4개)인지 확인한다. 잔여 검사: `grep -l "절반을 끝낸 시점\|골격만으로 먼저 쓴다\|쓴 파일 목록 + 남은 것 1줄" .claude/agents/*.md` → 0줄.
- `builder.md:41` 현재 `…멈추는 것이 깊이 고민하는 것보다 낫다(ADR-004#amend-4).` → `(ADR-074 D5)`.
- Phase 2에서 심은 `측정 조건` 마커 줄이 남아 있지 않은지 확인한다(`grep -n "측정 조건" .claude/agents/*.md` → 0).
### P3-4. 인용 재지정(ADR-045 D10) + D10 실행 문장 갱신
- **먼저 «인용 재지정이 아닌» 것 하나를 처리한다 — D10의 내용이 바뀌었으므로 그 surface 2개의 실행 문장도 바꾼다**(Surfaces 계약 «본 ADR 변경 시 동기 갱신»). 부분 보고가 성립 불가가 됐으니 두 곳 모두 «하청이 목록을 낸다»에서 «호출자가 워킹트리를 읽어 목록을 만든다»로 간다.
  - `.claude/skills/plan-workitem/SKILL.md` 현재 `조각이 상한에 닿아 부분 보고(「쓴 파일 목록 + 남은 것 1줄」)를 내면, **회수 dispatch 에 그 파일 목록을 그대로 실어** 보낸다` → `조각이 상한에 닿으면 **부분 보고는 오지 않는다** — 상한은 마무리 턴 없이 작업 중간에서 자르고 에이전트에게는 상한 접근 신호가 없다(ADR-074 D9). 그러므로 **메인이 워킹트리를 직접 읽어 「이미 쓴 파일 목록」을 만들고 그 목록을 첫 회수 dispatch 에 실어** 보낸다(ADR-074 D10).`
  - `.claude/skills/implement-workitem/SKILL.md` 현재 `**builder가 구조화 최종 반환 없이 멈추면** foreman은 1회 재개를 시도(SendMessage 등)하고, 그래도 미반환이면 …` → **순서를 뒤집는다**: 워킹트리에서 「이미 쓴 파일 목록」을 먼저 만들고 **그 목록을 실어 1회 재개**한 뒤, 재개해도 미반환이면 그 파일들에서 직접 회수한다(ADR-074 D9·D10 인용).
- 나머지는 인용 재지정이다. `grep -rn --exclude-dir=.git "ADR-004" . | grep -v "ADR-004-model-alias-policy.md" | grep -v IMPROVE-GUIDE` 결과 전부를 처리한다(2026-09-12 실측 목록):
- **A 살아있는 규칙 → 재지정**: `.claude/skills/implement-workitem/SKILL.md:30`(`ADR-004#amend-7 결정 3` → `ADR-074 D9-2`), `design-milestone/SKILL.md:57`(같음), `plan-workitem/SKILL.md:291`(`ADR-004#amend-8 결정 4 + amend-7 결정 3` → `ADR-074 D10·D9-2`), `validate-plan/SKILL.md:43`(`ADR-004#amend-9 결정 4` → `ADR-075 D11-b` — 회수 문서 분할 기준은 ADR-075가 소유. 그래서 ADR-074 Surfaces에는 validate-plan을 두지 않는다), `stabilize-milestone/SKILL.md:252`(한 줄에 2회 — 앞 `ADR-004#amend-8 결정 5` → `ADR-074 D11`, 뒤 «amend-8 falsifier (a)가 발화한다» → `ADR-074 D14`의 slice 강제 조건; 269행은 예시 출력이라 인용 없음), `.codex/config.toml:8`(`ADR-004#amend-2` → `ADR-074 D1`), `docs/00-meta/GUARDRAILS_STRATEGY.md:40`(→ `ADR-074 D1`), `docs/00-meta/DELEGATION_STRATEGY.md:162·164·166`(P3-5에서 절 전체 교체), ADR-010의 9건(`ADR-004`·`ADR-004#amend-2` → `ADR-074 D1`; 배경 서술이면 C 분류로 링크 제거).
- **E 실행 기록 → 병기**: `.boilerplate/validation/SIMULATION_RUN.md`의 24건은 줄 끝에 `(현재 SSOT: ADR-074)`를 병기하고, 파일 상단 시점 주석에 `ADR-004 → ADR-074 (2026-09-XX)`를 한 줄 추가한다. `ADR-047:195`(#amend-3 배경의 «ADR-004#amend-8 의 falsifier (a)» 서술)는 **실행 기록(E)이므로 재지정하지 않고** 줄 끝에 `(현재 SSOT: ADR-074 D14)`만 병기한다. **예외**: SIMULATION_RUN `## Round 13` 절의 `ADR-004#amend-9 결정 4(통합 재발행본 D11 (b)로 이관 예정)` 2줄은 SSOT가 ADR-075라 `(현재 SSOT: ADR-075 D11 (b))`로 병기한다(Phase 4 뒤 실재). 전수 grep은 부록 A의 `EXC` 배열을 붙여 돌린다(`grep -rn "${EXC[@]}" "ADR-004" .`).
- 확인: `grep -rn --exclude-dir=.git "ADR-004" . | grep -v "ADR-004-model-alias-policy.md" | grep -v "(현재 SSOT:" | grep -v "boilerplate/README.md" | grep -v IMPROVE-GUIDE` → 0줄.

### P3-5. `docs/00-meta/DELEGATION_STRATEGY.md` `## 모델 표기 정책`
- 헤딩을 `## 모델·추론 강도·턴 예산 표기 정책`으로 바꾸고 절 본문(현재 5줄 — `shared 도구 설정 파일(…)에는 모델·추론 강도 키를 두지 않는다 …` 부터 `정책 근거는 [ADR-004-…]` 까지)을 다음으로 교체:
  ```
  shared 도구 설정 파일(`.claude/settings.json` · `.codex/config.toml`)에는 모델·추론 강도 키를 두지 않는다 — 사용자 계층과 계정·CLI 기본값이 승계한다 (ADR-074 D1).
  별칭(`sonnet`, `opus`, `haiku`)은 역할별 고정이 필요한 `.claude/agents/<name>.md` frontmatter `model:`에서만 쓴다. 전체 버전 ID 금지는 불변 (ADR-074 D2).
  추론 강도 `effort:`도 같은 자리에서만 허용되는 축이나 **현재 어느 agent에도 지정하지 않는다** — builder의 `medium`은 완료율 이득 없이 소요·토큰이 약 2배로 늘어 제거했다 (ADR-074 D5). 메인 세션은 사용자 계층에서 `high` 이상을 권장하며, `CLAUDE_CODE_EFFORT_LEVEL` 환경변수를 전역에 두면 agent `effort`가 무력화되므로 두지 않는다.
  턴 예산 `maxTurns:`는 «쓰기 도구 보유» 축으로 잡는다 — `max(8, 회수 문서 수) + 3 × 산출물 수`, builder 60. 값의 SSOT는 각 agent frontmatter이고 표는 ADR-074 D8에 있다.
  **에이전트 정의는 세션 시작 시점에 고정된다.** `.claude/agents/*.md`를 고친 뒤 그 효과의 관측·검증은 새 세션에서 한다 — 같은 세션의 dispatch는 편집 전 정의로 돈다 (ADR-074 D12).
  특정 버전·강도를 강제해야 하면 ADR로 남기고 그 자리에서만 고정한다.
  정책 근거는 [ADR-074-model-effort-and-turn-budget-policy.md](../90-decisions/boilerplate/ADR-074-model-effort-and-turn-budget-policy.md)를 참조한다.
  ```
- 그 아래 `메인 세션 오케스트레이션(foreman·fan-out·wave 제거) 정책은 [ADR-051]…` 줄은 Phase 4에서 `ADR-075`로 바꾼다(지금은 그대로).

### P3-6. 인덱스 + ADR-045 D6 표 정정
- `docs/90-decisions/boilerplate/README.md` 004 행: `accepted` → `superseded`, 요약 끝에 ` → ADR-074로 통합 재발행 (현재 SSOT: ADR-074)`. 새 행 추가(형식은 기존 행과 동일):
  ```
  | 074 | 모델·추론 강도·턴 예산 정책 v2 | accepted | — | ADR-004 통합 재발행. shared 비고정 + 별칭 자리 + effort 미지정(3갈래 판정) + 쓰기 도구 축 턴 예산 산식 + 에이전트 정의 세션 고정(파일 수정 후 새 세션 검증) + 조건당 새 세션 실험 프로토콜 |
  ```
- `docs/90-decisions/boilerplate/ADR-045-doc-reference-contract.md` D6 표의 `| 개정(amend) 4개 이상 누적 | 통합 재발행(supersede)로 클린 ADR 재작성. …|` 행은 **덮어쓰지 않는다** — #amend-1의 적용 surface가 «D6 표 원행은 Record로 보존»으로 못 박았다. 그 행의 마지막 칸 끝에 ` (#amend-1이 임계를 8로 상향 — 현재 SSOT: ADR-045#amend-1)`만 병기한다.

### P3-7. 커밋
```
docs(adr): reissue ADR-004 as ADR-074 model, effort and turn-budget policy with session-fixed agent definitions
feat(agents): re-point agent budget rules and docs to ADR-074
```
(두 커밋: ADR·인덱스·ADR-045 정정 / 에이전트·스킬·meta·SIMULATION_RUN 병기.)

---

## Phase 4. ADR-051 통합 재발행 → ADR-075 + validate-workitem 재보정 (발견 5·16·17·22·31·30)

목표: ADR-051#amend-4의 거버넌스 주(«다음 변경 시 ADR-051 통합 재발행»)를 이행하면서 inline 임계와 축 5 spawn 신호를 실측대로 재보정한다. 근거 데이터는 Round 11 두 건(T-001 F=6·L=91 → 6축 강제, 축 2 176초·토큰 약 16만 / T-003 F=5·L=144, 5 dispatch·약 14.6만)과 Round 12의 «임계 초과인데 inline 처리» 이탈 기록이다. 테스트 파일이 L을 두 배로 만드는 구조가 원인이므로 **테스트 파일을 크기 산정에서 뺀다**(테스트는 diff-trace 대상이지 크기 신호가 아니다).

### P4-1. ADR-075 작성 — `docs/90-decisions/boilerplate/ADR-075-main-session-orchestration-v2.md`
ADR-051 본문(D1~D8)과 amend-1~4를 읽고 **net 규칙을 클린 본문으로 옮긴다**. 결정 번호는 아래로 고정한다(부록 C에 절별 승계 원천을 표로 두었다).
- D1 foreman 오케스트레이션(051 D1·#d6 — slice 크기 기준 «산출물 4개»는 ADR-074 D9-2를 인용) / D2 report-only fan-out(051 D2) / D3 plan de-fork(051 D3) / D4 plan-milestone 범위 M1 포함(051 D4 + #amend-3) / D5 wave 제거(051 D5) / D6 ADR-047 D9 re-anchor(051 D6) / D7 NO-merge(051 D7) / D8 조건부 re-read(051 D8) / D9 공유 런타임 partition 가드(#amend-1) / D10 orchestration 관측 기록(#amend-2).
- **D11. fan-out 크기 판정 v2 (#amend-4 결정 1 재보정)**:
  ```
  dispatch 전에 크기를 결정적으로 계산한다. F = 변경 파일 수(전부), L_impl = «테스트 파일 집합»(test/**, tests/**, __tests__/**, e2e/**, integration_test/**, **/*.test.*, **/*.spec.*, **/*_test.dart)과 «문서 집합»(docs/**)을 제외한 변경 줄 합, L_test·L_docs = 각각의 변경 줄 합. inline 허용은 **(L_impl ≤ 50) 또는 (F ≤ 2 이고 L_impl ≤ 200)**, 그리고 UI/Arch-iface/MCP/spec-coverage 중 둘 이상 명백히 해당없음 — 셋 다 충족일 때만. 하나라도 미충족이면 fan-out 필수(재량 0). `## Orchestration`에 F·L_impl·L_test·L_docs와 판정 근거를 기록한다. 임계 초과인데 inline이면 규칙 위반이다. **1축 = 1 validator는 불변이다** — 비용 압력은 임계를 재보정해 풀지, 축을 합쳐 풀지 않는다(Round 11 발견 17). 측정 시점은 validate-workitem 실행 시점의 워킹트리(`git diff HEAD` + untracked)다 — finalize 커밋 diff가 아니다.
  **(b) report-only·계획 리뷰 dispatch의 분할**: 회수 문서가 10개 이상이면 축·범위를 나눈다(원천: ADR-004#amend-9 결정 4 (현재 SSOT: 본 ADR D11) — reviewer·qa dispatch(stabilize 단계 4·5, design-milestone R6-4, review-doc)에 적용. ADR-074는 이 규칙을 담지 않는다). `/validate-plan`은 세션 인라인 스킬이라 dispatch 분할의 대상이 아니다 — 그 자리는 자체 «큰 milestone budget 가이드»(JIT 회수)가 맡는다(Round 13 Phase 1 실측: 15개 문서를 부분 읽기로 dispatch 없이 완주).
  ```
  근거 문장은 P4-3의 실측값으로 채운다. 가설: «Round 11 T-001은 테스트·문서를 빼면 구현 줄이 50 안팎이라 inline 후보이고, T-003(저장 어댑터, 외부 경계)은 구현 줄만으로도 50을 넘어 fan-out이 맞다». 실측이 가설과 다르면(T-001 L_impl > 50) 임계를 올리지 말고 그대로 fan-out으로 두고 그 사실을 적는다 — 단일 표본으로 값을 옮기지 않는다.
- **D12. 축 spawn 신호 (validate-workitem #cost guard 확장 승계 + 재보정)**: 축 3·4·6·8 신호는 기존대로. **축 5(UI Design inventory)는 «UI 프로젝트» 신호가 아니라 «diff에 UI surface 파일 집합의 파일이 1개 이상»일 때만 spawn**한다(Round 11 T-003: `.tsx` 0개인데 spawn — 발견 16). UI surface 파일 집합의 정의는 ADR-073#amend-2 결정 1이 소유하며 여기서는 인용만 한다.
- D13 하청 정지 회수(#amend-4 결정 2 — always-verify) / D14 의존성 도구 고정(#amend-4 결정 3).
- `## 현재 유효 결정`(≤6줄), 대안·신뢰도·재검토 트리거(«Round 14에서 inline 판정된 task의 validate가 놓친 P0가 있으면 L_impl 임계 하향»), 정책 강도, Mutation Contract **7필드**(Target: validate-workitem·stabilize·implement-workitem·plan-workitem·validate-plan·DELEGATION 인용 / … / 7. 예산 영향 = «validator 축 spawn 감소 — 위임 단위의 작업량을 늘리지 않는다»), Surfaces(ADR-051 Surfaces를 승계 + validate-workitem D11·D12 + validate-plan D11-b 표기), 참고.

### P4-2. ADR-051 status 변경
`## Status` `accepted` → `superseded`. 아래 줄 `> 대체: [ADR-075](ADR-075-main-session-orchestration-v2.md) — 통합 재발행(2026-09-XX, #amend-4 거버넌스 주 이행). 본 문서는 history 잔존. (현재 SSOT: ADR-075)`.

### P4-3. 실측 채우기(한 번)
```bash
cd ~/harness-dogfood/dogfood-web
for t in T-001 T-003; do c=$(git log --format=%H --grep="Refs: $t" | tail -1); echo "== $t $c"; git show --numstat --format= $c | awk '{ f++; if ($3 ~ /(^|\/)(test|tests|__tests__|e2e|integration_test)\// || $3 ~ /\.(test|spec)\./ || $3 ~ /_test\.dart$/) t+=$1+$2; else if ($3 ~ /^docs\//) d+=$1+$2; else i+=$1+$2 } END { print "F="f" L_impl="i" L_test="t" L_docs="d }'; done
```
2026-09-12 검토자 실측(문서 미제외 기준): T-001 F=6·L=104(구현+문서 53·테스트 51), T-003 F=5·L=152(구현+문서 90·테스트 62). 문서를 뺀 값을 위 명령으로 다시 재어 ADR-075 D11 근거 문장과 SIMULATION_RUN Round 13 절에 적는다. 커밋 diff는 finalize 시점이라 validate 시점 워킹트리와 다를 수 있다 — 그 한계를 한 줄 적는다.

### P4-4. `.claude/skills/validate-workitem/SKILL.md`
- 35행 근처 현재: `inline 허용은 **(L ≤ 50) 또는 (F ≤ 2 이고 L ≤ 200)**, *그리고* UI/Arch-iface/MCP/spec-coverage 중 둘 이상이 명백히 해당없음 — **셋 다 충족일 때만**.` → `inline 허용은 **(L_impl ≤ 50) 또는 (F ≤ 2 이고 L_impl ≤ 200)** … (ADR-075 D11 — L_impl은 테스트 파일 집합과 docs/**를 제외한 변경 줄 합)`. 같은 문단의 `경계값(50/200)은 실측 전 추정치라 #amend-4가 재보정 창구다.` → `경계값(50/200)은 Round 11 실측으로 재보정됐다(ADR-075 D11). 다음 재보정 창구는 ADR-075 재검토 트리거다.` 계산 명령(`git diff HEAD --numstat` 합)에 «테스트·문서 집합 분리 합산» 문장을 더한다.
- 29행 현재: `5. UI Design inventory audit (ADR-073 D8) — UI 프로젝트에 한해 spawn` → `5. UI Design inventory audit (ADR-073 D8) — diff에 UI surface 파일이 있을 때만 spawn (ADR-075 D12)`. 33행 `5 = UI 프로젝트(ADR-073 D9)` → `5 = diff에 UI surface 파일 집합의 파일 1개 이상(ADR-075 D12 — UI 프로젝트라도 파일이 없으면 spawn하지 않고 «해당없음» 인라인 기록)`.
- 33행 끝에 한 문장: `**한 dispatch에 두 축을 합치지 않는다(1축 = 1 validator — ADR-075 D11).**`
- 121행 report form `- fallback 사유 (inline 모드일 때만 기록): 파일 F개 · 변경 줄 L줄` → **모드 무관 필수 필드**로 바꾼다: `- 크기 측정 (모드 무관 필수 — ADR-075 D11): 파일 F개 · 구현 줄 L_impl · 테스트 줄 L_test · 문서 줄 L_docs + 판정 근거 한 줄`. D11이 «`## Orchestration`에 F·L_impl·L_test·L_docs와 판정 근거를 기록한다»를 조건 없이 요구하므로 **fan-out 모드에서도 비우지 않는다**.
- 66행 `- **두 수치 (ADR-065 D4)**: …` 문단 끝에: `자동화율의 분모는 **AC 수**이지 `## 6-1` 행 수가 아니다 — 한 AC가 두 modality 행으로 존재하면 계획 오류이며(ADR-065 D1 «정확히 하나»), `P2 [Modality-split-needed] AC-N`으로 기록하고 분모는 AC 수로 센다(Round 12 발견 30).`
- 축 3(FAC spec) 판정 문단(79행 `P0 [Spec-gap] …` 근처)에 기록 등급 관찰 둘을 더한다: `- **의미 정합 관찰(기록 등급)**: 매핑 행의 증명 문장(ADR-072#amend-2 결정 4)이 AC 본문과 어긋나면 `P2 [FAC-semantic-hollow] FAC-N → T-NNN:AC-M`. 차단 아님 — 계획 시점 3-S (c)가 1차 관문이다.` / `- **계측 속성 도메인 관찰(기록 등급)**: task `## 3`의 계측 이벤트 속성이 승인 UI·도메인에서 산출 가능한 값인지 diff로 본다. 불가하면 `P2 [Instrumentation-domain] <이벤트.속성>`(Round 12 발견 31 — 계획 시점 3-S (b)는 콜백 유무까지만 본다).` **조건**: SIMULATION_RUN Round 12 절에 `[FAC-semantic-hollow]` 재발 기록이 없으면 첫 관찰 항목은 넣지 않고 발견 22를 «3-S (c)로 종결»로 적는다.
- 파일 안 `ADR-051#amend-4`·`ADR-051` 인용은 `ADR-075 D11`·`ADR-075`로.
- **D11 (b)를 호출부에 실제로 배선한다** — ADR-075 Surfaces가 `stabilize-milestone`을 «D2 + D11 (b)»로 등재하는데 인용만 두면 규칙이 사용 지점에 없다. 단계 4(qa 팬아웃)·단계 5(reviewer 팬아웃) 각각에 한 줄: `- **회수 분할 (ADR-075 D11 (b))**: 한 단위의 회수 문서가 **10개 이상이면** 축·범위를 더 나눠 dispatch 한다 — 한 dispatch 에 전부 싣지 않는다.` **«이상»이다 — D11 (b)가 SSOT이고 «넘으면»으로 적으면 경계가 1 어긋난다.** (`validate-plan`은 43행이 이미 담당한다. D11 (b) 본문이 함께 지목하는 design-milestone·review-doc은 Surfaces 미등재라 이번 범위 밖 — 다음 라운드 후보로만 적는다.)
- `.claude/skills/validate-plan/SKILL.md` 43행 현재(P3-4가 인용만 재지정한 상태) `**slice 기준 (ADR-075 D11-b)**: 회수 문서가 **10개 이상이면 축·범위를 나눠 dispatch 한다.** 실측(Round 12 `M1`): …` → `**회수 예산 (ADR-075 D11 (b))**: 본 skill은 세션 인라인 실행이다 — 회수 문서가 10개 이상이면 아래 «큰 milestone budget 가이드»대로 JIT 회수한다(한 번에 전부 읽지 않는다). Round 12의 실측(reviewer subagent에 위임해 15+ 문서를 한 dispatch로 → 상한 중단)은 위임 실행의 기록이며, 위임해 돌릴 때는 D11 (b)대로 축·범위를 나눈다.` `.claude/agents/reviewer.md` 72행 `` `/validate-plan` 호출 시 본 agent가 `` → `` `/validate-plan`(호출한 세션이 본 페르소나의 차원을 직접 적용) 또는 plan surface 위임 시 ``.

### P4-5. plan-workitem·템플릿·DELEGATION
- `.claude/skills/plan-workitem/SKILL.md` 3-S에 (e) 추가(현재 순서는 (a)74행·(b)75행·(d)76행·(c)77행이다 — (c) 뒤에 둔다): `- **(e) AC당 modality 하나 (ADR-065 D1)**: 한 AC에 «텍스트는 자동 테스트, 여백·위계는 사용자 관측»처럼 두 modality가 필요하면 **AC를 둘로 쪼갠다**(AC-1a/AC-1b). `## 6-1`에 같은 AC의 행이 둘이면 위반이다.`
- `docs/30-workitems/_templates/TASK_TEMPLATE.md` `## 6-1` 주석에 한 줄: `- 한 AC = modality 하나(ADR-065 D1). 두 종류 검증이 필요하면 AC를 쪼갠다.`
- `docs/00-meta/DELEGATION_STRATEGY.md` `메인 세션 오케스트레이션(foreman·fan-out·wave 제거) 정책은 [ADR-051](…) 참조.` → `[ADR-075](../90-decisions/boilerplate/ADR-075-main-session-orchestration-v2.md)`. 같은 파일 14행 회수 규율 문장의 `— ADR-051#amend-4)` → `— ADR-075 D13)`. **인용만 바꾸면 안 된다** — D13이 ADR-074 D10과 정합되며 «재개 시 「이미 쓴 파일 목록」은 호출자가 워킹트리를 읽어 만든다»가 들어갔으므로, 이 요약 문장의 «1회 재개한다» 뒤에 그 조항을 한 구절 넣는다(Surfaces가 본 파일을 «회수 규율»로 등재한다).
- 같은 파일 `## 모델·추론 강도·턴 예산 표기 정책`의 `builder의 \`medium\`은 완료율 이득 없이 소요·토큰이 약 2배로 늘어 제거했다 (ADR-074 D5)` 문장 끝에 ` Round 13 Flutter 재측정은 반대 방향이라 결론 보류다(ADR-074 D5).`를 덧붙인다(P3-5 본문은 Phase 2 결과 전에 고정된 문장이다).
- 나머지 `ADR-051` 인용(`grep -rn "ADR-051" . | grep -v ADR-051-`)은 ADR-045 D10으로 처리(대부분 A → `ADR-075 D<n>`; ADR-070 등 다른 ADR 안의 참고 목록은 D 분류로 `(현재 SSOT: ADR-075)` 병기). **경계 하나를 못 박는다 — 다른 ADR의 `## Surfaces`·`### 적용 surface`에 적힌 `ADR-051` *파일 경로*는 병기 대상이 아니라 A 분류다**(그 목록은 «본 ADR 변경 시 동기 갱신»할 실제 대상이므로 죽은 파일을 가리키면 안 된다). 경로를 `ADR-075-main-session-orchestration-v2.md`로 바꾼다 — 2026-09-13 실측 대상은 ADR-057 **2건**(`## Surfaces` + `#amend-3`의 `### 적용 surface`). **같은 이유로 다른 ADR의 `## 결정` 본문이 ADR-051을 «현행 규칙의 권위»로 인용하는 자리도 A 분류다**(실측: ADR-040 결정 2의 `implement foreman — ADR-051 D1` → `ADR-075 D1`). 반면 «…의 근거는 ADR-051#amend-4 결정 2다» 처럼 **왜 그 규칙이 생겼는지를 서술하는 자리**는 E 분류라 마커 병기가 맞다(ADR-067·ADR-019·ADR-047 등).

### P4-6. 인덱스
README 051 행 `accepted` → `superseded`, 요약 끝 ` → ADR-075로 통합 재발행 (현재 SSOT: ADR-075)`. 050 행의 상태 칸 `accepted (부분 superseded by 051)` → `accepted (부분 superseded by 075)`. 새 행:
```
| 075 | 메인 세션 오케스트레이션 v2 | accepted | — | ADR-051 통합 재발행. foreman·fan-out·de-fork·partition·관측 기록 승계 + fan-out 크기 판정을 구현 줄(L_impl) 기준으로 재보정 + 축 5 spawn = UI surface 파일 diff + 1축=1 validator 불변 |
```

### P4-7. 커밋
```
docs(adr): reissue ADR-051 as ADR-075 with measured fan-out sizing and UI-axis signal
feat(validate): count only implementation lines for the inline threshold and spawn the UI axis on surface diffs
```

---

## Phase 5. stabilize·게이트 보류 발견 묶음 (ADR-035·050·058·063·072·073 개정)

목표: 앞 라운드가 «기록만»으로 남긴 발견 중 처방 후보가 있는 것을 ADR 소유자별로 묶어 닫는다. 순서는 ADR → 스킬·코드 → 커밋. 각 amendment는 `<a id="adr-NNN-amend-M"></a>` 앵커 + `### 배경`(발견 번호 인용) + `### 결정` + `### 강도` + `### Mutation delta` + `### 적용 surface`를 갖춘다(앞 라운드의 amendment 형식과 동일).

### P5-1. ADR-073 `## Amendment 2` — preflight 범위 (발견 27·32)
`docs/90-decisions/boilerplate/ADR-073-interface-and-design-content-v2.md` 끝에 append.
```markdown
<a id="adr-073-amend-2"></a>
## Amendment 2 (2026-09-XX) — preflight voice grep 범위 축소 + 회수 파일 수 echo

### 배경
- [관측됨] 5-2b voice grep이 DESIGN `## 10` «내부 키 노출» 규칙을 변경 파일 전체에 적용해 저장 어댑터의 식별자(`localStorage`·`todos.v1`·`QuotaExceededError`)를 카피로 오탐했다 — Round 11 stabilize 3회차 전부 10건(발견 27). 규칙은 사용자 카피 대상이다.
- [관측됨] preflight grep이 «검사 대상 파일 0건»과 «위반 0건»을 구분하지 않아 회수 파일 목록이 비었는데 전부 «0건»으로 통과한 적이 있다(발견 32).

### 결정
1. **«UI surface 파일 집합»의 정의(canonical)**: 웹 `*.tsx *.jsx *.vue *.svelte *.astro *.html *.css *.scss *.sass *.less` + Flutter `lib/**/*.dart` 중 경로에 `screens/`·`widgets/`·`features/`·`theme/`·`prototype/` 포함. 다른 ADR·스킬(ADR-075 D12 축 5 신호, 5-2b)은 이 정의를 인용만 한다.
2. **5-2b의 대상은 결정 1의 집합이고, 정규식은 «사용자에게 렌더되는 텍스트 구간»에만 적용한다.** 두 구간이다 — (a) 따옴표 안 문자열(`"…"`·`'…'`·`` `…` ``), (b) **JSX·HTML 텍스트 노드**(`>`와 다음 `<` 사이의 내용). (b)가 없으면 `<h1>TODO copy</h1>`·`<p>sample text</p>` 같은 **가장 전형적인 카피 위반을 놓친다**. 식별자·키 이름은 두 구간 어디에도 들어가지 않으므로 발견 27의 오탐(`localStorage`·`todos.v1`)은 그대로 배제된다. 등급은 5-2와 같은 **기록 등급**(`P1 [Design-voice-grep]` 유지, 차단 아님).
3. **5-0은 회수 결과를 `회수 파일 N개 ((a) x · (b) y · (c) z · (d) w)` 한 줄로 echo한다.** 회수 출처에 **(d) 폐쇄 후 수리 기록**(기존 (d) «모두 실패 시»는 (e)로 민다) — `IMPROVEMENT_GUIDE.md ## 5`의 본 마일스톤 항목 `files:` 목록 — 을 더한다(마일스톤 층 수리가 바꾼 파일은 task `## 4-1`·커밋 Refs 어디에도 없다). N = 0이면 5-2·5-2b·5-3은 실행하지 않고 `P2 [Stabilize-scope-empty] 회수 파일 0건 — 5-x 미실행`을 기록한다(기존 `[Stabilize-recovery]`와 다른 라벨 — 회귀 신호 집계가 라벨 정확 일치로 돈다). 각 5-x 출력은 `대상 K파일 / 위반 M건`으로 둘을 함께 적는다.
4. **`P0 [Spec-gap]`은 QA_FINDINGS로 간다.** 구현 시작 뒤 unmapped FAC는 계약 결함이므로 ADR-070 D7(성격 기준 라우팅)대로 `QA_FINDINGS.md` 본 마일스톤 `### P0`에 등재한다 — 그래야 졸업 item 5가 센다. IMPROVEMENT_GUIDE에는 적지 않는다(ADR-037#amend-3의 «IMPROVEMENT_GUIDE에 기록» 문구는 ADR-070 D7 이전 서술 — 참조 갱신).

### 강도 (ADR-022)
- enabling(약, [관측됨]).

### Mutation delta (ADR-047 D3)
- failure = 카피 규칙이 코드 식별자에 발화 / 빈 회수가 «위반 0건»으로 통과 / 폐쇄 후 수리 파일이 회수에서 빠짐 / Spec-gap P0가 졸업 계수 밖 (관측됨). predicted = 저장 어댑터 프로젝트에서 5-2b 오탐 0 / 회수 0건이 출력에 드러남 / Spec-gap이 item 5에 들어감. falsifier = (a) 따옴표 구간 한정으로 실제 카피 위반을 놓친 사례가 1건이라도 나오면 대상 집합을 넓힌다 (b) UI surface 밖 파일에 사용자 카피가 있는 스택(예: i18n json)이 나오면 집합에 확장자를 더한다. rollback = 네 결정 삭제.
- 예산 영향 = 없음(메인 세션 preflight — 위임 단위 없음).

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md — 5-0 echo·(f) 출처 · 5-2b 대상·등급 · Spec-gap 라우팅
- .claude/skills/validate-workitem/SKILL.md — 결정 1 인용(축 5 신호)
- docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md — 결정 4 참조 갱신 줄
```
스킬 수정:
- `.claude/skills/stabilize-milestone/SKILL.md` 5-2b 현재: `5-0 회수 변경 파일(5-2의 웹 계열 확장자 집합 + `.dart`)에서 (a) placeholder 카피 패턴(…), (b) DESIGN.md `## 10` "금지 표현"의 `[grep 가능]` 정규식을 grep. 일치 시 `P1 [Design-voice-grep] <file:line> — DESIGN.md ## 10 위반` 기록.` → `5-0 회수 변경 파일 중 **UI surface 파일 집합(ADR-073#amend-2 결정 1)**의 파일에서, 각 줄의 **따옴표 안 문자열 구간**에만 (a)·(b)를 적용한다(결정 2 — 식별자·키 이름은 대상이 아니다). 일치 시 `P1 [Design-voice-grep] <file:line> — DESIGN.md ## 10 위반`(기록 등급 — 차단 아님) 기록. 출력은 `대상 K파일 / 위반 M건`.`
- 5-0의 기존 `(d) 모두 실패 시`를 `(e)`로 바꾸고, (c) 뒤에 출처 한 줄: `- **(d) 4차 — 폐쇄 후 수리 기록**: `IMPROVEMENT_GUIDE.md ## 5`의 본 마일스톤 항목 `files:` 목록(ADR-073#amend-2 결정 3 — 마일스톤 층 수리가 바꾼 파일은 여기에만 있다).` (e) 뒤에 echo 한 줄: `- **(f) 회수 결과 echo (ADR-073#amend-2 결정 3)**: `회수 파일 N개 ((a) x · (b) y · (c) z · (d) w)`. N = 0이면 5-2·5-2b·5-3을 실행하지 않고 `P2 [Stabilize-scope-empty] 회수 파일 0건 — 5-x 미실행`을 기록한다. 5-2·5-2b·5-3 출력은 `대상 K파일 / 위반 M건`으로 둘을 함께 적는다.`
- 54행 Spec-gap 현재 `- 발견 시 IMPROVEMENT_GUIDE에 `P0 [Spec-gap] F-NNN:FAC-N → unmapped` 기록 + graduation NO 유지 + 사용자 보고.` → `- 발견 시 **QA_FINDINGS.md 본 마일스톤 `### P0`**에 `P0 [Spec-gap] F-NNN:FAC-N → unmapped`(`- 출처: preflight`)로 등재한다(ADR-073#amend-2 결정 4 / ADR-070 D7 — 계약 결함은 QA 원장, 그래야 졸업 item 5가 센다) + 사용자 보고.` ADR-037 `## 현재 유효 결정` 셋째 불릿 끝에 `(기록 위치는 QA_FINDINGS — ADR-073#amend-2 결정 4)` 병기.
- validate-workitem 33행 축 5 신호 문장은 P4-4가 이미 «UI surface 파일 diff»로 바꿨다 — 그 정의 인용을 `ADR-073#amend-2 결정 1`로 적는다.

### P5-2. ADR-063 `## Amendment 1` — `[Guard-drift]` (b) 방향 + 낡은 digest 문구 (발견 28)
`docs/90-decisions/boilerplate/ADR-063-verification-harness-integrity.md` 끝에 append.
```markdown
<a id="adr-063-amend-1"></a>
## Amendment 1 (2026-09-XX) — D4 (b)를 copied-from 4방향 판정으로

### 배경
- [관측됨] D4 (b)는 ADR-058#amend-2 시절의 «source digest 일치» 문구 그대로였고, ADR-072 D6이 registry를 `copied-from`(복사 시 canonical sha) 6필드로 바꾼 뒤 재지정되지 않았다.
- [관측됨] stabilize (b)는 «canonical sha ≠ copied-from»만 보고 «/stack-guard 재실행 권장»을 냈는데, Round 11 fork는 **사본이 canonical보다 새로웠다**(라운드 중 버그 3건을 사본에서 고침). 그 처방대로 재실행하면 stack-guard 재실행 계약이 local modification을 덮어쓰지는 않지만, 처방 문구는 «사본이 앞선다»는 사실을 말하지 않아 사용자를 반대 방향으로 이끈다(발견 28).

### 결정
1. **D4 (b)를 다음으로 교체한다**: `status: ready`일 때 세 값을 읽는다 — canonical sha C(`.claude/skills/stack-guard/assets/design-gate.mjs`), registry `copied-from` R, 사본 sha P(`adapter path`). 판정은 네 경우다: (i) P = R, C ≠ R → `P2 [Guard-drift] canonical 갱신됨 — /stack-guard 재실행 권장(무수정 사본이라 교체된다)` (ii) P ≠ R, C = R → `P2 [Guard-drift] 사본 로컬 수정됨 — 재실행해도 덮어쓰지 않음(diff 보고). 수정분을 canonical로 역류할지 검토: IMPROVEMENT_GUIDE [ADR-candidate]` (iii) P = C ≠ R → `P2 [Guard-drift] registry만 낡음(코드 동일) — copied-from 갱신 권장(/stack-guard 재실행이 갱신)` (iv) P ≠ R, C ≠ R, P ≠ C → 둘 다 + `사용자 결정 필요`. 전부 읽기 전용·기록 등급. sha256 도구 부재 시 skip + 사유 echo.
2. 본문 배경·D6 예시의 «design gate digest» 표기는 «design gate copied-from 대조»로 읽는다(참조 갱신 — 본 amendment가 재지정).
3. **`/stack-guard` 재실행 계약의 (iii) 처리**: 사본 sha == canonical sha(코드 동일)이면 local modification이 아니다 — diff 보고·사용자 결정 없이 `copied-from`만 갱신한다(2026-09-12 dogfood-flutter 실측: 현재 계약은 이 경우를 «수정됨(빈 diff)»으로 보고한다).

### 강도 (ADR-022)
- enabling(약, [관측됨]).

### Mutation delta (ADR-047 D3)
- failure = 사본이 앞선 상황에 «재실행 권장»만 나옴 (관측됨). predicted = 네 경우가 각각 다른 문구로 나옴(2026-09-12 복제본 실측: dogfood-web은 (i), dogfood-flutter는 (iii)). falsifier = (ii)가 실제로는 canonical 회귀였던 사례가 나오면 mtime 보조 신호를 더한다. rollback = (b)를 amend 전 문구로.
- 예산 영향 = 없음.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md — §1.0 항목 8 (b)
- .claude/skills/stack-guard/SKILL.md — `## 재실행 계약` Design Gate Adapter 행 (결정 3)
```
스킬 수정: `.claude/skills/stabilize-milestone/SKILL.md` 120행 현재 `- (b) **design gate canonical 갱신** — `status: ready`인 경우 canonical … SHA-256 ≠ registry `copied-from`이면 `P2 [Guard-drift] design gate canonical 갱신됨 — /stack-guard 재실행 권장`(읽기 전용 — mtime·날짜 비교 없음; sha256 도구 부재 시 skip + 사유 echo).` → 결정 1의 4경우 문구로 교체(`ADR-063#amend-1` 인용). ADR-063 본문 13행·70행·88행·122행의 `design gate digest`는 그대로 두되 70행(D4 (b)) 줄 끝에 `(#amend-1이 copied-from 4방향 판정으로 대체 — 현재 SSOT: 본 ADR #amend-1)`을 병기한다. `.claude/skills/stack-guard/SKILL.md` 279행 `## 재실행 계약` Design Gate Adapter 행의 `다르면(local modification) 덮어쓰지 않고 diff 보고 + 사용자 결정` 앞에 `사본 sha == canonical sha면 코드 동일 — `copied-from`만 갱신(ADR-063#amend-1 결정 3);`를 넣는다.

### P5-3. ADR-035 `## Amendment 4` — §6.5 시그널 1 (발견 29)
`docs/90-decisions/boilerplate/ADR-035-continuous-discovery.md` 끝에 append.
```markdown
<a id="adr-035-amend-4"></a>
## Amendment 4 (2026-09-XX) — staleness 시그널 1을 mtime에서 변경 hunk 판정으로

### 배경
- [관측됨] 시그널 1(«DISCOVERY.md mtime > PROJECT_CHARTER.md mtime»)이 harness 자신의 쓰기에 발화한다 — 봉인 라운드가 `## 12` 가정 표에 원장 상호참조 3줄을 쓴 것만으로 매 마일스톤 P1 «drift 의심»이 뜬다(Round 11 발견 29). Charter가 소비하는 절(페르소나·핵심 pain·JTBD·시나리오)은 바뀌지 않았다.

### 결정
1. 시그널 1은 **«Charter 마지막 커밋 이후 DISCOVERY에 Charter 공급 절의 실질 변경이 있는가»**로 판정한다. 방법: `C=$(git log -1 --format=%H -- docs/10-charter/PROJECT_CHARTER.md)`; `git diff -U0 $C -- docs/10-charter/DISCOVERY.md`(워킹트리 변경 포함)의 각 hunk를 **새 파일의 줄 범위(`@@ -a,b +c,d @@`의 c..c+d)**로 현재 DISCOVERY의 `## N.` 헤딩 줄 범위에 대응시켜 절을 정한다(hunk 헤더의 함수명 칸은 markdown에서 절 제목을 보장하지 않으므로 쓰지 않는다). **제외**: `## 14`·`## 15`·`### Repair history` 절의 hunk 전부, 그리고 `## 12` 절의 hunk 중 변경 줄이 전부 원장 상호참조 패턴(`원장 D-[0-9]{3}`·`risk-accepted`)만 담은 것. `## 12`의 그 밖의 변경(가정 추가·결과 변경)은 Charter `## 9`의 공급원이므로(ADR-069 D3 전파표) 발화한다. 제외 뒤 남는 hunk가 1개 이상이면 발화. git 이력이 없으면(fresh fork) mtime 규칙으로 degrade + 사유 echo.
2. 시그널 2~4는 불변.

### 강도 (ADR-022)
- enabling(약, [관측됨]).

### Mutation delta (ADR-047 D3)
- failure = 정기 오탐 (관측됨). predicted = 원장 상호참조만으로는 발화 0, 가정 내용 변경은 발화. falsifier = Charter 공급 절이 바뀌었는데 판정이 놓치면(절 매핑 오류) 헤딩 매핑을 넓힌다. rollback = mtime 규칙 복귀.
- 예산 영향 = 없음.

### 적용 surface
- .claude/skills/stabilize-milestone/SKILL.md — §6.5 시그널 1
```
스킬 수정: `.claude/skills/stabilize-milestone/SKILL.md` 6.5 현재 1번 `1. `docs/10-charter/DISCOVERY.md`의 mtime이 `docs/10-charter/PROJECT_CHARTER.md`의 mtime보다 최신인지.` → 결정 1 문장(`ADR-035#amend-4`)으로 교체하고 명령 두 줄과 «줄 범위 → 절» 대응 규칙을 그대로 적는다.

### P5-4. ADR-050 `## Amendment 2` — Bash 보유 report-only 에이전트의 쓰기 금지 (발견 25)
`docs/90-decisions/boilerplate/ADR-050-main-session-lifecycle-skills.md` 끝에 append.
```markdown
<a id="adr-050-amend-2"></a>
## Amendment 2 (2026-09-XX) — Bash 보유 report-only 에이전트는 프로젝트 트리에 쓰지 않는다

### 배경
- [관측됨] qa·validator는 `tools: Read, Glob, Grep, Bash`다(브라우저 구동·`validate` 실행에 필요). «report-only»는 산문 규율뿐이라, Round 11 stabilize에서 qa 단위가 «검증 스크립트를 프로젝트 안으로 복사해 실행»을 다음 행동으로 잡은 채 턴 한도에 걸렸다 — 한도가 아니었으면 프로젝트에 파일을 썼을 것이다(발견 25, near-miss).

### 결정
1. **Bash를 가진 report-only 에이전트(qa·validator)는 프로젝트 트리(저장소 안)에 소스·테스트·검사 스크립트·설정 파일을 만들거나 고치지 않는다.** 도구가 정한 출력 경로에 생기는 실행 산출물(테스트 캐시·`design-gate-shots/`·리포트 파일·`coverage/`)은 이 금지의 대상이 아니다. 임시 스크립트가 필요하면 (a) `node -e`·`dart run --eval`류 인라인 실행 또는 (b) 호출자가 지정한 scratch 경로(저장소 밖)만 쓴다. 둘 다 불가하면 `Needs Script: <목적> — <필요한 실행 방식>`으로 보고하고 멈춘다.
2. **호출자(stabilize 단계 4·5, validate-workitem dispatch)는 위임 프롬프트에 «작업 파일을 프로젝트에 만들지 않는다 — scratch 경로: <경로>» 한 줄과 scratch 경로를 넘긴다.** §3-V·3-P처럼 스크립트 실행이 예정된 단계는 실행 방식을 프롬프트에 미리 지정한다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 1.

### Mutation delta (ADR-047 D3)
- failure = report-only가 프로젝트에 쓰기 직전 (near-miss 관측). predicted = Round 14에서 qa/validator의 소스·스크립트 쓰기 0건, `Needs Script` 보고가 대신 나옴. falsifier = `Needs Script`가 마일스톤당 3회 이상이면 scratch 경로를 stack-guard가 미리 만들어 둔다. rollback = 두 결정 삭제.
- 예산 영향 = 없음.

### 적용 surface
- .claude/agents/qa.md — 결정 1
- .claude/agents/validator.md — 결정 1
- .claude/skills/stabilize-milestone/SKILL.md — 결정 2 (단계 4·5 dispatch)
- .claude/skills/validate-workitem/SKILL.md — 결정 2 (dispatch)
```
수정:
- `.claude/agents/qa.md`·`validator.md` 규칙 목록 첫 줄에: `- **프로젝트 트리에 소스·테스트·스크립트·설정 파일을 만들거나 고치지 않는다 (ADR-050#amend-2).** 도구 출력 경로의 실행 산출물은 예외. 임시 스크립트는 `node -e`류 인라인 또는 호출자가 준 scratch 경로에만. 둘 다 불가하면 `Needs Script: <목적>`으로 멈춘다.` (P3-3에서 이 두 파일의 «골격만으로 먼저 쓴다» 문장을 지웠는지 함께 확인한다.)
- `.claude/skills/stabilize-milestone/SKILL.md` 단계 4(qa 팬아웃 입력)·단계 5(reviewer 입력)에: `- 입력에 «작업 파일을 프로젝트에 만들지 않는다 — scratch 경로: <세션 scratchpad>/stabilize-M<N>/» 한 줄(ADR-050#amend-2).` §3-V·3-P의 스크립트 실행은 «메인이 scratch 경로에 스크립트를 두고 경로를 넘긴다»를 명시.
- `.claude/skills/validate-workitem/SKILL.md` dispatch 문단에 같은 한 줄.

### P5-5. ADR-072 `## Amendment 5` — 게이트·design-milestone 보류분 (발견 20·53·58·23·40·9 + «승인본 충실도»)
`docs/90-decisions/boilerplate/ADR-072-design-milestone-and-code-prototype.md` 끝에 append.
```markdown
<a id="adr-072-amend-5"></a>
## Amendment 5 (2026-09-XX) — 게이트 보류 탐지기 4건 + 승인본 충실도 묶음 + R1 화면 정의

### 배경
- [관측됨] `--tokens-only`가 JS 스타일 객체의 단위 없는 숫자(`style={{ maxWidth: 640 }}`)를 잡지 못한다(발견 20). 반대로 stabilize 5-2는 `Colors.transparent`를 예외로 뒀는데 게이트는 아직 잡는다(불일치).
- [관측됨] Flutter 어댑터는 `flutter test` 실행당 항목 1개에 `viewport: null`이라 뷰포트 루프를 빠뜨린 테스트도 `blocker 0`이다(발견 53). 규칙(«--snapshot 없는 0건을 커버리지 증거로 읽지 마라»)만 있고 report는 정직하지 않다. 테스트 이름에는 이미 `<w>x<h>`가 들어 있다.
- [관측됨] 승인본이 결정을 담지 않은 세 사례(23 데코레이터 주입·58 렌더 조건 무시·69 글꼴 미적재)가 한 라운드에 나왔다. R6-5 체크리스트에 항목은 있으나 흩어져 있고, 자가 검사는 렌더 조건 적용을 검사하지 않는다.
- [관측됨] 승인 컴포넌트의 행동 변경 규칙(D5-3-1)은 있으나 고지 누락을 아무도 보지 않는다(발견 40). 단일 라우트 앱에서 «화면»이 흔들렸다(발견 9).

### 결정
1. **`--tokens-only` 확장**: 코드 파일에서 같은 줄에 `style={{` 또는 `style: {`가 있으면 그 줄의 `\b(width|height|maxWidth|minWidth|maxHeight|minHeight|margin\w*|padding\w*|top|left|right|bottom|gap|fontSize|borderRadius)\s*:\s*(?:[2-9]|[1-9]\d+)\b`를 리터럴로 잡는다(0·1은 토큰 대상이 아니고 `lineHeight`는 배수라 제외). `Colors.transparent`는 제외한다(stabilize 5-2와 정합).
2. **Flutter report 뷰포트 축(기록 등급)**: 어댑터는 `flutter test`가 `DESIGN_GATE_OUT`에 남긴 PNG 파일명 `<screen>-<state>-<w>x<h>.png`(ADR-072 D6의 기존 계약)에서 **실제로 렌더된 (상태 × 뷰포트)**를 읽어 (화면 × 뷰포트)마다 `screens[]` 항목을 만든다(`viewport: {w,h}`, `state` 필드 추가). 각 상태의 기대 뷰포트는 `states[].render.viewports`가 있으면 그것, 없으면 프로필 뷰포트다. 기대에 없는 (상태 × 뷰포트)는 `reports: [{ rule: 'viewport-coverage', state, detail: 'expected …, rendered …' }]`로 **보고**한다 — 차단이 아니다. **PNG가 하나도 없으면 `viewport: null` 항목 하나로 하위 호환하되 `reports`를 비우지 않고 `viewport-coverage-unavailable`(«측정 불가»)를 남긴다** — 「대상 0건」과 「위반 0건」을 구분하는 것은 ADR-073#amend-2 결정 3과 같은 원칙이고, 침묵하면 R4 규약 미적용이 통과로 읽혀 아래 falsifier (a)를 관측할 수 없다. 이유: 위젯 테스트의 group 이름에 `<w>x<h>`를 넣는 규약은 아직 어디에도 적혀 있지 않고(기존 복제본은 관행일 뿐), 문자열 검사만으로 차단 등급을 주지 않는다(ADR-063 D6). R4 생성 규칙과 builder ui-authoring 모드에 «상태·뷰포트마다 `group('<state> <w>x<h>')` + PNG 저장» 규약을 이번에 박고, 차단 승격은 그 규약이 실제 생성물에 들어간 다음 라운드 후보다. D6의 «--snapshot 없는 0건을 증거로 읽지 마라» 문장은 «report의 `viewport-coverage`와 PNG 파일명이 증거다»로 대체한다.
3. **자가 검사 (e) 렌더 조건**: 임시 매니페스트에 두 번째 known-good HTML(`good2`)을 가리키는 상태 `{ id: 'narrow', preview: 'url:<good2>', baseline: true, render: { viewports: [{w:320,h:720}] } }`를 두고, `--snapshot` 결과에 `self-good-narrow-320x720.png`가 있고 report의 `preview`가 `good2`인 항목의 `viewport.w`가 320인지 본다(`baseline: true`가 없으면 스냅샷 분기가 그 상태를 건너뛴다 — 코드 455행 `isBaseline`).
4. **하네스 주입 정적 관찰(기록 등급)**: `--manifest` 실행 시 웹은 화면 `source[]`의 `*.stories.*`에서 `decorators` 배열(파일 안 **모든** 배열, 한 줄로 쓴 것 포함 — 대괄호 균형으로 끝을 찾는다) 안 JSX 태그 중 provider·wrapper 허용 목록(`ThemeProvider|MemoryRouter|div(style만)|Fragment`) 밖의 태그(`h1~h6|header|nav|main|footer|aside|p|span|button|a`)가 있으면, Flutter는 `test/screens/*_prototype_test.dart`의 `pumpWidget(` 인자 안에서 화면 위젯 밖에 `Scaffold(|AppBar(|Text(|Icon(`이 있으면 `reports: [{ rule: 'harness-injection-suspect', … }]`를 낸다. 차단 아님 — R6-5 «하네스 요소 0» 사람 확인이 여전히 관문이다.
5. **행동 변경 고지 관찰(기록 등급)**: validator는 `승인 UI 재사용` task의 `source[]` diff에 행동 토큰(`on[A-Z]\w+\s*[:=]`, `setState(`, `useState(`, `useEffect(`, `useReducer(`, `useCallback(`, `Timer(`, `debounce|throttle`, `.then(`, `await `)이 있는데 task `## 8`(또는 repair `## 5`)에 `승인 컴포넌트 행동 변경:` 고지 줄이 없으면 `P2 [Design-behavior-drift] <file> — 고지 누락`을 낸다.
6. **R1 화면 정의**: 화면은 라우트가 아니라 «사용자가 한 번에 보는 상태 묶음»이다. 단일 라우트 앱은 상태 묶음 단위로 화면을 도출하고, 브리프 첫 줄에 `- 화면 도출 메모: <라우트/상태 묶음 근거>`를 남긴다(D1 R1 부기).
7. **R6-5 «승인본 충실도» 묶음**: 승인 체크리스트의 흩어진 항목을 한 묶음으로 둔다 — (i) 하네스 요소 0(#amend-3) (ii) 결정 글꼴 실재(ADR-073#amend-1) (iii) 렌더 조건 적용(스냅샷 파일명 `-<w>x<h>`·report viewport·`viewport-coverage` 0) (iv) A/B 화면은 **R5 선택 전**에 두 안의 렌더가 있었고, **선택 후**에는 선택본 렌더 + 원장 `D-NNN` `closed`(#amend-4 결정 3(ii)의 «두 안 모두 실재»는 선택 전 시점을 뜻한다 — 이 문장으로 정정) (v) 렌더 카피 = 브리프 카피. 하나라도 아니면 승인하지 않는다.
8. **D8 재진입 상태 문구 정정**: «UI 마일스톤은 `draft` 유지»는 **최초 작성**의 규칙이다. `contract-ready` UI M을 텍스트 계약 수정으로 재실행하면 상태를 바꾸지 않는다(강등 전이 없음 — ADR-060 D6). plan-milestone Exit 문장을 «UI 마일스톤: 재대조만 통과시키고 **상태는 그대로 둔다**(최초 작성이면 `draft`, 재진입이면 `contract-ready`)»로 고친다.

### 강도 (ADR-022)
- 제약(중, [관측됨]): 결정 7.
- enabling(약): 결정 1·2·3·4·5·6·8.

### Mutation delta (ADR-047 D3)
- failure = 단위 없는 숫자 미검출 / Flutter 뷰포트 누락 침묵 / 렌더 조건 자가 검사 부재 / 주입·행동 변경 미관찰 / 재진입 상태 문구 충돌 (관측됨). predicted = Round 14 R6에서 `viewport-coverage` 0·자가 검사 (e) PASS, 주입 의심 report가 사람 확인과 일치, contract-ready 재진입이 상태를 바꾸지 않음. falsifier = (a) PNG 파일명 파싱이 정상 테스트에서 «rendered 없음»을 내면(테스트가 PNG를 안 남김) R4 규약 위반으로 분류하고 그 규약을 먼저 박는다 (b) harness-injection-suspect 오탐이 report의 절반을 넘으면 허용 목록을 넓힌다 (c) 결정 1이 카운트·인덱스 값을 잡으면 속성 목록을 좁힌다. rollback = 각 결정 개별 삭제.
- 예산 영향 = validator(축 5)에 관찰 항목 1개 추가 — `maxTurns 16` 유지, slice 기준 무변경. 그 외 없음.

### 적용 surface
- .claude/skills/stack-guard/assets/design-gate.mjs — 결정 1·2·3·4
- .claude/skills/design-milestone/SKILL.md — 결정 2(R4 group 규약·R6-2 문장)·6(R1)·7(R6-5)
- .claude/skills/plan-milestone/SKILL.md — 결정 8 (Exit 문장)
- .claude/agents/builder.md — 결정 2 (ui-authoring 모드의 위젯 테스트 group·PNG 규약)
- .claude/agents/validator.md — 결정 5
- .claude/skills/validate-workitem/SKILL.md — 결정 5 (UI 항목 한 줄)
- .claude/skills/stack-guard/SKILL.md — 자가 검사 케이스 수 (e) 반영
```
코드·스킬 수정:
- `.claude/skills/stack-guard/assets/design-gate.mjs`
  - `runTokensOnly` 현재 `LITERAL_CODE = /#[0-9a-f]{6}(?:[0-9a-f]{2})?\b|\[#[0-9a-f]{3,8}\]|Color\(0x[0-9a-fA-F]{6,8}\)|\bColors\.\w+\b|\b\d+px\b/g;` → `\bColors\.(?!transparent\b)\w+\b`로 바꾸고, 줄에 `/style\s*(=\s*\{\{|:\s*\{)/`가 있으면 결정 1의 속성 정규식(값 ≥ 2)도 추가 매치한다(`LITERAL_STYLE`도 `Colors` 부분 동일 변경).
  - Flutter 어댑터(현재 `runFlutterTest`(301~337행)가 `flutter test --reporter json`을 돌려 `{ unavailable }`·`{ timedOut }`·`{ compileError }`·`{ ok, blockers }` 중 하나로 정규화하고, `--manifest` 분기 415~419행이 `viewport: null` 항목 1개를 push): 실행 뒤 `DESIGN_GATE_OUT`(= `design-gate-shots/`)의 `<screen>-<state>-<w>x<h>.png` 목록을 읽어 (상태 × 뷰포트)를 얻고, 프로필 뷰포트(상태에 `render.viewports`가 있으면 그것)마다 `screens[]` 항목을 push한다(`viewport: {w,h}`, `state`). 렌더되지 않은 (상태 × 뷰포트)는 `reports: [{ rule: 'viewport-coverage', state, detail }]`(차단 아님). PNG가 하나도 없으면 `viewport: null` 항목 하나(하위 호환)를 내되 **`reports`에 `viewport-coverage-unavailable`을 담는다**(침묵 금지 — 결정 2).
  - `--self-test`에 케이스 (e): (c)의 임시 매니페스트에 두 번째 good HTML을 쓰고 `{ id: 'narrow', preview: 'url:<good2>', baseline: true, render: { viewports: [{ w: 320, h: 720 }] } }`를 추가한다. 통과 조건: `snapDir`에 `self-good-narrow-320x720.png` 실재 + report에서 `preview`가 good2인 항목의 `viewport.w === 320`. `cases.push({ case: 'e-render-condition', pass })`.
  - 결정 4의 정적 관찰: `--manifest` 실행 시 화면마다 `source[]`의 stories 파일(웹) 또는 preview의 테스트 파일(Flutter)을 읽어 정규식 검사 → `reports[]`에 `harness-injection-suspect` push(차단 아님).
  - 헤더 주석에 `ADR-072#amend-5` 추가.
- `.claude/skills/design-milestone/SKILL.md`
  - 38행 R1 현재 `- feature `## 3` 시나리오에서 화면을 도출한다(feature당 대표 1화면 기본, …).` 앞에 한 줄: `- **화면의 정의**: 화면은 라우트가 아니라 «사용자가 한 번에 보는 상태 묶음»이다. 단일 라우트 앱은 상태 묶음 단위로 도출하고 브리프 첫 줄에 `- 화면 도출 메모: <근거>`를 남긴다(ADR-072#amend-5 결정 6).`
  - 75행 R6-2 현재 `**Flutter 화면은 `--snapshot` 없는 실행의 `blockers: 0` 을 뷰포트 커버리지 증거로 읽지 않는다**(ADR-072 D6 — 그 갈래는 report 에 `viewport: null` 을 낸다). 뷰포트 확인은 6번의 `--snapshot` 결과 파일명(…)으로 한다.` → `**Flutter 화면은 report의 (상태 × 뷰포트) 항목과 `viewport-coverage` report, 그리고 PNG 파일명이 커버리지 증거다**(ADR-072#amend-5 결정 2). `viewport-coverage`가 1건이라도 있으면 승인하지 않는다(R6-5 (iii)).` R4의 Flutter 문장(`test/screens/<screen>_prototype_test.dart`(프로필 크기 렌더 + guideline 4종 + overflow 0 + PNG …))에 `— 상태·뷰포트마다 `group('<state> <w>x<h>')` 안에서 렌더하고 `DESIGN_GATE_OUT`에 `<screen>-<state>-<w>x<h>.png`를 저장한다(결정 2 규약)`를 덧붙인다. `builder.md` ui-authoring 모드의 Flutter 산출물 문장에도 같은 규약 한 줄.
  - 78행 R6-5 승인 체크리스트의 `**하네스 요소 0**(ADR-072#amend-3) …` 부터 이어지는 항목들을 `**승인본 충실도(ADR-072#amend-5 결정 7)**: (i) 하네스 요소 0(#amend-3) (ii) 결정 글꼴 실재(ADR-073#amend-1) (iii) 렌더 조건 적용 — 파일명 `-<w>x<h>`·report viewport (iv) A/B는 **R5 선택 전**에 두 안 렌더가 있었고 **선택 후**에는 선택본 렌더 + 원장 `D-NNN` `closed`(#amend-4 결정 3(ii) + #amend-5 결정 7 (iv) — R5가 탈락안을 지우고 재촬영하므로 선택 후에 두 안을 요구하면 정상 흐름과 충돌한다) (v) 렌더 카피 = 브리프 카피` 묶음으로 재배치한다(기존 문장은 삭제하지 말고 묶음 아래로 옮긴다).
- `.claude/agents/validator.md` UI 항목 `**승인 UI 재사용 점검 (ADR-072 D5-4)**` 문단 끝에 결정 5 문장을 추가. `.claude/skills/validate-workitem/SKILL.md` 5축 UI 항목에 `… + 행동 변경 고지 누락은 `P2 [Design-behavior-drift]`(ADR-072#amend-5 결정 5)` 한 줄.
- `.claude/skills/stack-guard/SKILL.md` 6-4-1 «자가 검사» 문장의 케이스 수(«4케이스» 또는 «실행된 케이스 전부»)에 `(e) 렌더 조건`을 더한다. ADR-072 D6 본문의 `**report 의 뷰포트 축은 Flutter 갈래에서 비어 있다 (2026-09-12)**: …` 단락 끝에 `(#amend-5 결정 2가 대체 — 현재 SSOT: 본 ADR #amend-5)` 병기. ADR-072#amend-4 결정 3(ii) 문장 끝에 `(선택 전 시점 — #amend-5 결정 7 (iv))` 병기.
- `.claude/skills/plan-milestone/SKILL.md` 111행 현재 `- **UI 마일스톤(산하 feature `Design:` 줄 ≥1)**: 재대조만 통과시키고 **`draft` 유지**.` → `… 재대조만 통과시키고 **상태는 그대로 둔다**(최초 작성이면 `draft`, `contract-ready` 재진입이면 `contract-ready` — 강등 전이 없음, ADR-072#amend-5 결정 8).` 123행 출력 문구 `(UI 마일스톤) `draft` 유지·화면 층은` → `(UI 마일스톤) 상태 유지·화면 층은`. ADR-072 D8의 «**`draft` 유지**» 문장 끝에 `(최초 작성 한정 — #amend-5 결정 8)` 병기.

### P5-6. ADR-058 `## Amendment 5` — visual-qa spec의 seed 반영 단언 (발견 19) + 요약 정정
`docs/90-decisions/boilerplate/ADR-058-design-workflow.md` 끝에 append.
```markdown
<a id="adr-058-amend-5"></a>
## Amendment 5 (2026-09-XX) — visual-qa spec은 seed가 화면에 반영됐는지 먼저 단언한다

### 배경
- [관측됨] #amend-3 결정 2 «spec이 전제를 소유한다»는 spec이 seed를 넣는 것까지만 보장했다. Round 11에서 앱이 그 seed(`localStorage` 키)를 소비하지 않게 바뀌자 spec은 빈 화면을 검사하고 «통과»했다 — vacuous pass가 skip 대신 통과로 나타났다(발견 19).

### 결정
1. 생성되는 `visual-qa.spec`은 seed 주입 뒤 **대표 항목 1건이 화면에 실재함을 첫 단언**으로 둔다(`expect(page.getByText(seed.title)).toBeVisible()` 동형). 실패하면 spec 전체를 실패로 끝낸다 — 전제가 깨졌음을 알리는 것이 목적이다. Flutter integration_test의 seed도 같다.
2. `## 현재 유효 결정` 셋째 불릿의 «고정 fixture conformance와 source digest를 통과한 v2만 사용한다(#amend-1·#amend-2)» 문구는 #amend-4 결정 4로 ADR-072 D6에 이관된 낡은 서술이므로 «UI 판정 뒤 `/stack-guard`가 게이트 v3 asset을 물질화하고 자가 검사를 통과시킨다(실행물 계약: ADR-072 D6)»로 정정한다.

### 강도 (ADR-022)
- enabling(약, [관측됨]).

### Mutation delta (ADR-047 D3)
- failure = seed 미반영 상태를 통과로 판정 (관측됨). predicted = 전제 파손 시 spec이 첫 단언에서 실패. falsifier = 첫 단언이 정상 앱에서 timing 오탐을 내면 readiness 대기를 단언 앞에 둔다. rollback = 결정 1 삭제.
- 예산 영향 = 없음.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md — 6-4-1 «구현 앱 Visual-QA» 전제 처리 ①
```
스킬 수정: `.claude/skills/stack-guard/SKILL.md` 195행 현재 `① **spec이 전제를 소유한다** — 스스로 seed/fixture로 populated 상태를 만든 뒤 검사하므로 대상 요소 부재는 *항상 실패* 다.` → `① **spec이 전제를 소유하고, 소유한 전제가 화면에 반영됐는지 먼저 단언한다** — seed/fixture로 populated 상태를 만든 뒤 대표 항목 1건의 가시성을 첫 단언으로 두고, 그 뒤 검사한다. 대상 요소 부재는 *항상 실패*이며 seed 미반영도 실패다(ADR-058#amend-5).` ADR-058 `## 현재 유효 결정` 셋째 불릿은 결정 2 문구로 교체.

### P5-7. 커밋
```
docs(adr): amend ADR-073, ADR-063, ADR-035 and ADR-050 for preflight scope, guard-drift direction, staleness signal and verifier write ban
docs(adr): amend ADR-072 and ADR-058 with deferred gate detectors, approval fidelity checklist and seed assertion
feat(stabilize): narrow voice grep, echo recovered file count, judge guard drift in four directions and gate discovery staleness on hunks
feat(design-gate): add style-object literals, per-viewport Flutter report from capture names, render-condition self-test and harness-injection report
```
(네 커밋: ADR 4종 / ADR 2종 / stabilize·agents / 게이트·design-milestone·validator.)

---

## Phase 6. 기존 결함 11건 (앞 가이드 부록 F)

목표: 앞 라운드가 «범위 밖»으로 둔 기존 결함을 닫는다. 2026-09-12에 전부 실재를 재확인했다. ADR을 고치는 것은 넷(P6-4 ADR-066#amend-2, P6-8 ADR-059#amend-2, P6-12 ADR-005#amend-3, P6-5 ADR-064 참조 갱신 줄)이고 나머지는 스킬·에이전트·문서 수정이다.

### P6-1. `finalize-workitem` — 커밋 실패 뒤 `done` 잔존
현재: 수행 6이 `## 0. Status`를 `done`으로 쓰고 closure 줄을 append한 뒤 수행 8 `git commit -m "..."` 실행. 수행 8에 실패 분기가 없고, 1-G는 `done`이면 read-only no-op이다. 커밋이 실패하면 «done인데 미커밋»이 남고 재호출은 no-op이다. 되돌리기(rollback)는 택하지 않는다 — 수행 3 ②가 같은 편집 라운드에 `- ac-pending`을 쓰고, 복구 편집이 task 문서 mtime을 올려 수행 3의 채점표 stale 검사(28행: report mtime이 task 문서보다 오래되면 `Needs Validation`)에 걸리며, «done + 문서 dirty»는 accept-milestone이 receipt를 append한 정상 상태와 구별되지 않는다. 대신 **«staged인데 미커밋»**이라는 정확한 서명을 쓴다.
변경:
- 수행 8 `- **금지**: `--no-verify`, `--amend`, `git push`.` 아래에 추가:
  ```
   - **실패 분기**: `git commit`이 0이 아니면 아무것도 되돌리지 않는다 — staging(수행 5의 파일 + 수행 6의 task 문서)을 그대로 두고 stderr 요약과 함께 `Needs Commit: <원인>`으로 종료한다. 이 상태의 서명은 «task 문서가 staged인데 커밋되지 않음»이며 1-G가 그것으로 재개한다.
  ```
- 1-G 현재 `… `done`이면 read-only no-op("이미 완료" 안내, 파일·git 무변경).` → `… `done`이면 read-only no-op. **단 `git diff --cached --name-only`에 그 task 문서가 있고 staged diff에 이번 `- closure` 줄이 포함돼 있으면 «커밋 실패 잔존»이다 — 수행 7·8만 다시 수행한다**(검사·편집은 반복하지 않는다. 워킹트리에만 dirty한 done 문서는 accept-milestone receipt 등 정상 상태이므로 건드리지 않는다).`
커밋: `fix(finalize): resume the commit from the staged state instead of leaving done uncommitted`

### P6-2. `repair-plan` — M 입력 시 산하 F·T 리뷰 파일도 회수
현재: seal-milestone 80행은 `plan-reviews/`에서 `M<N>.*.md` **및 산하** `F-NNN.*.md`·`T-NNN.*.md`를 회수하고 차단 시 `/repair-plan M<N>`을 안내하는데, repair-plan 18행은 `docs/40-validation/plan-reviews/<workitem-id>.*.md` glob 하나만 본다. F-001 리뷰만 있으면 «리뷰 없음»으로 끝난다.
변경: repair-plan 18행 `1. 임시 리뷰 파일 회수: `docs/40-validation/plan-reviews/<workitem-id>.*.md` glob.` → `1. 임시 리뷰 파일 회수: `docs/40-validation/plan-reviews/<workitem-id>.*.md` glob. **입력이 `M<N>`이면 산하 feature·task id도 회수 대상이다** — 마일스톤 문서 `## 3`의 feature 링크와 각 feature 문서의 task 링크에서 id를 모아 `F-NNN.*.md`·`T-NNN.*.md`도 glob한다(seal-milestone 조건 8과 같은 집합).` 5-D 영속 위치는 파일이 가리키는 workitem 타입으로 정한다(기존 규칙 그대로).
커밋: `fix(repair-plan): collect child feature and task review files for a milestone id`

### P6-3. `repair-plan` — 마일스톤 층(전 task done) 분기
현재: 2-S의 `**`ready` + `- 봉인일:` 채워짐 + 구현 흔적 task 1건 이상** (= 구현 시작됨)` 분기가 task scope finding을 task `## 8`에 쓰고 `/repair-workitem`으로 안내한다. 그런데 산하 task가 전부 `done`이면 task 문서는 동결(ADR-068 D1)이고 repair-workitem은 거부한다(25행). 또 `IMPROVEMENT_GUIDE ## 5`는 닫힌 결정 기록이라 `/repair-milestone`의 회수 대상이 아니다(repair-milestone 29행: `## 2. 열린 항목` 안의 그룹만 회수) — 거기에 넣으면 수리 입력이 사라진다.
변경: 그 분기 위에 새 분기 삽입:
```
   - **`ready` + `- 봉인일:` 채워짐 + 산하 task 전부 `done`** (= 마일스톤 층, ADR-068 D1): 계획을 수정하지 않고 task 문서에도 쓰지 않는다. finding은 **후속 수리 스킬이 읽는 원장**에 open으로 등재한다 — 결함(계약 위반)은 `QA_FINDINGS.md` 본 마일스톤 `### P0/P1/P2`에 `- 출처: peer(plan-review)` + `status: open` + `decision: needs-confirmation`(3필드)으로, 개선은 `IMPROVEMENT_GUIDE.md ## 2. 열린 항목`의 `### M<N>` 그룹에 `status: open`으로. `## 5`에는 «판정 이력 + 등재 ID 링크» 한 줄만 남긴다. 라우팅은 결함이면 `/repair-milestone M<N>`, 수용 라운드 finding이면 `/repair-acceptance M<N>`, 새 범위면 M<N+1> 후보다. review 파일은 (iii)대로 삭제한다.
```
5-D `**영속 위치 — workitem 타입별로 다름**` 표의 task 행 끝에 `(산하 task 전부 `done`이면 task `## 8` 대신 위 분기의 원장 — ADR-068 D1)` 부기.
커밋: `fix(repair-plan): register milestone-layer findings in the ledgers repair skills actually read`

### P6-4. `accept-milestone`·`repair-acceptance` — 재확인 전용 라운드 (ADR-066 `## Amendment 2`)
현재: ADR-066 28행 «라운드 상한 3회». accept-milestone은 `미완`만 카운터를 소모하지 않는다(109행). 보류 → repair-acceptance가 `- invalidated`를 남김 → 재accept가 4회차에 걸린다. `## 11`은 매 라운드 덮어쓰는 최신 1블록이고 판정 enum은 `<승인 | 보류(백로그 N건) | 미완(…)>`(MILESTONE_TEMPLATE 68행), `## 8`은 append-only 이력이다.
설계 원칙: **실행 모드와 결과값을 분리**한다. 모드는 `- 모드: 탐색 | 재확인` 한 줄로 `## 11`에 적고, 판정 enum은 그대로 둔다. 진입 조건은 마지막 판정이 아니라 **task `## 8`의 상태**로 정한다(ADR-065 D3 판독 규칙과 동형 — 그 AC의 *마지막* 이벤트).
ADR-066 끝에 append:
```markdown
<a id="adr-066-amend-2"></a>
## Amendment 2 (2026-09-XX) — 재확인 전용 라운드는 카운터를 소모하지 않는다

### 배경
- [관측됨] 보류 3회차 뒤 `/repair-acceptance`가 관측 AC를 `- invalidated`로 무효화하면 receipt를 다시 받을 라운드가 필요한데, 상한 3회가 이미 찼다. 상한의 목적은 «새 탐색을 무한히 반복하지 않는 것»이지 «수리한 것을 확인하지 못하게 하는 것»이 아니다.

### 결정
1. **모드 판정**: `/accept-milestone` R0는 산하 task `## 8`에서 modality가 `[사용자 관측]`·`[플랫폼 관측]`인 AC 중 **마지막 이벤트가 `- invalidated`인 AC**(= 재확인 대상)와, **receipt 이벤트가 한 번도 없는 AC**(= 미발급 대상)를 회수한다. 재확인 대상이 1개 이상이고 미발급 대상이 0개면 **재확인 모드**, 아니면 탐색 모드다. 판정 enum(`승인 | 보류 | 미완`)은 두 모드가 같다.
2. **재확인 모드**: 재확인 대상 AC만 확인하고 `## 11`에 `- 모드: 재확인 (카운터 미소모)`를 적으며 `- 라운드:` 값을 올리지 않는다. 탐색(새 시나리오)은 하지 않는다. 단 **확인 중 발견한 계약 위반은 탐색 모드와 똑같이 `QA_FINDINGS.md`에 등재한다** — 미루지 않는다(그것이 P0면 판정은 `보류`).
3. **탐색 모드**는 기존 규칙 그대로(상한 3회). 재확인 모드는 재확인 대상이 남아 있는 한 반복 가능하며 상한과 무관하다.
4. 자동 검증 AC만 수리해 `- invalidated`가 0건이면 재확인 라운드는 필요 없다 — `/stabilize-milestone` 재실행이 경로다.

### 강도 (ADR-022)
- enabling(약, [관측됨]).

### Mutation delta (ADR-047 D3)
- failure = 수리 뒤 재확인이 상한에 막힘 (관측됨). predicted = 보류 3회 뒤에도 수리 항목 재확인이 가능하고, 재확인 라운드가 새 탐색으로 변질되지 않음. falsifier = 재확인 모드에서 새 결함이 반복 등재되면 모드 판정(대상 AC 회수)이 새는 것 — 대상을 좁힌다. rollback = 결정 1~4 삭제.
- 예산 영향 = 없음.

### 적용 surface
- .claude/skills/accept-milestone/SKILL.md — R0 모드 판정 · `## 11` 기록 · 4 최종 출력
- .claude/skills/repair-acceptance/SKILL.md — 수행 후 안내
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md — `## 11` `- 모드:` 줄
- docs/00-meta/WORKFLOW.md — §5-1 미완 규칙 옆에 재확인 모드 한 줄
```
스킬·템플릿 수정: accept-milestone 21행(`라운드 번호는 … +1이다.`) 뒤에 결정 1·2 문장(`ADR-066#amend-2`); 100행 `판정 + 라운드 번호(상한 3 중 N회차)` → `… + 모드(탐색 N회차 | 재확인 — 카운터 미소모)`; 109행 `미완` 문단 뒤에 «재확인 모드도 카운터를 올리지 않는다» 한 줄. repair-acceptance «수행 후» 3번 `- invalidated`가 1건 이상이면 … `/accept-milestone <M>`을 먼저 재실행한다` 끝에 `(재확인 모드 — 카운터 미소모, ADR-066#amend-2)`. MILESTONE_TEMPLATE 68행 `- 판정: <승인 | 보류(백로그 N건) | 미완(<사유> — 확인 K/M건)>` 앞에 `- 모드: <탐색 | 재확인 (카운터 미소모)>` 줄. WORKFLOW 76행 `미완` 규칙 문장 뒤에 `재확인 모드(마지막 이벤트가 `- invalidated`인 관측 AC만 확인)도 카운터를 소모하지 않는다(ADR-066#amend-2).`
커밋: `docs(adr): amend ADR-066 so re-confirmation rounds do not consume the acceptance round cap`

### P6-5. `repair-workitem` ↔ `validate-workitem` — exec-evidence 미확보 기록
현재: repair-workitem 2-E는 재확보 실패 시 `Needs Execution Evidence: …`를 출력에만 남긴다. validate-workitem 87행은 경계 종류마다 `- exec-evidence` 줄 **존재**만 본다. ADR-064 D4는 자동 신선도 검사를 두지 않고 «고친 주체가 갱신»을 유일 방식으로 못 박았다(101행 «한계(사실 기록)»).
변경(D4 원칙 안에서 — 고친 주체가 «못 갱신했다»도 기록한다):
- repair-workitem 2-E 끝에: `확보하지 못하면 task `## 8`에 `- exec-evidence <날짜> <경계 종류>: 미확보 — <사유> (repair-workitem)`을 **append**한다(옛 줄은 지우지 않는다). 이 줄이 다음 validate의 판정 입력이다.`
- validate-workitem 87행 «실행 증거 판정» 끝에: `경계 종류의 **마지막** `- exec-evidence` 줄이 `미확보`이면 `P1 [Exec-evidence-stale] <경계 종류> — repair가 재확보하지 못함`으로 기록한다(ADR-064 D4 «고친 주체가 갱신» 원칙 — 미확보도 갱신이다).` `.claude/agents/validator.md` 66행 Evidence 축 문단 끝에도 같은 판독 규칙 한 줄(팬아웃 경로 정합)과 `- verify-power`는 관측 modality AC를 대상에서 제외한다(ADR-065 D1 — validate-workitem 88행과 동형)`를 덧붙인다.
- ADR-064 101행 «한계(사실 기록)» 문단 끝에 참조 갱신: `> 참조 갱신 (2026-09): `/repair-workitem`이 재확보 실패를 `미확보` 줄로 append하고 `/validate-workitem`이 그 줄을 `[Exec-evidence-stale]`로 읽는다 — 자동 신선도 검사가 아니라 작성자 규정의 확장이다.`
커밋: `fix(evidence): record failed exec-evidence refresh so validation can flag stale boundaries`

### P6-6. `bootstrap-stack` — 활성 스택 ADR 해석
현재: `ADR-101` 리터럴이 14·29·30·50·52·59·73·77·86·94·99·101행에 있다. `--migrate` 흐름(94행)은 «새 ADR-1NN을 만들고 **기존 ADR-101**을 `superseded`»로, 재실행 안내(96행) 뒤의 BASE는 계속 ADR-101을 갱신하도록 되어 있다. 두 번째 migration(101 → 102 → 103)에서는 94행이 101만 닫아 102·103이 둘 다 활성으로 남는다.
변경:
- 14행 `1. **상태 회수(최소)**: `docs/90-decisions/project/ADR-101-stack-selection.md` 존재 여부 …` → `1. **상태 회수(최소)**: **활성 스택 ADR** = `docs/90-decisions/project/ADR-1NN-*.md` 중 `## Status`가 `superseded`로 시작하지 않고 스택 선택을 소유하는 파일(최초는 `ADR-101-stack-selection.md`, `--migrate` 뒤에는 `대체:` 체인의 마지막 하나). 둘 이상이면 «활성 ADR 중복 — 사용자 확인» 후 종료. 없으면 «없음». + 프로젝트 manifest 존재 여부.`
- 리터럴 → «활성 스택 ADR»로 바꾸는 행: 50·52(R1~R3 누적 대상 — 최초 생성은 ADR-101 파일명 그대로), 59(생성 시 `ADR-101-stack-selection.md`, 갱신 시 활성 ADR), 73(project README 인덱스에 «활성 ADR» 한 줄), 77(Stack Decision Registry 정본 앵커), 86(결정 본문 → 활성 스택 ADR `## 결정` 표), 101(T3 «활성 스택 ADR을 건드리지 않음»).
- 94행 `기존 ADR-101을 `superseded` + 상단 "대체: ADR-1NN"` → `기존 **활성 스택 ADR**을 `superseded` + 상단 "대체: ADR-1NN"` ; 96행 `작성 후 안내:` 뒤에 `(재실행의 BASE는 새 ADR-1NN을 활성 스택 ADR로 읽는다)`.
- 그대로 두는 행: 29·30(_ADR_GUIDE·인덱스 설명), 99(«T1 기초 스택 = 프로젝트 birth → ADR-101» — 최초 생성 규칙이라 리터럴이 맞다). `output-checklist.md` 5행의 `ADR-101-stack-selection.md (project ADR은 100+ 번호 …)`는 생성 규칙 설명이라 유지.
커밋: `fix(bootstrap-stack): resolve the active stack ADR through the supersede chain instead of hard-coding ADR-101`

### P6-7. `repair-discovery` — 사용자 authority 분기
현재: 수행 2~4가 architect가 Adopt를 확정해 DISCOVERY에 반영한다. 원장·승인·authority 언급이 없다. architect.md 41행은 «ADR-053 게이트가 발동한 결정은 네가 확정하지 않는다», ADR-060 D2는 제품 의도·범위·페르소나를 `user-choice`로 둔다. 이 스킬은 `context: fork, agent: architect`라 **사용자에게 실시간으로 물을 수 없다**(finalize-workitem이 같은 제약을 명문화).
변경: 수행 2 뒤에 삽입:
```
2-A. **authority 분기 (ADR-060 D2·D11 / ADR-053#amend-2)**: Adopt·Adopt-modified 후보 중 **페르소나·문제 정의·MVP 범위·비범위·핵심 가정처럼 Charter가 소비하는 절을 바꾸는 항목**은 architect가 확정하지 않는다. 본 skill은 fork 실행이라 사용자에게 묻지 못하므로 그 항목은 (i) `docs/10-charter/DECISION_REGISTER.md`에 `status: open` + `authority: user-choice` + `- 발견: discovery 리뷰 (<reviewer-tag>)`로 등재하고 (ii) DISCOVERY에는 반영하지 않으며 (iii) 마지막 출력에 그 항목의 Decision Brief 6블록을 실어 **사용자가 답한 뒤 원장을 닫고 DISCOVERY를 직접 고치거나 `/repair-discovery`를 재실행**하도록 안내한다. 4-D 이력에는 «원장 대기 D-NNN»으로 적는다. 리뷰 파일 삭제(수행 5)는 그대로다 — finding은 원장에 영속됐다.
```
책임 경계 줄 `charter·workitem·코드·다른 산출물 수정 금지.` 뒤에 `원장 append는 허용(ADR-060 D11 writer).`
커밋: `fix(repair-discovery): route charter-shaping findings to the decision ledger instead of architect adoption`

### P6-8. golden ↔ CI (ADR-059 `## Amendment 2`)
현재: ADR-059 D3 «정답 사진은 커밋하지 않는다 … 새 체크아웃 직후에는 실패한다 … 현재 구성(단독 작업·자동 실행 서버 없음)». stack-guard `## CI 생성`은 GitHub remote + validate 존재면 fresh runner 워크플로를 기본 생성하고 마지막 단계는 `- run: <stack의 validate 명령>` **하나**다(별도 `flutter test` 단계 없음). 통합 `validate`가 golden을 포함하므로 Flutter 프로젝트 CI는 golden 부재로 항상 실패한다. 통합 `validate`의 test 단계는 이미 `test/design_gate/`를 제외한다(ADR-072 D6 자가 검사 fixture).
ADR-059 끝에 append:
```markdown
<a id="adr-059-amend-2"></a>
## Amendment 2 (2026-09-XX) — golden 테스트 태그 분리 + CI 진입점 `validate:ci`

### 배경
- [관측됨] D3의 «자동 실행 서버 없음» 전제와 ADR-025#amend-1의 «GitHub 프로젝트는 fresh runner CI 기본 생성»이 충돌한다. golden은 로컬 전용이라 fresh runner에서는 정답 사진이 없어 `validate`가 실패한다. CI는 별도 test 단계가 아니라 통합 `validate` 하나를 부르므로 test 명령만 바꿔서는 풀리지 않는다.

### 결정
1. golden 테스트 파일은 `@Tags(['golden'])`을 달고, `dart_test.yaml`에 `tags: golden:` 을 선언한다(6-4-b 초기 절차가 생성 시 둘 다 만든다 — 선언 없는 태그는 경고·오류).
2. `/stack-guard`는 Flutter를 포함하는 프로젝트에 **`validate:ci` 진입점**을 하나 더 만든다 — 통합 `validate`와 같은 단계(format·analyze·test)이되 test 단계만 `flutter test --exclude-tags golden`(기존 `test/design_gate/` 제외는 유지)이다. 생성 CI 워크플로의 마지막 단계는 `validate:ci`를 부른다. 로컬 `validate`는 golden을 포함한다(D3 불변).
3. STACK_SETUP_PLAN `CI:` 기록에 `(validate:ci — golden 제외, ADR-059#amend-2)`를 병기한다. 이미 `.github/workflows/validate.yml`이 있는 프로젝트(`CI: existing (preserved)`)는 덮어쓰지 않고 «`validate:ci`로 교체 권장» 한 줄만 출력한다.

### 강도 (ADR-022)
- enabling(약, [관측됨]).

### Mutation delta (ADR-047 D3)
- failure = Flutter 프로젝트 CI가 구조적으로 실패 (관측됨). predicted = fresh runner CI가 golden 없이 통과하고 format·analyze는 유지. falsifier = `validate:ci`와 `validate`의 단계가 어긋나 CI만 통과하는 회귀가 나면 두 진입점을 같은 스크립트의 플래그로 통합한다. rollback = 결정 삭제.
- 예산 영향 = 없음.

### 적용 surface
- .claude/skills/stack-guard/SKILL.md — 6-4-b · 수행 1(`validate:ci`) · `## CI 생성`
- docs/00-meta/_templates/STACK_SETUP_PLAN_TEMPLATE.md — `## CI` 주석
```
스킬 수정: stack-guard 6-4-b 문장 끝에 `golden 테스트 파일은 `@Tags(['golden'])`을 달고 `dart_test.yaml`에 `tags: golden:` 을 선언한다(ADR-059#amend-2).`; 수행 1(진입점 생성)에 `Flutter 포함 프로젝트는 `validate:ci`도 만든다 — test 단계만 `--exclude-tags golden`(`test/design_gate/` 제외 유지)`; `## CI 생성`의 ③ 단계(`- run: <stack의 validate 명령>`)를 `Flutter 포함이면 `validate:ci`, 아니면 `validate``로; `CI: generated (…)` 기록 문구에 병기; `existing (preserved)` 분기에 교체 권장 한 줄.
커밋: `docs(adr): amend ADR-059 to tag golden tests and route generated CI through validate:ci`

### P6-9. `marketer.md`·`strategist.md` — 절 번호 정정
실제 헤딩: DISCOVERY 템플릿 `## 2. 페르소나` / `## 5. JTBD` / `## 6. 시나리오` / `## 12. Assumption Tracker`; Charter `## 3. 해결하려는 문제` / `## 4. 목표` / `## 5. 비목표` / `## 2.1 페르소나` / `## 3.1 핵심 시나리오`.
- marketer 34행 `` `## 2. 페르소나` + `## 3`(JTBD·시나리오) `` → `` `## 2. 페르소나` + `## 5. JTBD` + `## 6. 시나리오` ``; 35행 `` `PROJECT_CHARTER.md` `## 1. 문제` `` → `` `## 3. 해결하려는 문제` ``.
- strategist 111행 `` `PROJECT_CHARTER.md` `## 3~5`(목표·비목표) / `DISCOVERY.md` `## 2·3`(페르소나·JTBD) `` → `` `PROJECT_CHARTER.md` `## 3~5`(문제·목표·비목표) / `DISCOVERY.md` `## 2·5`(페르소나·JTBD) ``.
커밋: `fix(agents): point marketer and strategist at the actual discovery and charter section numbers`

### P6-10. Surfaces 역참조 10건·죽은 인용 3줄 + 검사 스크립트 일반화
현재(부록 A 스크립트 실측): 기본 모드 `NO-BACKREF ADR-050 → bootstrap-project·finalize-workitem·implement-workitem·repair-plan·stack-guard·validate-plan`(6) + `ADR-035 → plan-workitem`(1, ADR-035#amend-2 «적용 surface»의 Insight 연결 항목). 전체 모드 검사 3에 `ADR-009 → validate-workitem`, `ADR-047 → validator.md`, `SURFACE-MISSING ADR-038 → .claude/worktrees/`(Surfaces 설명문의 경로 토큰)가 더 있다. 검사 4 = 3: `ADR-073:101`·`:146`의 ADR-056 인용(살아 있는 참조가 아니라 승계 서술 — D 분류)과 `STRUCTURE.md:126`(괄호 마커 형식이 아님). ADR-068 안의 ADR-067 인용 11줄은 부록 A가 superseding ADR 자기 본문으로 자동 제외한다.
변경:
- 각 대상 파일의 해당 규칙 문장에 역참조를 붙인다(한 줄씩): validate-workitem의 «AC↔검증 매핑 path 우선 resolve» 문장 끝 `(ADR-009)`; validator.md Evidence Bundle 문단 `(ADR-047 D8)`; bootstrap-project·stack-guard·validate-plan·repair-plan·implement-workitem·finalize-workitem의 «메인 세션 실행 / model-invocable» 서술 줄 끝 `(ADR-050)`; plan-workitem 132행 `Evidence/Insight 연결(`근거 insight: I-N` 기입 …)` 문장 끝 `(ADR-035#amend-2)`.
- ADR-038 `## Surfaces`의 `.gitignore` 행 현재 `- .gitignore — plan-reviews/*.md + .claude/worktrees/` → `- .gitignore — plan-reviews ignore 항목(worktrees 디렉터리 항목 포함)`(경로 토큰 제거).
- STRUCTURE.md:126 `(정책 SSOT — ADR-067 통합 재발행. 현재 SSOT: ADR-068)` → `(정책 SSOT — ADR-067 통합 재발행 (현재 SSOT: ADR-068))`. ADR-073 101행(`§10을 별도 VOICE.md로 — 파일 분리 기각(ADR-056 비결정 승계).`)과 146행(`## 참고` 줄)의 `ADR-056` 뒤에 `(현재 SSOT: ADR-072)` 병기(D 분류).
- 부록 A 스크립트의 검사 4는 «superseding ADR 자기 본문 제외»를 `ADR-07[23]-` 하드코딩이 아니라 «파일 상단 20줄에 `대체` + 그 dead id가 있는 파일 제외»로 일반화했다(ADR-068·072·073·074·075 전부 자동 제외).
- 확인: `bash /tmp/check-refs.sh` → PASS(검사 3 `count: 0`), `bash /tmp/check-refs.sh --all-surfaces --all-dead` → 검사 3·4 `count: 0`.
커밋: `docs: add missing ADR back-references and normalise supersede markers`

### P6-11. design gate geometry — 가로 스크롤 known-good 케이스
현재: `clipped()`는 `overflow: hidden|clip` 조상만 보고 `auto|scroll` 조상은 보지 않으므로, 접근 가능한 가로 스크롤 컨테이너 안 텍스트는 원리상 clip으로 잡히지 않는다(앞 라운드의 «오탐 가능성»은 미재현). 자가 검사 known-good에는 그 케이스가 없다.
변경: `knownGoodHtml()`에 `<div role="region" tabindex="0" aria-label="표 스크롤" style="overflow-x:auto;width:200px"><table style="width:400px"><tr><td><span>가로 스크롤 안 텍스트</span></td></tr></table></div>`를 추가한다(`role="region"`이 없으면 generic 요소의 `aria-label`이 axe `aria-prohibited-attr`(serious)에 걸려 known-good이 깨진다; `<span>`이 있어야 clips 셀렉터(`h1,h2,h3,p,span,…`)의 대상이 되어 «clipped 비오탐»이 실제로 고정된다). 케이스 (b) blocker 0 유지. `--self-test` 통과 확인.
커밋: `test(design-gate): pin accessible horizontal scroll containers as known-good`

### P6-12. 보일러플레이트 → fork 갱신 절차 (ADR-005 `## Amendment 3`)
현재: ADR-005#amend-2 결정 1~3이 «`presence: generated` 행 보존·디렉터리 통째 동기화 금지·혼합 디렉터리 명시»를 정했고, 결정 4가 «갱신 절차 자체는 규정하지 않는다 — 후속 라운드 과제»로 미뤘다. Round 12 발견 73(동기화가 `STACK_SETUP_PLAN.md`를 삭제)의 원인이 이 공백이다. P0-2b가 그 절차를 처음 밟았다.
`docs/90-decisions/boilerplate/ADR-005-*.md` 끝에 append:
```markdown
<a id="adr-005-amend-3"></a>
## Amendment 3 (2026-09-XX) — 보일러플레이트 갱신 절차

### 배경
- [관측됨] #amend-2가 절차를 미룬 채로 다음 동기화가 다시 필요했다(Round 13 Phase 0). 절차 없이 «규칙만 지켜서 수동으로»는 실행자마다 달라진다.

### 결정
1. 갱신 단위는 **STRUCTURE.md 인벤토리의 `presence: baseline` 행**이다. 순서: (i) `.claude/agents/`·`.claude/skills/`·`.agents/`(+ tracked `.claude/settings.json`) — 전 행이 baseline인 경로만 옛 사본을 지우고 `git archive HEAD -- <경로> | tar -x`로 **tracked 파일만** 추출한다(#amend-2 결정 2가 금지하는 통째 동기화는 혼합 디렉터리가 대상이다 — 결정 3. 복제본의 `settings.local.json`·`worktrees/` 같은 로컬 파일은 남긴다) → (ii) `docs/90-decisions/boilerplate/*.md` 파일 단위 복사(`project/`는 손대지 않음) → (iii) `docs/00-meta/`의 baseline 문서 5종(STRUCTURE·WORKFLOW·DELEGATION_STRATEGY·GUARDRAILS_STRATEGY·PROJECT_START_CHECKLIST)과 `_templates/`, `docs/30-workitems/_templates/` → (iv) `AGENTS.md`·`CLAUDE.md`·`.codex/`·`.gitignore`(줄 단위 합집합) → (v) `git status --porcelain -- <generated 행 경로들>`이 비었는지 확인 → (vi) `/stack-guard` 재실행(생성물 갱신은 재실행 계약이 담당) → (vii) `chore: sync harness to <sha>, preserving generated artifacts` 커밋.
2. `presence: generated`·`conditional`·`ephemeral` 행은 절차가 건드리지 않는다. 혼합 디렉터리(`docs/00-meta/`·`docs/90-decisions/`)는 항상 파일 단위다.
3. 절차 본문은 `docs/00-meta/STRUCTURE.md` `presence` 절 아래 `### 보일러플레이트 갱신 절차` 소절이 소유한다(본 amendment는 규칙만).

### 강도 (ADR-022)
- enabling(약, [관측됨]).

### Mutation delta (ADR-047 D3)
- failure = 절차 부재로 동기화가 생성물을 삭제 (관측됨). predicted = 다음 동기화에서 generated 행 손실 0, 커밋 메시지가 표준형. falsifier = 절차대로 했는데 generated 행이 바뀌면 인벤토리 표가 낡은 것 — 표를 먼저 고친다. rollback = 소절 삭제.
- 예산 영향 = 없음.

### 적용 surface
- docs/00-meta/STRUCTURE.md — `### 보일러플레이트 갱신 절차` 소절
```
STRUCTURE.md `presence` 절(17~26행) 아래에 결정 1의 (i)~(vii)를 명령 예시와 함께 `### 보일러플레이트 갱신 절차 (ADR-005#amend-3)` 소절로 적는다(P0-2b의 명령을 정리해 옮긴다).
커밋: `docs(adr): amend ADR-005 with the boilerplate upgrade procedure`

### P6-13. 잔존 문구 정리
- `docs/20-system/DESIGN.md` 98행 주석 `정밀 판정은 실화면 axe(stack-guard source-verified current-v2 `validate:design` …)` → `정밀 판정은 실화면 axe(`validate:design` v3 — ADR-072 D6)`. 파일 안 `current-v2`·`source-verified`·`conformance` 잔여 0건 확인.
- `.claude/agents/validator.md` 66행 Evidence 축: P6-5의 두 문장(미확보 판독·관측 AC 제외)이 들어갔는지 확인.
커밋: `docs(design): drop the retired gate contract wording from the DESIGN template`


---

## Phase 7. ADR 요약·인덱스 정비 (ADR-045 D5)

### P7-1. `## 현재 유효 결정` 신설·갱신
- **ADR-072**(개정 5, 절 부재 — D5 트리거): `## Status` 바로 아래에 ≤6줄:
  ```
  ## 현재 유효 결정
  - `/design-milestone M<N>`이 UI M의 화면 층(브리프 → 코드 프로토타입 → 게이트·스냅샷 → contract-ready)을 소유한다(D1~D4·D8). 재진입 3경로, 봉인 뒤 변경은 다음 M.
  - UI 제작 계약(D5): presentational만·가짜 Red 금지·재사용 추적·행동 변경은 인터랙션 계약 기준(#amend-3-1)·공용 컴포넌트 변경은 supersedes.
  - 게이트 v3(D6): 매니페스트 모드·자가 검사·copied-from. PM `--`·케이스 수·단축 hex(#amend-1), Flutter 뷰포트별 report + viewport-coverage(#amend-5).
  - 계획은 승인 표면과 대조한다(#amend-2 3-S). 미리보기 하네스는 provider만(#amend-3). A/B는 상태로 모델링 + 원장 행(#amend-4). 승인본 충실도 묶음(#amend-5).
  ```
- **ADR-037**: `## 현재 유효 결정`에 불릿 추가 `- `## 7-1`(·`## 7-3`) 우변에 «승인 스냅샷 <경로> (manifest: <screen id>) — 증명: …» 형식을 허용한다 — 승인 산출물이 경로로 실재하고 이번 M의 어느 task도 그 화면 `source[]`를 안 건드릴 때만. 그 행은 unmapped가 아니며 seal이 조건을 재확인한다(#amend-4). 증명 문장 규율은 ADR-072#amend-2 결정 4.`
- **ADR-058**: P5-6 결정 2로 이미 정정. 확인만.
- **ADR-004·ADR-051**: superseded — 요약은 손대지 않는다.

### P7-2. 인덱스 행(개정 열)
`docs/90-decisions/boilerplate/README.md`의 Amendments 열에 추가: `005 … +#amend-3: 보일러플레이트 갱신 절차` / `035 … +#amend-4: staleness 시그널 1 hunk 판정` / `050 … +#amend-2: Bash 보유 report-only 프로젝트 쓰기 금지` / `058 … +#amend-5: visual-qa seed 반영 단언` / `059 … +#amend-2: golden 태그·validate:ci` / `063 … +#amend-1: Guard-drift copied-from 4방향` / `066 … +#amend-2: 재확인 모드` / `072 … +#amend-5: 게이트 보류 탐지기·승인본 충실도·재진입 상태` / `073 … +#amend-2: voice grep 범위·회수 출처·Spec-gap 라우팅`. 074·075 행은 Phase 3·4에서 추가됨. 004·051 행의 Amendments 열은 그대로(역사). ADR-047 행은 건드리지 않는다(#amend-3은 이미 등재).

### P7-3. 커밋
```
docs(adr): add net-rule summaries for ADR-072 and ADR-037 and update the amendment index
```

---

## Phase 8. 검증·기록·마감

### P8-1. 참조 무결성
```bash
bash /tmp/check-refs.sh                       # PASS — P6-10 뒤에만 가능(ADR-050·035 역참조)
bash /tmp/check-refs.sh --all-surfaces --all-dead | grep -E "^count:"   # 검사 3·4 둘 다 0 (P6-10 뒤)
grep -n "측정 조건" .claude/agents/*.md | wc -l   # 0
```

### P8-2. 복제본 harness 재동기화(회귀 전)
P0-2b 뒤 Phase 3~7이 harness를 또 바꿨으므로 두 복제본을 현재 main으로 한 번 더 맞춘다 — 이번에는 P6-12가 STRUCTURE.md에 적은 `### 보일러플레이트 갱신 절차`를 그대로 따른다(절차의 첫 실전). 끝에 `/stack-guard` 재실행으로 어댑터 사본이 새 canonical(P5-5·P6-11)로 교체됐는지(`copied-from` 갱신) 확인한다.

### P8-3. 회귀 시나리오(새 세션에서 — 에이전트 파일 변경분이 있으므로)
각 항목은 한 번씩 돌리고 결과를 SIMULATION_RUN Round 13 절에 한 줄씩 남긴다.
- (a) **inline 재보정**: dogfood-web의 task는 전부 `done`이라 그대로는 validate가 폐쇄 가드에서 끝난다. T-001의 diff를 워킹트리 변경으로 재현한 사본을 만든다(저장소 루트에서 — `git archive`가 아니라 clone이어야 `git diff HEAD`·pre-commit 훅이 성립한다):
  ```bash
  git clone -q ~/harness-dogfood/dogfood-web .dogfood-exp/reg-web && cd .dogfood-exp/reg-web && pnpm install --silent
  C=$(git log --format=%H --grep="Refs: T-001" | tail -1)
  git checkout -q -b reg "$C^"                                                                                   # T-001 finalize 커밋 직전
  git checkout -q main -- .claude .agents AGENTS.md docs/00-meta docs/90-decisions/boilerplate && git commit -qm "harness overlay"   # 현재 harness(P8-2 뒤 = main)
  git diff "$C^" "$C" | git apply                                                                                # T-001 변경분만 워킹트리에(삭제 파일 포함 — task 문서도 들어온다)
  ```
  신규 파일(`src/lib/todo.ts`·`tests/todo.test.ts`)은 untracked로 들어온다 — 실제 validate 시점과 같은 상태이며 규칙의 `-uall` 합산 대상이다(tracked numstat만 보면 F=4·12줄이고, untracked 2파일을 더해야 아래 값이 된다). `docs/30-workitems/tasks/T-001-*.md`의 `## 0. Status`를 `in-progress`로, 마지막 `- closure` 줄을 지운 뒤 사본 루트에서 연 세션으로 `/validate-workitem T-001`을 돌린다. `## Orchestration`에 `F·L_impl·L_test·L_docs`가 찍히고 판정이 L_impl 기준인지 본다(2026-09-12 커밋 실측: F=6 · L_impl=38 · L_test=51 · L_docs=15 → inline 후보. inline이 되든 fan-out이 되든 값과 판정의 정합만 본다). T-003도 같은 절차(사본 `reg-web-t003`)로 1회.
- (b) **축 5 신호**: (a)의 T-003 실행(UI surface 파일 diff 0)에서 축 5가 spawn되지 않고 «해당없음» 인라인인지.
- (c) **preflight 오탐**: dogfood-web `/stabilize-milestone M1` 재실행 — 5-2b `[Design-voice-grep]` 0건, 5-0 `회수 파일 N개 (… (d) w)` echo에 (d) 폐쇄 후 수리 파일이 포함되는지, 6.5 시그널 1 침묵, 단계 5 reviewer dispatch(code·design surface)가 회수 없이 완주하는지(amend-9 결정 2 reviewer 24의 실측 자리 — Phase 1의 `/validate-plan`은 인라인이라 미측정). §1.0 8(b)는 P8-2 뒤라 세 sha가 같아 침묵이 정상이다 — 네 문구 검증은 dogfood-flutter registry의 `copied-from`을 임시로 한 글자 바꿔 (iii) «registry만 낡음»이 나오는지 1회 보고 `git checkout -- docs/00-meta/STACK_SETUP_PLAN.md`로 원복한다.
- (d) **게이트**: P8-2로 어댑터 사본이 새 canonical인 상태에서 — dogfood-web `validate:design -- --tokens-only src/**`로 `style={{ … : 640 }}` 류가 잡히고 `#412`·`Colors.transparent`·`padding: 0`은 안 잡히는지; `--self-test`에 케이스 (e)·(b) 가로 스크롤 포함 PASS; dogfood-flutter `validate:design -- --manifest docs/20-system/prototypes/M1/manifest.json`의 report가 (상태 × 뷰포트) 항목을 내고 `viewport-coverage` report 0인지(위젯 테스트에서 뷰포트 하나의 PNG 저장을 일부러 빼고 다시 돌려 report가 나는지도 1회).
- (e) **verifier 쓰기 금지**: dogfood-web stabilize의 qa dispatch 입력에 scratch 경로 줄이 들어갔는지(출력에서 확인), 실행 뒤 `git status --porcelain`에 qa가 만든 파일 0.
- (f) **repair-plan·finalize·accept 분기**: (i) (a)의 `reg-web` 사본에서 T-001을 `in-progress`로 되돌린 상태 그대로 `/validate-workitem T-001`(채점표 생성) → `.git/hooks/pre-commit`에 `exit 1`을 두고 `/finalize-workitem T-001` → `Needs Commit`으로 끝나고 task 문서가 staged인지 → 훅 제거 후 `/finalize-workitem T-001` 재호출이 수행 7·8만 수행해 커밋되는지. (ii) `/validate-plan M1`을 다시 돌려 리뷰 파일을 만든 뒤 `/repair-plan M1`이 F·T 리뷰 파일을 회수하고 마일스톤 층 분기로 QA_FINDINGS/`## 2`에 등재하는지(끝나면 리뷰 파일 삭제 확인). (iii) dogfood-web M1은 `## 11` 실측이 receipt 0건·`(수용)` 0건이라 그대로는 재확인 모드에 들어갈 수 없다(미발급 AC가 있으면 탐색 모드이고, `/repair-acceptance`는 고칠 항목이 없다). 관측 AC는 `T-004:AC-1` 하나이므로 dogfood-web의 T-004 `## 8`에 `- ac-acceptance 2026-09-11 AC-1: …`(형식은 TASK_TEMPLATE `## 8` 주석) 한 줄과 그 아래 `- invalidated 2026-09-XX AC-1: repair-acceptance 수정으로 재확인 필요` 한 줄을 **임시로** append해 «마지막 이벤트 = invalidated, 미발급 0»을 만든 뒤 `/accept-milestone M1`을 R0까지 돌려 재확인 모드(`- 모드: 재확인 (카운터 미소모)`)로 들어가고 `- 라운드:`가 1로 남는지 본다. 끝나면 `git checkout -- docs/30-workitems`와 새로 생긴 `acceptance-reviews/M1.r*.md` 삭제로 원복한다.
- (g) **ADR-072#amend-4 falsifier(선택 — 시간이 있을 때)**: dogfood-flutter에 화면 1개짜리 M2를 `/plan-milestone`으로 만들고 브리프에 `구성 불확실` 1건을 두어 `/design-milestone M2`를 R6까지 돌린다. 관측: (a) 상태 접미사로 R6 렌더 시간 2배 초과 여부 (b) 원장 행이 있는데 승격 통과 여부 (c) 3안 사례. 안 돌리면 falsifier 표에 «미측정(Round 14)»로 남긴다.
- (h) **재현 불가 falsifier**: ADR-071 (d) HYBRID·ADR-072 (e) 6화면은 이번에도 자극 조건이 없다 — 표에 «미측정(입력 조건 부재)»로 유지.

### P8-4. 기록
`.boilerplate/validation/SIMULATION_RUN.md`
- `## Round 13` 절에 P1·P2·P8-3 결과와 «발견 → 조치» 표(이번 라운드에 닫은 항목 번호 5·9·16·17·19·20·22·23·25·27·28·29·30·31·32·40·53·58·74 + 기존 결함 1~11)를 남긴다.
- `## Falsifying evaluation 항목별 결과` 표를 갱신한다: 미측정 행(ADR-004#amend-5·7, ADR-072#amend-4, ADR-071 (d), ADR-072 (e))은 이번 결과로, ADR-004#amend-8 행은 Phase 2 판정(**(a) 발화 2회** — (c)·(d) 상한 도달 시 보고 없음)으로. **ADR-004#amend-9 행은 표에 아직 없으므로 신설한다** — (a)·(b) 둘 다 미발화이되 「결정 1(write-first)은 5/5 미준수 — ADR-074 D9에서 제거」를 같은 칸에 병기한다(**falsifier 미발화와 규칙 미준수는 다른 사실이다**). 결정 2(reviewer 24)의 실측 자리는 P8-3 (c)다. 그 밖에 새 amendment 9종 + ADR-074·075의 falsifier 행을 추가한다.
- 같은 절에 «이번 라운드가 새로 연 항목» 목록을 남긴다 — 닫지 않고 사실만 기록한 것들(write-first의 프롬프트층 처방 미시험, `/validate-plan`의 인라인 실행과 dispatch 임계 문장 불일치, `/stack-guard` 재실행 계약 조건식의 세 번째 경우, `next dev`의 `AGENTS.md` 변조, 실험 프롬프트 바이트 동일이 지시만으로 지켜지지 않음, dogfood-flutter (c) 사본의 공허한 AC-2 계측)이 Round 14 입력이다.
- `## Phase 7 개정 목록` 아래에 `## 라운드 2 개정 목록 (기준 <시작 sha>..HEAD)`를 같은 형식으로 추가한다(ADR별 개정 수·발화·실행 검증 여부·임계 도달).
- 상단 시점 주석에 `ADR-004 → ADR-074, ADR-051 → ADR-075 (2026-09-XX)` 한 줄.

### P8-5. 커밋 + 마감
```
docs(validation): record round 13 verification, re-measurement and the debt-closing amendments
```
그 뒤 본 문서(`IMPROVE-GUIDE.md`)를 삭제한다(사용자 수동 — `git rm IMPROVE-GUIDE.md` + `chore: remove the temporary improvement execution guide`).

---

## 부록 A. 참조 무결성 검사 스크립트 (`/tmp/check-refs.sh`)

앞 라운드의 스크립트에서 두 곳을 바꿨다. `ROUND_ADRS`(이번 라운드 대상)와 검사 4의 «superseding ADR 자기 본문 제외»(하드코딩 → 파일 상단 20줄의 `대체` + dead id로 판정).

```bash
#!/usr/bin/env bash
# 저장소 루트에서 실행. 종료코드 0 = 통과(기본 모드). 인자: --all-surfaces / --all-dead (기준선 비교용 전체 모드).
# 기본 통과 기준: 검사 1·2·6 = count 0, 검사 3(이번 라운드 ADR — ## Surfaces + 개정의 ### 적용 surface) = 0,
#               검사 4(이번 라운드 supersede분 — ADR-004·051) = 0, 검사 5 = ok 4줄.
# 민감 파일(.env·secrets/·키 파일)은 읽지 않는다(AGENTS.md).
set -u
EXC=(--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=secrets --exclude-dir=.dogfood-exp --exclude=IMPROVE-GUIDE.md
     --exclude='.env' --exclude='.env.*' --exclude='*.jks' --exclude='*.keystore' --exclude='key.properties'
     --exclude='*.p12' --exclude='*.mobileprovision' --exclude='*.p8' --exclude='*-firebase-adminsdk-*.json'
     --exclude='serviceAccount*.json' --exclude='service-account*.json')
ADR_DIR=docs/90-decisions/boilerplate
ROUND_ADRS="${ROUND_ADRS:-ADR-0(04|35|37|45|50|51|58|59|63|64|65|66|68|72|73|74|75)}"
DEAD_FILTER="${DEAD_FILTER:-ADR-004|ADR-051}"
MODE_SURF=filtered; MODE_DEAD=filtered; FAIL=0
for a in "$@"; do case "$a" in --all-surfaces) MODE_SURF=all;; --all-dead) MODE_DEAD=all;; esac; done
strip(){ awk 'BEGIN{c=0} /^```/{c=!c; next} !c' "$1" | sed -E 's/<!--[^>]*-->//g'; }
count(){ n=$(wc -l < "$1" | tr -d ' '); echo "count: $n"; [ "$n" = "0" ] || FAIL=1; }

echo "== 1. ADR 번호·링크 목적지 존재 (인덱스 Reserved/Parked/Dropped 제외)"
awk '/^## Reserved \/ Parked \/ Dropped/{f=1;next} f&&/^## /{f=0} f' "$ADR_DIR/README.md" | grep -oE "^\| ADR-0[0-9]{2} " | tr -d '| ' > /tmp/allow.txt
printf "ADR-002\nADR-003\n" >> /tmp/allow.txt
{ grep -rho "${EXC[@]}" -E "ADR-0[0-9]{2}" . | sort -u | while read -r id; do
    grep -qx "$id" /tmp/allow.txt && continue
    ls "$ADR_DIR"/ADR-"${id#ADR-}"-*.md >/dev/null 2>&1 || echo "MISSING $id"
  done
  grep -rho "${EXC[@]}" -E "ADR-0[0-9]{2}-[a-z0-9-]+\.md" . | sort -u | grep -vE "xxx|slug|nnn" | while read -r f; do
    [ -f "$ADR_DIR/$f" ] || echo "BAD-LINK-TARGET $f"
  done; } | tee /tmp/c1.txt; count /tmp/c1.txt

echo "== 2. amend 앵커 존재"
grep -rho "${EXC[@]}" -E "ADR-0[0-9]{2}#amend-[0-9]+" . | sort -u | while read -r ref; do
  n=$(echo "$ref" | sed -E 's/ADR-0?([0-9]+)#amend-([0-9]+)/\1/'); m=${ref#*amend-}
  f=$(ls "$ADR_DIR"/ADR-0"$n"-*.md 2>/dev/null | head -1)
  [ -n "$f" ] && grep -q -E "(<a id=\"adr-0?$n-amend-$m\">|^## Amendment $m\b)" "$f" || echo "NO-ANCHOR $ref"
done | tee /tmp/c2.txt; count /tmp/c2.txt

echo "== 3. Surfaces 역참조 (기본: 이번 라운드 ADR의 ## Surfaces + ### 적용 surface / --all-surfaces: 전 ADR의 ## Surfaces만)"
for f in "$ADR_DIR"/ADR-*.md; do
  id=$(basename "$f" | grep -oE "ADR-[0-9]{3}")
  if [ "$MODE_SURF" = filtered ] && ! echo "$id" | grep -qE "$ROUND_ADRS"; then continue; fi
  status=$(awk '/^## Status/{getline; print; exit}' "$f")
  case "$status" in superseded*|deprecated*) continue;; esac
  if [ "$MODE_SURF" = filtered ]; then
    lines=$(strip "$f" | awk '/^## Surfaces/{flag=1; next} /^### 적용 surface/{flag=1; next} /^## /{flag=0} /^### /{if(flag==1 && $0 !~ /적용 surface/) flag=0} flag && /^- /')
  else
    lines=$(strip "$f" | awk '/^## Surfaces/{flag=1; next} /^## /{flag=0} flag && /^- /')
  fi
  echo "$lines" | grep -oE '(\.claude|\.agents|\.codex|\.boilerplate|\.gitignore|\.gitattributes|docs/|README[_a-z]*\.md|AGENTS\.md|CLAUDE\.md|scripts/|LICENSE)[^ `,:)]*' | sed -E 's/#.*$//' | sort -u | while read -r path; do
    [ -z "$path" ] && continue
    case "$path" in *\**) ls $path >/dev/null 2>&1 || echo "SURFACE-MISSING $id -> $path"; continue;; esac
    case "$path" in *.json|*.toml|.gitignore|.gitattributes|docs/90-decisions/boilerplate/README.md) [ -e "$path" ] || echo "SURFACE-MISSING $id -> $path"; continue;; esac
    if [ -d "$path" ]; then grep -rq "$id" "$path" || echo "NO-BACKREF $id -> $path/"; continue; fi
    [ -f "$path" ] || { echo "SURFACE-MISSING $id -> $path"; continue; }
    grep -q "$id" "$path" || echo "NO-BACKREF $id -> $path"
  done
done | tee /tmp/c3.txt; count /tmp/c3.txt

echo "== 4. 죽은 ADR 인용 (마커 없는 줄 — 기본: ADR-004·051 / --all-dead: 전체; superseding ADR 본문·인덱스·주석 제외)"
for f in "$ADR_DIR"/ADR-*.md; do
  status=$(awk '/^## Status/{getline; print; exit}' "$f")
  case "$status" in superseded*|deprecated*) basename "$f" | grep -oE 'ADR-[0-9]{3}';; esac
done | sort -u > /tmp/dead.txt
if [ "$MODE_DEAD" = filtered ]; then grep -E "$DEAD_FILTER" /tmp/dead.txt > /tmp/dead.f.txt; mv /tmp/dead.f.txt /tmp/dead.txt; fi
while read -r dead; do
  # superseding ADR = 상단 20줄에 «대체» 와 그 dead id 를 함께 가진 ADR 파일 (자기 본문의 인용은 supersede 선언이라 제외)
  sup=$(for g in "$ADR_DIR"/ADR-*.md; do head -20 "$g" | grep -q "대체" && head -20 "$g" | grep -q "$dead" && echo "$g"; done)
  grep -rn "${EXC[@]}" "$dead" . | grep -v "(현재 SSOT:" | grep -v "$ADR_DIR/$dead-" | grep -v "$ADR_DIR/README.md" | grep -v "<!--" | { if [ -n "$sup" ]; then grep -v -F "$(echo "$sup" | sed 's#^\./##')"; else cat; fi; }
done < /tmp/dead.txt | tee /tmp/c4.txt; count /tmp/c4.txt

echo "== 5. 로스터 집합 (skills 디렉터리 ↔ STRUCTURE ↔ README 자연어 목록 ↔ wrappers)"
ls .claude/skills | sort > /tmp/skills.txt
ls .agents/skills | sort > /tmp/wrappers.txt
comm -23 /tmp/skills.txt /tmp/wrappers.txt > /tmp/natural.txt
grep -oE "\((2[0-9])종 — [^)]*\)" docs/00-meta/STRUCTURE.md | head -1 | tr '/' '\n' | sed -E 's/.*— //; s/\)//' | sort > /tmp/structure.txt
diff /tmp/skills.txt /tmp/structure.txt > /tmp/c5a.txt && echo "STRUCTURE list ok" || { cat /tmp/c5a.txt; FAIL=1; }
n=$(wc -l < /tmp/skills.txt | tr -d ' '); grep -q "(${n}종" docs/00-meta/STRUCTURE.md && echo "STRUCTURE count ok (${n})" || { echo "STRUCTURE count mismatch (expected ${n})"; FAIL=1; }
for r in README.md README_ko.md; do
  grep -oE "\((discover-product[^)]*)\)" "$r" | head -1 | tr -d '()' | tr ',' '\n' | sed 's/^ *//' | sort > /tmp/readme.txt
  diff /tmp/natural.txt /tmp/readme.txt >/dev/null && echo "$r natural list ok" || { echo "$r natural list mismatch"; diff /tmp/natural.txt /tmp/readme.txt; FAIL=1; }
done

echo "== 6. 인덱스 amend 수 ↔ 본문 Amendment 헤딩 수 (코드펜스 밖)"
grep -E "^\| 0[0-9]{2} " "$ADR_DIR/README.md" | while IFS='|' read -r _ num _ _ amends _; do
  n=$(echo "$num" | tr -d ' '); f=$(ls "$ADR_DIR"/ADR-"$n"-*.md 2>/dev/null | head -1); [ -z "$f" ] && continue
  idx=$(echo "$amends" | grep -o "#amend-[0-9]*" | sort -u | wc -l | tr -d ' ')
  body=$(awk '/^```/{c=!c} !c && /^## Amendment [0-9]+/{n++} END{print n+0}' "$f")
  [ "$idx" = "$body" ] || echo "AMEND-COUNT ADR-$n index=$idx body=$body"
done | tee /tmp/c6.txt; count /tmp/c6.txt

echo "== SUMMARY: $([ $FAIL = 0 ] && echo PASS || echo FAIL) (mode: surfaces=$MODE_SURF dead=$MODE_DEAD)"
exit $FAIL
```
- 통과 기준: 기본 모드 종료코드 0(P6-10 뒤). 전체 모드는 P6-10 뒤 검사 3·4 모두 `count: 0`이어야 한다(2026-09-12 기준선 기본 FAIL 7 / 전체 9·3).
- 설계상 한계 둘: `--all-surfaces`는 기준선 비교를 위해 `## Surfaces`만 보고 개정의 `### 적용 surface`는 보지 않는다(기본 모드가 본다). 검사 4는 superseding ADR 본문 전체를 제외하므로 그 본문 안의 살아 있는 지시가 죽은 ADR을 가리키는 경우는 잡지 못한다 — 재발행 시 P3-4·P4-5 같은 수동 분류가 그 자리를 맡는다.
- 검사 4의 superseding 판정은 `## Status` 아래 `> 대체:` 줄 형식(본 저장소 관례)에 의존한다. 그 줄이 없는 supersede ADR이 있으면 그 파일의 인용이 검사에 잡힌다 — `(현재 SSOT: 본 ADR)` 병기로 처리한다.

## 부록 B. 재측정 도구

### B-1. `~/harness-dogfood/tools/set-cond.py <a|b|c|d>` — builder.md를 조건으로 설정
저장소 루트의 현재 `builder.md`를 원본으로 읽어(첫 실행 시 `builder-canonical.md`로 복사해 둔다) frontmatter와 마커를 바꿔 쓴다. 측정 뒤 `git checkout -- .claude/agents/builder.md`로 원복한다.
```python
#!/usr/bin/env python3
import re, sys, pathlib, shutil
COND = {'a': (60, '-'), 'b': (60, 'medium'), 'c': (20, '-'), 'd': (20, 'medium')}
c = sys.argv[1]; turns, effort = COND[c]
repo = pathlib.Path('/Users/kbw/Desktop/dev/agentic-dev-harness')
target = repo / '.claude/agents/builder.md'
canon = pathlib.Path.home() / 'harness-dogfood/tools/builder-canonical.md'
if not canon.exists(): shutil.copy(target, canon)
s = canon.read_text(encoding='utf-8')
s = re.sub(r'(?m)^maxTurns: \d+$', f'maxTurns: {turns}', s)
s = re.sub(r'(?m)^effort: .*\n', '', s)
if effort != '-': s = s.replace('model: sonnet\n', f'model: sonnet\neffort: {effort}\n', 1)
marker = (f'**측정 조건 (임시 — 측정 후 제거): {c} / maxTurns {turns} / effort {effort}.** '
          f'반환문 **첫 줄**에 정확히 `조건={c} turns={turns} effort={effort}` 한 줄을 먼저 적어라.\n\n')
s = s.replace('\n너는 ', '\n' + marker + '너는 ', 1)
target.write_text(s, encoding='utf-8'); print('set', c, turns, effort)
```
주의: 원본 캡처 시점의 `builder.md`가 Phase 3 이전(ADR-004 인용)이든 이후(ADR-074 인용)든 상관없다 — 측정은 frontmatter 값과 마커만 본다.

### B-2. `~/harness-dogfood/tools/check-cond.sh <a|b|c|d>` — 사후 검증(실패를 전파한다)
```bash
#!/usr/bin/env bash
set -u; c=$1; E="${REPO:-$PWD}/.dogfood-exp/exp12-$c"; [ -d "$E" ] || { echo "no copy: $E (저장소 루트에서 실행하거나 REPO=<루트>)"; exit 2; }
F=~/harness-dogfood/dogfood-flutter; fail=0
cd "$E/apps/mobile" || exit 2
if diff -q lib/screens/today_list/today_list_screen.dart "$F/apps/mobile/lib/screens/today_list/today_list_screen.dart" >/dev/null; then echo "approved-ui: unchanged"; else echo "approved-ui: CHANGED"; fail=1; fi
for f in lib/features/habits/today_list_controller.dart test/features/today_list_controller_test.dart; do [ -f "$f" ] && echo "exists: $f" || { echo "missing: $f"; fail=1; }; done
grep -q '"product_entry": "' "$E/docs/20-system/prototypes/M1/manifest.json" && echo "product_entry: set" || { echo "product_entry: null"; fail=1; }
flutter analyze --no-pub >/tmp/analyze.$c 2>&1 && echo "analyze: clean" || { echo "analyze: FAIL"; tail -5 /tmp/analyze.$c; fail=1; }
for n in test_AC_1_ test_AC_2_ test_AC_3_; do
  if flutter test test/features/today_list_controller_test.dart --plain-name "$n" >/tmp/t.$c.$n 2>&1; then echo "$n: pass"; else echo "$n: FAIL"; tail -3 /tmp/t.$c.$n; fail=1; fi
done
echo "result: $([ $fail = 0 ] && echo OK || echo FAIL)"; exit $fail
```
승인 UI 경로·컨트롤러 경로·AC 테스트 이름 접두(`test_AC_N_`)는 dogfood-flutter의 T-002 task 문서 `## 6-1`과 실제 트리에서 확인해 맞춘다(2026-09-12 실측: 컨트롤러는 `lib/features/habits/`). `--plain-name`은 부분 일치라 접두로 충분하다. `result: OK`일 때만 표의 `validate: OK`로 적는다.

### B-3. slice 프롬프트 골격 (`~/harness-dogfood/tools/exp12-slice-prompt.txt`)
```
프로젝트 루트: __ROOT__ (모든 명령은 이 디렉터리에서)
slice: T-002-today-list-wiring 전체 (단일 builder)
## 담당 ## 3 step
<T-002 task 문서 ## 3 전체를 그대로>
## 책임지는 AC
<## 6 AC-1~3 그대로>
## 테스트 파일·이름
<## 6-1 그대로 — test_AC_1_… / test_AC_2_… / test_AC_3_…>
## 규율
- 승인 UI 파일(lib/screens/today_list/today_list_screen.dart)은 바이트 무변경. 배선만 한다(ADR-072 D5-3).
- 모듈 부재·컴파일 오류로 테스트가 0건 실행된 상태는 Red가 아니다 — 의도적으로 틀린 최소 구현을 먼저 두고 어설션 실패를 관측하라.
- 토큰 외 리터럴 금지.
## 보고 형식
1. 반환문 첫 줄: 측정 조건 마커
2. AC별 Red 관측(실패 메시지 인용) → Green
3. 변경 파일 목록
4. 남은 리스크
```
조건마다 `__ROOT__`만 `<저장소>/.dogfood-exp/exp12-<c>`로 치환한다. 그 외 바이트 동일.

## 부록 C. ADR-075 절별 승계 원천

| ADR-075 | 원천 | 비고 |
|---|---|---|
| D1 foreman 오케스트레이션 | ADR-051 D1 + #d6 | file-disjoint slice·병렬/단일 판정 · slice 크기 4개는 ADR-074 D9-2 인용 |
| D2 report-only fan-out | ADR-051 D2 | validate/stabilize |
| D3 plan de-fork | ADR-051 D3 | |
| D4 plan-milestone 범위 | ADR-051 D4 + #amend-3 | M1 포함 |
| D5 wave 제거 | ADR-051 D5 | ADR-038 #d3·#d6 supersede 승계 |
| D6 ADR-047 D9 re-anchor | ADR-051 D6 | |
| D7 NO-merge | ADR-051 D7 | 기록 |
| D8 조건부 re-read | ADR-051 D8 | ADR-019 |
| D9 공유 런타임 partition 가드 | #amend-1 | |
| D10 orchestration 관측 기록 | #amend-2 | `## Orchestration` |
| D11 fan-out 크기 판정 v2 | #amend-4 결정 1 + 재보정 | L_impl·테스트 파일 집합·1축=1 validator |
| D12 축 spawn 신호 | validate-workitem «신호 기반 조건부 spawn» + 재보정 | 축 5 = UI surface 파일 diff |
| D13 하청 정지 회수 | #amend-4 결정 2 | always-verify |
| D14 의존성 도구 고정 | #amend-4 결정 3 | Dependency Tools SSOT |
ADR-051 `## 대체` 절(ADR-050 D1 implement 부분·ADR-038 #d3·#d6 supersede)은 ADR-075 `## 대체`로 그대로 옮긴다. ADR-050(6·15·19행)·ADR-038(6·11·14·48·58·137·143행)의 «부분 superseded — [ADR-051](…)» 서술은 역사 서술이므로 링크는 두고 각 줄 끝에 `(현재 SSOT: ADR-075)`를 병기한다(ADR-045 D10 D 분류 — P4-5 마지막 항목의 대상).
