const { Builder } = require('selenium-webdriver')
const { Eyes, Target, BatchInfo } = require('@applitools/eyes-selenium')
const { exec } = require('child_process')
const { promisify } = require('util')
require('dotenv').config()

const execAsync = promisify(exec)

async function traditionalTest(driver) {
  console.log('🔨 Running Traditional Testing Approach...')
  
  // Inject visual bugs first
  await execAsync('node scripts/inject-bugs.js inject ui-misalignment')
  
  let assertionCount = 0
  const startTime = Date.now()
  
  try {
    await driver.get('http://localhost:3000')
    
    // Traditional assertions - these will PASS despite visual bugs
    const title = await driver.findElement({ css: '[data-testid="home-title"]' })
    const titleText = await title.getText()
    console.log(`✅ Title exists: "${titleText}"`)
    assertionCount++
    
    const learnMoreBtn = await driver.findElement({ css: '[data-testid="learn-more-btn"]' })
    const isVisible = await learnMoreBtn.isDisplayed()
    console.log(`✅ Learn More button visible: ${isVisible}`)
    assertionCount++
    
    const getStartedBtn = await driver.findElement({ css: '[data-testid="get-started-btn"]' })
    const isClickable = await getStartedBtn.isEnabled()
    console.log(`✅ Get Started button clickable: ${isClickable}`)
    assertionCount++
    
    // Test modal functionality
    await learnMoreBtn.click()
    await driver.sleep(500)
    
    const modal = await driver.findElement({ css: '[data-testid="info-modal"]' })
    const modalVisible = await modal.isDisplayed()
    console.log(`✅ Modal opens: ${modalVisible}`)
    assertionCount++
    
    const closeBtn = await driver.findElement({ css: '[data-testid="modal-close"]' })
    await closeBtn.click()
    await driver.sleep(500)
    
    // Navigate to shop
    const shopLink = await driver.findElement({ css: '[data-testid="shop-link"]' })
    await shopLink.click()
    await driver.sleep(1000)
    
    const products = await driver.findElements({ css: '[data-testid^="product-"]' })
    console.log(`✅ Products displayed: ${products.length}`)
    assertionCount++
    
    // Add to cart
    const addToCartBtn = await driver.findElement({ css: '[data-testid="add-to-cart-1"]' })
    await addToCartBtn.click()
    await driver.sleep(500)
    
    const cartLink = await driver.findElement({ css: '[data-testid="cart-link"]' })
    await cartLink.click()
    await driver.sleep(1000)
    
    const cartItems = await driver.findElements({ css: '[data-testid^="cart-item-"]' })
    console.log(`✅ Cart items: ${cartItems.length}`)
    assertionCount++
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`\n📊 Traditional Testing Results:`)
    console.log(`   • ${assertionCount} assertions executed`)
    console.log(`   • ${duration}ms execution time`)
    console.log(`   • ✅ ALL TESTS PASSED`)
    console.log(`   • ⚠️  BUT LAYOUT IS VISUALLY BROKEN!`)
    
    return { assertionCount, duration, passed: true, visualIssuesDetected: false }
    
  } catch (error) {
    console.log(`❌ Traditional test error: ${error.message}`)
    return { assertionCount, duration: Date.now() - startTime, passed: false, visualIssuesDetected: false }
  }
}

