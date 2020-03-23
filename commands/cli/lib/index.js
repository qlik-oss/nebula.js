#!/usr/bin/env node
const yargs = require('yargs');
const importCwd = require('import-cwd');

// const build = require('@nebula.js/cli-build/command');
// const create = require('@nebula.js/cli-create/command');
// const serve = require('@nebula.js/cli-serve/command');
// const sense = require('@nebula.js/cli-sense/command');

yargs.usage('nebula <command> [options]');

const tryAddCommand = m => {
  let cmd;
  try {
    cmd = require(`${m}/command`); // eslint-disable-line
  } catch (e) {
    cmd = importCwd.silent(`${m}/command`);
  }

  if (cmd) {
    yargs.command(cmd);
  } else {
    // add dummy command in order to instruct user how to install missing package
    const comm = m.split('-')[1];
    yargs.command({
      command: comm,
      handler() {
        throw new Error(
          `Command \x1b[36m${comm}\x1b[0m is missing, make sure to install \x1b[36m${m}\x1b[0m and then try again.`
        );
      },
    });
  }
};

['@nebula.js/cli-build', '@nebula.js/cli-create', '@nebula.js/cli-serve', '@nebula.js/cli-sense'].forEach(
  tryAddCommand
);

yargs
  .demandCommand()
  .alias('h', 'help')
  .wrap(Math.min(80, yargs.terminalWidth())).argv;
