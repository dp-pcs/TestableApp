import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'

const Cart = () => {
  const [cart, setCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })
  const [checkoutErrors, setCheckoutErrors] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    setCart(saved ? JSON.parse(saved) : [])
  }, [])

  const updateCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId)
    updateCart(newCart)
  }

  const updateQuantity = (productId, change) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + change)
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean)
    
    updateCart(newCart)
  }

  // BUG: Total calculation is wrong - multiplies by quantity twice
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity * item.quantity), 0).toFixed(2)
  }

  const validateCheckoutForm = () => {
    const errors = {}
    
    if (!checkoutForm.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(checkoutForm.email)) errors.email = 'Invalid email'
    
    if (!checkoutForm.firstName) errors.firstName = 'First name is required'
    if (!checkoutForm.lastName) errors.lastName = 'Last name is required'
    if (!checkoutForm.address) errors.address = 'Address is required'
    if (!checkoutForm.city) errors.city = 'City is required'
    if (!checkoutForm.zipCode) errors.zipCode = 'ZIP code is required'
    
    if (!checkoutForm.cardNumber) errors.cardNumber = 'Card number is required'
    else if (!/^\d{16}$/.test(checkoutForm.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number'
    }
    
    if (!checkoutForm.expiryDate) errors.expiryDate = 'Expiry date is required'
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(checkoutForm.expiryDate)) {
      errors.expiryDate = 'Invalid expiry date (MM/YY)'
    }
    
    if (!checkoutForm.cvv) errors.cvv = 'CVV is required'
    else if (!/^\d{3,4}$/.test(checkoutForm.cvv)) errors.cvv = 'Invalid CVV'
    
    setCheckoutErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCheckout = (e) => {
    e.preventDefault()
    
    // BUG: Checkout always fails validation even with valid data
    setCheckoutErrors({ general: 'Checkout failed. Please try again.' })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setCheckoutForm(prev => ({ ...prev, [name]: value }))
    
    if (checkoutErrors[name]) {
      setCheckoutErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', margin: '3rem 0' }}>
        <h1 data-testid="cart-title">Your Cart</h1>
        <p data-testid="empty-cart">Your cart is empty</p>
        <Link to="/shop" className="btn btn-primary" data-testid="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 data-testid="cart-title">Your Cart</h1>
      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {cart.map(item => (
          <div key={item.id} className="card" data-testid={`cart-item-${item.id}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>{item.image}</div>
              
              <div style={{ flex: 1 }}>
                <h3 data-testid={`item-name-${item.id}`}>{item.name}</h3>
                <p data-testid={`item-price-${item.id}`}>${item.price}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="btn btn-secondary"
                  data-testid={`decrease-${item.id}`}
                  style={{ width: '40px', height: '40px' }}
                >
                  -
                </button>
                
                <span data-testid={`quantity-${item.id}`} style={{ minWidth: '2rem', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="btn btn-secondary"
                  data-testid={`increase-${item.id}`}
                  style={{ width: '40px', height: '40px' }}
                >
                  +
                </button>
                
                {/* BUG: Subtotal calculation is wrong */}
                <span data-testid={`subtotal-${item.id}`} style={{ minWidth: '5rem', textAlign: 'right', fontWeight: 'bold' }}>
                  ${(item.price * item.quantity * item.quantity).toFixed(2)}
                </span>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn btn-secondary"
                  data-testid={`remove-${item.id}`}
                  style={{ backgroundColor: '#dc3545' }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ borderTop: '2px solid #ddd', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Total: <span data-testid="cart-total">${getTotalPrice()}</span></h3>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/shop" className="btn btn-secondary" data-testid="continue-shopping">
              Continue Shopping
            </Link>
            {/* BUG: Checkout button is disabled */}
            <button 
              onClick={() => setShowCheckout(true)} 
              className="btn btn-primary"
              data-testid="checkout-btn"
              disabled={true}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {showCheckout && (
        <Modal onClose={() => setShowCheckout(false)} data-testid="checkout-modal">
          <h2>Checkout</h2>
          {checkoutErrors.general && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {checkoutErrors.general}
            </div>
          )}
          <form onSubmit={handleCheckout} data-testid="checkout-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={checkoutForm.firstName}
                  onChange={handleFormChange}
                  className={`form-input ${checkoutErrors.firstName ? 'error' : ''}`}
                  data-testid="checkout-firstName"
                />
                {checkoutErrors.firstName && <div className="error-message">{checkoutErrors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={checkoutForm.lastName}
                  onChange={handleFormChange}
                  className={`form-input ${checkoutErrors.lastName ? 'error' : ''}`}
                  data-testid="checkout-lastName"
                />
                {checkoutErrors.lastName && <div className="error-message">{checkoutErrors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={checkoutForm.email}
                onChange={handleFormChange}
                className={`form-input ${checkoutErrors.email ? 'error' : ''}`}
                data-testid="checkout-email"
              />
              {checkoutErrors.email && <div className="error-message">{checkoutErrors.email}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                value={checkoutForm.address}
                onChange={handleFormChange}
                className={`form-input ${checkoutErrors.address ? 'error' : ''}`}
                data-testid="checkout-address"
              />
              {checkoutErrors.address && <div className="error-message">{checkoutErrors.address}</div>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={checkoutForm.city}
                  onChange={handleFormChange}
                  className={`form-input ${checkoutErrors.city ? 'error' : ''}`}
                  data-testid="checkout-city"
                />
                {checkoutErrors.city && <div className="error-message">{checkoutErrors.city}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={checkoutForm.zipCode}
                  onChange={handleFormChange}
                  className={`form-input ${checkoutErrors.zipCode ? 'error' : ''}`}
                  data-testid="checkout-zipCode"
                />
                {checkoutErrors.zipCode && <div className="error-message">{checkoutErrors.zipCode}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={checkoutForm.cardNumber}
                onChange={handleFormChange}
                className={`form-input ${checkoutErrors.cardNumber ? 'error' : ''}`}
                data-testid="checkout-cardNumber"
                placeholder="1234 5678 9012 3456"
              />
              {checkoutErrors.cardNumber && <div className="error-message">{checkoutErrors.cardNumber}</div>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={checkoutForm.expiryDate}
                  onChange={handleFormChange}
                  className={`form-input ${checkoutErrors.expiryDate ? 'error' : ''}`}
                  data-testid="checkout-expiryDate"
                  placeholder="MM/YY"
                />
                {checkoutErrors.expiryDate && <div className="error-message">{checkoutErrors.expiryDate}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={checkoutForm.cvv}
                  onChange={handleFormChange}
                  className={`form-input ${checkoutErrors.cvv ? 'error' : ''}`}
                  data-testid="checkout-cvv"
                  placeholder="123"
                />
                {checkoutErrors.cvv && <div className="error-message">{checkoutErrors.cvv}</div>}
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <h3>Total: ${getTotalPrice()}</h3>
              <button type="submit" className="btn btn-primary" data-testid="place-order">
                Place Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default Cart