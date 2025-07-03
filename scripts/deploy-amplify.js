#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

const deploymentConfig = {
  appName: 'TestableApp',
  domain: 'testableapp.latentgenius.ai',
  branch: 'main',
  framework: 'React',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  nodeVersion: '18'
}

function checkPrerequisites() {
  console.log('🔍 Checking deployment prerequisites...')
  
  // Check if AWS CLI is installed
  try {
    execSync('aws --version', { stdio: 'pipe' })
    console.log('✅ AWS CLI is installed')
  } catch (error) {
    console.log('❌ AWS CLI not found. Please install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html')
    process.exit(1)
  }
  
  // Check if Amplify CLI is installed
  try {
    execSync('amplify --version', { stdio: 'pipe' })
    console.log('✅ Amplify CLI is installed')
  } catch (error) {
    console.log('❌ Amplify CLI not found. Installing...')
    execSync('npm install -g @aws-amplify/cli', { stdio: 'inherit' })
  }
  
  // Check if build works
  try {
    console.log('🔧 Testing build process...')
    execSync('npm run build', { stdio: 'pipe' })
    console.log('✅ Build process works')
  } catch (error) {
    console.log('❌ Build failed. Please fix build errors first.')
    process.exit(1)
  }
}

function generateAmplifyApp() {
  console.log('🚀 Generating Amplify app configuration...')
  
  const amplifyApp = {
    name: deploymentConfig.appName,
    platform: 'WEB',
    repository: `https://github.com/davidproctor/TestableApp`,
    description: 'TestableApp - UI Testing Benchmark for AI Testing Research',
    environmentVariables: {
      NODE_ENV: 'production',
      AMPLIFY_DIFF_DEPLOY: 'false',
      AMPLIFY_MONOREPO_APP_ROOT: '.'
    },
    buildSpec: `version: 1
applications:
  - appRoot: .
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - echo "Building TestableApp for AI Testing Research"
            - echo "Target domain: ${deploymentConfig.domain}"
        build:
          commands:
            - npm run build
            - echo "Build completed for production deployment"
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    test:
      phases:
        preTest:
          commands:
            - npm ci
            - npm install -g serve
            - echo "Setting up test environment for AI testing research"
        test:
          commands:
            - npm run build
            - npx serve -s dist -p 8080 &
            - sleep 5
            - npx cypress install
            - npx cypress run --headless --browser chrome --config baseUrl=http://localhost:8080
      artifacts:
        baseDirectory: cypress
        files:
          - videos/**/*
          - screenshots/**/*
          - reports/**/*`
  }
  
  fs.writeFileSync('amplify-app-config.json', JSON.stringify(amplifyApp, null, 2))
  console.log('✅ Amplify app configuration saved to amplify-app-config.json')
}

function generateCustomDomain() {
  console.log('🌐 Generating custom domain configuration...')
  
  const domainConfig = {
    domainName: 'latentgenius.ai',
    subDomains: [
      {
        subDomainSetting: {
          prefix: 'testableapp',
          branchName: 'main'
        }
      }
    ],
    enableAutoSubDomain: false,
    autoSubDomainCreationPatterns: [],
    autoSubDomainIAMRole: ''
  }
  
  fs.writeFileSync('amplify-domain-config.json', JSON.stringify(domainConfig, null, 2))
  console.log('✅ Custom domain configuration saved to amplify-domain-config.json')
}

