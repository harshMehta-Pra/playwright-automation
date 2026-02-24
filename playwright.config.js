// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({

  // Folder where all test files live
  testDir: './dummy-checkout/Tests',

  // Max time a single test can run (30 seconds)
  timeout: 30000,

  // Run tests one by one (not parallel) - easier for learning
  fullyParallel: false,

  // Retry failed tests 0 times (we want to see failures clearly)
  retries: 0,

  // Reporter - shows results in terminal
  reporter: 'html',

  use: {
    // Base URL so we can use relative paths in tests
    baseURL: 'http://127.0.0.1:8080',

    // Take screenshot only when test fails
    screenshot: 'only-on-failure',

    // Record trace on first retry (useful for debugging)
    trace: 'on-first-retry',

    // Slow down every action by 1 second so you can watch in --headed mode
    // Remove or set to 0 when you want full speed
    launchOptions: {
      slowMo: 1000,
    },
  },

  // Auto-start a local server before tests run
  webServer: {
    command: 'npx live-server dummy-checkout --port=8080 --no-browser',
    port: 8080,
    reuseExistingServer: true,
  },

  // Which browsers to test on
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
