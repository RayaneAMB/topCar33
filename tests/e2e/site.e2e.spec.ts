import { expect, test } from '@playwright/test'

test.describe('Socle du site', () => {
  test('page en français avec en-tête, navigation et pied de page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    const navigation = page.getByRole('navigation', { name: 'Navigation principale' })
    await expect(navigation.getByRole('link', { name: 'À louer' })).toBeVisible()
    await expect(navigation.getByRole('link', { name: 'À vendre' })).toBeVisible()
    await expect(navigation.getByRole('link', { name: 'Nous contacter' })).toBeVisible()
    // Un seul lien vers le contact dans le menu.
    await expect(navigation.getByRole('link', { name: /contact/i })).toHaveCount(1)
    // Plus de bande de coordonnées au-dessus du logo : elles vivent dans le pied de page.
    await expect(page.getByRole('complementary', { name: 'Coordonnées' })).toHaveCount(0)
    const pied = page.getByRole('contentinfo')
    await expect(pied).toContainText('Mentions légales')
    await expect(pied.locator('a[href^="tel:"]')).toBeVisible()
    await expect(pied.locator('a[href^="https://www.google.com/maps/search/"]')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('sur mobile, la navigation passe par un menu déroulant', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    // Menu fermé : le haut de l'écran ne montre que le logo et le bouton.
    await expect(page.locator('header').getByRole('link', { name: 'À louer', exact: true })).toBeHidden()

    await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
    const menu = page.getByRole('navigation', { name: 'Navigation principale' })
    await expect(menu.getByRole('link', { name: 'À louer' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Nous contacter' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Thème du site' })).toBeVisible()

    // Les coordonnées de l'agence sont accessibles depuis le menu.
    const panneau = page.locator('#menu-mobile')
    await expect(panneau.locator('a[href^="tel:"]')).toBeVisible()
    await expect(panneau.locator('a[href^="https://www.google.com/maps/search/"]')).toBeVisible()

    // Un clic sur un lien navigue et referme le menu.
    await menu.getByRole('link', { name: 'À vendre' }).click()
    await expect(page).toHaveURL(/\/vente$/)
    await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeVisible()
  })

  test('le décor tournant habille toutes les pages, pied de page compris', async ({ page }) => {
    for (const adresse of ['/', '/location', '/contact']) {
      await page.goto(adresse)
      await expect(page.locator('.fond-rotatif')).toHaveCount(1)
    }

    // Le pied de page doit laisser passer le décor : un fond opaque le couperait net.
    // Tailwind exprime l'opacité en `color-mix`, d'où la comparaison au fond opaque.
    const [pied, opaque] = await page.evaluate(() => {
      const element = document.querySelector('footer')
      const temoin = document.createElement('div')
      temoin.className = 'bg-fond-alt'
      document.body.append(temoin)
      const couleurs = [getComputedStyle(element!).backgroundColor, getComputedStyle(temoin).backgroundColor]
      temoin.remove()
      return couleurs
    })
    expect(pied).not.toBe(opaque)
  })

  test('une page inconnue affiche la page 404 en français', async ({ page }) => {
    const reponse = await page.goto('/cette-page-n-existe-pas')
    expect(reponse?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })
})
