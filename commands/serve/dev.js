// Serves the pages of nebula serve from their source, with hot reload, to develop nebula serve itself:
//
//   pnpm start --entry ../../test/fixtures/viz/listbox
//
// It takes the arguments of `nebula serve`. This file is not part of the published package.
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import command from './command.js';
import serve from './lib/serve.js';
import { pagesConfig } from './rsbuild.config.mjs';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(packageDir, 'dist');

const pages = ({ serveConfig }) => ({
  config: pagesConfig({ srcDir: path.resolve(packageDir, 'web'), distDir, dev: true, serveConfig }),
  contentBase: distDir,
  hmr: true,
});

yargs(hideBin(process.argv))
  .command({ ...command, command: '$0', handler: (argv) => serve(argv, { pages }) })
  .parse();
