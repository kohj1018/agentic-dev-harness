# Bootstrap Project Output Checklist

실행 후 아래를 만족해야 한다.

## 필수 갱신 문서
- `README.md`
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`

## 선택 갱신 문서
- `docs/20-system/DESIGN.md` (UI 스택 포함 시 — `/bootstrap-design`이 채운다)
- `docs/90-decisions/project/ADR-100-initial-project-decisions.md` (project ADR은 100+ 번호 — boilerplate/ADR-002는 legacy reserved)

## workitem 생성 경계
- milestone/feature 문서는 본 skill이 만들지 않는다 — `/plan-milestone`이 생성 (ADR-057).

## 출력 원칙
- 사실, 가정, 열린 질문을 구분한다.
- 스택이 명확하지 않으면 stack-specific 자동화는 만들지 않는다.
- 상위 문서와 하위 문서의 역할을 섞지 않는다.
- 너무 많은 문서를 한 번에 만들지 않는다.
- 마지막에는 갱신한 파일 목록과 남은 미결정 사항을 요약한다.
- 갱신 모드 흐름 — 기존 산출물이 있으면 diff 요약을 사용자에게 보여주고 확인 후 반영. `--apply` force 모드는 명시 인자가 있을 때만.
- 발굴은 `/discover-product`가 책임이다. bootstrap-project는 변환을 한다.
