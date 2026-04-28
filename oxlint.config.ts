// @ts-check
import { defineConfig } from 'oxlint';
import qlik from '@qlik/oxlint-config';

export default defineConfig({
  ...qlik.react,
  plugins: [...qlik.react.plugins, 'jest'],
  ignorePatterns: [
    '**/dist/**',
    '**/coverage/**',
    '**/node_modules/**',
    'apis/snapshooter/client.js',
    'apis/*/core/**/*.js',
  ],
  env: {
    ...qlik.react.env,
    jest: true,
  },
  rules: {
    ...qlik.react.rules,

    // === Rules disabled in previous ESLint config ===
    'no-plusplus': 'off',
    'no-bitwise': 'off',
    'no-unused-expressions': 'off',
    // Preserve caughtErrors exception: catch(e) variables intentionally unused
    'no-unused-vars': ['error', { caughtErrors: 'none' }],
    // Was off in ESLint; @qlik/oxlint-config warns on it
    'import/no-dynamic-require': 'off',

    // === False positives for nebula.js architecture ===
    // __hooks, __DO_NOT_USE__, _instance etc. are intentional internal-API names
    'no-underscore-dangle': 'off',
    // nebula.js component() is not a React component; its use*() hooks are not React hooks
    'react/rules-of-hooks': 'off',
    // hook system and data handlers intentionally mutate function parameters
    'no-param-reassign': ['error', { props: false }],
    // delete obj[dynamicKey] used legitimately in JSON-patch and conversion utils
    'typescript/no-dynamic-delete': 'off',
    // class declarations in .d.ts and test utility patterns are valid
    'typescript/no-extraneous-class': 'off',
    // test files mock thenable objects intentionally; not an accidental .then property
    'unicorn/no-thenable': 'off',
    // puppeteer/chokidar default exports also expose named exports — not a bug
    'import/no-named-as-default-member': 'off',
    // CSS, polyfill, and module-augmentation imports are intentional side effects
    'import/no-unassigned-import': ['error', { allow: ['**/*.css', '**/*.scss', 'regenerator-runtime/**', '**/ClassNameSetup*'] }],

    // === New oxc/plugin rules not in original config — opted out ===
    // re-throw audits would require deep behavioral changes across the codebase
    'preserve-caught-error': 'off',
    // unnamed function expressions are acceptable (e.g. functions using `this`)
    'func-names': 'off',
    // react-hooks/exhaustive-deps: nebula uses its own hook system, not React hooks
    'exhaustive-deps': 'off',

    // Was off in airbnb; nested ternaries appear legitimately in complex UI conditions
    'no-nested-ternary': 'off',
    // ESM requires explicit file extensions for relative imports (Node.js native ESM)
    'import/extensions': 'off',

    // === Jest plugin rules not in original config ===
    'jest/require-to-throw-message': 'off',
    'jest/no-conditional-expect': 'off',
    'jest/no-standalone-expect': 'off',
    'jest/prefer-snapshot-hint': 'off',
    'jest/valid-title': 'off',
    'jest/no-commented-out-tests': 'off',
    // Jest rules carried over from original config
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/valid-expect': 'error',
  },
  overrides: [
    // commands/serve/web has pre-existing circular imports between hooks/utils; these were
    // only warnings in the previous ESLint config and are not breaking
    {
      files: ['commands/serve/web/**'],
      rules: {
        'no-cycle': 'warn',
      },
    },

    // Preserve CJS override from qlik.react (.cjs/.cts files)
    ...qlik.react.overrides,

    // Node/CJS build and CLI files write to stdout by design
    {
      files: ['commands/**', 'scripts/**', 'rollup.config.js'],
      env: { node: true, commonjs: true },
      rules: {
        'no-console': 'off',
      },
    },

    // APIs must not use console (use proper logging/error reporting)
    {
      files: ['apis/**'],
      rules: {
        'no-console': 'error',
      },
    },

    // AMD Sense extension files: AMD define global + legacy var usage
    {
      files: ['commands/sense/src/*.js'],
      globals: { define: 'readonly' },
      rules: {
        'no-var': 'off',
        'import/no-amd': 'off',
      },
    },

    // Mocha integration / component / rendering tests: jest plugin rules don't apply
    {
      files: ['**/*.{int,comp,spec}.{js,jsx}', 'test/rendering/**/*.js'],
      rules: {
        'jest/valid-expect': 'off',
        'jest/no-disabled-tests': 'off',
        'jest/no-focused-tests': 'off',
      },
    },

    // apis/*, packages/*, commands/create and commands/sense use Mocha+Chai not Jest —
    // original ESLint config disabled jest/valid-expect for these paths
    {
      files: ['apis/**', 'packages/**', 'commands/create/**', 'commands/sense/src/**'],
      rules: {
        'jest/valid-expect': 'off',
      },
    },

    // commands/serve/web test files use .map() for side-effect assertions (original config exemption)
    {
      files: ['commands/serve/web/**/*.test.{js,jsx}', 'commands/serve/web/utils/testRenderer.jsx'],
      rules: {
        'array-callback-return': 'off',
      },
    },

    // Express 5 handles async handler errors natively; no manual next(err) wrapping needed
    {
      files: ['commands/serve/lib/**'],
      rules: {
        'oxc/no-async-endpoint-handlers': 'off',
      },
    },

    // TypeScript declaration files: stricter typing rules are incompatible with ambient declarations
    {
      files: ['**/*.d.ts'],
      rules: {
        'typescript/no-explicit-any': 'off',
        'typescript/no-wrapper-object-types': 'off',
        'typescript/no-invalid-void-type': 'off',
        'typescript/consistent-type-imports': 'off',
      },
    },

    // Template scaffold files reference packages not yet installed in the template project
    {
      files: ['**/templates/**/*.js'],
      rules: {
        'import/extensions': 'off',
      },
    },

    // Test files use no-import-assign to mock modules and no-param-reassign in setup helpers
    {
      files: ['**/__tests__/**', '**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
      rules: {
        'no-import-assign': 'off',
        'no-param-reassign': 'off',
      },
    },
  ],
});
