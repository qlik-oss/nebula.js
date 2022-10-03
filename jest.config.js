module.exports = {
  clearMocks: true,
  testEnvironment: 'jest-environment-jsdom',
  testRegex: [
    'commands/.+\\.(spec|test|inspect)\\.[jt]sx?$',
    'apis/conversion/.+\\.inspect\\.[jt]sx?$',
    'apis/enigma-mocker/.+\\.inspect\\.[jt]sx?$',
    'apis/locale/.+\\.inspect\\.[jt]sx?$',
    'apis/snapshooter/.+\\.inspect\\.[jt]sx?$',
    'apis/supernova/.+\\.inspect\\.[jt]sx?$',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'commands/**/*.{js,jsx}',
    'apis/conversion/**/*.{js,jsx}',
    'apis/enigma-mocker/**/*.{js,jsx}',
    'apis/locale/**/*.{js,jsx}',
    'apis/snapshooter/**/*.{js,jsx}',
    'apis/supernova/**/*.{js,jsx}',

    '!apis/enigma-mocker/examples/**',
    '!apis/enigma-mocker/index.js',
    '!commands/create/**/*.{js,jsx}',
    '!apis/snapshooter/client.js',

    '!**/lib/**',
    '!**/dist/**',
    '!**/node_modules/**',
    '!**/*.config.js',
    '!**/*.conf.js',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
};
