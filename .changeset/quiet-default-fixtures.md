---
'@nebula.js/cli-serve': patch
---

Do not warn when the fixture path does not exist as `nebula serve` starts, like in nebula 7. The bundler warning `Can't resolve 'fixtures'` is dropped, and a fixture that cannot be loaded is reported in the browser console with the path of its file.
