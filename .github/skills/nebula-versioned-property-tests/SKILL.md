---
name: nebula-versioned-property-tests
description: Set up (or extend) versioned-properties tests for nebula.js charts, which check that objects saved by older releases of a chart still render and run. Walks the git history of the chart's initial properties, generates one fixture per release where they changed, and adds typed fixtures, a render test, a defaults snapshot and optionally Playwright rendering scenarios. Works for a single chart repo and for monorepos with several charts. Use when asked to add backwards compatibility / legacy / old-version / saved-object tests to a chart, when a property is added or changed and old objects must keep working, or when a "works for new objects but not for old ones" bug is reported.
---

# Versioned property tests for nebula charts

Objects that users saved are never migrated: the properties in the app are whatever the chart's `qae.properties` was
when the object was created. A new release has to handle objects that lack every property added since. These tests
keep a set of real old properties around and check that the current chart still handles them.

The idea, for every chart in scope:

1. Find where the chart defines its initial properties.
2. Go through git history and collect the properties as they were at each release where they changed.
3. Turn each of them into the layout the chart renders from.
4. Test that every one of them type-checks, renders and runs, and that the current defaults don't change unnoticed.

Do not write fixtures by hand, and do not commit, push or open PRs unless asked. Report what you added.

## Step 1: scope and discovery

Work from the git root. Find out what is in scope **before** generating anything.

- Look for nebula charts: packages with a `package.json` that has `@nebula.js/stardust` as a (peer) dependency, a
  `nebula.config.js`, or an entry exporting `qae: { properties, data }`. In a monorepo (`pnpm-workspace.yaml`,
  `workspaces`, `packages/*`, `charts/*`, `lerna.json`) there will be several.
- If there is more than one chart, or it is unclear which one is meant, **ask the user which charts are in scope**
  (list the ones you found). Do not assume "all". Each chart gets its own fixtures and tests.
- For each chart in scope find the module that defines the initial properties: follow `qae.properties` from the
  chart's entry (`src/index.*`). Often `object-properties.*`, `properties.*` or a function that builds them.
  Note: whether it's a plain object or a function (of `env`/flags/theme), whether it uses `process.env.*` (for example
  `PACKAGE_VERSION`), which other modules it imports, and whether the file moved in history
  (`git log --follow --name-status -- <file>`).
- Find how tags/releases are named: `git tag --sort=version:refname | head`. Monorepos often use per-package tags
  (`sn-kpi@1.2.3`, `@scope/pkg@1.2.3`); use `--tag-prefix` for that.

## Step 2: go through the history

Use the bundled script, from the repo root (it needs `git`, `node` and `npm`; it installs esbuild in a temp dir to bundle
old versions of the module, so TypeScript and relative imports work):

```bash
node <skill-dir>/scripts/versioned-properties.mjs history --entry <path/to/properties-module> [options]
```

It evaluates the module at every release tag and prints only the releases where the properties changed, with what
was added (`+`), removed (`-`) or changed (`~`). All options are documented in the header comment of the script. Useful ones:

- `--export <name>` and `--call '<json array>'` when the properties are a named export or a function.
- `--define KEY=VALUE` for build-time replacements (`@tag` becomes the release version). Default replaces
  `process.env.PACKAGE_VERSION`.
- `--tag-prefix`, `--tag-pattern`, `--tags a,b,c` to pick the releases; `--ignore-key` for top level keys that change
  every release (default `version`).

If the module does not exist at old tags the script says so; find where it lived (`git log --follow`) and rerun with
that path for those tags, the property format might also have been completely different back then.

**Decide with the user which vintages become fixtures** when the list is long: it is usually enough to take the
first release, the release after every change that adds/removes/renames a property or changes how it is used, and
the current release. Skip releases that only flip a default back and forth. Show the user the list of tags you chose
and what each one represents, then write them:

```bash
node <skill-dir>/scripts/versioned-properties.mjs fixture --entry <module> --tag <tag> --out <chart>/test/versioned/<tag>.properties.json
```

