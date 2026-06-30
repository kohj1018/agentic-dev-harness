# IMPROVE-GUIDE — 하네스 개선 실행 지시서

이 문서를 위에서 아래로 따라가면 audit가 찾은 12개 결함 + 교차검토 보강 1건(Phase 5.3 Codex 호출 표기) + 재발방지 1건이 전부 수정된다.

## 0. 공통 규칙
- **위치는 줄번호가 아니라 아래 "기존" 코드블록의 문자열로 찾는다**(줄은 표류함). "기존" 블록을 "수정" 블록으로 정확히 교체한다.
- 각 Phase 끝에서 *그 Phase가 건드린 파일만* 명시 add 후 커밋한다 — `git add -A`/`git add .` 금지, 푸시 금지.
- Phase는 의존 순서다. **순서대로** 진행한다(Phase 9는 Phase 8이 만든 정합 상태를 검사하므로 반드시 마지막).

## 개선 순서

| Phase | 대상 파일 | 핵심 |
|---|---|---|
| 1 | implement-workitem, builder.md, ADR-051 | foreman가 공유-런타임-리소스 격리 신호를 실제로 읽어 순차화(false-Green 차단) |
| 2 | reviewer.md | milestone-mode 게이팅(FAC 반전·차원 비활성) 전파 |
| 3 | plan-milestone | validate-plan milestone-mode 안내 + feature `## 3`/`## 10` authoring |
| 4 | bootstrap-project, bootstrap-stack | ADR-053 고-stakes 게이트를 결정 step에서 교차참조 |
| 5 | validate-milestone | reviewer-tag 디폴트 + stabilize 층 리뷰 라벨 정의 |
| 6 | repair-milestone | 부분범위 peer 파일 삭제 가드 + cross-worktree 종료 안내 |
| 7 | repair-plan | milestone-mode 한 줄을 회수 step으로 이동 |
| 8 | README ×2, STRUCTURE, DELEGATION, WORKFLOW, ADR-054 | validate-milestone 로스터 전파(자기모순 제거) |
| 9 | stabilize-milestone | skill 로스터 fan-out 정합 preflight 추가(재발방지) |

---

# Phase 1 — foreman 공유-런타임-리소스 순차화 배선

> 현재 `implement-workitem:26`은 "격리 없이 공유 리소스를 쓰는 slice는 순차화"하라고 지시하지만, foreman는 그 판단에 필요한 신호(STACK_SETUP_PLAN 격리 표식 / slice의 공유 리소스 사용)를 *읽지 않는다*. builder가 "충돌 신호 보고"하라는 지시는 dispatch 후·false-Green이라 비실행적. 신호원을 dispatch *전* 정적 입력으로 배선한다.

