// Main test runner for E-commerce Application
// Runs both backend API tests and frontend integration tests

const functionalTests = require('./functional-tests');
const frontendTests = require('./frontend-integration-tests');

async function runAllTests() {
  console.log('🚀 E-COMMERCE APPLICATION TEST SUITE');
  console.log('🔄 Testing Frontend-Backend Integration');
  console.log('=' .repeat(70));
  
  try {
    // Run backend API tests first
    console.log('\n🔧 PHASE 1: Backend API Tests');
    console.log('-' .repeat(40));
    const backendResults = await functionalTests.runFunctionalTests();
    
    // Run frontend integration tests
    console.log('\n🎭 PHASE 2: Frontend Integration Tests');
    console.log('-' .repeat(40));
    const frontendResults = await frontendTests.runFrontendTests();
    
    // Overall summary
    console.log('\n' + '=' .repeat(70));
    console.log('🏆 FINAL TEST SUMMARY');
    console.log('=' .repeat(70));
    
    const totalPassed = backendResults.passed + frontendResults.passed;
    const totalTests = backendResults.total + frontendResults.total;
    
    console.log(`📊 Backend API Tests: ${backendResults.passed}/${backendResults.total} passed`);
    console.log(`📊 Frontend Tests: ${frontendResults.passed}/${frontendResults.total} passed`);
    console.log(`📊 Overall: ${totalPassed}/${totalTests} tests passed`);
    
    const successRate = Math.round((totalPassed / totalTests) * 100);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Integration test suite PASSED! Frontend and backend are communicating well.');
    } else if (successRate >= 60) {
      console.log('⚠️ Integration test suite PARTIALLY PASSED. Some issues need attention.');
    } else {
      console.log('❌ Integration test suite FAILED. Significant issues need to be resolved.');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (backendResults.passed < backendResults.total) {
      console.log('- Fix backend API issues first as they affect frontend functionality');
    }
    if (frontendResults.passed < frontendResults.total) {
      console.log('- Check frontend-backend communication and UI responsiveness');
    }
    if (successRate < 100) {
      console.log('- Review error logs above for specific issues to address');
    }
    
    return {
      backend: backendResults,
      frontend: frontendResults,
      overall: { passed: totalPassed, total: totalTests, successRate }
    };
    
  } catch (error) {
    console.error('\n❌ Test suite execution failed:', error.message);
    return null;
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
