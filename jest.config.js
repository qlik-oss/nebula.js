module.exports = {
  clearMocks: true,
  testEnvironment: 'jest-environment-jsdom',
  testRegex: ['commands/serve/web/.+\\.(spec|test|inspect)\\.[jt]sx?$'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'commands/serve/web/**/*.{js,jsx}',
    '!commands/serve/web/**/*.spec.{js,jsx}',
    '!commands/serve/web/**/*.test.{js,jsx}',
    '!commands/serve/web/**/*.inspect.{js,jsx}',
    '!commands/serve/web/**/__tests__/**/*',

    '!**/dist/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
};
