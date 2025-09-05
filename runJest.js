const { runCLI } = require('jest');
(async () => {
  const result = await runCLI({ runInBand: true, verbose: true }, [process.cwd()]);
  console.log('JEST SUMMARY', {
    numTotalTests: result.results.numTotalTests,
    numPassedTests: result.results.numPassedTests,
    numFailedTests: result.results.numFailedTests,
    testResults: result.results.testResults.map(t => ({ file: t.testFilePath, status: t.status, assertionResults: t.assertionResults.map(a=>({title:a.title,status:a.status})) }))
  });
})();
