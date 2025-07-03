#!/usr/bin/env node

import fs from 'fs'
import { execSync } from 'child_process'

const testingTools = {
  'lambdatest': {
    name: 'LambdaTest - Cross-browser testing with AI insights',
    framework: 'cypress', // or webdriverio, nodejs
    setup: setupLambdaTest
  },
  'applitools': {
    name: 'Applitools - Visual AI testing',
    framework: 'cypress',
    setup: setupApplitools
  },
  'testim': {
    name: 'Testim - AI-powered test automation',
    framework: 'testim',
    setup: setupTestim
  },
  'functionize': {
    name: 'Functionize - Intelligent test automation',
    framework: 'functionize',
    setup: setupFunctionize
  },
  'testrigor': {
    name: 'TestRigor - Plain English testing',
    framework: 'testrigor',
    setup: setupTestRigor
  },
  'reflect': {
    name: 'Reflect - No-code AI testing',
    framework: 'reflect',
    setup: setupReflect
  }
}

function setupLambdaTest() {
  console.log('🔧 Setting up LambdaTest...')
  
  // Install Cypress LambdaTest CLI
  execSync('npm install --save-dev lambdatest-cypress-cli', { stdio: 'inherit' })
  
  // Create lambdatest configuration
  const lambdaConfig = {
    "lambdatest_auth": {
      "username": "LT_USERNAME",
      "access_key": "LT_ACCESS_KEY"
    },
    "browsers": [
      {
        "browser": "Chrome",
        "platform": "Windows 10",
        "versions": ["latest"]
      }
    ],
    "run_settings": {
      "cypress_config_file": "cypress.lambdatest.config.js",
      "build_name": "TestableApp AI Testing Research",
      "project_name": "Traditional vs AI Testing",
      "specs": "./cypress/e2e/**/*.cy.js"
    }
  }
  
  fs.writeFileSync('lambdatest.json', JSON.stringify(lambdaConfig, null, 2))
  
  console.log('✅ LambdaTest setup complete!')
  console.log('📝 Run: lambdatest-cypress run')
}

function setupApplitools() {
  console.log('🔧 Setting up Applitools...')
  
  // Install Applitools Eyes SDK
  execSync('npm install --save-dev @applitools/eyes-cypress', { stdio: 'inherit' })
  
  // Create applitools.config.js
  const applitoolsConfig = `module.exports = {
  testConcurrency: 5,
  apiKey: process.env.APPLITOOLS_API_KEY,
  batchName: 'TestableApp Visual Testing',
  branchName: 'main',
  parentBranchName: 'main',
  baselineBranchName: 'main',
  showLogs: true,
  browser: [
    {name: 'chrome', width: 1280, height: 720},
    {name: 'firefox', width: 1280, height: 720},
    {name: 'safari', width: 1280, height: 720},
    {name: 'edge', width: 1280, height: 720}
  ]
}
`
  
  fs.writeFileSync('applitools.config.js', applitoolsConfig)
  
  // Create visual test examples
  if (!fs.existsSync('cypress/e2e/visual')) {
    fs.mkdirSync('cypress/e2e/visual', { recursive: true })
  }
  
  const visualTest = `describe('Visual Testing with Applitools', () => {
  beforeEach(() => {
    cy.eyesOpen({
      appName: 'TestableApp',
      batchName: 'AI Testing Research'
    })
  })
  
  afterEach(() => {
    cy.eyesClose()
  })
  
  it('should detect UI misalignment bug', () => {
    cy.visit('/')
    cy.eyesCheckWindow('Homepage Layout')
    
    // Test with bug injected
    cy.task('injectBug', 'ui-misalignment')
    cy.reload()
    cy.eyesCheckWindow('Homepage Layout - With Bug')
  })
  
  it('should detect modal positioning issues', () => {
    cy.visit('/')
    cy.get('[data-testid="learn-more-btn"]').click()
    cy.eyesCheckWindow('Modal Overlay')
  })
})
`
  
  fs.writeFileSync('cypress/e2e/visual/applitools.cy.js', visualTest)
  
  console.log('✅ Applitools setup complete!')
  console.log('📝 Add APPLITOOLS_API_KEY to your environment')
}

