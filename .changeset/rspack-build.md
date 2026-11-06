---
'@nebula.js/stardust': major
---

Build the library, test-utils and snapshooter with Rslib instead of rollup. `@nebula.js/stardust` is an ES module only: `exports` has the ESM bundle (and a `development` build), the UMD bundle and its `main`, `unpkg` and `jsdelivr` entries are gone, and `dist/stardust.systemjs.js` is unchanged. The browser targets are those of `@qlik/browserslist-config`.
