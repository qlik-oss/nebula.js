import { recommended } from '@qlik/oxlint-config';
import { defineConfig } from 'oxlint';

export const SHARED_NO_UNDERSCORE_DANGLE_ALLOW = ['__DO_NOT_USE__'];

export default defineConfig({
  extends: [recommended],
  rules: {
    'no-plusplus': 'off',
    'no-bitwise': 'off',
    'no-unused-expressions': 'off',

    // Unused vars with caughtErrors: none
    'no-unused-vars': ['error', { caughtErrors: 'none' }],
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      plugins: ['jest'],
      env: {
        jest: true,
        mocha: true,
      },
      rules: {
        'no-import-assign': 'off',
        'no-param-reassign': 'off',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
        'jest/require-to-throw-message': 'off',
      },
    },
    {
      files: ['**/oxlint.*.ts'],
      rules: {
        'import/extensions': [
          'error',
          'never',
          {
            pathGroupOverrides: [
              {
                pattern: '**/oxlint.*.ts',
                action: 'ignore',
              },
            ],
          },
        ],
      },
    },
  ],
});
