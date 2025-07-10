const fs = require('fs').promises;
const path = require('path');
const { chromium, firefox, webkit } = require('playwright');

// Load environment variables
require('dotenv').config();

/**
 * OPEN-SOURCE VISION MODEL TESTER
 * 
 * Tests LLaVA, Qwen, Llama Vision, and other open-source models
 * against our engineered bugs using various deployment methods.
 */

class OpenSourceModelTester {
    constructor() {
        this.config = {
            outputDir: path.join(process.cwd(), 'ai-visual-results'),
            baselineUrl: 'http://localhost:3000/baseline-page.html',
            brokenUrl: 'http://localhost:3000/broken-page.html',
            huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
            openaiApiKey: process.env.OPENAI_API_KEY, // For comparison
            geminiApiKey: process.env.GEMINI_API_KEY   // For comparison
        };

        this.models = {
            // Already tested (for comparison)
            'openai-gpt4o': {
                name: 'OpenAI GPT-4o',
                type: 'commercial',
                status: 'tested',
                testFunction: 'testOpenAI'
            },
            'gemini-1.5-flash': {
                name: 'Gemini 1.5 Flash', 
                type: 'commercial',
                status: 'tested',
                testFunction: 'testGemini'
            },
            
            // Open-source models to test
            'llava-1.5': {
                name: 'LLaVA-1.5',
                type: 'open-source',
                deployment: 'huggingface-inference',
                modelId: 'llava-hf/llava-1.5-7b-hf',
                testFunction: 'testLLaVAHuggingFace',
                requirements: ['HuggingFace Inference API', 'Free tier available']
            },
            'qwen-2.5-vl': {
                name: 'Qwen 2.5 VL',
                type: 'open-source', 
                deployment: 'huggingface-inference',
                modelId: 'Qwen/Qwen2-VL-7B-Instruct',
                testFunction: 'testQwenHuggingFace',
                requirements: ['HuggingFace Inference API', 'May require payment']
            },
            'llama-3.2-vision': {
                name: 'Llama 3.2 Vision',
                type: 'open-source',
                deployment: 'huggingface-inference', 
                modelId: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
                testFunction: 'testLlamaHuggingFace',
                requirements: ['HuggingFace account', 'Model access approval', 'Inference API']
            },
            'ollama-llava': {
                name: 'LLaVA via Ollama',
                type: 'open-source',
                deployment: 'local-ollama',
                modelId: 'llava:latest',
                testFunction: 'testOllamaLLaVA',
                requirements: ['Ollama installed locally', 'Model downloaded']
            },
            'local-transformers': {
                name: 'Local Transformers',
                type: 'open-source',
                deployment: 'local-python',
                modelId: 'Various models',
                testFunction: 'testLocalTransformers',
                requirements: ['Python environment', 'GPU recommended', 'Large VRAM']
            }
        };

        this.results = {
            timestamp: new Date().toISOString(),
            models: {},
            comparison: {},
            summary: {}
        };
    }

