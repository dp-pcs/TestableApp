import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'

const Home = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <h1 data-testid="home-title">Welcome to TestableApp</h1>
      <p>This is a demo app for testing UI automation approaches.</p>
      
      <div style={{ margin: '2rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/login" className="btn btn-primary" data-testid="get-started-btn">
          Get Started
        </Link>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-secondary"
          data-testid="learn-more-btn"
        >
          Learn More
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', margin: '3rem 0' }}>
        <div className="card" data-testid="feature-auth">
          <h3>Authentication Flow</h3>
          <p>Test login, registration, and form validation with multiple edge cases.</p>
        </div>
        
        <div className="card" data-testid="feature-shop">
          <h3>Shopping Experience</h3>
          <p>Add items to cart, checkout flow, and payment form validation.</p>
        </div>
        
        <div className="card" data-testid="feature-responsive">
          <h3>Responsive Design</h3>
          <p>Mobile-first design that adapts to different screen sizes.</p>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} data-testid="info-modal">
          <h2>About TestableApp</h2>
          <p>This application is designed to benchmark traditional UI testing approaches against AI-powered vision testing.</p>
          <p>Features include:</p>
          <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
            <li>Multiple UI flows with deliberate complexity</li>
            <li>Form validation with edge cases</li>
            <li>Modal interactions</li>
            <li>Dark mode toggle</li>
            <li>Responsive design patterns</li>
          </ul>
        </Modal>
      )}
    </div>
  )
}

export default Home