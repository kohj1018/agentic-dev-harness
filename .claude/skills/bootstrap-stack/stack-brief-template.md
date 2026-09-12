# Bootstrap Stack Brief Template

## 언어/프레임워크
[예: Next.js 16 + TypeScript]

## 의존성 도구 (scope별 — ADR-075 D14)
[단일 패키지면 1개: 예 `. → pnpm`. 모노레포·polyglot이면 scope별로: 예 `apps/web → npm`, `apps/api → uv`.
 확정 결과는 STACK_SETUP_PLAN `## Dependency Tools` 표로 기록된다.]

## 백엔드/DB
[예: Supabase / PostgreSQL]

## 테스트
[예: Vitest, Playwright]

## 배포
[예: Vercel]

## 운영 환경
[예: macOS + zsh / Windows + PowerShell / mixed team]

## 추가 요구사항
[예: CI 필요, e2e 포함, monorepo 여부]

## 카탈로그 행 (선택 — 아는 것만)
[`stack-catalog.md`의 id로 이미 정한 항목을 적는다(ADR-071 D1). 예: `cat-web-ui-kit: shadcn/ui`, `cat-web-ui-preview: Storybook`, `cat-common-error-reporting: 이관(M1 이후)`. 적지 않은 행은 R-C 라운드에서 묻는다.]
