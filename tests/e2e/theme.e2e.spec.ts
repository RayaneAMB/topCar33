import { expect, test } from '@playwright/test'

const fond = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)

test.describe('Thème clair / sombre', () => {
  test('le visiteur choisit son thème et le choix est mémorisé', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')

    // Par défaut : le site suit le réglage sombre de l'appareil.
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/)
    const fondSysteme = await fond(page)

    await page.getByRole('button', { name: 'Thème clair' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'clair')
    const fondClair = await fond(page)
    expect(fondClair).not.toBe(fondSysteme)
    expect(fondClair).toBe('rgb(255, 255, 255)')

    // Le choix survit au rechargement, même avec un appareil en sombre.
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'clair')
    expect(await fond(page)).toBe('rgb(255, 255, 255)')

    await page.getByRole('button', { name: 'Thème sombre' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'sombre')
    expect(await fond(page)).toBe('rgb(13, 16, 17)')

    await page.getByRole('button', { name: 'Thème du système' }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/)
  })

  test('le logo s’adapte au thème', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    const couleur = page.locator('header .logo-couleur')
    const blanc = page.locator('header .logo-blanc')
    await expect(couleur).toBeVisible()
    await expect(blanc).toBeHidden()

    await page.getByRole('button', { name: 'Thème sombre' }).click()
    await expect(blanc).toBeVisible()
    await expect(couleur).toBeHidden()
  })
})
