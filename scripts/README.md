# scripts

이 디렉터리는 프로젝트별 자동화 스크립트를 두는 자리다.

기본 보일러플레이트에서는 OS/셸/런타임 종속성을 피하기 위해
공유 스크립트를 강제로 포함하지 않는다.
UI design gate도 baseline **프로젝트 실행 파일**로 두지 않는다. 검증된 정본은
`stack-guard`의 JIT asset으로 격리하고, `/stack-guard`가 UI로 판정한 프로젝트에서만
project-native adapter로 복사·배선한다. 실제 명령·경로·source digest는
`docs/00-meta/STACK_SETUP_PLAN.md ## Design Gate Adapter`에 기록한다(ADR-058#amend-2).

권장 방식:
- 프로젝트의 스택이 정해진 뒤
- 그 스택에 맞는 검증 스크립트, hook 스크립트, CI 스크립트를 생성한다

예시:
- Node.js / pnpm 프로젝트 → lint, test, typecheck 스크립트
- Python 프로젝트 → pytest, ruff, mypy 스크립트
- Bash/POSIX 환경이 보장되는 프로젝트 → shell hook 스크립트
- PowerShell 환경이 보장되는 프로젝트 → ps1 스크립트
