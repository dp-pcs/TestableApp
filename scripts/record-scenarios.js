import fs from 'fs'
import path from 'path'

// Video recording scenarios for AI testing
const scenarios = [
  {
    id: 'login-success',
    name: 'Successful Login Flow',
    description: 'User logs in with correct credentials and navigates to home page',
    category: 'working',
    steps: [
      '1. Navigate to /login',
      '2. Enter email: test@example.com',
      '3. Enter password: password123',
      '4. Click Login button',
      '5. Verify redirect to home page',
      '6. Verify "Welcome to TestableApp" is visible'
    ],
    expectedOutcome: 'User successfully logs in and reaches home page',
    duration: '30-45 seconds'
  },
  {
    id: 'login-failure-bug',
    name: 'Login Always Fails (Bug Injected)',
    description: 'User enters correct credentials but login fails due to injected bug',
    category: 'broken',
    bugToInject: 'login-always-fails',
    steps: [
      '1. Inject login bug: node scripts/inject-bugs.js inject login-always-fails',
      '2. Navigate to /login',
      '3. Enter email: test@example.com',
      '4. Enter password: password123',
      '5. Click Login button',
      '6. Observe error message appears',
      '7. User remains on login page'
    ],
    expectedOutcome: 'Login fails with error message despite correct credentials',
    duration: '30-45 seconds'
  },
  {
    id: 'modal-interaction-working',
    name: 'Modal Interactions Working',
    description: 'Modal opens, closes with Escape key, close button, and outside clicks',
    category: 'working',
    steps: [
      '1. Navigate to home page',
      '2. Click "Learn More" button',
      '3. Verify modal opens',
      '4. Press Escape key',
      '5. Verify modal closes',
      '6. Click "Learn More" again',
      '7. Click outside modal area',
      '8. Verify modal closes',
      '9. Click "Learn More" again',
      '10. Click X button',
      '11. Verify modal closes'
    ],
    expectedOutcome: 'Modal responds correctly to all closing methods',
    duration: '45-60 seconds'
  },
  {
    id: 'modal-interaction-broken',
    name: 'Modal Interactions Broken (Bug Injected)',
    description: 'Modal opens but does not close with Escape key or outside clicks',
    category: 'broken',
    bugToInject: 'modal-not-closing',
    steps: [
      '1. Inject modal bug: node scripts/inject-bugs.js inject modal-not-closing',
      '2. Navigate to home page',
      '3. Click "Learn More" button',
      '4. Verify modal opens',
      '5. Press Escape key',
      '6. Observe modal does NOT close',
      '7. Click outside modal area',
      '8. Observe modal does NOT close',
      '9. Click X button (only way to close)',
      '10. Verify modal closes'
    ],
    expectedOutcome: 'Modal fails to close with Escape or outside clicks, only X button works',
    duration: '45-60 seconds'
  },
  {
    id: 'cart-calculation-working',
    name: 'Shopping Cart Calculation Working',
    description: 'Add items to cart and verify correct price calculations',
    category: 'working',
    steps: [
      '1. Navigate to /shop',
      '2. Add Wireless Headphones ($99.99) to cart',
      '3. Observe quantity indicator shows 1',
      '4. Navigate to /cart',
      '5. Verify item shows $99.99',
      '6. Click increase quantity to 2',
      '7. Verify subtotal shows $199.98',
      '8. Verify total shows $199.98',
      '9. Add different item (Smart Watch $199.99)',
      '10. Verify total shows $399.97'
    ],
    expectedOutcome: 'All calculations are mathematically correct',
    duration: '60-75 seconds'
  },
  {
    id: 'cart-calculation-broken',
    name: 'Shopping Cart Calculation Broken (Bug Injected)',
    description: 'Cart calculates totals incorrectly by squaring quantities',
    category: 'broken',
    bugToInject: 'cart-calculation-wrong',
    steps: [
      '1. Inject cart bug: node scripts/inject-bugs.js inject cart-calculation-wrong',
      '2. Navigate to /shop',
      '3. Add Wireless Headphones ($99.99) to cart',
      '4. Navigate to /cart',
      '5. Verify item shows $99.99 (quantity 1, appears correct)',
      '6. Click increase quantity to 2',
      '7. Observe subtotal shows $399.96 (99.99 × 2 × 2 = wrong!)',
      '8. Observe total shows $399.96 (should be $199.98)',
      '9. Increase to quantity 3',
      '10. Observe subtotal shows $899.91 (99.99 × 3 × 3 = wrong!)'
    ],
    expectedOutcome: 'Calculations are mathematically incorrect, scaling quadratically',
    duration: '60-75 seconds'
  },
  {
    id: 'visual-layout-working',
    name: 'Visual Layout Working',
    description: 'All elements are properly aligned and positioned',
    category: 'working',
    steps: [
      '1. Navigate to home page',
      '2. Observe feature cards are properly aligned',
      '3. Click "Learn More" to open modal',
      '4. Observe modal is centered on screen',
      '5. Close modal',
      '6. Navigate to /login',
      '7. Observe login form is centered',
      '8. Navigate to /shop',
      '9. Observe product cards are evenly spaced',
      '10. Scroll through entire page'
    ],
    expectedOutcome: 'All elements are visually aligned and professional',
    duration: '45-60 seconds'
  },
  {
    id: 'visual-layout-broken',
    name: 'Visual Layout Broken (Bug Injected)',
    description: 'Cards are misaligned and modal overlay is incorrectly positioned',
    category: 'broken',
    bugToInject: 'ui-misalignment',
    steps: [
      '1. Inject UI bug: node scripts/inject-bugs.js inject ui-misalignment',
      '2. Navigate to home page',
      '3. Observe feature cards are shifted right (misaligned)',
      '4. Click "Learn More" to open modal',
      '5. Observe modal overlay has gaps at top and left',
      '6. Close modal',
      '7. Navigate to /login',
      '8. Observe login card is shifted right',
      '9. Navigate to /shop',
      '10. Observe all product cards are misaligned'
    ],
    expectedOutcome: 'Visual elements are clearly misaligned and unprofessional',
    duration: '45-60 seconds'
  },
  {
    id: 'theme-toggle-working',
    name: 'Theme Toggle Working',
    description: 'Dark/light mode toggle works correctly with persistence',
    category: 'working',
    steps: [
      '1. Navigate to home page (should start in light mode)',
      '2. Click theme toggle button (🌙)',
      '3. Verify page switches to dark mode',
      '4. Verify button shows (☀️)',
      '5. Navigate to /shop',
      '6. Verify dark mode persists',
      '7. Reload page',
      '8. Verify still in dark mode',
      '9. Click theme toggle again',
      '10. Verify switches back to light mode'
    ],
    expectedOutcome: 'Theme toggle works consistently and persists across navigation',
    duration: '45-60 seconds'
  },
  {
    id: 'form-validation-working',
    name: 'Form Validation Working',
    description: 'Registration form shows appropriate validation errors',
    category: 'working',
    steps: [
      '1. Navigate to /register',
      '2. Click "Create Account" without filling fields',
      '3. Observe multiple validation errors appear',
      '4. Fill first name: "John"',
      '5. Observe first name error disappears',
      '6. Fill email: "invalid-email"',
      '7. Observe email format error',
      '8. Fix email: "john@example.com"',
      '9. Fill password: "weak"',
      '10. Observe password strength error',
      '11. Fill strong password: "Password123"',
      '12. Fill confirm password: "Different123"',
      '13. Observe password mismatch error'
    ],
    expectedOutcome: 'Form validation provides helpful, real-time feedback',
    duration: '60-75 seconds'
  }
]

