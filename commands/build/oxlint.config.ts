import commands from '../oxlint.commands.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [commands],
  rules: {
    'import/extensions': 'off', // CLI build scripts use .js extensions
    'no-dynamic-require': 'off', // Runtime module loading in CLI tooling
    'no-param-reassign': 'off', // CLI argv object mutation is intentional (yargs pattern)
  },
});
