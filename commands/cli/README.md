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
  nebula create <name>    Create a visualization
  / create mashup <name>  / Create a mashup
  nebula build            Build visualization
  nebula serve            Start a development server
  nebula sense            Build a nebula visualization as a Qlik Sense extension

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]
```

## How to use nebula CLI in your visualization

You can use the package.json script variant of these commands, which are exposed for you with`nebula create`

When you want to make the `nebula serve`, `nebula build`, and `nebula sense` commands available in your visualization by yourself, run the following command.

```bash
npm install @nebula.js/cli @nebula.js/cli-build @nebula.js/cli-sense @nebula.js/cli-serve
```

or

```bash
yarn add @nebula.js/cli @nebula.js/cli-build @nebula.js/cli-sense @nebula.js/cli-serve
```

Open up your package.json, those dependencies are added.

```json
{
  "devDependencies": {
    "@nebula.js/cli": "latest",
    "@nebula.js/cli-build": "latest",
    "@nebula.js/cli-sense": "latest",
    "@nebula.js/cli-serve": "latest"
  }
}
```

and add a script like so:

```json
"scripts": {
    "build": "nebula build",
    "start": "nebula serve",
    "sense": "nebula sense"
  },
```

You can also run nebula cli commands with Node.js. Create a js file called build.js
and add the following:

```js
const build = require('@nebula.js/cli-build');
const sense = require('@nebula.js/cli-sense');

await build({
  config: '../nebula.config.js',
  sourcemap: false,
  core: 'core',
  mode: 'production',
  watch: false,
});
await sense({ output: 'sn-table-ext', sourcemap: true });
```

and run the following command:

```bash
node build.js
```

## How to test your modified nebula CLI locally and globally

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

You can modify code in commands directory and do the following to test modified nebula CLI locally and globally:

### Test nebula CLI locally

Run nebula CLI locally to see help info using node.js:

```sh
cd commands/cli
node lib/index.js -h
```

### Test nebula CLI globally

From the commands/cli directory, run the following command to create a global symlik to the binary:

```sh
yarn link
```

Run nebula CLI globally to see help info to check whether it works:

```sh
nebula -h
```

Tips:

If 'There's already a package called "@nebula.js/cli" registered.' or 'command not found: nebula' is displayed.

Run the following command to remove the symlinked nebula and run 'yarn link' again:

```sh
yarn unlink
```
