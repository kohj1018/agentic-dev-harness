# ADR-024 — Claude Code plan 모드 lifecycle 비범위

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] 외부 미해결 버그 #19537 — Claude Code plan 모드의 plansDirectory 경로 처리가 불안정.
- `.claude/settings.json`의 `plansDirectory` 강제는 Codex CLI 사용자에게 불필요한 설정 부담을 준다(ADR-010 multi-tool 호환 정합).
- 빌트인 plan 모드는 사용자 자율 도구 — lifecycle에 의무화하면 Codex 동등 흐름을 깬다.

## 결정
다음 5가지를 결정한다.

1. **settings.json**: `plansDirectory` 라인 삭제 → 빌트인 디폴트(`~/.claude/plans/`) 회귀.
2. **디렉터리**: `docs/30-workitems/plans/` 통째 삭제.
3. **문서 4곳 정리**: STRUCTURE.md / `docs/30-workitems/README.md`(ADR-012로 삭제됨) / `docs/00-meta/TEMPLATE_GUIDE.md`(ADR-012로 삭제됨) "설정과 경로 매핑" 단락 / AGENTS.md 1단락 신설.
4. **`/implement-workitem` skill**: Red phase 진입 직전 think-before-edit 1줄 추가(plan 모드 의존 없이 사고 단계 확보).
5. **`/plan-workitem` skill description**: "Claude Code plan 모드와 다름 — workitem 분해기" 명시.

## 재검토 트리거
- (a) Codex 동등 plan 모드 도입
- (b) plan 모드가 milestone/feature/task 분해를 직접 제공
- (c) 외부 버그 #19537 fix

## 결과
- plan 모드 없이 Codex 사용자도 동일한 lifecycle 흐름 적용.
- settings.json 단순화.

## 후속 작업
잔여 모니터링: fork 다운스트림 사례 0건 → [가설] 라벨. 첫 fork 사용자 피드백이 [관측됨] 승격 경로.

## 참고
- ADR-010 (multi-agent compatibility)
- ADR-022 (Ratchet Principle — enabling 정책, [관측됨] 라벨)
