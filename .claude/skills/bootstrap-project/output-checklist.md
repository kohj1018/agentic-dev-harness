# Bootstrap Project Output Checklist

실행 후 아래를 만족해야 한다.

## 필수 갱신 문서
- `README.md` · `README_ko.md` (2종 동시 — 한쪽만 갱신하면 drift)
- `docs/10-charter/PROJECT_CHARTER.md`
- `docs/20-system/ARCHITECTURE_OVERVIEW.md`

## 선택 갱신 문서
- `docs/20-system/DESIGN.md` (UI 스택 포함 시 — `/bootstrap-design`이 채운다)
- `docs/90-decisions/project/ADR-100-initial-project-decisions.md` (project ADR은 100+ 번호 — boilerplate/ADR-002는 legacy reserved)

## 라이선스 결정 (필수 — ADR-060#amend-1)
- 원장에 `배포 라이선스` 항목이 `authority: user-choice` 로 있다. `closed` 면 `정본:` 이 `PROJECT_CHARTER.md ## 7. 제약 조건`의 배포 라이선스 줄을 가리킨다.
- README 2종의 `## License`·`## Contributing` 이 그 결정에 맞게 처리됐다 — 보일러플레이트 이슈·PR 템플릿 링크 잔존 0.
- **`LICENSE` 의 MIT 허가 고지 전문이 그대로 있다** — 어느 선택지에서도 삭제·축소하지 않는다(보존 대상은 저작권 한 줄이 아니라 허가 고지 전문).

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
