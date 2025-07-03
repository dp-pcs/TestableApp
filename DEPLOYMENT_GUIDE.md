# AWS Amplify Deployment Instructions

## Prerequisites
- AWS CLI installed and configured
- Amplify CLI installed globally
- Repository pushed to GitHub

## Step 1: Initialize Amplify App
```bash
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
```

## Step 2: Add Hosting
```bash
# Add hosting with continuous deployment
amplify add hosting

# Choose: Amazon CloudFront and S3
# Select: Continuous deployment (Git-based deployments)
# Follow the prompts to connect your GitHub repository
```

## Step 3: Configure Custom Domain
```bash
# In AWS Amplify Console:
# 1. Go to Domain management
# 2. Add domain: latentgenius.ai
# 3. Configure subdomain: testableapp.latentgenius.ai
# 4. Point to main branch
```

## Step 4: Deploy
```bash
# Deploy your application
amplify push

# This will:
# - Create S3 bucket for hosting
# - Set up CloudFront distribution
# - Configure CI/CD pipeline
# - Deploy your application
```

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
