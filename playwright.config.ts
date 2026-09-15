import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'TEACHER_SIGNUP_CODE=playwright-invite npm run dev',
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
  projects: [
    { name: 'e2e', testIgnore: /visual\// },
    { name: 'visual', testMatch: /visual\/.*\.spec\.ts/ },
  ],
});
