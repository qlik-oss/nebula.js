import base, { SHARED_NO_UNDERSCORE_DANGLE_ALLOW } from '../oxlint.base.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  rules: {
    'no-underscore-dangle': [
      'error',
      { allow: SHARED_NO_UNDERSCORE_DANGLE_ALLOW }, // Public API escape hatch property
    ],
    'import/extensions': 'off', // CommonJS test files use .cjs/.js extensions
  },
});
