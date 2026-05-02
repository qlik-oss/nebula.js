import commands from '../oxlint.commands.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [commands],
  rules: { 'no-var': 'off', 'import/no-amd': 'off', 'no-underscore-dangle': ['error', { allow: ['__esmodule'] }] },
});
