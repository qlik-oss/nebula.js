import qlik from '@qlik/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [qlik.recommended],
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
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
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
