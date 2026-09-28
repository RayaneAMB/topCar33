import { expect, test } from '@playwright/test'

import { E2E, nettoyerDonneesE2E, preparerDonneesE2E } from './fixtures'

test.describe('Accueil', () => {
  test.beforeAll(async () => {
    await preparerDonneesE2E()
  })

  test.afterAll(async () => {
    await nettoyerDonneesE2E()
  })

  test('liste la voiture avec sa catégorie, son badge, ses caractéristiques et son prix', async ({ page }) => {
    await page.goto('/')
    const carte = page.getByTestId('carte-voiture').filter({ hasText: `${E2E.marque} ${E2E.modele}` })
    await expect(carte).toBeVisible()
    await expect(carte).toContainText(E2E.categorie)
    await expect(carte).toContainText('Disponible')
    await expect(carte).toContainText('Automatique · Électrique · 4 places')
    await expect(carte).toContainText('12')
    await expect(carte.getByRole('link', { name: 'Contacter' })).toHaveAttribute(
      'href',
      '/contact?voiture=e2e-testmobile',
    )
  })

  test('le filtre par catégorie n’affiche que les voitures de cette catégorie', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Filtrer par catégorie' }).getByRole('link', { name: E2E.categorie }).click()
    await expect(page).toHaveURL(/categorie=e2e-categorie/)
    await expect(page.getByTestId('carte-voiture')).toHaveCount(1)
  })

  test('un clic sur la carte ouvre la fiche de la voiture', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: `${E2E.marque} ${E2E.modele}` }).click()
    await expect(page).toHaveURL(/\/voitures\/e2e-testmobile$/)
  })
})
