module.exports = {
  clearMocks: true,
  testEnvironment: 'jest-environment-jsdom',
  testRegex: [
    'commands/.+\\.(spec|test|inspect)\\.[jt]sx?$',
    'apis/conversion/.+\\.inspect\\.[jt]sx?$',
    'apis/enigma-mocker/.+\\.inspect\\.[jt]sx?$',
    'apis/locale/.+\\.inspect\\.[jt]sx?$',
    'apis/snapshooter/.+\\.inspect\\.[jt]sx?$',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'commands/**/*.{js,jsx}',
    'apis/conversion/**/*.{js,jsx}',
    'apis/enigma-mocker/**/*.{js,jsx}',
    'apis/locale/**/*.{js,jsx}',
    'apis/snapshooter/**/*.{js,jsx}',
    '!apis/enigma-mocker/examples/**',
    '!**/lib/**',
    '!**/dist/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
};
