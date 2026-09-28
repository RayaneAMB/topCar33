import { expect, test } from '@playwright/test'

import { E2E, nettoyerDonneesE2E, preparerDonneesE2E } from './fixtures'

test.describe('Location et vente', () => {
  test.beforeAll(async () => {
    await preparerDonneesE2E()
  })

  test.afterAll(async () => {
    await nettoyerDonneesE2E()
  })

  test('/location ne montre que les voitures à louer, avec leur prix par jour', async ({ page }) => {
    await page.goto('/location')
    await expect(page).toHaveTitle(/À louer/)
    const carte = page.getByTestId('carte-voiture').filter({ hasText: `${E2E.marque} ${E2E.modele}` })
    await expect(carte).toContainText('/ jour')
    for (const point of ['Automatique', 'Électrique', '4 places']) {
      await expect(carte).toContainText(point)
    }
    await expect(page.getByTestId('carte-voiture').filter({ hasText: E2E.modeleVente })).toHaveCount(0)
  })

  test('/vente ne montre que les voitures à vendre, avec prix, année et kilométrage', async ({ page }) => {
    await page.goto('/vente')
    await expect(page).toHaveTitle(/À vendre/)
    const carte = page.getByTestId('carte-voiture').filter({ hasText: `${E2E.marque} ${E2E.modeleVente}` })
    await expect(carte).toContainText('9')
    await expect(carte).not.toContainText('/ jour')
    await expect(carte).toContainText('2020')
    await expect(carte).toContainText('km')
    await expect(page.getByTestId('carte-voiture').filter({ hasText: `${E2E.modele}$` })).toHaveCount(0)
  })

  test('le filtre par catégorie fonctionne sur la page location', async ({ page }) => {
    await page.goto('/location')
    await page
      .getByRole('navigation', { name: 'Filtrer par catégorie' })
      .getByRole('link', { name: E2E.categorie })
      .click()
    await expect(page).toHaveURL(/\/location\?categorie=e2e-categorie/)
    await expect(page.getByTestId('carte-voiture')).toHaveCount(1)
  })

  test('l’accueil renvoie vers les deux pages', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Nos voitures à louer' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Nos voitures à vendre' })).toBeVisible()
    await page.getByRole('link', { name: 'Voir toutes nos voitures à vendre' }).click()
    await expect(page).toHaveURL(/\/vente$/)
  })

  test('la fiche d’une voiture à vendre montre le prix de vente et pas de tarif journalier', async ({ page }) => {
    await page.goto('/voitures/e2e-vendmobile')
    await expect(page.getByRole('heading', { level: 1, name: `${E2E.marque} ${E2E.modeleVente}` })).toBeVisible()
    await expect(page.getByRole('row', { name: /Année/ })).toContainText('2020')
    await expect(page.getByRole('row', { name: /Kilométrage/ })).toContainText('45')
    await expect(page.getByText('/ jour')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Contacter pour ce véhicule' })).toBeVisible()
  })
})
