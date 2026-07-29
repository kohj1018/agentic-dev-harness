# Mx-이름

## 0. Status
draft
<!-- 값은 헤딩+1 줄(위)에 둔다 — 주석은 값 *뒤*("헤딩+1=상태값" 파서 보호).
     draft(계획 중) → contract-ready(plan-milestone 라운드 완료·사용자 승인 — task 분해 진입 자격, **잠금 아님**) → ready(/seal-milestone이 봉인).
     M·feature는 이 단방향만 쓴다. 완료 판정은 graduation(`## 8` 회고)이 담당하고 stabilize는 M `## 0. Status`를 바꾸지 않는다.
     contract-ready 구간에서는 상위 계약 수정이 정상 경로다(repair-plan이 그 자리에서 고친다). ready 뒤 상위 계약 변경은 새 마일스톤이 기본이고, 현재 M 진행 불가 P0는 자동 역전이 없이 사용자 보고.
     plan-workitem은 M·산하 feature가 모두 contract-ready일 때 동작하고 task를 ready로 승격하지 않는다. ADR-060 D6/D7 (ADR-057#amend-3 결정 5 부분 supersede). -->

## 1. 목적

## 2. 범위

## 3. 포함되는 기능

## 4. 제외되는 기능

## 5. 완료 기준 (graduation checklist)
> sprint contract: 본 마일스톤이 "done"이라고 합의되는 외부 검증 가능한 기준 (ADR-014).
- [ ] 모든 task status: done
- [ ] 통합 validate Pass
- [ ] E2E Pass — UI 프로젝트(ADR-027#amend-3) 또는 아래 item 6에서 e2e 선언 시 필요. **선언된 e2e 디렉터리에서 실제 실행된 테스트가 1개 이상 성공**해야 통과(registry 등록이 있으면 그 smoke 이름 일치까지 확인). 실행 0개(EMPTY)·실패(FAIL)·환경 불가(BLOCKED_ENV)는 모두 졸업 차단 (ADR-052#amend-1 / ADR-014#amend-4)
- [ ] AC 매핑 100% (validation report 기준)
- [ ] P0 severity finding 0건 (QA_FINDINGS의 본 마일스톤 헤더 기준)
- [ ] (선택) 본 마일스톤 한정 추가 기준 <!-- UI 예시: "경험 게이트 [Experience-drift] P1 0건" (ADR-056 — 채택 시 본 항목이 졸업 차단으로 작동) -->

## 6. 관련 문서
- Charter:
- Architecture:
- ADR:

<!-- ## 7. 열린 질문 — 폐지(결번). 이 마일스톤의 미결정은 docs/10-charter/DECISION_REGISTER.md가 소유한다(항목의 `영향:` 칸에 이 M ID를 적는다 — ADR-060 D1). -->

## 8. 회고 (stabilize 자동 채움)
- graduation: <YES | NO | BLOCKED> (<날짜>)  <!-- stabilize 단계 8 최종 판정(단계 4~6 qa 팬아웃 P0(QA_FINDINGS)만 반영, reviewer report-only 미반영) 영속 — §1.5 사전점검 아님. ROADMAP.md 파생 입력 (ADR-014·ADR-057#amend-1). BLOCKED = e2e blocked-on-env. 주: 이 판정은 stabilize 시점 report(ADR-014상 checkout-local ephemeral) 기준이며, ROADMAP Done은 이 *영속된 판정*의 파생이지 fresh clone에서 재도출된 증거가 아니다 — 재검증이 필요하면 stabilize 재실행(증거 영속 강화는 ADR-014 범위). -->
- 목표 달성도: <정량/정성 1줄>
- scope creep 사례: <있으면 1줄, 없으면 "없음">
- 비목표(charter ## 5) 위반 사례: <있으면 1줄>
- 핵심 학습 3개 이내

## 9. 화면 전환 (UI — 다화면 또는 단일 화면의 비가역·분기·복구 흐름 시 — ADR-056#amend-3)
<!-- 순수 정적 단일 화면·비-UI 마일스톤은 "(해당 없음)"; 단일 화면이라도 비가역/파괴 동작(삭제·결제·전송)·분기·다단계 오류→복구(submit→error→retry)·modal·확인 dialog가 있으면 채운다(트리거=화면 수가 아니라 비가역 동작·분기·복구 상태 존재 — ADR-056#amend-3). /plan-milestone R5-1이 채운다.
     형식: | path type(primary/failure/recovery) | 현재 화면/상태 | 사용자 행동 | 다음 화면/상태 | owner feature | prototype |
     plan-workitem이 owner feature의 **존재하는** 각 path type 행(primary·failure·recovery)을 task AC로 회수, validate-plan [Plan-design]이 존재 점검. -->

## 10. 봉인 기록 (seal receipt — /seal-milestone이 채움)
<!-- 봉인 성공 시에만 기록된다. 사람이 읽는 요약이며 내용 변경 탐지용 digest가 아니다. 형식(ADR-060 D7):
- 봉인일: <YYYY-MM-DD>
- 승인: 사용자 명시 승인
- 계획 규모: feature <F수> / task <T수> / AC <AC수>
- 리뷰: executed <yes|no> | independence <separate-session|same-session(under-verified)|none> | 처리 <P0 N건 / 차단 P1 M건>
- Register: closed N건 / deferred M건 / open 0건
**판정 기준은 섹션의 *존재*가 아니라 `- 봉인일:` 줄의 *채움*이다** — 본 섹션은 템플릿에 빈 채로 들어가므로 모든 미봉인 마일스톤에도 존재한다. /implement-workitem 착수 게이트는 `- 봉인일:` 채움을 본다. -->
