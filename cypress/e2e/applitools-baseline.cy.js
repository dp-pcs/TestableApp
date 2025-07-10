describe('Applitools Baseline Creation', () => {
  const DEMO_PAGES = [
    { path: '/', name: 'Homepage' },
    { path: '/shop', name: 'Product Catalog' },  
    { path: '/profile', name: 'User Profile' },
    { path: '/contact', name: 'Contact Form' },
    { path: '/support', name: 'Support Page' },
    { path: '/about', name: 'About Page' }
  ]

  beforeEach(() => {
    cy.eyesOpen({
      appName: 'Visual Testing Live Demo',
      testName: 'Baseline Creation - Clean Pages',
      browser: { width: 1280, height: 720 }
    })
  })

  afterEach(() => {
    cy.eyesClose()
  })

  it('should create baseline screenshots of clean pages', () => {
    DEMO_PAGES.forEach((page, index) => {
      cy.log(`Creating baseline ${index + 1}/${DEMO_PAGES.length}: ${page.name}`)
      
      cy.visit(page.path)
      cy.wait(1000) // Ensure page loads completely
      
      // Take baseline screenshot
      cy.eyesCheckWindow({
        tag: `${page.name} - Baseline`,
        fully: true,
        matchLevel: 'Strict'
      })
    })
  })
})