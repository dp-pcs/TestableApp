const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

/**
 * PERCY SETUP VALIDATION
 * 
 * Validates Percy integration setup for visual testing comparison
 */

class PercySetupValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.success = [];
    }

    validateEnvironment() {
        console.log('🔍 Validating Percy environment setup...\n');
        
        // Check environment variables
        const requiredEnvVars = {
            'PERCY_TOKEN': 'Percy token from https://percy.io',
            'OPENAI_API_KEY': 'OpenAI API key (for comparison)',
            'GEMINI_API_KEY': 'Gemini API key (for comparison)'
        };
        
        Object.entries(requiredEnvVars).forEach(([key, description]) => {
            if (process.env[key]) {
                this.success.push(`✅ ${key}: Set (${description})`);
            } else {
                this.issues.push(`❌ ${key}: Missing - ${description}`);
            }
        });

        // Check optional environment variables
        const optionalEnvVars = {
            'APPLITOOLS_API_KEY': 'Applitools API key (for full comparison)',
            'HUGGINGFACE_TOKEN': 'HuggingFace token (for open-source models)'
        };
        
        Object.entries(optionalEnvVars).forEach(([key, description]) => {
            if (process.env[key]) {
                this.success.push(`✅ ${key}: Set (${description})`);
            } else {
                this.warnings.push(`⚠️  ${key}: Optional - ${description}`);
            }
        });
    }

    validateFiles() {
        console.log('🔍 Validating Percy configuration files...\n');
        
        const requiredFiles = [
            '.percy.yml',
            'cypress.percy.config.cjs',
            'cypress/support/percy.js',
            'cypress/e2e/percy-visual-baseline.cy.js',
            'cypress/e2e/percy-visual-bugs.cy.js',
            'scripts/percy-visual-testing.cjs'
        ];
        
        requiredFiles.forEach(file => {
            if (fs.existsSync(file)) {
                this.success.push(`✅ ${file}: Found`);
            } else {
                this.issues.push(`❌ ${file}: Missing`);
            }
        });
    }

    validateDependencies() {
        console.log('🔍 Validating Percy dependencies...\n');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const devDeps = packageJson.devDependencies || {};
            
            const requiredDeps = {
                '@percy/cli': 'Percy CLI for running tests',
                '@percy/cypress': 'Percy Cypress integration',
                '@percy/playwright': 'Percy Playwright integration'
            };
            
            Object.entries(requiredDeps).forEach(([dep, description]) => {
                if (devDeps[dep]) {
                    this.success.push(`✅ ${dep}: Installed (${description})`);
                } else {
                    this.issues.push(`❌ ${dep}: Missing - ${description}`);
                }
            });
            
        } catch (error) {
            this.issues.push(`❌ package.json: Could not read - ${error.message}`);
        }
    }

    validateCommands() {
        console.log('🔍 Validating Percy npm commands...\n');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const scripts = packageJson.scripts || {};
            
            const requiredCommands = [
                'percy:setup',
                'percy:baseline',
                'percy:bugs',
                'percy:test',
                'compare:percy-vs-ai',
                'compare:ultimate-all'
            ];
            
            requiredCommands.forEach(command => {
                if (scripts[command]) {
                    this.success.push(`✅ npm run ${command}: Available`);
                } else {
                    this.issues.push(`❌ npm run ${command}: Missing`);
                }
            });
            
        } catch (error) {
            this.issues.push(`❌ package.json scripts: Could not read - ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PERCY SETUP VALIDATION REPORT');
        console.log('='.repeat(60));
        
        if (this.success.length > 0) {
            console.log('\n✅ SUCCESS:');
            this.success.forEach(item => console.log(`  ${item}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach(item => console.log(`  ${item}`));
        }
        
        if (this.issues.length > 0) {
            console.log('\n❌ ISSUES TO FIX:');
            this.issues.forEach(item => console.log(`  ${item}`));
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (this.issues.length === 0) {
            console.log('🎉 PERCY SETUP COMPLETE! Ready to run tests.');
            console.log('\nNext steps:');
            console.log('1. npm run server              # Start the server');
            console.log('2. npm run percy:test          # Run Percy tests');
            console.log('3. npm run compare:percy-vs-ai # Compare with AI');
            return true;
        } else {
            console.log('🔧 SETUP INCOMPLETE - Please fix the issues above.');
            console.log('\nQuick fixes:');
            console.log('1. cp .env.example .env        # Copy environment template');
            console.log('2. Edit .env with your tokens  # Add your API keys');
            console.log('3. npm run percy:setup         # View setup guide');
            return false;
        }
    }

    async run() {
        console.log('🎯 PERCY SETUP VALIDATION');
        console.log('Validating Percy integration for visual testing comparison\n');
        
        this.validateEnvironment();
        this.validateFiles();
        this.validateDependencies();
        this.validateCommands();
        
        return this.generateReport();
    }
}

// CLI execution
if (require.main === module) {
    const validator = new PercySetupValidator();
    validator.run()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 Validation failed:', error);
            process.exit(1);
        });
}

module.exports = PercySetupValidator; 