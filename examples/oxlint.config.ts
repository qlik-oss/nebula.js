import base from '../oxlint.base.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  rules: {
    'import/no-unassigned-import': 'off', // CSS bundler imports for component styling
  },
});
