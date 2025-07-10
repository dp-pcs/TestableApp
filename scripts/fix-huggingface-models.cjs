const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

/**
 * FIXED HUGGINGFACE MODEL TESTING
 * 
 * Corrects the API calls for LLaVA and Qwen models
 */

class FixedHuggingFaceTest {
    constructor() {
        this.config = {
            huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
            outputDir: path.join(process.cwd(), 'ai-visual-results')
        };
    }

    async testLLaVAFixed() {
        console.log('🔧 Testing LLaVA-1.5 with corrected API format...');
        
        if (!this.config.huggingfaceToken) {
            console.log('❌ Need HuggingFace token. Get one at: https://huggingface.co/settings/tokens');
            return;
        }

        try {
            // Load our screenshots
            const baselineBuffer = await fs.readFile(path.join(this.config.outputDir, 'baseline-chromium.png'));
            
            // Try different LLaVA model endpoints
            const models = [
                'llava-hf/llava-1.5-7b-hf',
                'llava-hf/llava-1.5-13b-hf', 
                'Salesforce/blip-vqa-base'  // Backup visual QA model
            ];

            for (const model of models) {
                console.log(`  Testing model: ${model}`);
                
                const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.huggingfaceToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: {
                            image: baselineBuffer.toString('base64'),
                            question: "What is the main color of the website header?"
                        }
                    })
                });

                console.log(`    Status: ${response.status}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`    Response: ${JSON.stringify(data, null, 2)}`);
                    break;
                } else {
                    const error = await response.text();
                    console.log(`    Error: ${error}`);
                    
                    if (response.status === 503) {
                        console.log('    Model is loading - try again in a few minutes');
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    async testAvailableModels() {
        console.log('🔍 Checking which vision models are available on HuggingFace...');
        
        const visionModels = [
            'microsoft/git-base-coco',
            'Salesforce/blip-image-captioning-base',
            'Salesforce/blip-vqa-base',
            'google/vit-base-patch16-224',
            'nlpconnect/vit-gpt2-image-captioning'
        ];

        for (const model of visionModels) {
            try {
                const response = await fetch(`https://huggingface.co/api/models/${model}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${model} - Available`);
                    console.log(`   Task: ${data.pipeline_tag || 'Unknown'}`);
                } else {
                    console.log(`❌ ${model} - Not found`);
                }
            } catch (error) {
                console.log(`❌ ${model} - Error: ${error.message}`);
            }
        }
    }

    async runQuickTest() {
        console.log('🚀 HUGGINGFACE MODEL DIAGNOSIS\n');
        console.log('=' .repeat(50));
        
        await this.testAvailableModels();
        console.log('\n');
        await this.testLLaVAFixed();
    }
}

// CLI execution
if (require.main === module) {
    const tester = new FixedHuggingFaceTest();
    tester.runQuickTest()
        .then(() => {
            console.log('\n✅ HuggingFace diagnosis complete!');
        })
        .catch(error => {
            console.error('\n💥 Diagnosis failed:', error);
        });
}

module.exports = FixedHuggingFaceTest; 