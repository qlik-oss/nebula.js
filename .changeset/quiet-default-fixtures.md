---
'@nebula.js/cli-serve': patch
---

Do not warn when the fixture path does not exist as `nebula serve` starts, like in nebula 7. The bundler warning `Can't resolve 'fixtures'` is dropped, and the error when a fixture is requested names the fixture.
