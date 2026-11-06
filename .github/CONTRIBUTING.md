# nebula.js contributing guide

nebula.js is still in an early stage and is therefore very much open to suggestions and in need of all kinds of contributions.

- [Code of conduct](#code-of-conduct)
- [Bugs](#bugs)
- [Proposing a change](#features)
- [Developing](#developing)
- [Git guidelines](#git)
- [Signing the CLA](#cla)

## <a name="code-of-conduct"></a> Code of conduct

Please read and follow our [Code of conduct](https://github.com/qlik-oss/open-source/blob/master/CODE_OF_CONDUCT.md)

## <a name="bugs"></a> Bugs

Bugs can be reported by filing a [new bug issue](https://github.com/qlik-oss/nebula.js/issues/new?template=bug.md) in the repository. Please make sure to browse through existing [issues](https://github.com/qlik-oss/nebula.js/labels/bug) before creating a new one.

## <a name="features"></a> Proposing a change

If you want to propose changes to this project, let us know by [filing an issue](https://github.com/qlik-oss/nebula.js/issues/new/choose).

If the proposal includes new designs or bigger changes, please be prepared to discuss the changes with us so we can cooperate on how to best include them.

## <a name="developing"></a> Developing

### Prerequisites

- [Node.js](https://nodejs.org/) 24.0.0+ and [pnpm](https://pnpm.io) 1+ installed

### Project structure

This is a multi-package repository which uses [pnpm workspaces](https://pnpm.io/workspaces), [Turborepo](https://turborepo.dev) for tasks and [Changesets](https://github.com/changesets/changesets) for versions and publishing.

- `apis` - JavaScript APIs
  - `nucleus`: JavaScript library for mashups
  - `supernova`: JavaScript API for consuming and visualizing QIX data
  - `stardust`: Public JavaScript API which exposes the nucleus and supernova APIs
  - `enigma-mocker`: Public JavaScript API which creates a mocked enigma app to render visualizations without a connected Qlik engine
  - `snapshooter`: Public JavaScript API which captures rendered charts as images
  - `conversion`: [private] Provides conversion functionality to extensions with hyperCubes.
  - `theme`: [private] Provides access and consumption of the currently applied theme
  - `locale`: [private] Handles translation strings and generates all locales
- `commands` - CLI commands
  - `build`: cli command to build a supernova
  - `cli`: entry point for all cli commands
  - `create`: CLI command for creating a supernova project
  - `sense`: CLI command to build a Qlik Sense extension from a supernova
  - `serve`: CLI command to start a development server for rapid prototyping of a supernova
- `packages`
  - `ui`: [private] UI components
- `test/`: contains test configs

### Visualizing packages

To better understand packages' relations, you can use Turborepo to generate a visualization of the task graph.

To print the graph for the build task, run:

    pnpm exec turbo run build --graph

Add a file name such as `--graph=graph.html` to write it to a file.

### Development workflow

- `pnpm` install all dependencies
- `pnpm run build` generate UMD bundles for all packages and an ESM bundle for stardust. Tasks are orchestrated by [Turborepo](https://turborepo.dev) in dependency order, and outputs are cached in `.turbo/cache`, so unchanged packages are restored instead of rebuilt
- `pnpm run lint` check code style
- `pnpm run format` format code style
- `pnpm run test` run all tests

### Cutting a release

Releases are versioned and published by [Changesets](https://github.com/changesets/changesets) from the `release` workflow:

1. A pull request that changes a published package adds a changeset with `pnpm changeset` (`pnpm changeset add --empty` when it changes none). CI fails without one, except for Renovate and the release pull request.
2. Merged changesets collect in a "version packages" pull request, which bumps the version of all packages (they share one), updates the changelogs and the API specification. Dependency updates of runtime dependencies since the last release are added to it as one changeset by `pnpm version-packages`.
3. Merging that pull request publishes the public packages to npm with provenance (trusted publishing, no token), tags `v<version>` and creates the GitHub release.

**Pre-release**

The alpha branch is in the pre mode of Changesets (`.changeset/pre.json`), so the release workflow publishes its versions as `<version>-alpha.<n>` with the `alpha` npm tag, and the GitHub release is a prerelease. The base version (x.y.z) is set once by the highest bump of the changesets in the cycle, a `major` changeset gives 8.0.0, and the following releases only raise the `alpha.<n>` part.

**From the alpha branch to `main`**

Pre mode has to be left before the branch reaches `main`, and a push to the alpha branch needs a pull request, so the exit is done on a temporary release branch that is the head of the pull request to `main`:

1. Branch `release/<version>` off the alpha branch and run `pnpm changeset pre exit`. Commit the change of `.changeset/pre.json`.
2. Open a pull request from `release/<version>` to `main`. It holds the whole history of the alpha branch plus the exit. Resolve any conflict with the versions and changelogs of `main` in favour of the new major version, keeping the older entries.
3. Merge it without squashing, so the changesets keep their history. The alpha branch stays in pre mode and is unchanged.
4. The release workflow on `main` opens the "version packages" pull request. It computes the stable version from the changesets of the whole cycle (8.0.0), and merging it publishes the packages with the `latest` tag.
5. Delete the `release/<version>` branch.

Do not merge the alpha branch or a branch still in pre mode to `main`, since `main` would then release alphas.

## <a name="git"></a> Git Guidelines

Generally, development should be done directly towards the `master` branch.

### Branching

1. Fork and clone the repository

   ```sh
   git clone git@github.com:YOUR-USERNAME/nebula.js.git
   ```

1. Create a branch in the fork

   The branch should be based on the `master` branch in the master repository.

   ```sh
   git checkout -b my-feature-or-bugfix master
   ```

1. Commit changes on your branch

   Commit changes to your branch, following the commit message format.

   ```sh
   git commit -m "fix: properly formatted SET statements."
   ```

1. Push the changes to your fork

   ```sh
   git push -u myfork my-feature-or-bugfix
   ```

1. Create a Pull Request

   > Before creating a Pull Request, make sure to sign the [CLA](#cla)

   In the GitHub UI of your fork, create a Pull Request to the `master` branch of the master repository.

   If the branch has merge conflicts or has been outdated, please do a rebase against the `master` branch.

### <a name="commit"></a> Commit message guidelines

Commit messages should follow the [commit message convention](https://conventionalcommits.org/).

#### Type

Should be one of the following:

- **build:** Changes that affect the build system or external dependencies
- **chore:** Changes to build and dev processes/tools
- **ci:** Changes to the CI configuration files and scripts
- **docs:** Changes to documentation
- **feat:** A new feature
- **fix:** A bug fix
- **perf:** A code change that improves performance
- **refactor:** Changes to production code that is neither a new feature nor a bug fix
- **revert:** Reverts a previous commit
- **style:** Changes to code style formatting (white space, commas, etc)
- **test:** Changes in test cases of production code

#### Scope

The `<scope>` of the commit is optional and can be omitted. When used though, it should describe the place or part of the project, e.g. `docs(examples)`, `feat(data)` etc.

## <a name="cla"></a> Signing the CLA

We need you to sign our Contributor License Agreement (CLA) before we can accept your Pull Request. Visit this link for more information: <https://github.com/qlik-oss/open-source/blob/master/sign-cla.md>.
