import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import jest from 'eslint-plugin-jest';
import globals from 'globals';
import mocha from 'eslint-plugin-mocha';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/dist/', '**/coverage/', '**/node_modules/', 'apis/snapshooter/client.js', 'apis/*/core/**/*.js']),
  {
    extends: compat.extends('airbnb', 'prettier'),

    plugins: {
      prettier,
      jest,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...jest.environments.globals.globals,
        __NEBULA_DEV__: false,
      },

      ecmaVersion: 2020,
      sourceType: 'module',
    },

    rules: {
      'max-len': 0,
      'no-plusplus': 0,
      'no-bitwise': 0,
      'no-unused-expressions': 0,
      'prettier/prettier': 2,
      'react/destructuring-assignment': [0, 'always'],
      'react/prop-types': 0,
      'react/no-deprecated': 0,

      'import/no-extraneous-dependencies': [
        2,
        {
          devDependencies: true,
        },
      ],

      'import/no-dynamic-require': 0,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
      'no-unused-vars': [
        'error',
        {
          caughtErrors: 'none',
        },
      ],
    },
  },
  {
    files: ['apis/**/*', 'packages/**/*', 'commands/create/**/*', 'commands/sense/src/**/*'],

    rules: {
      'jest/valid-expect': 0,
      'jest/no-identical-title': 0,
    },
  },
  {
    files: ['scripts/**/*', '**/apis/*/scripts/**/*'],

    rules: {
      'no-restricted-syntax': 0,
    },
  },
  {
    files: ['apis/**/*'],

    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['apis/*/index.js'],

    rules: {
      'global-require': 0,
    },
  },
  {
    files: ['commands/sense/src/*.js'],

    languageOptions: {
      globals: {
        define: false,
      },
    },

    rules: {
      'no-var': 0,
      'import/no-amd': 0,
    },
  },
  {
    files: ['commands/serve/web/**/*.{js,jsx}'],

    rules: {
      'arrow-body-style': 1,
      'no-use-before-define': 1,
      'react/function-component-definition': 0,
      'import/prefer-default-export': 1,
      'import/no-cycle': 1,
    },
  },
  {
    files: ['commands/serve/web/**/*.test.{js,jsx}', 'commands/serve/web/utils/testRenderer.jsx'],

    rules: {
      'import/no-extraneous-dependencies': 0,
      'array-callback-return': 0,
    },
  },
  {
    files: ['**/*.{int,comp,spec}.{js,jsx}'],

    plugins: {
      mocha,
    },

    languageOptions: {
      globals: {
        ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, 'off'])),
        ...globals.node,
        ...globals.mocha,
        chai: false,
        expect: false,
        sinon: false,
        page: false,
      },
    },

    rules: {
      'mocha/no-exclusive-tests': 'error',
    },
  },
  {
    files: ['**/*.{int,comp}.js'],

    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/templates/**/*.js'],

    rules: {
      'import/no-unresolved': 0,
      'import/extensions': 0,
      'import/no-extraneous-dependencies': 0,
    },
  },
  {
    files: ['**/website/**/*.js'],

    rules: {
      'react/jsx-filename-extension': 0,
      'react/no-multi-comp': 0,
      'react/prefer-stateless-function': 0,
      'import/no-extraneous-dependencies': 0,
      'import/no-unresolved': 0,
    },
  },
]);
