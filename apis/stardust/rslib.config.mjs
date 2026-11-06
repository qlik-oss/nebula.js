import { defineConfig } from '@rslib/core';
import { bundle, readPackage, watch } from '../../scripts/rslib.mjs';

const cwd = import.meta.dirname;

// the core is a package of its own, in a directory of this one
const corePkg = readPackage(`${cwd}/core`);

export default defineConfig({
  lib: [
    ...(watch ? [] : [bundle({ cwd, format: 'esm', file: 'stardust.esm.js' })]),
    bundle({ cwd, format: 'esm', dev: true, file: 'stardust.esm.dev.js' }),
    ...(watch ? [] : [bundle({ cwd, format: 'systemjs', file: 'stardust.systemjs.js' })]),
    bundle({ cwd, format: 'systemjs', dev: true, file: 'stardust.systemjs.dev.js' }),
    ...(watch ? [] : [bundle({ cwd, targetPkg: corePkg, format: 'esm', dir: 'core/esm', file: 'index.js' })]),
    bundle({ cwd, targetPkg: corePkg, format: 'esm', dev: true, dir: 'core/esm', file: 'dev.js' }),
  ],
});
