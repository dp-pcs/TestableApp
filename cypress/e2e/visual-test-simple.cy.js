describe('Applitools Visual Testing', () => {
  it('should capture visual baseline with UFG', () => {
    // Ensure clean state
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
    
    cy.visit('/')
    
    // Open Applitools Eyes with UFG (Ultrafast Grid)
    cy.eyesOpen({
      appName: 'TestableApp',
      testName: 'Visual Testing Research',
      browser: [
        {width: 1280, height: 720, name: 'chrome'},
        {width: 800, height: 600, name: 'firefox'},
        {width: 800, height: 600, name: 'safari'}
      ]
    })
    
    // Take visual checkpoint of homepage
    cy.eyesCheckWindow('Homepage - Baseline')
    
    // Navigate to shop page
    cy.get('[data-testid="shop-link"]').click()
    cy.eyesCheckWindow('Shop Page - Baseline')
    
    // Test modal
    cy.visit('/')
    cy.get('[data-testid="learn-more-btn"]').click()
    cy.eyesCheckWindow('Modal - Baseline')
    cy.get('[data-testid="modal-close"]').click()
    
    // Test cart page
    cy.get('[data-testid="shop-link"]').click()
    cy.get('[data-testid="add-to-cart-1"]').click()
    cy.get('[data-testid="cart-link"]').click()
    cy.eyesCheckWindow('Cart Page - Baseline')
    
    // Close Eyes
    cy.eyesClose()
  })
  
  it('should detect visual differences when bugs are injected', () => {
    // Start with baseline
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
    
    cy.eyesOpen({
      appName: 'TestableApp',
      testName: 'Visual Regression Detection',
      browser: [
        {width: 1280, height: 720, name: 'chrome'}
      ]
    })
    
    cy.visit('/')
    cy.eyesCheckWindow('Homepage - Clean')
    
    // Inject visual bugs
    cy.exec('node scripts/inject-bugs.js inject ui-misalignment', { failOnNonZeroExit: false })
    cy.reload()
    
    // This should detect visual differences
    cy.eyesCheckWindow('Homepage - With Visual Bugs')
    
    cy.eyesClose()
    
    // Restore clean state
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
  })
})