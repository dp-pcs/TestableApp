
## Overview

**Goal:** Measure the effectiveness of traditional vs. AI testing tools before and after bug injection.

**Phases:**
1. Baseline (clean site)
2. Bugged (site with known issues)
3. Compare results across tools

---

## Phase 1: Baseline Test (Clean Site)

### 1. Manual Test
- Start the app:
  ```
  npm run dev
  ```
- In your browser, walk through:
  - Home → Shop → Add to Cart → Checkout
  - Login and Register flows
  - Open and close modal
  - Toggle theme
- Confirm everything works as expected

### 2. Cypress Test
- Run:
  ```
  npm run test
  ```
- Note: All tests should pass
- Optional: Review screenshots/videos in `/cypress/videos/`

### 3. AI Vision Test (GPT-4o or Claude 3.5)
- Record a 30–60s screen recording (e.g., with Loom or OBS)
- Prompt example:
  > Watch this flow on our website. Identify any visual or functional issues. Is everything working as expected?
- Submit the video to GPT-4o
- Save the response to `/docs/analysis-clean.json`

---

## Phase 2: Bug Injection Test

### 1. Inject Bugs
Run the following to inject predefined bugs:
```
node scripts/inject-bugs.js inject modal-not-closing
node scripts/inject-bugs.js inject cart-calculation-wrong
```

### 2. Manual Re-Test
- Repeat all flows manually
- Note any differences or obvious bugs

### 3. Cypress Re-Test
- Re-run:
  ```
  npm run test
  ```
- Check which tests failed and what was caught

### 4. AI Vision Re-Test
- Record a new video with the same flow
- Use a structured prompt:
  > Watch this video and identify any issues with UI behavior or visual layout.
- Submit to GPT-4o or Claude
- Save results to `/docs/analysis-bugged.json`

---

## Phase 3: Compare Results

Create a comparison table like:

| Bug Name            | Human Saw | Cypress | GPT-4o | Applitools | Notes |
|---------------------|-----------|---------|--------|------------|-------|
| modal-not-closing   | ✅        | ❌      | ✅     | ✅         | Cypress didn’t test backdrop clicks |
| cart-calculation-wrong | ✅     | ✅      | ✅     | ❌         | Applitools missed logic-only bug    |

---

## Optional: Restore Clean State

Restore all files to clean version:
```
node scripts/inject-bugs.js restore
```

---

## Next Steps
- Add new `.buggy` components for AI-specific bugs
- Automate AI submission script
- Publish report from `/docs/report-draft.md` using:
  ```
  npx md-to-pdf docs/report-draft.md
  ```
