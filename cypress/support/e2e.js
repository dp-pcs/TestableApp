// cypress/support/e2e.js

// Import commands.js using ES2015 syntax:
import './commands'

// Import Applitools Eyes commands
import '@applitools/eyes-cypress/commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})