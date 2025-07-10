// Import Percy command
import '@percy/cypress';

// Import existing commands
import './commands';

// Before each test, ensure Percy is ready
beforeEach(() => {
  // Wait for page to be fully loaded
  cy.get('body').should('be.visible');
  
  // Wait for any initial loading to complete
  cy.wait(500);
}); 