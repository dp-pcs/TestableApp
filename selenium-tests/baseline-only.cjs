// Load environment variables
require('dotenv').config();

const { Builder } = require('selenium-webdriver');
const { Eyes, Target, BatchInfo } = require('@applitools/eyes-selenium');

async function captureBaselineOnly() {
  const driver = await new Builder().forBrowser('chrome').build();
  const eyes = new Eyes();

  // Try both API keys
  let apiKey = process.env.APPLITOOLS_API_KEY2 || process.env.APPLITOOLS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No Applitools API key found');
    console.log('💡 Set APPLITOOLS_API_KEY or APPLITOOLS_API_KEY2 in your .env file');
    return { success: false, error: 'Missing API key' };
  }
  
  console.log(`🔑 Testing with API key: ${apiKey.substring(0, 10)}...`);
  eyes.setApiKey(apiKey);
  
  const batch = new BatchInfo('Demo Setup - Baseline Only');
  eyes.setBatch(batch);

  try {
    console.log('📸 STEP 1: Capturing BASELINE (Gold Standard)');
    console.log('   This creates the "perfect" version to compare against\n');

    // Open Eyes session for baseline only
    await eyes.open(driver, 'Static Page Demo', 'TechCorp Homepage', {
      width: 1280,
      height: 720
    });

    // Capture ONLY the baseline page
    console.log('🌟 Capturing baseline page...');
    await driver.get('http://localhost:3000/baseline-page.html');
    await driver.sleep(3000); // Wait for page to fully load
    
    await eyes.check('TechCorp Homepage - Baseline', Target.window().fully());
    
    // Close Eyes and get results
    const results = await eyes.close();
    
    console.log('\n✅ BASELINE CAPTURED SUCCESSFULLY!');
    console.log(`🌐 Applitools Dashboard: ${results.getUrl()}`);
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Go to the Applitools dashboard (URL above)');
    console.log('2. You\'ll see the baseline image');
    console.log('3. Click "Accept" to approve this as your gold standard');
    console.log('4. Then run the broken page test to see differences');
    
    return {
      success: true,
      dashboardUrl: results.getUrl(),
      batchId: results.getBatchId()
    };

  } catch (error) {
    console.error('❌ Error capturing baseline:', error.message);
    return { success: false, error: error.message };
    
  } finally {
    try {
      await eyes.abort();
    } catch (e) {
      // Ignore cleanup errors
    }
    await driver.quit();
  }
}

// Run if called directly
if (require.main === module) {
  captureBaselineOnly()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Baseline capture complete!');
        console.log('📝 Remember to APPROVE the baseline in the dashboard');
      } else {
        console.log('\n❌ Baseline capture failed');
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
    });
}

module.exports = captureBaselineOnly; 