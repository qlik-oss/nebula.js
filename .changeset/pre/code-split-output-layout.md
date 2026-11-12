---
'@nebula.js/cli-build': patch
---

fix: write a code split build (`--codeSplit`) to the files that the `module` and `systemjs` fields of package.json name, with the chunks beside them, and let `build({ watch: true })` watch the es module like `--watch` does

A code split build no longer writes `index.js` to the first directory of the field. This is a breaking change for 7.x wrapper scripts that move `dist/index.js` after a code split systemjs build (`mv dist/index.js ...`): the file is now named by the field, and the chunks are named `<entry>.<name>-<contenthash>.js` so that the es and systemjs bundles of one package do not overwrite each other.
