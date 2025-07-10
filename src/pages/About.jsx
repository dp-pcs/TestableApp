import React from 'react'

const About = () => {
  return (
    <div className="about">
      <h1>About Us</h1>
      <div className="about-content">
        <p>We are a leading e-commerce platform dedicated to providing quality products and exceptional service.</p>
        <div className="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="card">
              <h3>John Smith</h3>
              <p>CEO & Founder</p>
            </div>
            <div className="card">
              <h3>Jane Doe</h3>
              <p>CTO</p>
            </div>
            <div className="card">
              <h3>Bob Johnson</h3>
              <p>Head of Sales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About