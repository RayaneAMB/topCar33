import { expect, test } from '@playwright/test'

import { E2E, nettoyerDonneesE2E, preparerDonneesE2E } from './fixtures'

let slug = ''

test.describe('Tour à 360°', () => {
  test.beforeAll(async () => {
    slug = (await preparerDonneesE2E()).slugVoiture
  })

  test.afterAll(async () => {
    await nettoyerDonneesE2E()
  })

  test('le visiteur fait tourner la voiture au doigt, et le curseur suit', async ({ page }) => {
    await page.goto(`/voitures/${slug}`)

    const tour = page.getByRole('img', { name: /vue à 360 degrés/i })
    await tour.scrollIntoViewIfNeeded()
    // Les vues n'arrivent qu'à l'approche de l'écran : on attend qu'elles soient là.
    await expect(tour.locator('img')).toHaveCount(E2E.vuesTour)
    await expect(tour).toContainText('Glissez pour tourner')

    const curseur = page.getByRole('slider', { name: /angle de vue/i })
    await expect(curseur).toHaveValue('0')

    const cadre = await tour.boundingBox()
    if (!cadre) throw new Error('Tour introuvable')
    await page.mouse.move(cadre.x + cadre.width / 2, cadre.y + cadre.height / 2)
    await page.mouse.down()
    await page.mouse.move(cadre.x + cadre.width / 2 + 40, cadre.y + cadre.height / 2, { steps: 5 })
    await page.mouse.up()

    await expect(curseur).not.toHaveValue('0')
  })

  test('les flèches du clavier tournent aussi la voiture', async ({ page }) => {
    await page.goto(`/voitures/${slug}`)

    const tour = page.getByRole('img', { name: /vue à 360 degrés/i })
    await tour.focus()
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('slider', { name: /angle de vue/i })).toHaveValue('1')
  })

  test('une voiture sans tour n’affiche pas le bloc', async ({ page }) => {
    await page.goto('/voitures/renault-clio')
    await expect(page.getByRole('img', { name: /vue à 360 degrés/i })).toHaveCount(0)
  })
})
