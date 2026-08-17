# ADR-069 — 상위 정본의 절 단위 부분 개정 (Bounded SSOT Amendment)

> scope: boilerplate
> area: process

## Status
accepted

## 배경
- [관측됨] 확정된 상위 정본(DISCOVERY·Charter·ARCHITECTURE·DESIGN)의 **한 절을 고치는 데** `/discover-product --update` 또는 `/bootstrap-project --apply` 같은 재생성 skill을 돌려야 한다. 그 skill들은 9개 파일을 읽고 architect sub-call로 문서를 통째로 다시 만든다 — 한 줄 수정에 과도하다.
- [관측됨] 경량 경로가 문서상 존재하기는 한다(`docs/00-meta/DELEGATION_STRATEGY.md`의 Mid-project 문서 갱신 동선 — "자연어로 메인 세션에 변경 요청 → planner 위임"). 그러나 **멱등성·전파 검사·봉인 충돌 검사·잔여 액션 안내가 계약화되어 있지 않아** 안전한 공식 경로로 쓰이지 못한다.
- [관측됨] 상위 문서를 고쳐야 한다는 사실이 하위(구현·검증)에서 드러나는 경우, 처방이 «사용자 보고»에서 끊긴다 — 사용자가 다음에 무엇을 칠지 알 수 없다.
- [관측됨] 어떤 변경이 `/stack-guard` 재실행을 요구하는지가 어디에도 결정적으로 적혀 있지 않아 사람의 기억에 의존한다.

## 결정

### D1. `/amend-ssot` 신규 skill
확정된 정본의 **절 단위 부분 개정 + 결정적 파생 전파** 전용 skill을 둔다.

- **하지 않는 것**: 발굴 라운드·재생성·시안 협상. 빈 문서를 채우는 authoring도 하지 않는다.
- `disable-model-invocation: true` — **사용자 호출 전용.** 상위 문서 변경은 되돌리기 비용이 크고 authority가 사용자에게 있다(ADR-060 D2). 다른 skill·agent는 `Needs SSOT Amendment: <문서/절/근거>` 제안만 만들고 자동 적용하지 않는다.
- 기본 동작은 **적용**이며 `--dry-run`으로만 미리보기한다. 사용자가 호출한 것 자체가 적용 의도이므로 확정된 소규모 변경에 별도 승인 플래그를 요구하지 않는다.

### D2. 변경 분류 4단 + 적용 강도
| 분류 | 정의 | 동작 |
|---|---|---|
| editorial | 오탈자·표현·형식 | 즉시 적용 |
| local semantic | 한 절 안에서 의미가 바뀌지만 파생 문서 전파가 없음 | 즉시 적용 |
| cross-SSOT | 파생 문서 전파가 발생(D3 전파표에 걸림) | change-set 제시 → **in-session 확인 1회** → 적용 |
| foundation | D4 라우팅 목록에 해당 | **거부 + heavy skill 라우팅** |

`user-*` authority 결정(ADR-060 D2)은 분류와 무관하게 Decision Brief 6블록으로 확인한다 — 그 절차의 SSOT는 ADR-060 D3이며 본 ADR이 재서술하지 않는다.

