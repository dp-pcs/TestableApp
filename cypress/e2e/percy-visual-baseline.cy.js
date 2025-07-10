describe('Percy Visual Testing - Baseline', () => {
  beforeEach(() => {
    // Ensure consistent test environment
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should capture baseline page', () => {
    cy.log('📸 Capturing Baseline Page');
    cy.visit('/baseline-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(2000); // Allow for any animations/loading
    
    // Take Percy snapshot
    cy.percySnapshot('Baseline Page');
  });

  it('should capture home page', () => {
    cy.log('📸 Capturing Home Page');
    cy.visit('/');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(2000);
    
    // Take Percy snapshot
    cy.percySnapshot('Home Page');
  });

  it('should capture broken page', () => {
    cy.log('📸 Capturing Broken Page');
    cy.visit('/broken-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(2000);
    
    // Take Percy snapshot
    cy.percySnapshot('Broken Page');
  });

  it('should capture responsive views', () => {
    cy.log('📸 Capturing Responsive Views');
    cy.visit('/baseline-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(2000);
    
    // Take responsive snapshots
    cy.percySnapshot('Baseline - Mobile', { widths: [375] });
    cy.percySnapshot('Baseline - Desktop', { widths: [1280] });
  });
}); 