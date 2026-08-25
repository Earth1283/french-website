import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'npm run dev',
      cwd: 'server',
      url: 'https://localhost:8443/api/health',
      ignoreHTTPSErrors: true,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
  use: {
    baseURL: 'http://localhost:5173',
    ignoreHTTPSErrors: true,
  },
});
