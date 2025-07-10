const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

// Load environment variables
require('dotenv').config();

const execAsync = promisify(exec);

/**
 * PERCY VISUAL TESTING INTEGRATION
 * 
 * Integrates Percy visual testing with existing AI testing framework
 * for comprehensive comparison study
 */

class PercyVisualTesting {
    constructor() {
        this.config = {
            percyToken: process.env.PERCY_TOKEN,
            outputDir: path.join(process.cwd(), 'percy-results'),
            serverUrl: 'http://localhost:3000'
        };
        
        this.testScenarios = [
            {
                name: 'baseline-comparison',
                description: 'Compare baseline vs broken pages',
                specs: ['percy-visual-baseline.cy.js', 'percy-visual-bugs.cy.js']
            },
            {
                name: 'cross-browser-testing',
                description: 'Test browser-specific rendering differences',
                specs: ['percy-visual-bugs.cy.js']
            },
            {
                name: 'component-testing',
                description: 'Test individual component differences',
                specs: ['percy-visual-baseline.cy.js']
            }
        ];
    }

    async validateSetup() {
        console.log('🔍 Validating Percy setup...');
        
        // Check Percy token
        if (!this.config.percyToken) {
            throw new Error('❌ PERCY_TOKEN environment variable is required');
        }
        
        // Check server availability
        try {
            const { stdout } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000');
            if (stdout.trim() !== '200') {
                throw new Error('❌ Server not running. Please run: npm run server');
            }
        } catch (error) {
            throw new Error('❌ Server not accessible. Please run: npm run server');
        }
        
        console.log('✅ Percy setup validated');
    }

    async runPercyTests() {
        console.log('🚀 Starting Percy Visual Testing...');
        
        // Ensure output directory exists
        await fs.mkdir(this.config.outputDir, { recursive: true });
        
        const results = {
            timestamp: new Date().toISOString(),
            percyToken: this.config.percyToken.substring(0, 10) + '...',
            scenarios: {}
        };
        
        for (const scenario of this.testScenarios) {
            console.log(`\n📸 Running ${scenario.name}...`);
            console.log(`   ${scenario.description}`);
            
            // Run Percy with Cypress
            const command = `npx percy exec --config .percy.yml -- cypress run --config-file cypress.percy.config.cjs --spec "cypress/e2e/${scenario.specs.join(',cypress/e2e/')}"`;
            
            try {
                console.log(`   Command: ${command}`);
                const { stdout, stderr } = await execAsync(command, { 
                    env: { ...process.env, PERCY_TOKEN: this.config.percyToken }
                });
                
                results.scenarios[scenario.name] = {
                    status: 'success',
                    stdout: stdout,
                    stderr: stderr,
                    command: command
                };
                
                console.log(`   ✅ ${scenario.name} completed`);
                
            } catch (error) {
                console.log(`   ❌ ${scenario.name} failed: ${error.message}`);
                results.scenarios[scenario.name] = {
                    status: 'failed',
                    error: error.message,
                    command: command
                };
            }
        }
        
        return results;
    }

    async generatePercyReport() {
        console.log('📊 Generating Percy comparison report...');
        
        const reportTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Percy vs AI Visual Testing Comparison</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #663399; color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .failed { background: #f8d7da; border-color: #f5c6cb; }
        .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .tool { padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .percy { background: #f0f8ff; }
        .ai { background: #fff5ee; }
        .applitools { background: #f0fff0; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .metric { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Percy vs AI Visual Testing Comparison</h1>
        <p>Comprehensive comparison of Percy, AI Vision APIs, and Applitools</p>
    </div>

    <div class="section">
        <h2>📊 Testing Approach Comparison</h2>
        <div class="comparison">
            <div class="tool percy">
                <h3>Percy (BrowserStack)</h3>
                <ul>
                    <li>✅ Cross-browser DOM snapshots</li>
                    <li>✅ Pixel-perfect comparison</li>
                    <li>✅ Built-in responsive testing</li>
                    <li>✅ CI/CD integration</li>
                    <li>❌ Manual approval workflow</li>
                    <li>❌ Limited AI insights</li>
                </ul>
            </div>
            <div class="tool ai">
                <h3>AI Vision APIs</h3>
                <ul>
                    <li>✅ Intelligent difference detection</li>
                    <li>✅ Contextual analysis</li>
                    <li>✅ Natural language insights</li>
                    <li>✅ Instant analysis</li>
                    <li>❌ Requires prompt engineering</li>
                    <li>❌ API-dependent</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💰 Cost Comparison</h2>
        <div class="metrics">
            <div class="metric">
                <h3>Percy</h3>
                <p><strong>$39-199/month</strong></p>
                <p>5,000-50,000 screenshots</p>
            </div>
            <div class="metric">
                <h3>AI APIs</h3>
                <p><strong>$10-50/month</strong></p>
                <p>Unlimited with usage-based pricing</p>
            </div>
            <div class="metric">
                <h3>Applitools</h3>
                <p><strong>$200-1000+/month</strong></p>
                <p>Enterprise pricing</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🎯 Use Case Recommendations</h2>
        <div class="tool percy">
            <h3>Choose Percy When:</h3>
            <ul>
                <li>You need pixel-perfect regression testing</li>
                <li>You have established CI/CD workflows</li>
                <li>You want cross-browser DOM comparison</li>
                <li>You need BrowserStack integration</li>
            </ul>
        </div>
        <div class="tool ai">
            <h3>Choose AI Vision When:</h3>
            <ul>
                <li>You need intelligent difference analysis</li>
                <li>You want contextual insights</li>
                <li>You need cost-effective scaling</li>
                <li>You want rapid prototyping</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>🚀 Next Steps</h2>
        <p>Run the full comparison with:</p>
        <code>npm run compare:percy-vs-ai</code>
        
        <p>View Percy dashboard: <a href="https://percy.io" target="_blank">percy.io</a></p>
        <p>View AI results: <a href="/ai-visual-results/" target="_blank">AI Visual Results</a></p>
    </div>
</body>
</html>`;

        const reportPath = path.join(this.config.outputDir, 'percy-comparison-report.html');
        await fs.writeFile(reportPath, reportTemplate);
        
        console.log(`📊 Report saved to: ${reportPath}`);
        return reportPath;
    }

    async runComprehensiveComparison() {
        console.log('🎯 PERCY VS AI COMPREHENSIVE COMPARISON');
        console.log('=' .repeat(60));
        
        try {
            // Validate setup
            await this.validateSetup();
            
            // Run Percy tests
            const percyResults = await this.runPercyTests();
            
            // Generate comparison report
            const reportPath = await this.generatePercyReport();
            
            // Save results
            const resultsPath = path.join(this.config.outputDir, 'percy-results.json');
            await fs.writeFile(resultsPath, JSON.stringify(percyResults, null, 2));
            
            console.log('\n✅ Percy testing complete!');
            console.log(`📊 Results: ${resultsPath}`);
            console.log(`📄 Report: ${reportPath}`);
            console.log(`🌐 View at: http://localhost:3000/percy-results/percy-comparison-report.html`);
            
            return { percyResults, reportPath };
            
        } catch (error) {
            console.error('❌ Percy testing failed:', error.message);
            throw error;
        }
    }
}

// CLI execution
if (require.main === module) {
    const tester = new PercyVisualTesting();
    tester.runComprehensiveComparison()
        .then(() => {
            console.log('\n🎉 Percy vs AI comparison complete!');
        })
        .catch(error => {
            console.error('\n💥 Comparison failed:', error);
            process.exit(1);
        });
}

module.exports = PercyVisualTesting; 