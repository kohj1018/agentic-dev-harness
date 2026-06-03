# New Project Checklist

> 모드: How-to (새 프로젝트 시작 체크리스트)

## 1. 저장소 복제 직후
- [ ] (선택) `/discover-product [프로젝트 설명]`을 실행해 페르소나·pain·JTBD·시나리오를 발굴하고 `docs/10-charter/DISCOVERY.md`를 생성했다 — charter 신뢰도가 중요한 새 프로젝트에 권장. 빠른 prototype에서는 건너뛸 수 있다.

  ```
  /discover-product 개인 회고 SaaS. 사용자는 하루/주간 회고를 기록하고, 원인 분석과 개선 추적을 한다.
  ```

- [ ] Claude Code에서 `/bootstrap-project [프로젝트 설명 또는 DISCOVERY.md 사용]`을 실행했다

  ```
  /bootstrap-project 취준생 커리어 관리 서비스. JD와 이력서를 비교하고 역량 갭을 추적한다. 웹 우선, 스택 미정.
  ```
- [ ] `README.md`가 새 프로젝트 기준으로 갱신되었다
- [ ] `docs/10-charter/PROJECT_CHARTER.md`가 새 프로젝트 내용으로 채워졌다(DISCOVERY.md를 사용한 경우 페르소나·시나리오·핵심 가정 섹션이 함께 채워졌다)
- [ ] `docs/20-system/ARCHITECTURE_OVERVIEW.md`가 초기 구조를 반영한다
- [ ] 첫 milestone/feature 문서가 생성되었다

## 2. 운영 결정 (스택 확정)
- [ ] 운영 OS/셸 전제를 정했다
- [ ] 언어/프레임워크를 정했다
- [ ] 패키지 매니저를 정했다
- [ ] 테스트 도구를 정했다
- [ ] lint/typecheck 도구를 정했다

## 3. guardrail 추가
- [ ] `docs/00-meta/GUARDRAILS_STRATEGY.md`를 읽었다
- [ ] 스택이 정해진 뒤 `/bootstrap-stack [스택 설명]`을 실행했다

  ```
  /bootstrap-stack Next.js 16 + TypeScript + pnpm + Supabase + Playwright + Vercel
  ```
- [ ] `STACK_SETUP_PLAN.md`를 검토한 뒤 `/stack-guard`를 실행해 통합 `validate` 진입점·verify 스크립트를 생성했다
- [ ] (프론트엔드 스택이면) `/bootstrap-design`을 실행해 레퍼런스 조사(`DESIGN_RESEARCH.md`) + concept 시안 방향 선택을 거쳐 `docs/20-system/DESIGN.md`를 채웠다 (ADR-049)
- [ ] 필요하면 `.claude/settings.local.json`에 개인 자동화를 추가했다
- [ ] shared 설정에 환경 종속적인 hook를 바로 넣지 않았다

## 4. 작업 구조 준비
- [ ] `/plan-workitem [milestone-id]`를 실행해 milestone/feature/task 문서를 분해했다
  ```
  /plan-workitem M1
  ```
- [ ] bootstrap 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md / M1 / F-001의 `## 0. Status`를 `draft → ready`로 전환했다
- [ ] `docs/30-workitems/milestones`에 첫 milestone 문서가 있다
- [ ] `docs/30-workitems/features`에 첫 feature 문서가 있다
- [ ] 필요하면 `docs/30-workitems/tasks`에 task 문서를 만들었다

## 5. 의사결정 기록
- [ ] 중요한 선택을 `docs/90-decisions`에 ADR로 남겼다

## 6. 첫 커밋 전
- [ ] 예전 프로젝트 예시 문구가 남아 있지 않다
- [ ] 불필요한 템플릿 placeholder가 과하게 남아 있지 않다
- [ ] 새 프로젝트의 핵심 범위와 비범위가 명확하다
- [ ] (비-UI 프로젝트) `docs/20-system/DESIGN.md`를 삭제하고 `AGENTS.md`의 DESIGN 링크 줄도 제거했다

## 권장 원칙
- charter 신뢰도가 중요한 프로젝트는 `/discover-product`로 발굴 단계를 먼저 거친다. 그 외에는 `/bootstrap-project`로 바로 시작해도 된다.
- 먼저 수동으로 여러 문서를 고치기보다 위 두 skill 중 하나로 시작한다.
- 스택이 정해지기 전에는 stack-specific 자동화를 추가하지 않는다.
- 중요한 기획/설계 변경은 `architect` agent 기반 흐름을 우선 사용한다 (모델 매핑은 agent frontmatter — Claude는 Opus, 도구별 매핑은 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md)).

## 실행 원칙
- 에이전트 위임 전략은 [DELEGATION_STRATEGY.md](DELEGATION_STRATEGY.md)를 따른다.
