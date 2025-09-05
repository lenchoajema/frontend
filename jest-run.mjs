import pkg from 'jest';
const { runCLI } = pkg;

const config = { 
  rootDir: process.cwd(),
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/testSetup.js'],
  verbose: true,
  runInBand: true,
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 5000,
  // Point to existing config file
  config: new URL('./jest.config.js', import.meta.url).pathname
};

runCLI(config, [process.cwd()]).then(r => {
  console.log('SUMMARY', r.results.numTotalTests, 'total');
  r.results.testResults.forEach(tr => console.log('FILE', tr.testFilePath, tr.status, tr.numPassingTests));
  process.exit(r.results.success ? 0 : 1);
}).catch(e => { console.error('RUN ERR', e); process.exit(1); });
