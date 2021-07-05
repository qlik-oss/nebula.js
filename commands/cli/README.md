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

## How to run nebula cli locally and globally

Requirements:

- Node.js
- yarn

Clone the application:

```sh
git clone https://github.com/qlik-oss/nebula.js
```

From the root directory, you can run the following command to install all the necessary dependencies of nebula cli:

```sh
yarn
```

Test nebula cli out locally to see help info using nodejs:

```sh
cd commands/cli
node lib/index.js -h
```

From the commands/cli directory, you can run the following command to create a global symlik to the binary:

```sh
yarn link
```

Then you can run nebula globally to see help info like so:

```sh
nebula -h
```

Tips:

If 'There's already a package called "@nebula.js/cli" registered.' or 'command not found: nebula' is displayed

you can run the following command to remove the symlinked nebula fisrt then run 'yarn link' again

```sh
yarn unlink
```