function generateRecordingGuide() {
  const guide = `# Video Recording Guide for AI Testing

## Overview
This guide helps you record consistent, high-quality videos for AI vision model testing. Each scenario should be recorded twice: once with working functionality and once with bugs injected.

## Technical Requirements
- **Resolution**: 1280x720 (720p)
- **Frame Rate**: 30 FPS
- **Duration**: 30-75 seconds per scenario
- **Format**: MP4 (H.264 encoding preferred)
- **Browser**: Chrome (consistent rendering)
- **Window Size**: Full screen or maximized browser

## Recording Setup
1. Start the application: \`npm run dev\`
2. Open Chrome and navigate to http://localhost:3000
3. Set browser zoom to 100%
4. Clear browser data (localStorage, cookies) for consistent starting state
5. Start screen recording software
6. Execute scenario steps slowly and deliberately
7. Stop recording after completing all steps

## Scenarios to Record

${scenarios.map(scenario => `
### ${scenario.name} (${scenario.category})
**File**: \`videos/${scenario.category}/${scenario.id}.mp4\`
**Duration**: ${scenario.duration}

${scenario.bugToInject ? `**⚠️ Bug to Inject**: \`${scenario.bugToInject}\`\n` : ''}
**Description**: ${scenario.description}

**Steps**:
${scenario.steps.map(step => `- ${step}`).join('\n')}

