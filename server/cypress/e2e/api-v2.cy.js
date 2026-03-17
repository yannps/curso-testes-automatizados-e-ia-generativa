describe('GET /customers', () => {
  const apiUrl = Cypress.expose('apiUrl')

  it('retrieve customers with default parameters', () => {
    cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers, pageInfo } = body
      expect(customers).to.be.an('array')
      expect(pageInfo.currentPage).to.equal(1)
      expect(pageInfo.totalPages).to.be.a('number')
      expect(pageInfo.totalCustomers).to.be.a('number')
    })
  })

  it('retrieve customers with custom page and limit', () => {
    cy.request('GET', `${apiUrl}/customers?page=2&limit=5`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers, pageInfo } = body
      expect(customers.length).to.be.at.most(5)
      expect(pageInfo.currentPage).to.equal(2)
    })
  })

  it('filter customers by size Medium', () => {
    cy.request('GET', `${apiUrl}/customers?size=Medium`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(({ size }) => {
        expect(size).to.equal('Medium')
      })
    })
  })

  it('filter customers by size Enterprise', () => {
    cy.request('GET', `${apiUrl}/customers?size=Enterprise`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(({ size }) => {
        expect(size).to.equal('Enterprise')
      })
    })
  })

  it('filter customers by industry Technology', () => {
    cy.request('GET', `${apiUrl}/customers?industry=Technology`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(({ industry }) => {
        expect(industry).to.equal('Technology')
      })
    })
  })

  it('filter customers by industry Logistics', () => {
    cy.request('GET', `${apiUrl}/customers?industry=Logistics`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(({ industry }) => {
        expect(industry).to.equal('Logistics')
      })
    })
  })

  it('combine size and industry filters', () => {
    cy.request('GET', `${apiUrl}/customers?size=Medium&industry=Technology`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(({ size, industry }) => {
        expect(size).to.equal('Medium')
        expect(industry).to.equal('Technology')
      })
    })
  })

  it('retrieve customer with complete contact information', () => {
    cy.request('GET', `${apiUrl}/customers?limit=100`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      const customerWithContact = customers.find(({ contactInfo }) => contactInfo !== null)
      if (customerWithContact) {
        const { contactInfo: { name, email } } = customerWithContact
        expect(name).to.be.a('string')
        expect(email).to.be.a('string')
      }
    })
  })

  it('retrieve customer with complete address information', () => {
    cy.request('GET', `${apiUrl}/customers?limit=100`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      const customerWithAddress = customers.find(({ address }) => address !== null)
      if (customerWithAddress) {
        const { address: { street, city, state, zipCode, country } } = customerWithAddress
        expect(street).to.be.a('string')
        expect(city).to.be.a('string')
        expect(state).to.be.a('string')
        expect(zipCode).to.be.a('string')
        expect(country).to.be.a('string')
      }
    })
  })

  it('reject request with negative page number', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?page=-1`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('reject request with non-numeric page value', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?page=abc`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('reject request with negative limit value', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?limit=-5`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('reject request with non-numeric limit value', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?limit=xyz`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('reject request with invalid size value', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?size=InvalidSize`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('reject request with invalid industry value', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?industry=InvalidIndustry`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('verify customer size classification for Small customers', () => {
    cy.request('GET', `${apiUrl}/customers?size=Small`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(({ employees, size }) => {
        expect(size).to.equal('Small')
        expect(employees).to.be.lessThan(100)
      })
    })
  })

  it('verify customer size classification for Large Enterprise customers', () => {
    cy.request('GET', `${apiUrl}/customers?size=Large%20Enterprise`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(({ employees, size }) => {
        expect(size).to.equal('Large Enterprise')
        expect(employees).to.be.at.least(10000)
        expect(employees).to.be.lessThan(50000)
      })
    })
  })

  it('return correct pagination structure', () => {
    cy.request('GET', `${apiUrl}/customers?page=1&limit=10`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { pageInfo } = body
      expect(pageInfo).to.have.all.keys('currentPage', 'totalPages', 'totalCustomers')
      expect(pageInfo.currentPage).to.equal(1)
      expect(pageInfo.totalPages).to.be.a('number').and.be.greaterThan(0)
      expect(pageInfo.totalCustomers).to.be.a('number').and.be.greaterThan(0)
    })
  })

  it('return correct customer structure', () => {
    cy.request('GET', `${apiUrl}/customers?limit=1`).then(({ status, body }) => {
      expect(status).to.equal(200)
      const { customers } = body
      if (customers.length > 0) {
        const { id, name, employees, size, industry } = customers[0]
        expect(id).to.be.a('number')
        expect(name).to.be.a('string')
        expect(employees).to.be.a('number')
        expect(size).to.be.oneOf(['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise'])
        expect(industry).to.be.oneOf(['Logistics', 'Retail', 'Technology', 'HR', 'Finance'])
      }
    })
  })
})