import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'pnpm dev --port 5188',
    url: 'https://localhost:5188',
    reuseExistingServer: false,
    ignoreHTTPSErrors: true,
  },
  use: {
    baseURL: 'https://localhost:5188',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})
