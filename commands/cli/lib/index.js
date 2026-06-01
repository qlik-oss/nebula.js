#!/usr/bin/env node
/* eslint-disable no-console, import/extensions */
import path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import yargs from 'yargs';

import checkNodeVersion from './checkNodeVersion.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

checkNodeVersion(pkg);

const cli = yargs(process.argv.slice(2));

cli.usage('nebula <command> [options]');

const getCommand = async (specifier) => {
  const mod = await import(specifier);
  return mod.default || mod;
};

const tryAddCommand = async (m) => {
  let cmd;
  let error;
  try {
    cmd = await getCommand(`${m}/command.js`);
  } catch (e) {
    error = e;
    try {
      const cwdRequire = createRequire(path.join(process.cwd(), 'package.json'));
      const resolved = cwdRequire.resolve(`${m}/command`);
      cmd = await getCommand(pathToFileURL(resolved).href);
    } catch (ee) {
      error = ee;
    }
  }

  if (cmd) {
    cli.command(cmd);
  } else {
    // Print the error
    if (error) {
      console.log(`Error from import: ${error.message}`);
    }
    // add dummy command in order to instruct user how to install missing package
    const comm = m.split('-')[1];
    cli.command({
      command: comm,
      handler() {
        throw new Error(
          `Command \x1b[36m${comm}\x1b[0m is missing, make sure to install \x1b[36m${m}\x1b[0m and then try again.`
        );
      },
    });
  }
};

const run = async () => {
  await ['@nebula.js/cli-create', '@nebula.js/cli-build', '@nebula.js/cli-serve', '@nebula.js/cli-sense'].reduce(
    (chain, commandPackage) =>
      // Preserve deterministic command registration order.
      chain.then(() => tryAddCommand(commandPackage)),
    Promise.resolve()
  );

  cli.demandCommand().alias('h', 'help').wrap(Math.min(80, cli.terminalWidth())).argv;
};

run();