### 1.1 `.claude/skills/implement-workitem/SKILL.md` — partition step에 격리 표식 회수 추가
**기존**:
```
4. **분할 (partition) — 싸게 한다, 과추론 금지** (ADR-047 D9 + ADR-051 #d6 — foreman `## 3` step-path partition):
```
**수정**:
```
4. **분할 (partition) — 싸게 한다, 과추론 금지** (ADR-047 D9 + ADR-051 #d6 — foreman `## 3` step-path partition; *partition 직전 `docs/00-meta/STACK_SETUP_PLAN.md`(있으면)의 "테스트 격리 미설정" 표식을 회수* — 공유 런타임 리소스 순차화 입력):
```

### 1.2 `.claude/skills/implement-workitem/SKILL.md` — 공유 런타임 리소스 불릿에 신호원 명시
**기존**:
```
   - **공유 런타임 리소스 주의(병렬 안전, ADR-051#amend-1 / ADR-038 면책 단락)**: 두 slice의 테스트가 *격리 없이* 공유 런타임 리소스(테스트 DB·고정 포트·로컬 Supabase 54321/54322·단일 dev server·공유 빌드/codegen 캐시 `tsbuildinfo`·`.next/cache`)를 동시에 건드리면, file-disjoint라도 병렬 시 충돌(최악: 한 builder의 seed가 다른 builder 단언을 우연히 충족하는 *false-Green*) → 그 slice들은 *순차 dispatch(또는 단일 builder)*. 격리(testcontainers·트랜잭션 롤백·랜덤 포트)가 보장되면 병렬 유지. **soft(hard-block 아님)** — 격리된 unit-test 일반 케이스 병렬 속도는 죽이지 않는다.
```
**수정**:
```
   - **공유 런타임 리소스 주의(병렬 안전, ADR-051#amend-1 / ADR-038 면책 단락)**: 두 slice의 테스트가 *격리 없이* 공유 런타임 리소스(테스트 DB·고정 포트·로컬 Supabase 54321/54322·단일 dev server·공유 빌드/codegen 캐시 `tsbuildinfo`·`.next/cache`)를 동시에 건드리면, file-disjoint라도 병렬 시 충돌(최악: 한 builder의 seed가 다른 builder 단언을 우연히 충족하는 *false-Green*) → 그 slice들은 *순차 dispatch(또는 단일 builder)*. **"격리 없이"는 dispatch *전*에 두 신호로 판단한다**: (a) `STACK_SETUP_PLAN.md`의 "테스트 격리 미설정" 표식(step 4에서 회수), (b) 두 slice의 `## 3`/`## 4-1`가 *같은 공유 리소스*(테스트 DB·고정 포트·로컬 Supabase·단일 dev server·공유 빌드캐시)를 가리킴. 둘 중 하나라도 해당하고 *격리 보장 명시가 없으면* 순차화한다 — builder는 충돌을 사후 탐지할 수 없으므로 dispatch 전에 결정한다(*의심되면 단일 builder*). 격리(testcontainers·트랜잭션 롤백·랜덤 포트)가 보장되면 병렬 유지. **soft(hard-block 아님)** — 격리된 unit-test 일반 케이스 병렬 속도는 죽이지 않는다.
```

### 1.3 `.claude/agents/builder.md` — 비실행적 "충돌 신호 보고" 교정
**기존**:
```
- **테스트 실행은 자기 slice 범위로 한정**한다 (전체 스위트는 공유 DB/포트/snapshot/build-cache 충돌로 flaky). *단, 범위 한정은 폭발 반경을 줄일 뿐 공유 런타임 리소스 충돌을 없애지 못한다* — 격리 없이 공유 DB/포트를 쓰는 slice는 *foreman이 순차화*해야 한다(implement-workitem partition, ADR-051#amend-1). builder는 peer slice를 못 보므로 직접 해결 불가 — 충돌 신호는 foreman에 보고. 전체 통합 검증은 foreman 최종 `validate --changed`(ADR-051 D1).
```
**수정**:
```
- **테스트 실행은 자기 slice 범위로 한정**한다 (전체 스위트는 공유 DB/포트/snapshot/build-cache 충돌로 flaky). *단, 범위 한정은 폭발 반경을 줄일 뿐 공유 런타임 리소스 충돌을 없애지 못한다* — 격리 없이 공유 DB/포트를 쓰는 slice는 *foreman이 dispatch 전에 순차화*한다(STACK_SETUP_PLAN 격리 표식·`## 3` 공유 리소스 신호로 — implement-workitem partition, ADR-051#amend-1). builder는 peer slice를 못 보므로 자기 slice 테스트를 *범위 한정*으로만 유지하고, 자기 slice가 격리 없는 공유 리소스(테스트 DB·고정 포트·로컬 Supabase 등)에 의존하면 출력 "남은 리스크"에 명시해 foreman의 다음 라운드 partition 입력으로 남긴다. 전체 통합 검증은 foreman 최종 `validate --changed`(ADR-051 D1).
```

### 1.4 `docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md` — amend-1 item 2 신호원 명시
**기존**:
```
2. builder는 *테스트 범위 한정이 완화책이지 해결책 아님*을 명시 — 충돌 신호는 foreman 보고. stack-guard는 e2e/통합 격리를 *권장*(unit 격리 authoring 한계).
```
**수정**:
```
2. builder는 *테스트 범위 한정이 완화책이지 해결책 아님*을 명시. foreman은 격리 여부를 dispatch *전*에 두 신호로 판단해 순차화한다 — (a) `STACK_SETUP_PLAN.md`의 "테스트 격리 미설정" 표식, (b) 두 slice의 `## 3`가 동일 공유 리소스 지목(builder는 peer slice 미가시·false-Green 사후 탐지 불가라 *사전 결정*). builder는 자기 slice의 공유-리소스 의존을 "남은 리스크"로 보고. stack-guard는 e2e/통합 격리를 *권장*(unit 격리 authoring 한계).
```

**검증**:
- `grep -n "STACK_SETUP_PLAN" .claude/skills/implement-workitem/SKILL.md` → partition step(4) + 공유 런타임 불릿에 등장(기존 112행 Needs-MCP 외에 신규 2건).
- `grep -n "충돌 신호는 foreman에 보고" .claude/agents/builder.md` → 0건.
- `grep -n "dispatch \*전\*" docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md` → 1건.

**커밋**: `fix(implement): wire STACK_SETUP_PLAN isolation signal into foreman partition (ADR-051#amend-1)`

---

# Phase 2 — reviewer.md milestone-mode 게이팅 전파

> `validate-plan`은 milestone-mode에서 `[Plan-FAC-coverage]`를 반전(빈 `## 7-1` shell 정상)하고 task형 3차원을 비활성화하지만, `reviewer.md`의 Milestone-Plan 블록엔 MP 4차원만 있고 이 게이팅이 없다. cross-LLM 리뷰어가 reviewer.md를 따르면 가짜 P0를 재발화한다.

### 2.1 `.claude/agents/reviewer.md` — Milestone-Plan 블록에 게이팅 추가
**기존**:
```
### Milestone-Plan Quality 4 (milestone-mode — 하위 task 0건, ADR-038#amend-4)
- [MP-FAC-quality] P0 — FAC 시나리오 수준 + 측정 가능, `## 3` 추적.
- [MP-feature-scope] P0 — charter 비목표 / milestone 제외 침범.
- [MP-graduation] P1 — graduation 5+1(ADR-014) + e2e 선언(ADR-052).
- [MP-feature-dep] P1 — feature 간 순환·잘못된 병렬.
(task 1건+면 Plan Quality 10 차원.)
```
**수정**:
```
### Milestone-Plan Quality 4 (milestone-mode — 하위 task 0건, ADR-038#amend-4)
- **milestone-mode 게이팅**: 하위 task가 0건이면 위 10차원 중 [Plan-sizing]·[Plan-AC-form]·[Plan-dep]는 *비활성*(task 산물 부재)이고, [Plan-FAC-coverage]는 *반전*된다 — 빈 `## 7-1` shell은 정상이므로 unmapped FAC를 P0로 올리지 **않고**, shell이 형식적으로 깨졌을 때만 P2. 그 위에 아래 4차원을 적용한다.
- [MP-FAC-quality] P0 — FAC 시나리오 수준 + 측정 가능, `## 3` 추적.
- [MP-feature-scope] P0 — charter 비목표 / milestone 제외 침범.
- [MP-graduation] P1 — graduation 5+1(ADR-014) + e2e 선언(ADR-052).
- [MP-feature-dep] P1 — feature 간 순환·잘못된 병렬.
(혼합 마일스톤은 feature 단위로 mode 적용. task 1건+면 Plan Quality 10 차원.)
```

**검증**: `grep -n "milestone-mode 게이팅\|반전" .claude/agents/reviewer.md` → 1건. validate-plan SKILL.md의 "milestone-plan mode" 단락과 의미 일치.

**커밋**: `fix(reviewer): gate milestone-mode FAC inversion and dimension deactivation (ADR-038#amend-4)`

---

# Phase 3 — plan-milestone: 교차검토 안내 + feature 시나리오/의존성 authoring

> (1) `validate-plan` milestone-mode(amend-4 신설)가 plan-milestone 종료 출력에서 안내되지 않아 사장됨. (2) 신설 `[MP-FAC-quality]`(P0)는 feature `## 3`을, `[MP-feature-dep]`은 `## 10`을 요구하는데 R4 채움 enumeration이 둘을 누락 → 직후 validate-plan이 갓 만든 산출에 P0를 띄움.

### 3.1 `.claude/skills/plan-milestone/SKILL.md` — R4에 `## 3`/`## 10` 채움 추가
**기존**:
```
- `## 0-1. Type`을 채운다(ADR-039). `feature`면 `## 2`를 User Story로, 비-feature(technical-enabler/bugfix/refactor/migration/research-spike)면 기술적 근거 + 서비스하는 DISCOVERY ID·ADR 링크로 채운다(정책은 FEATURE_TEMPLATE 주석·ADR-039가 SSOT).
- `## 7. Feature-level Acceptance Criteria`(FAC)를 시나리오 수준 측정 기준으로 채운다.
```
**수정**:
```
- `## 0-1. Type`을 채운다(ADR-039). `feature`면 `## 2`를 User Story로, 비-feature(technical-enabler/bugfix/refactor/migration/research-spike)면 기술적 근거 + 서비스하는 DISCOVERY ID·ADR 링크로 채운다(정책은 FEATURE_TEMPLATE 주석·ADR-039가 SSOT).
- `## 3. 핵심 시나리오`(feature가 만족시킬 사용자 시나리오)와 `## 10. 의존성`(feature 간 선후·병렬)을 채운다 — FAC가 추적할 시나리오 + feature 의존 검토의 전제. 이 두 섹션 *신설*은 `/plan-milestone` 책임이다(plan-workitem 아님).
- `## 7. Feature-level Acceptance Criteria`(FAC)를 시나리오 수준 측정 기준으로 채운다.
```

### 3.2 `.claude/skills/plan-milestone/SKILL.md` — 종료 분기 옵션에 milestone-plan mode 안내 추가
**기존**:
```
  - 분기 옵션 (해당 시 — ≤3 개):
    - UI feature 포함 + DESIGN.md 미반영 시: `/bootstrap-design --update` 먼저
    - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
```
**수정**:
```
  - 분기 옵션 (해당 시 — ≤3 개):
    - 마일스톤 plan 교차검토 원하면: 다른 세션·다른 LLM에서 `/validate-plan <M>`(milestone-plan mode) 후 원본에서 `/repair-plan <M>`
    - UI feature 포함 + DESIGN.md 미반영 시: `/bootstrap-design --update` 먼저
    - 기획 신뢰도 재확인 원하면: 다른 세션에서 `/validate-discovery --reviewer-tag <tag>` 후 원본에서 `/repair-discovery`
```

**검증**:
- `grep -n "## 3. 핵심 시나리오" .claude/skills/plan-milestone/SKILL.md` → R4에 1건.
- `grep -n "validate-plan <M>" .claude/skills/plan-milestone/SKILL.md` → 종료 분기 옵션에 1건.

**커밋**: `fix(plan-milestone): advertise milestone-plan-mode review and author feature scenario/dependency sections`

---

# Phase 4 — bootstrap-project / bootstrap-stack: 고-stakes 게이트 교차참조

> ADR-053 게이트가 두 skill에서 "마지막 출력" 뒤 부록으로 분리돼 architect 단발 sub-call step과 단절. 결정 step에서 게이트를 가리키는 한 줄을 박는다(plan-milestone은 이미 R2 인라인이라 변경 불요).

### 4.1 `.claude/skills/bootstrap-project/SKILL.md` — step 3에 게이트 교차참조
**기존**:
```
3. 메인 세션이 본 절차를 직접 운전한다(discover-product·bootstrap-design 패턴). 무거운 아키텍처 추론(charter 구조화·ARCHITECTURE 결정·ADR-100 초안)은 `Agent` 도구로 **architect 단발 sub-call**에 위임하고, 반환된 결론을 본 skill이 파일에 반영한다(architect agent의 `model: opus`가 추론 품질을 보장). 종료 후 사용자에게 `/clear` 또는 새 세션 권장.
```
**수정**:
```
3. 메인 세션이 본 절차를 직접 운전한다(discover-product·bootstrap-design 패턴). 무거운 아키텍처 추론(charter 구조화·ARCHITECTURE 결정·ADR-100 초안)은 `Agent` 도구로 **architect 단발 sub-call**에 위임하고, 반환된 결론을 본 skill이 파일에 반영한다(architect agent의 `model: opus`가 추론 품질을 보장). **단, 설계 결정이 ADR-053 게이트(S1~S4 중 1+)에 걸리면 단발 sub-call 대신 아래 `## 고-stakes 설계 게이트`의 ①~④ 절차를 따른다** — 신규 프로젝트 초기 아키텍처(DB·인증·데이터 모델)는 거의 항상 게이트 대상. 종료 후 사용자에게 `/clear` 또는 새 세션 권장.
```

### 4.2 `.claude/skills/bootstrap-stack/SKILL.md` — step 4(인터페이스 컨벤션 채움 = 실제 architect 단발 sub-call)에 게이트 교차참조
**기존**:
```
4. **인터페이스 컨벤션 채움** — API/CLI/백엔드/프론트 컨벤션은 ARCHITECTURE_OVERVIEW.md의 7-1/7-2/7-3/7-4에 박는다.
```
**수정**:
```
4. **인터페이스 컨벤션 채움** — API/CLI/백엔드/프론트 컨벤션은 ARCHITECTURE_OVERVIEW.md의 7-1/7-2/7-3/7-4에 박는다. **(7-3 백엔드 결정(인증·DB·트랜잭션) 등 되돌리기 비싼 선택이 ADR-053 게이트(S1~S4 중 1+)에 걸리면, architect 단발 대신 아래 `## 고-stakes 설계 게이트`의 ①~④ 절차를 따른다.)**
```

**검증**: `grep -n "ADR-053 게이트(S1~S4 중 1+)에 걸리면" .claude/skills/bootstrap-project/SKILL.md .claude/skills/bootstrap-stack/SKILL.md` → 각 1건(결정 step 안).

**커밋**: `fix(design): cross-reference ADR-053 high-stakes gate from architect sub-call steps`

---

# Phase 5 — validate-milestone: reviewer-tag 디폴트 + stabilize 층 라벨

> `--reviewer-tag` 미지정 시 파일명이 비결정화되고, 다중 리뷰어 가이드도 없음(validate-plan은 둘 다 명시). 또 리뷰 양식을 validate-plan에서 "차용"하는데 그 카운트 표는 plan 14차원이라 stabilize 판단 층(qa/reviewer)에 안 맞음.

### 5.1 `.claude/skills/validate-milestone/SKILL.md` — tag 디폴트 + 다중 리뷰어
**기존**:
```
- tag `[A-Za-z0-9._-]{1,32}`, milestone-id `M[0-9]+`만 허용(미일치 즉시 종료). 파일 존재 시 자동 suffix(`-2`,`-3`) — validate-plan과 동형.
```
**수정**:
```
- tag `[A-Za-z0-9._-]{1,32}`, milestone-id `M[0-9]+`만 허용(미일치 즉시 종료). **`--reviewer-tag` 미지정 시 `default` 사용.** 파일 존재 시 자동 suffix(`-2`,`-3`) — validate-plan과 동형. **다중 리뷰어 동시 실행 시 서로 다른 tag 명시 권장**(예: `--reviewer-tag codex`) — 미지정 시 모두 `default`로 저장돼 suffix로만 구분된다.
```

### 5.2 `.claude/skills/validate-milestone/SKILL.md` — 리뷰 양식 라벨 축 명시
**기존**:
```
리뷰 파일: `docs/40-validation/stabilize-reviews/<M>.<reviewer-tag>.md` — 양식(판정 ALL_GOOD/NEEDS_CHANGES + 발견 + 카운트 표 + 핵심 관찰 ≤3)은 validate-plan 차용.
```
**수정**:
```
리뷰 파일: `docs/40-validation/stabilize-reviews/<M>.<reviewer-tag>.md` — 양식(판정 ALL_GOOD/NEEDS_CHANGES + 발견 + 카운트 표 + 핵심 관찰 ≤3)은 validate-plan 차용. **단, 카운트 표의 카테고리 축은 plan 차원이 아니라 *stabilize 판단 층 라벨*을 쓴다** — qa(회귀/엣지케이스)·reviewer(리팩토링/디자인 부채). 각 발견은 `<라벨> <file:line> <증상>` 형식(QA_FINDINGS 라벨 체계 정합 — `/repair-milestone` dedup 입력).
```

**검증**: `grep -n "미지정 시 \`default\`\|stabilize 판단 층 라벨" .claude/skills/validate-milestone/SKILL.md` → 2건.

### 5.3 `.claude/skills/validate-milestone/SKILL.md` — Codex 호출 표기 정정 (wrapper 없음 → 자연어)
**기존**:
```
**Codex**: 본 skill은 ADR-054 D5(ADR-044 선례)대로 Codex wrapper 미생성 — Codex에선 `$validate-milestone` 자연어 호출(README 목록).
```
**수정**:
```
**Codex**: 본 skill은 ADR-054 D5(ADR-044 선례)대로 Codex wrapper 미생성 — Codex에선 `$`-skill 호출이 아니라 *자연어*로 호출한다(`Follow .claude/skills/validate-milestone/SKILL.md` — README 자연어 목록).
```
**검증(5.3)**: `grep -c '\$validate-milestone' .claude/skills/validate-milestone/SKILL.md` → 0건.

**커밋**: `fix(validate-milestone): default reviewer-tag, stabilize-layer labels, and natural-language Codex note`

---

# Phase 6 — repair-milestone: 부분범위 삭제 가드 + cross-worktree 종료 안내

> (1) step 6 peer 파일 삭제에 "미처리 항목 잔존 시 보존" 가드가 없어 `P0만` 부분범위 실행 시 gitignore된 peer P1/P2가 소실(형제 repair-workitem엔 가드 있음). (2) 종료 가드가 "peer 리뷰 없음"과 "다른 worktree에서 돌렸는데 이동 망각"을 구분 못 함.

### 6.1 `.claude/skills/repair-milestone/SKILL.md` — 삭제 가드 추가
**기존**:
```
6. **stabilize-reviews 파일 삭제 (echo-then-rm, ADR-054)**: 처리 완료한 stabilize-reviews 파일을 한 개씩 삭제한다. **삭제 전 경로 echo 강제** — `삭제 예정: <경로>` 출력 후 Bash `rm`으로 한 개씩 정확히 삭제. 미리 회수한 경로 목록을 사용(삭제 후 재glob 금지 — 삭제된 파일이 목록에 없는 다른 파일까지 재수집 오인 방지).
```
**수정**:
```
6. **stabilize-reviews 파일 삭제 (echo-then-rm, ADR-054)**: 한 파일의 *전 severity finding이 4-판정 완결됐을 때만* 그 파일을 삭제한다 — 부분 범위(`M1 "P0만"` 등)로 미처리 finding이 남은 파일은 *삭제하지 않고 보존*하고 출력에 "미처리 잔존 — 보존: <경로>"를 명시한다(stabilize-reviews는 gitignore된 ephemeral이라 삭제 시 그 안의 peer finding이 어디에도 안 남는다 — repair-workitem report 삭제 가드와 동형). **삭제 전 경로 echo 강제** — `삭제 예정: <경로>` 출력 후 Bash `rm`으로 한 개씩 정확히 삭제. 미리 회수한 경로 목록을 사용(삭제 후 재glob 금지 — 삭제된 파일이 목록에 없는 다른 파일까지 재수집 오인 방지).
```

### 6.2 `.claude/skills/repair-milestone/SKILL.md` — 종료 가드에 cross-worktree 안내
**기존**:
```
   - QA_FINDINGS `## M-N`도 IMPROVEMENT_GUIDE `### M-N`도 *그리고 stabilize-reviews 파일*도 모두 비어 있으면 *"수정 대상 finding 없음 — 다른 세션에서 `/stabilize-milestone <M-N>`을 먼저 실행하세요."* 안내 후 종료. 문서 수정 금지.
```
**수정**:
```
   - QA_FINDINGS `## M-N`도 IMPROVEMENT_GUIDE `### M-N`도 *그리고 stabilize-reviews 파일*도 모두 비어 있으면 *"수정 대상 finding 없음 — 다른 세션에서 `/stabilize-milestone <M-N>`을 먼저 실행하세요. (다른 세션·worktree에서 `/validate-milestone`를 돌렸다면 그 리뷰 파일을 이 checkout의 `docs/40-validation/stabilize-reviews/`로 옮긴 뒤 재실행하세요.)"* 안내 후 종료. 문서 수정 금지.
```

**검증**: `grep -n "전 severity finding이 4-판정 완결\|옮긴 뒤 재실행" .claude/skills/repair-milestone/SKILL.md` → 2건.

**커밋**: `fix(repair-milestone): guard partial-scope peer-file deletion and clarify cross-worktree exit message`

---

# Phase 7 — repair-plan: milestone-mode 한 줄을 회수 step으로 이동

> milestone-mode 줄이 "마지막 출력" 뒤 고아 bullet로 떨어져 수식 대상(회수·적용 단계)과 단절. 회수 step으로 옮긴다.

### 7.1 `.claude/skills/repair-plan/SKILL.md` — 회수 step(2)에 통합
**기존**:
```
2. 입력 ID에 해당하는 workitem 문서 + 모든 하위 문서를 읽는다 (`/validate-plan`과 동일 범위).
```
**수정**:
```
2. 입력 ID에 해당하는 workitem 문서 + 모든 하위 문서를 읽는다 (`/validate-plan`과 동일 범위). milestone-plan mode 리뷰(ADR-038#amend-4 — 하위 task 0건의 M/F id)도 동일하게 회수·적용한다(M/F id는 sanitization step에서 이미 처리).
```

### 7.2 `.claude/skills/repair-plan/SKILL.md` — 고아 bullet 제거
**기존** (이 두 줄 — 앞의 빈 줄 포함 — 을 통째 삭제):
```

- milestone-plan mode 리뷰(ADR-038#amend-4)도 동일 회수·적용 — M/F id 이미 처리.
```
**수정**: (위 블록을 삭제해 "마지막 출력" 목록 끝과 `## Context 정책` 사이를 빈 줄 하나로 둔다.)

**검증**: `grep -c "milestone-plan mode 리뷰" .claude/skills/repair-plan/SKILL.md` → 1건(회수 step 2에만). `## Context 정책` 바로 앞이 고아 bullet이 아닌지 확인.

**커밋**: `refactor(repair-plan): fold milestone-plan-mode note into recovery step`

---

# Phase 8 — validate-milestone 로스터 전파 (자기모순 제거)

> ADR-054가 validate-milestone를 신설하며 일부 로스터만 갱신: README 자연어 목록이 *한 파일 안에서* 7종 vs 8종 모순, STRUCTURE SSOT 포인터가 목록 없는 파일을 가리킴, DELEGATION/WORKFLOW에 stabilize cross-review 미등재.

### 8.1 `README.md` — 정책 요약 문단(item 2)의 자연어 목록에 validate-milestone 추가
**기존**:
```
2. Documents and policies are equal. Core workflow skills have Codex wrappers ($-prefixed): $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-milestone, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $repair-milestone, $stack-guard. Remaining skills (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack, validate-discovery, repair-discovery) are invoked via natural language. See [WORKFLOW.md](docs/00-meta/WORKFLOW.md).
```
**수정**:
```
2. Documents and policies are equal. Core workflow skills have Codex wrappers ($-prefixed): $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-milestone, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $repair-milestone, $stack-guard. Remaining skills (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack, validate-discovery, repair-discovery, validate-milestone) are invoked via natural language. See [WORKFLOW.md](docs/00-meta/WORKFLOW.md).
```

### 8.2 `README_ko.md` — 정책 요약 문단(item 2)의 자연어 목록에 validate-milestone 추가
**기존**:
```
2. 문서와 정책은 동일. 핵심 workflow skill은 Codex wrapper ($-prefixed)로 제공: $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-milestone, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $repair-milestone, $stack-guard. 나머지 skill (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack, validate-discovery, repair-discovery)은 자연어로 호출. 자세한 워크플로우는 [WORKFLOW.md](docs/00-meta/WORKFLOW.md) 참조.
```
**수정**:
```
2. 문서와 정책은 동일. 핵심 workflow skill은 Codex wrapper ($-prefixed)로 제공: $implement-workitem, $validate-workitem, $repair-workitem, $finalize-workitem, $plan-milestone, $plan-workitem, $validate-plan, $repair-plan, $bootstrap-project, $bootstrap-stack, $stabilize-milestone, $repair-milestone, $stack-guard. 나머지 skill (discover-product, review-doc, boilerplate-context, bootstrap-design, research-pack, validate-discovery, repair-discovery, validate-milestone)은 자연어로 호출. 자세한 워크플로우는 [WORKFLOW.md](docs/00-meta/WORKFLOW.md) 참조.
```

### 8.3 `docs/00-meta/STRUCTURE.md` — SSOT 포인터 정정
**기존**:
```
| Codex skill wrapper | `.agents/skills/<name>/{SKILL.md, agents/openai.yaml}` (자연어 호출 skill 목록 SSOT는 boilerplate/README — ADR-010#amend-3; lifecycle/메인 호출 skill은 wrapper 미보유 가능) | 수동 | Reference | baseline |
```
**수정**:
```
| Codex skill wrapper | `.agents/skills/<name>/{SKILL.md, agents/openai.yaml}` (자연어 호출 skill 목록 SSOT는 README.md / README_ko.md — ADR-010#amend-3; lifecycle/메인 호출 skill은 wrapper 미보유 가능) | 수동 | Reference | baseline |
```

### 8.4 `docs/00-meta/DELEGATION_STRATEGY.md` — 위임 표에 stabilize cross-review 2행 추가
**기존** (discovery cross-review 2행 — 이 블록 뒤에 삽입):
```
| 기획 cross-review 결과 회수 + DISCOVERY 수정 | architect | 원본 세션에서 `/repair-discovery`. 리뷰 회수 → 결정 → DISCOVERY 수정 → 파일 삭제 (ADR-044). |
```
**수정** (위 행 *바로 뒤에* 2행 추가):
```
| 기획 cross-review 결과 회수 + DISCOVERY 수정 | architect | 원본 세션에서 `/repair-discovery`. 리뷰 회수 → 결정 → DISCOVERY 수정 → 파일 삭제 (ADR-044). |
| 마일스톤 stabilize 결과의 cross-LLM peer review (opt-in) | reviewer/qa (stabilize surface — qa 엣지케이스·회귀 + reviewer 부채) | 다른 세션·다른 LLM에서 `/validate-milestone`. 임시 리뷰 파일 1개, 코드·문서·실행 X (ADR-054). |
| stabilize cross-review 결과 회수 + 종합 | 메인 세션 (repair-milestone) | 원본 세션에서 `/repair-milestone`. stabilize-reviews 회수 → 4-판정·dedup → 적용 → 삭제 (ADR-054). |
```

### 8.5 `docs/00-meta/WORKFLOW.md` — §5에 stabilize cross-review opt-in 추가
**기존**:
```
- **코드 수정·커밋·status 변경 금지** — 결과는 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`에 누적 기록.
- 후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 연결.
```
**수정**:
```
- **코드 수정·커밋·status 변경 금지** — 결과는 `QA_FINDINGS.md`와 `IMPROVEMENT_GUIDE.md`에 누적 기록.
- 후속 작업이 필요하면 `/repair-workitem` 또는 새 task로 연결.
- **선택 (opt-in, ADR-054)**: stabilize 후 다른 세션·다른 LLM에서 `/validate-milestone <M> --reviewer-tag <tag>`(읽기 전용)로 2nd opinion → 원본 세션에서 `/repair-milestone <M>`이 peer 리뷰를 종합. 건너뛰어도 정상.
```

### 8.6 `docs/00-meta/WORKFLOW.md` — 라이프사이클 다이어그램에 stabilize cross-review 분기(별도 줄, 본선 미변경)
**기존** (ADR-038 opt-in 분기 줄 — 들여쓰기 무관하게 이 줄을 찾는다; **본선 Pass 줄은 건드리지 않는다**):
```
└─(opt-in, ADR-038)─→ validate-plan (별 세션) → repair-plan (원본 세션) → implement
```
**수정** (위 줄 *바로 뒤*에 아래 한 줄을 추가 — 다이어그램 코드블록 안. 본선 Pass 줄은 그대로):
```
(opt-in, ADR-054) stabilize → validate-milestone (별 세션) → repair-milestone (원본 세션)
```

### 8.7 `docs/90-decisions/boilerplate/ADR-054-cross-llm-stabilize-review.md` — 결과 + Mutation Contract Target에 migration 대상 추가

**8.7a — `## 결과` 단락**
**기존**:
```
- `.claude/skills/validate-milestone/SKILL.md`(신규), repair-milestone(확장), stabilize-milestone(single-origin), `docs/40-validation/stabilize-reviews/`, .gitignore. STRUCTURE 산출물 표·로스터 + README 자연어 Codex 목록은 migration 적용 대상(Surfaces 아님).
```
**수정**:
```
- `.claude/skills/validate-milestone/SKILL.md`(신규), repair-milestone(확장), stabilize-milestone(single-origin), `docs/40-validation/stabilize-reviews/`, .gitignore. STRUCTURE 산출물 표·로스터 + README 자연어 Codex 목록(양 README의 정책 요약 문단·명시 목록 *둘 다*) + DELEGATION_STRATEGY 위임 표 + WORKFLOW §5·라이프사이클 흐름은 migration 적용 대상(Surfaces 아님).
```

**8.7b — `## Mutation Contract`의 Target(1번)** (같은 사실이 여기에도 반복되므로 함께 갱신)
**기존**:
```
1. Target — validate-milestone 신설 / repair-milestone 회수·dedup·종료가드·echo-rm / stabilize single-origin / .gitignore / STRUCTURE 산출물 표+로스터 / README 자연어 Codex 목록.
```
**수정**:
```
1. Target — validate-milestone 신설 / repair-milestone 회수·dedup·종료가드·echo-rm / stabilize single-origin / .gitignore / STRUCTURE 산출물 표+로스터 / README 자연어 Codex 목록 / DELEGATION_STRATEGY 위임 표 / WORKFLOW §5·라이프사이클 흐름.
```

**검증**:
- `grep -c "validate-milestone" README.md` → 2건(item 2 + item 4). `README_ko.md`도 동일.
- `grep -n "SSOT는 boilerplate/README" docs/00-meta/STRUCTURE.md` → 0건(정정됨 — line 48·92의 ADR-인덱스 포인터 `boilerplate/README.md`는 정상이므로 *건드리지 않는다*).
- `grep -c "DELEGATION_STRATEGY 위임 표" docs/90-decisions/boilerplate/ADR-054-cross-llm-stabilize-review.md` → 2건(결과 + Mutation Contract Target).
- `grep -n "validate-milestone\|repair-milestone" docs/00-meta/DELEGATION_STRATEGY.md docs/00-meta/WORKFLOW.md` → DELEGATION 2행 + WORKFLOW §5·다이어그램에 등장.

**커밋**: `docs: propagate validate-milestone across README/STRUCTURE/DELEGATION/WORKFLOW rosters`

---

# Phase 9 — stabilize preflight에 skill 로스터 fan-out 정합 체크 (재발방지)

> 최근 결함 다수가 "한 곳엔 반영, 형제 로스터엔 미반영" 패턴(README 두 목록·STRUCTURE·DELEGATION). 신규 skill이 모든 로스터에 일관 등재됐는지 deterministic하게 검사해 재발을 막는다. 기존 SSOT(STRUCTURE 로스터 + ADR-010#amend-3 README 목록)를 집행하는 것이므로 새 정책이 아니다.

### 9.1 `.claude/skills/stabilize-milestone/SKILL.md` — preflight에 7번 추가
**기존**:
```
6. **고-stakes 설계 근거 누락 (ADR-053 backstop, best-effort)**: ARCHITECTURE_OVERVIEW `## 7`의 *실제 작성된*(HTML 주석 placeholder 제외) 결정 블록에서 필수 칸(옵션≥2/신뢰도/재검토)이 비면 `P2 [Design-rationale] <위치>` 기록. **한계**: 고-stakes 결정을 한 줄 산문으로 쓴 경우는 못 잡음(휴리스틱).
```
**수정**:
```
6. **고-stakes 설계 근거 누락 (ADR-053 backstop, best-effort)**: ARCHITECTURE_OVERVIEW `## 7`의 *실제 작성된*(HTML 주석 placeholder 제외) 결정 블록에서 필수 칸(옵션≥2/신뢰도/재검토)이 비면 `P2 [Design-rationale] <위치>` 기록. **한계**: 고-stakes 결정을 한 줄 산문으로 쓴 경우는 못 잡음(휴리스틱).

7. **Skill 로스터 fan-out 정합 (cross-doc, deterministic — ADR-010#amend-3 README SSOT + STRUCTURE 로스터 정합 집행)**:
   - `.claude/skills/*/` 디렉터리명 집합 ↔ `docs/00-meta/STRUCTURE.md`의 `Claude skill 본문` 행 괄호 목록이 일치하는가. 불일치 시 `P1 [Roster-drift] <skill> — STRUCTURE 로스터`.
   - `README.md`/`README_ko.md`의 *자연어 호출 skill 목록 두 곳*(정책 요약 문단의 "Remaining skills/나머지 skill" + "For remaining skills/나머지 skill(...)" 명시 목록)이 서로 일치하고, `(.claude/skills 집합) − (.agents/skills wrapper 집합)`과 같은가. 불일치 시 `P1 [Roster-drift] <skill> — README 자연어 목록(<어느 위치>)`.
   - **cross-LLM 리뷰 skill 등재 (D3 재발 지점, deterministic)**: `validate-plan`·`validate-discovery`·`validate-milestone` 각각이 `docs/00-meta/DELEGATION_STRATEGY.md` 위임 표에 등장하는가(skill 이름 grep). 미등재 시 `P2 [Roster-drift] <skill> — DELEGATION 위임 표`.
   - 발견은 IMPROVEMENT_GUIDE에 기록(보고만 — 차단 X). **한계**: WORKFLOW 산문 흐름 등재는 본 grep 범위 밖(reviewer 위임이 보조 catch).
```

**검증**: `grep -n "Roster-drift" .claude/skills/stabilize-milestone/SKILL.md` → 3건(STRUCTURE/README/DELEGATION). preflight 번호가 1~7로 이어지는지 확인.

**커밋**: `feat(stabilize): add skill-roster fan-out consistency preflight check`

---

# 최종 검증 체크리스트 (전체 완료 후)

- [ ] **Phase 1**: implement-workitem step 4·공유리소스 불릿에 STACK_SETUP_PLAN 회수/신호 2건 + builder.md "충돌 신호는 foreman에 보고" 0건 + ADR-051 amend-1 item2 dispatch-전 신호 명시.
- [ ] **Phase 2**: reviewer.md Milestone-Plan 블록에 milestone-mode 게이팅(FAC 반전·3차원 비활성) 1줄.
- [ ] **Phase 3**: plan-milestone R4에 `## 3`/`## 10` 채움 + 종료 분기에 `/validate-plan <M>` 안내.
- [ ] **Phase 4**: bootstrap-project step3·bootstrap-stack step4(architect sub-call)에 ADR-053 게이트 교차참조 각 1건.
- [ ] **Phase 5**: validate-milestone에 `default` tag 규칙 + 다중 리뷰어 권장 + stabilize 층 라벨 축 + Codex 자연어 호출 표기(`$validate-milestone` 0건).
- [ ] **Phase 6**: repair-milestone step6 보존 가드 + 종료 가드 cross-worktree 안내.
- [ ] **Phase 7**: repair-plan "milestone-plan mode 리뷰" 1건(회수 step에만) — 고아 bullet 제거.
- [ ] **Phase 8**: README ×2 each validate-milestone 2건 + STRUCTURE `SSOT는 boilerplate/README` 0건(ADR-인덱스 포인터 보존) + DELEGATION 2행 + WORKFLOW §5·별도 분기 줄 + ADR-054 결과+Target 갱신.
- [ ] **Phase 9**: stabilize preflight 7번 추가 — Roster-drift 3건(STRUCTURE/README/DELEGATION).
- [ ] 본 `IMPROVE-GUIDE.md` 삭제(작업 완료 후 — 직접).
