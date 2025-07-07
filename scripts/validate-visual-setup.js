#!/usr/bin/env node

// Load environment variables from .env file
import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import { exec, execSync } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 Validating Visual Testing Setup...\n')

// Check 1: API Key
console.log('1. Checking Applitools API Key...')
const apiKey = process.env.APPLITOOLS_API_KEY
if (apiKey) {
  console.log('   ✅ APPLITOOLS_API_KEY is set')
  console.log(`   🔑 Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`)
} else {
  console.log('   ❌ APPLITOOLS_API_KEY is not set')
  console.log('   💡 Set it with: export APPLITOOLS_API_KEY="your_api_key_here"')
  console.log('   🌐 Get your key at: https://applitools.com/users/register\n')
}

// Check 2: Applitools package
console.log('2. Checking Applitools Eyes package...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (packageJson.devDependencies['@applitools/eyes-cypress']) {
    console.log('   ✅ @applitools/eyes-cypress is installed')
    console.log(`   📦 Version: ${packageJson.devDependencies['@applitools/eyes-cypress']}`)
  } else {
    console.log('   ❌ @applitools/eyes-cypress is not installed')
    console.log('   💡 Install with: npm install @applitools/eyes-cypress --save-dev')
  }
} catch (error) {
  console.log('   ❌ Could not read package.json')
}

// Check 3: Visual test file
console.log('3. Checking visual test file...')
if (fs.existsSync('cypress/e2e/visual-comparison.cy.js')) {
  console.log('   ✅ Visual comparison test file exists')
} else {
  console.log('   ❌ Visual comparison test file missing')
}

// Check 4: Bug injection script
console.log('4. Checking bug injection script...')
if (fs.existsSync('scripts/inject-bugs.js')) {
  console.log('   ✅ Bug injection script exists')
} else {
  console.log('   ❌ Bug injection script missing')
}

// Check 5: Server connectivity
console.log('5. Checking development server...')
try {
  const { stdout } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000')
  if (stdout.trim() === '200') {
    console.log('   ✅ Development server is running on port 3000')
  } else {
    console.log('   ❌ Development server is not responding')
    console.log('   💡 Start with: npm run dev')
  }
} catch (error) {
  console.log('   ❌ Could not check development server')
  console.log('   💡 Make sure to start it with: npm run dev')
}

// Check 6: Cypress configuration
console.log('6. Checking Cypress configuration...')
if (fs.existsSync('cypress.config.js')) {
  const config = fs.readFileSync('cypress.config.js', 'utf8')
  if (config.includes('@applitools/eyes-cypress')) {
    console.log('   ✅ Cypress config includes Applitools Eyes')
  } else {
    console.log('   ❌ Cypress config missing Applitools setup')
  }
} else {
  console.log('   ❌ cypress.config.js not found')
}

console.log('\n📋 Setup Summary:')
console.log('='.repeat(50))
if (apiKey && fs.existsSync('cypress/e2e/visual-comparison.cy.js')) {
  console.log('🎉 You\'re ready to run visual tests!')
  console.log('')
  console.log('Quick Start Commands:')
  console.log('  npm run test:visual-demo    # Interactive demo')
  console.log('  npm run test:comparison     # Full comparison')
  console.log('  npm run test:visual         # Visual tests only')
  console.log('')
  console.log('📖 See VISUAL_TESTING_GUIDE.md for detailed instructions')
} else {
  console.log('⚠️  Setup incomplete. Please address the issues above.')
  console.log('')
  console.log('🚀 Quick setup:')
  console.log('  1. export APPLITOOLS_API_KEY="your_key_here"')
  console.log('  2. npm run dev')
  console.log('  3. npm run test:visual-demo')
} 