const fs = require('fs').promises;
const path = require('path');
const { chromium, firefox, webkit } = require('playwright');

// Load environment variables
require('dotenv').config();

/**
 * WORKING HUGGINGFACE MODEL TESTING
 * 
 * Tests the models that actually work via HuggingFace Inference API
 */

class WorkingHuggingFaceTest {
    constructor() {
        this.config = {
            huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
            outputDir: path.join(process.cwd(), 'ai-visual-results')
        };
        
        this.workingModels = [
            {
                name: 'Microsoft GIT-Base',
                id: 'microsoft/git-base-coco',
                task: 'image-to-text',
                prompt: 'Describe what you see in this website screenshot'
            },
            {
                name: 'BLIP Image Captioning',
                id: 'Salesforce/blip-image-captioning-base', 
                task: 'image-to-text',
                prompt: 'Generate a caption for this website image'
            },
            {
                name: 'BLIP Visual QA',
                id: 'Salesforce/blip-vqa-base',
                task: 'visual-question-answering',
                prompt: 'What differences do you see between this website and its previous version?'
            },
            {
                name: 'ViT-GPT2 Captioning',
                id: 'nlpconnect/vit-gpt2-image-captioning',
                task: 'image-to-text', 
                prompt: 'Caption this website screenshot'
            }
        ];
    }

    async captureScreenshots() {
        console.log('📸 Capturing fresh screenshots...');
        
        const browsers = [
            { name: 'chromium', browser: chromium },
            { name: 'firefox', browser: firefox },
            { name: 'webkit', browser: webkit }
        ];

        for (const { name, browser } of browsers) {
            console.log(`  🌐 Capturing ${name} screenshots...`);
            
            const browserInstance = await browser.launch();
            const page = await browserInstance.newPage();
            
            // Capture baseline
            await page.goto('http://localhost:3000/baseline-page.html', { waitUntil: 'load' });
            await page.screenshot({ path: path.join(this.config.outputDir, `baseline-${name}.png`), fullPage: true });
            
            // Capture broken version
            await page.goto('http://localhost:3000/broken-page.html', { waitUntil: 'load' });
            await page.screenshot({ path: path.join(this.config.outputDir, `broken-${name}.png`), fullPage: true });
            
            await browserInstance.close();
        }
        
        console.log('✅ Screenshots captured');
    }

    async testWorkingModel(model, imagePath) {
        try {
            const imageBuffer = await fs.readFile(imagePath);
            const base64Image = imageBuffer.toString('base64');
            
            let requestBody;
            
            if (model.task === 'visual-question-answering') {
                requestBody = {
                    inputs: {
                        image: base64Image,
                        question: model.prompt
                    }
                };
            } else {
                requestBody = {
                    inputs: base64Image
                };
            }

            const response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.huggingfaceToken || 'dummy'}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log(`    Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`    ✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
                return data;
            } else {
                const error = await response.text();
                console.log(`    ❌ Error: ${error.substring(0, 100)}...`);
                
                if (response.status === 503) {
                    console.log('    💡 Model is loading - this is normal, try again in a few minutes');
                } else if (response.status === 401) {
                    console.log('    💡 Need HuggingFace token - get one at: https://huggingface.co/settings/tokens');
                }
                return { error: error };
            }
        } catch (error) {
            console.log(`    💥 Exception: ${error.message}`);
            return { error: error.message };
        }
    }

    async runComprehensiveTest() {
        console.log('🚀 TESTING WORKING HUGGINGFACE MODELS\n');
        console.log('=' .repeat(60));
        
        // Ensure output directory exists
        await fs.mkdir(this.config.outputDir, { recursive: true });
        
        // Capture screenshots
        await this.captureScreenshots();
        
        const results = {};
        
        // Test each working model
        for (const model of this.workingModels) {
            console.log(`\n🧪 Testing ${model.name}...`);
            console.log(`   Model: ${model.id}`);
            console.log(`   Task: ${model.task}`);
            
            results[model.id] = {
                name: model.name,
                task: model.task,
                results: {}
            };
            
            // Test on baseline image
            const baselinePath = path.join(this.config.outputDir, 'baseline-chromium.png');
            console.log(`  📊 Testing on baseline image...`);
            const baselineResult = await this.testWorkingModel(model, baselinePath);
            results[model.id].results.baseline = baselineResult;
            
            await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        }
        
        // Save results
        const reportPath = path.join(this.config.outputDir, 'working-hf-models-results.json');
        await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
        
        console.log('\n✅ Testing complete!');
        console.log(`📊 Results saved to: ${reportPath}`);
        
        // Show summary
        console.log('\n📈 SUMMARY:');
        for (const [modelId, result] of Object.entries(results)) {
            const status = result.results.baseline?.error ? '❌ Failed' : '✅ Success';
            console.log(`   ${status} ${result.name}`);
        }
        
        return results;
    }
}

// CLI execution
if (require.main === module) {
    const tester = new WorkingHuggingFaceTest();
    tester.runComprehensiveTest()
        .then(() => {
            console.log('\n🎉 All working models tested!');
        })
        .catch(error => {
            console.error('\n💥 Testing failed:', error);
        });
}

module.exports = WorkingHuggingFaceTest; 