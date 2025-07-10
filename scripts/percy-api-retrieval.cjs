const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config();

/**
 * PERCY API DATA RETRIEVAL
 * 
 * Retrieves build data from Percy's API to analyze what visual differences were detected
 * Note: Percy API is limited - no direct visual diff export, but we can get build metadata
 */

class PercyAPIRetrieval {
    constructor() {
        this.config = {
            percyToken: process.env.PERCY_TOKEN,
            apiBase: 'https://percy.io/api/v1',
            outputDir: path.join(process.cwd(), 'percy-api-results'),
            // From your Percy dashboard URL: https://percy.io/27df0096/web/TestableApp-c7f9047d
            projectId: '27df0096/web/TestableApp-c7f9047d'
        };
    }

    async makeAPIRequest(endpoint) {
        return new Promise((resolve, reject) => {
            const url = `${this.config.apiBase}${endpoint}`;
            const options = {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${this.config.percyToken}`,
                    'Accept': 'application/json',
                    'User-Agent': 'TestableApp-Percy-Analysis/1.0'
                }
            };

            console.log(`🔗 API Request: ${endpoint}`);

            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`   Status: ${res.statusCode}`);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsed = JSON.parse(data);
                            resolve(parsed);
                        } catch (e) {
                            resolve(data);
                        }
                    } else {
                        console.log(`   Error response: ${data.substring(0, 200)}...`);
                        reject(new Error(`API request failed: ${res.statusCode} ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    }

    async getRecentBuilds() {
        console.log('📋 Fetching recent builds...');
        
        try {
            // Try different API endpoints to find builds
            const endpoints = [
                `/projects/${encodeURIComponent(this.config.projectId)}/builds`,
                `/builds?project=${encodeURIComponent(this.config.projectId)}`,
                `/builds`
            ];

            for (const endpoint of endpoints) {
                try {
                    const builds = await this.makeAPIRequest(endpoint);
                    if (builds && (builds.data || builds.length > 0)) {
                        console.log(`✅ Found builds via: ${endpoint}`);
                        return builds;
                    }
                } catch (error) {
                    console.log(`   ❌ Failed: ${endpoint} - ${error.message}`);
                    continue;
                }
            }

            throw new Error('No builds found via any endpoint');
        } catch (error) {
            console.log(`❌ Error fetching builds: ${error.message}`);
            return null;
        }
    }

    async getBuildDetails(buildId) {
        console.log(`🔍 Fetching build details for: ${buildId}`);
        
        try {
            const build = await this.makeAPIRequest(`/builds/${buildId}`);
            return build;
        } catch (error) {
            console.log(`❌ Error fetching build ${buildId}: ${error.message}`);
            return null;
        }
    }

    async getBuildSnapshots(buildId) {
        console.log(`📸 Fetching snapshots for build: ${buildId}`);
        
        try {
            const snapshots = await this.makeAPIRequest(`/builds/${buildId}/snapshots`);
            return snapshots;
        } catch (error) {
            console.log(`❌ Error fetching snapshots for ${buildId}: ${error.message}`);
            return null;
        }
    }

    async getBuildComparisons(buildId) {
        console.log(`🔄 Fetching comparisons for build: ${buildId}`);
        
        try {
            const comparisons = await this.makeAPIRequest(`/builds/${buildId}/comparisons`);
            return comparisons;
        } catch (error) {
            console.log(`❌ Error fetching comparisons for ${buildId}: ${error.message}`);
            return null;
        }
    }

    async analyzePercyDetections() {
        console.log('🎯 PERCY API DATA RETRIEVAL');
        console.log('=' .repeat(60));

        if (!this.config.percyToken) {
            throw new Error('❌ PERCY_TOKEN environment variable is required');
        }

        // Create output directory
        await fs.mkdir(this.config.outputDir, { recursive: true });

        const analysis = {
            timestamp: new Date().toISOString(),
            percyToken: this.config.percyToken.substring(0, 10) + '...',
            apiBase: this.config.apiBase,
            projectId: this.config.projectId,
            builds: [],
            detections: {}
        };

        try {
            // 1. Get recent builds
            const buildsResponse = await this.getRecentBuilds();
            
            if (!buildsResponse) {
                console.log('⚠️  Unable to fetch builds via API. This might be due to:');
                console.log('   • Token permissions (need read-only or full-access token)');
                console.log('   • Project ID format');
                console.log('   • API endpoint changes');
                
                // Create manual analysis based on known build URLs
                return this.createManualAnalysis();
            }

            const builds = buildsResponse.data || buildsResponse;
            console.log(`📊 Found ${builds.length} builds`);

            // 2. Analyze recent builds (limit to latest 5)
            const recentBuilds = builds.slice(0, 5);
            
            for (const build of recentBuilds) {
                console.log(`\n🔍 Analyzing build #${build.attributes['build-number']}...`);
                
                const buildDetails = await this.getBuildDetails(build.id);
                const snapshots = await this.getBuildSnapshots(build.id);
                const comparisons = await this.getBuildComparisons(build.id);

                const buildAnalysis = {
                    id: build.id,
                    buildNumber: build.attributes['build-number'],
                    state: build.attributes.state,
                    reviewState: build.attributes['review-state'],
                    reviewStateReason: build.attributes['review-state-reason'],
                    totalSnapshots: build.attributes['total-snapshots'],
                    totalComparisons: build.attributes['total-comparisons'],
                    totalComparisonsDiff: build.attributes['total-comparisons-diff'],
                    webUrl: build.attributes['web-url'],
                    createdAt: build.attributes['created-at'],
                    finishedAt: build.attributes['finished-at'],
                    approvedAt: build.attributes['approved-at'],
                    details: buildDetails,
                    snapshots: snapshots,
                    comparisons: comparisons
                };

                analysis.builds.push(buildAnalysis);

                // Extract detection information
                if (build.attributes['total-comparisons-diff'] > 0) {
                    analysis.detections[build.id] = {
                        differencesFound: build.attributes['total-comparisons-diff'],
                        totalComparisons: build.attributes['total-comparisons'],
                        detectionRate: ((build.attributes['total-comparisons-diff'] / build.attributes['total-comparisons']) * 100).toFixed(1),
                        reviewState: build.attributes['review-state']
                    };
                }
            }

            // 3. Generate summary
            const summary = this.generateDetectionSummary(analysis);
            analysis.summary = summary;

            // 4. Save results
            const resultsPath = path.join(this.config.outputDir, 'percy-api-results.json');
            await fs.writeFile(resultsPath, JSON.stringify(analysis, null, 2));

            // 5. Generate report
            const reportPath = await this.generateAPIReport(analysis);

            console.log('\n✅ Percy API analysis complete!');
            console.log(`📊 Results: ${resultsPath}`);
            console.log(`📄 Report: ${reportPath}`);
            console.log(`🌐 View at: http://localhost:3000/percy-api-results/percy-api-report.html`);

            return analysis;

        } catch (error) {
            console.error(`❌ API analysis failed: ${error.message}`);
            
            // Fallback to manual analysis
            console.log('\n💡 Falling back to manual analysis...');
            return this.createManualAnalysis();
        }
    }

    async createManualAnalysis() {
        console.log('📝 Creating manual analysis based on known Percy builds...');
        
        const manualAnalysis = {
            timestamp: new Date().toISOString(),
            method: 'manual',
            note: 'API access limited - using manual analysis based on known builds',
            knownBuilds: [
                {
                    buildNumber: 14,
                    description: 'Bug detection build with visual differences',
                    url: 'https://percy.io/27df0096/web/TestableApp-c7f9047d/builds/latest',
                    expectedDetections: 'Multiple visual differences in broken page layout'
                },
                {
                    buildNumber: 12,
                    description: 'Clean baseline establishment',
                    url: 'https://percy.io/27df0096/web/TestableApp-c7f9047d',
                    expectedDetections: 'No differences (baseline)'
                }
            ],
            analysisInstructions: [
                '1. Visit Percy dashboard: https://percy.io/27df0096/web/TestableApp-c7f9047d',
                '2. Review latest builds for visual differences',
                '3. Check which snapshots show diffs vs baseline',
                '4. Count detection accuracy manually'
            ]
        };

        const resultsPath = path.join(this.config.outputDir, 'percy-manual-analysis.json');
        await fs.writeFile(resultsPath, JSON.stringify(manualAnalysis, null, 2));

        const reportPath = await this.generateManualReport(manualAnalysis);

        console.log('\n📋 Manual analysis guide created!');
        console.log(`📊 Guide: ${resultsPath}`);
        console.log(`📄 Report: ${reportPath}`);
        
        return manualAnalysis;
    }

    generateDetectionSummary(analysis) {
        const totalBuilds = analysis.builds.length;
        const buildsWithDiffs = analysis.builds.filter(b => b.totalComparisonsDiff > 0).length;
        const totalDiffsDetected = analysis.builds.reduce((sum, b) => sum + (b.totalComparisonsDiff || 0), 0);
        const totalComparisons = analysis.builds.reduce((sum, b) => sum + (b.totalComparisons || 0), 0);

        return {
            totalBuilds,
            buildsWithDiffs,
            totalDiffsDetected,
            totalComparisons,
            overallDetectionRate: totalComparisons > 0 ? ((totalDiffsDetected / totalComparisons) * 100).toFixed(1) : 0,
            latestBuild: analysis.builds[0] || null
        };
    }

    async generateAPIReport(analysis) {
        const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Percy API Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #663399; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .build { margin: 10px 0; padding: 15px; border-left: 3px solid #663399; background: #f8f9fa; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #e9ecef; border-radius: 5px; text-align: center; }
        .diff-found { border-left-color: #dc3545; background: #f8d7da; }
        .no-diff { border-left-color: #28a745; background: #d4edda; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        .api-data { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Percy API Analysis Report</h1>
        <p>Retrieved build data from Percy API: ${analysis.timestamp}</p>
    </div>

    <div class="section">
        <h2>📊 Detection Summary</h2>
        ${analysis.summary ? `
        <div class="metric">
            <h3>${analysis.summary.totalBuilds}</h3>
            <p>Total Builds Analyzed</p>
        </div>
        <div class="metric">
            <h3>${analysis.summary.buildsWithDiffs}</h3>
            <p>Builds with Differences</p>
        </div>
        <div class="metric">
            <h3>${analysis.summary.totalDiffsDetected}</h3>
            <p>Total Differences Detected</p>
        </div>
        <div class="metric">
            <h3>${analysis.summary.overallDetectionRate}%</h3>
            <p>Detection Rate</p>
        </div>
        ` : '<p>Manual analysis required - API access limited</p>'}
    </div>

    <div class="section">
        <h2>🏗️ Recent Builds Analysis</h2>
        ${analysis.builds.map(build => `
        <div class="build ${build.totalComparisonsDiff > 0 ? 'diff-found' : 'no-diff'}">
            <h3>Build #${build.buildNumber} - ${build.state}</h3>
            <p><strong>Review State:</strong> ${build.reviewState || 'N/A'} ${build.reviewStateReason ? `(${build.reviewStateReason})` : ''}</p>
            <p><strong>Snapshots:</strong> ${build.totalSnapshots} | <strong>Comparisons:</strong> ${build.totalComparisons} | <strong>Differences:</strong> ${build.totalComparisonsDiff}</p>
            <p><strong>Created:</strong> ${new Date(build.createdAt).toLocaleString()}</p>
            ${build.webUrl ? `<p><strong>View:</strong> <a href="${build.webUrl}" target="_blank">${build.webUrl}</a></p>` : ''}
        </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🔗 Percy Dashboard Links</h2>
        <p><a href="https://percy.io/27df0096/web/TestableApp-c7f9047d" target="_blank">🎯 Main Project Dashboard</a></p>
        <p><a href="https://percy.io/27df0096/web/TestableApp-c7f9047d/builds" target="_blank">📋 All Builds</a></p>
    </div>

    <div class="section">
        <h2>📄 Raw API Data</h2>
        <details>
            <summary>Click to view full API response data</summary>
            <div class="api-data">${JSON.stringify(analysis, null, 2)}</div>
        </details>
    </div>

    <div class="section">
        <h2>🎯 Next Steps</h2>
        <ol>
            <li>Review Percy dashboard manually for visual differences</li>
            <li>Compare detected differences with known injected bugs</li>
            <li>Use detection form to calculate accuracy: <a href="/percy-accuracy-results/percy-detection-form.html">Detection Form</a></li>
            <li>Compare Percy results with AI analysis results</li>
        </ol>
    </div>
</body>
</html>`;

        const reportPath = path.join(this.config.outputDir, 'percy-api-report.html');
        await fs.writeFile(reportPath, reportHtml);
        return reportPath;
    }

    async generateManualReport(analysis) {
        const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Percy Manual Analysis Guide</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #663399; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .step { margin: 10px 0; padding: 15px; border-left: 3px solid #663399; background: #f8f9fa; }
        .link { display: block; margin: 10px 0; padding: 10px; background: #e9ecef; border-radius: 5px; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Percy Manual Analysis Guide</h1>
        <p>API access limited - follow this guide to analyze Percy results manually</p>
    </div>

    <div class="section">
        <h2>🔗 Quick Links</h2>
        <a href="https://percy.io/27df0096/web/TestableApp-c7f9047d" target="_blank" class="link">
            🎯 Percy Dashboard - Main Project
        </a>
        <a href="/percy-accuracy-results/percy-detection-form.html" target="_blank" class="link">
            📝 Detection Accuracy Form
        </a>
    </div>

    <div class="section">
        <h2>📋 Analysis Steps</h2>
        ${analysis.analysisInstructions.map((step, index) => `
        <div class="step">
            <strong>Step ${index + 1}:</strong> ${step}
        </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🏗️ Known Builds to Check</h2>
        ${analysis.knownBuilds.map(build => `
        <div class="step">
            <h3>Build #${build.buildNumber}</h3>
            <p><strong>Description:</strong> ${build.description}</p>
            <p><strong>Expected:</strong> ${build.expectedDetections}</p>
            <p><strong>URL:</strong> <a href="${build.url}" target="_blank">${build.url}</a></p>
        </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🎯 What to Look For</h2>
        <ul>
            <li>Visual diffs highlighted in red</li>
            <li>Snapshot comparison views</li>
            <li>Changes detected vs missed</li>
            <li>Cross-browser differences</li>
            <li>Build approval status</li>
        </ul>
    </div>
</body>
</html>`;

        const reportPath = path.join(this.config.outputDir, 'percy-manual-report.html');
        await fs.writeFile(reportPath, reportHtml);
        return reportPath;
    }
}

// CLI execution
if (require.main === module) {
    const retriever = new PercyAPIRetrieval();
    retriever.analyzePercyDetections()
        .then(() => {
            console.log('\n🎉 Percy API analysis complete!');
            console.log('\n📋 Next steps:');
            console.log('1. Review the generated report');
            console.log('2. Check Percy dashboard manually');
            console.log('3. Fill out detection form for accuracy metrics');
        })
        .catch(error => {
            console.error('\n💥 Analysis failed:', error);
        });
}

module.exports = PercyAPIRetrieval; 