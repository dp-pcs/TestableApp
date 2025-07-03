#!/usr/bin/env node

import fs from 'fs'
import { execSync } from 'child_process'

const frameworks = {
  'cypress': {
    name: 'Cypress (Recommended - use existing tests)',
    dependencies: ['lambdatest-cypress-cli'],
    setup: setupCypress
  },
  'webdriverio': {
    name: 'WebDriverIO (Alternative for comprehensive browser testing)',
    dependencies: ['@wdio/cli', '@wdio/local-runner', '@wdio/mocha-framework', '@wdio/spec-reporter', '@wdio/lambdatest-service'],
    setup: setupWebDriverIO
  },
  'nodejs': {
    name: 'Node.js WebDriver (Custom implementation)',
    dependencies: ['selenium-webdriver', 'lambdatest-node-sdk'],
    setup: setupNodeJS
  }
}

function setupCypress() {
  console.log('🔧 Setting up Cypress with LambdaTest...')
  
  // Install dependencies
  console.log('📦 Installing dependencies...')
  execSync('npm install --save-dev lambdatest-cypress-cli', { stdio: 'inherit' })
  
  // Create environment file template
  const envTemplate = `# LambdaTest Configuration
LT_USERNAME=your_lambdatest_username
LT_ACCESS_KEY=your_lambdatest_access_key

# Optional: For local testing
LT_TUNNEL=false
LT_TUNNEL_NAME=TestableApp-Tunnel
`
  
  fs.writeFileSync('.env.lambdatest', envTemplate)
  
  console.log('✅ Cypress setup complete!')
  console.log('📝 Next steps:')
  console.log('1. Get your LambdaTest credentials from https://accounts.lambdatest.com/detail/profile')
  console.log('2. Update .env.lambdatest with your credentials')
  console.log('3. Run: npm run test:lambdatest')
}

function setupWebDriverIO() {
  console.log('🔧 Setting up WebDriverIO with LambdaTest...')
  
  // Install dependencies
  console.log('📦 Installing dependencies...')
  execSync('npm install --save-dev @wdio/cli @wdio/local-runner @wdio/mocha-framework @wdio/spec-reporter @wdio/lambdatest-service', { stdio: 'inherit' })
  
  // Create wdio.conf.js
  const wdioConfig = `export const config = {
  user: process.env.LT_USERNAME,
  key: process.env.LT_ACCESS_KEY,
  
  specs: ['./tests/wdio/**/*.js'],
  exclude: [],
  
  capabilities: [{
    browserName: 'chrome',
    browserVersion: 'latest',
    platformName: 'Windows 10',
    'LT:Options': {
      build: 'TestableApp WDIO Build',
      project: 'TestableApp AI Testing Research',
      w3c: true,
      plugin: 'node_js-node_js'
    }
  }],
  
  logLevel: 'info',
  bail: 0,
     baseUrl: 'https://testableapp.latentgenius.ai',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  
  services: [
    ['lambdatest', {
      tunnel: false
    }]
  ],
  
  framework: 'mocha',
  reporters: ['spec'],
  
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  }
}
`
  
  fs.writeFileSync('wdio.conf.js', wdioConfig)
  
  // Create sample test
  if (!fs.existsSync('tests/wdio')) {
    fs.mkdirSync('tests/wdio', { recursive: true })
  }
  
  const sampleTest = `describe('TestableApp Login Flow', () => {
  it('should login successfully with correct credentials', async () => {
    await browser.url('/login')
    
    await $('[data-testid="email-input"]').setValue('test@example.com')
    await $('[data-testid="password-input"]').setValue('password123')
    await $('[data-testid="login-submit"]').click()
    
    await expect($('[data-testid="home-title"]')).toBeExisting()
    await expect($('[data-testid="home-title"]')).toHaveText('Welcome to TestableApp')
  })
  
  it('should show error with incorrect credentials', async () => {
    await browser.url('/login')
    
    await $('[data-testid="email-input"]').setValue('wrong@example.com')
    await $('[data-testid="password-input"]').setValue('wrongpassword')
    await $('[data-testid="login-submit"]').click()
    
    await expect($('[data-testid="error-message"]')).toBeExisting()
  })
})
`
  
  fs.writeFileSync('tests/wdio/login.test.js', sampleTest)
  
  console.log('✅ WebDriverIO setup complete!')
  console.log('📝 Next steps:')
  console.log('1. Update .env.lambdatest with your credentials')
  console.log('2. Run: npx wdio wdio.conf.js')
}

function setupNodeJS() {
  console.log('🔧 Setting up Node.js WebDriver with LambdaTest...')
  
  // Install dependencies
  console.log('📦 Installing dependencies...')
  execSync('npm install --save-dev selenium-webdriver', { stdio: 'inherit' })
  
  // Create sample test
  if (!fs.existsSync('tests/nodejs')) {
    fs.mkdirSync('tests/nodejs', { recursive: true })
  }
  
  const nodeTest = `const { Builder, By, until } = require('selenium-webdriver')

const capabilities = {
  browserName: 'chrome',
  browserVersion: 'latest',
  platformName: 'Windows 10',
  'LT:Options': {
    username: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    build: 'TestableApp Node.js Build',
    project: 'TestableApp AI Testing Research',
    w3c: true,
    plugin: 'node_js-node_js'
  }
}

async function testLogin() {
  const driver = await new Builder()
    .usingServer('https://hub.lambdatest.com/wd/hub')
    .withCapabilities(capabilities)
    .build()
  
  try {
         await driver.get('https://testableapp.latentgenius.ai/login')
    
    await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys('test@example.com')
    await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys('password123')
    await driver.findElement(By.css('[data-testid="login-submit"]')).click()
    
    await driver.wait(until.elementLocated(By.css('[data-testid="home-title"]')), 10000)
    
    const title = await driver.findElement(By.css('[data-testid="home-title"]')).getText()
    console.log('✅ Login successful, title:', title)
    
    await driver.executeScript('lambda-status=passed')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await driver.executeScript('lambda-status=failed')
  } finally {
    await driver.quit()
  }
}

testLogin()
`
  
  fs.writeFileSync('tests/nodejs/login.test.js', nodeTest)
  
  console.log('✅ Node.js setup complete!')
  console.log('📝 Next steps:')
  console.log('1. Update .env.lambdatest with your credentials')
  console.log('2. Run: node tests/nodejs/login.test.js')
}

function showFrameworkOptions() {
  console.log('🚀 TestableApp LambdaTest Setup')
  console.log('================================')
  console.log('Choose your testing framework:')
  console.log()
  
  Object.entries(frameworks).forEach(([key, framework], index) => {
    console.log(`${index + 1}. ${key.toUpperCase()}: ${framework.name}`)
  })
  
  console.log()
  console.log('Usage:')
  console.log('  node scripts/setup-lambdatest.js cypress')
  console.log('  node scripts/setup-lambdatest.js webdriverio') 
  console.log('  node scripts/setup-lambdatest.js nodejs')
}

// Main execution
const framework = process.argv[2]

if (!framework) {
  showFrameworkOptions()
} else if (frameworks[framework]) {
  frameworks[framework].setup()
} else {
  console.error(`❌ Unknown framework: ${framework}`)
  showFrameworkOptions()
} 