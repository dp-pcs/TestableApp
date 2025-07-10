import React from 'react'

const Profile = () => {
  return (
    <div className="profile">
      <h1>User Profile</h1>
      <div className="profile-form">
        <form>
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-input" defaultValue="John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" defaultValue="john@example.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" className="form-input" defaultValue="(555) 123-4567" />
          </div>
          <button 
            type="submit" 
            className="btn"
            style={{
              backgroundColor: '#ff0000',  // BUG: Should be blue (#007bff)
              borderColor: '#ff0000',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile