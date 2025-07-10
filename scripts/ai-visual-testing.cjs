const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

class AIVisualTester {
    constructor(config = {}) {
        this.config = {
            openaiApiKey: process.env.OPENAI_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY,
            outputDir: './ai-visual-results',
            baselineUrl: 'http://localhost:3000/baseline-page.html',
            brokenUrl: 'http://localhost:3000/broken-page.html',
            ...config
        };
        
        this.results = {
            browsers: {},
            aiAnalysis: {
                openai: {},
                gemini: {}
            },
            comparison: {}
        };
    }

    async initialize() {
        // Create output directory
        await fs.mkdir(this.config.outputDir, { recursive: true });
        
        // Validate API keys
        if (!this.config.openaiApiKey) {
            console.warn('⚠️  No OpenAI API key found. Set OPENAI_API_KEY environment variable.');
        }
        if (!this.config.geminiApiKey) {
            console.warn('⚠️  No Gemini API key found. Set GEMINI_API_KEY environment variable.');
        }
    }

    async captureScreenshots() {
        console.log('📸 Capturing screenshots across browsers...');
        
        const browsers = {
            chromium: chromium,
            firefox: firefox,
            webkit: webkit
        };

        for (const [browserName, browserType] of Object.entries(browsers)) {
            console.log(`  🌐 Testing with ${browserName}...`);
            
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

            // Save screenshots
            const baselineFile = path.join(this.config.outputDir, `baseline-${browserName}.png`);
            const brokenFile = path.join(this.config.outputDir, `broken-${browserName}.png`);
            
            await fs.writeFile(baselineFile, baselineBuffer);
            await fs.writeFile(brokenFile, brokenBuffer);

            this.results.browsers[browserName] = {
                baseline: baselineFile,
                broken: brokenFile,
                baselineBuffer,
                brokenBuffer
            };

            await browser.close();
        }
        
        console.log('✅ Screenshots captured for all browsers');
    }