function setupTestim() {
  console.log('🔧 Setting up Testim...')
  
  // Install Testim CLI
  execSync('npm install --save-dev @testim/testim-cli', { stdio: 'inherit' })
  
  // Create testim configuration
  const testimConfig = {
    "project": "TestableApp AI Testing Research",
    "grid": "testim-grid",
    "browsers": ["chrome", "firefox", "safari"],
    "parallels": 3,
    "baseUrl": "https://testableapp.latentgenius.ai",
    "reports": {
      "junit": "testim-results.xml"
    },
    "testData": {
      "validUser": {
        "email": "test@example.com",
        "password": "password123"
      },
      "invalidUser": {
        "email": "wrong@example.com", 
        "password": "wrongpassword"
      }
    }
  }
  
  fs.writeFileSync('testim.config.json', JSON.stringify(testimConfig, null, 2))
  
  console.log('✅ Testim setup complete!')
  console.log('📝 Import your tests from Testim Editor')
  console.log('📝 Run: testim --token YOUR_TOKEN --project YOUR_PROJECT_ID')
}

function setupFunctionize() {
  console.log('🔧 Setting up Functionize...')
  
  // Create functionize test configuration
  const functionizeConfig = {
    "project": "TestableApp AI Testing Research",
    "application": {
      "name": "TestableApp",
             "url": "https://testableapp.latentgenius.ai",
      "type": "web"
    },
    "testSuites": [
      {
        "name": "Authentication Tests",
        "tests": [
          "login-success",
          "login-failure",
          "registration-flow"
        ]
      },
      {
        "name": "Shopping Cart Tests", 
        "tests": [
          "add-to-cart",
          "cart-calculation",
          "checkout-flow"
        ]
      },
      {
        "name": "UI Interaction Tests",
        "tests": [
          "modal-interactions",
          "theme-toggle",
          "form-validation"
        ]
      }
    ],
    "environments": [
      {
        "name": "production",
        "url": "https://testableapp.latentgenius.ai"
      },
      {
        "name": "staging", 
        "url": "http://localhost:3000"
      }
    ]
  }
  
  fs.writeFileSync('functionize.config.json', JSON.stringify(functionizeConfig, null, 2))
  
  console.log('✅ Functionize setup complete!')
  console.log('📝 Upload configuration to Functionize platform')
  console.log('📝 Import your Cypress tests to Functionize')
}

function setupTestRigor() {
  console.log('🔧 Setting up TestRigor...')
  
  // Create plain English test examples
  if (!fs.existsSync('testrigor-tests')) {
    fs.mkdirSync('testrigor-tests', { recursive: true })
  }
  
  const testRigorTests = {
    "project": "TestableApp AI Testing Research",
    "baseUrl": "https://testableapp.latentgenius.ai",
    "tests": [
      {
        "name": "Login Success Test",
        "description": "Test successful login with valid credentials",
        "steps": [
          "go to \"https://testableapp.latentgenius.ai/login\"",
          "enter \"test@example.com\" into \"email\"",
          "enter \"password123\" into \"password\"",
          "click \"Login\"",
          "check that page contains \"Welcome to TestableApp\""
        ]
      },
      {
        "name": "Login Failure Test (Bug Injected)",
        "description": "Test login failure when bug is injected", 
        "steps": [
          "go to \"https://testableapp.latentgenius.ai/login\"",
          "enter \"test@example.com\" into \"email\"",
          "enter \"password123\" into \"password\"",
          "click \"Login\"",
          "check that page contains \"Invalid email or password\""
        ]
      },
      {
        "name": "Shopping Cart Test",
        "description": "Test adding items to cart and calculation",
        "steps": [
                     "go to \"https://testableapp.latentgenius.ai/shop\"",
          "click \"Add to Cart\" near \"Wireless Headphones\"",
                     "go to \"https://testableapp.latentgenius.ai/cart\"",
          "check that page contains \"$99.99\"",
          "click \"+\" button",
          "check that page contains \"$199.98\""
        ]
      },
      {
        "name": "Modal Interaction Test",
        "description": "Test modal opening and closing behaviors",
        "steps": [
                     "go to \"https://testableapp.latentgenius.ai\"",
          "click \"Learn More\"",
          "check that page contains \"About TestableApp\"",
          "press \"Escape\" key",
          "check that page does not contain \"About TestableApp\""
        ]
      }
    ]
  }
  
  fs.writeFileSync('testrigor-tests/tests.json', JSON.stringify(testRigorTests, null, 2))
  
  console.log('✅ TestRigor setup complete!')
  console.log('📝 Copy tests to TestRigor platform')
  console.log('📝 Tests written in plain English for easy maintenance')
}

