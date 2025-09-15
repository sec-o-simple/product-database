function randomName(prefix) {
  return `${prefix}-${Math.random().toString(36).substring(2, 15)}`;
}

describe('Database Setup', () => {
  const vendor = randomName('vendor');
  const product = randomName('product');

  it('set up vendor, product, version, relationship and id helper', () => {
    cy.visit('/');
    cy.contains('Create Vendor').click();
    cy.contains('label', 'Name').click().type(vendor);
    cy.get('[role="dialog"]').find('button').contains('Create').click();
    cy.url().should('include', '/vendors/');
    cy.url().as('vendorUrl');
  });

  it('should set up a product', function () {
    cy.visit(this.vendorUrl);
    cy.contains('Create Product').click();
    cy.contains('label', 'Name').click().type(product);
    cy.get('[role="dialog"]').find('button').contains('Create').click();
    cy.url().should('include', '/products/');
    cy.url().as('productUrl');
  });

  it('should set up two versions', function () {
    cy.visit(this.productUrl);
    cy.contains('Create Version').click();
    cy.contains('label', 'Version Number').click().type('1.0.0');
    cy.get('[role="dialog"]').find('button').contains('Create').click();
    cy.url().should('include', '/product-versions/');

    cy.visit(this.productUrl);
    cy.contains('Create Version').click();
    cy.contains('label', 'Version Number').click().type('2.0.0');
    cy.get('[role="dialog"]').find('button').contains('Create').click();
    cy.url().should('include', '/product-versions/');
    cy.url().as('versionUrl');
  });

  it('should set up a relationship', function () {
    cy.visit(this.versionUrl);
    cy.contains('Create Relationship').click();
    cy.contains('label[data-slot="label"]', 'Relationship Category')
      .parent()
      .find('[aria-haspopup="listbox"]').scrollIntoView().should('be.visible').click();
    cy.contains('li', 'Default Component Of').click();
    cy.contains('Target Products').parent().find('button').click();

    cy.contains('Target Products').parent().parent().find('[aria-haspopup="listbox"]').first().scrollIntoView().should('be.visible').click();
    cy.contains('li', `${vendor} ${product}`).click();

    cy.contains('Target Products').parent().parent().find('[aria-haspopup="listbox"]').last().scrollIntoView().should('be.visible').click();
    cy.contains('li', '1.0.0').click();

    cy.get('[role="dialog"]').find('button').contains('Create').click();
  });

  it('should set up an ID Helper', function () {
    cy.visit(this.versionUrl);
    cy.contains('Identification Helpers').click();
    cy.contains('Add PURL').click();
    cy.contains('label', 'PURL String').click().type('pkg:npm/package@1.0.0');
    cy.get('[role="dialog"]').find('button').contains('Save').click();
    cy.contains('pkg:npm/package@1.0.0').should('exist');
  });
});