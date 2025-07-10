import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const DemoControl = () => {
  const [siteState, setSiteState] = useState('unknown')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const restoreSite = async () => {
    setLoading(true)
    addLog('🔄 Restoring site to clean state...')
    
    try {
      const response = await fetch('/api/demo/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        addLog('✅ Site restored successfully')
        addLog('📸 Creating Applitools baseline...')
        setSiteState('clean')
        addLog('🎯 Ready for bug injection')
      } else {
        addLog('❌ Failed to restore site')
      }
    } catch (error) {
      addLog('❌ Error: ' + error.message)
    }
    
    setLoading(false)
  }

  const injectBugs = async () => {
    setLoading(true)
    addLog('🐛 Injecting visual bugs...')
    
    try {
      const response = await fetch('/api/demo/inject-bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        addLog('✅ Bugs injected successfully')
        addLog(`📊 ${result.bugsInjected} visual bugs added`)
        setSiteState('buggy')
        addLog('🕵️ Ready for human vs AI testing comparison')
      } else {
        addLog('❌ Failed to inject bugs')
      }
    } catch (error) {
      addLog('❌ Error: ' + error.message)
    }
    
    setLoading(false)
  }

  const checkSiteState = async () => {
    try {
      const response = await fetch('/api/demo/status')
      if (response.ok) {
        const result = await response.json()
        setSiteState(result.state)
        addLog(`ℹ️ Site state: ${result.state}`)
      }
    } catch (error) {
      addLog('❌ Could not check site state')
    }
  }

  React.useEffect(() => {
    checkSiteState()
  }, [])

  return (
    <div className="demo-control demo-control-protected" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>🎛️ Visual Testing Demo Control</h1>
      <p className="demo-description">
        Experience the difference between manual human testing and AI-powered visual testing. 
        Set up the demo, run the human challenge, then watch AI solve the same problems in seconds!
      </p>

      <div className="demo-flow" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        margin: '30px 0'
      }}>
        <div className="step-card card">
          <div className="step-number">1</div>
          <h3>🔧 Restore Site</h3>
          <p>Reset to clean state and create Applitools baseline</p>
          <button 
            onClick={restoreSite}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            {loading ? '🔄 Restoring...' : '🔧 Restore Site'}
          </button>
        </div>

        <div className="step-card card">
          <div className="step-number">2</div>
          <h3>🐛 Inject Bugs</h3>
          <p>Add obvious visual bugs for testing</p>
          <button 
            onClick={injectBugs}
            disabled={loading || siteState !== 'clean'}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? '🐛 Injecting...' : '🐛 Inject Bugs'}
          </button>
        </div>

        <div className="step-card card">
          <div className="step-number">3</div>
          <h3>🧑 Human Testing</h3>
          <p>Time yourself finding bugs manually</p>
          <Link 
            to="/manual-demo"
            className={`btn btn-warning ${siteState !== 'buggy' ? 'disabled' : ''}`}
            style={{ 
              width: '100%',
              opacity: siteState !== 'buggy' ? 0.5 : 1,
              pointerEvents: siteState !== 'buggy' ? 'none' : 'auto'
            }}
          >
            🕵️ Start Human Challenge
          </Link>
        </div>

        <div className="step-card card">
          <div className="step-number">4</div>
          <h3>🤖 AI Testing</h3>
          <p>Watch AI find the same bugs instantly</p>
          <Link 
            to="/demo-results"
            className={`btn btn-success ${siteState !== 'buggy' ? 'disabled' : ''}`}
            style={{ 
              width: '100%',
              opacity: siteState !== 'buggy' ? 0.5 : 1,
              pointerEvents: siteState !== 'buggy' ? 'none' : 'auto'
            }}
          >
            🚀 AI Vision Demo
          </Link>
        </div>
      </div>

      <div className="demo-status" style={{ 
        textAlign: 'center', 
        margin: '40px 0',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
      }}>
        <h3>Current Status</h3>
        <div className="status-indicator" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: siteState === 'clean' ? '#28a745' : siteState === 'buggy' ? '#dc3545' : '#6c757d'
        }}>
          {siteState === 'unknown' && '🔍 Checking site state...'}
          {siteState === 'clean' && '✅ Site clean - Ready to inject bugs'}
          {siteState === 'buggy' && '🐛 Bugs injected - Ready for testing!'}
        </div>
        
        {siteState === 'buggy' && (
          <div className="next-steps" style={{ marginTop: '20px' }}>
            <h4>🎯 Ready for the Challenge!</h4>
            <p>
              <strong>Recommended flow:</strong> Start with Human Testing to experience the manual process, 
              then go to AI Vision Demo to see the dramatic difference!
            </p>
            <div className="demo-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px' }}>
              <Link to="/manual-demo" className="btn btn-primary">
                🧑 Start Human Challenge
              </Link>
              <Link to="/demo-results" className="btn btn-success">
                🤖 Skip to AI Demo
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="demo-preview" style={{ 
        backgroundColor: '#e9ecef',
        padding: '25px',
        borderRadius: '12px',
        margin: '30px 0'
      }}>
        <h3>🎭 What to Expect</h3>
        <div className="preview-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div className="preview-item">
            <h4>🧑 Human Testing</h4>
            <ul>
              <li>Find 5 obvious visual bugs</li>
              <li>Time tracked per page</li>
              <li>Click on buggy elements</li>
              <li>Typical time: 2-4 minutes</li>
            </ul>
          </div>
          <div className="preview-item">
            <h4>🤖 AI Testing</h4>
            <ul>
              <li>Same 5 bugs detected instantly</li>
              <li>Pixel-perfect comparison</li>
              <li>Detailed confidence scores</li>
              <li>Typical time: 3-5 seconds</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="logs-section" style={{ marginTop: '40px' }}>
        <h3>📋 Activity Log</h3>
        <div className="logs" style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          height: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          border: '1px solid #dee2e6'
        }}>
          {logs.length === 0 ? (
            <p style={{ color: '#666' }}>No activity yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        /* PROTECTION: Override any injected CSS bugs for the demo-control page */
        .demo-control-protected {
          all: unset !important;
          display: block !important;
          max-width: 1000px !important;
          margin: 0 auto !important;
          padding: 20px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif !important;
          color: #333 !important;
          background: white !important;
        }

        /* Protect demo-control header from global bug injection */
        .demo-control-protected header,
        .demo-control-protected h1,
        .demo-control-protected h2,
        .demo-control-protected h3,
        .demo-control-protected h4 {
          background: transparent !important;
          color: #333 !important;
          font-size: initial !important;
          font-weight: normal !important;
          text-decoration: none !important;
          padding: initial !important;
          margin: initial !important;
          transform: none !important;
        }

        /* Protect demo-control buttons from global bug injection */
        .demo-control-protected .btn {
          background: #007bff !important;
          border: 1px solid #007bff !important;
          color: white !important;
          padding: 0.375rem 0.75rem !important;
          font-size: 1rem !important;
          line-height: 1.5 !important;
          border-radius: 0.375rem !important;
          text-decoration: none !important;
          display: inline-block !important;
          font-weight: 400 !important;
          text-align: center !important;
          vertical-align: middle !important;
          cursor: pointer !important;
          user-select: none !important;
          transition: all 0.15s ease-in-out !important;
          transform: none !important;
        }

        .demo-control-protected .btn-secondary {
          background: #6c757d !important;
          border-color: #6c757d !important;
        }

        .demo-control-protected .btn-primary {
          background: #007bff !important;
          border-color: #007bff !important;
        }

        .demo-control-protected .btn-warning {
          background: #ffc107 !important;
          border-color: #ffc107 !important;
          color: #212529 !important;
        }

        .demo-control-protected .btn-success {
          background: #28a745 !important;
          border-color: #28a745 !important;
        }

        /* Protect demo-control cards from global bug injection */
        .demo-control-protected .card {
          background: #fff !important;
          border: 1px solid rgba(0,0,0,.125) !important;
          border-radius: 0.375rem !important;
          margin: 0 !important;
          transform: none !important;
          position: static !important;
        }

        .demo-description {
          font-size: 1.1rem;
          text-align: center;
          color: #666;
          margin: 20px 0;
          line-height: 1.6;
        }

        .step-card {
          text-align: center;
          padding: 25px;
          position: relative;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .step-card:hover {
          transform: translateY(-2px);
        }

        .step-number {
          position: absolute;
          top: -15px;
          left: 20px;
          background: #007bff;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .step-card h3 {
          color: #007bff;
          margin: 20px 0 15px 0;
        }
        
        .step-card p {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .step-card .btn {
          transition: all 0.3s ease;
        }

        .step-card .btn:hover {
          transform: translateY(-1px);
        }

        .status-indicator {
          padding: 15px;
          border-radius: 8px;
          background: white;
          margin: 15px 0;
        }

        .next-steps {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #28a745;
        }

        .next-steps h4 {
          color: #28a745;
          margin-bottom: 10px;
        }

        .demo-buttons .btn {
          padding: 10px 20px;
          font-weight: bold;
        }

        .preview-item {
          background: white;
          padding: 20px;
          border-radius: 8px;
        }

        .preview-item h4 {
          color: #007bff;
          margin-bottom: 15px;
        }

        .preview-item ul {
          text-align: left;
          color: #666;
        }

        .preview-item li {
          margin: 8px 0;
        }
        
        .disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .logs {
          scrollbar-width: thin;
          scrollbar-color: #999 #f8f9fa;
        }
        
        .logs::-webkit-scrollbar {
          width: 8px;
        }
        
        .logs::-webkit-scrollbar-track {
          background: #f8f9fa;
        }
        
        .logs::-webkit-scrollbar-thumb {
          background: #999;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .demo-flow {
            grid-template-columns: 1fr;
          }

          .demo-buttons {
            flex-direction: column;
          }

          .preview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default DemoControl