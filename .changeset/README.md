# Changesets

A pull request that changes what is published adds a changeset, which says what changed and how the version is bumped:

```sh
pnpm changeset
```

All packages share one version (`fixed` in [config.json](config.json)), so the highest bump of the changesets in a release is applied to all of them. Use `pnpm changeset add --empty` for a pull request that does not change a published package (docs, tests, tooling).

Dependency updates from Renovate need no changeset. `pnpm version-packages` collects the updates of runtime dependencies since the last release into `dependency-updates.md` with [tools/renovate-changeset.cjs](../tools/renovate-changeset.cjs).

See [CONTRIBUTING](../.github/CONTRIBUTING.md#cutting-a-release) for how a release is made.
