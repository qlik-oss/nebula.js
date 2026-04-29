import base from '../oxlint.base.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  overrides: [
    {
      files: ['*/index.js'],
      rules: {
        'global-require': 0,
      },
    },
  ],
});
