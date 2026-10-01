import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({
  page,
  serverURL = 'http://localhost:3000',
  user,
}: LoginOptions): Promise<void> {
  // /admin/login redirige vers la page de connexion du site, seule porte d'entrée.
  await page.goto(`${serverURL}/connexion`)

  await page.fill('#email', user.email)
  await page.fill('#motDePasse', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(`${serverURL}/admin`)

  const dashboardArtifact = page.locator('span[title="Tableau de bord"]')
  await expect(dashboardArtifact).toBeVisible()
}