**Expected Outcome**: ${scenario.expectedOutcome}

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---`).join('')}

## Post-Recording Checklist
- [ ] Video is 720p resolution
- [ ] All interactions are clearly visible
- [ ] Video duration is appropriate (30-75 seconds)
- [ ] File named correctly: \`videos/{category}/{scenario-id}.mp4\`
- [ ] Bug injected scenarios show clear failure behavior
- [ ] Working scenarios show successful completion

## AI Testing Preparation
After recording all videos:
1. Organize files in \`videos/working/\` and \`videos/broken/\` folders
2. Test video playback quality
3. Prepare prompts for AI models using \`ai-testing/prompts.md\`
4. Ready for AI vision model testing phase
`

  return guide
}

function listScenarios() {
  console.log('📹 Video Recording Scenarios:\n')
  
  const workingScenarios = scenarios.filter(s => s.category === 'working')
  const brokenScenarios = scenarios.filter(s => s.category === 'broken')
  
  console.log('✅ WORKING SCENARIOS:')
  workingScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`)
    console.log(`   Duration: ${scenario.duration}`)
    console.log(`   File: videos/working/${scenario.id}.mp4\n`)
  })
  
  console.log('❌ BROKEN SCENARIOS (with bugs):')
  brokenScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`)
    console.log(`   Bug: ${scenario.bugToInject}`)
    console.log(`   Duration: ${scenario.duration}`)
    console.log(`   File: videos/broken/${scenario.id}.mp4\n`)
  })
  
  console.log(`Total scenarios: ${scenarios.length}`)
  console.log('Estimated recording time: 8-12 minutes per scenario (including setup)')
}

function getScenario(id) {
  const scenario = scenarios.find(s => s.id === id)
  if (!scenario) {
    console.error(`Scenario "${id}" not found.`)
    return
  }
  
  console.log(`📹 Recording: ${scenario.name}`)
  console.log(`Category: ${scenario.category}`)
  console.log(`Duration: ${scenario.duration}`)
  
  if (scenario.bugToInject) {
    console.log(`\n⚠️  FIRST: Inject bug with: node scripts/inject-bugs.js inject ${scenario.bugToInject}`)
  }
  
  console.log(`\n📝 Steps:`)
  scenario.steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`)
  })
  
  console.log(`\n🎯 Expected Outcome: ${scenario.expectedOutcome}`)
  console.log(`\n💾 Save as: videos/${scenario.category}/${scenario.id}.mp4`)
  
  if (scenario.bugToInject) {
    console.log(`\n🔄 AFTER RECORDING: Restore with: node scripts/inject-bugs.js restore ${scenario.bugToInject}`)
  }
}

// Command line interface
const command = process.argv[2]
const scenarioId = process.argv[3]

switch (command) {
  case 'list':
    listScenarios()
    break
  case 'scenario':
    if (!scenarioId) {
      console.error('Please specify a scenario ID')
      listScenarios()
    } else {
      getScenario(scenarioId)
    }
    break
  case 'guide':
    const guide = generateRecordingGuide()
    fs.writeFileSync('docs/RECORDING_GUIDE.md', guide)
    console.log('📖 Recording guide saved to docs/RECORDING_GUIDE.md')
    break
  default:
    console.log('Usage:')
    console.log('  node scripts/record-scenarios.js list           # List all scenarios')
    console.log('  node scripts/record-scenarios.js scenario <id>  # Get specific scenario details')
    console.log('  node scripts/record-scenarios.js guide          # Generate recording guide')
    console.log('\nExample:')
    console.log('  node scripts/record-scenarios.js scenario login-success')
    break
}

export { scenarios }