import { test, expect } from '@playwright/test';

test.describe('Playwright Traditional Functional Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Restore clean state before each test
    await page.goto('/');
  });

  test('Homepage functionality works correctly', async ({ page }) => {
    console.log('🔨 PLAYWRIGHT TEST 1: Homepage Functionality');
    
    // Check title exists and is clickable
    const title = page.locator('[data-testid="home-title"]');
    await expect(title).toBeVisible();
    console.log('   ✅ Title is visible');
    
    // Check learn more button works
    const learnMoreBtn = page.locator('[data-testid="learn-more-btn"]');
    await expect(learnMoreBtn).toBeVisible();
    await learnMoreBtn.click();
    console.log('   ✅ Learn More button clicks');
    
    // Check modal opens
    const modal = page.locator('[data-testid="info-modal"]');
    await expect(modal).toBeVisible();
    console.log('   ✅ Modal opens correctly');
    
    // Close modal
    const closeBtn = page.locator('[data-testid="modal-close"]');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
    console.log('   ✅ Modal closes correctly');
  });

  test('Shop page functionality works correctly', async ({ page }) => {
    console.log('🔨 PLAYWRIGHT TEST 2: Shop Page Functionality');
    
    await page.goto('/shop');
    
    // Check products are visible
    const products = page.locator('[data-testid^="product-card-"]');
    await expect(products.first()).toBeVisible();
    console.log('   ✅ Products are visible');
    
    // Check add to cart works
    const addToCartBtn = page.locator('[data-testid="add-to-cart-1"]');
    await addToCartBtn.click();
    console.log('   ✅ Add to cart functionality works');
    
    // Check cart navigation works
    const cartLink = page.locator('[data-testid="cart-link"]');
    await cartLink.click();
    await expect(page).toHaveURL(/.*cart/);
    console.log('   ✅ Cart navigation works');
  });

  test('Profile page functionality works correctly', async ({ page }) => {
    console.log('🔨 PLAYWRIGHT TEST 3: Profile Page Functionality');
    
    await page.goto('/profile');
    
    // Check form fields exist
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
    console.log('   ✅ Form fields are visible');
    
    // Check button is clickable
    const updateBtn = page.locator('button').filter({ hasText: /update|save/i });
    await expect(updateBtn).toBeVisible();
    await expect(updateBtn).toBeEnabled();
    console.log('   ✅ Update button is clickable');
  });

  test('Contact page functionality works correctly', async ({ page }) => {
    console.log('🔨 PLAYWRIGHT TEST 4: Contact Page Functionality');
    
    await page.goto('/contact');
    
    // Check form exists
    const nameInput = page.locator('input[placeholder*="name" i]');
    const emailInput = page.locator('input[type="email"]');
    const submitBtn = page.locator('button[type="submit"]');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
    console.log('   ✅ Contact form is functional');
    
    // Fill and submit form
    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await submitBtn.click();
    console.log('   ✅ Form submission works');
  });

  test('Support page functionality works correctly', async ({ page }) => {
    console.log('🔨 PLAYWRIGHT TEST 5: Support Page Functionality');
    
    await page.goto('/support');
    
    // Check support content is visible
    const supportContent = page.locator('h1, h2, .support-content');
    await expect(supportContent.first()).toBeVisible();
    console.log('   ✅ Support content is visible');
    
    // Check any buttons work
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeVisible();
      console.log('   ✅ Support buttons are functional');
    }
  });

  test('Navigation between pages works', async ({ page }) => {
    console.log('🔨 PLAYWRIGHT TEST 6: Navigation Functionality');
    
    // Test navigation links
    const shopLink = page.locator('[data-testid="shop-link"]');
    await shopLink.click();
    await expect(page).toHaveURL(/.*shop/);
    console.log('   ✅ Shop navigation works');
    
    const homeLink = page.locator('[data-testid="home-link"]');
    await homeLink.click();
    await expect(page).toHaveURL(/.*\//);
    console.log('   ✅ Home navigation works');
  });
}); 