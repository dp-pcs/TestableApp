const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

class AIAccuracyAnalyzer {
    constructor() {
        this.groundTruth = {
            engineeredBugs: [
                {
                    id: 'BUG1',
                    location: 'Header Logo',
                    description: 'Logo color changed from white to red (#ff0000)',
                    severity: 'Major',
                    cssRule: '.logo { color: #ff0000; }',
                    category: 'Color Change'
                },
                {
                    id: 'BUG2', 
                    location: 'Hero Section H1',
                    description: 'Title misaligned with margin-left: 15px',
                    severity: 'Minor',
                    cssRule: '.hero h1 { margin-left: 15px; }',
                    category: 'Layout Shift'
                },
                {
                    id: 'BUG3',
                    location: 'CTA Button',
                    description: 'Border-radius changed from 50px to 5px', 
                    severity: 'Minor',
                    cssRule: '.cta-button { border-radius: 5px; }',
                    category: 'Style Change'
                },
                {
                    id: 'BUG4',
                    location: 'CTA Button',
                    description: 'Button positioned too far right (left: 30px)',
                    severity: 'Minor',
                    cssRule: '.cta-button { position: relative; left: 30px; }',
                    category: 'Layout Shift'
                },
                {
                    id: 'BUG5',
                    location: 'Feature Cards 1-3',
                    description: 'Missing box-shadow on first 3 feature cards',
                    severity: 'Minor',
                    cssRule: '.feature-card { /* missing box-shadow */ }',
                    category: 'Missing Effect'
                },
                {
                    id: 'BUG6',
                    location: 'Feature Titles',
                    description: 'Inconsistent font sizes (1.1rem, 1.5rem vs 1.3rem)',
                    severity: 'Minor',
                    cssRule: '.feature-card:nth-child(2) .feature-title { font-size: 1.1rem; }',
                    category: 'Typography'
                },
                {
                    id: 'BUG7',
                    location: 'Stats Section',
                    description: 'Wrong opacity for stat label (0.3 vs 0.9)',
                    severity: 'Minor',
                    cssRule: '.stat-item:nth-child(2) .stat-label { opacity: 0.3; }',
                    category: 'Color Change'
                },
                {
                    id: 'BUG8',
                    location: 'Team Section',
                    description: 'Background color changed to light blue (#e8f4fd)',
                    severity: 'Major',
                    cssRule: '.team { background-color: #e8f4fd; }',
                    category: 'Color Change'
                },
                {
                    id: 'BUG9',
                    location: 'Contact Section',
                    description: 'Wrong padding creating uneven spacing (2rem 0 4rem 0)',
                    severity: 'Minor',
                    cssRule: '.contact { padding: 2rem 0 4rem 0; }',
                    category: 'Spacing'
                },
                {
                    id: 'BUG10',
                    location: 'Submit Button',
                    description: 'Button overlapping form field (top: -10px)',
                    severity: 'Major',
                    cssRule: '.submit-btn { position: relative; top: -10px; }',
                    category: 'Layout Overlap'
                },
                {
                    id: 'BUG11',
                    location: 'Cross-Browser Section',
                    description: 'Browser-specific CSS differences (WebKit, Firefox, Chromium)',
                    severity: 'Subtle',
                    cssRule: '@supports, @-moz-document, browser-specific rules',
                    category: 'Browser Differences'
                }
            ],
            totalBugs: 11
        };
    }

    async loadAIResults() {
        try {
            const resultsPath = path.join(process.cwd(), 'ai-visual-results', 'ai-visual-results.json');
            const data = await fs.readFile(resultsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading AI results:', error);
            return null;
        }
    }

    extractBugsFromAIAnalysis(analysis, aiProvider, browser) {
        if (!analysis || analysis.status !== 'success') {
            return [];
        }

        const text = analysis.analysis;
        const bugs = [];

        // Extract count
        const countMatch = text.match(/(\d+)\s*(?:total\s*)?(?:visual\s*)?differences?\s*found/i);
        const totalCount = countMatch ? parseInt(countMatch[1]) : 0;

        // Extract individual differences using various patterns
        const patterns = [
            /(?:difference|location|section)[:\s]*([^•\n]*?)(?:description|desc)[:\s]*([^•\n]*?)(?:severity)[:\s]*([^•\n]*)/gi,
            /•\s*\*\*([^*]+)\*\*[:\s]*([^•\n]+)/gi,
            /\d+\.\s*\*\*([^*]+)\*\*[:\s]*([^•\n]+)/gi,
            /(?:location|section)[:\s]*"([^"]+)"[^•\n]*?(?:description|desc)[:\s]*([^•\n]*)/gi
        ];

