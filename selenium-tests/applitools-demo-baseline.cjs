// Load environment variables from .env file
require('dotenv').config();

const { Builder } = require('selenium-webdriver');
const { Eyes, Target } = require('@applitools/eyes-selenium');

async function createBaseline() {
  const driver = await new Builder().forBrowser('chrome').build();
  const eyes = new Eyes();

  // Configure Applitools
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY);
  
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/shop', name: 'Product Catalog' },
    { path: '/profile', name: 'User Profile' },
    { path: '/contact', name: 'Contact Form' },
    { path: '/support', name: 'Support Page' },
    { path: '/about', name: 'About Page' }
  ];

  try {
    // Open Eyes session
    await eyes.open(driver, 'Visual Testing Live Demo', 'Baseline Creation - Clean Pages', {
      width: 1280,
      height: 720
    });

    console.log('🔍 Creating Applitools baselines for clean pages...\n');
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const startTime = Date.now();
      
      console.log(`📸 Capturing baseline ${i + 1}/${pages.length}: ${page.name}`);
      
      // Navigate to page
      await driver.get(`http://localhost:3000${page.path}`);
      
      // Wait for page to load
      await driver.sleep(1000);
      
      // Take baseline screenshot
      await eyes.check(`${page.name} - Baseline`, Target.window().fully());
      
      const duration = Date.now() - startTime;
      console.log(`   ✅ Captured in ${duration}ms`);
    }

    // Get test results
    const results = await eyes.close();
    
    console.log('\n🎉 Baseline creation completed!');
    console.log(`📊 Applitools Results: ${results.getUrl()}`);
    console.log(`🆔 Batch ID: ${results.getBatchId()}`);
    
    return {
      success: true,
      url: results.getUrl(),
      batchId: results.getBatchId(),
      pagesProcessed: pages.length
    };

  } catch (error) {
    console.error('❌ Error creating baseline:', error.message);
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
  
  createBaseline()
    .then(result => {
      if (result.success) {
        console.log('\n✨ Baseline creation successful!');
        process.exit(0);
      } else {
        console.error('\n❌ Baseline creation failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = createBaseline;