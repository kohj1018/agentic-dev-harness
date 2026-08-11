# ADR-057 — 플래닝 v2 (생성 통일 + 배치 분해 + feature 체크포인트 + seam 계약)

> scope: boilerplate

## Status
accepted

## 현재 유효 결정
- M1 포함 모든 마일스톤·feature 문서는 `/plan-milestone`이 최종 프로토타입·FAC·열린 질문을 재대조한 뒤 `ready`로 확정(bootstrap-project는 charter/ARCH까지). task 분해는 `/plan-workitem M<N>` 1회 **전체 계획 스냅샷**(2-tier/draft/refresh·F 입력 폐기 — #amend-3), 코드-stale 방지는 task 실행-시점 경량 접지 확인(근본 충돌은 사용자 보고).
- 상태·잠금(#amend-3): M/F=`draft→ready`; task=`draft→ready→in-progress→done`, 검증된 완료 결함만 repair-workitem이 `done→in-progress`. M/F `ready` 뒤 새 scope·프로토타입·기획 변경은 다음 M. task 계획 repair는 첫 구현 전에만, 구현 뒤 finding은 기존 task 약속 결함=repair / 담당 없음·새 범위=사용자 보고+다음 M(현재 M task 자동 추가 없음).
- 로드맵(#amend-1, #amend-4): `Done/Now/Next/Later`는 `/plan-milestone` 단독 writer, **`## Backlog`만 append-only 다중 writer**(accept-milestone·repair-acceptance). 회수는 R0 → R1.
> **부분 supersede (2026-07-29)**: #amend-3 결정 5의 **(a)(b)(f)** 는 [ADR-060](ADR-060-decision-closure-and-milestone-seal.md) D6/D7/D11이 부분 supersede한다 — (a)(b) M/F는 `draft → contract-ready → ready`이고 `ready` 승격은 `/seal-milestone` 단독이며, (f) 열린 질문의 영속 위치는 `docs/10-charter/DECISION_REGISTER.md`다(milestone `## 7`·feature `## 12`는 폐지). 결정 5(c)(d)(e)·task 상태기계·**결정 6 finding 라우팅**·결정 8~14(seam 계약)는 유효하다. 본 표기는 개정(amend)이 아니라 참조 갱신이다.
- cross-task seam 계약: 신호 4종 감지 시 feature `## 7-2`에 INV 표. cross-feature canonical 위치 = **① 데이터 소유(write-through) → ② 최초 사용 → ③ 낮은 번호(fallback)**(#amend-2가 결정 9의 "낮은 번호 우선"을 이 우선순위로 정정 — 낮은 번호는 최종 fallback으로 잔존).
- **마일스톤 로드맵 SSOT**: `docs/30-workitems/ROADMAP.md`(Done/Now/Next/Later 4구간 + 얇음 규율) — plan-milestone 단독 작성(R3=Now 실체화, R0=graduation 재조정), stabilize는 회고 graduation만 영속(#amend-1).
- 상세는 아래 `## 결정 — A/B` + Amendment 1·2·3·4.

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
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- docs/30-workitems/ROADMAP.md
- docs/20-system/ARCHITECTURE_OVERVIEW.md
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md
- docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md
- docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md
- docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md
- .claude/skills/repair-workitem/SKILL.md
- .claude/skills/repair-milestone/SKILL.md
- .claude/skills/review-doc/SKILL.md
- .claude/skills/bootstrap-design/SKILL.md
- .claude/skills/bootstrap-stack/SKILL.md
- .claude/skills/stack-guard/SKILL.md
- .claude/skills/repair-discovery/SKILL.md
- docs/00-meta/PROJECT_START_CHECKLIST.md
- docs/00-meta/WORKFLOW.md
- docs/00-meta/DELEGATION_STRATEGY.md
- docs/00-meta/STRUCTURE.md

## 참고
- ADR-051(D4 부분 supersede — #amend-3 표기), ADR-026(#amend-2 원칙 유지 + #amend-3 draft 예외), ADR-007(표 갱신 + 텍스트 제안 규약 불변), ADR-050(model-invocable 범위 불변), ADR-056(R5·--prototype·§3-V와의 접점), ADR-037(FAC 커버리지 — seam은 invariant 도출로 보완), ADR-038(Plan Quality 차원 additive 확장), ADR-053(architect sub-call 패턴), ADR-067(graduation은 milestone 전용), ADR-006/ADR-022.

<a id="adr-057-amend-1"></a>
## Amendment 1 (2026-07-26) — 마일스톤 로드맵 SSOT (얇은 forward 지도)

### 배경
- [관측됨] 마일스톤 forward 지도가 없다 — "끝난 것/지금/앞으로"를 한 장에서 못 본다. plan-milestone은 직전 1개만 회고하고, 계획 중 "이 목표는 마일스톤 3개로 쪼개야 한다"는 판단이 `/clear`로 증발해 다음에 처음부터 재계산한다.

### 결정
1. **docs/30-workitems/ROADMAP.md 신설** — 1행=1마일스톤, **Done / Now / Next / Later 4구간(rolling-wave)**, 구간별 맞춤 컬럼(Done: id·`candidate-key`·목표·졸업·주요 기능 / Now: id·`candidate-key`·목표·진척·주요 기능·의존 / Next·Later: `candidate-key` + 목표 1줄 + 확신도 목록). **`candidate-key`는 전 구간 공통 안정 식별자** — Later→Next→Now→Done 승격 내내 *같은 key*를 유지하고 Now/Done에서 id(M-number)를 추가로 발급한다(정체성이 goal-text 매칭에 의존하지 않게; Now/Done도 key를 보존해야 전 구간 추적이 닫힌다). baseline **빈 shell**로 커밋(presence: baseline), plan-milestone이 채운다. **템플릿 파일 없음**(단일 인스턴스 — 스키마는 본 amend + ROADMAP.md 헤더가 SSOT).
2. **단일 작성자 = plan-milestone**: R3는 *지금 착수하는* 마일스톤만 Now 행으로 쓴다(직전 행의 Done 전환은 R3가 강제하지 않는다 — 회고 `graduation:`=YES일 때만 Done이며 그 판정 반영은 R0 재조정이 담당). R2 분할이 식별한 후속 마일스톤은 Next/Later 얇은 행.
   **R0 전이 알고리즘(reconcile — candidate-key로 정체성 유지)**: (a) 직전 Now의 회고 `graduation:`=YES면 그 행을 **Done**으로(candidate-key·id 보존). (b) 착수할 Next 후보(candidate-key로 식별)를 **Now**로 승격하며 id(M-number) 발급 — *같은 candidate-key 유지*(중복 생성 방지·전 구간 추적). (c) 직전 Now가 미졸업(YES 아님)이면 단일-Now 규율상 새 Now 승격을 **보류**(명시적 병렬 승인이 있을 때만 병렬 Now 허용). (d) 마지막 마일스톤 종료(후속 Next 없음)면 Now→Done 후 Now를 비운다. (e) 기존 프로젝트에 로드맵을 처음 도입(backfill)하면 현존 마일스톤에 candidate-key를 부여해 Done/Now로 seed한다. **progress(`task done/total`)는 plan-workitem이 task를 만든 뒤 R0가 갱신하는 *계획-시점 스냅샷*** — 실시간 현황이 아니다(실시간은 task 문서가 SSOT). 그래서 R3 신규 행은 `tasks: unplanned`다.
3. **얇음 규율(성패 관건)**: Next/Later 행은 *`candidate-key`(안정 슬러그) + 목표 1줄 + 확신도만* — 기능·AC·졸업 칸 자체를 만들지 않는다(아직 안 정한 걸 정한 척 = 소설, 오히려 해로움). candidate-key는 R0 재조정이 중복 생성·Now 승격을 매칭하는 유일 안정 식별자(목표 문구가 바뀌어도 고정). M 번호는 Done/Now(실체화)만 발급, Next/Later는 `(M3?)`처럼 잠정. 날짜·%·story point 기본 제외. Now 기본 1개(병렬 마일스톤은 명시 결정 시만).
4. **stabilize-milestone 읽기 전용 유지**: 로드맵 파일을 직접 건드리지 않는다. graduation 판정(`YES|NO|BLOCKED (날짜)`)만 마일스톤 `## 8. 회고`에 영속하고(ADR-067 D3 회고 스키마 동반), 다음 plan-milestone R0가 그것을 읽어 로드맵을 재조정한다.
5. **repair-plan은 로드맵을 건드리지 않는다**(단일 작성자 유지 — 다음 R0 재조정이 흡수). **validate-plan은 로드맵 drift 전용 차원을 신설하지 않는다**(요약 지도라 R0 재조정이 흡수 — 미러·카운트 비용 회피).
6. **로드맵=요약 / 각 Mx=상세 SSOT** — 링크만, 내용 복제 금지. 지킬 수 없으면 "존재하는 것만 표시(생성 전용)"로 후퇴.

### 적용 surface
- docs/30-workitems/ROADMAP.md
- .claude/skills/plan-milestone/SKILL.md
- .claude/skills/stabilize-milestone/SKILL.md
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md
- docs/00-meta/STRUCTURE.md
- docs/00-meta/WORKFLOW.md

### 강도 (ADR-022)
- enabling(약) — 얇음 규율이 전부. 작성자 1명·기존에 이미 읽는 정보라 부담 최소.
- **D6 override (ADR-045)**: 본 amend는 surface 6개 + R3 의미 변경(모든 마일스톤 실체화 → Now만)이라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-057 통합 재발행. (ADR-057은 grandfather 아님 — 2026-07-16 생성.)
- **Mutation delta (ADR-047 D3)**: failure=로드맵 drift·중복 마일스톤 생성 / falsifier=candidate-key 미보존으로 같은 목표가 중복 마일스톤으로 재생성 / rollback=ROADMAP.md·R0/R3 배선 제거.

<a id="adr-057-amend-2"></a>
## Amendment 2 (2026-07-26) — cross-feature seam canonical 위치 규칙 (소유 우선)

### 배경
- [관측됨] SIMULATION_RUN Round 4 — 비대칭 seam(한 feature가 write-through 소유)에서 결정 9의 "낮은 번호 feature canonical" 규칙이 *관련 거의 없는* 낮은 번호 feature에 INV를 배치해 "왜 이 규칙이 여기 있지?" 가독성 역전을 낳았다.

### 결정
결정 9의 cross-feature invariant canonical 기재 위치 *규칙을 정정한다* — 소유·최초사용 우선순위를 앞에 추가하고 기존 "낮은 번호"는 최종 fallback으로 **강등**한다. **비대칭 seam에서 canonical 위치가 낮은번호→소유자로 바뀌므로 "충돌 없는 확장"이 아니라 정정**이다(그래서 D5 `## 현재 유효 결정` 요약 의무 트리거 — 본 ADR `## 현재 유효 결정`과 정합). ADR-057은 이미 §거버넌스의 intentional override 대상이라 이 정정도 minimal-churn amend로 처리한다(D6 재발행 대신 amend — 근거: 이번 라운드 결정, 다음 변경 시 통합 재발행). 정정된 규칙: **① 그 데이터를 실제 소유(write-through)하는 feature → ② 애매하면 최초 사용 feature → ③ 그래도 불명확하면 낮은 번호 feature(기존 결정 9의 규칙 — 결정적 fallback)**. 상대 feature `## 7-2`엔 참조 링크 1줄만(SSOT 중복 금지 — 불변). 소유가 명확할 때만 ①, 불명확하면 ③으로 결정적 판정(도구가 위치를 찾을 수 있게 기계적 판정 가능성 유지).

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md

### 강도 (ADR-022)
- enabling(약) — 가독성 개선, 기능 불변.
- **Mutation delta (ADR-047 D3)**: failure=cross-feature seam이 양쪽 feature에 중복 canonical(SSOT 소실) / falsifier=소유 우선 위반해 seam이 2곳에 기재 / rollback=소유 우선 규칙 제거(base 결정 9 낮은-번호 우선 복귀).

<a id="adr-057-amend-3"></a>
## Amendment 3 (2026-07-26) — plan-workitem 전체 계획 스냅샷 (2-tier/draft/refresh 전면 폐기 · 마일스톤 단위 계획 잠금)

### 배경
- [관측됨] 사용자 운영 요구 = 최종 합성 화면 + **마일스톤 단위 전체 계획**. 결정 2/3/4의 2-tier(첫 feature만 `## 3` full, 나머지 `## 3 상태: draft` + `F-NNN --refresh` 요구 + implement 진입 draft 하드스탑)는 (a) 사용자에게 feature 단위 재호출을 강제하고, (b) "나머지 feature `## 3`를 미리 draft로 써 두고 구현 직전 refresh"라는 *지연-계획*이라 — 이미 쓴 draft가 앞 feature 구현으로 stale해지는 위험을 그대로 안는다. 완전 스냅샷도 JIT도 아닌 어정쩡한 중간이다.

### 결정
결정 2/3/4의 2-tier/draft/`F-NNN --refresh` 메커니즘 + 결정 5의 feature-완료 refresh 체크포인트 + 결정 7의 단일 feature 조망 echo를 **supersede**하고, **재계획(refresh) 기능 자체를 두지 않는다**(결정 6 `--feature F-NNN` stabilize 스코프는 계획이 아니라 검사 범위라 유지).
1. **전체 계획 스냅샷 (계획 후 잠금)**: `/plan-workitem M<N>` **1회 실행으로 전 feature의 task·`## 3`·AC·FAC↔AC·PX↔AC를 완성**한다(계획 시점 전체 스냅샷). `## 3 상태: draft` tier·feature별 `F-NNN` 직접 입력·`F-NNN --refresh`·`M<N> --refresh`를 **모두 폐기**한다. 사용자-facing 진입은 **`/plan-workitem M<N>` 하나뿐**(내부 feature별 순차 authoring은 허용 — 사용자 재호출 강제 없음). 이후 lifecycle: 의존성 순서대로 implement → validate → (실패 시만) repair → validate → finalize, 마지막에 `/stabilize-milestone M<N>`.
2. **후행 task는 선행 task의 계획된 완료 결과를 전제로 작성**: 전 task를 한 번에 상세히 만들므로, 후행 task의 `## 3`·AC는 *선행 task가 무엇을 보장할지*(계획에 이미 적힌 완료 결과·AC·인터페이스)를 전제로 작성한다(예: `T-002`가 `T-001`이 만들 인증 인터페이스를 사용, `T-003`이 `T-002`가 만들 세션을 전제). 이래야 refresh 없이 후행 계획이 성립한다.
3. **코드-stale 근거 → 실행-시점 경량 접지 확인 (재계획 아님)**: base 결정 3의 목적(계획이 구현 시점 실제 코드와 어긋나지 않게)은 폐기하지 않되, draft 지연-계획이 아니라 **task 실행 직전 implement-workitem의 경량 접지 확인**으로 옮긴다. 일반 오류(테스트 실패·타입 오류·구현 누락·프로토타입 불일치·작은 내부 구현 차이)는 **repair**(또는 AC·범위 안 처리)로 다룬다. 정말로 기존 M<N> 계획대로 구현할 수 없는 *근본* 충돌이 드러나면 에이전트가 임의로 계획을 바꾸지 않고 **사용자에게 중단·보고**한다(자동 refresh 없음 — 예외적 사용자 결정). base 결정 4 + `ADR-026#amend-3`의 `## 3 상태: draft` 하드스탑도 이 접지 확인으로 대체 — ADR-026는 별도 정정 amendment(**amend-4**, §4.5c)로 supersede.
4. **프로토타입·기획 변경은 다음 마일스톤**: 마일스톤 확정 후 새 기능·프로토타입 변경·기획 변경은 M<N> 계획을 다시 고치는 게 아니라 **M<N+1>에 넣는다**(마일스톤 경계가 곧 계획 잠금 경계 — 화면 revision·retire·재승인 재동기 불요). 프로토타입 반복은 `/plan-milestone M<N>` 내부(R5-3 사용자 피드백 루프)에서 최종 승인까지 끝낸다. 선택적 `validate-plan`→`repair-plan`은 첫 구현 전에 **plan-workitem 산출물(task·매핑·의존성)의 결함만** 고칠 수 있다(M/F scope·FAC·프로토타입·PX 변경 아님). 구현이 시작되면 이 수정도 잠그고, 이후 변경은 사용자 중단·보고 또는 다음 마일스톤으로 보낸다.
5. **잠금 상태기계 (`draft → ready → in-progress → done` — 정상 경로 우선, cross-session 강제)**: 문서 `## 0. Status`로 정상 lifecycle만 강제한다. (a) `/plan-milestone M<N>`은 `draft` M에서 동작하고, 확정 재대조 통과 시 **먼저 산하 feature를 `ready`로, 마지막에 M을 `ready`로** 전환한다(승격 중 중단 대비 — M `ready`면 전부 `ready` 보장). M·feature는 **`draft → ready`만** 쓴다. 새 feature·상위 scope·FAC·프로토타입·PX 변경은 `ready` 이후 자동 재개방하지 않고 다음 마일스톤이 기본이며, 현재 M으로 진행 자체가 불가능한 P0면 임의 역전이 없이 사용자에게 중단·보고한다. (b) `/plan-workitem M<N>`은 M과 산하 feature가 모두 `ready`일 때만 동작한다. 최초에는 전 task를 `draft`로 만들고, 전 M 계획 + `[Plan-dep]` + self-check 성공 후 모든 task를 `ready`로 승격한다. 파일 순차 쓰기 중 끊겨 `ready`/`draft`가 섞였고 **모든 task 상태가 여전히 `draft|ready`**이면 같은 `/plan-workitem M<N>` 재실행이 전체를 재검증하고 남은 `draft`만 승격한다. **`ready → draft` 자동 역전이는 두지 않는다**: `ready` 문서가 불완전하거나 plan review가 task·매핑 결함을 찾으면 첫 구현 전에 `/repair-plan`이 문서를 직접 고치고 전체 self-check를 다시 통과시킨다. 상위 M/F/prototype P0는 자동 복구하지 않고 사용자 결정으로 넘긴다. (c) `/implement-workitem`은 **① 같은 M에 `draft` task 없음, ② 대상 task가 `ready`(신규) 또는 `in-progress`(재개), ③ 선행 task가 모두 `done`이고 약속한 산출도 존재, ④ 부모 M·feature가 모두 `ready`**인지 확인한다. 상태·접지 preflight를 모두 통과한 뒤 dispatch 직전에만 `ready → in-progress`를 기록한다. preflight가 순서 대기·선행 repair·사용자 보고로 끝나면 신규 대상은 `ready`를 유지한다. (d) task 하나라도 상태가 `draft|ready` 밖(`in-progress`·`blocked`·`done`·`deprecated`)이면 구현이 시작됐거나 종료된 것으로 보아 `/plan-workitem`·`repair-plan`이 계획을 변경하지 않는다. 전 task가 `ready`+완결이면 `/plan-workitem` 재실행은 read-only no-op다. `blocked`·`deprecated`는 기존 WORKFLOW의 예외 상태지만 본 amend가 새 writer/복구 전이를 만들지 않으며, 발견 시 사용자에게 보고한다. (e) task의 유일한 **본 amend 추가 역전이**는 검증된 완료 결함에 대한 `done → in-progress`다. 실제 task writer인 `/repair-workitem`만 4-판정에서 Adopt/Adopt-modified가 하나 이상일 때 첫 수정 직전에 재개방한다. `/repair-milestone`은 status를 쓰지 않고 task 결함을 `/repair-workitem`에 위임한다. 전부 기각이면 `done` 유지, 재개방 뒤 중단·실패면 `in-progress` 유지, fresh validate 통과 뒤 `/finalize-workitem`이 다시 `done`으로 커밋한다. (f) 열린 질문은 milestone `## 7`·feature `## 12`에 미해결 항목만 영속하고, 하나라도 있으면 M/F 또는 task의 `ready` 승격을 막는다. 해결 시 행을 제거하며, 이력은 메모·결정 이력에 남긴다.
6. **잠금 뒤 finding 라우팅 (현재 M task 자동 추가 금지)**: 구현 시작 뒤 발견사항은 종류로만 나눈다. (a) 현재 M의 기존 task·AC가 이미 약속한 동작의 결함이면 그 task의 `/repair-workitem`으로 고치고, 여러 task에 걸치면 `/repair-milestone`이 조정한다. (b) 담당 task가 없거나 새 기능·새 정책·큰 구조 변경이면 현재 M에 task를 끼워 넣지 않고 사용자에게 사실·영향을 보고해 **다음 `/plan-milestone M<N+1>` 후보**로 보낸다. (c) 어느 쪽인지 불명확하거나 현재 M 진행을 막는 상위 P0면 자동 선택하지 않고 사용자를 기다린다. `review-doc`·validator·stabilize·bootstrap/stack 안내도 이 분기를 사용하며, generic `/plan-workitem <id>`·"다음 plan-workitem이 후속 task 생성" 문구를 두지 않는다.
D5상 `## 현재 유효 결정`의 plan-workitem 진입 줄도 이 M 단위 전체 스냅샷(refresh 없음)으로 갱신.

**잠금 경계 명시**: M/F의 `ready`는 plan-milestone 소유 필드(scope·시나리오·FAC·프로토타입·PX)를 잠근다는 뜻이다. plan-workitem이 나중에 채우도록 예약된 feature `## 7-1`/`## 7-3` 매핑 shell·새 task 문서와, task 승격을 막는 **미해결 질문을 M `## 7`/feature `## 12`에 기록·해결 후 제거하는 것**은 잠금 위반이 아닌 coordination write다. 첫 구현 전 repair-plan은 task·매핑·의존성 결함만 고칠 수 있다. 이 경계를 넘어 M/F/prototype을 바꾸는 것은 자동 repair 대상이 아니다.
**열린 질문 게이트의 시점**: plan-milestone 중 발견된 미해결 질문은 M/F `ready`를 막는다. M/F가 `ready`가 된 뒤 plan-workitem이 새로 발견한 질문은 M/F를 `draft`로 되돌리지 않고 **task `ready` 승격만** 막는다. 질문은 같은 M/F 열린 질문 섹션에 영속하고, 해결·행 제거 후 같은 `/plan-workitem M<N>` 재실행이 task 승격을 완료한다.

### 적용 surface
- .claude/skills/plan-workitem/SKILL.md (argument-hint·배치·`--refresh`/`F-NNN` 제거·`## 3` 상태 요약 출력·마지막 출력)
- .claude/skills/plan-milestone/SKILL.md (`--retire-screen`·재승인 refresh 안내 제거 — 프로토타입 변경은 다음 마일스톤)
- .claude/skills/implement-workitem/SKILL.md (3-R `draft` 하드스탑 → 경량 접지 확인, 근본 충돌 시 사용자 보고)
- docs/30-workitems/_templates/TASK_TEMPLATE.md (`## 3` draft 마커 언어 제거)
- .claude/skills/finalize-workitem/SKILL.md (다음-단계 refresh/F-NNN 제거 — §4.12c; `in-progress → done` 입구 게이트 — §4.12d g)
- .claude/skills/stabilize-milestone/SKILL.md ([Spec-gap] F-NNN 재계획 경로 정리 — §4.12c)
- docs/00-meta/WORKFLOW.md (계획 진입 줄 2-tier/refresh 제거 — §4.12c)
- docs/00-meta/DELEGATION_STRATEGY.md (7.5 feature refresh 제거 — §4.12c)
- docs/00-meta/PROJECT_START_CHECKLIST.md (F-NNN 단일 제거 — §4.12c)
- docs/00-meta/STRUCTURE.md (프로토타입 producer의 `--prototype` 재진입 표기 제거 — §4.12c)
- docs/90-decisions/boilerplate/ADR-007-workitem-lifecycle.md (lifecycle 표 정정 — §4.12c f)
- docs/90-decisions/boilerplate/ADR-051-main-session-orchestration-and-wave-removal.md (amend-3 단일 feature 문구 정정 — §4.12c j)
- .claude/skills/repair-milestone/SKILL.md (다음 액션 `M<N>` 전체 + per-task 결함은 status를 직접 쓰지 않고 repair-workitem 위임 — §4.12c h·§4.12d h)
- .claude/skills/repair-plan/SKILL.md (첫 구현 전 ready 문서 제자리 수정·self-check, 미완 시 review 파일 보존, 구현 시작 후 변경 거부 — 결정 5d, §4.12d)
- .claude/skills/repair-workitem/SKILL.md (검증된 결함 시 `done → in-progress` 재개방 — §4.12d h)
- docs/30-workitems/_templates/MILESTONE_TEMPLATE.md·FEATURE_TEMPLATE.md (`## 0. Status` `draft → ready` 단방향 — 결정 5, §4.12d)
- .claude/agents/reviewer.md·.claude/skills/validate-plan/SKILL.md (`[Plan-dep]` 차원 — §4.12d f)
- .claude/agents/validator.md·.claude/skills/validate-workitem/SKILL.md (unmapped FAC 자동 task 추가 권장 제거·사용자 결정 — ADR-037#amend-3, §4.5d)
- .claude/skills/review-doc/SKILL.md (문서 finding의 현재-M 후속 task 자동 생성 제거 — 결정 6, §4.12c n)
- .claude/skills/bootstrap-design/SKILL.md·bootstrap-stack/SKILL.md·stack-guard/SKILL.md·repair-discovery/SKILL.md (다음 단계의 generic plan-workitem 안내를 M 단위·잠금 경계에 맞춤 — 결정 6, §4.12c n)
- docs/90-decisions/boilerplate/ADR-037-spec-coverage-audit.md (Amendment 3 — §4.5d)
- (별도 amendment) docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md — `## 3` SSOT는 ADR-026#amend-4(§4.5c)가 정정

### 강도 (ADR-022)
- enabling(약)이나 base 메커니즘 supersede라 실질 변경. 자동 차단은 늘리지 않는다(preflight는 안내·중단이지 자동 재계획 아님).
- **D6 override (ADR-045)**: 본 amend는 surface 15+개(2-tier/draft/refresh 폐기 + `draft→ready→in-progress→done` 잠금 상태기계·`[Plan-dep]`가 plan-milestone·plan-workitem·implement·finalize·stabilize·repair-milestone·repair-plan·repair-workitem·validate-plan·validate-workitem·validator·reviewer·WORKFLOW·DELEGATION·CHECKLIST·MILESTONE/FEATURE/TASK_TEMPLATE·ADR-007·ADR-037·ADR-051 전반; `## 3` SSOT는 ADR-026#amend-4, unmapped FAC 실행 후 라우팅은 ADR-037#amend-3)라 D6상 통합 재발행 대상이나, 이번 라운드는 minimal-churn으로 amend 처리한다 — 근거: 이번 개선 라운드 결정, 다음 변경 시 ADR-057 통합 재발행. (ADR-057은 grandfather 아님 — 2026-07-16 생성.)
- **Mutation delta (ADR-047 D3)**: failure=사용자가 여전히 `F-NNN`/`--refresh` 재호출 강제 · `## 3 상태: draft` task가 stale인 채 구현됨 · preflight 전 task를 `in-progress`로 기록 · `blocked`/`done` task가 있는데 계획 수정 허용 · repair-milestone이 task status를 직접 변경 · 구현 뒤 finding을 generic plan-workitem이 현재 M 새 task로 생성 · 에이전트가 근본 충돌을 사용자 보고 없이 임의 재계획 / falsifier=runtime surface에 `draft`/`F-NNN`/`--refresh`/`Needs Plan Refresh`/generic 후속 plan-workitem 잔존, 정상 경로에 `ready→draft` 자동 역전이 존재, 또는 plan-workitem/repair-plan 잠금이 `draft|ready` 밖 상태를 놓침 / rollback=2-tier/draft/refresh·draft 하드스탑 복원.

<a id="adr-057-amend-4"></a>
## Amendment 4 (2026-08-11) — ROADMAP `## Backlog` 구간 + 구간별 writer 규약

### 배경
- [관측됨] `/accept-milestone` 수용 라운드의 «계약 변경»(방향 변경·새 기능)이 `DECISION_REGISTER`에 `status: open`으로 쌓인다. 그런데 그 항목은 **아무것도 막지 않는다** — 원장의 유일한 강제력인 봉인 차단이 불필요한 종류다. 차단이 필요 없는 항목이 원장에 누적되면 `/seal-milestone` 조건 6과 `/plan-milestone` R1 triage가 매 라운드 무거워진다(원장 자신의 «얇게 유지하는 규칙» 정합).
- [관측됨] 「다음에 무엇을 할까」가 원장·ROADMAP·IMPROVEMENT_GUIDE 세 곳에 흩어져 한 장에서 보이지 않는다.

### 결정
1. **`ROADMAP.md`에 `## Backlog` 구간을 신설한다** — 마일스톤 미배정 후보를 담는다. Done/Now/Next/Later와 같은 **얇음 규율**을 따르되 `출처` 한 칸을 더 갖는다.
   ```
   - `<candidate-key>` <목표 1줄> — 출처: <어디서 나왔나> / 확신도: <높음/중간/낮음>
   ```
2. **writer 규약은 구간별로 갈린다.** `Done`/`Now`/`Next`/`Later`는 **`/plan-milestone` 단독**(#amend-1 결정 2 불변 — candidate-key 기반 중복 생성·Now 승격 매칭이 그 규약에 의존한다). **`## Backlog`만 append-only 다중 writer**를 허용한다 — `/accept-milestone`(R5 계약 변경)·`/repair-acceptance`(`Out-of-contract`). 이들은 **행을 추가만 하고 다른 구간을 건드리지 않는다.**
   - 근거: 앞 네 구간은 *계획 산출물*이라 단독 writer가 필수이고, Backlog는 *입력 수집함*이라 여럿이 넣어도 중복 마일스톤 생성 위험이 없다.
3. **회수·정리는 `/plan-milestone`이 한다** — R0가 `## Backlog`를 회수해 R1의 재료로 합류시키고, 사용자가 착수를 결정하면 **Next로 승격하며 Backlog 행을 제거한다**(candidate-key로 매칭 — #amend-1 결정 2의 R0 전이 알고리즘 그대로). **다른 원장에서 재분류해 넘어오는 항목을 `## Backlog`에 등재하는 것도 이 skill이 한다**(R1 — 원본을 닫는 일과 등재를 한 트랜잭션으로 묶어야 [ADR-005](ADR-005-ssot.md)#amend-1의 N-2가 지켜진다). 즉 `## Backlog`의 writer는 결정 2의 두 append-only skill + 본 skill 셋이다.
4. **`deferred` 이관 앵커와의 관계**: `DECISION_REGISTER`의 `deferred` 항목은 여전히 ROADMAP candidate-key를 앵커로 쓴다(원장 «이관 앵커 종류» 표 불변). 차이는 «원장에 항목이 남는가»다 — `deferred`는 한때 `open`이었던 승인 이력이라 원장에 남고 ROADMAP에는 앵커만, `## Backlog`는 애초에 미결정이었던 적이 없어 원장에 들어가지 않는다.
5. **원장 5종의 배타적 기록 범위**는 [ADR-005](ADR-005-ssot.md)#amend-1이 소유하고 표 본문은 `docs/00-meta/STRUCTURE.md`의 `## Canonical Owner 매핑`이 갖는다. 본 amend는 ROADMAP 쪽 구조만 정한다.

### 강도 (ADR-022)
- **enabling(약)** — 구간 1개 신설 + append-only 예외. 얇음 규율은 그대로 적용된다.

### Mutation delta (ADR-047 D3)
- failure = 차단 불요 항목이 원장에 누적돼 봉인 검사·triage가 무거워짐 / 「다음에 할 것」이 세 곳에 흩어짐
- falsifier = Backlog에 마일스톤 단위가 아닌 항목(코드 조각)이 쌓이거나, append-only 예외가 Done/Now/Next/Later 오염으로 번지면 결정 2를 재조정
- rollback = `## Backlog` 구간 제거 + accept-milestone·repair-acceptance 라우팅을 원장으로 복귀

### 적용 surface
- docs/30-workitems/ROADMAP.md
- .claude/skills/plan-milestone/SKILL.md (R0 회수 · R1 재료 · Next 승격 시 제거)
- .claude/skills/accept-milestone/SKILL.md (R5 계약 변경 목적지)
- .claude/skills/repair-acceptance/SKILL.md (`Out-of-contract` 목적지)
- docs/10-charter/DECISION_REGISTER.md (등재 범위 제외 1행)
- docs/00-meta/STRUCTURE.md (산출물 표 writer 갱신)
