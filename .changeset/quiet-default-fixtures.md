---
'@nebula.js/cli-serve': patch
---

Do not warn about a missing fixture path as the bundler builds `nebula serve`. When serve has started it says where fixtures are loaded from, or that the fixture path does not exist, and a fixture that cannot be loaded is reported in the browser console.
