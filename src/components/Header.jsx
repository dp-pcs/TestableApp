import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const Header = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header style={{ 
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <img 
              src="/testableapp_logo_transparent.png" 
              alt="TestableApp Logo" 
              style={{ 
                height: '120px', 
                width: 'auto'
              }}
            />
          </Link>
        </div>
        
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link 
              to="/" 
              style={{ 
                color: theme === 'dark' ? '#ffffff' : '#333333',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#007bff'}
              onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#ffffff' : '#333333'}
            >
              Home
            </Link>
            <Link 
              to="/demo-control" 
              style={{ 
                color: theme === 'dark' ? '#ffffff' : '#333333',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#007bff'}
              onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#ffffff' : '#333333'}
            >
              🎛️ Demo Control
            </Link>
            <Link 
              to="/shop" 
              style={{ 
                color: theme === 'dark' ? '#ffffff' : '#333333',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#007bff'}
              onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#ffffff' : '#333333'}
            >
              Shop
            </Link>
            <Link 
              to="/cart" 
              style={{ 
                color: theme === 'dark' ? '#ffffff' : '#333333',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#007bff'}
              onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#ffffff' : '#333333'}
            >
              Cart
            </Link>
            <Link 
              to="/login" 
              style={{ 
                color: theme === 'dark' ? '#ffffff' : '#333333',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#007bff'}
              onMouseLeave={(e) => e.target.style.color = theme === 'dark' ? '#ffffff' : '#333333'}
            >
              Login
            </Link>
          </div>
          
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle-icon"
            style={{
              background: 'none',
              border: `2px solid ${theme === 'dark' ? '#ffffff' : '#333333'}`,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'dark' ? '#ffffff' : '#333333'
              e.target.style.color = theme === 'dark' ? '#333333' : '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = theme === 'dark' ? '#ffffff' : '#333333'
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header