### D3. 전파표 (결정적 — 본 ADR이 SSOT)
| 바뀐 것 | 함께 볼 곳 | 잔여 액션 |
|---|---|---|
| DISCOVERY `## 2` 페르소나 · `## 6` 시나리오 | Charter `## 2.1` · `## 3.1` | snapshot 갱신 (본 skill 수행) |
| DISCOVERY `## 10` · `## 12` 가정 | Charter `## 9` | snapshot 갱신 |
| DISCOVERY `## 15` 인사이트 | ROADMAP `## Backlog` | **권장 등재 행을 출력에 낸다 — 본 skill은 그 파일에 쓰지 않는다**(writer 3종 고정, D5) |
| Charter `## 5` 비목표 | 현재 M 범위 · ARCH `## 2` 경계 | **충돌 검사** — 충돌 시 D5 |
| Charter `## 7` 제약의 **배포 라이선스 줄** | README 2종 `## License`·`## Contributing` · `LICENSE` | 투영 갱신. **그 줄 외의 `## 7` 제약(기술·시간·인력)은 전파 대상이 아니다** — 라이선스는 법률 선택이고 나머지는 기술 제약이라 소비자가 다르다 |
| ARCH `## 7-1`~`## 7-5` | 산하 task `Architecture-Iface` 링크 | **읽기 검사만** (task 미수정) |
| ARCH 도구·명령 변경 | `STACK_SETUP_PLAN.md` · verify 스크립트 | **`/stack-guard` 재실행 필요** 명시 |
| DESIGN `## 2`~`## 10` (Colors·Typography·Layout·Elevation·Shapes·Components·Motion·Don'ts·Voice — 시각 계약 전 절) | 승인 프로토타입 · Design Gate Adapter | design gate 재실행 필요 여부 판정 |

**본 skill은 `/stack-guard`·design gate를 직접 실행하지 않는다** — 필요 여부만 판정해 잔여 액션으로 출력한다.

> DESIGN 행이 [ADR-068](ADR-068-milestone-closure-and-graduation-v3.md) D6의 «계약 여섯 범위»에 든 `DESIGN.md` 항목(§2·§7·§9·§10)보다 넓은 이유: D6은 *이미 한 변경을 기존 계약으로 거꾸로 추적*하는 목록이고, 본 표는 *앞으로 할 변경이 무엇을 무효화하는가*를 판정한다. 승인 프로토타입은 타이포그래피·레이아웃·모션까지 구현하므로 그 절의 변경도 design gate 재실행 판정 대상이다. 두 목록의 목적이 다르므로 같을 필요가 없다.

### D4. 에스컬레이션 — 절-키 고정 열거
기준은 «위험한가»가 아니라 **«답을 아직 모르고 그것을 찾는 라운드가 필요한가»** 다. 위험 관리는 D2의 확인 절차와 D5의 충돌 검사가 담당한다.

| foundation 트리거 | 라우팅 |
|---|---|
| DISCOVERY `## 1` 문제 한 줄 · `## 2` 페르소나 **교체** (문구 수정이 아니라 대상 변경) | `/discover-product --update` |
| ARCH의 T2 카테고리 결정(언어·런타임·프레임워크·DB·영속성·인증·배포 토폴로지) | `/bootstrap-stack --migrate` |
| DESIGN 시각 방향 전환(원칙·팔레트 교체 — concept 시안 재탐색이 필요한 변경) | `/bootstrap-design --update` |
| Charter 문제 정의 자체의 전면 재정의 | `/bootstrap-project --apply` |

이 넷에 해당하지 않으면 본 skill이 처리한다. **절 개수는 판정 기준이 아니다** — 보고용 부차 신호로만 쓴다.

### D5. 봉인 충돌
change-set이 **봉인된 계약**에 영향을 주면 그 문서를 수정하지 않는다(ADR-060 D6/D7 보호). 봉인 여부는 **milestone 문서의 `## 10. 봉인 기록` `- 봉인일:` 채움**으로 판정한다 — 그 섹션은 milestone에만 있으므로 feature·task는 부모 milestone을 본다. 정본만 고치고 충돌 사실을 아래로 처리한다.
- 정본 한 절이 더 바뀌어야 성립 → `DECISION_REGISTER.md`에 본 skill이 등재.
- 다음 M 후보로 넘어감 → `ROADMAP.md`의 `## Backlog`가 제자리이나 **본 skill은 그 파일의 writer가 아니다**(ADR-057#amend-4가 writer를 3종으로 고정). 권장 등재 행을 출력에 내고 사용자·`/plan-milestone` R0가 반영한다.

### D6. 기존 경로와의 관계
`--update`·`--apply`·`--migrate`는 **작은 수정 모드가 아니라 «무거운 skill을 두 번째로 안전하게 돌리는 모드»** 다. 본 skill은 그것들의 축소판이 아니라 **다른 종류의 연산**이며, 기존 플래그는 전부 그대로 유지된다.

## 결과
- 상위 정본의 소규모 개정에 재생성 라운드가 불필요해진다.
- `/stack-guard`·design gate 재실행 필요 여부가 전파표로 결정된다.
- 하위에서 드러난 상위 문서 결함에 처방이 생긴다.

## 정책 강도 (ADR-022)
- **enabling(약)**: D1 skill 신설, D2 분류, D6 관계.
- **제약(약)**: D4 라우팅 목록, D5 봉인 충돌 금지.

## Mutation Contract (ADR-047 D3)
1. **Target** — `.claude/skills/amend-ssot/SKILL.md` 신규 / DELEGATION Mid-project 동선 / STRUCTURE 로스터·산출물 표 / README·README_ko 자연어 호출 목록 / implement-workitem 3-R 근본 충돌 처방 / stabilize 단계 8 다음 단계 / plan-milestone R0 회수 처방.
2. **Failure mode** — (a) 한 줄 수정에 재생성 skill을 돌림 (b) 전파 대상 문서가 갱신되지 않아 SSOT drift (c) `/stack-guard` 재실행을 잊음 (d) 하위에서 드러난 상위 결함의 처방 부재.
3. **Predicted improvement** — 정본 소규모 개정이 1회 호출로 끝나고, 잔여 액션이 출력에 열거된다.
4. **Preserved invariants** — 정본 소유권(각 bootstrap skill) / 봉인 잠금(ADR-060 D6/D7) / 원장 5종 배타 범위 / authority 판정 절차(ADR-060 D2·D3) / `disable-model-invocation`.
5. **Falsifying evaluation** — dogfood에서 (a) 본 skill 호출이 D4 라우팅으로 자주 튕겨 실사용이 안 되거나, (b) 전파표가 놓친 파생 문서 drift가 stabilize preflight에서 반복 검출되면 D3·D4를 재조정한다.
6. **Rollback path** — 본 ADR superseded + skill 제거 + 로스터·README 목록 원복. 기존 heavy skill 경로는 건드리지 않았으므로 되돌림에 부작용이 없다.

## Surfaces  (본 ADR 변경 시 동기 갱신 — fan-out SSOT. 실제 파일 경로 1행 1개)
- .claude/skills/amend-ssot/SKILL.md          — D1~D5 전체
- docs/00-meta/DELEGATION_STRATEGY.md         — D6 Mid-project 동선 표
- docs/00-meta/STRUCTURE.md                   — Canonical Owner 행 + 원장 writer

> `README.md`·`README_ko.md`의 자연어 호출 skill 목록은 **로스터 부기**이지 본 ADR의 결정을 집행하는 surface가 아니므로 등재하지 않는다(등재 기준 정합). 등재하면 `/stabilize-milestone` §1.0 항목 2의 Surfaces forward check가 «본문에 `ADR-069` 역참조 없음»으로 `P1 [Surface-backref]`를 자기 발화한다. 두 README의 목록 갱신은 Phase 7-3에서 별도로 수행하고, 그 정합은 §1.0 항목 7의 로스터 검사가 담당한다.

## 참고
- ADR-005(SSOT·정본 소유권), ADR-035(DISCOVERY=SSOT / Charter=snapshot), ADR-055(스택 taxonomy T1/T2/T3), ADR-058(design workflow), ADR-060(authority·Decision Brief·봉인).
