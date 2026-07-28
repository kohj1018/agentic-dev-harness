# Bootstrap Stack Output Checklist

## 필수 갱신 문서
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`
- `docs/90-decisions/project/ADR-101-stack-selection.md` (project ADR은 100+ 번호 — boilerplate/ADR-003은 legacy reserved)

## 선택 생성 문서
- `docs/00-meta/STACK_SETUP_PLAN.md`

## 출력 원칙
- shared 기본값에는 OS/셸 종속 hook를 강제로 넣지 않는다.
- 필요 scripts/hooks/CI를 문서로 정리한다.
- 실제 생성이 필요하다면 해당 스택에서 자연스러운 런타임을 기준으로 제안한다.
- mixed environment라면 local settings 전략을 우선 고려한다.
- 통합 검증 명령(`validate`)·검증 스크립트·hook 등록 안내는 `/stack-guard`가 별도로 생성한다 — bootstrap-stack 이후 다음 단계 안내에 포함한다.

## 스택 확정 후 ARCHITECTURE_OVERVIEW.md 운영 기술 사실 (체크리스트)

`/bootstrap-stack` 결과로 스택이 확정되면 ARCHITECTURE_OVERVIEW.md `## 7. 기술 선택` 하위에 다음 *구체적 기술 사실*을 함께 채운다. 1줄짜리라도 명시 — 빈 placeholder는 두지 않는다.

- [ ] 실행 명령 (`pnpm dev`, `make run`, `task validate` 등) — 스택 정합
- [ ] 주요 포트 (개발/스테이징/프로덕션 분리)
- [ ] 환경변수 이름 (값은 비워둠 — secrets는 `.env`, `.gitignore` 정합)
- [ ] 주요 파일/디렉터리 역할 (3~5개 핵심만)
- [ ] known gotcha / 자주 막히는 지점 (있으면, 없으면 생략)

비-UI 프로젝트는 7-4(프론트)·7-5(모바일) 섹션 생략, 모바일 앱은 7-5만 채움, CLI 프로젝트는 7-2 강화 등 스택 정합.

근거: 본 보일러플레이트는 *Living Doc* 패턴 정합 — 운영 기술 사실은 fork 직후 곧장 검증되는 surface로 박힌다. ADR-027 인터페이스 결정 책임 분배는 변경 없음 (체크리스트가 ARCHITECTURE_OVERVIEW `## 7-X` 갱신을 *권장* 만 한다 — 자동 작성 X).
