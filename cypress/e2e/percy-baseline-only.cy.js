describe('Percy Baseline Establishment', () => {
  beforeEach(() => {
    // Ensure consistent test environment
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should establish clean baseline for homepage', () => {
    cy.log('📸 Establishing Homepage Baseline');
    cy.visit('/');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(3000); // Extra wait to ensure full loading
    
    // Take Percy baseline snapshot
    cy.percySnapshot('Homepage - Clean Baseline');
  });

  it('should establish clean baseline for baseline page', () => {
    cy.log('📸 Establishing Baseline Page Baseline');
    cy.visit('/baseline-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(3000);
    
    // Take Percy baseline snapshot
    cy.percySnapshot('Baseline Page - Clean Baseline');
  });

  it('should establish responsive baselines', () => {
    cy.log('📸 Establishing Responsive Baselines');
    cy.visit('/baseline-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(3000);
    
    // Take responsive baseline snapshots
    cy.percySnapshot('Mobile Baseline - Clean', { widths: [375] });
    cy.percySnapshot('Tablet Baseline - Clean', { widths: [768] });
    cy.percySnapshot('Desktop Baseline - Clean', { widths: [1280] });
  });

  it('should establish component baselines', () => {
    cy.log('📸 Establishing Component Baselines');
    cy.visit('/baseline-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(3000);
    
    // Take component baseline snapshots
    cy.percySnapshot('Full Page - Clean Baseline');
    
    // Test specific components if they exist
    cy.get('body').then($body => {
      if ($body.find('.compatibility-grid').length) {
        cy.percySnapshot('CSS Grid - Clean Baseline');
      }
      if ($body.find('.browser-card').length) {
        cy.percySnapshot('Browser Card - Clean Baseline');
      }
      if ($body.find('.feature-showcase').length) {
        cy.percySnapshot('Feature Showcase - Clean Baseline');
      }
    });
  });
}); 