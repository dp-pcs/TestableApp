// cypress/support/commands.js

// Custom command to clear localStorage and sessionStorage
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})

// Custom command to login with test credentials
Cypress.Commands.add('login', () => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type('test@example.com')
  cy.get('[data-testid="password-input"]').type('password123')
  cy.get('[data-testid="login-submit"]').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

// Custom command to add product to cart
Cypress.Commands.add('addProductToCart', (productId) => {
  cy.visit('/shop')
  cy.get(`[data-testid="add-to-cart-${productId}"]`).click()
})

// Custom command to fill checkout form
Cypress.Commands.add('fillCheckoutForm', () => {
  cy.get('[data-testid="checkout-firstName"]').type('John')
  cy.get('[data-testid="checkout-lastName"]').type('Doe')
  cy.get('[data-testid="checkout-email"]').type('john@example.com')
  cy.get('[data-testid="checkout-address"]').type('123 Main St')
  cy.get('[data-testid="checkout-city"]').type('Anytown')
  cy.get('[data-testid="checkout-zipCode"]').type('12345')
  cy.get('[data-testid="checkout-cardNumber"]').type('1234567890123456')
  cy.get('[data-testid="checkout-expiryDate"]').type('12/25')
  cy.get('[data-testid="checkout-cvv"]').type('123')
})