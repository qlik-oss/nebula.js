---
'@nebula.js/cli-build': patch
---

fix: a systemjs bundle only registers the peer packages by their names, not `react/jsx-runtime` or `react-dom/client`, and the build cache no longer outlives a change of nebula.config.js
