# ADR-008 Conventional Commits 기본 채택

> scope: boilerplate

## Status
accepted

## 배경
`/finalize-workitem`이 도입되면서 커밋 메시지 양식의 표준이 필요해졌다. 일관된 양식은 다음을 가능하게 한다.
- changelog 자동화 가능성 (스택 확정 후)
- 커밋 단위 작업 추적
- 변경 종류(feat/fix/chore/...)에 따른 리뷰 우선순위 판단

## 결정
보일러플레이트의 기본 커밋 컨벤션은 [Conventional Commits](https://www.conventionalcommits.org)다.

기본 형식:
```
<type>(<scope>): <summary>

<optional body>
<optional footer (e.g., task ID 참조)>
```

기본 type 어휘: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`, `revert`.

## 근거
- 커뮤니티 표준이라 진입 비용이 낮다.
- 단순한 형식으로 메시지의 의도가 한눈에 보인다.
- changelog 도구 생태계가 잘 정비되어 있다.
- 보일러플레이트 자체가 다언어/다스택을 지원하므로 stack-agnostic한 표준이 필요하다.

## 결과
- `/finalize-workitem`이 커밋 메시지 초안을 Conventional Commits 형식으로 생성한다.
- charter에서 다른 컨벤션을 명시적으로 override하지 않는 한 기본은 Conventional Commits.

## 후속 작업
- 사용자가 다른 컨벤션을 원하면 charter에서 명시적으로 override + 새 ADR로 결정 보존.
- changelog 자동화는 스택 확정 후 별도 task로 도입.

<a id="adr-008-amend-1"></a>
## Amendment 1 (2026-05-15) — 모노레포 scope 컨벤션

### 결정
모노레포 감지 시 Conventional Commits scope = 패키지명. 예:
- `feat(api): /me 엔드포인트 추가`
- `feat(web): 로그인 폼 검증`
- `feat(shared): Date 유틸 함수`

`/bootstrap-stack`의 monorepo 라운드가 scope vocabulary 목록을 박는다.

### 근거
- 모노레포에서 scope 즉흥 결정은 git log 가독성 저하 + 자동 changelog 분기 어려움.

### 단일 repo
단일 repo 케이스는 scope를 생략하거나 feature/module명을 자유 사용 — 본 amendment는 모노레포 전용.

<a id="adr-008-amend-2"></a>
## Amendment 2 (2026-05-15) — `Refs:` footer 컨벤션

### 결정 (컨벤션 — 단정형)
commit 메시지 footer는 `Refs:` 라인 1개를 포함한다 (CODE_LINEAGE.md 트리거 도달 시 derived view의 SSOT):

```
feat(auth): implement /me endpoint

Refs: T-003 (AC-2, AC-3)
```

- `Refs:` 값은 `T-NNN (AC-X, AC-Y)` 형식.
- 다중 task 묶음 commit은 `Refs: T-001, T-002` 형식.
- lock file 화이트리스트 commit(ADR-007#amend-1)은 `Refs: chore` 또는 생략 가능.
- PR 본문 footer는 `Refs: ADR-NNN` 형식 — commit footer의 `T-NNN` 형식과 키는 동일하나 값의 형식이 다름 (grep·자동 도구에서 정규식으로 분리 가능한 의도적 분리).

### 실행 (skill — 권장형)
`/finalize-workitem` skill은 commit 메시지 footer 누락 발견 시 *footer 추가 권장 텍스트* 출력. 자동 차단은 하지 않음 (사용자 결정 — ADR-007 책임 경계 정합).

### 근거
- CODE_LINEAGE.md(ADR-018, P1 트리거 보류)가 git log + footer 기반 derived view → footer가 SSOT.
- `Refs:` 키 통일이 `Refs:` vs `ADR:` 키 분리보다 grep 패턴 단순.
