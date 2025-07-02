# Video Recording Guide for AI Testing

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
1. Start the application: `npm run dev`
2. Open Chrome and navigate to http://localhost:3000
3. Set browser zoom to 100%
4. Clear browser data (localStorage, cookies) for consistent starting state
5. Start screen recording software
6. Execute scenario steps slowly and deliberately
7. Stop recording after completing all steps

## Scenarios to Record


### Successful Login Flow (working)
**File**: `videos/working/login-success.mp4`
**Duration**: 30-45 seconds


**Description**: User logs in with correct credentials and navigates to home page

**Steps**:
- 1. Navigate to /login
- 2. Enter email: test@example.com
- 3. Enter password: password123
- 4. Click Login button
- 5. Verify redirect to home page
- 6. Verify "Welcome to TestableApp" is visible

**Expected Outcome**: User successfully logs in and reaches home page

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Login Always Fails (Bug Injected) (broken)
**File**: `videos/broken/login-failure-bug.mp4`
**Duration**: 30-45 seconds

**⚠️ Bug to Inject**: `login-always-fails`

**Description**: User enters correct credentials but login fails due to injected bug

**Steps**:
- 1. Inject login bug: node scripts/inject-bugs.js inject login-always-fails
- 2. Navigate to /login
- 3. Enter email: test@example.com
- 4. Enter password: password123
- 5. Click Login button
- 6. Observe error message appears
- 7. User remains on login page

**Expected Outcome**: Login fails with error message despite correct credentials

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Modal Interactions Working (working)
**File**: `videos/working/modal-interaction-working.mp4`
**Duration**: 45-60 seconds


**Description**: Modal opens, closes with Escape key, close button, and outside clicks

**Steps**:
- 1. Navigate to home page
- 2. Click "Learn More" button
- 3. Verify modal opens
- 4. Press Escape key
- 5. Verify modal closes
- 6. Click "Learn More" again
- 7. Click outside modal area
- 8. Verify modal closes
- 9. Click "Learn More" again
- 10. Click X button
- 11. Verify modal closes

**Expected Outcome**: Modal responds correctly to all closing methods

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Modal Interactions Broken (Bug Injected) (broken)
**File**: `videos/broken/modal-interaction-broken.mp4`
**Duration**: 45-60 seconds

**⚠️ Bug to Inject**: `modal-not-closing`

**Description**: Modal opens but does not close with Escape key or outside clicks

**Steps**:
- 1. Inject modal bug: node scripts/inject-bugs.js inject modal-not-closing
- 2. Navigate to home page
- 3. Click "Learn More" button
- 4. Verify modal opens
- 5. Press Escape key
- 6. Observe modal does NOT close
- 7. Click outside modal area
- 8. Observe modal does NOT close
- 9. Click X button (only way to close)
- 10. Verify modal closes

**Expected Outcome**: Modal fails to close with Escape or outside clicks, only X button works

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Shopping Cart Calculation Working (working)
**File**: `videos/working/cart-calculation-working.mp4`
**Duration**: 60-75 seconds


**Description**: Add items to cart and verify correct price calculations

**Steps**:
- 1. Navigate to /shop
- 2. Add Wireless Headphones ($99.99) to cart
- 3. Observe quantity indicator shows 1
- 4. Navigate to /cart
- 5. Verify item shows $99.99
- 6. Click increase quantity to 2
- 7. Verify subtotal shows $199.98
- 8. Verify total shows $199.98
- 9. Add different item (Smart Watch $199.99)
- 10. Verify total shows $399.97

**Expected Outcome**: All calculations are mathematically correct

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Shopping Cart Calculation Broken (Bug Injected) (broken)
**File**: `videos/broken/cart-calculation-broken.mp4`
**Duration**: 60-75 seconds

**⚠️ Bug to Inject**: `cart-calculation-wrong`

**Description**: Cart calculates totals incorrectly by squaring quantities

