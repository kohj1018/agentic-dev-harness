# ADR-040 — 외부 리서치 capability (researcher agent + research-pack)

> scope: boilerplate

## Status
accepted

## 배경
- [관측됨] 기존 6개 agent(architect/planner/builder/validator/reviewer/qa)의 tools에 WebSearch/WebFetch가 없다 → 구현 중 외부 라이브러리(결제/인증/SDK)의 *최신 공식문서*를 확인할 수 없고, 모델 지식 컷오프로 stale API를 쓸 위험이 있다.
- [관측됨] 딥리서치·스택 추천·MCP 최신 설정 조회 모두 "사용자가 직접 붙여넣기"에만 의존.
- [외부실증] Anthropic "Effective context engineering" / subagent 가이드 — 리서치/딥다이브는 서브에이전트의 정전(canonical) 용도(탐색 노이즈 격리, 1,000~2,000 토큰 요약만 반환 — 현재 cap은 ADR-046 ≤600 참조).

## 결정
1. **`researcher` agent 신설** — tools: `Read, Glob, Grep, WebSearch, WebFetch`. **코드·문서 직접 수정 권한 없음(Write/Edit 없음)** = report-only. model: sonnet. context-pack: minimal.
2. **`research-pack` skill 신설** — 메인 세션에서 실행(discover-product 패턴, `context: fork`/`agent:` 미지정). 무거운 웹 조사는 **researcher agent에 `Agent` 위임**(노이즈 격리, 결론만 반환), 반환된 결론으로 리서치 노트 1개를 `docs/10-charter/insights/<date>-<slug>.md`에 작성(Write는 본 skill의 allowed-tools, 대상은 insights/ 단일 위치). **researcher agent는 report-only(Write 없음) 유지** — 노트 작성은 research-pack skill의 책임이라 `agent: researcher`와 Write 권한이 충돌하지 않는다.
3. **신뢰도·출처 규율**: 모든 발견에 출처 URL + 발행일 + *공식/1차/2차* 신뢰도 라벨 + "제품에 대한 추론"(사실과 분리). 외부 리서치 결과는 DISCOVERY Evidence Log(ADR-035#amend-2)의 `external-research` type 항목으로 연결.
4. **`data-analyst`·별도 insight agent는 만들지 않는다** — insight 합성은 discover-product/--update의 한 단계(skill)로 충분(역할 중복·복잡도 회피).
5. **위임 경로**: implement-workitem이 외부 라이브러리 불확실성에 부딪히면 builder가 직접 웹서핑하지 않고 *메인 세션이 researcher에 위임*(builder 컨텍스트 오염 회피). MCP 연결 절차(ADR-043)·bootstrap-stack --recommend(ADR-041)도 researcher로 최신 설정/지형을 조회한다 — fork+Agent 미보유 skill(bootstrap-stack 등)은 *사전 `/research-pack` 노트*를 참조하는 방식.

## 근거
- 웹 도구를 기존 agent(예: reviewer)에 붙이면 그 agent의 권한 표면이 부적절히 넓어진다(reviewer가 코드리뷰 중 웹서핑 = scope creep). 전용 최소권한 agent가 더 깨끗하다.
- agent는 1개만 추가(researcher) — debugger·data-analyst는 만들지 않음(ADR-006 단순성, 역할 중복 회피).

## 결과
- `.claude/agents/researcher.md`, `.claude/skills/research-pack/SKILL.md`, `docs/10-charter/insights/` 디렉터리.

## Ratchet 강도 (ADR-022)
- enabling (약) — 새 capability, opt-in. 단 researcher의 "report-only(코드/문서 미수정)"는 constraint(약) 가드.

## 참고
- ADR-035 (Evidence Log 연결), ADR-041 (스택 추천 그라운딩), ADR-043 (MCP 설정 조회), ADR-019 (context-pack minimal).
