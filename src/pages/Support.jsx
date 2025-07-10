import React from 'react'

const Support = () => {
  return (
    <div className="support">
      <h1>Customer Support</h1>
      <div className="support-options">
        <div className="card">
          <h3>FAQ</h3>
          <p>Find answers to commonly asked questions.</p>
          <button className="btn btn-primary">View FAQ</button>
        </div>
        <div className="card">
          <h3>Live Chat</h3>
          <p>Chat with our support team in real-time.</p>
          <button className="btn btn-primary">Start Chat</button>
        </div>
        <div className="card">
          <h3>Email Support</h3>
          <p>Send us an email and we'll get back to you.</p>
          <button className="btn btn-primary">Send Email</button>
        </div>
      </div>
    </div>
  )
}

export default Support