**Steps**:
- 1. Inject cart bug: node scripts/inject-bugs.js inject cart-calculation-wrong
- 2. Navigate to /shop
- 3. Add Wireless Headphones ($99.99) to cart
- 4. Navigate to /cart
- 5. Verify item shows $99.99 (quantity 1, appears correct)
- 6. Click increase quantity to 2
- 7. Observe subtotal shows $399.96 (99.99 × 2 × 2 = wrong!)
- 8. Observe total shows $399.96 (should be $199.98)
- 9. Increase to quantity 3
- 10. Observe subtotal shows $899.91 (99.99 × 3 × 3 = wrong!)

**Expected Outcome**: Calculations are mathematically incorrect, scaling quadratically

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Visual Layout Working (working)
**File**: `videos/working/visual-layout-working.mp4`
**Duration**: 45-60 seconds


**Description**: All elements are properly aligned and positioned

**Steps**:
- 1. Navigate to home page
- 2. Observe feature cards are properly aligned
- 3. Click "Learn More" to open modal
- 4. Observe modal is centered on screen
- 5. Close modal
- 6. Navigate to /login
- 7. Observe login form is centered
- 8. Navigate to /shop
- 9. Observe product cards are evenly spaced
- 10. Scroll through entire page

**Expected Outcome**: All elements are visually aligned and professional

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Visual Layout Broken (Bug Injected) (broken)
**File**: `videos/broken/visual-layout-broken.mp4`
**Duration**: 45-60 seconds

**⚠️ Bug to Inject**: `ui-misalignment`

**Description**: Cards are misaligned and modal overlay is incorrectly positioned

**Steps**:
- 1. Inject UI bug: node scripts/inject-bugs.js inject ui-misalignment
- 2. Navigate to home page
- 3. Observe feature cards are shifted right (misaligned)
- 4. Click "Learn More" to open modal
- 5. Observe modal overlay has gaps at top and left
- 6. Close modal
- 7. Navigate to /login
- 8. Observe login card is shifted right
- 9. Navigate to /shop
- 10. Observe all product cards are misaligned

**Expected Outcome**: Visual elements are clearly misaligned and unprofessional

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Theme Toggle Working (working)
**File**: `videos/working/theme-toggle-working.mp4`
**Duration**: 45-60 seconds


**Description**: Dark/light mode toggle works correctly with persistence

**Steps**:
- 1. Navigate to home page (should start in light mode)
- 2. Click theme toggle button (🌙)
- 3. Verify page switches to dark mode
- 4. Verify button shows (☀️)
- 5. Navigate to /shop
- 6. Verify dark mode persists
- 7. Reload page
- 8. Verify still in dark mode
- 9. Click theme toggle again
- 10. Verify switches back to light mode

**Expected Outcome**: Theme toggle works consistently and persists across navigation

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---
### Form Validation Working (working)
**File**: `videos/working/form-validation-working.mp4`
**Duration**: 60-75 seconds


**Description**: Registration form shows appropriate validation errors

**Steps**:
- 1. Navigate to /register
- 2. Click "Create Account" without filling fields
- 3. Observe multiple validation errors appear
- 4. Fill first name: "John"
- 5. Observe first name error disappears
- 6. Fill email: "invalid-email"
- 7. Observe email format error
- 8. Fix email: "john@example.com"
- 9. Fill password: "weak"
- 10. Observe password strength error
- 11. Fill strong password: "Password123"
- 12. Fill confirm password: "Different123"
- 13. Observe password mismatch error

**Expected Outcome**: Form validation provides helpful, real-time feedback

**Recording Notes**: 
- Move mouse slowly and deliberately
- Pause 2-3 seconds after each click to show results
- Keep cursor visible during interactions
- Don't rush through steps

---

## Post-Recording Checklist
- [ ] Video is 720p resolution
- [ ] All interactions are clearly visible
- [ ] Video duration is appropriate (30-75 seconds)
- [ ] File named correctly: `videos/{category}/{scenario-id}.mp4`
- [ ] Bug injected scenarios show clear failure behavior
- [ ] Working scenarios show successful completion

## AI Testing Preparation
After recording all videos:
1. Organize files in `videos/working/` and `videos/broken/` folders
2. Test video playback quality
3. Prepare prompts for AI models using `ai-testing/prompts.md`
4. Ready for AI vision model testing phase
