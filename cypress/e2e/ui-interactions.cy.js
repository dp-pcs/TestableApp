// cypress/e2e/ui-interactions.cy.js

describe('UI Interactions and Theme Toggle', () => {
  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/')
  })

  describe('Theme Toggle', () => {
    it('should toggle between light and dark themes', () => {
      // Should start in light mode
      cy.get('body').should('have.class', 'light')
      
      // Toggle to dark mode
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark')
      
      // Toggle back to light mode
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'light')
    })

    it('should persist theme selection across page reloads', () => {
      // Switch to dark mode
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark')
      
      // Reload page
      cy.reload()
      
      // Should still be in dark mode
      cy.get('body').should('have.class', 'dark')
    })

    it('should update theme toggle button text', () => {
      // Should show moon in light mode
      cy.get('[data-testid="theme-toggle"]').should('contain', '🌙')
      
      // Click to switch to dark mode
      cy.get('[data-testid="theme-toggle"]').click()
      
      // Should show sun in dark mode
      cy.get('[data-testid="theme-toggle"]').should('contain', '☀️')
    })
  })

  describe('Modal Interactions', () => {
    it('should open modal when learn more button is clicked', () => {
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      cy.contains('About TestableApp').should('be.visible')
    })

    it('should close modal when close button is clicked', () => {
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      
      cy.get('[data-testid="modal-close"]').click()
      cy.get('[data-testid="info-modal"]').should('not.exist')
    })

    it('should close modal when clicking outside', () => {
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      
      // Click on the overlay (outside the modal content)
      cy.get('.modal-overlay').click({ force: true })
      cy.get('[data-testid="info-modal"]').should('not.exist')
    })

    it('should close modal when pressing Escape key', () => {
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      
      cy.get('body').type('{esc}')
      cy.get('[data-testid="info-modal"]').should('not.exist')
    })

    it('should display modal content correctly', () => {
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      
      cy.contains('About TestableApp').should('be.visible')
      cy.contains('Multiple UI flows with deliberate complexity').should('be.visible')
      cy.contains('Form validation with edge cases').should('be.visible')
      cy.contains('Modal interactions').should('be.visible')
      cy.contains('Dark mode toggle').should('be.visible')
      cy.contains('Responsive design patterns').should('be.visible')
    })
  })

  describe('Navigation', () => {
    it('should navigate between pages using header links', () => {
      // Test home navigation
      cy.get('[data-testid="home-link"]').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-testid="home-title"]').should('be.visible')
      
      // Test shop navigation
      cy.get('[data-testid="shop-link"]').click()
      cy.url().should('include', '/shop')
      cy.get('[data-testid="shop-title"]').should('be.visible')
      
      // Test cart navigation
      cy.get('[data-testid="cart-link"]').click()
      cy.url().should('include', '/cart')
      cy.get('[data-testid="cart-title"]').should('be.visible')
      
      // Test login navigation
      cy.get('[data-testid="login-link"]').click()
      cy.url().should('include', '/login')
      cy.get('[data-testid="login-title"]').should('be.visible')
    })

    it('should navigate using get started button', () => {
      cy.get('[data-testid="get-started-btn"]').click()
      cy.url().should('include', '/login')
      cy.get('[data-testid="login-title"]').should('be.visible')
    })

    it('should maintain active navigation state', () => {
      cy.get('[data-testid="shop-link"]').click()
      cy.url().should('include', '/shop')
      
      // Theme toggle should still work after navigation
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark')
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport(375, 667) // iPhone SE size
      
      // Header should still be functional
      cy.get('[data-testid="theme-toggle"]').should('be.visible')
      cy.get('[data-testid="home-link"]').should('be.visible')
      
      // Cards should stack on mobile
      cy.get('.card').should('be.visible')
      
      // Modal should adapt to mobile
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      cy.get('.modal').should('have.css', 'min-width')
    })

    it('should adapt to tablet viewport', () => {
      cy.viewport(768, 1024) // iPad size
      
      // Should maintain functionality at tablet size
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark')
      
      cy.visit('/shop')
      cy.get('[data-testid^="product-"]').should('have.length', 6)
    })

    it('should work on large desktop viewport', () => {
      cy.viewport(1920, 1080)
      
      // Should maintain all functionality on large screens
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="info-modal"]').should('be.visible')
      
      cy.visit('/shop')
      cy.get('[data-testid^="product-"]').should('have.length', 6)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="theme-toggle"]').should('have.attr', 'aria-label', 'Toggle theme')
      cy.get('[data-testid="learn-more-btn"]').click()
      cy.get('[data-testid="modal-close"]').should('have.attr', 'aria-label', 'Close modal')
    })

    it('should be keyboard navigable', () => {
      // Tab through header navigation
      cy.get('body').tab()
      cy.focused().should('have.attr', 'data-testid', 'home-link')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'shop-link')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'cart-link')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'login-link')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'theme-toggle')
    })

    it('should support Enter key activation', () => {
      cy.get('[data-testid="theme-toggle"]').focus().type('{enter}')
      cy.get('body').should('have.class', 'dark')
    })
  })

  describe('Local Storage Persistence', () => {
    it('should persist cart data across sessions', () => {
      cy.visit('/shop')
      cy.get('[data-testid="add-to-cart-1"]').click()
      
      // Reload the page
      cy.reload()
      
      // Cart should still contain the item
      cy.contains('Cart: 1 items').should('be.visible')
      
      cy.visit('/cart')
      cy.get('[data-testid="cart-item-1"]').should('be.visible')
    })

    it('should persist theme preference across sessions', () => {
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark')
      
      // Reload the page
      cy.reload()
      
      // Should still be in dark mode
      cy.get('body').should('have.class', 'dark')
    })
  })
})