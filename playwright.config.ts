import { defineConfig } from '@playwright/test';

// The base URL can be overridden: BASE_URL=https://other-host npm test
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 1, // the public demo server is shared, so allow a retry
  workers: 4,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    // Module-wise reports (HTML + CSV with the real result), committed in reports/
    ['./reporters/offline-report.ts', { outputDir: 'reports' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
