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

If you want to propose changes to this project, let us know by [filing a issue](https://github.com/qlik-oss/nebula.js/issues/new/choose).

If the proposal includes new designs or bigger changes, please be prepared to discuss the changes with us so we can cooperate on how to best include them.

## <a name="developing"></a> Developing

### Prerequisites

- [Node.js](https://nodejs.org/) 10+ and [yarn](https://yarnpkg.com) 1.9.4 installed

### Project structure

This is a multi-package repository which uses [lerna](https://github.com/lerna/lerna) for package task management and publishing.

- `packages` - all packages are in this folder
  - `build`: cli command to build a supernova
  - `cli`: entry point for all cli commands
  - `create`: cli command for creating a supernova project
  - `nucleus`: JavaScript library for mashups
  - `sense`: cli command to build a Qlik Sense extension from a supernova
  - `serve`: cli command to start a development server for rapid prototyping of a supernova
  - `supernova`: JavaScript API for consuming and visualizing QIX data
  - `ui`: [private] ui components
- `test/`: contains test configs

### Development workflow

- `yarn` generates UMD bundles for all packages
- `yarn run build`
- `yarn run lint` checks code style
- `yarn run test` runs all tests

### Cutting a release

**Prerelase**

```sh
npx lerna version --no-git-tag-version --no-push --no-conventional-commits --preid alpha --exact
```

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

   In the Github UI of your fork, create a Pull Request to the `master` branch of the master repository.

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
- **style:** Changes to code style formatting (white space, commas etc)
- **test:** Changes in test cases of production code

#### Scope

The `<scope>` of the commit is optional and can be omitted. When used though, it should describe the place or part of the project, e.g. `docs(examples)`, `feat(data)` etc.

## <a name="cla"></a> Signing the CLA

We need you to sign our Contributor License Agreement (CLA) before we can accept your Pull Request. Visit this link for more information: https://github.com/qlik-oss/open-source/blob/master/sign-cla.md.
