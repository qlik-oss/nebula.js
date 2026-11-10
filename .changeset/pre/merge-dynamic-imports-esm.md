---
'@nebula.js/cli-build': patch
---

fix: merge the chunks of dynamic imports into the bundle of a single file build, so that the esm build of a package with dependencies that use import() no longer fails with "Multiple assets emit different content to the same filename"
