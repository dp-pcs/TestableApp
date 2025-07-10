const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

/**
 * PERCY RESULTS EXPORT
 * 
 * Helps manually document what Percy actually detected vs what we expected
 * Creates a form to fill out detection results for accurate analysis
 */

class PercyResultsExport {
    constructor() {
        this.config = {
            outputDir: path.join(process.cwd(), 'percy-accuracy-results'),
            percyDashboardUrl: 'https://percy.io/27df0096/web/TestableApp-c7f9047d'
        };
        
        // Known bugs from our injection
        this.knownBugs = [
            {
                id: 'techcorp-logo-color',
                description: 'TechCorp Solutions header logo color changed from white to red',
                location: 'Header Logo Text',
                browsers: ['all'],
                severity: 'major',
                type: 'color-change',
                expectedDetection: 'High - Color changes are Percy\'s strength'
            },
            {
                id: 'home-title-purple',
                description: 'Homepage title oversized and purple with underline',
                location: 'Home page H1 title',
                browsers: ['all'],
                severity: 'major',
                type: 'style-change',
                expectedDetection: 'High - Major visual change'
            },
            {
                id: 'subtitle-misalignment',
                description: 'Innovation Meets Excellence subtitle margin shift',
                location: 'Hero section subtitle',
                browsers: ['all'],
                severity: 'minor',
                type: 'layout-shift',
                expectedDetection: 'Medium - Layout shifts visible but subtle'
            },
            {
                id: 'missing-card-shadows',
                description: 'Missing box-shadow on first 3 Core Services cards',
                location: 'Services section cards',
                browsers: ['all'],
                severity: 'minor',
                type: 'missing-effect',
                expectedDetection: 'Medium - Shadow differences are detectable'
            },
            {
                id: 'cta-button-shape',
                description: 'CTA Button border-radius from rounded to square',
                location: 'Hero section Get Started button',
                browsers: ['all'],
                severity: 'minor',
                type: 'style-change',
                expectedDetection: 'High - Shape changes are obvious'
            },
            {
                id: 'cta-button-position',
                description: 'CTA Button shifted 30px to the right',
                location: 'Hero section Get Started button',
                browsers: ['all'],
                severity: 'minor',
                type: 'layout-shift',
                expectedDetection: 'High - Position changes are visible'
            },
            {
                id: 'inconsistent-font-sizes',
                description: 'Service titles have inconsistent font sizes',
                location: 'Cybersecurity and Data Analytics titles',
                browsers: ['all'],
                severity: 'minor',
                type: 'typography',
                expectedDetection: 'Low - Font size differences are subtle'
            },
            {
                id: 'stats-label-opacity',
                description: 'Statistics section labels much fainter',
                location: 'Stats section label text',
                browsers: ['all'],
                severity: 'minor',
                type: 'visual-effect',
                expectedDetection: 'Medium - Opacity changes are visible'
            },
            {
                id: 'team-background-color',
                description: 'Team section background color slightly changed',
                location: 'Team section background',
                browsers: ['all'],
                severity: 'minor',
                type: 'color-change',
                expectedDetection: 'Low - Very subtle color differences'
            },
            {
                id: 'contact-button-overlap',
                description: 'Contact form submit button overlapping input field',
                location: 'Contact form submit button',
                browsers: ['all'],
                severity: 'major',
                type: 'layout-overlap',
                expectedDetection: 'High - Overlapping elements are obvious'
            },
            {
                id: 'modal-overlay-gaps',
                description: 'Modal overlay has gaps at top and left (from CSS bug)',
                location: 'Modal overlay positioning',
                browsers: ['all'],
                severity: 'major',
                type: 'layout-bug',
                expectedDetection: 'High - Layout bugs are very visible'
            },
            {
                id: 'cards-misaligned',
                description: 'All cards shifted 50px to the right (CSS bug)',
                location: 'All card elements',
                browsers: ['all'],
                severity: 'major',
                type: 'layout-bug',
                expectedDetection: 'High - Major layout shifts are obvious'
            }
        ];
    }

