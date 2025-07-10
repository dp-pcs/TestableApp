import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Home from './Home'
import Shop from './Shop'
import Profile from './Profile'
import Contact from './Contact'
import Support from './Support'
import Cart from './Cart'
import Checkout from './Checkout'
import About from './About'

const DEMO_PAGES = [
  {
    id: 1,
    title: "Homepage",
    description: "Find the skewed theme toggle icon",
    bugDescription: "Theme toggle icon (🌙/☀️) is rotated 45 degrees",
    hint: "Look in the top navigation bar for a tilted icon",
    path: "/",
    nextPath: "/shop",
    bugSelector: "[data-testid='theme-toggle-icon']"
  },
  {
    id: 2,
    title: "Shop Page",
    description: "Find the misaligned Smart Watch price",
    bugDescription: "Smart Watch price is bright green, oversized, and angled",
    hint: "Check the Smart Watch product for unusual price styling",
    path: "/shop",
    nextPath: "/profile",
    bugSelector: "[data-testid='product-price-2']"
  },
  {
    id: 3,
    title: "Profile Page", 
    description: "Find the incorrectly styled button",
    bugDescription: "Update Profile button is red instead of blue",
    hint: "Look for buttons that don't match the site's color scheme",
    path: "/profile",
    nextPath: "/contact",
    bugSelector: ".profile button.btn"
  },
  {
    id: 4,
    title: "Contact Page",
    description: "Find the misaligned submit button",
    bugDescription: "Submit button is shifted right and misaligned",
    hint: "Look for form elements that don't line up properly",
    path: "/contact",
    nextPath: "/support",
    bugSelector: "button[type='submit']"
  },
  {
    id: 5,
    title: "Support Page",
    description: "Find the incorrectly colored buttons",
    bugDescription: "Support action buttons are red instead of blue",
    hint: "Check all buttons for consistent styling",
    path: "/support",
    nextPath: "/cart",
    bugSelector: "button.btn-primary"
  },
  {
    id: 6,
    title: "Shopping Cart",
    description: "Find the oversized heading text",
    bugDescription: "Cart heading is purple and oversized",
    hint: "Look at the main page heading for unusual styling",
    path: "/cart",
    nextPath: "/checkout",
    bugSelector: "h1, h2"
  },
  {
    id: 7,
    title: "Checkout Page",
    description: "Find the misplaced form elements",
    bugDescription: "Form inputs have incorrect borders and spacing",
    hint: "Examine the form fields for styling inconsistencies",
    path: "/checkout",
    nextPath: "/about",
    bugSelector: "input.form-input, .form-group"
  },
  {
    id: 8,
    title: "About Page",
    description: "Find the misaligned navigation links",
    bugDescription: "Navigation links are oversized and underlined",
    hint: "Check the navigation bar for unusual link styling",
    path: "/about",
    nextPath: null, // Last page
    bugSelector: "nav a"
  }
]

