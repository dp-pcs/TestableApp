describe('Percy Visual Testing - Bug Detection', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should detect visual differences in broken page', () => {
    cy.log('🔍 Testing Broken Page for Visual Differences');
    cy.visit('/broken-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(2000);
    
    // Use SAME name as baseline for comparison
    cy.percySnapshot('Baseline Page - Clean Baseline');
  });

  it('should capture components with bugs', () => {
    cy.log('🔍 Testing Components with Bugs');
    cy.visit('/broken-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(2000);
    
    // Use SAME names as baseline for comparison
    cy.get('body').then($body => {
      cy.percySnapshot('Full Page - Clean Baseline');
      
      // Only take component snapshots if elements exist
      if ($body.find('.compatibility-grid').length) {
        cy.percySnapshot('CSS Grid - Clean Baseline');
      }
      if ($body.find('.browser-card').length) {
        cy.percySnapshot('Browser Card - Clean Baseline');
      }
    });
  });

  it('should test different viewport sizes', () => {
    cy.log('🔍 Testing Responsive Bug Detection');
    cy.visit('/broken-page.html');
    
    // Wait for page to fully load
    cy.get('body').should('be.visible');
    cy.wait(2000);
    
    // Use SAME names as baseline for comparison
    cy.percySnapshot('Mobile Baseline - Clean', { widths: [375] });
    cy.percySnapshot('Desktop Baseline - Clean', { widths: [1280] });
  });
}); 