import { globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import mocha from 'eslint-plugin-mocha';
import qlik from '@qlik/eslint-config';

// import-x plugin is provided by @qlik/eslint-config; re-use its instance to avoid dual-plugin issues
const importX = qlik.configs.react[0].plugins['import-x'];

export default qlik.compose(
  globalIgnores(['**/dist/', '**/coverage/', '**/node_modules/', 'apis/snapshooter/client.js', 'apis/*/core/**/*.js']),
  ...qlik.configs.react,
  {
    ...qlik.configs.jest[0],
    files: [
      '**/__test__/**/*.{js,jsx}',
      '**/__tests__/**/*.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/*.test.{js,jsx}',
    ],
  },
  {
    plugins: {
      prettier,
      'import-x': importX,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        __NEBULA_DEV__: false,
      },

      ecmaVersion: 2020,
      sourceType: 'module',
    },

    rules: {
      'no-plusplus': 0,
      'no-bitwise': 0,
      'no-unused-expressions': 0,
      'prettier/prettier': 2,
      'react/destructuring-assignment': [0, 'always'],
      'react/prop-types': 0,
      'react/no-deprecated': 0,

      'import-x/no-extraneous-dependencies': [
        2,
        {
          devDependencies: true,
        },
      ],

      'import-x/no-dynamic-require': 0,
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
      'import-x/no-amd': 0,
    },
  },
  {
    files: ['commands/serve/web/**/*.{js,jsx}'],

    rules: {
      'arrow-body-style': 1,
      'no-use-before-define': 1,
      'react/function-component-definition': 0,
      'import-x/prefer-default-export': 1,
      'import-x/no-cycle': 1,
    },
  },
  {
    files: ['commands/serve/web/**/*.test.{js,jsx}', 'commands/serve/web/utils/testRenderer.jsx'],

    rules: {
      'import-x/no-extraneous-dependencies': 0,
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
      'import-x/no-unresolved': 0,
      'import-x/extensions': 0,
      'import-x/no-extraneous-dependencies': 0,
    },
  },
  {
    files: ['**/website/**/*.js'],

    rules: {
      'react/jsx-filename-extension': 0,
      'react/no-multi-comp': 0,
      'react/prefer-stateless-function': 0,
      'import-x/no-extraneous-dependencies': 0,
      'import-x/no-unresolved': 0,
    },
  },
);