function setupReflect() {
  console.log('🔧 Setting up Reflect...')
  
  // Create Reflect test configuration
  const reflectConfig = {
    "project": "TestableApp AI Testing Research",
    "application": {
      "name": "TestableApp",
      "baseUrl": "https://testableapp.latentgenius.ai"
    },
    "testScenarios": [
      {
        "name": "User Authentication Flow",
        "description": "Complete login and registration testing",
        "recordingNotes": "Record user navigating through login/register forms"
      },
      {
        "name": "Shopping Experience",
        "description": "End-to-end shopping cart functionality",
        "recordingNotes": "Record user browsing products, adding to cart, checkout"
      },
      {
        "name": "UI Interactions",
        "description": "Modal, theme toggle, form validation",
        "recordingNotes": "Record user interacting with UI elements"
      }
    ],
    "environments": [
      {
        "name": "Production",
        "url": "https://testableapp.latentgenius.ai"
      }
    ]
  }
  
  fs.writeFileSync('reflect.config.json', JSON.stringify(reflectConfig, null, 2))
  
  console.log('✅ Reflect setup complete!')
  console.log('📝 Use Reflect browser extension to record tests')
  console.log('📝 Upload configuration to Reflect platform')
}

function setupAllTools() {
  console.log('🚀 Setting up all AI testing tools...')
  
  Object.entries(testingTools).forEach(([key, tool]) => {
    console.log(`\n--- ${tool.name} ---`)
    tool.setup()
  })
  
  // Create master environment file
  const masterEnv = `# TestableApp AI Testing Research - Environment Variables

# LambdaTest
LT_USERNAME=your_lambdatest_username
LT_ACCESS_KEY=your_lambdatest_access_key

# Applitools
APPLITOOLS_API_KEY=your_applitools_api_key

# Testim
TESTIM_TOKEN=your_testim_token
TESTIM_PROJECT=your_testim_project_id

  # Application URLs
  PROD_URL=https://testableapp.latentgenius.ai
  LOCAL_URL=http://localhost:3000

# Test Data
VALID_EMAIL=test@example.com
VALID_PASSWORD=password123
INVALID_EMAIL=wrong@example.com
INVALID_PASSWORD=wrongpassword
`
  
  fs.writeFileSync('.env.testing', masterEnv)
  
  console.log('\n✅ All tools setup complete!')
  console.log('📝 Update .env.testing with your API keys and credentials')
}

function showToolOptions() {
  console.log('🚀 TestableApp AI Testing Tools Setup')
  console.log('====================================')
  console.log('Available tools:')
  console.log()
  
  Object.entries(testingTools).forEach(([key, tool], index) => {
    console.log(`${index + 1}. ${key}: ${tool.name}`)
  })
  
  console.log()
  console.log('Usage:')
  console.log('  node scripts/setup-all-tools.js [tool-name]')
  console.log('  node scripts/setup-all-tools.js all')
  console.log()
  console.log('Examples:')
  console.log('  node scripts/setup-all-tools.js lambdatest')
  console.log('  node scripts/setup-all-tools.js applitools')
  console.log('  node scripts/setup-all-tools.js all')
}

// Main execution
const tool = process.argv[2]

if (!tool) {
  showToolOptions()
} else if (tool === 'all') {
  setupAllTools()
} else if (testingTools[tool]) {
  testingTools[tool].setup()
} else {
  console.error(`❌ Unknown tool: ${tool}`)
  showToolOptions()
} 