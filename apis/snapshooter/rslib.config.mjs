import { defineConfig } from '@rslib/core';
import { bundle } from '../../scripts/rslib.mjs';

const cwd = import.meta.dirname;

export default defineConfig({
  // the client that is injected into the page of a snapshot, a single file at the root of the package
  lib: [bundle({ cwd, format: 'esm', dir: '.', file: 'client.js', entry: 'renderer.js', sourceMap: false })],
});
