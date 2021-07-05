# @nebula.js/cli

Command line interface for nebula.js

## Install

```sh
npm install -g @nebula.js/cli
```

## Usage

```sh
nebula <command> [options]

Commands:
  nebula build          Build visualization
  nebula create <name>  Create a visualization
  nebula serve          Dev server
  nebula sense          Build a nebula visualization as a Qlik Sense extension

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]
```

## How to run cli locally

install all dependencies:

```sh
yarn
```

test it out:

```sh
node lib/index.js -h
```

if we tried running it by calling it directly with nebula, registering the binary globally:

```sh
npm link
```

run script locally like so:

```sh
nebula -h
```
