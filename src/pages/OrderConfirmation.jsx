import React from 'react'

const OrderConfirmation = () => {
  return (
    <div className="order-confirmation">
      <h1>Order Confirmed!</h1>
      <div className="confirmation-details">
        <p>Thank you for your order. Your order number is #12345.</p>
        <p>You will receive an email confirmation shortly.</p>
        <button className="btn btn-primary">Track Order</button>
      </div>
    </div>
  )
}

export default OrderConfirmation