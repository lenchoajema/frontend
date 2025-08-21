/* eslint-env node */
// Jest custom runner (single worker) – lint globals allowed
const { runCLI } = require('jest');
(async () => {
  try {
    const projectRoot = process.cwd();
    const inlineConfig = {
      rootDir: projectRoot,
      testEnvironment: 'node',
      roots: ['<rootDir>/tests'],
      setupFiles: ['<rootDir>/tests/testSetup.js'],
      testMatch: ['**/tests/**/*.test.js'],
      verbose: true,
      maxWorkers: 1,
    };
    const { results } = await runCLI({ config: JSON.stringify(inlineConfig) }, [projectRoot]);
  console.log('RESULT SUMMARY', { total: results.numTotalTests, passed: results.numPassedTests, failed: results.numFailedTests });
    process.exit(results.success ? 0 : 1);
  } catch (e) {
    console.error('Jest run failed:', e);
    process.exit(1);
  }
})();