function generateDeploymentInstructions() {
  console.log('📋 Generating deployment instructions...')
  
  const instructions = `# AWS Amplify Deployment Instructions

## Prerequisites
- AWS CLI installed and configured
- Amplify CLI installed globally
- Repository pushed to GitHub

## Step 1: Initialize Amplify App
\`\`\`bash
# Navigate to your project directory
cd /path/to/TestableApp

# Initialize Amplify project
amplify init

# When prompted, use these settings:
# - Enter a name for the project: TestableApp
# - Enter a name for the environment: prod
# - Choose your default editor: Visual Studio Code (or your preference)
# - Choose the type of app: javascript
# - What javascript framework: react
# - Source Directory Path: src
# - Distribution Directory Path: dist
# - Build Command: npm run build
# - Start Command: npm run dev
\`\`\`

## Step 2: Add Hosting
\`\`\`bash
# Add hosting with continuous deployment
amplify add hosting

# Choose: Amazon CloudFront and S3
# Select: Continuous deployment (Git-based deployments)
# Follow the prompts to connect your GitHub repository
\`\`\`

## Step 3: Configure Custom Domain
\`\`\`bash
# In AWS Amplify Console:
# 1. Go to Domain management
# 2. Add domain: latentgenius.ai
# 3. Configure subdomain: testableapp.latentgenius.ai
# 4. Point to main branch
\`\`\`

## Step 4: Deploy
\`\`\`bash
# Deploy your application
amplify push

# This will:
# - Create S3 bucket for hosting
# - Set up CloudFront distribution
# - Configure CI/CD pipeline
# - Deploy your application
\`\`\`

## Step 5: Verify Deployment
After deployment, your app will be available at:
- Default Amplify URL: https://[app-id].amplifyapp.com
- Custom Domain: https://testableapp.latentgenius.ai

## Environment Variables (if needed)
Set these in Amplify Console under App Settings > Environment Variables:
- NODE_ENV: production
- VITE_APP_ENV: production

## Manual Alternative (via AWS Console)
1. Go to AWS Amplify Console
2. Click "New App" > "Host web app"
3. Connect your GitHub repository
4. Configure build settings using amplify.yml
5. Set up custom domain in Domain management

## Testing AI Tools Access
Once deployed, update your test configurations:
- All AI testing tools can now access: https://testableapp.latentgenius.ai
- Update any local references to use the production URL
- Test with: npm run test:lambdatest

## Troubleshooting
- Build fails: Check amplify.yml configuration
- Domain not working: Verify DNS settings in Route 53
- Tests failing: Update baseUrl in test configurations

## Configuration Files Created
- amplify-app-config.json: App configuration
- amplify-domain-config.json: Domain configuration
- amplify.yml: Build specification (already exists)
`

  fs.writeFileSync('DEPLOYMENT_GUIDE.md', instructions)
  console.log('✅ Deployment guide saved to DEPLOYMENT_GUIDE.md')
}

function updatePackageScripts() {
  console.log('📦 Adding deployment scripts to package.json...')
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  // Add deployment scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'deploy:check': 'node scripts/deploy-amplify.js check',
    'deploy:setup': 'node scripts/deploy-amplify.js setup',
    'deploy:build': 'npm run build && echo "Build ready for deployment"',
    'deploy:test': 'npm run test:headless && echo "Tests passed - ready for deployment"'
  }
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
  console.log('✅ Added deployment scripts to package.json')
}

function showDeploymentSummary() {
  console.log(`
🚀 AWS Amplify Deployment Setup Complete!

📁 Files Created:
- amplify-app-config.json    (App configuration)
- amplify-domain-config.json (Domain configuration)  
- DEPLOYMENT_GUIDE.md        (Step-by-step instructions)

📦 New NPM Scripts:
- npm run deploy:check       (Check prerequisites)
- npm run deploy:setup       (Setup configurations)
- npm run deploy:build       (Test build process)
- npm run deploy:test        (Run tests before deploy)

🌐 Target Domain: ${deploymentConfig.domain}

📋 Next Steps:
1. Push your code to GitHub
2. Follow instructions in DEPLOYMENT_GUIDE.md
3. Set up custom domain in Amplify Console
4. Update AI testing tools to use production URL

🔧 AI Testing Tools Ready:
Once deployed, all AI testing tools (LambdaTest, Applitools, TestRigor, etc.) 
will be able to access your app at: https://${deploymentConfig.domain}

Happy Testing! 🎉
`)
}

// Command line interface
const command = process.argv[2]

switch (command) {
  case 'check':
    checkPrerequisites()
    break
  case 'setup':
    checkPrerequisites()
    generateAmplifyApp()
    generateCustomDomain()
    generateDeploymentInstructions()
    updatePackageScripts()
    showDeploymentSummary()
    break
  default:
    console.log('🚀 TestableApp AWS Amplify Deployment Setup')
    console.log('==========================================')
    console.log('Usage:')
    console.log('  node scripts/deploy-amplify.js check   # Check prerequisites')
    console.log('  node scripts/deploy-amplify.js setup   # Generate all configs')
    console.log('')
    console.log('Or use npm scripts:')
    console.log('  npm run deploy:check')
    console.log('  npm run deploy:setup')
    break
} 