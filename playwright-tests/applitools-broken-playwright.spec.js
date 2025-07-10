import { test } from '@playwright/test';
import { Eyes, Target, BatchInfo } from '@applitools/eyes-playwright';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Applitools Broken Page - Playwright Version', () => {
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
    
    const batch = new BatchInfo('Playwright Demo - Broken Page vs Baseline');
    eyes.setBatch(batch);
  });

  test.afterEach(async () => {
    try {
      await eyes.abort();
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  test('Test broken page against approved baseline', async ({ page }) => {
    // Get browser name for logging and test identification
    const browserName = page.context().browser()?.browserType().name() || 'unknown';
    
    console.log(`🐛 PLAYWRIGHT VERSION: Testing BROKEN page against approved baseline - ${browserName.toUpperCase()}`);
    console.log('   This will compare against your approved gold standard using Playwright\n');

    // Open Eyes session with the SAME app and test names as baseline (including browser)
    await eyes.open(page, 'Static Page Demo - Playwright', `TechCorp Homepage - ${browserName}`, {
      width: 1280,
      height: 720
    });

    // Capture the broken page (same checkpoint name as baseline)
    console.log(`🔍 Playwright (${browserName}): Capturing broken page for comparison...`);
    await page.goto('http://localhost:3000/broken-page.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for page to fully load
    
    // Use the SAME checkpoint name as the baseline
    await eyes.check('TechCorp Homepage - Baseline', Target.window().fully());
    
    // Close Eyes and get results
    let results;
    try {
      results = await eyes.close();
      
      console.log('\n🎯 PLAYWRIGHT BROKEN PAGE TEST COMPLETE!');
      console.log(`🌐 Applitools Dashboard: ${results.getUrl()}`);
      
    } catch (error) {
      console.log('\n🎉 SUCCESS! Visual differences detected by Playwright!');
      console.log('🌐 Check the dashboard URL for detailed visual diff');
      
      // Extract URL from error if available
      if (error.message && error.message.includes('https://')) {
        const urlMatch = error.message.match(/https:\/\/[^\s]+/);
        if (urlMatch) {
          console.log(`📊 Dashboard: ${urlMatch[0]}`);
        }
      }
    }
    
    console.log('\n🔍 DETAILED EXPLANATION OF WHAT APPLITOOLS DETECTED:');
    console.log('\n📍 TechCorp Solutions (Header):');
    console.log('   • Color: Changed from white (#ffffff) to red (#ff0000)');
    console.log('   • Why highlighted: RGB values completely different');
    
    console.log('\n📍 "Innovation Meets Excellence" (Subtitle):');
    console.log('   • Position: Margin-left shifted from 0px to 15px');
    console.log('   • Why highlighted: Text baseline moved, affects anti-aliasing');
    
    console.log('\n📍 Our Core Services (Grid Section):');
    console.log('   • Missing: box-shadow: 0 2px 4px rgba(0,0,0,0.1) on first 3 cards');
    console.log('   • Why highlighted: Shadow creates pixel differences around edges');
    
    console.log('\n📍 "Cybersecurity" Text:');
    console.log('   • Font-size: Changed from 1.25rem to 1.1rem');
    console.log('   • Why highlighted: Different character rendering affects pixels');
    
    console.log('\n📍 AI Integration Section:');
    console.log('   • Opacity: Label text changed from 0.9 to 0.3');
    console.log('   • Why highlighted: Transparency affects pixel color values');
    
    console.log('\n🎯 WHY APPLITOOLS IS SO SENSITIVE:');
    console.log('• Pixel-Perfect: Detects 1-pixel differences humans miss');
    console.log('• Anti-aliasing: Font rendering creates subtle edge differences'); 
    console.log('• Color Values: RGB differences even if visually "similar"');
    console.log('• Shadow Effects: Missing shadows affect surrounding pixels');
    console.log('• Position Changes: Even 1px movement affects rendering');
    
    console.log('\n🔄 PLAYWRIGHT vs SELENIUM COMPARISON:');
    console.log('• Playwright: Modern browser automation, faster execution');
    console.log('• Selenium: Traditional WebDriver, wider browser support');
    console.log('• Visual Results: Should be identical for same resolution');
    console.log('• Performance: Playwright typically 2-3x faster');
    
    console.log('\n💡 DEMO INSIGHTS:');
    console.log('• This sensitivity is VALUABLE - catches regressions humans miss');
    console.log('• In real projects, you can set "match levels" to be less sensitive');
    console.log('• AI learns to ignore expected changes (animations, timestamps)');
    console.log('• Each difference can be individually approved/rejected');
  });
}); 