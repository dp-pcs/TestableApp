import React from 'react'
import { useParams } from 'react-router-dom'

const ProductDetail = () => {
  const { id } = useParams()

  return (
    <div className="product-detail">
      <h1>Product Details</h1>
      <div className="product-info">
        <img src={`https://via.placeholder.com/400x300?text=Product+${id}`} alt="Product" />
        <div className="product-details">
          <h2>Premium Product #{id}</h2>
          <p className="price">$299.99</p>
          <p>This is a detailed description of the product.</p>
          <button className="btn btn-primary">Add to Cart</button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail