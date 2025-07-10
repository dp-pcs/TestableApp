import { test } from '@playwright/test';
import { Eyes, Target, BatchInfo } from '@applitools/eyes-playwright';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Applitools Baseline - Playwright Version', () => {
  let eyes;

  test.beforeEach(async () => {
    eyes = new Eyes();
    
    // Try both API keys
    let apiKey = process.env.APPLITOOLS_API_KEY2 || process.env.APPLITOOLS_API_KEY;
    
    if (!apiKey) {
      throw new Error('❌ No Applitools API key found');
    }
    
    console.log(`🔑 Playwright testing with API key: ${apiKey.substring(0, 10)}...`);
    eyes.setApiKey(apiKey);
    
    const batch = new BatchInfo('Playwright Demo - Baseline Only');
    eyes.setBatch(batch);
  });

  test.afterEach(async () => {
    try {
      await eyes.abort();
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  test('Capture baseline with Playwright', async ({ page }) => {
    // Get browser name for logging and test identification
    const browserName = page.context().browser()?.browserType().name() || 'unknown';
    
    console.log(`🎭 PLAYWRIGHT VERSION: Capturing BASELINE (Gold Standard) - ${browserName.toUpperCase()}`);
    console.log('   This creates the "perfect" version using Playwright instead of Selenium\n');

    // Open Eyes session for baseline only with browser name
    await eyes.open(page, 'Static Page Demo - Playwright', `TechCorp Homepage - ${browserName}`, {
      width: 1280,
      height: 720
    });

    // Capture ONLY the baseline page
    console.log(`🌟 Playwright (${browserName}): Capturing baseline page...`);
    await page.goto('http://localhost:3000/baseline-page.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for page to fully load
    
    await eyes.check('TechCorp Homepage - Baseline', Target.window().fully());
    
    // Close Eyes and get results
    const results = await eyes.close();
    
    console.log('\n✅ PLAYWRIGHT BASELINE CAPTURED SUCCESSFULLY!');
    console.log(`🌐 Applitools Dashboard: ${results.getUrl()}`);
    console.log(`\n🔄 CROSS-BROWSER TESTING VALUE - ${browserName.toUpperCase()}:`);
    console.log('• Each browser renders content slightly differently');
    console.log('• Font rendering, shadows, colors can vary between browsers');
    console.log('• Applitools catches these browser-specific differences');
    console.log('• One test run = visual coverage across all major browsers');
    
    console.log('\n🔄 SELENIUM vs PLAYWRIGHT:');
    console.log('• Selenium: Traditional WebDriver, broader support');
    console.log('• Playwright: Modern automation, 2-3x faster');
    console.log('• Visual results: Should be consistent at same resolution');
    console.log('• Cross-browser: Both support Chrome, Firefox, Safari testing');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Go to the Applitools dashboard (URL above)');
    console.log('2. You\'ll see the Playwright baseline image');
    console.log('3. Click "Accept" to approve this as your gold standard');
    console.log('4. Compare this with the Selenium version');
  });
}); 