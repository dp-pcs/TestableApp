describe('Traditional Testing Demo', () => {
  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/')
  })

  it('should test functional behavior (passes even with visual bugs)', () => {
    // Inject a visual bug that won't affect functionality
    cy.exec('node scripts/inject-bugs.js inject ui-misalignment', { failOnNonZeroExit: false })
    
    // Wait for the bug to be injected
    cy.wait(1000)
    cy.reload()
    
    // These traditional tests will PASS despite visual layout issues
    cy.get('[data-testid="home-title"]').should('contain', 'Welcome to TestableApp')
    cy.get('[data-testid="learn-more-btn"]').should('be.visible')
    cy.get('[data-testid="get-started-btn"]').should('be.visible')
    
    // Test that modal functionality works
    cy.get('[data-testid="learn-more-btn"]').click()
    cy.get('[data-testid="info-modal"]').should('be.visible')
    cy.get('[data-testid="modal-close"]').click()
    cy.get('[data-testid="info-modal"]').should('not.exist')
    
    // Navigate to shop page
    cy.get('[data-testid="shop-link"]').click()
    cy.url().should('include', '/shop')
    
    // Check that products are displayed
    cy.get('[data-testid^="product-"]').should('have.length.greaterThan', 0)
    
    // Add a product to cart
    cy.get('[data-testid="add-to-cart-1"]').click()
    cy.get('[data-testid="cart-link"]').click()
    cy.get('[data-testid^="cart-item-"]').should('have.length', 1)
    
    // Restore files
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
    
    cy.log('✅ Traditional tests pass but visual layout is broken!')
  })

  it('should count total test assertions needed for comprehensive coverage', () => {
    let assertionCount = 0
    
    // Home page assertions
    cy.get('[data-testid="home-title"]').should('contain', 'Welcome to TestableApp')
    assertionCount++
    
    cy.get('[data-testid="learn-more-btn"]').should('be.visible')
    assertionCount++
    
    cy.get('[data-testid="get-started-btn"]').should('be.visible')
    assertionCount++
    
    cy.get('.card').should('have.length', 3)
    assertionCount++
    
    // Modal assertions
    cy.get('[data-testid="learn-more-btn"]').click()
    cy.get('[data-testid="info-modal"]').should('be.visible')
    assertionCount++
    
    cy.get('[data-testid="modal-close"]').click()
    cy.get('[data-testid="info-modal"]').should('not.exist')
    assertionCount++
    
    // Shop page assertions
    cy.get('[data-testid="shop-link"]').click()
    cy.get('[data-testid^="product-"]').should('have.length.greaterThan', 0)
    assertionCount++
    
    cy.get('[data-testid="product-name-1"]').should('contain', 'Wireless Headphones')
    assertionCount++
    
    cy.get('[data-testid="product-price-1"]').should('contain', '$99.99')
    assertionCount++
    
    // Cart functionality
    cy.get('[data-testid="add-to-cart-1"]').click()
    cy.get('[data-testid="cart-link"]').click()
    cy.get('[data-testid^="cart-item-"]').should('have.length', 1)
    assertionCount++
    
    cy.log(`Traditional testing required ${assertionCount} individual assertions`)
    cy.log('And this still doesn\'t cover visual layout, colors, spacing, alignment!')
  })
})