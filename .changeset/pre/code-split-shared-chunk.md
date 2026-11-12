---
'@nebula.js/cli-build': patch
---

fix: a code split es module build no longer fails with "Multiple assets emit different content to the same filename" when the entry and a dynamic import share modules. The shared modules are written to `<entry>.<id>-<contenthash>.js` and the entry file re-exports them.
