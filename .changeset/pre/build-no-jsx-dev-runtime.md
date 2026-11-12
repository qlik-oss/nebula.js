---
'@nebula.js/cli-build': patch
---

fix: a development build, as `nebula serve` makes, no longer imports `react/jsx-dev-runtime`. React is left out of the bundle and the host of it, such as the page of nebula serve, has the production runtime, so the module could not be loaded.