        // Try to extract structured differences
        let matches = [];
        for (const pattern of patterns) {
            const found = [...text.matchAll(pattern)];
            if (found.length > 0) {
                matches = found;
                break;
            }
        }

        if (matches.length > 0) {
            matches.forEach((match, index) => {
                bugs.push({
                    id: `${aiProvider}_${browser}_${index + 1}`,
                    location: match[1]?.trim() || 'Unknown',
                    description: match[2]?.trim() || 'Unknown',
                    severity: match[3]?.trim() || 'Unknown',
                    source: `${aiProvider} ${browser}`
                });
            });
        } else {
            // Fallback: split by numbered items or bullet points
            const lines = text.split(/\n+/);
            let currentBug = {};
            
            lines.forEach(line => {
                line = line.trim();
                if (line.match(/^\d+\.|^•|^\*/)) {
                    if (currentBug.location) {
                        bugs.push({
                            id: `${aiProvider}_${browser}_${bugs.length + 1}`,
                            ...currentBug,
                            source: `${aiProvider} ${browser}`
                        });
                    }
                    currentBug = {
                        location: line.replace(/^\d+\.|^•|^\*/, '').trim(),
                        description: '',
                        severity: 'Unknown'
                    };
                } else if (line.toLowerCase().includes('description')) {
                    currentBug.description = line.replace(/.*description[:\s]*/i, '').trim();
                } else if (line.toLowerCase().includes('severity')) {
                    currentBug.severity = line.replace(/.*severity[:\s]*/i, '').trim();
                }
            });
            
            if (currentBug.location) {
                bugs.push({
                    id: `${aiProvider}_${browser}_${bugs.length + 1}`,
                    ...currentBug,
                    source: `${aiProvider} ${browser}`
                });
            }
        }

