module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['**/*.js','!frontend/**','!tests/**','!node_modules/**'],
  setupFiles: ['<rootDir>/tests/testSetup.js'],
  coverageThreshold: {
    global: {
      lines: 70,
      statements: 65,
      branches: 48,
      functions: 47
    }
  }
};
