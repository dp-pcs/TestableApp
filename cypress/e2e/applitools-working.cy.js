describe('Applitools Visual Testing - Working', () => {
  beforeEach(() => {
    // Set API key before each test
    Cypress.env('APPLITOOLS_API_KEY', '6BihCJa9MGwHBf11197EiORAcEhi9sSaopbL4Gw8HbSeZk110')
  })

  it('should establish visual baseline', () => {
    cy.exec('node scripts/inject-bugs.js restore', { failOnNonZeroExit: false })
    
    cy.visit('/')
    
    cy.eyesOpen({
      appName: 'TestableApp',
      testName: 'Homepage Visual Baseline',
      browser: { width: 1280, height: 720, name: 'chrome' }
    })
    
    cy.eyesCheckWindow('Homepage')
    cy.eyesClose()
  })
})