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

#### Create a mashup

```sh
nebula create mashup hello-mashie
```
