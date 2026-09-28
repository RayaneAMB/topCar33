import { expect, test } from '@playwright/test'

test.describe('Socle du site', () => {
  test('page en français avec en-tête, navigation et pied de page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    const navigation = page.getByRole('navigation', { name: 'Navigation principale' })
    await expect(navigation.getByRole('link', { name: 'À louer' })).toBeVisible()
    await expect(navigation.getByRole('link', { name: 'À vendre' })).toBeVisible()
    await expect(navigation.getByRole('link', { name: 'Contact', exact: true })).toBeVisible()
    await expect(page.getByRole('contentinfo')).toContainText('Mentions légales')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('une page inconnue affiche la page 404 en français', async ({ page }) => {
    const reponse = await page.goto('/cette-page-n-existe-pas')
    expect(reponse?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })
})
