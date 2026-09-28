import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Les tests partagent la base de dev : un seul à la fois.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      // Pas de `channel: 'chromium'` : sur ce PC, le Chromium complet ne démarre pas
      // (erreur Windows « side-by-side »). Le « headless shell » de Playwright fonctionne.
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Réutilise le `npm run dev` déjà lancé s'il y en a un, sinon le démarre.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
