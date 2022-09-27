module.exports = {
  clearMocks: true,
  testEnvironment: 'jest-environment-jsdom',
  testRegex: [
    'commands/serve/.+\\.(spec|test|inspect)\\.[jt]sx?$',
    'commands/sense/.+\\.(spec|test|inspect)\\.[jt]sx?$',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'commands/serve/**/*.{js,jsx}',
    'commands/sense/**/*.{js,jsx}',

    '!**/dist/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
};
