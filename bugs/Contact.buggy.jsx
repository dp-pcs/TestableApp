import React from 'react'

const Contact = () => {
  return (
    <div className="contact">
      <h1>Contact Us</h1>
      <div className="contact-content">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>Email: info@example.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Address: 123 Main St, City, State 12345</p>
        </div>
        <div className="contact-form">
          <h2>Send us a Message</h2>
          <form>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-input" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="form-input" rows="4"></textarea>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                marginLeft: '50px'  // BUG: Should be aligned with form fields above
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact