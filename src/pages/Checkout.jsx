import React from 'react'

const Checkout = () => {
  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <div className="checkout-form">
        <h2>Shipping Information</h2>
        <form>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-input" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" className="form-input" />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" className="form-input" />
          </div>
          <button type="submit" className="btn btn-primary">Complete Order</button>
        </form>
      </div>
    </div>
  )
}

export default Checkout