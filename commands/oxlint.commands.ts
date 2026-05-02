import base from '../oxlint.base.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  rules: {
    'no-console': 'off',
  },
});
