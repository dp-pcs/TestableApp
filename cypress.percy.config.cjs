const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 1024,
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 10000,
    
    setupNodeEvents(on, config) {
      // Simple Percy configuration
      return config;
    },
    
    specPattern: [
      'cypress/e2e/percy-*.cy.js'
    ],
    
    supportFile: 'cypress/support/percy.js'
  }
}); 