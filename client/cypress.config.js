import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000/',
    specPattern: 'tests/e2e/**/*.cy.js',
    supportFile: false,
    defaultCommandTimeout: 8000,
    viewportWidth: 1280,
    viewportHeight: 800,
    supportFile: 'tests/e2e/support.js',
    screenshotsFolder: 'tests/screenshots',
  },
})
