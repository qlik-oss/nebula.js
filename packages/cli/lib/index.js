#!/usr/bin/env node
const yargs = require('yargs');

const serve = require('@nebula.js/cli-serve/command');

yargs.usage('nucleus <command> [options]')
  .command(serve)
  .demandCommand()
  .alias('h', 'help')
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;
