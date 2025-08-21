module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['**/*.js','!frontend/**','!tests/**','!node_modules/**'],
  setupFiles: ['<rootDir>/tests/testSetup.js']
};
