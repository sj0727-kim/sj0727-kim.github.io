# MEMORY.md

## Goal
- 반응형 개인 프로페셔널 웹사이트를 정적 `HTML`, `CSS`, `JavaScript`만으로 만들고, `Games` 메뉴와 지렁이 게임, 랜덤 이동 적, GitHub Pages 배포까지 완성한다.

## Scope
- In: 반응형 UI, 상단 내비게이션, 프로필 섹션, `Games` 섹션, 지렁이 게임, 터치 조작, 랜덤 적, GitHub Pages
- Out: 백엔드, DB, 로그인, 결제, 외부 API, 확인되지 않은 개인 정보의 사실 확정

## Execution
- Mode: `CODEX_WORKER + CLAUDE_VERIFIER`
- Claude model: 미확정
- Last test: `node --check script.js` PASS
- Fallback: Claude 사용 불가 시 `CODEX_FALLBACK`

## Current State
- Status: `READY`
- Completed: 반응형 뼈대와 기록 정리
- Next: 지렁이 게임 최종 구현 및 배포
- Retry: `0`
- Fingerprint: 없음
- Blocker: 없음
- Last good commit / URL: 없음

## Acceptance
- 모바일, 태블릿, 데스크톱에서 레이아웃이 유지된다.
- `Games` 메뉴로 게임 섹션에 바로 이동할 수 있다.
- 지렁이 게임이 키보드와 모바일 터치로 조작된다.
- 랜덤하게 움직이는 적이 게임에 포함된다.
- GitHub Pages에서 정상적으로 열리고, 주요 기능이 동작한다.

## Guardrails
- 확인되지 않은 프로필 정보는 `[사람 확인 필요]`로 표기한다.
- 토큰, 비밀값, 인증 정보는 출력하거나 문서화하지 않는다.
- 코드 수정, 테스트, push, 배포는 승인된 단계에서만 수행한다.
- 실패 원인과 직접 관련된 파일만 최소 수정한다.

## Retry / HITL
- 같은 실패가 3회 연속 반복되면 `BLOCKED` 또는 `HITL_REQUIRED`로 전환한다.
- 같은 `fingerprint`가 2회 연속 반복되면 원인 재점검을 우선한다.
- 프로필 사실, 게임 규칙, 난이도, 배포 판단은 필요 시 사람 확인을 요청한다.

## Recent Loops
| Loop | Status | Execution Mode | Changed File | Test Result | Retry | Next Action |
|---|---|---|---|---|---:|---|
| 1 | PASSED | CODEX_WORKER | `index.html`, `styles.css`, `script.js` | PASS | 0 | 게임 로직 추가 |
| 2 | READY | 문서 설계 | `STEP1_ANALYSIS.md` | 미실행 | 0 | AORR 정리 |
| 3 | READY | 문서 설계 | `AORR.md`, `MEMORY.md`, `AORR_LOG.md` | 미실행 | 0 | 다음 루프 준비 |
| 4 | READY | CODEX_WORKER | `index.html`, `styles.css`, `script.js`, `game.js` | `node --check script.js`, `node --check game.js` PASS | 0 | 배포 커밋 준비 |

## Deployment
- Repository: `https://github.com/sj0727-kim/sj0727-kim.github.io.git`
- URL: `https://sj0727-kim.github.io`
- Approval: 미요청
