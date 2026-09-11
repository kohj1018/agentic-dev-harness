# 스택 결정 카탈로그 (ADR-071 D1 — 색인)

> 결정 본문은 정본 앵커에만 적는다. 이 표는 «무엇을 검토해야 하는가»의 색인이며, `/bootstrap-stack` R-C가 프로젝트 유형의 행 전부를 `STACK_SETUP_PLAN.md ## Stack Decision Registry`에 disposition과 함께 옮긴다.
> authority 기본값 기준: 되돌린 뒤 코드·데이터·계정·외부 계약에 파급 → user-approval / 코드 안에서 끝남 → agent-delegated (ADR-060 D2 — ARCH `## 7-x` 소항목 배정 예시는 D9).
> 설치: baseline = /stack-guard 6-2-b가 설치 / task = plan-workitem authoring → implement 설치 / n/a = 패키지 아님. 폰트 패키지·파일은 예외(DESIGN §3 확정 뒤 bootstrap-design R6 배선이 추가 — ADR-071 D6).
> **DESIGN.md는 정본 앵커가 아니다** — 시각 값·폰트 선택·컴포넌트 규칙은 `/bootstrap-design`(ADR-058·ADR-073)이 소유한다. 카탈로그 행은 **라이브러리·방식 선택**(ARCH·ADR-101)만 확정한다. authority는 ADR-060 D2의 3값(user-choice / user-approval / agent-delegated).

