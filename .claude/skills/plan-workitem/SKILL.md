---
name: plan-workitem
description: 입력 마일스톤의 전 feature를 task로 분해하고 전 AC·매핑을 1회 완성 (milestone·feature 문서 *생성*은 plan-milestone 담당 — ADR-050/ADR-051). Claude Code plan 모드와 다름 — task 분해기. `M<N>` 입력 시 마일스톤 전체 계획 스냅샷(ADR-057#amend-3).
argument-hint: "<milestone-id>"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write Edit Agent
---

너의 역할은 입력 마일스톤 `M<N>`의 *전 feature*를 task로 분해하고 그 AC를 각 feature `## 7-1`에 채우는 것이다. milestone·feature 문서 *생성*은 `/plan-milestone` 담당이며, 본 skill은 *이미 존재하는* feature 문서를 입력으로 받는다.

입력:
- `$ARGUMENTS`에는 마일스톤 ID `M<N>`만 받는다 — **`F-NNN` 단독 입력은 거부**(`'M<N>' 단위로 실행` 안내 후 종료). 내부 feature별 순차 처리는 `M<N>` 실행 *안*에서만. milestone 문서가 부재하면 `/plan-milestone`를 먼저 안내하고 종료한다(milestone·feature 문서를 본 skill이 새로 만들지 않는다).
  - **입구 상태 확인 (ADR-060 D6)**: (i) **M과 산하 feature가 모두 `## 0. Status: contract-ready`**인지 — `draft`(plan-milestone 미완)면 "plan-milestone으로 계약 확정 먼저" 안내 후 종료; `ready` **이고 마일스톤 `## 10`에 `- 봉인일:`이 채워졌으면** "봉인 완료 — 계획 잠금. 변경은 다음 M<N+1>" 안내 후 종료; `ready`인데 **`## 10`이 부재·미채움이면 마이그레이션 대상**이므로 거부하지 말고 `/seal-milestone M<N>` 실행을 안내한다(ADR-060 D12); (ii) 그 M의 task가 하나라도 `draft` 밖(`ready`·`in-progress`·`blocked`·`done`·`deprecated`)이면 계획 변경을 거부한다. 모든 기존 task가 `draft`일 때만 상태별 분기: **(A) task 0건(최초 실행) → 전 feature task를 `draft`로 생성하며 `## 3`·AC·`## 9`·FAC↔AC·(UI)PX↔AC를 작성**; **(B) `draft` task 존재 → 미완 작성분을 이어서 채운다**(기존 task ID 유지, 중복 생성 금지); **(C) 전 task `draft`+완결 → read-only no-op + `/seal-milestone M<N>` 안내**. **본 skill은 어떤 상태도 승격하지 않는다** — task는 전부 `draft`로 남고 `ready` 승격은 `/seal-milestone` 단독이다(ADR-060 D7).
  - **계약 수정 마커 확인 (ADR-060 D6)**: feature 문서에 `- 계약 수정: <날짜> — 이 feature의 task 재검증 필요` 마커가 있으면 그 feature를 **완결로 보지 않고** 재검증한다(FAC/시나리오 의미가 바뀌었는데 ID·매핑이 그대로라 skip되는 stale task 차단). 재검증 후 마커를 제거한다.
- **경험 계약 입구 점검 (ADR-056 결정 3 / ADR-007#amend-5)**: 입력 feature가 **UI 확정**(ADR-027#amend-3)인데 (a) feature 문서 `## 7`에 `프로토타입:` 참조도 없고 (b) `프로토타입 면제: <사유>` 기록도 없으면 — **이 M은 확정 계약이 불완전하므로 task 0건 상태로 중단한다. 같은 draft `/plan-milestone M<N>`에서 프로토타입/면제를 완성한 뒤 다시 `/plan-workitem M<N>`**으로 안내한다. `contract-ready` M에서 발견되면 같은 draft `/plan-milestone M<N>`에서 계약을 완성한 뒤 재실행한다. 봉인 완료(`ready` + receipt) M에서 발견되면 자동 재호출하지 말고 상위 P0로 사용자에게 보고한다. **UI 의심**(status=draft+신호)은 차단하지 않고 경고 1줄만 출력하고 진행(false positive 완충).
- **`M<N>` 입력 — 마일스톤 전체 계획 스냅샷 (ADR-057#amend-3)**: 본 마일스톤 `## 3. 포함되는 기능`의 모든 feature를 **한 번의 실행으로** 완성한다. 내부적으로 feature별 순차 authoring은 허용하되 사용자에게 feature 단위 재호출을 요구하지 않는다.
  - 각 task의 범위/비범위·`## 6` AC·`## 9` 의존성(`T-NNN:AC-M` 참조 — ADR-026#amend-4)·feature `## 7-1` FAC↔AC 매핑·(UI) `## 7-3` PX↔AC·cross-task seam self-check(ADR-057 결정 9 — **마일스톤 전체 task 집합 대상 1회**, cross-feature seam 포함)를 전 feature에 대해 완성한다.
  - `## 3` 단계별 가이드는 **모든 feature**에 대해 3-G로 완성한다. AC 해석 확정(9-1)·경험 계약 입구 점검(ADR-056)은 전 feature 수행.
  - **후행 task는 선행 task의 계획된 완료 결과·AC를 전제로 작성**(ADR-057#amend-3): 전 task를 한 번에 만들므로 후행 task `## 3`·AC는 선행 task가 보장할 인터페이스·완료 결과를 전제로 적는다(후행 계획의 접지를 보장하도록).
  - **멱등**: 완결 feature = 전 task 필수 섹션(`## 3` 구현항목·`## 6` AC·`## 9` 의존성) + feature `## 7-1` FAC↔AC 매핑 + (UI) `## 7-3` PX↔AC + (seam 신호 시) `## 7-2` INV + "남은 미결정 사항" 0건 + **`- 계약 수정:` 마커 부재**가 *모두* 충족된 것만 skip한다. 하나라도 빠지면 *미완결* — 재개 시 **기존 task ID를 유지한 채 이어서 채운다**(부분 문서 재작성·중복 생성 금지). 컨텍스트가 끊기면 *같은 `/plan-workitem M<N>`* 재실행으로 재개(다른 명령·`F-NNN` 아님). feature 5+로 한 번에 못 끝내면 같은 `M<N>` 재실행으로 이어서(‘2회 분할 실행’ = 재개일 뿐 별도 모드 아님). **사이즈 가드**: feature 5+면 2회 분할 실행 권장.
  - **입구 preflight 실패 정책**: 한 feature라도 경험 계약(프로토타입/면제)·상위 계약이 빠지면 *task를 하나도 쓰기 전에* 일괄 중단하고 어떤 feature가 왜 막혔는지 보고한다 — 부분 계획 금지(plan-milestone에서 계약 확정 후 같은 `M<N>` 재실행). *단, 이미 완결된 feature의 멱등 skip은 부분 계획이 아니라 재개다(위).*
- **근거**: 사용자 요구 = 최종 합성 화면 + 마일스톤 단위 전체 계획·잠금(ADR-057#amend-3). 전 feature task를 한 번에 완성하고 코드 접지는 **task 실행 직전 implement-workitem 경량 확인**이 맡는다(§4.12b; 근본 충돌은 사용자 보고).
- **미결정 등재 (ADR-060 D1/D4)**: *사용자가 정하거나 승인해야 할* 미결정이 발생하면 **`docs/10-charter/DECISION_REGISTER.md`에 등재**한다(milestone `## 7`·feature `## 12`는 폐지 섹션이므로 쓰지 않는다). 등재 시 `authority`를 확정하고(D2), `user-*`면 Decision Brief 6블록으로 제시한다(D3, 라운드당 3~5개). 해결되면 `status: closed` + 정본 앵커를 채우고, 미룰 거면 **현재 M 무영향 근거 + 이관 앵커 + 회수 시점 3개를 모두 갖춘 `deferred`**로 바꾼다(3개 중 하나라도 없으면 `open` 유지). **이 M을 `영향:`으로 갖는 `open`이 하나라도 남으면 `/seal-milestone`이 봉인을 거부한다** — 본 skill은 차단하지 않고 미완 사실만 보고한다(승격 권한 없음). 재실행 시 *출력 기억이 아니라 원장을 읽어* 판정한다.
  **원장 대상이 아닌 것**: 품질·형식 지적(raw hex·컴포넌트 중복·voice 위반·use-case 상태 누락)과 계획 결함(unmapped FAC/PX·미커버 전환 path·AC 해석 후보·부채 회수 후보·새 의존성 도구)은 **기존 "남은 미결정 사항" 출력 슬롯에 그대로** 둔다(ADR-060 D1 등재 범위 — 원장은 결함 추적기가 아니다).

**추가 — 의존성 계약(`## 9`) 정밀화 (ADR-057#amend-3 후행-task 전제 배선)**: 전체 스냅샷이라 후행 task는 선행 task의 *계획된* 완료 결과를 전제로 쓴다. plan-workitem이 `## 9. 의존성`을 채울 때 **선행을 `T-NNN:AC-M` 단위로 참조**한다(그 task가 보장할 AC/산출 명시 — 후행 `## 3`가 이 결과를 전제로 참조). 배치 시점 self-check에서 **(i) 누락 참조(존재하지 않는 선행 task), (ii) 의존성 그래프 순환, (iii) 후행 `## 3`가 전제한 산출이 선행 task의 참조 AC에 없음** 중 하나라도 있으면 plan-workitem을 성공 종료시키지 않는다(승격은 본 skill 권한이 아니다 — ADR-060 D7). 그 M을 미완으로 두고 원인을 보고하며, 수정 후 같은 M 실행으로 재검증한다. 독립 재확인은 validate-plan/reviewer **[Plan-dep]**(존재성·비순환·AC-보장 모두 P0). *구현 시점 재확인은 §4.12b preflight (c).*

**잔여 문구 정리 — 의존성 설치 line item**: `STACK_SETUP_PLAN.md ## Dependency Tools`는 전체 스냅샷에서 설치 line item을 작성할 때 읽는다.

**확정 후 변경 경계 (ADR-060 D6 / ADR-056#amend-1)**: plan-workitem은 마일스톤 전체 계획 스냅샷의 작성과 멱등 재개만 제공한다. **M이 `contract-ready`인 동안에는 상위 계약(프로토타입·FAC·scope)도 아직 잠기지 않았다** — 분해 중 상위 계약 결함이 드러나면 다음 마일스톤으로 보내지 말고 사용자에게 보고해 `/plan-milestone M<N>` 재개 또는 `/repair-plan M<N>`으로 그 자리에서 고친다. 잠금은 `/seal-milestone`이 `ready`를 부여한 뒤에 발생하며, 그 뒤의 기획 변경은 새 마일스톤(M<N+1>)이다. 구현 중 계획과 *근본* 충돌이 드러나면 자동 재계획하지 않고 **사용자에게 중단·보고**(§4.5b amend-3 결정 3)하며, 일반 오류(테스트·타입·프로토타입 불일치)는 repair한다. 미완 R5는 같은 `/plan-milestone M<N>` 재실행으로 이어간다.

반드시 먼저 읽을 파일:
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md` — *해당 스택 한정 sub-section 만*: `## 7-1` (API 프로젝트), `## 7-2` (CLI), `## 7-3` (백엔드), `## 7-4` (프론트), `## 7-5` (모바일 클라이언트 — ADR-027#amend-8). 비해당 sub-section 은 회수 X (ADR-019 minimal 정합).
- `docs/20-system/DESIGN.md` — *UI 프로젝트 한정*. UI 판정은 **ADR-027#amend-3 "UI 판정 다중신호 절차"** 적용(부재→비-UI / status≠draft→UI / status=draft→추가신호). UI 확정 시 본문 회수 + cross-check 활성, 비-UI/skip 시 사유 echo.
- 입력 `M<N>` 마일스톤 문서 + 그 `## 3. 포함되는 기능`이 가리키는 각 feature 문서(milestone 문서 부재 시 `/plan-milestone` 안내 후 종료)
- `docs/30-workitems/_templates/TASK_TEMPLATE.md` (task 생성 양식 SSOT)

반드시 수행할 일:
1. 입력 feature 문서와 그 상위 milestone 문서를 읽어 범위와 비범위를 파악한다.
2. feature 범위를 *task 단위*로 분해한다. milestone·feature 레벨 신설은 하지 않는다 — feature scope가 한 milestone에 담기 어려울 만큼 크면 `/plan-milestone` 재분해를 출력에 권장한다.
3. 각 task의 범위와 비범위를 명확히 적는다.
3-G. **`## 3. 구현 항목`을 *단계별 구현 가이드*로 작성 (ADR-026#amend-2)**:
   각 task의 `## 3`은 terse 목록이 아니라 *그 문서만 보고 따라 하면 구현이 끝나는* 번호 매긴 절차로 쓴다.
   - 작성 전, 그 task가 *건드릴 실제 파일*을 JIT로 읽는다(대상 파일에 한정 — ADR-019 minimal 정합). 추측이 아니라 *현재 코드/문서의 실제 상태*를 근거로 한다.
   - 각 단계 형식:
     `N. <파일경로[:라인/식별자]> — 현재: <지금 상태 한 줄> → 변경: <정확한 수정 내용(필요 시 before/after 코드·문자열)> → 확인: <어떤 테스트/명령/관찰로 검증>`
   - "X를 적절히 처리한다" 같은 모호 지시 금지 — *어디를, 무엇으로, 어떻게* 바꾸는지 명시.
   - AC(`## 6`)는 여전히 RGR 사이클의 측정 단위다. `## 3` 가이드는 그 AC를 충족시키는 *집행 절차*이고, 각 단계는 가능하면 `(AC-N)` 태그로 대응 AC를 가리킨다.
   - 단계가 5개 파일을 넘으면 기존 sizing self-check(아래)대로 분해 권장 텍스트를 함께 출력.
3-I. **계측 line item authoring (ADR-042#amend-2 결정 3 / ADR-062)**: 담당 feature 문서 `## 8-1` 의 **계측 필드**(`<이벤트명> @ <발생 지점> / 속성: <목록> / 도구: <도구>`)가 채워져 있으면 그 이벤트를 심는 작업을 **담당 task 의 `## 3` line item 으로 옮긴다** — 이벤트명·발생 지점·속성 목록·도구를 그대로 적고, *어느 파일의 어느 지점에* 심는지까지 위 3-G 형식으로 쓴다. **feature 문서에만 남기고 task 로 옮기지 않으면 그 이벤트는 구현되지 않으며, 데이터는 소급 수집이 불가능하다.**
   - `## 8-1` 계측 필드가 **비어 있고** 그 feature 가 UI·사용자 행동을 가지면 임의로 채우지 말고 `Needs Instrumentation: F-NNN ## 8-1 — /plan-milestone R4 또는 /consult-expert data` 를 보고한다(정의 소유는 ADR-062 D10 — 본 skill 은 채우는 주체가 아니다).
   - 계측 도구가 미설치면 **authoring 만** 한다 — 설치는 `/implement-workitem` 이다(ADR-040#amend-1 / ADR-052 install-ownership 3분할).
3-P. **승인 프로토타입 참조 + PX↔AC 매핑 + 전환 흐름 authoring (ADR-056 결정 3·#amend-1·#amend-3 — 이중 잠금 2/2)**:
   입력 feature가 UI 확정·비면제이면, feature `## 7`의 `프로토타입:` 참조 줄에서 화면 파일 경로를 회수해 읽고(UI 확정·비면제 화면만 — ADR-019 minimal-context: 계획 시점 1회 읽기, draft 지연 아님), 그 화면을 구현하는 *모든* UI task `## 3`에 프로토타입 참조 line item을 authoring한다(신규 요소 유무와 무관 — builder는 기계 실행). 형식: `- 구현 시 승인 프로토타입 참조 — <경로>의 <상태/섹션>과 동일 상태·문구로 구현 (AC-N)`.
   - **PX↔AC 매핑 (ADR-056#amend-1)**: feature `## 7`의 `경험 결정(PX):` 인벤토리 각 PX를 그것을 구현하는 AC로 매핑해 feature `## 7-3. 프로토타입 경험(PX) ↔ AC 매핑`에 `PX-M<N>-<screen>-NN → T-NNN:AC-M`으로 기입한다(해당 AC 본문에 `(PX-M<N>-<screen>-NN)` 태그 가능). 어떤 AC도 참조하지 않는 PX(unmapped PX)는 "남은 미결정 사항"에 `- unmapped PX: <PX-M<N>-<screen>-NN> — 커버 task/AC 없음`으로 surface(unmapped FAC 패턴과 동형 — [Plan-FAC-coverage]가 재점검).
   - **전환 흐름 소비 (ADR-056#amend-3 — `## 9` 전환 표 존재 시)**: 마일스톤 `## 9. 화면 전환`에서 이 feature가 owner인 행을 회수해, 그 **존재하는 각 path type 행(primary·failure·recovery)**이 task AC로 커버되는지 확인한다(FEATURE §8-1 복구 흐름과 정합). 미커버 path는 "남은 미결정 사항"에 surface. `## 9`가 "(해당 없음)"이면 skip.
3-U. **외부 경계 표시 + 미실측 외부 사실 authoring (ADR-064 D1/D3)**:
   - **외부 경계 표시**: 분해된 task의 `## 3`가 (a) 영속 저장소 쓰기(DB write·마이그레이션·파일/오브젝트 스토리지·캐시/큐 적재), (b) **외부(서드파티·타 시스템)** 네트워크 호출, (c) 실행 진입점(CLI 명령·배치 잡·스케줄러·워커) 중 하나라도 건드리면 그 task `## 2. 작업 범위` 끝에 `- 외부 경계: <해당 종류만 나열> — 구현 시 경계 종류마다 실행 증거 필요` 한 줄을 박는다 (형식 SSOT: ADR-064 D1 — 정책 참조를 그 줄 안에 적지 않는다). **해당하는 종류만 골라 적는다** — 예 `- 외부 경계: (a) 영속 저장소 쓰기, (c) 실행 진입점 — …`. "(a)/(b)/(c) 중 해당"처럼 뭉뚱그리면 구현·검증이 어느 경계에 증거가 필요한지 알 수 없어 마커가 무용해진다. 종류 이름 뒤에 괄호 예시(`CLI 명령` 등)를 덧붙이지 않는다 — 아래 task type prefilter 키워드와 우연히 겹친다. **같은 저장소·같은 배포 단위 안의 서비스 간 호출은 (b)가 아니다**(모노레포에서 자기 API 서버를 부르는 프론트 task로 게이트가 오발동하지 않게 한다). 셋 다 해당 없으면 적지 않는다.
   - **미실측 외부 사실**: 그 task가 외부 계약 사실(엔드포인트 경로·호스트 / 쿼리·바디 파라미터명 / 응답 필드명 / 필드 타입 / nullable 여부 / 페이지네이션 단위·방식 / 인증 헤더 형식)을 지정하는데 **plan 시점에 실측할 수단이 없으면**(웹 접근 없음 — ADR-040) 확정으로 적지 말고 `## 3`에 다음 형식으로 박는다: `- [미실측] <무엇> — 잠정값: <값> / 출처: <URL 또는 문서> / 확인 방법: <어떻게 실측> / 해소: 구현 1단계`. 이 표기는 **`## 3` 전용**이며 AC(`## 6`)에는 쓰지 않는다 — AC는 행동을, `## 3`는 배선 사실을 담는다. 참조 키는 단계 번호가 아니라 `<무엇>` 문자열이다.
   - **원장 대상이 아니다**: `[미실측]`은 *결정*이 아니라 *아직 관측하지 않은 사실*이므로 `DECISION_REGISTER.md`에 등재하지 않고 봉인도 막지 않는다. **단 그 사실이 계획 자체를 가르면**(그 API 존재 여부에 따라 feature 범위·AC 문안이 달라짐) `[미실측]`으로 미루지 말고 ADR-060 D4대로 **봉인 전 `/research-pack` 선행**으로 종결한다. 구분 기준: *해소 결과가 AC 문안을 바꾸면 봉인 전 종결, `## 3` 배선만 바꾸면 `[미실측]`*.
   - 대상 목록 밖으로 표기를 확장하지 않는다 — 전 AC에 붙으면 표기의 신호가 죽는다.
4. 관련 문서 링크를 함께 기록한다.
5. 검증 포인트와 완료 기준을 포함한다.
6. **task 단위 분해 시**: TASK_TEMPLATE의 `## 6. Acceptance Criteria`에 측정 가능한 AC를 최소 1개 이상 채운다. Given-When-Then 형식을 *강력 권장*하며 자세한 점검은 아래 9번 항목과 TASK_TEMPLATE 주석을 참조한다. AC가 비면 `/implement-workitem`이 RGR 사이클을 시작할 수 없다(정책: [ADR-009](../../../docs/90-decisions/boilerplate/ADR-009-tdd-default.md), [ADR-026](../../../docs/90-decisions/boilerplate/ADR-026-plan-workitem-schema.md)).
7. 새 task 문서를 만들 때는 `TASK_TEMPLATE.md`를 복사해 채운다. milestone·feature 문서 템플릿 복사는 `/plan-milestone`가 담당하므로 본 skill에서 하지 않는다.
8. **분해 후 sizing self-check** — 다음 3 한계 중 하나라도 초과 시 *추가 분해 권장 텍스트*를 출력에 명시 (자동 차단 X, 사용자 결정):
   - 1 task = 1 RGR 사이클.
   - AC 3개 이하.
   - 변경 예정 파일(TASK_TEMPLATE `## 4-1`) 5개 이하.
   - 초기 scaffolding·auth 같은 task는 5개 파일 초과가 자연스럽다 — 사용자가 분해 거부 결정 가능.
9. **AC 형식 권장 + 금지 verb 점검** — 모든 AC는 Given-When-Then + measurable verb 권장(TASK_TEMPLATE 주석 참조). 강력 금지 verb("works"/"looks good"/"is correct"/"is fine") 사용 시 *재분해 권장 텍스트* 출력. 문맥상 허용 verb("handles"/"supports")는 *무엇을 / 어떻게*가 명시되면 통과.
9-1. **AC interpretation diversity self-check** (분해 직후 1회 실행, ADR-006#amend-1):

각 AC를 *2+ 합리적 해석이 가능한지* self-check.
가능 시 plan 출력의 "남은 미결정 사항" 섹션에 다음 형식으로 박음:

- AC-N (T-NNN): 해석 A=<...>, 해석 B=<...>, 권장 선택=<...>
  (이유: charter ## 7. 제약 조건 또는 ## 5. 비목표 정합 / 비용 정합 등)

자동 차단 X — 사용자가 plan 검토 시 *해석 결정 협상*.

**해석 확정 기록 (ADR-006#amend-2)**: 권장 선택이 채택될 만큼 명확하면 해당 task `## 8. 메모`에 `해석 확정: AC-N = <선택>` 한 줄을 *기록*한다. 이 기록이 있으면 implement(builder)는 그 해석을 기계적으로 따르고, *기록이 없는데 2+ 해석이면 implement는 진행을 중단(Needs Plan Decision)* 한다 — plan에서 해석을 확정해 두면 implement 하드스탑을 예방한다 (2-layer defense — plan이 사고, implement는 집행).

본 self-check가 plan 단계에서 발화하면 [implement-workitem ambiguity surfacing](../implement-workitem/SKILL.md)은
*재확인 surface*가 됨 — 2-layer defense (plan에서 잡으면 RGR 1회 절감).

**경험 좁힘 무조건 질문 (ADR-056 결정 4)**: 해석 후보 중 어느 쪽을 골라도 무방한 *내부 엔지니어링 선택*은 지금처럼 자율 확정한다. 그러나 해석이 **사용자가 보고 느낄 것(보이는 것·눌렀을 때 일어나는 일·쓰여 있는 말)을 프로토타입·상위 약속보다 좁히는 경우**는 권장 선택을 확정하지 말고 "남은 미결정 사항"에 질문으로 올린다 — 질문 피로 방지선은 이 비대칭이 담당한다.

10. **task 의존성 채움** — TASK_TEMPLATE `## 9. 의존성`을 분해 시 명시. 의존성이 없는 task는 비워둔다.

## Workitem Type 라우팅 (ADR-039)
분해된 각 feature/task의 `## 0-1. Type`을 읽어 처리를 라우팅한다 (미기재 시 feature):
- **technical-enabler**: User Story 대신 기술적 근거 + 서비스하는 가정/기회(DISCOVERY ID)·상위 결정(ADR) 링크를 채운다. 시나리오 cross-check skip.
- **bugfix**: TASK `## 3-T. 트러블슈팅`(증상/재현/관측/가설/root cause/회귀 테스트 AC)을 채운다. AC는 *버그 재현 실패 테스트* 형태로.
- **refactor**: 외부 행동 불변을 AC에 명시("행동 동일 + 구조 개선 측정"). Surgical Changes(ADR-006) 정합 — 범위 밖 변경 금지를 task `## 4`에 박는다.
- **migration**: bootstrap-stack `--migrate` contract(ADR-041)를 상위 참조로 link. expand-contract 단계를 `## 3`에 분해.
- **research-spike**: 산출은 `/research-pack` 리서치 노트(ADR-040). TDD opt-out 기본(`## 6-2`에 사유=탐색 + follow-up 구현 task).

## task 분해 + `## 7-1` AC 측 채움 (ADR-036 / ADR-050)
**책임 경계**: feature 문서 *본문 main sections(`## 12` 폐지로 11개 — ADR-060 D1)* + `## 7 FAC` 작성 + *빈* `## 7-1. FAC ↔ AC 매핑표` shell 생성은 `/plan-milestone`가 이미 끝낸 상태로 본 skill에 들어온다. 본 skill은 **그 feature 문서를 task로 분해**하고, 분해된 task `## 6 AC`로 **기존 `## 7-1` shell의 AC 측(매핑 행)을 채운다** — `## 7-1` 자체를 신설하지 않는다.

입력 feature 문서에 `## 7-1` shell이 *부재*하면(plan-milestone 미실행 또는 legacy 문서) 아래 Legacy fallback을 따른다.

`## 7 FAC`는 task `## 6 AC`로 분해되며 매핑 결과는 **feature 문서의 `## 7-1. FAC ↔ AC 매핑표` subsection에 영속 저장** (출력만 X — drift 차단).
매핑 누락(unmapped FAC)은 plan 출력의 "남은 미결정 사항"에 *추가*로 명시.
다음 라운드의 [validate-workitem](../validate-workitem/SKILL.md) Spec coverage audit (ADR-037)
및 [stabilize-milestone deterministic preflight](../stabilize-milestone/SKILL.md)가
본 영속 표를 참조해 cross-round 추적.

**Legacy fallback** — 기존 feature 문서(템플릿 변경 *전*에 생성된 것)는 `## 7-1` subsection이 부재할 수 있다. validator / stabilize preflight는 다음 순서로 회수한다:

1. `## 7-1` subsection 존재 → 본문 매핑 표 직접 점검.
2. 부재 → `## 7 FAC` 본문에서 *inline 매핑 표기*(예: `- FAC-1 → T-001:AC-1`) 휴리스틱 검출.
3. 둘 다 부재 → `Spec Gap: <feature> 매핑표 부재 — legacy 문서 보강 권장` 라벨로 IMPROVEMENT_GUIDE에 P1 기록 + 다음 plan 라운드에서 `## 7-1` 보강.

feature `## 11. 관련 문서`의 `Architecture-Iface:` / (UI 한정) `Design:` link 채움과 비해당 스택 줄 삭제, 그리고 Evidence/Insight 연결(`근거 insight: I-N` 기입 + Insight Backlog status 권장)은 feature 문서 *생성* 책임이므로 `/plan-milestone`가 담당한다 — 본 skill에서는 하지 않는다. 단, task 분해 중 입력 feature 문서에서 이 항목들이 *비어 있음*을 발견하면 plan 출력의 "남은 미결정 사항"에 `- feature <id> 링크/insight 미채움 — /plan-milestone 보강 권장` 한 줄로 surface한다(자동 수정 X).

## --fast 모드
prototype task 분해는 핵심 AC 1개만 가진 최소 task 로 OK (나머지 AC·NFR 점검은 "M2 이후 검토"). feature 의 `## 3 핵심 시나리오` / `## 7 FAC` / `## 8 NFR` *신설* 은 `/plan-milestone` 담당 — 본 skill 범위 아님.
YAGNI 정합 — Phase 6의 graduation contract *시작 시점 budget*과 동등 정신.

반드시 지킬 원칙:
- 코드를 구현하지 않는다.
- 서로 다른 추상화 레벨을 한 문서에 섞지 않는다(milestone은 큰 목표, feature는 사용자 가치, task는 구현 단위).
- 하위 문서는 상위 문서를 링크한다.
- 확실하지 않은 내용은 가정으로 표시한다.
- 사용자가 정하거나 승인해야 할 미결정이 남으면 `docs/10-charter/DECISION_REGISTER.md`에 등재한다 (ADR-060 D1 — 폐지된 "열린 질문" 섹션에 쓰지 않는다).

마지막 출력:
- 생성·갱신한 문서 목록(상대 경로)
- 분해 결과 매트릭스 (아래 형식):
  ```
  | Milestone | Feature | Task  | AC 수 | 의존성  |
  |-----------|---------|-------|-------|--------|
  | M1        | F-001   | T-001 | 2     | -      |
  | M1        | F-001   | T-002 | 3     | T-001  |
  ```
- task 분해 시: AC 매핑은 입력 feature 문서 `## 7-1`에 직접 기록(SSOT). plan 출력에는 **전체 표를 echo하지 않고** `unmapped N건`만 요약한다(ADR-037#amend-2 owning — ADR-005·ADR-046#d5 정합). 사람은 feature `## 7-1`을 연다.
- (배치 모드) feature별 task·`## 3` 완성 요약: 전 feature full N개 (draft tier·refresh 폐기 — ADR-057#amend-3 전체 스냅샷; 계획 후 재접지 없음, 봉인(`/seal-milestone`) 후 프로토타입·기획 변경은 다음 마일스톤)
- seam: INV N건 / unmapped K건 (또는 "신호 미발화 — skip")
- 핵심 가정
- 남은 미결정 사항 (품질·형식 지적 + 계획 결함 — 기존 슬롯 유지)
- **원장 요약**: `이 M 영향 — closed N건 / deferred M건 / open K건` (open 목록은 ID + `authority` 1줄씩. 봉인 전에 전부 닫아야 한다)
- **인터페이스·디자인 cross-check 결과** (정합성 self-check 결과 요약):
  ```
  DESIGN cross-check: 컴포넌트 중복 N건, raw hex K건, 상태 매트릭스 누락 M건
  ARCH 7-x cross-check: 7-1 위반 N건, 7-3 위반 K건, ...
  ```
  (UI/스택 비해당 시 "skip" 명시)
- **Cross-review opt-in 안내** (ADR-038) — 한 줄 안내 출력:
  ```
  품질 확신이 부족하면: 다른 세션·다른 LLM에서 `/validate-plan <workitem-id>` 1+ 회 → 원본 세션에서 `/repair-plan <workitem-id>` 회수.
  ```
- 각 task의 `## 3. 구현 항목`이 *단계별 before/after 가이드*로 채워졌는지 self-check 결과 (모호 단계 N건 — 있으면 명시).
- 다음 추천 단계:
  - 기본 권장: `/seal-milestone M<N>` — 최종 검사 + 사용자 승인 + task/feature/milestone 일괄 `ready` 승격. **봉인 전에는 `/implement-workitem`이 착수하지 않는다.**
  - 권장(opt-in, ADR-038): 봉인 전에 다른 세션·다른 LLM에서 `/validate-plan M<N>` → 원본 세션에서 `/repair-plan M<N>`. M이 `contract-ready`이므로 상위 계약 결함도 이 시점에 고칠 수 있다.

## monorepo·백엔드 sizing 가이드
- **monorepo**: 1 task = 단일 패키지 5 파일 이하 (cross-package 변경은 task 분리).
- **백엔드**: OpenAPI 변경·DB migration·코드 구현은 *별도 task*로 분리. 한 task에 묶지 않는다.
- Phase 4.1의 sizing 휴리스틱(1 RGR / AC 3 / 변경 5)이 monorepo·백엔드에서 깨지는 문제는 *외부실증*(Nx/Turbo 패턴) 기반. [관측됨] 데이터는 Phase 12 Round 2에서 회수.
- **SSOT 노트**: 본 sizing 가이드는 본 skill 본문이 SSOT다. 운영 가이드라 ADR로 박지 않음 — 추적성은 ADR-026#amend-1에서 명시.

## 정합성 self-check (분해 직후 1회 실행, ADR-026#amend-1 + ADR-027#amend-1)
- charter `## 5. 비목표` 단락 키워드와 분해된 feature/task를 매칭. 위반 의심 시 출력의 "남은 미결정 사항"에 명시.
- feature 범위가 상위 milestone `## 3. 포함되는 기능`에 매핑되는지 확인. 매핑 실패 시 동일 위치에 명시.

### Cross-task seam self-check (신호 게이트 — ADR-057 결정 8~10)
분해 직후 1회: 분해된 task 집합에서 seam 신호 4종(① 2+ task 동일 엔티티/저장소 write ② 상태 머신 키워드(status/state/전이/승인/취소/만료/lifecycle) ③ 2차-write 키워드(cache/index/검색/알림/event/projection/webhook 발신) ④ 멱등 키워드(retry/webhook 수신/at-least-once/중복/재시도) — 전체 taxonomy SSOT: ADR-057 결정 8)을 점검한다.
- **발화 시**: architect 단발 sub-call로 cross-task invariant 표를 도출해 feature `## 7-2`에 영속(양식 SSOT는 FEATURE_TEMPLATE 주석). **ARCH `## 4-1. 상태 모델`이 채워져 있으면 sub-call 입력에 포함해 문서화된 상태·전이·2차-write와 대조한다(ADR-057 결정 13 — §4-1 참조 배선).** task `## 3` 관련 단계에 `(INV-N)` 태그, task `## 7`에 `Feature-invariants:` 링크. unmapped INV는 "남은 미결정 사항"에 surface. 출력엔 `seam: INV N건 / unmapped K건` 요약만(전체 표 echo 금지 — ADR-046).
- **미발화 시**: feature `## 7-2`에 "(해당 없음 — seam 신호 미발화)" 기입 + skip 사유 echo.
- 신호 ①(2+ task 동일 엔티티/저장소 write)은 단독 발화, **②~④는 복수 task에 걸쳐 등장할 때만 발화**(ADR-057 결정 8 과발동 보정).
- **배치 모드(M<N>)에서는 마일스톤 전체 task 집합 대상 1회 수행** — cross-feature invariant는 **① 데이터를 실제 소유(write-through)하는 feature → ② 애매하면 최초 사용 feature → ③ 그래도 불명확하면 낮은 번호 feature(결정적 fallback)** 순으로 canonical feature를 정해 그 `## 7-2`에 기재 + 상대 feature `## 7-2`엔 참조 링크 1줄(ADR-005 SSOT — 양쪽 본문 중복 금지; ADR-057#amend-2 소유 우선).
- Codex: architect sub-call은 순차 단일 실행 degrade(기존 규약).

### Task type prefilter (context bloat 회피 — 본 prefilter 결과로 아래 cross-check sub-항목 적용 여부 결정)

각 분해된 task 본문 (`## 2. 작업 범위` + `## 3. 구현 항목`) 에서 다음 키워드 매칭으로 task type 자동 분류 — 일치 시만 해당 cross-check 활성. 매칭 안 되면 본 task 의 UI/ARCH cross-check 모두 skip.

- **UI task 신호**: `component`, `컴포넌트`, `widget`, `위젯`, `page`, `페이지`, `screen`, `view`, `route` (라우팅 결정 시 7-4/7-5 도 함께), `UI`, `frontend`, `프론트`, `style`, `theme`, JSX/TSX/`.dart` 파일 path
- **모바일 task 신호**: `권한`, `permission`, `deep link`, `딥링크`, `푸시`, `push`, `flavor`, `platform channel`, `네이티브`, `background`, `백그라운드`, `서명`, `signing`, `store`, `스토어`, `WebView` — 매칭 시 ARCH `## 7-5` cross-check 활성 (ADR-059 D7)
- **API task 신호**: `endpoint`, `API`, `route`, `handler`, `controller`, `OpenAPI`, `REST`, `GraphQL`, `7-1`
- **CLI task 신호**: `command`, `CLI`, `argv`, `subcommand`, `flag`, `7-2`
- **백엔드 task 신호**: `migration`, `schema`, `auth`, `인증`, `transaction`, `트랜잭션`, `cache`, `queue`, `worker`, `7-3`

> Prefilter 한계 명시: 본 키워드 매칭은 *best-effort*. false positive/negative 가능 — prefilter 가 놓친 task 는 **validate-workitem (validator) 의 CHECK 단계가 catch** (2-layer defense — plan prefilter 가 1차, validator 가 2차). *implement/builder 가 catch 하지 않는다* — implement 는 EXECUTE 전용 (ADR-027#amend-1 책임 분배).

### UI 프로젝트 + UI task 한정 — DESIGN.md cross-check
(DESIGN.md 부재 또는 본 task 가 UI 신호 미매칭 시 본 단락 skip + skip 사유 echo):
- 분해된 task 가 *새 컴포넌트* 를 신설하는가? 중복/재사용 검사는 **두 출처 모두** 대조 (인벤토리 stale 대비 — planner 는 Grep 권한 보유):
  - (a) DESIGN.md `## 7. Components` 인벤토리 (설계 레지스트리)
  - (b) 실제 `src/components/` · `app/components/` · `components/` · `lib/widgets/` · `lib/**/widgets/` 디렉터리의 기존 컴포넌트 파일명 (코드 실측 — DESIGN.md 미등록 컴포넌트도 포착)
  - 둘 중 *어느 쪽이라도* 기능 유사 컴포넌트 발견 시 "남은 미결정 사항" 에 `- 컴포넌트 중복 의심: T-NNN 의 X ↔ <DESIGN.md ## 7 의 Y / src/components/Z.tsx>. 재사용 검토 권장` 명시. (b) 에만 있고 (a) 에 없으면 *인벤토리 stale* → `+ DESIGN.md ## 7 등록 보강` 도 권장.
- AC 본문 또는 task `## 3. 구현 항목` 본문에 raw hex 색 코드 (`#[0-9A-Fa-f]{3,6}` 패턴) 가 직접 박혀 있는가? 발견 시 "남은 미결정 사항" 에 `- raw hex 검출: T-NNN AC-N — DESIGN.md ## 2 의 token 으로 교체 권장` 명시.
- **상태 점검은 *task 의 use-case 해당 상태* 한정** (DESIGN.md `## 7` 의 *전체* category expected 상태 설계(ADR-027#amend-7 — interactive/data/static)는 별도 — reviewer Design Consistency `[Design-state]` 책임). 본 self-check 는 *task 본문이 명시한 상호작용* (예: hover/disabled 가 use-case 에 등장하는데 AC 에서 언급 누락) 만 점검. 누락 상태가 있으면 "남은 미결정 사항" 에 `- use-case 상태 누락: T-NNN — <상태> 가 task 본문에 등장하지만 AC 미언급` 명시. 자동 차단 X.
- task 본문·AC에 박힌 사용자 표면 문구가 DESIGN.md `## 10` Voice & Writing(어조·용어 번역표)과 정합하는가? placeholder 카피·내부용어 노출 발견 시 "남은 미결정 사항"에 `- voice 위반 의심: T-NNN — <문구>. DESIGN.md ## 10 정합 권장` 명시 (ADR-056).

### API/CLI/백엔드/프론트 스택 + 해당 type task 한정 — ARCH 7-x cross-check
(해당 sub-section 부재 또는 본 task 가 해당 type 신호 미매칭 시 본 단락 skip):
- API task: `## 7-1` envelope/error 컨벤션 외 응답 형식을 박는가? 분해된 task `## 3. 구현 항목` 본문에 envelope 형식 (예: `{ data, error, meta }`) 외 형식 키워드 (`status: ok`, `result:` 등) 등장 시 명시.
- CLI task: `## 7-2` 출력 포맷 컨벤션 외 형식을 박는가? `## 3` 본문에 명시된 출력 형식이 7-2 의 text/JSON/table 모드 외 형식인지 점검.
- 백엔드 task: `## 7-3` 결정 (DB migration / 인증 / 트랜잭션 / Idempotency / Rate limit / Async / Caching / API versioning) 과 어긋나는 새 결정을 즉흥 도입하는가? 도입 시 명시.
- 프론트 task: `## 7-4` 결정 (라우팅 / 상태관리 / SSR-CSR / i18n / SEO / 인증 / 폼 validation) 과 어긋나는 새 결정을 즉흥 도입하는가? 도입 시 명시.

### 신규 인터페이스 요소 → task `## 3. 구현 항목` 에 *등록 line item* authoring (builder 가 독립 판단 없이 실행하도록)

위 cross-check 에서 *정당한 신규 요소* (중복 아닌 새 컴포넌트 / 신규 endpoint / 신규 error code / 신규 출력 모드) 가 필요하다고 판단되면, 해당 task `## 3. 구현 항목` 에 **등록 step 을 명시적 line item 으로 박는다**:
- 예: `- 신규 IconButton 컴포넌트 생성 + DESIGN.md ## 7. Components 에 한 줄 등록 (그 category의 expected 상태 설계 포함 — ADR-027#amend-7)`
- 예: `- 신규 error code USER_LOCKED 도입 + ARCH ## 7-1 error 레지스트리 등록`
- 예: `- 신규 CLI 출력 모드 --json 추가 + ARCH ## 7-2 출력 포맷 등록`

이로써 등록 *결정* 은 plan 이 authoring 하고, builder 는 task 스펙을 *기계적으로 실행* — 등록 책임이 executor 의 독립 판단에 박히지 않는다 (ADR-027#amend-1 책임 분배 / ADR-005 정합). validator 는 본 line item 이 실행됐는지 점검 (`/validate-workitem` + `validator.md` CHECK 단계).

**진짜 새 *primitive*** (Button/Input/Card 외 기반 컴포넌트) 는 task line item 이 아니라 architect 또는 `/bootstrap-design` 라운드 권장 (아래 `## architect 호출 권장 신호` #6 정합) — plan 은 그 권장만 출력.

**외부 라이브러리 docs-check line item (ADR-040)**: task `## 2/## 3` 본문에 *외부 SDK·API·결제·인증·외부 서비스 연동* 키워드(예: `결제`, `payment`, `Stripe`, `OAuth`, `auth provider`, `SDK`, `webhook`, `외부 API`)가 등장하면, 해당 task `## 3. 구현 항목`에 line item을 자동 추가: `- 구현 전 최신 공식문서 확인 (/research-pack 또는 researcher 위임 — 모델 지식 컷오프 보완)`. builder는 이 line item을 보고 불확실하면 researcher 위임을 메인에 요청(직접 웹서핑 X).

**의존성 설치 line item (ADR-040#amend-1)**: 분해된 task가 *새 외부 패키지*(charter `## 7. 제약 조건`에 없는 npm/pip/cargo/go 등)를 요구하면, 해당 task `## 3. 구현 항목`에 설치 단계를 명시적 line item으로 박는다:
- 형식 — 한 줄 line item으로, *설치 명령만* inline code로 감싼다(백틱 중첩 금지). 예: `- 의존성 설치 — pnpm add zod@^3 실행 (용도: 입력 스키마 검증) (AC-2)`.
- **의존성 도구는 표에서 가져온다 (ADR-051#amend-4)**: 설치 line item을 작성할 때 `docs/00-meta/STACK_SETUP_PLAN.md` `## Dependency Tools` 표에서 **그 task 경로에 가장 구체적으로 일치하는 scope의 도구**를 그대로 쓴다(모노레포·polyglot에서 scope별로 다를 수 있다 — 전역 단일 PM 가정 금지). 표·행이 없을 때만 그 경로에 *인접한 tool-specific* 신호(`pnpm-lock.yaml`·`poetry.lock`·`uv.lock`·`Cargo.lock`·`go.mod`·`pubspec.lock` 등)로 추론한다(일반 manifest만으론 단정 금지). **새 도구 도입·전환은 line item으로 쓰지 않는다** — 필요해 보이면 "남은 미결정 사항"에 surface(도구 변경은 스택 결정 — ADR-055 T2/`/bootstrap-stack`).
- **버전·사용법 불확실 시**: 모델 지식 컷오프 보완을 위해 `최신 버전·사용법 확인: /research-pack <pkg> 선행 권장 (또는 메인 세션이 researcher 위임)` 한 줄을 같은 task에 부기한다. 확인 후 정확한 버전으로 line item을 갱신한다. (plan-workitem은 웹 접근이 없어 직접 조사 불가 — research-pack/researcher 경로를 *권장*만; ADR-040#5 패턴.)
- 이 의존이 charter 제약 밖이면 기존 `architect 호출 권장 신호 #2`도 함께 발화(새 외부 의존 = 검토 대상).

**connected-MCP 사용 line item (ADR-048#d3)**: `docs/00-meta/STACK_SETUP_PLAN.md` `## Optional MCP Connectors` 표가 *존재*하면 그 표만 회수(부재 시 본 점검 skip — ADR-019 minimal). 분해 task의 capability(예: 브라우저 E2E / DB 스키마 introspection / 최신 공식문서 / PR·issue / 디자인 자산)가 표의 어떤 행 `lifecycle usage`와 매칭되면, 해당 task `## 3. 구현 항목`에 line item 자동 추가: `- <capability> 작업 시 <mcp-name> MCP 사용 (STACK_SETUP_PLAN Optional MCP Connectors 참조)`. 권장 텍스트만 — builder가 독립 판단 없이 실행하도록 *plan이 authoring*(ADR-040 docs-check / ADR-027#amend-1 책임 분배와 동일 패턴). 표의 행 `agent access`가 비어 있으면(아직 부여 X) line item에 `(agent access 미부여 — 연결 절차 (e) 필요)` 한 줄 부기.

**모두 자동 차단 X — *권장 텍스트만* 출력** (ADR-007 책임 경계 정합).

## architect 호출 권장 신호 (감지 시 텍스트 제안만, 자동 호출 금지 — ADR-007)
다음 6 신호 중 하나라도 감지되면 출력 마지막에 `architect 호출 권장: <이유>` 1줄 추가:
1. 새 모듈 디렉터리 생성 (`src/<new>/` 또는 동등 경로).
2. charter `## 7. 제약 조건`에 없는 새 외부 의존 (npm/pip/cargo) 추가.
3. ARCHITECTURE_OVERVIEW.md `## 3-1. 레이어 경계` 변경.
4. "패턴 변경" / "새 boundary" / "도메인 경계" 키워드 등장.
5. **ARCHITECTURE_OVERVIEW.md `## 7-1`/`## 7-2`/`## 7-3`/`## 7-4` 의 *기존 결정* 변경 또는 신규 항목 추가 의심** (예: API versioning 정책 변경 / 인증 방식 변경 / 라우팅 전략 변경). 인터페이스 결정 책임 분배 (ADR-027) 정합.
6. **DESIGN.md `## 7. Components` 인벤토리에 *새 primitive* 추가 의심** (예: 기존 Button/Input/Card 외 패턴 신설). 추가는 architect 또는 별도 `/bootstrap-design` 라운드 권장.

### Stack-decision tier 라우팅 (ADR-055)
위 신호 #2(charter 제약 밖 새 외부 의존) 또는 #5(ARCH §7 결정 변경)가 감지되면, 그 dep/변경을 tier로 분류해 라우팅을 함께 출력한다(권장 텍스트만 — 자동 차단 X):
- **T2** — dep/변경이 ADR-053 S1~S4에 해당(언어/런타임/프레임워크/DB·영속성/인증/배포 토폴로지/핵심 외부 의존을 건드림, 또는 ARCH §7 결정·charter §7 제약을 뒤엎음): `T2: /bootstrap-stack --migrate 권장 (ADR-101 supersede)` 출력. task로 즉흥 도입하지 않는다.
- **물질적이나 비-foundational** (S1~S4 미해당이지만 근거 기록이 필요한 새 의존): 해당 task `## 0-1. Type`을 `technical-enabler`로 두고 근거를 `## 2`에 기록(ADR-039).
- **사소(T3)**: 평범한 `## 3` install line-item으로 처리(ADR-040#amend-1). ADR-101/charter §7 제약 미변경.

## Cross-review hook (ADR-038)
본 skill 호출 후 plan 품질에 확신이 부족하거나 다중 모델 관점을 원하면:
1. 별 터미널·별 세션 (Claude 또는 Codex)에서 `/validate-plan <workitem-id> --reviewer-tag <distinct-tag>` 1+ 회 실행. **다중 리뷰어 시 서로 다른 tag 필수** (default 충돌 silent overwrite 회피). 각 호출이 `docs/40-validation/plan-reviews/<id>.<tag>.md` 1개를 작성.
2. 원본 세션 (본 skill을 돌린 세션)에 돌아와 `/repair-plan <workitem-id>` 실행. 모든 리뷰 파일을 회수해 workitem 문서를 수정 + 리뷰 파일 삭제.

본 흐름은 *opt-in*. 건너뛰어도 워크플로우 정상 작동. *opt-in 시작 후 `/repair-plan`을 건너뛰면 `docs/40-validation/plan-reviews/<id>.*.md`가 잔존*: 다음 라운드 호출이 자동 suffix(-N)로 보존(또는 rm으로 수동 정리).

## 기술 부채 회수 hook (ADR-022 / ADR-039)
부채 회수 의도가 있는 분해(사용자 요청 또는 milestone 부채 예산)일 때만 `docs/40-validation/IMPROVEMENT_GUIDE.md`의 *open* 항목(특히 P0/P1 리팩토링·아키텍처 부채)을 회수해, 이번 범위와 관련되면 **후보 task로 surface**한다(보통 `Type: refactor` 또는 `bugfix` — ADR-039). 자동 생성 X — 출력 "다음 추천 단계"/"남은 미결정 사항"에 `- 부채 회수 후보: <IMPROVEMENT_GUIDE 항목 ID> → T-XXX(refactor) 권장` 형태로 제시. 부채 회수 의도가 없으면 IMPROVEMENT_GUIDE를 사전 read 하지 않는다 (ADR-019 minimal 정합).

## 출력 스타일 (ADR-046)
마지막 출력은 signal-first(문서 목록 → 매트릭스 → 미결정 → 다음 액션). 파일에 영속된 상세(FAC↔AC 전체표·cross-check 세부)는 위치만 가리키고 echo하지 않는다.

## 결정 마감 (ADR-060)
본 skill이 내리거나 발견하는 기획 결정 중 **사용자가 정하거나 승인해야 할 것**을 `docs/10-charter/DECISION_REGISTER.md`에 등재한다 — 대화 출력으로만 두지 않는다.

1. **등재 시점에 `authority`를 확정한다** (ADR-060 D2): 제품 의도·범위·우선순위·사용자 체감·외부 계약·데이터/보안·비용·위험 허용도·비가역 약속 → `user-choice`. 스택·인증·데이터 경계·되돌리기 비싼 구조 → `user-approval`. 승인된 경계 안의 가역적 내부 선택 → `agent-delegated`. **`user-*`를 `agent-delegated`로 낮추려면 사용자 명시 승인 + 항목에 이력 줄이 필요하다.**
2. **등재 범위 (원장을 얇게 유지)**: `user-*` 결정 전부 + 종류 불문 `open`/`deferred`로 남는 항목만 등재한다. **`agent-delegated`는 개별 등재하지 않고** 4의 일괄 확인으로만 처리한다. **코드 품질·형식 지적과 계획 결함은 원장 대상이 아니다** — 기존 `남은 미결정 사항` 출력 슬롯이 그대로 소유한다.
3. **`user-*` 결정은 Decision Brief 6블록으로 제시한다** (ADR-060 D3 / ADR-046#amend-1 — 압축 예외): 배경(왜 지금) → 용어(배경 없이도 이해되게) → 선택지 2~3안(각각 한 줄 요약·이 프로젝트에서의 체감·장점·감수할 것) → 되돌리기 비용 → 추천+근거 → 답변 방법. **라운드당 3~5개 상한**, `skip` 불허(선택 / 추가 설명 / 리서치 요청 / 연기 중 택1). 답변은 평이한 문장으로 재진술해 확인한 뒤 정본에 기록한다.
4. **라운드 종료 시 일괄 확인 1회**: 그 라운드의 `agent-delegated` 결정을 목록으로 제시하고 "바꿀 것 있으면 알려달라"를 1회 확인받는다. 사용자가 뒤집으면 그 항목은 `user-approval`로 원장에 등재한다.
5. **닫히지 않은 항목**: 현재 M 무영향 + 이관 앵커 + 회수 시점 3개를 모두 갖추면 `deferred`, 아니면 `open`으로 남긴다(ADR-060 D4). **앵커 없는 유예는 금지**한다. 현재 M을 막는 사실 조사는 `deferred`가 아니라 `/research-pack` 선행으로 종결한다.
6. 결정 *본문*은 **본 skill이 소유한 문서**(milestone / feature / task)에 쓰고, 원장에는 위치 앵커와 처분 상태만 적는다(ADR-005). 정본 3종(Charter / ARCHITECTURE / DESIGN) 변경이 필요하면 고치지 말고 소유 skill(`/bootstrap-project --apply` · `/bootstrap-stack` · `/bootstrap-design --update`)을 텍스트로 권장한 뒤 원장에 항목을 남긴다.
7. `영향:` 칸에는 이 마일스톤 ID를 적는다.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 ADR/architecture 섹션은 task 본문에서 발화 시 인용 — 사전 fork-load 금지.

## 메인 세션 실행 + 무거운 추론 위임 (ADR-050)
본 skill은 fork sub-agent가 아니라 **메인 세션**에서 직접 실행된다(bootstrap-project·discover-product 패턴 정합). 메인 컨텍스트 비대화를 막기 위해:
- 무거운 추론(대규모 task 분해 설계·AC interpretation diversity 판단·sizing 협상·아키텍처 영향 분석)은 `Agent` 도구로 **architect 단발 sub-call**에 위임하고, 반환된 결론만 본 skill이 문서에 반영한다(architect의 `model: opus`가 추론 품질 보장). 본 skill이 직접 모든 task 본문을 펼쳐 inline으로 추론하지 않는다.
- 대상 파일 JIT 읽기는 step 3-G대로 *그 task가 건드릴 실제 파일*에 한정한다(ADR-019 minimal).
- 분해 완료 후 사용자에게 `/clear` 또는 새 세션을 권장한다 — 다음 단계(`/implement-workitem`)가 깨끗한 컨텍스트에서 시작하도록.
- **Codex: 서브에이전트는 GA이나 본 저장소가 Claude persona 위임을 Codex subagent로 아직 매핑하지 않아 순차 단일 실행으로 degrade** — 이 매핑 부재로 architect 단발 sub-call도 순차 단일 실행으로 동작한다(결과 동일, 처리량만 차이).
