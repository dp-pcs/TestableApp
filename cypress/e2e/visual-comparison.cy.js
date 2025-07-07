describe('Visual Testing Comparison: Traditional vs AI Vision', () => {
  beforeEach(() => {
    cy.clearStorage()
  })

  describe('Traditional Cypress Testing (Limited Visual Detection)', () => {
    it('should pass traditional tests even with visual layout bugs', () => {
      // Inject the visual layout bug
      cy.exec('node scripts/inject-bugs.js inject ui-misalignment')
      
      cy.visit('/')
      
      // Traditional tests check for functional elements but miss visual issues
      cy.get('[data-testid="home-title"]').should('be.visible')
      cy.get('[data-testid="learn-more-btn"]').should('be.visible')
      cy.get('[data-testid="get-started-btn"]').should('be.visible')
      
      // Check that cards exist (but can't detect misalignment)
      cy.get('.card').should('exist')
      cy.get('.card').should('have.length', 3)
      
      // Test modal functionality (but can't detect positioning issues)
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      cy.get('[data-testid="modal-close"]').click()
      cy.get('[data-testid="info-modal"]').should('not.exist')
      
      // Navigate to shop page
      cy.get('[data-testid="shop-link"]').click()
      cy.url().should('include', '/shop')
      
      // Check products exist (but can't detect if they're misaligned)
      cy.get('[data-testid^="product-"]').should('have.length', 6)
      
      // Traditional test PASSES despite visual bugs!
      cy.log('✅ Traditional test passes - but visual layout is broken!')
      
      // Restore original files
      cy.exec('node scripts/inject-bugs.js restore')
    })
  })

  describe('Applitools AI Vision Testing (Comprehensive Visual Detection)', () => {
    it('should detect visual differences with AI-powered vision', () => {
      // Start with clean baseline
      cy.exec('node scripts/inject-bugs.js restore')
      
      // Open Eyes for visual testing
      cy.eyesOpen({
        appName: 'TestableApp Visual Testing Research',
        testName: 'Layout Regression Detection',
        browser: { width: 1280, height: 720 }
      })
      
      cy.visit('/')
      
      // Capture baseline visual checkpoint
      cy.eyesCheckWindow('Home Page - Baseline Layout')
      
      // Navigate to shop and capture another checkpoint
      cy.get('[data-testid="shop-link"]').click()
      cy.eyesCheckWindow('Shop Page - Baseline Layout')
      
      // Go back to home for modal test
      cy.visit('/')
      
      // Test modal visual appearance
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.eyesCheckWindow('Modal - Baseline Position')
      cy.get('[data-testid="modal-close"]').click()
      
      // Now inject the visual bug
      cy.exec('node scripts/inject-bugs.js inject ui-misalignment')
      
      // Reload to apply the visual bug
      cy.reload()
      
      // AI Vision will detect the layout differences
      cy.eyesCheckWindow('Home Page - WITH VISUAL BUG (should fail)')
      
      // Check shop page with bug
      cy.get('[data-testid="shop-link"]').click()
      cy.eyesCheckWindow('Shop Page - WITH VISUAL BUG (should fail)')
      
      // Check modal positioning with bug
      cy.visit('/')
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.eyesCheckWindow('Modal - WITH POSITIONING BUG (should fail)')
      
      // Close Eyes (this will report the visual differences)
      cy.eyesClose()
      
      // Restore clean state
      cy.exec('node scripts/inject-bugs.js restore')
    })
    
    it('should pass when layouts match baseline', () => {
      // Ensure clean state
      cy.exec('node scripts/inject-bugs.js restore')
      
      cy.eyesOpen({
        appName: 'TestableApp Visual Testing Research',
        testName: 'Layout Consistency Verification',
        browser: { width: 1280, height: 720 }
      })
      
      cy.visit('/')
      cy.eyesCheckWindow('Home Page - Clean Layout')
      
      cy.get('[data-testid="shop-link"]').click()
      cy.eyesCheckWindow('Shop Page - Clean Layout')
      
      cy.visit('/')
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.eyesCheckWindow('Modal - Correct Position')
      
      cy.eyesClose()
      
      cy.log('✅ AI Vision test passes - layout matches baseline!')
    })
  })

  describe('Side-by-Side Comparison Demo', () => {
    it('should demonstrate the testing methodology difference', () => {
      cy.log('🔬 RESEARCH DEMONSTRATION: Traditional vs AI Vision Testing')
      
      // Part 1: Show traditional testing limitations
      cy.log('📊 Part 1: Traditional Cypress Testing')
      cy.exec('node scripts/inject-bugs.js inject ui-misalignment')
      
      cy.visit('/')
      
      // Traditional assertions pass despite visual issues
      cy.get('[data-testid="home-title"]').should('contain', 'Welcome to TestableApp')
      cy.get('.card').should('be.visible')
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      cy.get('[data-testid="modal-close"]').click()
      
      cy.log('✅ Traditional: All functional tests PASS (but layout is broken)')
      
      // Part 2: Show AI vision detection
      cy.log('🤖 Part 2: AI Vision Testing')
      
      cy.eyesOpen({
        appName: 'TestableApp Research Comparison',
        testName: 'Traditional vs AI Vision Demo',
        browser: { width: 1280, height: 720 }
      })
      
      // First establish baseline with working layout
      cy.exec('node scripts/inject-bugs.js restore')
      cy.reload()
      cy.eyesCheckWindow('BASELINE: Correct Layout')
      
      // Then test with visual bugs
      cy.exec('node scripts/inject-bugs.js inject ui-misalignment')
      cy.reload()
      cy.eyesCheckWindow('COMPARISON: Broken Layout (AI should detect differences)')
      
      cy.eyesClose()
      
      // Restore clean state
      cy.exec('node scripts/inject-bugs.js restore')
      
      cy.log('🎯 Result: AI Vision detects layout issues that traditional testing misses')
    })
  })
}) 