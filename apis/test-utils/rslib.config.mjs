import { defineConfig } from '@rslib/core';
import { bundle, watch } from '../../scripts/rslib.mjs';

const cwd = import.meta.dirname;

export default defineConfig({
  lib: [bundle({ cwd, format: 'esm', dev: watch, file: `test-utils.esm${watch ? '.dev' : ''}.js` })],
});
