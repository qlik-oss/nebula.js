---
'@nebula.js/cli-build': patch
---

fix: a code split es module build no longer fails with "Multiple assets emit different content to the same filename" when the entry and a dynamic import share modules. The shared modules are written to `<entry>.<id>-<contenthash>.js` and the entry file re-exports them.

The chunks of a code split build are written to `chunks` beside the entry (`dist/chunks/<entry>.<name>-<contenthash>.js`), and are imported from there, so that the entry is the only file that a package field names. Include the `chunks` directory where the files of the package are listed.
