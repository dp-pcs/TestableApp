describe('Applitools Live Demo - Create Baseline', () => {
  const DEMO_PAGES = [
    { path: '/', name: 'Homepage', component: 'welcome' },
    { path: '/shop', name: 'Product Catalog', component: 'products' },  
    { path: '/profile', name: 'User Profile', component: 'profile' },
    { path: '/contact', name: 'Contact Form', component: 'contact' },
    { path: '/support', name: 'Support Page', component: 'support' },
    { path: '/about', name: 'About Page', component: 'about' }
  ]

  before(() => {
    // Restore clean state first
    cy.exec('npm run demo:restore')
  })

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

describe('Applitools Live Demo - Bug Detection', () => {
  const DEMO_PAGES = [
    { 
      path: '/', 
      name: 'Homepage with Purple Title', 
      component: 'welcome',
      expectedBug: 'Purple oversized heading instead of normal styling'
    },
    { 
      path: '/shop', 
      name: 'Product Catalog with Typo', 
      component: 'products',
      expectedBug: 'Spelling error: "Headphonez" instead of "Headphones"'
    },  
    { 
      path: '/profile', 
      name: 'User Profile with Red Button', 
      component: 'profile',
      expectedBug: 'Save button is red instead of blue'
    },
    { 
      path: '/contact', 
      name: 'Contact Form Misaligned', 
      component: 'contact',
      expectedBug: 'Submit button shifted right, not aligned'
    },
    { 
      path: '/support', 
      name: 'Support Page Wrong Email', 
      component: 'support',
      expectedBug: 'Email shows test@example.com instead of support@company.com'
    }
  ]

  before(() => {
    // Inject the demo bugs
    cy.exec('npm run demo:inject-chaos')
    cy.wait(2000) // Let the changes settle
  })

  after(() => {
    // Clean up after tests
    cy.exec('npm run demo:restore')
  })

  beforeEach(() => {
    cy.eyesOpen({
      appName: 'Visual Testing Live Demo',
      testName: 'Bug Detection - Pages with Visual Issues',
      browser: { width: 1280, height: 720 }
    })
  })

  afterEach(() => {
    const batchInfo = cy.eyesGetBatchInfo()
    const results = cy.eyesClose()
    
    // Store batch info for results page
    cy.window().then((win) => {
      const demoResults = {
        batchInfo,
        timestamp: Date.now(),
        results: results
      }
      win.localStorage.setItem('applitoolsDemoResults', JSON.stringify(demoResults))
    })
  })

  it('should detect visual differences in pages with injected bugs', () => {
    const startTime = Date.now()
    
    DEMO_PAGES.forEach((page, index) => {
      const pageStartTime = Date.now()
      
      cy.log(`Scanning for bugs ${index + 1}/${DEMO_PAGES.length}: ${page.name}`)
      
      cy.visit(page.path)
      cy.wait(1000)
      
      // Take screenshot that will be compared to baseline
      cy.eyesCheckWindow({
        tag: `${page.name} - Bug Detection`,
        fully: true,
        matchLevel: 'Strict'
      })
      
      const pageTime = Date.now() - pageStartTime
      cy.log(`Page ${page.name} scanned in ${pageTime}ms - Expected: ${page.expectedBug}`)
    })
    
    const totalTime = Date.now() - startTime
    cy.log(`Total Applitools scan completed in ${totalTime}ms`)
    
    // Store timing results
    cy.window().then((win) => {
      const timingResults = {
        totalTime,
        averageTimePerPage: totalTime / DEMO_PAGES.length,
        pagesScanned: DEMO_PAGES.length,
        completedAt: new Date().toISOString()
      }
      win.localStorage.setItem('applitoolsTimingResults', JSON.stringify(timingResults))
    })
  })
})