import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://testableapp.latentgenius.ai', // Your deployed app URL
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshot: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // LambdaTest specific setup
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
    env: {
      // LambdaTest configuration
      LT_USERNAME: process.env.LT_USERNAME,
      LT_ACCESS_KEY: process.env.LT_ACCESS_KEY,
    }
  },
}) 