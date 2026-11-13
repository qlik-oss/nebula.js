# Migrating to nebula.js 8

Copy the prompt below into a coding agent (for example Claude Code) at the root of the repository you want to update.

## Prompt

````markdown
Update this repository from nebula.js 7.x to nebula.js 8 (`@nebula.js/*` packages at the latest stable 8.x release, not an alpha or other prerelease).

## Context

Nebula 8 rewrote `nebula build` (rspack/rslib instead of rollup). Known breaking change:

- 7.x `nebula build` wrote a UMD bundle to `package.json` `main`, and `nebula sense` packaged that file.
- 8.x no longer writes UMD. `nebula build` writes an ES module to `package.json` `module`, and `nebula sense` reads only `module`.
- Symptom of a missing field: `Error: package.json has no "module" field, the es module that nebula build writes is what nebula sense builds`. Note that `nebula build` itself skips the ESM step silently ("Create ESM bundle" finishes in about 1 ms and writes nothing).

## Steps

1. Bump every `@nebula.js/*` dependency (cli, cli-build, cli-sense, cli-serve, stardust, and others) to the same stable 8.x version. Use the repo's package manager and keep lockfile changes minimal.
2. Find every package that runs `nebula build`, `nebula sense` or `nebula serve`, including via wrapper scripts (check `scripts/` for files that call `@nebula.js/cli-build` or `cli-sense` programmatically).
3. For each of those packages, add a `"module"` field to `package.json`:
   - Published package: keep `main` and set `module` to the same file as `main`. Make sure `"type": "module"` is set if consumers import the file as ESM.
   - Private package built only with `nebula sense`: set `module` and remove the unused `main`.
4. Before removing or changing any `main`, grep the repo for reads of it (pack/prepare scripts, `files` lists, e2e config, CI) and update them.
5. Run the build for each package (`pnpm build`, or the repo's equivalent), then `nebula sense` if used, then the unit and e2e tests. Fix errors you can attribute to the upgrade.
6. Read the nebula.js changelog and release notes from your current version up to 8.x for other breaking changes (CLI flags, config file keys, externals/peer handling, CSS and Sass/Less loading, serve behaviour). Apply any that affect this repo.

## Output

- A summary of every file changed and why.
- Any build or test failure you could not fix, with the exact error.
- Anything you assumed or did not verify.

Do not commit or push unless asked.
````
