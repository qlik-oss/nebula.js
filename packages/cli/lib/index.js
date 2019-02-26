#!/usr/bin/env node
const yargs = require('yargs');

const create = require('@nebula.js/cli-create/command');
const serve = require('@nebula.js/cli-serve/command');

yargs.usage('nucleus <command> [options]')
  .command(create)
  .command(serve)
  .demandCommand()
  .alias('h', 'help')
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;
