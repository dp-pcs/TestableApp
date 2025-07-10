const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshot: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // Simple plugin setup
      try {
        require('@applitools/eyes-cypress')(on)
      } catch (error) {
        console.log('Applitools plugin failed to load:', error.message)
      }
      return config
    },
  },
  env: {
    APPLITOOLS_API_KEY: '6BihCJa9MGwHBf11197EiORAcEhi9sSaopbL4Gw8HbSeZk110'
  }
})