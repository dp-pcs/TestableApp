# AI Vision Testing Prompts

This document contains structured prompts for testing AI vision models against recorded user interface scenarios. Each prompt is designed to test specific aspects of UI functionality and bug detection.

## Base Template

```
You are analyzing a screen recording of a web application test. The application is a React-based e-commerce demo called "TestableApp" designed for testing UI automation approaches.

Please watch the video carefully and analyze the user interactions. Focus on:
- User actions and their expected outcomes
- Visual elements and their behavior
- Error states and validation messages
- Overall user experience flow

Provide your analysis in this format:
1. **PASS/FAIL**: Does the functionality work as expected?
2. **Observations**: What did you see happen?
3. **Issues Detected**: Any problems or anomalies noted
4. **Confidence Level**: How confident are you in this assessment (1-10)?
```

## Scenario-Specific Prompts

### 1. Login Flow Analysis

**For: login-success.mp4 and login-failure-bug.mp4**

```
Watch this login attempt. The user should be able to:
1. Navigate to the login page
2. Enter email: test@example.com  
3. Enter password: password123
4. Click the login button
5. Successfully navigate to the home page showing "Welcome to TestableApp"

Questions to answer:
- Does the login succeed with the correct credentials?
- Does the user reach the home page after login?
- Are there any error messages displayed?
- Does the page behavior match what you'd expect for a successful login?

If the login fails, describe specifically what went wrong.
```

### 2. Modal Interaction Analysis

**For: modal-interaction-working.mp4 and modal-interaction-broken.mp4**

```
Observe the modal behavior in this recording. The modal should:
1. Open when the "Learn More" button is clicked
2. Close when the user presses the Escape key
3. Close when the user clicks outside the modal area
4. Close when the user clicks the X button

Test each closing method:
- Does the Escape key close the modal?
- Does clicking outside the modal close it?
- Does the X button work to close it?

Rate each closing method as WORKING or BROKEN and explain what you observed.
```

### 3. Shopping Cart Calculation Analysis

**For: cart-calculation-working.mp4 and cart-calculation-broken.mp4**

```
Review the shopping cart mathematical calculations in this video:

The user will:
1. Add Wireless Headphones ($99.99) to the cart
2. Increase quantity to 2 (should equal $199.98)
3. Potentially add more items or change quantities

Your task:
1. Note the individual item prices shown
2. Track the quantities selected  
3. Calculate what the subtotals SHOULD be
4. Compare with what the application displays
5. Verify the final total calculation

Are all calculations mathematically correct? If not, describe the specific calculation errors you observe.

Expected calculation: Price × Quantity = Subtotal
Example: $99.99 × 2 = $199.98
```

### 4. Visual Layout Analysis  

**For: visual-layout-working.mp4 and visual-layout-broken.mp4**

```
Examine the visual layout and positioning of elements:

Look for:
1. Card alignment on the home page
2. Modal positioning when opened
3. Form layout and alignment
4. Overall visual consistency
5. Professional appearance

Questions:
- Are all cards and elements properly aligned?
- Does the modal appear centered on the screen?
- Are there any visual gaps, misalignments, or unprofessional appearances?
- Does the layout look intentional and polished?

Describe any visual issues you notice, even subtle ones.
```

### 5. Theme Toggle Analysis

**For: theme-toggle-working.mp4**

```
Watch the dark/light theme toggle functionality:

The user will:
1. Start in light mode
2. Click the theme toggle button (🌙/☀️)
3. Switch to dark mode
4. Navigate between pages
5. Reload the page
6. Toggle back to light mode

Verify:
- Does the theme actually change when toggled?
- Do the colors and appearance update consistently across the entire page?
- Does the theme setting persist when navigating to different pages?
- Does the theme setting persist after page reload?
- Does the toggle button icon change appropriately (🌙 for light mode, ☀️ for dark mode)?
```

### 6. Form Validation Analysis

**For: form-validation-working.mp4**

```
Analyze the form validation behavior on the registration page:

The user will:
1. Try to submit an empty form
2. Fill in fields one by one
3. Enter invalid data (bad email, weak password, mismatched passwords)
4. Observe error messages and their timing

Evaluate:
- Do appropriate error messages appear for empty required fields?
- Do error messages disappear when the user starts fixing the issues?
- Are email format requirements enforced?
- Are password strength requirements clearly communicated?
- Does password confirmation matching work correctly?
- Is the overall validation user-friendly and helpful?

Rate the validation as: EXCELLENT / GOOD / ADEQUATE / POOR and explain why.
```

## Comparative Analysis Prompts

### Cross-Scenario Comparison

```
You have now analyzed multiple videos of the same functionality, some working and some broken. 

Compare the working vs broken versions:
1. **Functional Differences**: What specific behaviors differ between working and broken versions?
2. **Visual Cues**: Are there visual indicators that something is wrong in the broken versions?
3. **User Experience Impact**: How would these bugs affect a real user?
4. **Detection Difficulty**: How obvious or subtle are the issues?

Rate each bug's impact: CRITICAL / HIGH / MEDIUM / LOW
```

### Overall Application Assessment  

```
Based on all the videos you've analyzed, provide an overall assessment of this web application:

1. **User Experience Quality**: How would you rate the overall UX?
2. **Visual Design**: Is the interface professional and polished?
3. **Functionality Completeness**: Do the features work as expected?
4. **Error Handling**: How well does the app handle errors and edge cases?
5. **Accessibility**: Are there good accessibility practices visible?

Would you recommend this application for production use? What are the top 3 improvements needed?
```

## Testing Instructions

### For Each Video:
1. Upload the video to the AI model interface
2. Copy the appropriate prompt for that scenario
3. Paste the prompt and submit for analysis
4. Record the AI's response in a structured format
5. Note the response time and any limitations mentioned

### Response Recording Template:
```
**Video**: {filename}
**AI Model**: {GPT-4o Vision / Claude 3.5 Sonnet / Gemini Vision}
**Prompt Used**: {prompt category}
**Response Time**: {seconds}
**Response**:
{full AI response}

**Accuracy Assessment**:
- Correct Detection: YES/NO
- Specific Issues Identified: {list}
- False Positives: {any incorrect findings}
- Confidence Score Provided: {1-10 if given}
```

## Model-Specific Considerations

### GPT-4o Vision
- Good at detailed analysis
- May provide confidence scores
- Can handle longer videos well

### Claude 3.5 Sonnet  
- Strong reasoning capabilities
- Good at structured responses
- May provide detailed explanations

### Gemini Vision
- Fast processing
- Good at identifying patterns
- May excel at visual detection

## Success Metrics

Track these metrics for each AI model:
- **Accuracy**: Correctly identified working vs broken functionality
- **Precision**: Avoided false positives
- **Detail Level**: Specificity of issue descriptions
- **Response Time**: Speed of analysis
- **Consistency**: Similar results across similar scenarios
- **Actionability**: How useful the feedback would be for developers