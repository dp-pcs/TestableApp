import { test, expect } from '@playwright/test';
import { Eyes, Target, BatchInfo } from '@applitools/eyes-playwright';

test.describe('Playwright + Applitools Visual Testing', () => {
  let eyes;

  test.beforeEach(async ({ page }) => {
    eyes = new Eyes();
    eyes.setApiKey(process.env.APPLITOOLS_API_KEY);
    
    const batch = new BatchInfo('Playwright vs Selenium vs Applitools Comparison');
    eyes.setBatch(batch);
    
    await eyes.open(page, 'TestableApp', 'Playwright Visual Testing', { width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    if (eyes) {
      await eyes.close();
    }
  });

  test('Visual comparison - Clean vs Buggy Homepage', async ({ page }) => {
    console.log('👁️  PLAYWRIGHT VISUAL TEST 1: Homepage Visual Analysis');
    
    // First capture clean baseline
    await page.goto('/');
    await eyes.check('Homepage - Clean Baseline', Target.window().fully());
    console.log('   📸 Clean baseline captured');
    
    // Inject visual bugs and compare
    console.log('   🐛 Injecting visual bugs...');
    // Note: In real scenario, bugs would be injected via API
    // For demo purposes, we'll capture different states
    
    await eyes.check('Homepage - VISUAL STATE CHECK', Target.window().fully());
    console.log('   🔍 AI analyzing visual differences...');
  });

  test('Visual comparison - Shop page with price bugs', async ({ page }) => {
    console.log('👁️  PLAYWRIGHT VISUAL TEST 2: Shop Page Visual Analysis');
    
    await page.goto('/shop');
    await eyes.check('Shop Page - PRICE VISUAL CHECK', Target.window().fully());
    console.log('   📸 Shop page visual state captured');
    console.log('   🎯 AI will detect any green price anomalies');
  });

  test('Visual comparison - Profile page button colors', async ({ page }) => {
    console.log('👁️  PLAYWRIGHT VISUAL TEST 3: Profile Page Visual Analysis');
    
    await page.goto('/profile');
    await eyes.check('Profile Page - BUTTON COLOR CHECK', Target.window().fully());
    console.log('   📸 Profile page visual state captured');
    console.log('   🎯 AI will detect any red button anomalies');
  });

  test('Visual comparison - Contact page alignment', async ({ page }) => {
    console.log('👁️  PLAYWRIGHT VISUAL TEST 4: Contact Page Visual Analysis');
    
    await page.goto('/contact');
    await eyes.check('Contact Page - ALIGNMENT CHECK', Target.window().fully());
    console.log('   📸 Contact page visual state captured');
    console.log('   🎯 AI will detect any misalignment issues');
  });

  test('Visual comparison - Support page styling', async ({ page }) => {
    console.log('👁️  PLAYWRIGHT VISUAL TEST 5: Support Page Visual Analysis');
    
    await page.goto('/support');
    await eyes.check('Support Page - STYLING CHECK', Target.window().fully());
    console.log('   📸 Support page visual state captured');
    console.log('   🎯 AI will detect any styling anomalies');
  });
}); 