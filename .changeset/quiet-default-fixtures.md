---
'@nebula.js/cli-serve': patch
---

Remove the default of `--fixturePath` (`test/component`) so that `nebula serve` says nothing about fixtures, and does not warn in the build, when there is none. With a `--fixturePath` it says where fixtures are loaded from, or that the path does not exist. A fixture that cannot be loaded is reported in the browser console.
