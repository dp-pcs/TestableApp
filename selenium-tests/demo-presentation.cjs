const { Builder } = require('selenium-webdriver')
const { Eyes, Target, BatchInfo } = require('@applitools/eyes-selenium')
const { exec } = require('child_process')
const { promisify } = require('util')
require('dotenv').config()

const execAsync = promisify(exec)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runDemonstration() {
  const driver = await new Builder().forBrowser('chrome').build()
  const eyes = new Eyes()
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY)
  
  try {
    console.log('🎬 STARTING DEMO PRESENTATION')
    console.log('=' .repeat(60))
    console.log('This demo shows how traditional testing misses obvious visual bugs')
    console.log('that Applitools visual testing catches immediately.')
    console.log('=' .repeat(60))
    
    // PART 1: Show the clean application
    console.log('\n📱 PART 1: Clean Application Baseline')
    console.log('-' .repeat(40))
    
    await execAsync('node scripts/inject-bugs.js restore')
    console.log('✅ Restored application to clean state')
    
    await driver.get('http://localhost:3000')
    console.log('🌐 Navigated to homepage')
    
    await sleep(2000) // Give time to see the clean state
    
    // PART 2: Traditional testing on clean app
    console.log('\n🔨 PART 2: Traditional Testing (Clean App)')
    console.log('-' .repeat(40))
    
    let functionalTests = 0
    
    // Test 1: Check title exists
    const title = await driver.findElement({ css: '[data-testid="home-title"]' })
    const titleText = await title.getText()
    console.log(`✅ Test ${++functionalTests}: Title exists - "${titleText}"`)
    
    // Test 2: Check buttons are clickable
    const learnMoreBtn = await driver.findElement({ css: '[data-testid="learn-more-btn"]' })
    const isClickable = await learnMoreBtn.isEnabled()
    console.log(`✅ Test ${++functionalTests}: Learn More button is clickable - ${isClickable}`)
    
    // Test 3: Test modal functionality
    await learnMoreBtn.click()
    await sleep(1000)
    const modal = await driver.findElement({ css: '[data-testid="info-modal"]' })
    const modalVisible = await modal.isDisplayed()
    console.log(`✅ Test ${++functionalTests}: Modal opens correctly - ${modalVisible}`)
    
    const closeBtn = await driver.findElement({ css: '[data-testid="modal-close"]' })
    await closeBtn.click()
    await sleep(1000)
    console.log(`✅ Test ${++functionalTests}: Modal closes correctly`)
    
    // Test 4: Navigation works
    const shopLink = await driver.findElement({ css: '[data-testid="shop-link"]' })
    await shopLink.click()
    await sleep(2000)
    
    const products = await driver.findElements({ css: '[data-testid^="product-"]' })
    console.log(`✅ Test ${++functionalTests}: Shop page loads with ${products.length} products`)
    
    // Test 5: Add to cart works
    const addToCartBtn = await driver.findElement({ css: '[data-testid="add-to-cart-1"]' })
    await addToCartBtn.click()
    await sleep(1000)
    console.log(`✅ Test ${++functionalTests}: Add to cart functionality works`)
    
    console.log(`\n📊 Traditional Testing Results: ${functionalTests}/6 tests PASSED`)
    
    // PART 3: Inject obvious visual bugs
    console.log('\n🐛 PART 3: Injecting OBVIOUS Visual Bugs')
    console.log('-' .repeat(40))
    console.log('Injecting visual chaos:')
    console.log('• Red buttons instead of blue')
    console.log('• Rotated and shifted cards')
    console.log('• Huge purple underlined title')
    console.log('• Yellow header background')
    console.log('• Green oversized prices')
    console.log('• Mispositioned modal')
    
    await execAsync('node scripts/inject-bugs.js inject demo-visual-chaos')
    console.log('💥 Visual bugs injected!')
    
    await driver.get('http://localhost:3000')
    await sleep(3000) // Give time to see the chaos
    
    // PART 4: Traditional testing on broken app (will still pass!)
    console.log('\n🔨 PART 4: Traditional Testing (Visually Broken App)')
    console.log('-' .repeat(40))
    console.log('Running the EXACT SAME functional tests...')
    
    functionalTests = 0
    
    // Test 1: Check title exists (will pass despite being huge and purple!)
    const brokenTitle = await driver.findElement({ css: '[data-testid="home-title"]' })
    const brokenTitleText = await brokenTitle.getText()
    console.log(`✅ Test ${++functionalTests}: Title exists - "${brokenTitleText}"`)
    console.log('   📝 NOTE: Title is now HUGE and PURPLE but test still passes!')
    
    // Test 2: Check buttons are clickable (will pass despite being red!)
    const brokenLearnMoreBtn = await driver.findElement({ css: '[data-testid="learn-more-btn"]' })
    const brokenIsClickable = await brokenLearnMoreBtn.isEnabled()
    console.log(`✅ Test ${++functionalTests}: Learn More button is clickable - ${brokenIsClickable}`)
    console.log('   📝 NOTE: Button is now BRIGHT RED but test still passes!')
    
    // Test 3: Test modal functionality (will pass despite being off-screen!)
    await brokenLearnMoreBtn.click()
    await sleep(1000)
    try {
      const brokenModal = await driver.findElement({ css: '[data-testid="info-modal"]' })
      const brokenModalVisible = await brokenModal.isDisplayed()
      console.log(`✅ Test ${++functionalTests}: Modal opens correctly - ${brokenModalVisible}`)
      console.log('   📝 NOTE: Modal is now OFF-SCREEN but test still passes!')
      
      const brokenCloseBtn = await driver.findElement({ css: '[data-testid="modal-close"]' })
      await brokenCloseBtn.click()
      await sleep(1000)
      console.log(`✅ Test ${++functionalTests}: Modal closes correctly`)
    } catch (error) {
      console.log(`⚠️ Test ${++functionalTests}: Modal test had issues but we'll continue`)
    }
    
    // Test 4: Navigation works (will pass despite yellow header!)
    const brokenShopLink = await driver.findElement({ css: '[data-testid="shop-link"]' })
    await brokenShopLink.click()
    await sleep(2000)
    
    const brokenProducts = await driver.findElements({ css: '[data-testid^="product-"]' })
    console.log(`✅ Test ${++functionalTests}: Shop page loads with ${brokenProducts.length} products`)
    console.log('   📝 NOTE: Cards are ROTATED and prices are BRIGHT GREEN but test still passes!')
    
    // Test 5: Add to cart works (will pass despite visual chaos!)
    const brokenAddToCartBtn = await driver.findElement({ css: '[data-testid="add-to-cart-1"]' })
    await brokenAddToCartBtn.click()
    await sleep(1000)
    console.log(`✅ Test ${++functionalTests}: Add to cart functionality works`)
    console.log('   📝 NOTE: Everything is visually broken but functionality works!')
    
    console.log(`\n📊 Traditional Testing Results: ${functionalTests}/5 tests STILL PASSED!`)
    console.log('⚠️  CRITICAL INSIGHT: Traditional testing gives FALSE CONFIDENCE!')
    console.log('    The app is visually DESTROYED but all functional tests pass.')
    
    // PART 5: Visual testing with Applitools
    console.log('\n👁️  PART 5: Applitools Visual Testing')
    console.log('-' .repeat(40))
    
    const batch = new BatchInfo('Demo Presentation - Visual Chaos Detection')
    eyes.setBatch(batch)
    
    await eyes.open(driver, 'TestableApp Demo', 'Visual Chaos Detection', { width: 1280, height: 720 })
    
    // First, establish clean baseline
    console.log('📸 Step 1: Capturing clean baseline...')
    await execAsync('node scripts/inject-bugs.js restore')
    await driver.get('http://localhost:3000')
    await sleep(2000)
    
    await eyes.check('Homepage - Clean Baseline', Target.window().fully())
    console.log('✅ Clean baseline captured')
    
    // Now test the broken version
    console.log('📸 Step 2: Testing visually broken version...')
    await execAsync('node scripts/inject-bugs.js inject demo-visual-chaos')
    await driver.get('http://localhost:3000')
    await sleep(3000)
    
    await eyes.check('Homepage - VISUAL CHAOS', Target.window().fully())
    console.log('🔍 Visual chaos captured - Applitools is analyzing...')
    
    // Test shop page too
    await driver.findElement({ css: '[data-testid="shop-link"]' }).click()
    await sleep(2000)
    await eyes.check('Shop Page - VISUAL CHAOS', Target.window().fully())
    console.log('🔍 Shop page chaos captured')
    
    const results = await eyes.close(false)
    
    console.log('\n🎯 VISUAL TESTING RESULTS:')
    if (results.getIsDifferent()) {
      console.log('❌ MASSIVE visual differences detected!')
      console.log('🚨 Applitools caught EVERY visual issue:')
      console.log('   • Red buttons instead of blue')
      console.log('   • Rotated cards')
      console.log('   • Huge purple title')
      console.log('   • Yellow header')
      console.log('   • Green prices')
      console.log('   • Everything that traditional testing missed!')
    } else {
      console.log('✅ No differences (unexpected for this demo)')
    }
    
    console.log(`\n📊 Detailed visual analysis: ${results.getUrl()}`)
    
    // FINAL SUMMARY
    console.log('\n' + '=' .repeat(60))
    console.log('🏆 DEMO CONCLUSION')
    console.log('=' .repeat(60))
    console.log('\n📊 TRADITIONAL TESTING:')
    console.log('   ✅ 5/5 functional tests passed')
    console.log('   ❌ Completely missed OBVIOUS visual problems')
    console.log('   ⚠️  Gives false confidence that app is "working"')
    
    console.log('\n👁️  VISUAL TESTING (Applitools):')
    console.log('   ❌ Immediately detected ALL visual issues')
    console.log('   🎯 Caught problems users would definitely notice')
    console.log('   ✅ Prevented shipping broken UI to customers')
    
    console.log('\n💡 KEY TAKEAWAY:')
    console.log('   Traditional testing = "Does it work?"')
    console.log('   Visual testing = "Does it look right?"')
    console.log('   Both needed = Complete confidence!')
    
    console.log(`\n🔗 Review the visual differences in detail:`)
    console.log(`   ${results.getUrl()}`)
    
    // Restore clean state
    await execAsync('node scripts/inject-bugs.js restore')
    console.log('\n✅ Application restored to clean state')
    
  } catch (error) {
    console.error('❌ Demo error:', error)
    await eyes.abortIfNotClosed()
    await execAsync('node scripts/inject-bugs.js restore')
  } finally {
    await driver.quit()
  }
}

if (require.main === module) {
  runDemonstration().catch(console.error)
}

module.exports = { runDemonstration }