(or `history ... --write --out <dir>` for all changed releases at once, then delete the ones you don't want).

Also add one hand-written **minimal** fixture with only what a very old or odd object would have (an empty object, or
only the properties required by the engine). Hand-written is fine for that one only.

## Step 3: from properties to layout

The chart renders from the **layout**, not from the properties. Work out how the two relate for this chart, this
differs a lot between charts:

- **Properties ≈ layout** (like the sn-action-button): the engine mostly returns the properties, with expressions
  evaluated and a few renames (e.g. `qStaticContentUrlDef` becomes `qStaticContentUrl`). A small `toLayout(properties)`
  function that applies those adjustments is enough.
- **Charts with data** (hypercubes, `qHyperCube`, `qListObject`, color/sort/label expressions): the layout also holds
  engine output (`qHyperCube.qDataPages`, `qSize`, `qDimensionInfo`, `qMeasureInfo`, `qSelectionInfo`, ...). Do not
  fake that from the old properties. Reuse the chart's existing rendering fixtures or enigma-mocker data
  (`test/component/*.fix.js`, `genericObjects[].getLayout`) as the data part, and lay the old properties over it:
  `toLayout(properties) = { ...dataLayoutFromExistingFixture, ...properties }` (and for hypercube definitions copy
  `qHyperCubeDef` into the matching `qHyperCube` shape if the chart needs it). Look at how existing tests build layouts
  and follow that.

If it is not obvious how the layout is derived, **ask the user** (or look at an existing serve/rendering fixture)
rather than guessing. Put `toLayout` next to the fixtures so the tests share it.

## Step 4: the tests

Match the chart's existing test setup (vitest/jest, TypeScript or not, existing mocks and helpers). Create, per chart:

1. **Fixtures index** (`versions.ts`/`versions.js`): imports every fixture and exports them as one object keyed by
   a description (`"v1.32.0 (before showLabel)"`). In TypeScript write `satisfies Record<string, <LayoutType>>`
   on the object so that `tsc` fails when the layout types reject a real old layout. If the types fail, the types are
   too strict: make that field optional, do not touch the fixture.
2. **Render/run spec** that loops over every version (`describe.each`) and checks the chart handles it:
   - the chart's render path doesn't throw and produces output (a DOM/style assertion that matches how the chart
     renders; for stardust charts, use the way the existing tests mount the chart: `@nebula.js/test-utils` `create`,
     or the chart's own render function with mocked `element`, `theme`, `app`, `model`, `interactions`);
   - when the chart has click/selection/action behavior driven by properties, run it with properties lacking the
     later-added fields (that is where `undefined` bites);
   - hooks/helpers that read the layout (e.g. image loading, query params) don't throw on missing parts.
3. **Defaults snapshot**: `expect(properties).toMatchSnapshot()` for the current initial properties, with a comment:
   "Failing here means the saved format changed. Add a fixture for the previous release, make new fields optional in the
   types, then update the snapshot". Update with `-u` only after reading the diff.
4. **A short README in the fixtures folder** or a comment in `versions.ts`: how the fixtures were generated (the
   command, the entry, the tags) so they can be regenerated.

Keep the fixtures as plain JSON. Don't edit fixtures after generating them, except through the generator.

Keep the tests deterministic and fast; one test per version for render and per action type for actions.

## Step 5: ask about rendering tests

**Ask the user whether they also want Playwright (visual) rendering tests.** They cost screenshot baselines and
maintenance, so don't add them unasked. If yes:

- Reuse the chart's existing rendering setup (`nebula serve` with enigma-mocker fixtures, `*.fix.js` files and a
  `*.render.js` Playwright spec that screenshots each fixture). If there is none, say so and ask before building it.
- Add 1-3 scenarios that reflect the interesting vintages (usually the first release, one major format change, and
  minimal). Build them from an existing fixture and remove what the old release lacked, so they stay small:

  ```js
  import base from "./scenario_default.fix";
  // A chart saved before border and icon existed
  export default () => {
    const fixture = base();
    const [object] = fixture.genericObjects;
    delete object.getLayout.style.border;
    return fixture;
  };
  ```
- Baselines must be generated on Linux like the CI. Prefer the repo's CI workflow for updating snapshots (often a
  workflow with an `update_snapshot` input that commits to the branch); pull before pushing again since a bot commit
  will be on the remote. Don't run docker-based snapshot scripts against a `node_modules` that is shared with the host,
  they can run `pnpm install` inside the container and wipe it.
- Tell the user the baselines are still missing and need to be generated and reviewed (a legacy chart should look like
  a default chart, not like an error).

## Step 6: verify and report

- Run the type check, the unit tests and the linter/formatter of the chart (check `package.json` scripts).
- Show the user: the charts in scope, the tags chosen and why, the files added, what `toLayout` does, anything you
  could not verify (Playwright baselines, tags where the module was missing), and any types you had to loosen.
- Offer, but don't do, the follow-ups: a PR, a CI snapshot update, and a note in the repo's contributing docs
  ("when adding a property: make it optional in the types and add a fixture").

## Pitfalls

- Tags in a monorepo are often per package; without `--tag-prefix` the script sees all of them. Check `git tag`.
- The properties module may import things that only exist in the old tree (that is why it is bundled from `git
  archive`); if it imports a package that isn't installed or a generated file, the evaluation fails. Add `--define`s
  for build-time constants, or point `--entry` to a smaller module.
- `version` and similar keys that change on every release are ignored for comparison but kept in fixtures.
- Don't mutate shared fixture objects in tests, clone first (`structuredClone`).
- A snapshot update that "just fixes the test" hides a saved-format change. Always read the diff and ask whether old
  objects will still work.
