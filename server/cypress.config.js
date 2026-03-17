const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
      expose: {
        apiUrl: 'http://localhost:3001'
      },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
