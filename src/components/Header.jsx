import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const Header = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header style={{
      background: theme === 'dark' ? '#2a2a2a' : '#f8f9fa',
      padding: '1rem 0',
      borderBottom: '1px solid #ddd'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textDecoration: 'none',
          color: theme === 'dark' ? '#fff' : '#333'
        }}>
          TestableApp
        </Link>
        
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" className="nav-link" data-testid="home-link">Home</Link>
          <Link to="/shop" className="nav-link" data-testid="shop-link">Shop</Link>
          <Link to="/cart" className="nav-link" data-testid="cart-link">Cart</Link>
          <Link to="/login" className="nav-link" data-testid="nav-login-link">Login</Link>
          
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary"
            data-testid="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header