        return {
            totalReported: totalCount,
            bugsExtracted: bugs,
            extractedCount: bugs.length
        };
    }

    analyzeAccuracy(groundTruth, aiBugs) {
        const matches = [];
        const falsePositives = [];
        const missed = [...groundTruth];

        aiBugs.forEach(aiBug => {
            let matchFound = false;
            
            // Try to match against ground truth
            groundTruth.forEach((trueBug, index) => {
                if (!matchFound && this.isMatchingBug(trueBug, aiBug)) {
                    matches.push({
                        groundTruth: trueBug,
                        aiDetection: aiBug,
                        confidence: this.calculateMatchConfidence(trueBug, aiBug)
                    });
                    missed.splice(missed.indexOf(trueBug), 1);
                    matchFound = true;
                }
            });

            if (!matchFound) {
                falsePositives.push(aiBug);
            }
        });

        return {
            matches,
            falsePositives,
            missed,
            accuracy: {
                truePositives: matches.length,
                falsePositives: falsePositives.length,
                falseNegatives: missed.length,
                precision: matches.length / (matches.length + falsePositives.length) || 0,
                recall: matches.length / groundTruth.length || 0
            }
        };
    }

    isMatchingBug(trueBug, aiBug) {
        const trueLocation = trueBug.location.toLowerCase();
        const aiLocation = aiBug.location.toLowerCase();
        const trueDesc = trueBug.description.toLowerCase();
        const aiDesc = aiBug.description.toLowerCase();

        // Location-based matching
        const locationKeywords = [
            'header', 'logo', 'hero', 'button', 'cta', 'feature', 'card', 
            'stats', 'team', 'contact', 'form', 'submit', 'background', 'browser'
        ];

        let locationMatch = false;
        for (const keyword of locationKeywords) {
            if (trueLocation.includes(keyword) && aiLocation.includes(keyword)) {
                locationMatch = true;
                break;
            }
        }

        // Description-based matching
        const descKeywords = [
            'color', 'red', 'blue', 'margin', 'padding', 'position', 'border-radius',
            'box-shadow', 'font-size', 'opacity', 'overlap', 'alignment'
        ];

        let descMatch = false;
        for (const keyword of descKeywords) {
            if (trueDesc.includes(keyword) && aiDesc.includes(keyword)) {
                descMatch = true;
                break;
            }
        }

        return locationMatch || descMatch;
    }

    calculateMatchConfidence(trueBug, aiBug) {
        let score = 0;
        
        // Location similarity
        if (trueBug.location.toLowerCase().includes(aiBug.location.toLowerCase()) ||
            aiBug.location.toLowerCase().includes(trueBug.location.toLowerCase())) {
            score += 0.4;
        }

        // Description similarity  
        const trueWords = trueBug.description.toLowerCase().split(/\s+/);
        const aiWords = aiBug.description.toLowerCase().split(/\s+/);
        const commonWords = trueWords.filter(word => aiWords.includes(word) && word.length > 2);
        score += (commonWords.length / Math.max(trueWords.length, aiWords.length)) * 0.6;

        return Math.min(score, 1.0);
    }

    async generateComprehensiveReport() {
        console.log('🔍 AI ACCURACY ANALYSIS - Comparing Ground Truth vs AI Detection\n');
        console.log('=' .repeat(80));

        const aiResults = await this.loadAIResults();
        if (!aiResults) {
            console.error('Could not load AI results');
            return;
        }

        const analysisResults = {};
        const browsers = ['chromium', 'firefox', 'webkit'];
        const aiProviders = ['openai', 'gemini'];

        // Analyze each AI provider and browser
        for (const browser of browsers) {
            analysisResults[browser] = {};
            
            for (const provider of aiProviders) {
                const providerKey = provider === 'openai' ? 'openaiAnalysis' : 'geminiAnalysis';
                const analysis = aiResults.detailedResults.byBrowser[browser][providerKey];
                
                const extractedBugs = this.extractBugsFromAIAnalysis(analysis, provider, browser);
                const accuracyAnalysis = this.analyzeAccuracy(this.groundTruth.engineeredBugs, extractedBugs.bugsExtracted);
                
                analysisResults[browser][provider] = {
                    ...extractedBugs,
                    ...accuracyAnalysis
                };
            }
        }

        // Generate summary report
        this.generateSummaryReport(analysisResults);
        
        // Generate detailed findings
        this.generateDetailedFindings(analysisResults);
        
        // Generate recommendations
        this.generateRecommendations(analysisResults);

        // Save analysis to file
        await this.saveAnalysisResults(analysisResults);

        return analysisResults;
    }

    generateSummaryReport(results) {
        console.log('\n📊 ACCURACY SUMMARY\n');
        console.log('┌─────────────┬──────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
        console.log('│   Browser   │ Provider │ Detected    │ True Pos    │ False Pos   │ Precision   │');
        console.log('├─────────────┼──────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
        
        const browsers = ['chromium', 'firefox', 'webkit'];
        const providers = ['openai', 'gemini'];
        
        browsers.forEach(browser => {
            providers.forEach(provider => {
                const result = results[browser][provider];
                const precision = (result.accuracy.precision * 100).toFixed(1);
                console.log(`│ ${browser.padEnd(11)} │ ${provider.padEnd(8)} │ ${String(result.extractedCount).padEnd(11)} │ ${String(result.accuracy.truePositives).padEnd(11)} │ ${String(result.accuracy.falsePositives).padEnd(11)} │ ${precision.padEnd(10)}% │`);
            });
        });
        
        console.log('└─────────────┴──────────┴─────────────┴─────────────┴─────────────┴─────────────┘');

        // Overall statistics
        let totalOpenAIDetected = 0, totalGeminiDetected = 0;
        let totalOpenAITrue = 0, totalGeminiTrue = 0;
        let totalOpenAIFalse = 0, totalGeminiFalse = 0;

        browsers.forEach(browser => {
            totalOpenAIDetected += results[browser]['openai'].extractedCount;
            totalOpenAITrue += results[browser]['openai'].accuracy.truePositives;
            totalOpenAIFalse += results[browser]['openai'].accuracy.falsePositives;
            
            totalGeminiDetected += results[browser]['gemini'].extractedCount;
            totalGeminiTrue += results[browser]['gemini'].accuracy.truePositives;
            totalGeminiFalse += results[browser]['gemini'].accuracy.falsePositives;
        });

        console.log('\n🎯 OVERALL PERFORMANCE:');
        console.log(`Ground Truth: ${this.groundTruth.totalBugs} engineered bugs`);
        console.log(`OpenAI:  ${totalOpenAIDetected} detected | ${totalOpenAITrue} correct | ${totalOpenAIFalse} false positives | ${((totalOpenAITrue / totalOpenAIDetected) * 100).toFixed(1)}% precision`);
        console.log(`Gemini:  ${totalGeminiDetected} detected | ${totalGeminiTrue} correct | ${totalGeminiFalse} false positives | ${((totalGeminiTrue / totalGeminiDetected) * 100).toFixed(1)}% precision`);
    }

    generateDetailedFindings(results) {
        console.log('\n🔍 DETAILED FINDINGS\n');
        
        const browsers = ['chromium', 'firefox', 'webkit'];
        
        browsers.forEach(browser => {
            console.log(`\n🌐 ${browser.toUpperCase()} ANALYSIS:`);
            console.log('-'.repeat(50));
            
            ['openai', 'gemini'].forEach(provider => {
                const result = results[browser][provider];
                console.log(`\n${provider.toUpperCase()}:`);
                console.log(`  • Correctly Identified: ${result.matches.length}/${this.groundTruth.totalBugs}`);
                console.log(`  • False Positives: ${result.falsePositives.length}`);
                console.log(`  • Missed: ${result.missed.length}`);
                
                if (result.falsePositives.length > 0) {
                    console.log('  False Positives:');
                    result.falsePositives.forEach(fp => {
                        console.log(`    - ${fp.location}: ${fp.description}`);
                    });
                }
                
                if (result.missed.length > 0) {
                    console.log('  Missed Bugs:');
                    result.missed.forEach(missed => {
                        console.log(`    - ${missed.location}: ${missed.description}`);
                    });
                }
            });
        });
    }

    generateRecommendations(results) {
        console.log('\n💡 RECOMMENDATIONS\n');
        
        // Analyze patterns
        let openaiConsistentlyMisses = [];
        let geminiConsistentlyMisses = [];
        let geminiFrequentFalsePositives = [];
        
        // Calculate overall stats for recommendations
        const browsers = ['chromium', 'firefox', 'webkit'];
        let totalOpenAIDetected = 0, totalGeminiDetected = 0;
        let totalOpenAICorrect = 0, totalGeminiCorrect = 0;
        
        browsers.forEach(browser => {
            totalOpenAIDetected += results[browser]['openai'].extractedCount;
            totalOpenAICorrect += results[browser]['openai'].accuracy.truePositives;
            totalGeminiDetected += results[browser]['gemini'].extractedCount;
            totalGeminiCorrect += results[browser]['gemini'].accuracy.truePositives;
        });

        console.log('🎯 KEY INSIGHTS:');
        
        if (totalGeminiDetected > totalOpenAIDetected * 1.5) {
            console.log('• Gemini reports significantly more differences than OpenAI');
            console.log('  → This suggests Gemini may be more sensitive but less precise');
        }
        
        if (totalOpenAICorrect / totalOpenAIDetected > totalGeminiCorrect / totalGeminiDetected) {
            console.log('• OpenAI shows higher precision (fewer false positives)');
            console.log('  → OpenAI may be better for avoiding false alarms');
        }
        
        if (totalGeminiCorrect > totalOpenAICorrect) {
            console.log('• Gemini catches more actual bugs overall');
            console.log('  → Gemini may be better for comprehensive bug detection');
        }

        console.log('\n🚀 RECOMMENDATIONS:');
        console.log('1. Use both AI providers for maximum coverage');
        console.log('2. OpenAI for high-confidence, low-noise detection');
        console.log('3. Gemini for comprehensive scanning (with manual review)');
        console.log('4. Consider ensemble approach: flag items both AIs agree on');
    }

    async saveAnalysisResults(results) {
        const outputPath = path.join(process.cwd(), 'ai-visual-results', 'accuracy-analysis.json');
        
        const analysisReport = {
            timestamp: new Date().toISOString(),
            groundTruth: this.groundTruth,
            results: results,
            summary: this.calculateOverallSummary(results)
        };
        
        await fs.writeFile(outputPath, JSON.stringify(analysisReport, null, 2));
        console.log(`\n💾 Analysis saved to: ${outputPath}`);
    }

    calculateOverallSummary(results) {
        const browsers = ['chromium', 'firefox', 'webkit'];
        let openaiStats = { detected: 0, correct: 0, false: 0 };
        let geminiStats = { detected: 0, correct: 0, false: 0 };

        browsers.forEach(browser => {
            openaiStats.detected += results[browser]['openai'].extractedCount;
            openaiStats.correct += results[browser]['openai'].accuracy.truePositives;
            openaiStats.false += results[browser]['openai'].accuracy.falsePositives;
            
            geminiStats.detected += results[browser]['gemini'].extractedCount;
            geminiStats.correct += results[browser]['gemini'].accuracy.truePositives;
            geminiStats.false += results[browser]['gemini'].accuracy.falsePositives;
        });

        return {
            groundTruthBugs: this.groundTruth.totalBugs,
            openai: {
                ...openaiStats,
                precision: openaiStats.correct / openaiStats.detected || 0,
                recall: openaiStats.correct / this.groundTruth.totalBugs || 0
            },
            gemini: {
                ...geminiStats,
                precision: geminiStats.correct / geminiStats.detected || 0,
                recall: geminiStats.correct / this.groundTruth.totalBugs || 0
            }
        };
    }
}

// CLI execution
if (require.main === module) {
    const analyzer = new AIAccuracyAnalyzer();
    analyzer.generateComprehensiveReport()
        .then(() => {
            console.log('\n✨ AI Accuracy Analysis Complete!');
        })
        .catch(error => {
            console.error('\n💥 Analysis failed:', error);
            process.exit(1);
        });
}

module.exports = AIAccuracyAnalyzer; 