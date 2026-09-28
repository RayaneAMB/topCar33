import { expect, test } from '@playwright/test'

import { E2E, nettoyerDonneesE2E, preparerDonneesE2E } from './fixtures'

test.describe('Fiche voiture', () => {
  test.beforeAll(async () => {
    await preparerDonneesE2E()
  })

  test.afterAll(async () => {
    await nettoyerDonneesE2E()
  })

  test('affiche caractéristiques, tarifs et bouton de contact', async ({ page }) => {
    await page.goto('/voitures/e2e-testmobile')
    await expect(page).toHaveTitle(`Location ${E2E.marque} ${E2E.modele} | TopCar33`)
    await expect(page.getByRole('heading', { level: 1, name: `${E2E.marque} ${E2E.modele}` })).toBeVisible()
    await expect(page.getByText('Électrique')).toBeVisible()
    await expect(page.getByText('Automatique')).toBeVisible()
    await expect(page.getByRole('row', { name: /Semaine/ })).toContainText('70')
    await page.getByRole('link', { name: 'Contacter pour ce véhicule' }).click()
    await expect(page).toHaveURL(/\/contact\?voiture=e2e-testmobile$/)
  })

  test('une voiture inconnue renvoie une 404', async ({ page }) => {
    const reponse = await page.goto('/voitures/voiture-inexistante')
    expect(reponse?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })
})
