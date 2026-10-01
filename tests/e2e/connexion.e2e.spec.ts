import { expect, test } from '@playwright/test'

import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

test.describe('Connexion sécurisée', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('la page /connexion n’est pas indexable et refuse un mauvais mot de passe', async ({ page }) => {
    await page.goto('/connexion')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

    await page.getByLabel('Email').fill(testUser.email)
    await page.getByLabel('Mot de passe').fill('pas-le-bon-mot-de-passe')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Next pose son propre role="alert" invisible : on vise celui du formulaire.
    await expect(page.locator('form').getByRole('alert')).toContainText('incorrect')
    await expect(page).toHaveURL(/\/connexion$/)
  })

  test('sans double authentification, les bons identifiants ouvrent l’administration', async ({ page }) => {
    await page.goto('/connexion')
    await page.getByLabel('Email').fill(testUser.email)
    await page.getByLabel('Mot de passe').fill(testUser.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await page.waitForURL(/\/admin$/)
    await expect(page.locator('span[title="Tableau de bord"]').first()).toBeVisible()
  })
})
