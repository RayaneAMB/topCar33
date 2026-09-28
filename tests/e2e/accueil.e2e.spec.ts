import { expect, test } from '@playwright/test'

import { E2E, nettoyerDonneesE2E, preparerDonneesE2E } from './fixtures'

test.describe('Accueil', () => {
  test.beforeAll(async () => {
    await preparerDonneesE2E()
  })

  test.afterAll(async () => {
    await nettoyerDonneesE2E()
  })

  test('montre un aperçu des voitures à louer avec catégorie, badge, caractéristiques et prix', async ({ page }) => {
    await page.goto('/')
    const carte = page.getByTestId('carte-voiture').filter({ hasText: `${E2E.marque} ${E2E.modele}` })
    await expect(carte).toBeVisible()
    await expect(carte).toContainText(E2E.categorie)
    await expect(carte).toContainText('Disponible')
    for (const point of ['Automatique', 'Électrique', '4 places']) {
      await expect(carte).toContainText(point)
    }
    await expect(carte).toContainText('12')
    await expect(carte.getByRole('link', { name: 'Contacter' })).toHaveAttribute(
      'href',
      '/contact?voiture=e2e-testmobile',
    )
  })

  test('un clic sur la carte ouvre la fiche de la voiture', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: `${E2E.marque} ${E2E.modele}` }).first().click()
    await expect(page).toHaveURL(/\/voitures\/e2e-testmobile$/)
  })
})
