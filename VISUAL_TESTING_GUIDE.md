# Visual Testing Comparison Guide

This guide demonstrates the difference between traditional UI testing and AI-powered visual testing using Cypress and Applitools Eyes.

## Setup Instructions

### 1. Set Your Applitools API Key

You need to set your Applitools API key as an environment variable:

```bash
# Option 1: Set for current session
export APPLITOOLS_API_KEY="your_api_key_here"

# Option 2: Add to your shell profile (recommended)
echo 'export APPLITOOLS_API_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc

# Option 3: Set when running tests
APPLITOOLS_API_KEY="your_api_key_here" npm run test:visual
```

**Get your API key:** [Sign up at Applitools](https://applitools.com/users/register)

### 2. Ensure Dev Server is Running

```bash
npm run dev
```

The server should be running on `http://localhost:3000`

## Running the Tests

### Traditional Testing Only
```bash
npm run test:traditional
```
This runs all traditional Cypress tests (auth, shopping, UI interactions)

### AI Visual Testing Only
```bash
npm run test:visual
```
This runs the Applitools visual comparison tests

### Complete Comparison
```bash
npm run test:comparison
```
This runs both traditional and visual tests in sequence

### Interactive Demo
```bash
npm run test:visual-demo
```
This runs the visual tests in headed mode so you can watch the comparison

## What the Tests Demonstrate

### Traditional Testing Limitations

The traditional test (`Traditional Cypress Testing`) will:
- ✅ **PASS** all functional assertions
- ✅ Check that elements exist and are clickable
- ✅ Verify navigation works
- ✅ Confirm modal opens and closes
- ❌ **MISS** visual layout bugs completely

Even with the CSS bug injected, traditional tests pass because:
- Elements are still findable
- Functionality still works
- Only the visual layout is broken

### AI Vision Testing Power

The Applitools test (`AI Vision Testing`) will:
- 🤖 **Detect** visual layout differences
- 📸 Capture baseline screenshots
- 🔍 Compare pixel-by-pixel with AI analysis
- ❌ **FAIL** when layout doesn't match baseline
- 📊 Provide detailed visual diff reports

## The CSS Bug Being Tested

The test injects this visual bug:

```css
/* Working Layout */
.modal-overlay {
  top: 0;
  left: 0;
}
.card {
  margin-left: 0;
}

/* Buggy Layout */
.modal-overlay {
  top: 50px;    /* Creates gap at top */
  left: 50px;   /* Creates gap at left */
}
.card {
  margin-left: 50px;  /* Misaligns all cards */
}
```

## Test Results Interpretation

### Expected Results:

1. **Traditional Test**: ✅ PASS (despite visual bugs)
2. **AI Vision Test**: ❌ FAIL (detects visual differences)

### What This Proves:

- **Traditional testing** is excellent for functional validation
- **AI vision testing** is essential for visual regression detection
- **Combined approach** provides comprehensive coverage

## Viewing Results

### Applitools Dashboard
1. Go to [eyes.applitools.com](https://eyes.applitools.com)
2. Log in with your account
3. View your test results with visual diffs
4. See exactly what changed between baseline and test

### Local Results
- Cypress videos: `cypress/videos/`
- Screenshots: `cypress/screenshots/`
- Console output shows test status

## Research Applications

This setup enables research into:

1. **Detection Rates**: How many visual bugs does each approach catch?
2. **False Positives**: How often do tests fail incorrectly?
3. **Maintenance**: How much effort is required to maintain each type of test?
4. **Speed**: How long does each approach take?
5. **Cost**: What are the resource requirements?

## Advanced Usage

### Custom Bug Testing
```bash
# Inject specific bugs
npm run inject:bug ui-misalignment
npm run test:visual
npm run restore:bugs

# Test other bugs
npm run inject:bug modal-not-closing
npm run test:traditional  # Should pass
npm run test:visual       # Should detect if visual impact
```

### Batch Testing
```bash
# Set batch name for organized results
APPLITOOLS_BATCH_NAME="Layout Regression Study" npm run test:visual
```

## Troubleshooting

### Common Issues:

1. **API Key Error**: Ensure `APPLITOOLS_API_KEY` is set correctly
2. **Port Issues**: Make sure dev server is on port 3000
3. **Permission Errors**: Check file permissions for bug injection scripts
4. **Network Issues**: Applitools requires internet connection

### Debug Commands:
```bash
# Check environment
echo $APPLITOOLS_API_KEY

# Verify server
curl http://localhost:3000

# Manual bug injection
node scripts/inject-bugs.js list
node scripts/inject-bugs.js inject ui-misalignment
node scripts/inject-bugs.js restore
```

## Contributing to Research

This setup supports ongoing research into AI-powered testing. Consider documenting:
- Bug detection rates
- Time-to-detection comparisons
- Maintenance overhead
- Developer experience feedback

---

**Note**: This is a research environment designed to compare testing methodologies. The visual bugs are intentionally injected for demonstration purposes. 