    async analyzeWithOpenAI(browserName, baselineBuffer, brokenBuffer) {
        if (!this.config.openaiApiKey) {
            return { error: 'No OpenAI API key provided' };
        }

        console.log(`🤖 Analyzing ${browserName} with OpenAI Vision...`);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.openaiApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `You are an expert visual testing AI. Please analyze these two website screenshots and identify ALL visual differences between them. 

                                    BASELINE (first image): This is the expected/correct version of the website.
                                    TEST (second image): This is the version being tested for visual regressions.

                                    Please provide:
                                    1. A count of total visual differences found
                                    2. Detailed list of each difference with:
                                       - Location/section of the page
                                       - Description of what changed
                                       - Severity level (Critical/Major/Minor/Subtle)
                                    3. Overall assessment of visual quality

                                    Browser: ${browserName}
                                    
                                    Be thorough - catch even subtle differences in spacing, colors, fonts, layout, shadows, etc.`
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/png;base64,${baselineBuffer.toString('base64')}`
                                    }
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/png;base64,${brokenBuffer.toString('base64')}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 1500
                })
            });

            const data = await response.json();
            
            if (response.ok && data.choices && data.choices[0]) {
                return {
                    success: true,
                    analysis: data.choices[0].message.content,
                    usage: data.usage
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || 'Unknown OpenAI error',
                    details: data
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeWithGemini(browserName, baselineBuffer, brokenBuffer) {
        if (!this.config.geminiApiKey) {
            return { error: 'No Gemini API key provided' };
        }

        console.log(`🧠 Analyzing ${browserName} with Gemini Vision...`);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are an expert visual testing AI. Please analyze these two website screenshots and identify ALL visual differences between them.

                                    BASELINE (first image): This is the expected/correct version of the website.
                                    TEST (second image): This is the version being tested for visual regressions.

                                    Please provide:
                                    1. A count of total visual differences found
                                    2. Detailed list of each difference with:
                                       - Location/section of the page
                                       - Description of what changed
                                       - Severity level (Critical/Major/Minor/Subtle)
                                    3. Overall assessment of visual quality

                                    Browser: ${browserName}
                                    
                                    Be thorough - catch even subtle differences in spacing, colors, fonts, layout, shadows, etc.`
                                },
                                {
                                    inline_data: {
                                        mime_type: "image/png",
                                        data: baselineBuffer.toString('base64')
                                    }
                                },
                                {
                                    inline_data: {
                                        mime_type: "image/png",
                                        data: brokenBuffer.toString('base64')
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates[0]) {
                return {
                    success: true,
                    analysis: data.candidates[0].content.parts[0].text,
                    usage: data.usageMetadata
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || 'Unknown Gemini error',
                    details: data
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async runAIAnalysis() {
        console.log('🔍 Running AI analysis on screenshots...');

        for (const [browserName, browserData] of Object.entries(this.results.browsers)) {
            console.log(`\n📊 Analyzing ${browserName} screenshots...`);

            // OpenAI Analysis
            const openaiResult = await this.analyzeWithOpenAI(
                browserName, 
                browserData.baselineBuffer, 
                browserData.brokenBuffer
            );
            this.results.aiAnalysis.openai[browserName] = openaiResult;

            // Gemini Analysis
            const geminiResult = await this.analyzeWithGemini(
                browserName, 
                browserData.baselineBuffer, 
                browserData.brokenBuffer
            );
            this.results.aiAnalysis.gemini[browserName] = geminiResult;

            // Brief delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('✅ AI analysis complete');
    }

    generateComparisonReport() {
        console.log('📝 Generating comparison report...');

        const report = {
            timestamp: new Date().toISOString(),
            testConfiguration: {
                baselineUrl: this.config.baselineUrl,
                brokenUrl: this.config.brokenUrl,
                browsers: Object.keys(this.results.browsers),
                aiProviders: ['OpenAI GPT-4 Vision', 'Google Gemini Pro Vision']
            },
            summary: {
                browsersTestedCount: Object.keys(this.results.browsers).length,
                aiProvidersUsed: 2,
                analysisStatus: {}
            },
            detailedResults: {
                byBrowser: {},
                aiComparison: {}
            },
            insights: []
        };

        // Process results by browser
        for (const [browserName, browserData] of Object.entries(this.results.browsers)) {
            const openaiResult = this.results.aiAnalysis.openai[browserName];
            const geminiResult = this.results.aiAnalysis.gemini[browserName];

            report.detailedResults.byBrowser[browserName] = {
                screenshotsCaptured: true,
                openaiAnalysis: openaiResult?.success ? {
                    status: 'success',
                    analysis: openaiResult.analysis,
                    usage: openaiResult.usage
                } : {
                    status: 'failed',
                    error: openaiResult?.error || 'Unknown error'
                },
                geminiAnalysis: geminiResult?.success ? {
                    status: 'success',
                    analysis: geminiResult.analysis,
                    usage: geminiResult.usage
                } : {
                    status: 'failed',
                    error: geminiResult?.error || 'Unknown error'
                }
            };

            // Track success rates
            report.summary.analysisStatus[browserName] = {
                openai: openaiResult?.success || false,
                gemini: geminiResult?.success || false
            };
        }

        // Generate insights
        this.generateInsights(report);

        return report;
    }

    generateInsights(report) {
        const insights = [];

        // AI Provider Performance
        const openaiSuccessCount = Object.values(report.summary.analysisStatus)
            .filter(status => status.openai).length;
        const geminiSuccessCount = Object.values(report.summary.analysisStatus)
            .filter(status => status.gemini).length;

        insights.push({
            category: 'AI Provider Performance',
            finding: `OpenAI GPT-4 Vision: ${openaiSuccessCount}/${report.summary.browsersTestedCount} successful analyses`,
            impact: openaiSuccessCount === report.summary.browsersTestedCount ? 'positive' : 'neutral'
        });

        insights.push({
            category: 'AI Provider Performance',
            finding: `Google Gemini Pro Vision: ${geminiSuccessCount}/${report.summary.browsersTestedCount} successful analyses`,
            impact: geminiSuccessCount === report.summary.browsersTestedCount ? 'positive' : 'neutral'
        });

        // Cross-browser analysis
        insights.push({
            category: 'Cross-Browser Testing',
            finding: `Tested across ${report.summary.browsersTestedCount} browsers (Chromium, Firefox, WebKit)`,
            impact: 'positive'
        });

        // Cost-effectiveness insight
        insights.push({
            category: 'Cost Analysis',
            finding: 'AI-powered visual testing provides accessible alternative to expensive specialized tools',
            impact: 'positive'
        });

        // Technology democratization
        insights.push({
            category: 'Technology Democratization',
            finding: 'Demonstrates that advanced visual testing capabilities are now accessible through general-purpose AI APIs',
            impact: 'positive'
        });

        report.insights = insights;
    }

    async generateHTMLReport(report) {
        console.log('🎨 Generating HTML report...');

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Visual Testing Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .summary-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-number { font-size: 2rem; font-weight: bold; color: #667eea; }
        .metric-label { color: #666; margin-top: 0.5rem; }
        .browser-section {
            background: white;
            margin-bottom: 2rem;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .browser-header {
            background: #667eea;
            color: white;
            padding: 1rem;
            font-size: 1.2rem;
            font-weight: bold;
        }
        .browser-content { padding: 1.5rem; }
        .ai-analysis {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-top: 1rem;
        }
        .ai-provider {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .ai-provider-header {
            background: #f8f9fa;
            padding: 1rem;
            font-weight: bold;
            border-bottom: 1px solid #e0e0e0;
        }
        .ai-provider-content { padding: 1rem; }
        .status-success { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .insights-section {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .insight-item {
            background: #f8f9fa;
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid #667eea;
            border-radius: 4px;
        }
        .insight-category { font-weight: bold; color: #667eea; }
        .screenshots-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }
        .screenshot-container {
            text-align: center;
        }
        .screenshot-container img {
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .screenshot-label {
            margin-top: 0.5rem;
            font-weight: bold;
            color: #666;
        }
        pre {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI-Powered Visual Testing Report</h1>
            <p>Comparing OpenAI GPT-4 Vision vs Google Gemini Pro Vision</p>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="metric-number">${report.summary.browsersTestedCount}</div>
                <div class="metric-label">Browsers Tested</div>
            </div>
            <div class="summary-card">
                <div class="metric-number">${report.summary.aiProvidersUsed}</div>
                <div class="metric-label">AI Providers</div>
            </div>
            <div class="summary-card">
                <div class="metric-number">${Object.values(report.summary.analysisStatus).filter(s => s.openai).length}</div>
                <div class="metric-label">OpenAI Successes</div>
            </div>
            <div class="summary-card">
                <div class="metric-number">${Object.values(report.summary.analysisStatus).filter(s => s.gemini).length}</div>
                <div class="metric-label">Gemini Successes</div>
            </div>
        </div>

        ${Object.entries(report.detailedResults.byBrowser).map(([browserName, browserData]) => `
        <div class="browser-section">
            <div class="browser-header">🌐 ${browserName.charAt(0).toUpperCase() + browserName.slice(1)} Analysis</div>
            <div class="browser-content">
                <div class="screenshots-grid">
                    <div class="screenshot-container">
                        <img src="baseline-${browserName}.png" alt="Baseline ${browserName}">
                        <div class="screenshot-label">Baseline</div>
                    </div>
                    <div class="screenshot-container">
                        <img src="broken-${browserName}.png" alt="Broken ${browserName}">
                        <div class="screenshot-label">Test Version</div>
                    </div>
                </div>
                
                <div class="ai-analysis">
                    <div class="ai-provider">
                        <div class="ai-provider-header">
                            🤖 OpenAI GPT-4 Vision
                            <span class="${browserData.openaiAnalysis.status === 'success' ? 'status-success' : 'status-failed'}">
                                (${browserData.openaiAnalysis.status})
                            </span>
                        </div>
                        <div class="ai-provider-content">
                            ${browserData.openaiAnalysis.status === 'success' 
                                ? `<pre>${browserData.openaiAnalysis.analysis}</pre>`
                                : `<p class="status-failed">Error: ${browserData.openaiAnalysis.error}</p>`
                            }
                        </div>
                    </div>
                    
                    <div class="ai-provider">
                        <div class="ai-provider-header">
                            🧠 Google Gemini Pro Vision
                            <span class="${browserData.geminiAnalysis.status === 'success' ? 'status-success' : 'status-failed'}">
                                (${browserData.geminiAnalysis.status})
                            </span>
                        </div>
                        <div class="ai-provider-content">
                            ${browserData.geminiAnalysis.status === 'success' 
                                ? `<pre>${browserData.geminiAnalysis.analysis}</pre>`
                                : `<p class="status-failed">Error: ${browserData.geminiAnalysis.error}</p>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `).join('')}

        <div class="insights-section">
            <h2>📊 Key Insights</h2>
            ${report.insights.map(insight => `
            <div class="insight-item">
                <div class="insight-category">${insight.category}</div>
                <div>${insight.finding}</div>
            </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

        const reportPath = path.join(this.config.outputDir, 'ai-visual-report.html');
        await fs.writeFile(reportPath, htmlContent);
        
        console.log(`✅ HTML report generated: ${reportPath}`);
        return reportPath;
    }

    async saveResults(report) {
        const resultsPath = path.join(this.config.outputDir, 'ai-visual-results.json');
        await fs.writeFile(resultsPath, JSON.stringify(report, null, 2));
        console.log(`💾 Results saved: ${resultsPath}`);
    }

    async runCompleteTest() {
        console.log('🚀 Starting AI-Powered Visual Testing Suite...\n');

        try {
            await this.initialize();
            await this.captureScreenshots();
            await this.runAIAnalysis();
            
            const report = this.generateComparisonReport();
            await this.saveResults(report);
            const htmlReportPath = await this.generateHTMLReport(report);

            console.log('\n✅ AI Visual Testing Complete!');
            console.log(`📊 View report: ${htmlReportPath}`);
            console.log(`🌐 Server URL: http://localhost:3000/ai-visual-results/ai-visual-report.html`);
            
            return {
                success: true,
                report,
                htmlReportPath
            };

        } catch (error) {
            console.error('❌ Test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// CLI execution
if (require.main === module) {
    const tester = new AIVisualTester();
    tester.runCompleteTest()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 AI Visual Testing completed successfully!');
                process.exit(0);
            } else {
                console.error('\n💥 AI Visual Testing failed:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = AIVisualTester; 