// Component to render the actual page within the demo
const DemoPageWrapper = ({ pagePath, onBugFound, onFalsePositive, bugSelector, isProcessing }) => {
  useEffect(() => {
    if (isProcessing) {
      console.log('⏸️ Bug processing in progress, skipping setup')
      return
    }

    console.log(`🔍 Setting up bug detection for path: ${pagePath}, selector: ${bugSelector}`)

    let cleanupFunctions = []

    const setupBugDetection = () => {
      // Wait longer for React to render
      setTimeout(() => {
        if (isProcessing) {
          console.log('⏸️ Processing started, aborting setup')
          return
        }

        console.log(`🎯 Looking for elements with selector: ${bugSelector}`)
        const bugElements = document.querySelectorAll(bugSelector)
        console.log(`Found ${bugElements.length} bug elements:`, bugElements)
        
        // Additional debugging for Smart Watch price
        if (bugSelector === "[data-testid='product-price-2']") {
          const smartWatchPrice = document.querySelector("[data-testid='product-price-2']")
          console.log('🔍 Smart Watch price element:', smartWatchPrice)
          console.log('🔍 Smart Watch price text:', smartWatchPrice?.textContent)
          console.log('🔍 Smart Watch price computed style:', smartWatchPrice ? window.getComputedStyle(smartWatchPrice) : 'not found')
          
          // Try broader selectors to debug
          const allPrices = document.querySelectorAll('[data-testid^="product-price-"]')
          console.log('🔍 All product prices found:', allPrices)
          allPrices.forEach((price, index) => {
            console.log(`  Price ${index + 1}:`, price.getAttribute('data-testid'), price.textContent)
          })
        }

        if (bugElements.length === 0) {
          console.warn(`⚠️ No bug elements found, retrying in 2 seconds`)
          setTimeout(setupBugDetection, 2000)
          return
        }

        // Add global click listener for false positives  
        const globalClickHandler = (e) => {
          if (isProcessing) return // Don't process clicks during transition

          const target = e.target
          
          // Skip navigation buttons and demo control elements
          if (target.classList.contains('navigation-btn') || 
              target.closest('.navigation-overlay') ||
              target.closest('.demo-control-protected') ||
              target.closest('.demo-results-protected')) {
            return // Let these clicks pass through normally
          }
          
          // Check if the clicked element or any parent matches the bug selector
          const clickedBugElement = target.closest(bugSelector) || 
                                   (target.matches && target.matches(bugSelector) ? target : null)
          
          const isBugElement = clickedBugElement !== null

          console.log('🔍 Global click detected:', {
            target: target.tagName + (target.getAttribute('data-testid') ? `[data-testid="${target.getAttribute('data-testid')}"]` : ''),
            bugSelector: bugSelector,
            clickedBugElement: clickedBugElement,
            isBugElement: isBugElement,
            bugElements: bugElements.length
          })

          // If it's a bug element, DO NOT process as false positive
          if (isBugElement) {
            console.log('✅ Bug element detected, ignoring for false positive check')
            return // Let the bug-specific handlers take over
          }

          // Only treat as false positive if it's NOT a bug element and is interactive
          if (target.tagName === 'BUTTON' || 
              target.tagName === 'A' || 
              target.closest('button') || 
              target.closest('a') ||
              target.closest('.card') ||
              target.closest('h1, h2, h3')) {
            
            e.preventDefault()
            e.stopPropagation()
            console.log('❌ False positive clicked:', target)
            onFalsePositive(target)
          }
        }

        document.addEventListener('click', globalClickHandler, false)
        cleanupFunctions.push(() => {
          document.removeEventListener('click', globalClickHandler, false)
        })

        // Setup each bug element
        bugElements.forEach((element, index) => {
          console.log(`🐛 Setting up bug element ${index + 1}:`, element)
          
          // Visual styling
          element.style.cursor = 'pointer'
          element.style.outline = '5px solid #ff0000'
          element.style.outlineOffset = '3px'
          element.style.position = 'relative'
          element.style.zIndex = '1000'
          element.style.animation = 'bug-pulse 2s infinite'
          element.title = '🐛 CLICK ME! This is a visual bug!'

          // Click handler for the bug
          const bugClickHandler = (e) => {
            console.log('🐛 Bug click handler called!', {
              element: element,
              target: e.target,
              selector: bugSelector,
              isProcessing: isProcessing
            })
            
            if (isProcessing) {
              console.log('⏸️ Bug click ignored - processing in progress')
              return // Prevent multiple calls during processing
            }

            e.preventDefault()
            e.stopPropagation()
            console.log('✅ Bug element clicked successfully!')
            onBugFound()
          }

          // Add click handler to the element AND its children to ensure clicks are captured
          element.addEventListener('click', bugClickHandler, true)
          
          // For elements that might have children (like prices with $ signs), also add to children
          const children = element.querySelectorAll('*')
          children.forEach(child => {
            child.addEventListener('click', bugClickHandler, true)
            child.style.pointerEvents = 'auto' // Ensure children can receive clicks
          })

          // Hover effects
          const mouseEnterHandler = () => {
            if (isProcessing) return
            element.style.outline = '5px solid #ff4444'
            element.style.boxShadow = '0 0 20px rgba(255,0,0,0.8)'
            element.style.transform = 'scale(1.05)'
          }

          const mouseLeaveHandler = () => {
            if (isProcessing) return
            element.style.outline = '5px solid #ff0000'
            element.style.boxShadow = 'none'
            element.style.transform = 'scale(1)'
          }

          // Add event listeners
          element.addEventListener('click', bugClickHandler, true)
          element.addEventListener('mouseenter', mouseEnterHandler)
          element.addEventListener('mouseleave', mouseLeaveHandler)
          
          // For elements that might have children (like prices with $ signs), also add to children
          const elementChildren = element.querySelectorAll('*')
          elementChildren.forEach(child => {
            child.addEventListener('click', bugClickHandler, true)
            child.style.pointerEvents = 'auto' // Ensure children can receive clicks
          })

          // Store cleanup function
          cleanupFunctions.push(() => {
            element.removeEventListener('click', bugClickHandler, true)
            element.removeEventListener('mouseenter', mouseEnterHandler)
            element.removeEventListener('mouseleave', mouseLeaveHandler)
            
            // Also clean up child event listeners
            const childElements = element.querySelectorAll('*')
            childElements.forEach(child => {
              child.removeEventListener('click', bugClickHandler, true)
              child.style.pointerEvents = '' // Reset pointer events
            })
            
            element.style.cursor = 'default'
            element.style.outline = 'none'
            element.style.outlineOffset = 'initial'
            element.style.position = 'initial'
            element.style.zIndex = 'initial'
            element.style.animation = 'none'
            element.style.boxShadow = 'none'
            element.style.transform = 'none'
            element.title = ''
          })
        })

        console.log(`✅ Bug detection setup complete for ${bugElements.length} elements`)
      }, 1500) // Give much more time for React to render
    }

    setupBugDetection()

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up bug detection')
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [pagePath, bugSelector, onBugFound, onFalsePositive, isProcessing])

  // Render the appropriate page component
  const renderPageComponent = () => {
    switch (pagePath) {
      case '/':
        return <Home />
      case '/shop':
        return <Shop />
      case '/profile':
        return <Profile />
      case '/contact':
        return <Contact />
      case '/support':
        return <Support />
      case '/cart':
        return <Cart />
      case '/checkout':
        return <Checkout />
      case '/about':
        return <About />
      default:
        return <div>Page not found</div>
    }
  }

  return (
    <div className="demo-page-content">
      {renderPageComponent()}
    </div>
  )
}

const ManualDemo = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [pageStartTime, setPageStartTime] = useState(null)
  const [results, setResults] = useState([])
  const [totalTime, setTotalTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFalsePositive, setShowFalsePositive] = useState(false)
  const [foundBugDescription, setFoundBugDescription] = useState('')
  const [falsePositiveElement, setFalsePositiveElement] = useState('')
  const [isProcessing, setIsProcessing] = useState(false) // Prevent multiple clicks
  const [showNavigation, setShowNavigation] = useState(false) // Show navigation prompt
  
  // Use ref to track if we've already processed this page
  const processedRef = useRef(false)

  // Validate currentPage to prevent corruption
  const validCurrentPage = Math.max(0, Math.min(currentPage, DEMO_PAGES.length - 1))
  
  useEffect(() => {
    let interval = null
    if (isRunning && startTime && !isProcessing) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime)
      }, 10)
    }
    return () => clearInterval(interval)
  }, [isRunning, startTime, isProcessing])

  // Reset processed flag when page changes
  useEffect(() => {
    processedRef.current = false
    setShowNavigation(false) // Reset navigation state
  }, [validCurrentPage])

  const startDemo = () => {
    const now = Date.now()
    setStartTime(now)
    setPageStartTime(now)
    setCurrentPage(0)
    setResults([])
    setIsRunning(true)
    setIsProcessing(false)
    processedRef.current = false
  }

  const handleBugFound = () => {
    // Multiple layers of protection against duplicate calls
    if (isProcessing || processedRef.current) {
      console.log('⏸️ Already processing or already processed this page, ignoring call')
      return
    }

    // Mark as processed immediately
    processedRef.current = true
    setIsProcessing(true)
    
    console.log(`🎯 Processing bug found on page ${validCurrentPage}`)

    const now = Date.now()
    const pageTime = now - pageStartTime
    const currentPageData = DEMO_PAGES[validCurrentPage]
    
    if (!currentPageData) {
      console.error('❌ Invalid page data, resetting demo')
      setIsProcessing(false)
      return
    }

    const newResult = {
      page: currentPageData.title,
      time: pageTime,
      bug: currentPageData.bugDescription
    }
    
    // Show success feedback
    setFoundBugDescription(currentPageData.bugDescription)
    setShowSuccess(true)
    
    setResults(prev => [...prev, newResult])
    
    // Hide success message and show navigation prompt
    setTimeout(() => {
      setShowSuccess(false)
      
      if (validCurrentPage < DEMO_PAGES.length - 1) {
        // Show navigation prompt instead of auto-advancing
        setShowNavigation(true)
      } else {
        // Demo complete
        console.log('🏁 Demo completed!')
        setIsRunning(false)
        setTotalTime(now - startTime)
        
        // Store results and navigate to results page
        localStorage.setItem('manualDemoResults', JSON.stringify({
          results: [...results, newResult],
          totalTime: now - startTime,
          completedAt: new Date().toISOString()
        }))
        
        setTimeout(() => {
          navigate('/demo-results')
        }, 1000)
      }
    }, 2000) // Show success for 2 seconds
  }

  const handleNavigateToNext = () => {
    console.log('🔘 Navigation button clicked!')
    const nextPage = validCurrentPage + 1
    const nextPageData = DEMO_PAGES[nextPage]
    
    console.log(`📄 Manually navigating from page ${validCurrentPage} (${DEMO_PAGES[validCurrentPage]?.title}) to page ${nextPage} (${nextPageData?.title})`)
    
    setShowNavigation(false)
    setCurrentPage(nextPage)
    setPageStartTime(Date.now())
    setIsProcessing(false) // Allow clicks on next page
    
    console.log(`✅ Navigation complete! New page: ${nextPage}`)
  }

  const handleFalsePositive = (element) => {
    if (isProcessing) return

    setFalsePositiveElement(element.tagName.toLowerCase() + (element.textContent ? ': "' + element.textContent.substring(0, 30) + '"' : ''))
    setShowFalsePositive(true)
    
    setTimeout(() => {
      setShowFalsePositive(false)
    }, 2000)
  }

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`
  }

  const renderCurrentPage = () => {
    const currentPageData = DEMO_PAGES[validCurrentPage]
    if (!currentPageData) return null

    return (
      <DemoPageWrapper 
        key={`${currentPageData.path}-${validCurrentPage}`} // Force re-render on page change
        pagePath={currentPageData.path}
        onBugFound={handleBugFound}
        onFalsePositive={handleFalsePositive}
        bugSelector={currentPageData.bugSelector}
        isProcessing={isProcessing}
      />
    )
  }

  if (!isRunning && validCurrentPage === 0) {
    return (
      <div className="manual-demo-start manual-demo">
        <div className="demo-instructions">
          <h1>🕵️ Manual Visual Bug Detection Challenge</h1>
          <p>You will navigate through <strong>8 different pages</strong>, each with a specific visual bug.</p>
          <p>Your task: <strong>Find each bug, report it, then manually navigate to the next page.</strong></p>
          
          <div className="demo-rules">
            <h3>🎯 How it works:</h3>
            <ul>
              <li>⏱️ Timer starts when you click "Start Demo"</li>
              <li>🔍 <strong>Each page has ONE bug</strong> you need to find and click</li>
              <li>🔴 Bugs are marked with <strong>red outlines and pulsing animation</strong></li>
              <li>👆 <strong>Click directly on the buggy element</strong> to report it</li>
              <li>⌚ <strong>On Shop page: Click the Smart Watch price specifically</strong></li>
              <li>🧭 After finding each bug, you'll see a <strong>"Navigate to Next Page" button</strong></li>
              <li>📄 <strong>Manually navigate through all 8 pages</strong> to complete the challenge</li>
              <li>✅ You'll get confirmation when you find each bug</li>
              <li>❌ Clicking wrong elements will show "false positive" feedback</li>
              <li>📊 Total time across all pages will be recorded</li>
            </ul>
          </div>

          <div className="demo-preview">
            <h3>🐛 Pages and bugs you'll hunt for:</h3>
            <ol>
              {DEMO_PAGES.map(page => (
                <li key={page.id}>
                  <strong>{page.title}:</strong> {page.description}
                  <br />
                  <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    💡 Hint: {page.hint}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="demo-time-estimate">
            <p style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', fontStyle: 'italic' }}>
              ⏰ <strong>Expected time:</strong> 2-4 minutes of manual navigation and bug hunting<br/>
              🤖 <strong>AI comparison:</strong> Applitools will do this same task in 3-5 seconds
            </p>
          </div>

          <button className="btn btn-primary demo-start-btn" onClick={startDemo}>
            🚀 Start Manual Testing Challenge
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="manual-demo">
      <div className="demo-header">
        <div className="demo-timer">
          <h2>⏱️ Total Time: {formatTime(currentTime)}</h2>
          <p>📄 Page {validCurrentPage + 1} of {DEMO_PAGES.length}: {DEMO_PAGES[validCurrentPage]?.title}</p>
          <p className="instruction">🎯 {DEMO_PAGES[validCurrentPage]?.description}</p>
          <p className="hint">💡 {DEMO_PAGES[validCurrentPage]?.hint}</p>
          <p className="interaction-help">👆 <strong>Click on the red-outlined bug to report it!</strong></p>
        </div>
        
        <div className="demo-progress">
          {results.map((result, index) => (
            <div key={index} className="completed-page">
              ✅ {result.page}: {formatTime(result.time)}
            </div>
          ))}
        </div>
      </div>

      <div className="demo-content">
        {renderCurrentPage()}
        
        {showSuccess && (
          <div className="success-overlay">
            <div className="success-message">
              <h2>✅ Bug Found!</h2>
              <p><strong>What you found:</strong></p>
              <p>{foundBugDescription}</p>
              <p className="time-display">Time: {formatTime(Date.now() - pageStartTime)}</p>
              <p className="next-page">Moving to next page...</p>
            </div>
          </div>
        )}
        
        {showFalsePositive && (
          <div className="false-positive-overlay">
            <div className="false-positive-message">
              <h2>❌ False Positive!</h2>
              <p>You clicked on: <em>{falsePositiveElement}</em></p>
              <p>This element looks normal - keep looking for the visual bug!</p>
              <p className="hint-reminder">💡 Look for the <strong>red-outlined</strong> element</p>
            </div>
          </div>
        )}

        {showNavigation && (
          <div className="navigation-overlay">
            <div className="navigation-message">
              <h2>🧭 Navigation Required</h2>
              <p>You found the bug on <strong>{DEMO_PAGES[validCurrentPage]?.title}</strong>!</p>
              <p>Now click the button below to manually navigate to the next page:</p>
              <p><strong>Next: {DEMO_PAGES[validCurrentPage + 1]?.title}</strong></p>
              <button 
                className="btn btn-primary navigation-btn" 
                onClick={handleNavigateToNext}
                style={{
                  marginTop: '20px',
                  padding: '15px 30px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  zIndex: 10001
                }}
              >
                ✅ Navigate to {DEMO_PAGES[validCurrentPage + 1]?.title}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bug-pulse {
          0% { outline-color: #ff0000; }
          50% { outline-color: #ff6666; }
          100% { outline-color: #ff0000; }
        }

        .manual-demo-start {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }

        .demo-instructions h1 {
          color: #007bff;
          margin-bottom: 20px;
        }

        .demo-rules {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }

        .demo-preview {
          background: #e9ecef;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }

        .demo-start-btn {
          font-size: 1.5rem;
          padding: 15px 30px;
          margin-top: 20px;
        }

        .manual-demo {
          max-width: 1200px;
          margin: 0 auto;
        }

        .demo-header {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .demo-timer h2 {
          color: #007bff;
          margin: 0;
          font-family: 'Courier New', monospace;
        }

        .instruction {
          color: #dc3545;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .hint {
          color: #007bff;
          font-style: italic;
          font-size: 1rem;
          margin-top: 5px;
        }

        .interaction-help {
          color: #28a745;
          font-weight: bold;
          font-size: 1rem;
          margin-top: 10px;
          padding: 10px;
          background: #d4edda;
          border-radius: 4px;
        }

        .demo-progress {
          text-align: right;
        }

        .completed-page {
          color: #28a745;
          font-weight: bold;
          margin: 5px 0;
        }

        .demo-page {
          min-height: 400px;
          padding: 20px;
          position: relative;
        }

        .success-overlay, .false-positive-overlay, .navigation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .success-message, .false-positive-message, .navigation-message {
          background: white;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease;
        }

        .success-message h2, .false-positive-message h2, .navigation-message h2 {
          color: #28a745;
          margin-bottom: 20px;
          font-size: 2rem;
        }

        .success-message p, .false-positive-message p, .navigation-message p {
          margin: 10px 0;
          line-height: 1.6;
        }

        .time-display {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #007bff;
          font-size: 1.2rem;
        }

        .next-page {
          color: #6c757d;
          font-style: italic;
        }

        .hint-reminder {
          color: #007bff;
          font-weight: bold;
        }

        .navigation-overlay {
          z-index: 10000 !important;
        }

        .navigation-message {
          background: white;
          border: 2px solid #007bff;
        }

        .navigation-message h2 {
          color: #007bff !important;
        }

        .navigation-btn {
          background-color: #007bff !important;
          border-color: #007bff !important;
          color: white !important;
          font-weight: bold !important;
          position: relative !important;
          z-index: 10001 !important;
          pointer-events: auto !important;
        }

        .navigation-btn:hover {
          background-color: #0056b3 !important;
          border-color: #0056b3 !important;
          transform: scale(1.05) !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default ManualDemo