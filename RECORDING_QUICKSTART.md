# 🎬 Quick Start: Video Recording for AI Testing

## Setup (5 minutes)
1. **Start the app**: `npm run dev`
2. **Open Chrome**: Navigate to http://localhost:3000
3. **Clear browser data**: Settings > Privacy > Clear browsing data
4. **Set recording**: 1280x720, 30fps, MP4 format

## Recording Process

### 1. Working Scenarios (Record First)
```bash
# Get detailed steps for each scenario
node scripts/record-scenarios.js scenario login-success
node scripts/record-scenarios.js scenario modal-interaction-working
node scripts/record-scenarios.js scenario cart-calculation-working
node scripts/record-scenarios.js scenario visual-layout-working
node scripts/record-scenarios.js scenario theme-toggle-working
node scripts/record-scenarios.js scenario form-validation-working
```

### 2. Broken Scenarios (Inject Bugs)
```bash
# Example: Login bug scenario
node scripts/inject-bugs.js inject login-always-fails
node scripts/record-scenarios.js scenario login-failure-bug
# Record the scenario
node scripts/inject-bugs.js restore login-always-fails

# Repeat for other bugs:
# modal-not-closing, cart-calculation-wrong, ui-misalignment
```

## Recording Tips
- **Move slowly**: Allow 2-3 seconds between actions
- **Show results**: Pause after clicks to show responses
- **Keep cursor visible**: Don't move off-screen during interactions
- **Full workflow**: Complete entire scenario end-to-end

## File Organization
```
videos/
├── working/
│   ├── login-success.mp4
│   ├── modal-interaction-working.mp4
│   ├── cart-calculation-working.mp4
│   ├── visual-layout-working.mp4
│   ├── theme-toggle-working.mp4
│   └── form-validation-working.mp4
└── broken/
    ├── login-failure-bug.mp4
    ├── modal-interaction-broken.mp4
    ├── cart-calculation-broken.mp4
    └── visual-layout-broken.mp4
```

## Next Steps
After recording all videos:
1. **Review quality**: Check all videos play correctly
2. **Test AI models**: Use prompts from `ai-testing/prompts.md`
3. **Track results**: Update `ai-testing/benchmark-tracker.md`

**Total time needed**: ~2-3 hours for all recordings