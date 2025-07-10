const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    supportFile: 'cypress/support/traditional.js',
    specPattern: 'cypress/e2e/{auth,shopping,ui-interactions}.cy.js',
    setupNodeEvents(on, config) {
      // Traditional tests don't need visual testing setup
    },
  },
})