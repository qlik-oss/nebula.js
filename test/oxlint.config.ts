import base from '../oxlint.base.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  rules: {
    'no-underscore-dangle': [
      'error',
      { allow: ['__DO_NOT_USE__'] }, // Public API escape hatch property
    ],
    'import/extensions': 'off', // CommonJS test files use .cjs/.js extensions
  },
});
