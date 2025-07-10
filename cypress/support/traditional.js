// cypress/support/traditional.js - Support file for traditional tests without visual testing

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

// Import commands using CommonJS for stability
require('./commands')

// NOTE: Do not import Applitools Eyes commands for traditional tests