    async generateDetectionForm() {
        console.log('📋 GENERATING PERCY DETECTION FORM');
        console.log('=' .repeat(60));
        
        // Create output directory
        await fs.mkdir(this.config.outputDir, { recursive: true });
        
        const form = await this.createDetectionForm();
        const formPath = path.join(this.config.outputDir, 'percy-detection-form.html');
        await fs.writeFile(formPath, form);
        
        console.log('\n✅ Detection form created!');
        console.log(`📄 Form: ${formPath}`);
        console.log(`🌐 View at: http://localhost:3000/percy-accuracy-results/percy-detection-form.html`);
        console.log('\n📋 Instructions:');
        console.log('1. Open Percy dashboard: https://percy.io/27df0096/web/TestableApp-c7f9047d');
        console.log('2. Open the detection form in your browser');
        console.log('3. For each bug, check if Percy detected it');
        console.log('4. Click "Generate Report" to get accuracy metrics');
        
        return formPath;
    }

    async createDetectionForm() {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Percy Detection Verification Form</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #663399; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .instructions { background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .bug-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; background: #f8f9fa; }
        .bug-major { border-left: 4px solid #dc3545; }
        .bug-minor { border-left: 4px solid #ffc107; }
        .detection-options { margin: 10px 0; }
        .detection-options label { display: block; margin: 5px 0; cursor: pointer; }
        .results { background: #d4edda; padding: 15px; border-radius: 8px; margin-top: 20px; display: none; }
        .accuracy-metric { text-align: center; padding: 10px; background: white; border-radius: 5px; margin: 5px; display: inline-block; min-width: 150px; }
        .percy-link { background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .percy-link:hover { background: #218838; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        .generate-btn { background: #007bff; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 20px 0; }
        .generate-btn:hover { background: #0056b3; }
        .expected { color: #6c757d; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Percy Detection Verification</h1>
        <p>Manual verification of Percy's visual regression detection capabilities</p>
        <a href="${this.config.percyDashboardUrl}" target="_blank" class="percy-link">🔗 Open Percy Dashboard</a>
    </div>

    <div class="instructions">
        <h3>📋 Instructions:</h3>
        <ol>
            <li><strong>Open Percy Dashboard:</strong> Click the link above to view Percy's detected changes</li>
            <li><strong>Review Each Bug:</strong> For each bug below, check if Percy detected the visual difference</li>
            <li><strong>Mark Detection Status:</strong> Select whether Percy successfully detected each bug</li>
            <li><strong>Add Notes:</strong> Document what Percy actually showed vs what we expected</li>
            <li><strong>Generate Report:</strong> Click the button to calculate accuracy metrics</li>
        </ol>
    </div>

    <form id="detectionForm">
        ${this.knownBugs.map((bug, index) => `
            <div class="bug-card ${bug.severity === 'major' ? 'bug-major' : 'bug-minor'}">
                <h3>Bug #${index + 1}: ${bug.description}</h3>
                <p><strong>Location:</strong> <code>${bug.location}</code></p>
                <p><strong>Browsers Affected:</strong> ${bug.browsers.join(', ')}</p>
                <p><strong>Severity:</strong> ${bug.severity.toUpperCase()} | <strong>Type:</strong> ${bug.type}</p>
                <p class="expected"><strong>Expected Detection:</strong> ${bug.expectedDetection}</p>
                
                <div class="detection-options">
                    <strong>Did Percy detect this bug?</strong>
                    <label>
                        <input type="radio" name="bug_${index}" value="detected"> 
                        ✅ Yes - Percy clearly detected this change
                    </label>
                    <label>
                        <input type="radio" name="bug_${index}" value="partial"> 
                        ⚠️ Partially - Percy detected something but unclear if this specific bug
                    </label>
                    <label>
                        <input type="radio" name="bug_${index}" value="missed"> 
                        ❌ No - Percy missed this bug completely
                    </label>
                    <label>
                        <input type="radio" name="bug_${index}" value="unsure"> 
                        ❓ Unsure - Cannot determine from Percy dashboard
                    </label>
                </div>
                
                <div>
                    <label><strong>Notes (what did Percy actually show?):</strong></label>
                    <textarea name="notes_${index}" rows="2" style="width: 100%; margin-top: 5px;" placeholder="Describe what Percy detected or missed..."></textarea>
                </div>
            </div>
        `).join('')}
        
        <button type="button" class="generate-btn" onclick="generateAccuracyReport()">
            📊 Generate Accuracy Report
        </button>
    </form>

    <div id="results" class="results">
        <h2>🎯 Percy Accuracy Results</h2>
        <div id="metrics"></div>
        <div id="detailed-results"></div>
    </div>

    <script>
        function generateAccuracyReport() {
            const form = document.getElementById('detectionForm');
            const formData = new FormData(form);
            
            const bugs = ${JSON.stringify(this.knownBugs)};
            let detected = 0;
            let partial = 0;
            let missed = 0;
            let unsure = 0;
            
            const detailedResults = [];
            
            bugs.forEach((bug, index) => {
                const detection = formData.get(\`bug_\${index}\`);
                const notes = formData.get(\`notes_\${index}\`) || 'No notes provided';
                
                detailedResults.push({
                    bug: bug,
                    detection: detection,
                    notes: notes
                });
                
                switch(detection) {
                    case 'detected': detected++; break;
                    case 'partial': partial++; break;
                    case 'missed': missed++; break;
                    case 'unsure': unsure++; break;
                }
            });
            
            const total = bugs.length;
            const detectionRate = Math.round((detected / total) * 100);
            const partialRate = Math.round((partial / total) * 100);
            const missRate = Math.round((missed / total) * 100);
            
            // Show results
            document.getElementById('results').style.display = 'block';
            
            document.getElementById('metrics').innerHTML = \`
                <div class="accuracy-metric">
                    <h3>Overall Detection Rate</h3>
                    <p><strong>\${detectionRate}%</strong></p>
                    <small>(\${detected}/\${total} bugs detected)</small>
                </div>
                <div class="accuracy-metric">
                    <h3>Partial Detections</h3>
                    <p><strong>\${partialRate}%</strong></p>
                    <small>(\${partial}/\${total} bugs)</small>
                </div>
                <div class="accuracy-metric">
                    <h3>Missed Bugs</h3>
                    <p><strong>\${missRate}%</strong></p>
                    <small>(\${missed}/\${total} bugs)</small>
                </div>
                <div class="accuracy-metric">
                    <h3>Unsure/Unclear</h3>
                    <p><strong>\${Math.round((unsure / total) * 100)}%</strong></p>
                    <small>(\${unsure}/\${total} bugs)</small>
                </div>
            \`;
            
            let detailedHtml = '<h3>📋 Detailed Results:</h3>';
            detailedResults.forEach((result, index) => {
                const statusEmoji = {
                    'detected': '✅',
                    'partial': '⚠️',
                    'missed': '❌',
                    'unsure': '❓'
                };
                
                detailedHtml += \`
                    <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; background: white;">
                        <strong>\${statusEmoji[result.detection] || '❓'} Bug #\${index + 1}:</strong> \${result.bug.description}<br>
                        <strong>Status:</strong> \${result.detection || 'Not answered'}<br>
                        <strong>Notes:</strong> \${result.notes}
                    </div>
                \`;
            });
            
            document.getElementById('detailed-results').innerHTML = detailedHtml;
            
            // Save results to localStorage
            localStorage.setItem('percyAccuracyResults', JSON.stringify({
                timestamp: new Date().toISOString(),
                metrics: { detected, partial, missed, unsure, total, detectionRate },
                detailedResults: detailedResults
            }));
            
            alert(\`✅ Results Generated!\\n\\nPercy Detection Rate: \${detectionRate}%\\nResults saved and displayed below.\`);
        }
        
        // Load saved results if available
        window.onload = function() {
            const saved = localStorage.getItem('percyAccuracyResults');
            if (saved) {
                const data = JSON.parse(saved);
                // Could auto-populate form with saved data if needed
            }
        };
    </script>
</body>
</html>`;
    }
}

// CLI execution
if (require.main === module) {
    const exporter = new PercyResultsExport();
    exporter.generateDetectionForm()
        .then((formPath) => {
            console.log('\n🎉 Percy detection form ready!');
            console.log('\n🔗 Open these links:');
            console.log('1. Percy Dashboard: https://percy.io/27df0096/web/TestableApp-c7f9047d');
            console.log('2. Detection Form: http://localhost:3000/percy-accuracy-results/percy-detection-form.html');
            console.log('\n📝 Fill out the form to get real accuracy metrics!');
        })
        .catch(error => {
            console.error('\n💥 Form generation failed:', error);
        });
}

module.exports = PercyResultsExport; 