## 공통 (전 유형)
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-common-language-runtime | 언어·런타임·버전 | T1 | user-approval | n/a | ADR-101 | |
| cat-common-package-manager | 패키지 매니저(scope별) | T1 | agent-delegated | n/a | STACK_SETUP_PLAN ## Dependency Tools | npm / pnpm / uv / pub |
| cat-common-repo-layout | 단일/monorepo·디렉터리 트리 | T1 | user-approval | n/a | ARCH ## 3-1 | |
| cat-common-lint-format | lint·format 도구 | T3 | agent-delegated | baseline | ARCH ## 7 (도구) | Biome / ruff / dart format |
| cat-common-test-unit | 단위 테스트 러너 | T3 | agent-delegated | baseline | ARCH ## 7 | Vitest / pytest / flutter test |
| cat-common-test-e2e | e2e 도구(target별) | T2 | agent-delegated | baseline | STACK_SETUP_PLAN ## E2E Smoke Registry | Playwright / integration_test |
| cat-common-ci | CI | T3 | agent-delegated | n/a | STACK_SETUP_PLAN ## CI | GitHub Actions |
| cat-common-hosting-deploy | 호스팅·배포 토폴로지 | T2 | user-approval | n/a | ADR-101 · ARCH ## 7-3/7-5 | |
| cat-common-env-config | 환경변수·설정 관리 방식 | T2 | user-approval | task | ARCH ## 7 (운영 사실) | |
| cat-common-logging | 로깅 포맷·수집 | T3 | agent-delegated | task | ARCH ## 7 (운영성) | |
| cat-common-error-reporting | 에러 리포팅 provider | T3 | user-approval | task | ARCH ## 7 | Sentry |
| cat-common-analytics | 제품 계측 SDK | T3 | user-approval | baseline | ARCH ## 7 (운영 사실 — 이벤트 설계는 FEATURE ## 8-1이 나중에) | |
| cat-common-i18n | 국제화·로케일 | T3 | user-approval | task | ARCH ## 7-4/7-5 (그 절이 없는 유형은 ## 7) | |
| cat-common-datetime | 날짜·숫자 포맷 라이브러리·TZ 정책 | T3 | agent-delegated | task | ARCH ## 7 | |
| cat-common-auth-provider | 인증 provider(정책은 7-3/7-4/7-5) | T2 | user-approval | task | ADR-101 · ARCH ## 7-3 | |
| cat-common-secrets | 비밀 취급 위치·도구 | T2 | user-approval | n/a | ARCH ## 7 · .gitignore | secrets/ 하위 (ADR-059 D9) |
| cat-common-security-scan | secret scanner·의존성 취약점 | T3 | agent-delegated | baseline | ARCH ## 7 | gitleaks · osv-scanner |
| cat-common-license-policy | 배포 라이선스(Charter ## 7) | T1 | user-choice | n/a | Charter ## 7 · LICENSE | |

## web frontend
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-web-framework | 프레임워크·렌더링 모델 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-4 (SSR-CSR) | Next.js / Vite+React |
| cat-web-routing | 라우팅 | T2 | user-approval | n/a | ARCH ## 7-4 | 프레임워크 내장 |
| cat-web-styling | 스타일링 방식 | T2 | user-approval | baseline | ARCH ## 7-4 (토큰 배선은 bootstrap-design R6) | Tailwind + CSS 변수 |
| cat-web-ui-kit | UI 킷·컴포넌트 라이브러리 | T2 | user-approval | baseline | ARCH ## 7-4 (컴포넌트 규칙은 DESIGN ## 7 — bootstrap-design) | shadcn/ui |
| cat-web-icons | 아이콘 패키지 | T3 | agent-delegated | baseline | ARCH ## 7-4 (아이콘 스타일 방향은 DESIGN ## 1) | lucide |
| cat-web-fonts-delivery | 폰트 전달 방식(self-host/CDN) | T3 | agent-delegated | n/a | ARCH ## 7-4 (폰트 선택·패키지 추가는 DESIGN ## 3 — bootstrap-design R6) | self-host |
| cat-web-ui-preview | UI 미리보기 도구 | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## Design Gate Adapter · ARCH ## 7-4 | Storybook (a11y·viewport 애드온만) |
| cat-web-state | 클라이언트 상태관리 | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-data-fetching | 데이터 fetching·캐시 | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-forms | 폼·validation | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-auth-client | 토큰 저장·세션(정책) | T2 | user-approval | task | ARCH ## 7-4 | |
| cat-web-seo | SEO·메타 | T3 | agent-delegated | task | ARCH ## 7-4 | |
| cat-web-a11y-tooling | axe 등 접근성 검사 배선 | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## Design Gate Adapter | @axe-core/playwright |

## API server
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-api-framework | 프레임워크 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-1 | |
| cat-api-db | DB·영속성 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-3 | |
| cat-api-orm-migration | ORM·마이그레이션 도구 | T2 | user-approval | task | ARCH ## 7-3 (DB migration) | |
| cat-api-auth | 인증·인가 방식 | T2 | user-approval | task | ARCH ## 7-3 | |
| cat-api-versioning | API versioning | T2 | user-approval | n/a | ARCH ## 7-3 | |
| cat-api-envelope | 응답 envelope·페이지네이션 | T2 | user-approval | n/a | ARCH ## 7-1 | |
| cat-api-validation | 입력 validation 라이브러리 | T3 | agent-delegated | task | ARCH ## 7-1 | |
| cat-api-queue-cache | 큐·캐시·비동기 job | T2 | agent-delegated | task | ARCH ## 7-3 | |
| cat-api-email-notify | 이메일·알림 provider | T3 | user-approval | task | ARCH ## 7-3 | |
| cat-api-storage | 파일 저장소 | T2 | user-approval | task | ARCH ## 7-3 | |
| cat-api-payment | 결제 provider(해당 시) | T2 | user-choice | task | ARCH ## 7-3 · Charter ## 7 | |
| cat-api-openapi | API 문서·스키마 | T3 | agent-delegated | task | ARCH ## 7-1 | |
| cat-api-local-deps | 로컬 외부 의존 부트업 | T3 | agent-delegated | n/a | STACK_SETUP_PLAN ## 외부 의존 부트업 | docker compose |

## CLI
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-cli-framework | 인자 파서·프레임워크 | T1 | agent-delegated | baseline | ADR-101 · ARCH ## 7-2 | |
| cat-cli-output | 출력 포맷(기본 모드·--json) | T2 | user-approval | n/a | ARCH ## 7-2 | |
| cat-cli-config | 설정 파일·위치 | T3 | agent-delegated | task | ARCH ## 7-2 | |
| cat-cli-distribution | 배포 채널(npm/pipx/brew/binary) | T2 | user-approval | n/a | ARCH ## 7-2 · ADR-101 | |

## monorepo
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-mono-orchestrator | orchestrator | T1 | user-approval | baseline | ADR-101 · ADR-008 | turbo / nx / pnpm workspaces |
| cat-mono-shared | shared 패키지·버전 정책 | T2 | user-approval | n/a | ARCH ## 3-1 | |
| cat-mono-publish | publish 정책 | T2 | user-approval | n/a | ADR-101 | |

## Supabase 통합
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-supa-auth | Supabase Auth 사용 범위 | T2 | user-approval | task | ARCH ## 7-3 | |
| cat-supa-rls | RLS 정책 소유 | T2 | user-approval | n/a | ARCH ## 7-3 | |
| cat-supa-local | 로컬 개발(supabase start) | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## 외부 의존 부트업 | |
| cat-supa-migrations | 마이그레이션 흐름 | T2 | user-approval | task | ARCH ## 7-3 | |

## Flutter (Android·iOS)
| id | 항목 | tier | authority | 설치 | 정본 앵커 | 기본 후보 |
|---|---|---|---|---|---|---|
| cat-flutter-framework | Flutter SDK 채널·버전·생성기 | T1 | user-approval | n/a | ADR-101 · ARCH ## 7-5 | stable · `flutter create` |
| cat-flutter-platforms | 대상 플랫폼·최소 OS | T1 | user-approval | n/a | ARCH ## 7-5 | |
| cat-flutter-state | 상태관리 | T2 | agent-delegated | baseline | ARCH ## 7-5 | Riverpod |
| cat-flutter-navigation | 화면 이동 | T2 | user-approval | baseline | ARCH ## 7-5 | go_router |
| cat-flutter-di | 의존성 주입 | T3 | agent-delegated | task | ARCH ## 7-5 | |
| cat-flutter-networking | HTTP·직렬화 | T3 | agent-delegated | task | ARCH ## 7-5 | dio + json_serializable |
| cat-flutter-local-storage | 로컬 저장·오프라인 | T2 | user-approval | task | ARCH ## 7-5 | |
| cat-flutter-codegen | 코드 생성(freezed 등) | T3 | agent-delegated | baseline | ARCH ## 7-5 | |
| cat-flutter-design-kit | 디자인 킷 | T2 | user-approval | baseline | ARCH ## 7-5 (컴포넌트 규칙은 DESIGN ## 7) | Material 3 |
| cat-flutter-icons | 아이콘 패키지 | T3 | agent-delegated | baseline | ARCH ## 7-5 (폰트 번들은 DESIGN ## 3 — bootstrap-design R6) | |
| cat-flutter-intl | 국제화 | T3 | user-approval | task | ARCH ## 7-5 | intl |
| cat-flutter-analytics-crash | 분석·크래시 SDK | T3 | user-approval | baseline | ARCH ## 7-5 | |
| cat-flutter-permissions | 권한 요청 흐름 | T2 | user-approval | task | ARCH ## 7-5 | |
| cat-flutter-flavors-signing | 빌드 flavor·서명·배포 | T2 | user-approval | n/a | ARCH ## 7-5 · ADR-059 D9 | fastlane |
| cat-flutter-e2e-tooling | integration_test / Patrol | T3 | agent-delegated | baseline | STACK_SETUP_PLAN ## E2E Smoke Registry | integration_test |
