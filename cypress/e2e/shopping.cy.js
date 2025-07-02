// cypress/e2e/shopping.cy.js

describe('Shopping Flow', () => {
  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/')
  })

  describe('Shop Page', () => {
    it('should display all products', () => {
      cy.visit('/shop')
      cy.get('[data-testid="shop-title"]').should('contain', 'Shop')
      
      // Check that all 6 products are displayed
      cy.get('[data-testid^="product-"]').should('have.length', 6)
      
      // Check specific products
      cy.get('[data-testid="product-name-1"]').should('contain', 'Wireless Headphones')
      cy.get('[data-testid="product-price-1"]').should('contain', '$99.99')
      cy.get('[data-testid="add-to-cart-1"]').should('be.visible')
    })

    it('should filter products by search', () => {
      cy.visit('/shop')
      cy.get('[data-testid="search-input"]').type('laptop')
      
      cy.get('[data-testid^="product-"]').should('have.length', 1)
      cy.get('[data-testid="product-name-3"]').should('contain', 'Laptop')
    })

    it('should show no products message when search has no results', () => {
      cy.visit('/shop')
      cy.get('[data-testid="search-input"]').type('nonexistent')
      
      cy.get('[data-testid="no-products"]').should('contain', 'No products found matching your search')
      cy.get('[data-testid^="product-"]').should('have.length', 0)
    })

    it('should sort products by name', () => {
      cy.visit('/shop')
      cy.get('[data-testid="sort-select"]').select('name')
      
      cy.get('[data-testid^="product-name-"]').first().should('contain', 'Bluetooth Speaker')
    })

    it('should sort products by price', () => {
      cy.visit('/shop')
      cy.get('[data-testid="sort-select"]').select('price')
      
      cy.get('[data-testid^="product-name-"]').first().should('contain', 'USB Cable')
    })

    it('should add product to cart', () => {
      cy.visit('/shop')
      cy.get('[data-testid="add-to-cart-1"]').click()
      
      cy.get('[data-testid="cart-quantity-1"]').should('contain', '1')
      cy.contains('Cart: 1 items').should('be.visible')
    })

    it('should increase cart quantity when adding same product multiple times', () => {
      cy.visit('/shop')
      cy.get('[data-testid="add-to-cart-1"]').click()
      cy.get('[data-testid="add-to-cart-1"]').click()
      
      cy.get('[data-testid="cart-quantity-1"]').should('contain', '2')
      cy.contains('Cart: 2 items').should('be.visible')
    })

    it('should add multiple different products to cart', () => {
      cy.visit('/shop')
      cy.get('[data-testid="add-to-cart-1"]').click()
      cy.get('[data-testid="add-to-cart-2"]').click()
      
      cy.get('[data-testid="cart-quantity-1"]').should('contain', '1')
      cy.get('[data-testid="cart-quantity-2"]').should('contain', '1')
      cy.contains('Cart: 2 items').should('be.visible')
    })
  })

  describe('Cart Page', () => {
    it('should show empty cart message when cart is empty', () => {
      cy.visit('/cart')
      cy.get('[data-testid="empty-cart"]').should('contain', 'Your cart is empty')
      cy.get('[data-testid="continue-shopping"]').should('be.visible')
    })

    it('should display cart items correctly', () => {
      cy.addProductToCart(1)
      cy.addProductToCart(2)
      cy.visit('/cart')
      
      cy.get('[data-testid="cart-item-1"]').should('be.visible')
      cy.get('[data-testid="cart-item-2"]').should('be.visible')
      cy.get('[data-testid="item-name-1"]').should('contain', 'Wireless Headphones')
      cy.get('[data-testid="item-price-1"]').should('contain', '$99.99')
    })

    it('should update quantity using increase/decrease buttons', () => {
      cy.addProductToCart(1)
      cy.visit('/cart')
      
      cy.get('[data-testid="quantity-1"]').should('contain', '1')
      cy.get('[data-testid="increase-1"]').click()
      cy.get('[data-testid="quantity-1"]').should('contain', '2')
      
      cy.get('[data-testid="decrease-1"]').click()
      cy.get('[data-testid="quantity-1"]').should('contain', '1')
    })

    it('should remove item when quantity reaches 0', () => {
      cy.addProductToCart(1)
      cy.visit('/cart')
      
      cy.get('[data-testid="cart-item-1"]').should('be.visible')
      cy.get('[data-testid="decrease-1"]').click()
      cy.get('[data-testid="cart-item-1"]').should('not.exist')
      cy.get('[data-testid="empty-cart"]').should('be.visible')
    })

    it('should remove item using remove button', () => {
      cy.addProductToCart(1)
      cy.visit('/cart')
      
      cy.get('[data-testid="cart-item-1"]').should('be.visible')
      cy.get('[data-testid="remove-1"]').click()
      cy.get('[data-testid="cart-item-1"]').should('not.exist')
      cy.get('[data-testid="empty-cart"]').should('be.visible')
    })

    it('should calculate subtotal and total correctly', () => {
      cy.addProductToCart(1) // $99.99
      cy.visit('/cart')
      
      cy.get('[data-testid="subtotal-1"]').should('contain', '$99.99')
      cy.get('[data-testid="cart-total"]').should('contain', '$99.99')
      
      cy.get('[data-testid="increase-1"]').click()
      cy.get('[data-testid="subtotal-1"]').should('contain', '$199.98')
      cy.get('[data-testid="cart-total"]').should('contain', '$199.98')
    })
  })

  describe('Checkout Flow', () => {
    beforeEach(() => {
      cy.addProductToCart(1)
      cy.visit('/cart')
    })

    it('should open checkout modal when checkout button is clicked', () => {
      cy.get('[data-testid="checkout-btn"]').click()
      cy.get('[data-testid="checkout-modal"]').should('be.visible')
      cy.get('[data-testid="checkout-form"]').should('be.visible')
    })

    it('should close checkout modal when close button is clicked', () => {
      cy.get('[data-testid="checkout-btn"]').click()
      cy.get('[data-testid="modal-close"]').click()
      cy.get('[data-testid="checkout-modal"]').should('not.exist')
    })

    it('should show validation errors for empty checkout form', () => {
      cy.get('[data-testid="checkout-btn"]').click()
      cy.get('[data-testid="place-order"]').click()
      
      // Should show multiple validation errors
      cy.contains('First name is required').should('be.visible')
      cy.contains('Last name is required').should('be.visible')
      cy.contains('Email is required').should('be.visible')
      cy.contains('Address is required').should('be.visible')
      cy.contains('City is required').should('be.visible')
      cy.contains('ZIP code is required').should('be.visible')
      cy.contains('Card number is required').should('be.visible')
      cy.contains('Expiry date is required').should('be.visible')
      cy.contains('CVV is required').should('be.visible')
    })

    it('should validate card number format', () => {
      cy.get('[data-testid="checkout-btn"]').click()
      cy.fillCheckoutForm()
      cy.get('[data-testid="checkout-cardNumber"]').clear().type('123')
      cy.get('[data-testid="place-order"]').click()
      
      cy.contains('Invalid card number').should('be.visible')
    })

    it('should validate expiry date format', () => {
      cy.get('[data-testid="checkout-btn"]').click()
      cy.fillCheckoutForm()
      cy.get('[data-testid="checkout-expiryDate"]').clear().type('13/25')
      cy.get('[data-testid="place-order"]').click()
      
      cy.contains('Invalid expiry date').should('be.visible')
    })

    it('should complete checkout successfully with valid data', () => {
      cy.get('[data-testid="checkout-btn"]').click()
      cy.fillCheckoutForm()
      cy.get('[data-testid="place-order"]').click()
      
      // Should show success and redirect to empty cart
      cy.get('[data-testid="empty-cart"]').should('be.visible')
    })
  })

  describe('End-to-End Shopping Flow', () => {
    it('should complete full shopping journey', () => {
      // Start on home page
      cy.visit('/')
      cy.get('[data-testid="home-title"]').should('be.visible')
      
      // Navigate to shop
      cy.get('[data-testid="shop-link"]').click()
      cy.url().should('include', '/shop')
      
      // Search for a product
      cy.get('[data-testid="search-input"]').type('headphones')
      cy.get('[data-testid^="product-"]').should('have.length', 1)
      
      // Add product to cart
      cy.get('[data-testid="add-to-cart-1"]').click()
      cy.get('[data-testid="cart-quantity-1"]').should('be.visible')
      
      // Navigate to cart
      cy.get('[data-testid="cart-link"]').click()
      cy.url().should('include', '/cart')
      
      // Verify cart contents
      cy.get('[data-testid="cart-item-1"]').should('be.visible')
      cy.get('[data-testid="cart-total"]').should('contain', '$99.99')
      
      // Proceed to checkout
      cy.get('[data-testid="checkout-btn"]').click()
      cy.fillCheckoutForm()
      cy.get('[data-testid="place-order"]').click()
      
      // Verify successful checkout
      cy.get('[data-testid="empty-cart"]').should('be.visible')
    })
  })
})