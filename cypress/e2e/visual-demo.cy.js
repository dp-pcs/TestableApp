describe('AI Vision Testing Demo', () => {
  beforeEach(() => {
    cy.clearStorage()
  })

  it('should detect visual differences with AI-powered vision', () => {
    // Start with clean baseline
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
    
    // Open Eyes for visual testing
    cy.eyesOpen({
      appName: 'TestableApp Comparison Demo',
      testName: 'AI Vision vs Traditional Testing',
      browser: { width: 1280, height: 720 }
    })
    
    cy.visit('/')
    
    // Single visual checkpoint captures EVERYTHING
    cy.eyesCheckWindow('Homepage - Complete Visual Baseline')
    
    // Navigate to shop page
    cy.get('[data-testid="shop-link"]').click()
    cy.eyesCheckWindow('Shop Page - Complete Visual Baseline')
    
    // Go back to home for modal test
    cy.visit('/')
    cy.get('[data-testid="learn-more-btn"]').click()
    cy.eyesCheckWindow('Modal - Complete Visual Baseline')
    cy.get('[data-testid="modal-close"]').click()
    
    // Go to cart
    cy.get('[data-testid="shop-link"]').click()
    cy.get('[data-testid="add-to-cart-1"]').click()
    cy.get('[data-testid="cart-link"]').click()
    cy.eyesCheckWindow('Cart Page - Complete Visual Baseline')
    
    // Now inject visual bugs
    cy.exec('node scripts/inject-bugs.js inject ui-misalignment', { failOnNonZeroExit: false })
    
    // Test with visual bugs - AI will detect ALL differences
    cy.visit('/')
    cy.eyesCheckWindow('Homepage - WITH VISUAL BUGS (AI will detect)')
    
    cy.get('[data-testid="shop-link"]').click()
    cy.eyesCheckWindow('Shop Page - WITH VISUAL BUGS (AI will detect)')
    
    cy.visit('/')
    cy.get('[data-testid="learn-more-btn"]').click()
    cy.eyesCheckWindow('Modal - WITH VISUAL BUGS (AI will detect)')
    
    // Close Eyes session
    cy.eyesClose()
    
    // Restore clean state
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
    
    cy.log('🤖 AI Vision testing: 4 visual checkpoints cover EVERYTHING!')
    cy.log('Layout, colors, spacing, alignment, responsive design, etc.')
  })

  it('should demonstrate AI vision efficiency', () => {
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
    
    cy.eyesOpen({
      appName: 'TestableApp Efficiency Demo',
      testName: 'Single AI Vision Test vs 100+ Traditional Tests',
      browser: { width: 1280, height: 720 }
    })
    
    cy.visit('/')
    
    // This ONE assertion covers:
    // - Layout correctness
    // - Color accuracy  
    // - Font rendering
    // - Spacing and alignment
    // - Responsive behavior
    // - Cross-browser consistency
    // - And much more!
    cy.eyesCheckWindow('Complete Page Visual Validation')
    
    cy.eyesClose()
    
    cy.log('🎯 ONE AI visual checkpoint = 100+ traditional assertions!')
  })
})