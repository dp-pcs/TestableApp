const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

class AITestingSetup {
    constructor() {
        this.requirements = {
            playwright: '@playwright/test',
            node: '18.0.0'
        };
        this.setupSteps = [];
    }

    async checkNodeVersion() {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
        
        if (majorVersion >= 18) {
            console.log('✅ Node.js version:', nodeVersion);
            return true;
        } else {
            console.log('❌ Node.js version too old:', nodeVersion);
            console.log('   Required: Node.js 18.0.0 or higher');
            console.log('   Download: https://nodejs.org/');
            return false;
        }
    }

    async checkPlaywrightInstallation() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const hasPlaywright = packageJson.devDependencies['@playwright/test'];
            
            if (hasPlaywright) {
                console.log('✅ Playwright dependency found');
                
                // Check if browsers are installed
                try {
                    const { execSync } = require('child_process');
                    execSync('npx playwright --version', { stdio: 'pipe' });
                    console.log('✅ Playwright browsers installed');
                    return true;
                } catch (error) {
                    console.log('⚠️  Playwright found but browsers not installed');
                    this.setupSteps.push('npx playwright install');
                    return false;
                }
            } else {
                console.log('❌ Playwright not found in dependencies');
                this.setupSteps.push('npm install -D @playwright/test');
                this.setupSteps.push('npx playwright install');
                return false;
            }
        } catch (error) {
            console.log('❌ Error checking Playwright:', error.message);
            return false;
        }
    }

    checkEnvironmentVariables() {
        const openaiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;
        
        let hasKeys = false;
        
        if (openaiKey) {
            console.log('✅ OpenAI API Key found:', openaiKey.substring(0, 10) + '...');
            hasKeys = true;
        } else {
            console.log('⚠️  OpenAI API Key not found');
            console.log('   Get one at: https://platform.openai.com/api-keys');
            console.log('   Set with: export OPENAI_API_KEY=your_key_here');
        }
        
        if (geminiKey) {
            console.log('✅ Gemini API Key found:', geminiKey.substring(0, 10) + '...');
            hasKeys = true;
        } else {
            console.log('⚠️  Gemini API Key not found');
            console.log('   Get one at: https://makersuite.google.com/app/apikey');
            console.log('   Set with: export GEMINI_API_KEY=your_key_here');
        }
        
        if (!hasKeys) {
            console.log('\n⚠️  At least one API key is required for AI visual testing');
        }
        
        return hasKeys;
    }

    createExampleEnvFile() {
        const envExample = `# AI Visual Testing API Keys
# Get OpenAI key: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Get Gemini key: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Applitools keys (for comparison)
APPLITOOLS_API_KEY=your_applitools_key_here
APPLITOOLS_API_KEY2=your_backup_key_here
`;

        try {
            if (!fs.existsSync('.env.example')) {
                fs.writeFileSync('.env.example', envExample);
                console.log('✅ Created .env.example file');
            }
        } catch (error) {
            console.log('⚠️  Could not create .env.example:', error.message);
        }
    }

    displayQuickStartGuide() {
        console.log('\n🚀 AI Visual Testing Quick Start Guide\n');
        
        console.log('1️⃣ Setup API Keys (Required):');
        console.log('   export OPENAI_API_KEY="your_openai_key_here"');
        console.log('   export GEMINI_API_KEY="your_gemini_key_here"');
        
        if (this.setupSteps.length > 0) {
            console.log('\n2️⃣ Install Dependencies:');
            this.setupSteps.forEach(step => {
                console.log(`   ${step}`);
            });
        }
        
        console.log('\n3️⃣ Start the Demo Server:');
        console.log('   npm run start');
        
        console.log('\n4️⃣ Run AI Visual Testing:');
        console.log('   npm run ai:visual-test');
        
        console.log('\n5️⃣ View Results:');
        console.log('   http://localhost:3000/ai-visual-results/ai-visual-report.html');
        
        console.log('\n🎯 Demo Commands:');
        console.log('   npm run ai:setup                # Show setup instructions');
        console.log('   npm run demo:browser-specific   # Test browser-specific bugs');
        console.log('   npm run compare:ai-vs-applitools # Compare approaches');
        
        console.log('\n📚 Learn More:');
        console.log('   Read: AI_VISUAL_TESTING_REVOLUTION.md');
    }

    displayCostComparison() {
        console.log('\n💰 Cost Comparison\n');
        
        console.log('Applitools (Traditional):');
        console.log('  • Pro Plan: $200-500/month');
        console.log('  • Enterprise: $1000+/month');
        console.log('  • Per screenshot: $0.10-0.25');
        
        console.log('\nAI Vision APIs (Our Approach):');
        console.log('  • OpenAI GPT-4 Vision: ~$0.01-0.03 per analysis');
        console.log('  • Google Gemini Pro Vision: ~$0.002-0.01 per analysis');
        console.log('  • 💡 Result: 90-95% cost reduction!');
    }

    async run() {
        console.log('🤖 AI Visual Testing Setup\n');
        
        const nodeOk = await this.checkNodeVersion();
        const playwrightOk = await this.checkPlaywrightInstallation();
        const apiKeysOk = this.checkEnvironmentVariables();
        
        this.createExampleEnvFile();
        
        console.log('\n📋 Setup Summary:');
        console.log(`Node.js: ${nodeOk ? '✅' : '❌'}`);
        console.log(`Playwright: ${playwrightOk ? '✅' : '⚠️'}`);
        console.log(`API Keys: ${apiKeysOk ? '✅' : '⚠️'}`);
        
        if (nodeOk && playwrightOk && apiKeysOk) {
            console.log('\n🎉 All requirements met! Ready to run AI visual testing.');
            console.log('\nRun: npm run ai:visual-test');
        } else {
            console.log('\n⚠️  Setup required before running AI visual tests.');
        }
        
        this.displayQuickStartGuide();
        this.displayCostComparison();
    }
}

// CLI execution
if (require.main === module) {
    const setup = new AITestingSetup();
    setup.run()
        .then(() => {
            console.log('\n✨ Setup check complete!');
        })
        .catch(error => {
            console.error('\n💥 Setup error:', error);
            process.exit(1);
        });
}

module.exports = AITestingSetup; 