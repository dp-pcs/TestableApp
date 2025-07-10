// cypress/support/e2e.js

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

// Import commands using CommonJS for stability
require('./commands')

// Import Applitools Eyes commands
require('@applitools/eyes-cypress/commands')