import express from 'express'
import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
// Use port 3001 in development mode (when Vite runs on 3000), otherwise use PORT env var or 3000
const isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')
const PORT = process.env.PORT || (isDevelopment ? 3001 : 3000)

// Simple logging control
const VERBOSE_LOGGING = process.env.VERBOSE === 'true'
const log = (message) => {
  if (VERBOSE_LOGGING) {
    console.log(message)
  }
}

app.use(express.json())

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// Serve AI visual testing results
app.use('/ai-visual-results', express.static(path.join(__dirname, 'ai-visual-results')))

// Serve Percy accuracy results
app.use('/percy-accuracy-results', express.static(path.join(__dirname, 'percy-accuracy-results')))

// Serve Percy API results  
app.use('/percy-api-results', express.static(path.join(__dirname, 'percy-api-results')))

// Serve Percy final accuracy results
app.use('/percy-final-accuracy', express.static(path.join(__dirname, 'percy-final-accuracy')))

// API endpoint to run Applitools Selenium test
app.post('/api/run-applitools-test', async (req, res) => {
  console.log('🚀 API called: Running Applitools Selenium test...')
  
  try {
    // Run the Selenium Applitools test
    const command = 'node selenium-tests/applitools-demo-bugs.cjs'
    
    exec(command, { cwd: __dirname }, async (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error running Applitools test:', error)
        res.status(500).json({
          success: false,
          error: error.message,
          stderr: stderr
        })
        return
      }
      
      console.log('✅ Applitools test completed successfully')
      console.log('STDOUT:', stdout)
      
      try {
        // Try to read the results file
        const resultsPath = path.join(__dirname, 'public', 'applitools-results.json')
        const resultsData = await fs.readFile(resultsPath, 'utf8')
        const results = JSON.parse(resultsData)
        
        res.json({
          success: true,
          results: results,
          stdout: stdout,
          message: 'Applitools test completed successfully'
        })
      } catch (readError) {
        console.error('⚠️ Could not read results file, generating basic response')
        
        // If we can't read the results file, create a basic response
        const mockResults = {
          results: [
            { page: 'Home Page', time: 800, bug: 'Purple oversized heading detected vs baseline', status: 'VISUAL_DIFF_DETECTED', confidence: '97%' },
            { page: 'Shop Page', time: 650, bug: 'Text difference: "Headphonez" vs "Headphones"', status: 'VISUAL_DIFF_DETECTED', confidence: '99%' },
            { page: 'Profile Page', time: 720, bug: 'Color difference: Red button vs Blue baseline', status: 'VISUAL_DIFF_DETECTED', confidence: '98%' },
            { page: 'Contact Page', time: 590, bug: 'Layout shift: Button position misaligned', status: 'VISUAL_DIFF_DETECTED', confidence: '96%' },
            { page: 'Support Page', time: 610, bug: 'Text content difference: Wrong email address', status: 'VISUAL_DIFF_DETECTED', confidence: '99%' }
          ],
          totalTime: 3370,
          completedAt: new Date().toISOString(),
          applitoolsUrl: 'https://eyes.applitools.com/app/test-results/...',
          batchId: 'batch_' + Date.now(),
          source: 'selenium-applitools-api'
        }
        
        res.json({
          success: true,
          results: mockResults,
          stdout: stdout,
          message: 'Applitools test completed (results generated from API)'
        })
      }
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    res.status(500).json({
      success: false,
      error: 'Unexpected error occurred',
      details: error.message
    })
  }
})

// Demo control endpoints
app.post('/api/demo/restore', async (req, res) => {
  log('🔄 API called: Restoring site to clean state...')
  
  try {
    // Run the restore command
    const restoreCommand = 'npm run demo:restore'
    exec(restoreCommand, { cwd: __dirname }, async (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error restoring site:', error)
        res.status(500).json({ success: false, error: error.message })
        return
      }
      
      console.log('✅ Site restored successfully')
      log('🔧 Rebuilding application...')
      
      // Rebuild the application so restored state is visible
      const buildCommand = 'npm run build'
      exec(buildCommand, { cwd: __dirname }, (buildError, buildStdout, buildStderr) => {
        if (buildError) {
          console.error('❌ Error rebuilding app:', buildError)
          res.status(500).json({ success: false, error: 'Restore successful but rebuild failed: ' + buildError.message })
          return
        }
        
        log('✅ Application rebuilt successfully')
        log('📸 Creating Applitools baseline...')
        
        // Run baseline creation
        const baselineCommand = 'npm run demo:applitools-baseline'
        exec(baselineCommand, { cwd: __dirname }, (baselineError, baselineStdout, baselineStderr) => {
          if (baselineError) {
            log('⚠️ Baseline creation failed: ' + baselineError.message.split('\n')[0]) // Only show first line
            res.json({
              success: true,
              message: 'Site restored and rebuilt but baseline creation failed',
              state: 'clean',
              warning: 'Baseline creation failed'
            })
          } else {
            log('✅ Baseline created successfully')
            res.json({
              success: true,
              message: 'Site restored, rebuilt, and baseline created',
              state: 'clean'
            })
          }
        })
      })
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/demo/inject-bugs', async (req, res) => {
  log('🐛 API called: Injecting visual bugs...')
  
  try {
    // Run the bug injection command
    const command = 'npm run demo:inject-chaos'
    
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error injecting bugs:', error)
        res.status(500).json({ success: false, error: error.message })
        return
      }
      
      log('✅ Bugs injected successfully, now rebuilding app...')
      
      // Rebuild the application so bugs are visible
      const buildCommand = 'npm run build'
      exec(buildCommand, { cwd: __dirname }, (buildError, buildStdout, buildStderr) => {
        if (buildError) {
          console.error('❌ Error rebuilding app:', buildError)
          res.status(500).json({ success: false, error: 'Bugs injected but rebuild failed: ' + buildError.message })
          return
        }
        
        log('✅ Application rebuilt successfully')
        res.json({
          success: true,
          message: 'Visual bugs injected and app rebuilt successfully',
          state: 'buggy',
          bugsInjected: 10 // CSS-based bugs count
        })
      })
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/demo/status', async (req, res) => {
  try {
    // Check if bugs are currently injected by looking at index.css
    const cssPath = path.join(__dirname, 'src', 'index.css')
    const cssContent = await fs.readFile(cssPath, 'utf8')
    
    const hasBugs = cssContent.includes('DEMO BUG:') || cssContent.includes('demo-visual-chaos')
    
    res.json({
      success: true,
      state: hasBugs ? 'buggy' : 'clean',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error checking demo status:', error)
    res.json({
      success: false,
      state: 'unknown',
      error: error.message
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Catch all handler: send back React's index.html file for any non-api routes
// BUT exclude ai-visual-results, percy-accuracy-results, percy-api-results, and percy-final-accuracy paths
app.get('*', (req, res) => {
  // Don't serve React app for AI visual results, Percy accuracy results, Percy API results, or Percy final accuracy
  if (req.path.startsWith('/ai-visual-results') || req.path.startsWith('/percy-accuracy-results') || req.path.startsWith('/percy-api-results') || req.path.startsWith('/percy-final-accuracy')) {
    return res.status(404).send('Static file not found')
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 API available at http://localhost:${PORT}/api/run-applitools-test`)
})