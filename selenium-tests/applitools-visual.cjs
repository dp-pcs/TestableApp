const { Builder } = require('selenium-webdriver')
const { Eyes, Target, Configuration, BatchInfo } = require('@applitools/eyes-selenium')
require('dotenv').config()

async function runVisualTest() {
  // Initialize the Eyes SDK
  const eyes = new Eyes()
  
  // Set your Applitools API key
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY)
  
  // Create a new batch for organizing tests
  const batch = new BatchInfo('TestableApp Visual Testing')
  eyes.setBatch(batch)
  
  // Initialize the WebDriver
  const driver = await new Builder().forBrowser('chrome').build()
  
  try {
    // Start the visual test
    await eyes.open(driver, 'TestableApp', 'Selenium Visual Test', { width: 1280, height: 720 })
    
    console.log('🚀 Starting Applitools visual test...')
    
    // Navigate to your app
    await driver.get('http://localhost:3000')
    
    // Take visual checkpoint of homepage
    await eyes.check('Homepage', Target.window().fully())
    console.log('✅ Homepage baseline captured')
    
    // Navigate to shop page
    const shopLink = await driver.findElement({ css: '[data-testid="shop-link"]' })
    await shopLink.click()
    await driver.sleep(1000) // Wait for navigation
    
    await eyes.check('Shop Page', Target.window().fully())
    console.log('✅ Shop page baseline captured')
    
    // Test modal
    await driver.get('http://localhost:3000')
    const learnMoreBtn = await driver.findElement({ css: '[data-testid="learn-more-btn"]' })
    await learnMoreBtn.click()
    await driver.sleep(500) // Wait for modal
    
    await eyes.check('Modal Open', Target.window().fully())
    console.log('✅ Modal baseline captured')
    
    // Close modal
    const closeBtn = await driver.findElement({ css: '[data-testid="modal-close"]' })
    await closeBtn.click()
    await driver.sleep(500)
    
    // Test cart flow
    await driver.findElement({ css: '[data-testid="shop-link"]' }).click()
    await driver.sleep(1000)
    
    await driver.findElement({ css: '[data-testid="add-to-cart-1"]' }).click()
    await driver.sleep(500)
    
    await driver.findElement({ css: '[data-testid="cart-link"]' }).click()
    await driver.sleep(1000)
    
    await eyes.check('Cart Page', Target.window().fully())
    console.log('✅ Cart page baseline captured')
    
    // End the test
    const results = await eyes.close(false) // false = don't throw on diffs
    
    if (results.getIsDifferent()) {
      console.log('🔍 Visual differences detected!')
      console.log('📊 This is GOOD - Applitools is working!')
      console.log('🎯 Differences found:', results.getMismatches())
      console.log('📊 Review differences:', results.getUrl())
    } else {
      console.log('✅ No visual differences detected')
      console.log('📊 Results URL:', results.getUrl())
    }
    
    console.log('🎉 Visual test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during visual test:', error)
    await eyes.abortIfNotClosed()
  } finally {
    await driver.quit()
  }
}

// Run the test
if (require.main === module) {
  runVisualTest().catch(console.error)
}

module.exports = { runVisualTest }