#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Applitools API Integration for Visual Testing Demo
 * 
 * This script:
 * 1. Fetches test results from Applitools API
 * 2. Downloads baseline, actual, and diff images
 * 3. Creates a comprehensive visual report webpage
 * 4. Combines with our detailed difference analysis
 */

class ApplitoolsAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://eyesapi.applitools.com';
  }

  async makeRequest(endpoint, method = 'GET') {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'X-Eyes-Api-Key': this.apiKey,
          'Accept': 'application/json',
          'User-Agent': 'TestableApp-Demo/1.0'
        }
      };

      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve(data);
            }
          } else {
            reject(new Error(`API request failed: ${res.statusCode} ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete file on error
        reject(err);
      });
    });
  }

  async getBatches(limit = 10) {
    console.log('📊 Fetching recent test batches...');
    return this.makeRequest(`/api/sessions/batches?limit=${limit}`);
  }

  async getBatchDetails(batchId) {
    console.log(`🔍 Fetching batch details: ${batchId}`);
    return this.makeRequest(`/api/sessions/batches/${batchId}`);
  }

  async getTestResults(batchId) {
    console.log(`📋 Fetching test results for batch: ${batchId}`);
    return this.makeRequest(`/api/sessions/batches/${batchId}/`);
  }

  async getSessionDetails(sessionId) {
    console.log(`🔎 Fetching session details: ${sessionId}`);
    return this.makeRequest(`/api/sessions/${sessionId}`);
  }

  async getStepImages(sessionId, stepIndex) {
    console.log(`🖼️  Fetching images for session: ${sessionId}, step: ${stepIndex}`);
    return this.makeRequest(`/api/sessions/${sessionId}/steps/${stepIndex}/images`);
  }
}

async function generateVisualReport() {
  const apiKey = process.env.APPLITOOLS_API_KEY2 || process.env.APPLITOOLS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No Applitools API key found');
    console.log('💡 Set APPLITOOLS_API_KEY or APPLITOOLS_API_KEY2 in your .env file');
    return;
  }

  console.log('🎯 APPLITOOLS API VISUAL REPORT GENERATOR');
  console.log('==========================================\n');

  const api = new ApplitoolsAPI(apiKey);
  const outputDir = path.join(__dirname, '..', 'public', 'visual-report');
  const imagesDir = path.join(outputDir, 'images');

  // Create output directories
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  try {
    // 1. Get recent batches
    const batches = await api.getBatches(5);
    console.log(`✅ Found ${batches.length} recent batches\n`);

    // 2. Find our demo batches
    const demoBatches = batches.filter(batch => 
      batch.name.includes('Static Page') || 
      batch.name.includes('Playwright Demo') ||
      batch.name.includes('Demo Setup')
    );

    if (demoBatches.length === 0) {
      console.log('⚠️  No demo batches found. Run a visual test first!');
      return;
    }

    console.log(`🎯 Found ${demoBatches.length} demo batches:`);
    demoBatches.forEach(batch => {
      console.log(`   📦 ${batch.name} (${batch.id})`);
    });

    // 3. Process the most recent demo batch
    const latestBatch = demoBatches[0];
    console.log(`\n🔍 Processing latest batch: ${latestBatch.name}`);

    const batchDetails = await api.getBatchDetails(latestBatch.id);
    const testResults = await api.getTestResults(latestBatch.id);

    console.log(`📊 Batch contains ${testResults.length} test(s)`);

    const reportData = {
      batchInfo: {
        id: latestBatch.id,
        name: latestBatch.name,
        createdAt: latestBatch.startedAt,
        totalTests: testResults.length
      },
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        new: 0,
        total: testResults.length
      }
    };

    // 4. Process each test and download images
    for (const test of testResults) {
      console.log(`\n🧪 Processing test: ${test.name}`);
      
      const sessionDetails = await api.getSessionDetails(test.id);
      const testData = {
        id: test.id,
        name: test.name,
        status: test.status,
        appName: test.appName,
        testName: test.testName,
        browserInfo: test.hostDisplaySize,
        steps: []
      };

      // Update summary
      if (test.status === 'Passed') reportData.summary.passed++;
      else if (test.status === 'Failed') reportData.summary.failed++;
      else if (test.status === 'New') reportData.summary.new++;

      // Process each step (usually just one for our demo)
      if (sessionDetails.steps) {
        for (let stepIndex = 0; stepIndex < sessionDetails.steps.length; stepIndex++) {
          const step = sessionDetails.steps[stepIndex];
          console.log(`   📸 Processing step ${stepIndex + 1}: ${step.name}`);

          try {
            const stepImages = await api.getStepImages(test.id, stepIndex);
            
            const stepData = {
              name: step.name,
              status: step.isDifferent ? 'Different' : 'Matched',
              images: {}
            };

            // Download images if available
            if (stepImages.baseline) {
              const baselineFile = `baseline_${test.id}_${stepIndex}.png`;
              await api.downloadImage(stepImages.baseline, path.join(imagesDir, baselineFile));
              stepData.images.baseline = `images/${baselineFile}`;
              console.log(`      ✅ Downloaded baseline image`);
            }

            if (stepImages.actual) {
              const actualFile = `actual_${test.id}_${stepIndex}.png`;
              await api.downloadImage(stepImages.actual, path.join(imagesDir, actualFile));
              stepData.images.actual = `images/${actualFile}`;
              console.log(`      ✅ Downloaded actual image`);
            }

            if (stepImages.diff && step.isDifferent) {
              const diffFile = `diff_${test.id}_${stepIndex}.png`;
              await api.downloadImage(stepImages.diff, path.join(imagesDir, diffFile));
              stepData.images.diff = `images/${diffFile}`;
              console.log(`      ✅ Downloaded diff image`);
            }

            testData.steps.push(stepData);

          } catch (imageError) {
            console.log(`      ⚠️  Could not fetch images: ${imageError.message}`);
          }
        }
      }

      reportData.tests.push(testData);
    }

    // 5. Load our detailed analysis
    const analysisPath = path.join(__dirname, '..', 'public', 'visual-analysis.json');
    let detailedAnalysis = null;
    if (fs.existsSync(analysisPath)) {
      detailedAnalysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
      console.log('\n📋 Loaded detailed difference analysis');
    }

    // 6. Generate HTML report
    const htmlReport = generateHTMLReport(reportData, detailedAnalysis);
    const reportPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(reportPath, htmlReport);

    // 7. Save JSON data
    const jsonPath = path.join(outputDir, 'report-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

    console.log('\n🎉 VISUAL REPORT GENERATED SUCCESSFULLY!');
    console.log(`📁 Report location: ${reportPath}`);
    console.log(`🌐 View at: http://localhost:3000/visual-report/`);
    console.log(`📊 Raw data: ${jsonPath}`);

    return { success: true, reportPath, data: reportData };

  } catch (error) {
    console.error(`❌ Error generating report: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function generateHTMLReport(reportData, detailedAnalysis) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Testing Demo Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .stat-card h3 { font-size: 2rem; margin-bottom: 5px; }
        .stat-card.passed h3 { color: #28a745; }
        .stat-card.failed h3 { color: #dc3545; }
        .stat-card.new h3 { color: #007bff; }
        .test-section { background: white; border-radius: 8px; padding: 30px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-header { border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 20px; }
        .test-header h2 { color: #333; margin-bottom: 5px; }
        .test-meta { color: #666; font-size: 0.9rem; }
        .image-comparison { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0; }
        .image-container { text-align: center; }
        .image-container img { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .image-container h4 { margin-bottom: 10px; color: #333; }
        .differences-section { background: #f8f9fa; padding: 25px; border-radius: 8px; margin-top: 30px; }
        .differences-section h3 { color: #333; margin-bottom: 20px; }
        .difference-item { background: white; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
        .difference-item h4 { color: #333; margin-bottom: 8px; }
        .difference-item .meta { color: #666; font-size: 0.9rem; margin-bottom: 5px; }
        .difference-item .explanation { color: #555; }
        .visibility-tag { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
        .visibility-obvious { background: #ff4444; color: white; }
        .visibility-moderate { background: #ff8800; color: white; }
        .visibility-subtle { background: #ffaa00; color: white; }
        .visibility-very-subtle { background: #aaaaaa; color: white; }
        .no-images { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 6px; text-align: center; }
        @media (max-width: 768px) {
            .image-comparison { grid-template-columns: 1fr; }
            .header h1 { font-size: 2rem; }
            .header p { font-size: 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Visual Testing Demo Report</h1>
            <p>Traditional vs AI-Powered Visual Testing Comparison</p>
            <p><strong>Batch:</strong> ${reportData.batchInfo.name} | <strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card passed">
                <h3>${reportData.summary.passed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="stat-card failed">
                <h3>${reportData.summary.failed}</h3>
                <p>Differences Found</p>
            </div>
            <div class="stat-card new">
                <h3>${reportData.summary.new}</h3>
                <p>New Baselines</p>
            </div>
            <div class="stat-card">
                <h3>${reportData.summary.total}</h3>
                <p>Total Tests</p>
            </div>
        </div>

        ${reportData.tests.map(test => `
            <div class="test-section">
                <div class="test-header">
                    <h2>${test.name}</h2>
                    <div class="test-meta">
                        Status: <strong>${test.status}</strong> | 
                        App: ${test.appName} | 
                        Test: ${test.testName}
                    </div>
                </div>

                ${test.steps.map(step => `
                    <div class="step">
                        <h3>📸 ${step.name}</h3>
                        <p><strong>Status:</strong> ${step.status}</p>
                        
                        ${step.images.baseline || step.images.actual || step.images.diff ? `
                            <div class="image-comparison">
                                ${step.images.baseline ? `
                                    <div class="image-container">
                                        <h4>✅ Baseline (Perfect)</h4>
                                        <img src="${step.images.baseline}" alt="Baseline" />
                                    </div>
                                ` : ''}
                                
                                ${step.images.actual ? `
                                    <div class="image-container">
                                        <h4>🔍 Current Page</h4>
                                        <img src="${step.images.actual}" alt="Actual" />
                                    </div>
                                ` : ''}
                                
                                ${step.images.diff ? `
                                    <div class="image-container">
                                        <h4>🐛 Differences Detected</h4>
                                        <img src="${step.images.diff}" alt="Differences" />
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="no-images">
                                <p>📋 Images not available in this batch. Check Applitools dashboard for full visual comparison.</p>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
        `).join('')}

        ${detailedAnalysis ? `
            <div class="differences-section">
                <h3>🔍 Detailed Analysis: ${detailedAnalysis.totalDifferences} Visual Differences Detected</h3>
                <p><strong>Breakdown:</strong> 
                   ${detailedAnalysis.visibilityBreakdown.obvious} Obvious, 
                   ${detailedAnalysis.visibilityBreakdown.moderate} Moderate, 
                   ${detailedAnalysis.visibilityBreakdown.subtle} Subtle, 
                   ${detailedAnalysis.visibilityBreakdown.verySubtle} Very Subtle
                </p>
                
                ${detailedAnalysis.differences.map((diff, index) => `
                    <div class="difference-item">
                        <h4>${index + 1}. ${diff.element}</h4>
                        <div class="meta">
                            📍 ${diff.location} | 
                            <span class="visibility-tag visibility-${diff.visibility.toLowerCase().replace(/[^a-z]/g, '-')}">${diff.visibility}</span>
                        </div>
                        <div class="meta"><strong>Change:</strong> ${diff.change}</div>
                        <div class="meta"><strong>CSS:</strong> <code>${diff.cssChange}</code></div>
                        <div class="explanation"><strong>Why highlighted:</strong> ${diff.explanation}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div class="test-section">
            <h3>💡 Key Insights</h3>
            <ul>
                <li><strong>AI Detection:</strong> Applitools caught ${detailedAnalysis?.totalDifferences || 'multiple'} visual differences that traditional testing completely missed</li>
                <li><strong>Pixel Perfect:</strong> Every change, from obvious color differences to 1px font size changes, was detected</li>
                <li><strong>Cross-Browser:</strong> ${reportData.tests.length} browser${reportData.tests.length > 1 ? 's' : ''} tested automatically</li>
                <li><strong>Speed:</strong> Complete visual analysis in seconds vs hours of manual review</li>
                <li><strong>Consistency:</strong> No human fatigue or oversight - same results every time</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}

// Run if called directly
if (require.main === module) {
  generateVisualReport()
    .then(result => {
      if (result.success) {
        console.log('\n✨ Report generation complete!');
        process.exit(0);
      } else {
        console.log('\n❌ Report generation failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { generateVisualReport }; 