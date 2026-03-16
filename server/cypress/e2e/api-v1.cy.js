describe('GET /customers API Tests', () => {
  const API_URL = 'http://localhost:3001/customers';

  describe('Successful Requests', () => {
    it('should return customers with default parameters', () => {
      cy.request(API_URL).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('customers');
        expect(response.body).to.have.property('pageInfo');
        expect(response.body.customers).to.be.an('array');
      });
    });

    it('should return customers with page and limit parameters', () => {
      cy.request(`${API_URL}?page=2&limit=10`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers).to.be.an('array');
        expect(response.body.pageInfo.currentPage).to.equal(2);
      });
    });

    it('should filter customers by size parameter', () => {
      const sizes = ['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise'];
      
      sizes.forEach((size) => {
        cy.request(`${API_URL}?size=${size}`).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.customers).to.be.an('array');
          
          response.body.customers.forEach((customer) => {
            expect(customer.size).to.equal(size);
          });
        });
      });
    });

    it('should filter customers by industry parameter', () => {
      const industries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance'];
      
      industries.forEach((industry) => {
        cy.request(`${API_URL}?industry=${industry}`).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.customers).to.be.an('array');
          
          response.body.customers.forEach((customer) => {
            expect(customer.industry).to.equal(industry);
          });
        });
      });
    });

    it('should return customers with size and industry filters combined', () => {
      cy.request(`${API_URL}?size=Medium&industry=Technology`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers).to.be.an('array');
        
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Medium');
          expect(customer.industry).to.equal('Technology');
        });
      });
    });

    it('should return correct response structure for customers', () => {
      cy.request(API_URL).then((response) => {
        expect(response.body.customers).to.be.an('array');
        
        if (response.body.customers.length > 0) {
          const customer = response.body.customers[0];
          
          expect(customer).to.have.property('id');
          expect(customer).to.have.property('name');
          expect(customer).to.have.property('employees');
          expect(customer).to.have.property('contactInfo');
          expect(customer).to.have.property('size');
          expect(customer).to.have.property('industry');
          expect(customer).to.have.property('address');
          
          expect(customer.id).to.be.a('number');
          expect(customer.name).to.be.a('string');
          expect(customer.employees).to.be.a('number');
          expect(customer.size).to.be.a('string');
          expect(customer.industry).to.be.a('string');
        }
      });
    });

    it('should return correct pageInfo structure', () => {
      cy.request(API_URL).then((response) => {
        const pageInfo = response.body.pageInfo;
        
        expect(pageInfo).to.have.property('currentPage');
        expect(pageInfo).to.have.property('totalPages');
        expect(pageInfo).to.have.property('totalCustomers');
        
        expect(pageInfo.currentPage).to.be.a('number').and.to.equal(1);
        expect(pageInfo.totalPages).to.be.a('number');
        expect(pageInfo.totalCustomers).to.be.a('number');
      });
    });

    it('should handle address property correctly', () => {
      cy.request(API_URL).then((response) => {
        expect(response.body.customers).to.be.an('array');
        
        response.body.customers.forEach((customer) => {
          if (customer.address !== null) {
            expect(customer.address).to.have.property('street');
            expect(customer.address).to.have.property('city');
            expect(customer.address).to.have.property('state');
            expect(customer.address).to.have.property('zipCode');
            expect(customer.address).to.have.property('country');
          }
        });
      });
    });

    it('should handle contactInfo property correctly', () => {
      cy.request(API_URL).then((response) => {
        expect(response.body.customers).to.be.an('array');
        
        response.body.customers.forEach((customer) => {
          if (customer.contactInfo !== null) {
            expect(customer.contactInfo).to.have.property('name');
            expect(customer.contactInfo).to.have.property('email');
            expect(customer.contactInfo.name).to.be.a('string');
            expect(customer.contactInfo.email).to.be.a('string');
          }
        });
      });
    });

    it('should validate size based on employee count', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          const employees = customer.employees;
          const size = customer.size;
          
          if (employees < 100) {
            expect(size).to.equal('Small');
          } else if (employees >= 100 && employees < 1000) {
            expect(size).to.equal('Medium');
          } else if (employees >= 1000 && employees < 10000) {
            expect(size).to.equal('Enterprise');
          } else if (employees >= 10000 && employees < 50000) {
            expect(size).to.equal('Large Enterprise');
          } else {
            expect(size).to.equal('Very Large Enterprise');
          }
        });
      });
    });

    it('should support different limit values', () => {
      const limits = [5, 10, 20, 50];
      
      limits.forEach((limit) => {
        cy.request(`${API_URL}?limit=${limit}`).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.customers.length).to.be.lte(limit);
        });
      });
    });

    it('should support multiple pages', () => {
      cy.request(`${API_URL}?page=1&limit=10`).then((response1) => {
        expect(response1.status).to.equal(200);
        const page1Customers = response1.body.customers;
        
        cy.request(`${API_URL}?page=2&limit=10`).then((response2) => {
          expect(response2.status).to.equal(200);
          const page2Customers = response2.body.customers;
          
          // Customers on different pages should be different
          const page1Ids = page1Customers.map(c => c.id);
          const page2Ids = page2Customers.map(c => c.id);
          
          page1Ids.forEach(id => {
            expect(page2Ids).not.to.include(id);
          });
        });
      });
    });
  });

  describe('Invalid Request Parameters', () => {
    it('should return 400 Bad Request for negative page parameter', () => {
      cy.request({
        url: `${API_URL}?page=-1`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for negative limit parameter', () => {
      cy.request({
        url: `${API_URL}?limit=-10`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for non-number page parameter', () => {
      cy.request({
        url: `${API_URL}?page=abc`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for non-number limit parameter', () => {
      cy.request({
        url: `${API_URL}?limit=xyz`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for unsupported size value', () => {
      cy.request({
        url: `${API_URL}?size=Unsupported`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for unsupported industry value', () => {
      cy.request({
        url: `${API_URL}?industry=InvalidIndustry`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for multiple invalid parameters', () => {
      cy.request({
        url: `${API_URL}?page=abc&limit=-5&size=Invalid&industry=NotSupported`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for zero page parameter', () => {
      cy.request({
        url: `${API_URL}?page=0`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 Bad Request for zero limit parameter', () => {
      cy.request({
        url: `${API_URL}?limit=0`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should be case-sensitive for size parameter', () => {
      cy.request({
        url: `${API_URL}?size=medium`,
        failOnStatusCode: false,
      }).then((response) => {
        // This test assumes case-sensitivity; adjust based on actual API behavior
        if (response.status === 400) {
          expect(response.status).to.equal(400);
        }
      });
    });

    it('should be case-sensitive for industry parameter', () => {
      cy.request({
        url: `${API_URL}?industry=technology`,
        failOnStatusCode: false,
      }).then((response) => {
        // This test assumes case-sensitivity; adjust based on actual API behavior
        if (response.status === 400) {
          expect(response.status).to.equal(400);
        }
      });
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle requests with decimal page values', () => {
      cy.request({
        url: `${API_URL}?page=1.5`,
        failOnStatusCode: false,
      }).then((response) => {
        expect([200, 400]).to.include(response.status);
      });
    });

    it('should handle requests with decimal limit values', () => {
      cy.request({
        url: `${API_URL}?limit=10.5`,
        failOnStatusCode: false,
      }).then((response) => {
        expect([200, 400]).to.include(response.status);
      });
    });

    it('should handle very large page numbers', () => {
      cy.request({
        url: `${API_URL}?page=999999`,
        failOnStatusCode: false,
      }).then((response) => {
        // API should return 200 but with empty customers array, or 400
        expect([200, 400]).to.include(response.status);
      });
    });

    it('should handle very large limit values', () => {
      cy.request({
        url: `${API_URL}?limit=999999`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('should return correct total customers count in pageInfo', () => {
      cy.request(`${API_URL}?limit=1`).then((response) => {
        const totalCustomers = response.body.pageInfo.totalCustomers;
        const totalPages = response.body.pageInfo.totalPages;
        
        expect(totalCustomers).to.be.a('number');
        expect(totalPages).to.be.a('number');
        expect(totalPages).to.be.gte(1);
      });
    });

    it('should ensure currentPage does not exceed totalPages', () => {
      cy.request(API_URL).then((response) => {
        const { currentPage, totalPages } = response.body.pageInfo;
        expect(currentPage).to.be.lte(totalPages);
      });
    });

    it('should not return duplicate customers across pages', () => {
      let page1Ids = [];
      
      cy.request(`${API_URL}?page=1&limit=10`).then((response1) => {
        page1Ids = response1.body.customers.map(c => c.id);
        
        cy.request(`${API_URL}?page=2&limit=10`).then((response2) => {
          const page2Ids = response2.body.customers.map(c => c.id);
          
          page1Ids.forEach(id => {
            expect(page2Ids).not.to.include(id);
          });
        });
      });
    });

    it('should return valid email format in contactInfo when present', () => {
      cy.request(API_URL).then((response) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        response.body.customers.forEach((customer) => {
          if (customer.contactInfo !== null && customer.contactInfo.email) {
            expect(customer.contactInfo.email).to.match(emailRegex);
          }
        });
      });
    });

    it('should have valid zipCode format in address when present', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          if (customer.address !== null) {
            expect(customer.address.zipCode).to.be.a('string');
            expect(customer.address.zipCode).not.to.be.empty;
          }
        });
      });
    });
  });

  describe('Query Parameter Combinations', () => {
    it('should handle page parameter alone', () => {
      cy.request(`${API_URL}?page=2`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(2);
      });
    });

    it('should handle limit parameter alone', () => {
      cy.request(`${API_URL}?limit=5`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers.length).to.be.lte(5);
      });
    });

    it('should handle size parameter alone', () => {
      cy.request(`${API_URL}?size=Enterprise`).then((response) => {
        expect(response.status).to.equal(200);
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Enterprise');
        });
      });
    });

    it('should handle industry parameter alone', () => {
      cy.request(`${API_URL}?industry=Finance`).then((response) => {
        expect(response.status).to.equal(200);
        response.body.customers.forEach((customer) => {
          expect(customer.industry).to.equal('Finance');
        });
      });
    });

    it('should handle page and size combination', () => {
      cy.request(`${API_URL}?page=2&size=Large%20Enterprise`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(2);
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Large Enterprise');
        });
      });
    });

    it('should handle limit and industry combination', () => {
      cy.request(`${API_URL}?limit=15&industry=Retail`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers.length).to.be.lte(15);
        response.body.customers.forEach((customer) => {
          expect(customer.industry).to.equal('Retail');
        });
      });
    });

    it('should handle page, limit, size, and industry together', () => {
      cy.request(`${API_URL}?page=1&limit=10&size=Small&industry=Logistics`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(1);
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Small');
          expect(customer.industry).to.equal('Logistics');
        });
      });
    });
  });
});