const { defineConfig } = require('cypress')

// Load environment variables from .env file
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshot: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // Applitools Eyes plugin
      require('@applitools/eyes-cypress')(on)
      
      // Pass environment variables to Cypress
      config.env.APPLITOOLS_API_KEY = process.env.APPLITOOLS_API_KEY
      config.env.APPLITOOLS_USERNAME = process.env.APPLITOOLS_USERNAME
      
      return config
    },
  },
  env: {
    // Applitools configuration
    eyesIsDisabled: false,
    eyesFailCypressOnDiff: true,
    eyesTestConcurrency: 1,
  }
}) 