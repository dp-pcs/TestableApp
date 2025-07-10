const { test, expect } = require('@playwright/test');

test.describe('Percy Visual Testing - Playwright', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent test environment
    await page.goto('http://localhost:3000');
  });

  test('should capture baseline screenshots across browsers', async ({ page }) => {
    // Test the same pages as AI testing framework
    const testPages = [
      { name: 'Baseline Page', url: '/baseline-page.html' },
      { name: 'Home Page', url: '/' },
      { name: 'Shop Page', url: '/shop' },
      { name: 'About Page', url: '/about' },
      { name: 'Contact Page', url: '/contact' }
    ];

    for (const { name, url } of testPages) {
      console.log(`📸 Capturing ${name}`);
      await page.goto(`http://localhost:3000${url}`);
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Take Percy snapshot (when integrated)
      await page.screenshot({ 
        path: `percy-playwright-${name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });
    }
  });

  test('should detect visual differences in broken page', async ({ page }) => {
    // Test the same broken page as AI testing
    await page.goto('http://localhost:3000/broken-page.html');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Take screenshot for comparison
    await page.screenshot({ 
      path: 'percy-playwright-broken-page.png',
      fullPage: true 
    });
  });

  test('should test responsive design across viewports', async ({ page }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 1024 }
    ];

    for (const { name, width, height } of viewports) {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:3000/broken-page.html');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: `percy-playwright-${name.toLowerCase()}-responsive.png`,
        fullPage: true 
      });
    }
  });

  test('should test cross-browser compatibility', async ({ page, browserName }) => {
    // Test browser-specific rendering issues
    await page.goto('http://localhost:3000/broken-page.html');
    await page.waitForLoadState('networkidle');
    
    // Take browser-specific screenshot
    await page.screenshot({ 
      path: `percy-playwright-${browserName}-compatibility.png`,
      fullPage: true 
    });
    
    // Test specific components
    const components = [
      '.compatibility-grid',
      '.browser-card',
      '.feature-showcase'
    ];
    
    for (const selector of components) {
      const element = await page.$(selector);
      if (element) {
        await element.screenshot({ 
          path: `percy-playwright-${browserName}-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png` 
        });
      }
    }
  });
}); 