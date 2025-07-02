import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      if (formData.email === 'test@example.com' && formData.password === 'password123') {
        localStorage.setItem('user', JSON.stringify({ email: formData.email }))
        navigate('/')
      } else {
        setErrors({ general: 'Invalid email or password' })
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="card">
        <h2 data-testid="login-title">Login</h2>
        
        {errors.general && (
          <div className="error-message" data-testid="login-error" style={{ marginBottom: '1rem' }}>
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} data-testid="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              data-testid="email-input"
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="error-message" data-testid="email-error">
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              data-testid="password-input"
              placeholder="Enter your password"
            />
            {errors.password && (
              <div className="error-message" data-testid="password-error">
                {errors.password}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={isLoading}
            data-testid="login-submit"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center' }}>
          Don't have an account? <Link to="/register" data-testid="register-link">Register here</Link>
        </p>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <small>
            <strong>Test Credentials:</strong><br />
            Email: test@example.com<br />
            Password: password123
          </small>
        </div>
      </div>
    </div>
  )
}

export default Login