#!/usr/bin/env node
const yargs = require('yargs');

const build = require('@nebula.js/cli-build/command');
const create = require('@nebula.js/cli-create/command');
const serve = require('@nebula.js/cli-serve/command');
const sense = require('@nebula.js/cli-sense/command');

yargs
  .usage('nebula <command> [options]')
  .command(build)
  .command(create)
  .command(serve)
  .command(sense)
  .demandCommand()
  .alias('h', 'help')
  .wrap(Math.min(80, yargs.terminalWidth())).argv;
