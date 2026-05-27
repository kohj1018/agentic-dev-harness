---
name: research-pack
description: 외부 공식문서·1차 자료·논문을 조사해 신뢰도 라벨이 붙은 리서치 노트를 작성한다. 기획 evidence 또는 구현 전 docs 확인용. (report + 노트 작성 전용 — 코드·기획 문서 수정 X)
argument-hint: "[research question or topic]"
disable-model-invocation: true
allowed-tools: Read Glob Grep WebSearch WebFetch Write Agent
context-pack: minimal
---

이 skill은 **리서치 + 노트 작성 전용**이다. 코드·workitem·charter 문서를 수정하지 않는다 (노트 파일 1개만 작성).
> 메인 세션에서 실행한다(`context: fork`/`agent:` 미지정 — discover-product 패턴). 무거운 웹 조사는 researcher agent에 `Agent` 위임해 메인 컨텍스트 오염을 막는다. researcher는 report-only이고, 노트 Write는 본 skill이 한다.

너의 역할은 입력 질문을 *1차/공식 출처* 기준으로 조사해 신뢰도 라벨이 붙은 리서치 노트를 작성하는 것이다.

입력:
- `$ARGUMENTS`에 리서치 질문/주제가 들어온다 (예: "Stripe Payment Intents 최신 idempotency 정책", "회고 SaaS 경쟁 제품 onboarding 패턴").

반드시 할 일:
1. 질문을 검증 가능한 하위 질문 2~4개로 쪼갠다.
2. **조사**: 무거운 웹 조사는 researcher agent에 `Agent` 위임(노이즈 격리 — 결론 1~2K 토큰만 반환). 가벼운 단건 확인은 본 skill의 WebSearch/WebFetch로 직접. *공식문서·1차 자료·논문* 우선, 2차 블로그는 보조.
3. 각 발견에 출처 URL + 발행일 + `[공식]`/`[1차]`/`[2차]` 신뢰도 라벨.
4. "사실"과 "제품/구현 시사점(추론)"을 분리한다.

마지막 단계 — 리서치 노트 작성:
- 경로: `docs/10-charter/insights/<YYYY-MM-DD>-<slug>.md` (slug는 주제 kebab-case).
- 양식:

```markdown
# Research: <주제>

- 작성일: <YYYY-MM-DD>
- 질문: <원 질문>
- type: research | external-research

## 발견 (신뢰도 라벨)
- [공식] <발견> — <URL> (<발행일>)
- [1차] ...
- [2차] ...

## 사실 ↔ 추론 분리
- 사실: ...
- 제품/구현 시사점(추론): ...

## DISCOVERY 연결 제안
- Evidence Log(§14) 추가 후보: source=<URL>, type=external-research, finding=<...>, confidence=<상/중/하>
- 관련 가정/기회: <A-N 또는 신규>
```

마지막 출력 (메인에 텍스트로):
- 노트 경로
- 핵심 발견 3개 + 신뢰도 라벨
- DISCOVERY Evidence Log 반영 권장 (자동 반영 X — `/discover-product --update`가 회수)

가드:
- workitem / charter / 코드 일체 수정 금지 (insights/ 노트 1개만 Write).
- 추측을 사실처럼 쓰지 않는다. 출처 없는 주장 금지.

## Context 정책 (ADR-019)
`반드시 먼저 읽을 파일`은 *최소 충분*. 추가 자료는 발화 시 인용 — 사전 fork-load 금지.
