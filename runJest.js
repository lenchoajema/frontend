const { runCLI } = require('jest');
(async () => {
  const result = await runCLI({ runInBand: true, verbose: true }, [process.cwd()]);
  const r = (result && result.results) || {};
  const suites = Array.isArray(r.testResults) ? r.testResults : [];
  console.log('JEST SUMMARY', {
    numTotalTests: r.numTotalTests || 0,
    numPassedTests: r.numPassedTests || 0,
    numFailedTests: r.numFailedTests || 0,
    testResults: suites.map(t => ({
      file: t.testFilePath,
      status: t.status,
      assertionResults: Array.isArray(t.assertionResults) ? t.assertionResults.map(a=>({title:a.title,status:a.status})) : []
    }))
  });
  process.exitCode = r.numFailedTests ? 1 : 0;
})();
