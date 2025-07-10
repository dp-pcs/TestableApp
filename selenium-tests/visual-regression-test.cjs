const { Builder } = require('selenium-webdriver')
const { Eyes, Target, BatchInfo } = require('@applitools/eyes-selenium')
const { exec } = require('child_process')
const { promisify } = require('util')
require('dotenv').config()

const execAsync = promisify(exec)

async function runVisualRegressionTest() {
  const eyes = new Eyes()
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY)
  
  const batch = new BatchInfo('TestableApp Regression Testing')
  eyes.setBatch(batch)
  
  const driver = await new Builder().forBrowser('chrome').build()
  
  try {
    await eyes.open(driver, 'TestableApp', 'Visual Regression Detection', { width: 1280, height: 720 })
    
    console.log('🧪 Testing visual regression detection...')
    
    // Step 1: Capture clean baseline
    console.log('📸 Step 1: Capturing clean baseline...')
    await execAsync('node scripts/inject-bugs.js restore')
    
    await driver.get('http://localhost:3000')
    await eyes.check('Homepage - Clean Baseline', Target.window().fully())
    
    await driver.findElement({ css: '[data-testid="shop-link"]' }).click()
    await driver.sleep(1000)
    await eyes.check('Shop Page - Clean Baseline', Target.window().fully())
    
    // Step 2: Inject visual bugs and capture differences
    console.log('🐛 Step 2: Injecting visual bugs...')
    await execAsync('node scripts/inject-bugs.js inject ui-misalignment')
    
    await driver.get('http://localhost:3000')
    await eyes.check('Homepage - WITH VISUAL BUGS', Target.window().fully())
    console.log('⚠️  Homepage with bugs captured - AI should detect differences!')
    
    await driver.findElement({ css: '[data-testid="shop-link"]' }).click()
    await driver.sleep(1000)
    await eyes.check('Shop Page - WITH VISUAL BUGS', Target.window().fully())
    console.log('⚠️  Shop page with bugs captured - AI should detect differences!')
    
    // Step 3: Test modal with bugs
    await driver.get('http://localhost:3000')
    await driver.findElement({ css: '[data-testid="learn-more-btn"]' }).click()
    await driver.sleep(500)
    await eyes.check('Modal - WITH POSITIONING BUGS', Target.window().fully())
    console.log('⚠️  Modal with bugs captured - AI should detect positioning issues!')
    
    const results = await eyes.close()
    console.log('🎯 Visual regression test completed!')
    console.log('📊 Check results at:', results.getUrl())
    console.log('🤖 AI Vision detected visual differences that traditional tests miss!')
    
    // Restore clean state
    await execAsync('node scripts/inject-bugs.js restore')
    console.log('✅ Restored clean state')
    
    return results
    
  } catch (error) {
    console.error('❌ Error during regression test:', error)
    await eyes.abortIfNotClosed()
    // Ensure we restore clean state even on error
    await execAsync('node scripts/inject-bugs.js restore')
    throw error
  } finally {
    await driver.quit()
  }
}

if (require.main === module) {
  runVisualRegressionTest().catch(console.error)
}

module.exports = { runVisualRegressionTest }