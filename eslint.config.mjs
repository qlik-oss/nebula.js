import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import mocha from 'eslint-plugin-mocha';
import qlik from '@qlik/eslint-config';

// import-x plugin is provided by @qlik/eslint-config; re-use its instance to avoid dual-plugin issues
const importX = qlik.configs.react[0].plugins['import-x'];
const reactPlugin = qlik.configs.react[0].plugins['react'];

export default qlik.compose(
  globalIgnores([
    '**/dist/',
    '**/coverage/',
    '**/node_modules/',
    'apis/snapshooter/client.js',
    'apis/*/core/**/*.js',
    '**/*.d.ts',
    '.github/**',
    '.storybook_old/**',
  ]),
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
      'import-x': importX,
      react: reactPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        __NEBULA_DEV__: false,
        // process.env is injected by bundlers (webpack/rollup) in browser builds
        process: false,
      },

      ecmaVersion: 2020,
      sourceType: 'module',
    },

    rules: {
      'no-plusplus': 0,
      'no-bitwise': 0,
      'no-unused-expressions': 0,
      'react/destructuring-assignment': [0, 'always'],
      'react/prop-types': 0,
      'react/no-deprecated': 0,

      // New rules from @qlik/eslint-config not suited to this codebase
      'import-x/no-unresolved': 0,
      'import-x/extensions': 0,
      'import-x/namespace': 0,
      'import-x/named': 0,
      'react-hooks/exhaustive-deps': 0,
      'react-hooks/rules-of-hooks': 0,
      'react/jsx-no-leaked-render': 0,
      'react/no-object-type-as-default-prop': 0,
      'react/display-name': 0,
      'react/hook-use-state': 0,
      'react/no-array-index-key': 1,
      'require-atomic-updates': 0,
      'prefer-object-has-own': 0,
      'func-names': 0,
      'no-useless-call': 0,

      // New react-hooks rules from React Compiler plugin (not applicable to this codebase)
      'react-hooks/refs': 0,
      'react-hooks/set-state-in-effect': 0,
      'react-hooks/immutability': 0,
      'react-hooks/use-memo': 0,
      'react-hooks/void-use-memo': 0,
      'react-hooks/preserve-manual-memoization': 0,

      // testing-library rules from jest config — not applicable to this codebase's test style
      'testing-library/await-async-queries': 0,
      'testing-library/render-result-naming-convention': 0,
      'testing-library/no-unnecessary-act': 0,
      'testing-library/prefer-presence-queries': 0,
      'testing-library/prefer-screen-queries': 0,
      'testing-library/no-node-access': 0,
      'testing-library/no-render-in-lifecycle': 0,
      'testing-library/no-await-sync-queries': 0,
      'testing-library/await-async-utils': 0,

      // Jest rules not previously enforced
      'jest/no-conditional-expect': 0,
      'jest/no-standalone-expect': 0,
      'jest/valid-title': 0,
      'jest/valid-expect-in-promise': 0,

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
  // Node.js/CommonJS globals for all non-web command files and CJS API files
  {
    files: [
      'commands/**/*.{js,cjs,mjs}',
      'scripts/**/*',
      'apis/stardust/index.js',
      'apis/test-utils/index.js',
      'apis/test-utils/src/index.js',
      'apis/snapshooter/rollup.config.js',
      'apis/stardust/api-spec/**/*.js',
      'rollup.config.js',
    ],
    ignores: ['commands/serve/web/**/*'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // Add node globals to jest test files (for `global`, `require`, `process` used in mocking)
  {
    files: [
      '**/__test__/**/*.{js,jsx}',
      '**/__tests__/**/*.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/*.test.{js,jsx}',
    ],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // Node globals for root-level config and test runner files
  {
    files: ['jest.setup.js', 'jest.config.js', 'rollup.config.js'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // test/ and examples/ directories: node globals + relax external deps check
  {
    files: ['test/**/*', 'examples/**/*', '**/playwright.config*.{js,ts,mjs,cjs}'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'import-x/no-extraneous-dependencies': 0,
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
