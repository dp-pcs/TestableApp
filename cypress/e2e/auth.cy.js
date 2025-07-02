// cypress/e2e/auth.cy.js

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/')
  })

  describe('Login Page', () => {
    it('should display login form', () => {
      cy.visit('/login')
      cy.get('[data-testid="login-title"]').should('contain', 'Login')
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="password-input"]').should('be.visible')
      cy.get('[data-testid="login-submit"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/login')
      cy.get('[data-testid="login-submit"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    })

    it('should show validation error for invalid email', () => {
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-submit"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Please enter a valid email address')
    })

    it('should show validation error for short password', () => {
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('123')
      cy.get('[data-testid="login-submit"]').click()
      
      cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 6 characters')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type('wrong@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      cy.get('[data-testid="login-submit"]').click()
      
      cy.get('[data-testid="login-error"]').should('contain', 'Invalid email or password')
    })

    it('should login successfully with valid credentials', () => {
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-submit"]').click()
      
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-testid="home-title"]').should('be.visible')
    })

    it('should clear field errors when user starts typing', () => {
      cy.visit('/login')
      cy.get('[data-testid="login-submit"]').click()
      cy.get('[data-testid="email-error"]').should('be.visible')
      
      cy.get('[data-testid="email-input"]').type('test')
      cy.get('[data-testid="email-error"]').should('not.exist')
    })
  })

  describe('Register Page', () => {
    it('should display registration form', () => {
      cy.visit('/register')
      cy.get('[data-testid="register-title"]').should('contain', 'Create Account')
      cy.get('[data-testid="firstName-input"]').should('be.visible')
      cy.get('[data-testid="lastName-input"]').should('be.visible')
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="password-input"]').should('be.visible')
      cy.get('[data-testid="confirmPassword-input"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/register')
      cy.get('[data-testid="register-submit"]').click()
      
      cy.get('[data-testid="firstName-error"]').should('contain', 'First name is required')
      cy.get('[data-testid="lastName-error"]').should('contain', 'Last name is required')
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
      cy.get('[data-testid="confirmPassword-error"]').should('contain', 'Please confirm your password')
    })

    it('should validate password strength', () => {
      cy.visit('/register')
      cy.get('[data-testid="firstName-input"]').type('John')
      cy.get('[data-testid="lastName-input"]').type('Doe')
      cy.get('[data-testid="email-input"]').type('john@example.com')
      cy.get('[data-testid="password-input"]').type('weak')
      cy.get('[data-testid="confirmPassword-input"]').type('weak')
      cy.get('[data-testid="register-submit"]').click()
      
      cy.get('[data-testid="password-error"]').should('contain', 'Password must contain at least one uppercase letter')
    })

    it('should validate password confirmation match', () => {
      cy.visit('/register')
      cy.get('[data-testid="firstName-input"]').type('John')
      cy.get('[data-testid="lastName-input"]').type('Doe')
      cy.get('[data-testid="email-input"]').type('john@example.com')
      cy.get('[data-testid="password-input"]').type('Password123')
      cy.get('[data-testid="confirmPassword-input"]').type('Different123')
      cy.get('[data-testid="register-submit"]').click()
      
      cy.get('[data-testid="confirmPassword-error"]').should('contain', 'Passwords do not match')
    })

    it('should register successfully with valid data', () => {
      cy.visit('/register')
      cy.get('[data-testid="firstName-input"]').type('John')
      cy.get('[data-testid="lastName-input"]').type('Doe')
      cy.get('[data-testid="email-input"]').type('john@example.com')
      cy.get('[data-testid="password-input"]').type('Password123')
      cy.get('[data-testid="confirmPassword-input"]').type('Password123')
      cy.get('[data-testid="register-submit"]').click()
      
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('[data-testid="home-title"]').should('be.visible')
    })
  })

  describe('Navigation between auth pages', () => {
    it('should navigate from login to register', () => {
      cy.visit('/login')
      cy.get('[data-testid="register-link"]').click()
      cy.url().should('include', '/register')
      cy.get('[data-testid="register-title"]').should('be.visible')
    })

    it('should navigate from register to login', () => {
      cy.visit('/register')
      cy.get('[data-testid="login-link"]').click()
      cy.url().should('include', '/login')
      cy.get('[data-testid="login-title"]').should('be.visible')
    })
  })
})