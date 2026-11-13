---
'@nebula.js/cli-serve': patch
---

Do not warn about a missing fixture path when `--fixturePath` was not passed. The default `test/component` is silent, in the console and in the build; a `--fixturePath` that was passed and does not exist is still reported.
