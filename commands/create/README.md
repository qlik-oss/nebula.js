# @nebula.js/cli-create

Scaffold a nebula visualization or mashup.

## Install

```sh
npm install -g @nebula.js/cli
```

## Usage

### CLI

```sh
nebula create <name>

Create a visualization

Commands:
  nebula create mashup <name>  Create a mashup

Positionals:
  name  name of the project                                  [string] [required]

Options:
  --version   Show version number                                      [boolean]
  --install   Run package installation step            [boolean] [default: true]
  --pkgm      Package manager                  [string] [choices: "npm", "yarn"]
  --picasso   Picasso template [string] [choices: "none", "minimal", "barchart"]
  --author    Package author                                            [string]
  -h, --help  Show help                                                [boolean]
```

```sh
nebula create mashup <name>

Create a mashup

Positionals:
  name  name of the project                                  [string] [required]

Options:
      --version  Show version number                                   [boolean]
      --install  Run package installation step         [boolean] [default: true]
      --pkgm     Package manager               [string] [choices: "npm", "yarn"]
      --picasso  Picasso template
                               [string] [choices: "none", "minimal", "barchart"]
      --author   Package author                                         [string]
  -h, --help     Show help                                             [boolean]
```

### Example

#### Create a visualization

```sh
nebula create hello-sunshine
```

Running nebula create without --picasso prompts a selection of the available
options.

- none: without the picasso.js template
- minimal: a basic setup of picasso.js is ready
- barchart: a bar chart component created by picasso.js is ready

You can find the [tutorial](https://qlik.dev/extend/extend-quickstarts/first-extension) to build a basic nebula visualization using nebula.js.

#### Create a mashup

```sh
nebula create mashup hello-mashie
```

You can find the [tutorial](https://qlik.dev/embed/integrate-web-apps/build-a-simple-mashup) to build a basic mashup using nebula.js.

#### Package manager

Create a nebula visualization project called `sn-table` with the npm package manager
instead of yarn

```sh
nebula create sn-table --pkgm npm
```

Create a mashup called `table-mashup` with the npm package manager instead of yarn

```sh
nebula create mashup table-mashup --pkgm npm
```

#### Package installation step

Create a nebula visualization project and do not install any dependencies yet

```sh
nebula create sn-table --install false
```

Create a mashup and do not install any dependencies yet

```sh
nebula create mashup table-mashup --install false
```
