import React, { useState } from 'react'

const products = [
  { id: 1, name: 'Wireless Headphones', price: 99.99, image: '🎧' },
  { id: 2, name: 'Smart Watch', price: 199.99, image: '⌚' },
  { id: 3, name: 'Laptop', price: 899.99, image: '💻' },
  { id: 4, name: 'Phone Case', price: 24.99, image: '📱' },
  { id: 5, name: 'Bluetooth Speaker', price: 79.99, image: '🔊' },
  { id: 6, name: 'USB Cable', price: 12.99, image: '🔌' }
]

const Shop = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })
  
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    let newCart
    
    if (existingItem) {
      newCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price
      }
      return a.name.localeCompare(b.name)
    })

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  return (
    <div>
      <h1 data-testid="shop-title">Shop</h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label htmlFor="filter" style={{ marginRight: '0.5rem' }}>Search:</label>
          <input
            type="text"
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search products..."
            data-testid="search-input"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div>
          <label htmlFor="sort" style={{ marginRight: '0.5rem' }}>Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            data-testid="sort-select"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
        </div>
        
        <div style={{ marginLeft: 'auto' }}>
          Cart: {cart.reduce((sum, item) => sum + item.quantity, 0)} items
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2rem' 
      }}>
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="card" 
            data-testid={`product-${product.id}`}
          >
            <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>
              {product.image}
            </div>
            <h3 style={{ marginBottom: '0.5rem' }} data-testid={`product-name-${product.id}`}>
              {product.name}
            </h3>
            <p style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#007bff',
              marginBottom: '1rem'
            }} data-testid={`product-price-${product.id}`}>
              ${product.price}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => addToCart(product)}
                className="btn btn-primary"
                data-testid={`add-to-cart-${product.id}`}
                style={{ flex: 1 }}
              >
                Add to Cart
              </button>
              
              {getCartQuantity(product.id) > 0 && (
                <span 
                  style={{ 
                    background: '#007bff', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                  data-testid={`cart-quantity-${product.id}`}
                >
                  {getCartQuantity(product.id)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <p data-testid="no-products" style={{ textAlign: 'center', margin: '2rem 0' }}>
          No products found matching your search.
        </p>
      )}
    </div>
  )
}

export default Shop