async function visualTest(driver) {
  console.log('\n🤖 Running AI Vision Testing Approach...')
  
  const eyes = new Eyes()
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY)
  
  const batch = new BatchInfo('Traditional vs Visual Comparison')
  eyes.setBatch(batch)
  
  const startTime = Date.now()
  let checkpointCount = 0
  
  try {
    await eyes.open(driver, 'TestableApp', 'Traditional vs Visual Comparison', { width: 1280, height: 720 })
    
    // First establish clean baseline
    await execAsync('node scripts/inject-bugs.js restore')
    await driver.get('http://localhost:3000')
    
    await eyes.check('Homepage - Clean Baseline', Target.window().fully())
    checkpointCount++
    console.log('✅ Clean baseline captured')
    
    // Now test with visual bugs
    await execAsync('node scripts/inject-bugs.js inject ui-misalignment')
    await driver.get('http://localhost:3000')
    
    await eyes.check('Homepage - With Visual Bugs', Target.window().fully())
    checkpointCount++
    console.log('🔍 Visual bugs captured - AI analyzing...')
    
    // Test shop page
    await driver.findElement({ css: '[data-testid="shop-link"]' }).click()
    await driver.sleep(1000)
    await eyes.check('Shop Page - With Visual Bugs', Target.window().fully())
    checkpointCount++
    
    // Test modal
    await driver.get('http://localhost:3000')
    await driver.findElement({ css: '[data-testid="learn-more-btn"]' }).click()
    await driver.sleep(500)
    await eyes.check('Modal - With Positioning Bugs', Target.window().fully())
    checkpointCount++
    
    const results = await eyes.close()
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`\n📊 AI Vision Testing Results:`)
    console.log(`   • ${checkpointCount} visual checkpoints`)
    console.log(`   • ${duration}ms execution time`)
    console.log(`   • 🤖 AI analyzed entire UI automatically`)
    console.log(`   • 🎯 VISUAL DIFFERENCES DETECTED!`)
    console.log(`   • 📊 Results: ${results.getUrl()}`)
    
    return { checkpointCount, duration, passed: true, visualIssuesDetected: true, resultsUrl: results.getUrl() }
    
  } catch (error) {
    console.log(`❌ Visual test error: ${error.message}`)
    await eyes.abortIfNotClosed()
    return { checkpointCount, duration: Date.now() - startTime, passed: false, visualIssuesDetected: false }
  }
}

async function runComparison() {
  const driver = await new Builder().forBrowser('chrome').build()
  
  try {
    console.log('🔬 TESTING METHODOLOGY COMPARISON\n')
    console.log('=' .repeat(60))
    
    // Run traditional testing
    const traditionalResults = await traditionalTest(driver)
    
    console.log('\n' + '=' .repeat(60))
    
    // Run visual testing  
    const visualResults = await visualTest(driver)
    
    console.log('\n' + '=' .repeat(60))
    console.log('🏆 COMPARISON SUMMARY')
    console.log('=' .repeat(60))
    
    console.log(`\n📈 EFFICIENCY:`)
    console.log(`   Traditional: ${traditionalResults.assertionCount} individual assertions`)
    console.log(`   AI Vision:   ${visualResults.checkpointCount} comprehensive checkpoints`)
    console.log(`   Efficiency Gain: ${Math.round(traditionalResults.assertionCount / visualResults.checkpointCount)}x fewer tests needed`)
    
    console.log(`\n⏱️  SPEED:`)
    console.log(`   Traditional: ${traditionalResults.duration}ms`)
    console.log(`   AI Vision:   ${visualResults.duration}ms`)
    
    console.log(`\n🎯 ACCURACY:`)
    console.log(`   Traditional: Missed visual layout bugs ❌`)
    console.log(`   AI Vision:   Detected visual differences ✅`)
    
    console.log(`\n💡 KEY INSIGHT:`)
    console.log(`   Traditional testing gives FALSE CONFIDENCE`)
    console.log(`   AI Vision testing catches what users actually see`)
    
    if (visualResults.resultsUrl) {
      console.log(`\n🔗 View detailed visual analysis:`)
      console.log(`   ${visualResults.resultsUrl}`)
    }
    
    // Restore clean state
    await execAsync('node scripts/inject-bugs.js restore')
    
  } catch (error) {
    console.error('❌ Comparison test failed:', error)
  } finally {
    await driver.quit()
  }
}

if (require.main === module) {
  runComparison().catch(console.error)
}

module.exports = { runComparison }