const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/visual.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshot: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      require('@applitools/eyes-cypress')(on)
      return config
    },
  },
  env: {
    APPLITOOLS_API_KEY: process.env.APPLITOOLS_API_KEY
  }
}) 