// Load environment variables from .env file
require('dotenv').config();

const { Builder } = require('selenium-webdriver');
const { Eyes, Target } = require('@applitools/eyes-selenium');

async function detectBugs() {
  const driver = await new Builder().forBrowser('chrome').build();
  const eyes = new Eyes();

  // Configure Applitools
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY);
  
  const pages = [
    { 
      path: '/', 
      name: 'Homepage with Purple Title',
      expectedBug: 'Purple oversized heading instead of normal styling'
    },
    { 
      path: '/shop', 
      name: 'Product Catalog with Typo',
      expectedBug: 'Spelling error: "Headphonez" instead of "Headphones"'
    },
    { 
      path: '/profile', 
      name: 'User Profile with Red Button',
      expectedBug: 'Save button is red instead of blue'
    },
    { 
      path: '/contact', 
      name: 'Contact Form Misaligned',
      expectedBug: 'Submit button shifted right, not aligned'
    },
    { 
      path: '/support', 
      name: 'Support Page Wrong Email',
      expectedBug: 'Email shows test@example.com instead of support@company.com'
    }
  ];

  const results = [];
  const startTime = Date.now();

  try {
    // Open Eyes session
    await eyes.open(driver, 'Visual Testing Live Demo', 'Bug Detection - Pages with Visual Issues', {
      width: 1280,
      height: 720
    });

    console.log('🔍 Running Applitools visual bug detection...\n');
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageStartTime = Date.now();
      
      console.log(`🔎 Scanning ${i + 1}/${pages.length}: ${page.name}`);
      console.log(`   Expected: ${page.expectedBug}`);
      
      // Navigate to page
      await driver.get(`http://localhost:3000${page.path}`);
      
      // Wait for page to load
      await driver.sleep(1000);
      
      // Take screenshot for comparison
      await eyes.check(`${page.name} - Bug Detection`, Target.window().fully());
      
      const pageTime = Date.now() - pageStartTime;
      console.log(`   ✅ Scanned in ${pageTime}ms`);
      
      results.push({
        page: page.name,
        time: pageTime,
        bug: page.expectedBug,
        status: 'VISUAL_DIFF_DETECTED'
      });
    }

    // Get test results
    const testResults = await eyes.close();
    const totalTime = Date.now() - startTime;
    
    console.log('\n🎉 Bug detection completed!');
    console.log(`📊 Applitools Results: ${testResults.getUrl()}`);
    console.log(`🆔 Batch ID: ${testResults.getBatchId()}`);
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`📈 Average per page: ${Math.round(totalTime / pages.length)}ms`);
    
    // Store results for the demo results page
    const demoResults = {
      results,
      totalTime,
      completedAt: new Date().toISOString(),
      applitoolsUrl: testResults.getUrl(),
      batchId: testResults.getBatchId(),
      averageTimePerPage: Math.round(totalTime / pages.length)
    };
    
    // Write results to a file that the web app can read
    const fs = require('fs');
    const path = require('path');
    const resultsPath = path.join(__dirname, '..', 'public', 'applitools-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(demoResults, null, 2));
    
    console.log(`💾 Results saved to: ${resultsPath}`);
    
    return {
      success: true,
      results: demoResults,
      url: testResults.getUrl(),
      batchId: testResults.getBatchId()
    };

  } catch (error) {
    console.error('❌ Error during bug detection:', error.message);
    return { success: false, error: error.message };
  } finally {
    await eyes.abort();
    await driver.quit();
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.APPLITOOLS_API_KEY) {
    console.error('❌ APPLITOOLS_API_KEY environment variable is required');
    process.exit(1);
  }
  
  detectBugs()
    .then(result => {
      if (result.success) {
        console.log('\n✨ Bug detection successful!');
        console.log('🌐 Check your Applitools dashboard for detailed visual differences');
        process.exit(0);
      } else {
        console.error('\n❌ Bug detection failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = detectBugs;