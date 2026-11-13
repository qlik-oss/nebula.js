---
'@nebula.js/cli-serve': patch
---

Print one warning when no fixtures are found under the fixture path, and drop the duplicate bundler warning (`Can't resolve 'fixtures'`) that `nebula serve` printed on every start.
