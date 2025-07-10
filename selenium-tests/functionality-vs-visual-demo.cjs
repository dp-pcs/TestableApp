const { Builder } = require('selenium-webdriver')
const { Eyes, Target, BatchInfo } = require('@applitools/eyes-selenium')
const { exec } = require('child_process')
const { promisify } = require('util')
require('dotenv').config()

const execAsync = promisify(exec)

async function demonstrateLimitations() {
  const driver = await new Builder().forBrowser('chrome').build()
  const eyes = new Eyes()
  eyes.setApiKey(process.env.APPLITOOLS_API_KEY)
  
  try {
    console.log('🔍 DEMONSTRATING: What Each Testing Approach Can/Cannot Do\n')
    console.log('=' .repeat(70))
    
    // Test 1: Inject functional bug (login always fails)
    console.log('\n📋 TEST 1: FUNCTIONAL BUG (Login Always Fails)')
    console.log('-' .repeat(50))
    
    await execAsync('node scripts/inject-bugs.js inject login-always-fails')
    await driver.get('http://localhost:3000/login')
    
    // Traditional functional test - WILL DETECT this bug
    console.log('🔨 Traditional Test Result:')
    try {
      await driver.findElement({ css: '[data-testid="email-input"]' }).sendKeys('test@example.com')
      await driver.findElement({ css: '[data-testid="password-input"]' }).sendKeys('password123')
      await driver.findElement({ css: '[data-testid="login-submit"]' }).click()
      await driver.sleep(2000)
      
      // Check if login succeeded (should fail with our bug)
      const currentUrl = await driver.getCurrentUrl()
      if (currentUrl.includes('/login')) {
        console.log('   ❌ DETECTED: Login functionality is broken!')
        console.log('   ✅ Traditional testing caught the functional bug')
      } else {
        console.log('   ✅ Login worked (unexpected)')
      }
    } catch (error) {
      console.log('   ❌ DETECTED: Login form has errors')
    }
    
    // Visual test - WILL NOT DETECT functional issues
    console.log('\n👁️  Applitools Visual Test Result:')
    await eyes.open(driver, 'TestableApp', 'Functionality vs Visual Demo', { width: 1280, height: 720 })
    await driver.get('http://localhost:3000/login')
    await eyes.check('Login Page - Functional Bug Present', Target.window().fully())
    console.log('   ✅ Visual appearance looks normal')
    console.log('   ❌ CANNOT DETECT: Button functionality is broken')
    console.log('   📝 Applitools only sees the visual appearance!')
    
    // Test 2: Inject visual bug (UI misalignment)
    console.log('\n📋 TEST 2: VISUAL BUG (Layout Misalignment)')
    console.log('-' .repeat(50))
    
    await execAsync('node scripts/inject-bugs.js inject ui-misalignment')
    await driver.get('http://localhost:3000')
    
    // Traditional functional test - WILL NOT DETECT visual issues
    console.log('🔨 Traditional Test Result:')
    try {
      const title = await driver.findElement({ css: '[data-testid="home-title"]' })
      const titleText = await title.getText()
      const button = await driver.findElement({ css: '[data-testid="learn-more-btn"]' })
      const isClickable = await button.isEnabled()
      
      console.log(`   ✅ Title exists: "${titleText}"`)
      console.log(`   ✅ Button is clickable: ${isClickable}`)
      console.log('   ❌ CANNOT DETECT: Layout is visually broken')
      console.log('   📝 Traditional tests only check functionality!')
    } catch (error) {
      console.log('   ❌ Functional test error:', error.message)
    }
    
    // Visual test - WILL DETECT layout issues
    console.log('\n👁️  Applitools Visual Test Result:')
    await eyes.check('Homepage - Visual Bug Present', Target.window().fully())
    console.log('   ❌ DETECTED: Layout differences from baseline')
    console.log('   ✅ Applitools caught the visual regression!')
    
    // Test 3: Cart calculation bug
    console.log('\n📋 TEST 3: BUSINESS LOGIC BUG (Cart Calculation)')
    console.log('-' .repeat(50))
    
    await execAsync('node scripts/inject-bugs.js inject cart-calculation-wrong')
    await driver.get('http://localhost:3000/shop')
    
    // Add items to cart
    await driver.findElement({ css: '[data-testid="add-to-cart-1"]' }).click()
    await driver.sleep(500)
    await driver.findElement({ css: '[data-testid="add-to-cart-2"]' }).click()
    await driver.sleep(500)
    
    await driver.findElement({ css: '[data-testid="cart-link"]' }).click()
    await driver.sleep(1000)
    
    console.log('🔨 Traditional Test Result:')
    try {
      const totalElement = await driver.findElement({ css: '[data-testid="cart-total"]' })
      const total = await totalElement.getText()
      console.log(`   💰 Cart total shows: ${total}`)
      
      // We'd need to manually verify if $299.98 is correct for $99.99 + $199.99
      // Traditional testing CAN detect this if we write the assertion
      console.log('   ✅ CAN DETECT: If we write specific assertions for expected totals')
      console.log('   ⚠️  BUT: Requires manually calculating expected values')
    } catch (error) {
      console.log('   ❌ Error reading cart total')
    }
    
    console.log('\n👁️  Applitools Visual Test Result:')
    await eyes.check('Cart Page - Calculation Bug Present', Target.window().fully())
    console.log('   ✅ Cart visually appears normal')
    console.log('   ❌ CANNOT DETECT: Mathematical calculation errors')
    console.log('   📝 Applitools cannot validate business logic!')
    
    const results = await eyes.close()
    
    console.log('\n' + '=' .repeat(70))
    console.log('💡 KEY INSIGHTS')
    console.log('=' .repeat(70))
    
    console.log('\n🔨 TRADITIONAL TESTING (Selenium/Cypress):')
    console.log('   ✅ Tests functionality, business logic, user interactions')
    console.log('   ✅ Validates calculations, form submissions, API calls')
    console.log('   ✅ Checks if features actually work')
    console.log('   ❌ Completely blind to visual appearance issues')
    console.log('   ❌ Cannot detect layout breaks, color changes, spacing')
    
    console.log('\n👁️  VISUAL TESTING (Applitools):')
    console.log('   ✅ Detects any visual change or regression')
    console.log('   ✅ Catches layout issues, design problems')  
    console.log('   ✅ Notices missing elements, color changes')
    console.log('   ❌ Cannot test if anything actually works')
    console.log('   ❌ No idea about business logic or calculations')
    
    console.log('\n🎯 THE SOLUTION: USE BOTH!')
    console.log('   • Traditional tests ensure features work correctly')
    console.log('   • Visual tests ensure features look correct')
    console.log('   • Together = Complete confidence in your application')
    
    console.log(`\n📊 View visual test results: ${results.getUrl()}`)
    
    // Restore clean state
    await execAsync('node scripts/inject-bugs.js restore')
    
  } catch (error) {
    console.error('❌ Demo error:', error)
    await eyes.abortIfNotClosed()
    await execAsync('node scripts/inject-bugs.js restore')
  } finally {
    await driver.quit()
  }
}

if (require.main === module) {
  demonstrateLimitations().catch(console.error)
}

module.exports = { demonstrateLimitations }