    async runComprehensiveTest() {
        console.log('🚀 COMPREHENSIVE OPEN-SOURCE VISION MODEL TESTING\n');
        console.log('Testing multiple approaches against our ground truth bugs');
        console.log('=' .repeat(80));

        // Ensure output directory exists
        await fs.mkdir(this.config.outputDir, { recursive: true });

        // Capture screenshots first
        await this.captureScreenshots();

        // Test each available model
        for (const [modelKey, modelConfig] of Object.entries(this.models)) {
            console.log(`\n🧪 Testing ${modelConfig.name}...`);
            
            try {
                const testFunction = this[modelConfig.testFunction];
                if (testFunction) {
                    const result = await testFunction.call(this, modelConfig);
                    this.results.models[modelKey] = {
                        ...modelConfig,
                        result,
                        tested: true
                    };
                } else {
                    this.results.models[modelKey] = {
                        ...modelConfig,
                        result: { error: 'Test function not implemented' },
                        tested: false
                    };
                }
            } catch (error) {
                console.log(`❌ Error testing ${modelConfig.name}: ${error.message}`);
                this.results.models[modelKey] = {
                    ...modelConfig,
                    result: { error: error.message },
                    tested: false
                };
            }

            // Brief delay between tests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Generate comprehensive report
        await this.generateComparisonReport();
        
        console.log('\n✅ Comprehensive testing complete!');
        console.log(`📊 Results saved to: ${this.config.outputDir}`);
    }

    async captureScreenshots() {
        console.log('📸 Capturing fresh screenshots for testing...');
        
        const browsers = { chromium, firefox, webkit };
        this.screenshots = {};

        for (const [browserName, browserType] of Object.entries(browsers)) {
            console.log(`  🌐 Capturing ${browserName} screenshots...`);
            
            const browser = await browserType.launch();
            const context = await browser.newContext({
                viewport: { width: 1200, height: 800 }
            });
            const page = await context.newPage();

            // Capture baseline
            await page.goto(this.config.baselineUrl);
            await page.waitForLoadState('networkidle');
            const baselineBuffer = await page.screenshot({ fullPage: true });
            
            // Capture broken version
            await page.goto(this.config.brokenUrl);
            await page.waitForLoadState('networkidle');
            const brokenBuffer = await page.screenshot({ fullPage: true });

            this.screenshots[browserName] = {
                baseline: baselineBuffer,
                broken: brokenBuffer
            };

            await browser.close();
        }
        
        console.log('✅ Screenshots captured');
    }

    // Commercial models (for comparison)
    async testOpenAI(modelConfig) {
        if (!this.config.openaiApiKey) {
            return { error: 'OpenAI API key not provided', skipped: true };
        }

        console.log('  🤖 Testing with OpenAI GPT-4o...');
        
        const results = {};
        for (const [browser, screenshots] of Object.entries(this.screenshots)) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.openaiApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: "gpt-4o",
                        messages: [{
                            role: "user",
                            content: [
                                { type: "text", text: this.getAnalysisPrompt(browser) },
                                { type: "image_url", image_url: { url: `data:image/png;base64,${screenshots.baseline.toString('base64')}` }},
                                { type: "image_url", image_url: { url: `data:image/png;base64,${screenshots.broken.toString('base64')}` }}
                            ]
                        }],
                        max_tokens: 1500
                    })
                });

                const data = await response.json();
                results[browser] = data.choices?.[0]?.message?.content || 'No response';
            } catch (error) {
                results[browser] = `Error: ${error.message}`;
            }
        }

        return { success: true, analyses: results, cost: '~$0.02-0.05' };
    }

    async testGemini(modelConfig) {
        if (!this.config.geminiApiKey) {
            return { error: 'Gemini API key not provided', skipped: true };
        }

        console.log('  🧠 Testing with Gemini 1.5 Flash...');
        
        const results = {};
        for (const [browser, screenshots] of Object.entries(this.screenshots)) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: this.getAnalysisPrompt(browser) },
                                { inline_data: { mime_type: "image/png", data: screenshots.baseline.toString('base64') }},
                                { inline_data: { mime_type: "image/png", data: screenshots.broken.toString('base64') }}
                            ]
                        }]
                    })
                });

                const data = await response.json();
                results[browser] = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
            } catch (error) {
                results[browser] = `Error: ${error.message}`;
            }
        }

        return { success: true, analyses: results, cost: 'Free tier available' };
    }

    // Open-source model testing methods
    async testLLaVAHuggingFace(modelConfig) {
        if (!this.config.huggingfaceToken) {
            return { 
                error: 'HuggingFace token required', 
                setup: 'Set HUGGINGFACE_TOKEN in .env file',
                skipped: true 
            };
        }

        console.log('  🔬 Testing LLaVA-1.5 via HuggingFace Inference API...');
        
        const results = {};
        for (const [browser, screenshots] of Object.entries(this.screenshots)) {
            try {
                // HuggingFace Inference API for LLaVA
                const response = await fetch(`https://api-inference.huggingface.co/models/${modelConfig.modelId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.huggingfaceToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: {
                            image: screenshots.baseline.toString('base64'),
                            question: this.getSimplifiedPrompt(browser)
                        }
                    })
                });

                if (response.status === 503) {
                    results[browser] = 'Model loading - retry in a few minutes';
                } else {
                    const data = await response.json();
                    results[browser] = data.generated_text || data.answer || JSON.stringify(data);
                }
            } catch (error) {
                results[browser] = `Error: ${error.message}`;
            }
        }

        return { 
            success: true, 
            analyses: results, 
            cost: 'Free tier: 1000 requests/month',
            deployment: 'HuggingFace Inference API'
        };
    }

    async testQwenHuggingFace(modelConfig) {
        console.log('  🏮 Testing Qwen 2.5 VL via HuggingFace...');
        
        // Similar to LLaVA but with Qwen-specific formatting
        const results = {};
        for (const [browser, screenshots] of Object.entries(this.screenshots)) {
            try {
                const response = await fetch(`https://api-inference.huggingface.co/models/${modelConfig.modelId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.huggingfaceToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: {
                            image: screenshots.baseline.toString('base64'),
                            text: this.getSimplifiedPrompt(browser)
                        }
                    })
                });

                const data = await response.json();
                results[browser] = data.generated_text || JSON.stringify(data);
            } catch (error) {
                results[browser] = `Error: ${error.message}`;
            }
        }

        return { 
            success: true, 
            analyses: results, 
            cost: 'May require paid plan for larger models',
            deployment: 'HuggingFace Inference API'
        };
    }

    async testLlamaHuggingFace(modelConfig) {
        console.log('  🦙 Testing Llama 3.2 Vision via HuggingFace...');
        
        if (!this.config.huggingfaceToken) {
            return { 
                error: 'Requires HuggingFace account with Llama access approval',
                setup: 'Visit https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct',
                skipped: true 
            };
        }

        const results = {};
        for (const [browser, screenshots] of Object.entries(this.screenshots)) {
            results[browser] = 'Requires model access approval from Meta - implement after approval';
        }

        return { 
            success: false, 
            analyses: results, 
            cost: 'Free after approval',
            deployment: 'Requires gated access approval'
        };
    }

    async testOllamaLLaVA(modelConfig) {
        console.log('  🏠 Testing LLaVA via local Ollama...');
        
        const results = {};
        for (const [browser, screenshots] of Object.entries(this.screenshots)) {
            try {
                // Check if Ollama is running
                const healthCheck = await fetch('http://localhost:11434/api/version')
                    .catch(() => null);
                
                if (!healthCheck) {
                    results[browser] = 'Ollama not running - start with: ollama serve';
                    continue;
                }

                // Test Ollama LLaVA
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llava:latest',
                        prompt: this.getSimplifiedPrompt(browser),
                        images: [screenshots.baseline.toString('base64')],
                        stream: false
                    })
                });

                const data = await response.json();
                results[browser] = data.response || 'No response from Ollama';
            } catch (error) {
                results[browser] = `Ollama error: ${error.message}`;
            }
        }

        return { 
            success: true, 
            analyses: results, 
            cost: 'Free (local compute only)',
            deployment: 'Local Ollama',
            setup: 'Install Ollama, run: ollama pull llava:latest'
        };
    }

    async testLocalTransformers(modelConfig) {
        console.log('  🔧 Testing local Transformers setup...');
        
        return {
            success: false,
            analyses: { 
                info: 'Local Transformers requires Python environment setup'
            },
            cost: 'Free (local GPU/CPU)',
            deployment: 'Local Python + transformers',
            setup: [
                'Set up Python 3.8+ environment',
                'pip install transformers torch torchvision',
                'Download model weights (several GB)',
                'Implement Python inference script',
                'Optional: GPU with 8GB+ VRAM for good performance'
            ],
            implementation: 'Requires separate Python script - see documentation'
        };
    }

    getAnalysisPrompt(browser) {
        return `You are an expert visual testing AI. Compare these two website screenshots and identify ALL visual differences.

BASELINE (first image): Expected/correct version
TEST (second image): Version being tested for regressions

Provide:
1. Count of total differences found
2. List each difference with location, description, and severity
3. Overall visual quality assessment

Browser: ${browser}

Be thorough - catch subtle differences in spacing, colors, fonts, layout, shadows, etc.`;
    }

    getSimplifiedPrompt(browser) {
        return `Compare these two website screenshots. List all visual differences you can find. Be specific about locations and what changed. Browser: ${browser}`;
    }

    async generateComparisonReport() {
        console.log('📊 Generating comprehensive comparison report...');

        const report = {
            timestamp: this.results.timestamp,
            summary: {
                totalModels: Object.keys(this.models).length,
                testedModels: Object.values(this.results.models).filter(m => m.tested).length,
                commercialModels: Object.values(this.results.models).filter(m => m.type === 'commercial').length,
                openSourceModels: Object.values(this.results.models).filter(m => m.type === 'open-source').length
            },
            results: this.results.models,
            comparison: this.generateComparison(),
            recommendations: this.generateRecommendations()
        };

        // Save detailed JSON results
        const jsonPath = path.join(this.config.outputDir, 'open-source-model-results.json');
        await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

        // Generate HTML report
        await this.generateHTMLReport(report);

        console.log(`✅ Reports saved to: ${this.config.outputDir}`);
        return report;
    }

    generateComparison() {
        const comparison = {
            deploymentMethods: {},
            costAnalysis: {},
            successRates: {},
            setupComplexity: {}
        };

        for (const [key, model] of Object.entries(this.results.models)) {
            if (!model.tested) continue;

            // Deployment methods
            const deployment = model.deployment || 'api';
            if (!comparison.deploymentMethods[deployment]) {
                comparison.deploymentMethods[deployment] = [];
            }
            comparison.deploymentMethods[deployment].push(model.name);

            // Cost analysis
            comparison.costAnalysis[model.name] = model.result?.cost || 'Unknown';

            // Success rates (simplified for now)
            comparison.successRates[model.name] = model.result?.success ? 'Success' : 'Needs Setup';
        }

        return comparison;
    }

    generateRecommendations() {
        return {
            immediate: [
                'Start with HuggingFace Inference API models (LLaVA, Qwen)',
                'Set up Ollama for local testing without API costs',
                'Compare results against OpenAI/Gemini baseline'
            ],
            development: [
                'Implement local Transformers for full control',
                'Fine-tune models on UI-specific datasets',
                'Set up GPU infrastructure for faster inference'
            ],
            production: [
                'Evaluate accuracy vs cost tradeoffs',
                'Consider hybrid approach: fast local + accurate API',
                'Implement ensemble methods combining multiple models'
            ]
        };
    }

    async generateHTMLReport(report) {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Open-Source Vision Model Testing Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 2rem; border-radius: 10px; text-align: center; margin-bottom: 2rem; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .summary-card { background: white; padding: 1.5rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .metric-number { font-size: 2rem; font-weight: bold; color: #667eea; }
        .model-section { background: white; margin-bottom: 1.5rem; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .model-header { background: #f8f9fa; padding: 1rem; border-bottom: 1px solid #eee; font-weight: bold; }
        .model-content { padding: 1rem; }
        .status-success { color: #28a745; }
        .status-error { color: #dc3545; }
        .status-skipped { color: #ffc107; }
        pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔬 Open-Source Vision Model Testing</h1>
            <p>Comprehensive evaluation of commercial vs open-source AI vision models</p>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="metric-number">${report.summary.totalModels}</div>
                <div>Total Models</div>
            </div>
            <div class="summary-card">
                <div class="metric-number">${report.summary.testedModels}</div>
                <div>Successfully Tested</div>
            </div>
            <div class="summary-card">
                <div class="metric-number">${report.summary.commercialModels}</div>
                <div>Commercial APIs</div>
            </div>
            <div class="summary-card">
                <div class="metric-number">${report.summary.openSourceModels}</div>
                <div>Open-Source Models</div>
            </div>
        </div>

        ${Object.entries(report.results).map(([key, model]) => `
        <div class="model-section">
            <div class="model-header">
                ${model.name} 
                <span class="${model.tested ? 'status-success' : (model.result?.skipped ? 'status-skipped' : 'status-error')}">
                    (${model.tested ? 'Tested' : (model.result?.skipped ? 'Skipped' : 'Error')})
                </span>
            </div>
            <div class="model-content">
                <p><strong>Type:</strong> ${model.type}</p>
                <p><strong>Deployment:</strong> ${model.deployment || 'API'}</p>
                ${model.result?.cost ? `<p><strong>Cost:</strong> ${model.result.cost}</p>` : ''}
                ${model.result?.setup ? `<p><strong>Setup:</strong> ${model.result.setup}</p>` : ''}
                ${model.result?.error ? `<p class="status-error"><strong>Error:</strong> ${model.result.error}</p>` : ''}
                ${model.result?.analyses ? `
                    <h4>Analysis Results:</h4>
                    <pre>${JSON.stringify(model.result.analyses, null, 2)}</pre>
                ` : ''}
            </div>
        </div>
        `).join('')}

        <div class="model-section">
            <div class="model-header">🎯 Recommendations</div>
            <div class="model-content">
                <h4>Immediate Actions:</h4>
                <ul>
                    ${report.recommendations.immediate.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
                <h4>Development Phase:</h4>
                <ul>
                    ${report.recommendations.development.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
                <h4>Production Considerations:</h4>
                <ul>
                    ${report.recommendations.production.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;

        const htmlPath = path.join(this.config.outputDir, 'open-source-model-report.html');
        await fs.writeFile(htmlPath, htmlContent);
        console.log(`📄 HTML report: ${htmlPath}`);
    }
}

// CLI execution
if (require.main === module) {
    const tester = new OpenSourceModelTester();
    tester.runComprehensiveTest()
        .then(() => {
            console.log('\n🎉 Open-source model testing complete!');
            console.log('🔍 Check the HTML report for detailed results');
            console.log('📊 Compare accuracy against commercial models');
        })
        .catch(error => {
            console.error('\n💥 Testing failed:', error);
            process.exit(1);
        });
}

module.exports = OpenSourceModelTester; 