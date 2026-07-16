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
   - **멱등(재개 안전)**: 분해가 *완결된* feature는 skip하고 이어간다 — 배치 세션이 중간에 끊겨도 재실행이 안전하다. skip 판정은 task 문서 존재만이 아니라 완결 기준(전 task `## 6` AC 존재 + feature `## 7-1` 매핑 완성)으로 한다 — 부분 생성 feature를 통째로 skip하면 task가 유실된다.
   - **사이즈 가드**: feature 5+ 마일스톤은 배치를 2회로 분할 실행 권장(컨텍스트 소진으로 인한 부분 완료가 최빈 실패 모드).
   - 기존 `/plan-workitem F-NNN`(단일 feature full 분해)은 그대로 유지(마일스톤 중간 feature 추가 등).
3. **`--refresh F-NNN`**: 해당 feature task들의 `## 3`만 그 시점 실제 코드 기준으로 재접지(JIT read)하고 draft 마커를 제거한다. 협상·AC 재작성 없음(경량). repair 이력(`## 8. 메모`)과 승인 프로토타입 갱신을 반영. + 재접지로 write 대상·2차-write·전이가 배치 추정과 달라지면 그 feature 관련 seam(§7-2 invariant) 유효성을 재점검하고 무효 의심 시 surface(자동 수정 X — 결정 9의 배치 draft 사각 보정).
4. **`Needs Plan Refresh` 하드스탑**: `/implement-workitem`은 task `## 3`에 draft 마커가 있으면 dispatch 전에 종료하고 `--refresh`를 안내한다(`Needs Plan Decision` 동형). refresh를 잊어도 stale 가이드로 구현하는 사고가 원천 차단된다.
5. **feature-완료 체크포인트**: `/finalize-workitem`이 status 갱신 후 sibling task를 회수해 해당 feature의 전 task가 done이면 출력에 Feature-완료 블록을 추가 — (a) FAC closure 요약(feature `## 7-1`의 각 매핑 AC가 최신 validation report에서 ✅인지; report 부재는 "확인 불가" degrade), (b) 다음 단계 제안(남은 미-refresh feature의 `--refresh`, 또는 `/stabilize-milestone M-N --feature F-NNN`). 텍스트 제안만 — disable-model-invocation 정책 불변.
6. **`/stabilize-milestone --feature F-NNN` 스코프**: preflight는 FAC unmapped만(**해당 feature `## 7-1` 한정** — 뒤 feature FAC 미포함), task-done 점검은 해당 feature 한정(뒤 feature 미완료로 종료 금지), graduation pre-check skip(졸업 판정은 milestone 전용임을 출력에 명시), validate 1회 + qa fan-out·3-P·§3-V(ADR-056)를 해당 feature 화면·시나리오 한정(qa 결과는 6-S self-synthesis로 QA_FINDINGS에 종합 — reviewer(5)·6·6.5·7·7-T는 skip). QA_FINDINGS는 기존 `### P0/P1/P2` severity 스키마를 유지하고 각 항목 문두에 `(F-NNN)` scope 태그만 붙인다(별도 `### F-NNN` 헤더 금지 — graduation P0 카운트·repair-milestone 회수가 severity 섹션 스키마를 소비). read-only·실행 single-origin(ADR-054) 불변.
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
