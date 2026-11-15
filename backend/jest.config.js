module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  setupFiles: ['<rootDir>/tests/setup.js'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/lib/prisma.js',
    '!src/config/**',
  ],
};
