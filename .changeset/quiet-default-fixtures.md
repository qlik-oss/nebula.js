---
'@nebula.js/cli-serve': major
---

feat!: `nebula serve` has no default for `--fixturePath`, so it says nothing about fixtures, and does not warn in the build, when a project has none. With a `--fixturePath` it says where fixtures are loaded from, or that the path does not exist. A fixture that cannot be loaded is reported in the browser console.

**Breaking:**

- `--fixturePath` no longer defaults to `test/component`. A project with fixtures there passes `--fixturePath test/component`.
