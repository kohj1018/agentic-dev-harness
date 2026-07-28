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
- (참고) 마일스톤 문서는 이 시점엔 아직 없음이 정상 — 4단계에서 /plan-milestone으로 생성한다 (ADR-057)

## 2. 운영 결정 (스택 확정)
> 스택이 아직 미정이면 이 절을 건너뛰고 `/bootstrap-stack`을 *무입력*으로 실행해 리서치+라운드로 결정할 수 있다(입력 적응형). 이미 정했으면 아래를 채운 뒤 `[스택 설명]`을 넘긴다.
- [ ] 운영 OS/셸 전제를 정했다
- [ ] 언어/프레임워크를 정했다
- [ ] 패키지 매니저를 정했다
- [ ] 테스트 도구를 정했다
- [ ] lint/typecheck 도구를 정했다

## 3. guardrail 추가
- [ ] `docs/00-meta/GUARDRAILS_STRATEGY.md`를 읽었다
- [ ] `/bootstrap-stack`을 실행했다 — 스택이 정해졌으면 `[스택 설명]`을 넘겨 문서화, 미정이면 무입력으로 심층 결정 라운드

  ```
  /bootstrap-stack Next.js 16 + TypeScript + pnpm + Supabase + Playwright + Vercel
  ```
  모바일 앱이면 예: `/bootstrap-stack Flutter + Android/iOS + Firebase`
- [ ] `STACK_SETUP_PLAN.md`를 검토한 뒤 `/stack-guard`를 실행해 통합 `validate` 진입점·verify 스크립트를 생성했다. UI 판정이면 `## Design Gate Adapter`가 current `ADR-058#amend-2/v2` + source digest(direct-support Node UI는 canonical)의 `ready`이고 fixed conformance를 통과했는지 확인했다
- [ ] (프론트엔드 스택이면) `/bootstrap-design`을 실행해 레퍼런스 조사(`DESIGN_RESEARCH.md`) + concept 시안 방향 선택을 거쳐 `docs/20-system/DESIGN.md`를 채웠다 (ADR-058)
- [ ] 필요하면 `.claude/settings.local.json`에 개인 자동화를 추가했다
- [ ] shared 설정에 환경 종속적인 hook를 바로 넣지 않았다

## 4. 작업 구조 준비
- [ ] `/plan-milestone`으로 첫 마일스톤(M1)과 feature 문서를 생성했다 (UI 마일스톤이면 R5 프로토타입 라운드까지)
- [ ] `/plan-workitem M1`로 M1 전 feature의 task를 1회 전체 계획했다 (전체 스냅샷, ADR-057#amend-3)
  ```
  /plan-workitem M1
  ```
- [ ] bootstrap·plan 후 PROJECT_CHARTER.md / ARCHITECTURE_OVERVIEW.md / M1 / F-NNN의 `## 0. Status`를 `draft → ready`로 전환했다
- [ ] `docs/30-workitems/milestones`에 첫 milestone 문서가 있다
- [ ] `docs/30-workitems/features`에 첫 feature 문서가 있다
- [ ] 필요하면 `docs/30-workitems/tasks`에 task 문서를 만들었다

## 5. 의사결정 기록
- [ ] 중요한 선택을 `docs/90-decisions`에 ADR로 남겼다
- [ ] 지속돼야 할 결정(범위·마일스톤 순서·연기 결정 등)이 도구 memory(Claude MEMORY.md·Codex memories)에만 있지 않고 checked-in 문서(마일스톤/feature/ADR)에도 있다 (ADR-010#amend-5 — 도구별 memory는 비캐노니컬)

## 6. 첫 커밋 전
- [ ] 예전 프로젝트 예시 문구가 남아 있지 않다
- [ ] 불필요한 템플릿 placeholder가 과하게 남아 있지 않다
- [ ] 새 프로젝트의 핵심 범위와 비범위가 명확하다
- [ ] (비-UI 프로젝트) `docs/20-system/DESIGN.md`를 삭제하고 `AGENTS.md`의 DESIGN 링크 줄도 제거했다
- [ ] (모바일 앱) `ARCHITECTURE_OVERVIEW.md`의 `## 7-5. 모바일 클라이언트 결정`을 채웠고, 웹 화면이 없는 프로젝트면 `## 7-4. 프론트 결정`을 삭제했다 (웹 화면이 함께 있으면 둘 다 보존 — ADR-027#amend-8)
- [ ] (모바일 앱) 서명·인증 자산이 **저장소 밖**에 있다 — Android 서명키(`*.jks`·`*.keystore`)·`key.properties`·iOS 인증서/프로비저닝(`*.p12`·`*.mobileprovision`)·Apple 인증 키(`*.p8`)·서버 service account 키. 저장소에 둬야 하는 credential 은 `secrets/` 하위에 둔다 — **위치가 1차 통제**이고 파일명 열거는 완결되지 않는다 (ADR-059 D9)
- [ ] (모바일 앱) 위 자산이 `.gitignore`로 제외되고 **이미 추적 중인 것이 없는지** `git ls-files`로 확인했다 — ignore는 이미 추적 중인 파일을 보호하지 않는다. Firebase 클라이언트 설정(`google-services.json`·`GoogleService-Info.plist`)은 **비밀이 아니므로 제외 대상이 아니다** — 앱 바이너리에 담겨 배포되고 빌드가 읽어야 하므로, 숨기는 대신 콘솔에서 키 사용 범위를 제한한다

## 권장 원칙
- charter 신뢰도가 중요한 프로젝트는 `/discover-product`로 발굴 단계를 먼저 거친다. 그 외에는 `/bootstrap-project`로 바로 시작해도 된다.
- 먼저 수동으로 여러 문서를 고치기보다 위 두 skill 중 하나로 시작한다.
- 스택이 정해지기 전에는 stack-specific 자동화를 추가하지 않는다.
- 중요한 기획/설계 변경은 `architect` agent 기반 흐름을 우선 사용한다 (모델 매핑은 agent frontmatter — Claude는 Opus, 도구별 매핑은 [boilerplate/ADR-010](../90-decisions/boilerplate/ADR-010-multi-agent-compatibility.md)).

## 실행 원칙
- 에이전트 위임 전략은 [DELEGATION_STRATEGY.md](DELEGATION_STRATEGY.md)를 따른다.
