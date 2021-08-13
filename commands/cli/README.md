# @nebula.js/cli

Command-line interface for nebula.js

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

## How to run nebula CLI locally and globally

Requirements:

- Node.js
- yarn

Clone the repository:

```sh
git clone https://github.com/qlik-oss/nebula.js
```

From the root directory, run the following command to install all the necessary dependencies of nebula CLI:

```sh
yarn
```

Test nebula CLI out locally to see help info using node.js:

```sh
cd commands/cli
node lib/index.js -h
```

From the commands/cli directory, run the following command to create a global symlik to the binary:

```sh
yarn link
```

Run nebula globally to see help info to check whether it works:

```sh
nebula -h
```

Tips:

If 'There's already a package called "@nebula.js/cli" registered.' or 'command not found: nebula' is displayed.

Run the following command to remove the symlinked nebula and run 'yarn link' again:

```sh
yarn unlink
```
