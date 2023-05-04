module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  coverageDirectory: 'coverage',
};