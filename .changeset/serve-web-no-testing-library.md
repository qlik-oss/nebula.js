---
'@nebula.js/cli-serve': patch
---

fix: the pages of nebula serve no longer bundle `@testing-library/react`, which warned about `act` when they were built
