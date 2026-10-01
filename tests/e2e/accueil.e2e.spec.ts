import { expect, test } from '@playwright/test'

import { E2E, nettoyerDonneesE2E, preparerDonneesE2E } from './fixtures'

test.describe('Accueil', () => {
  test.beforeAll(async () => {
    await preparerDonneesE2E()
  })

  test.afterAll(async () => {
    await nettoyerDonneesE2E()
  })

  test('la bannière fait défiler les voitures, chacune menant à sa fiche', async ({ page }) => {
    await page.goto('/')
    const vitrine = page.getByRole('group', { name: 'Voitures du parc' })
    await expect(vitrine).toBeVisible()

    // La souris sur la vitrine met le défilement en pause : le test devient stable.
    await vitrine.hover()
    const active = vitrine.locator('div[aria-hidden="false"]')
    await expect(active).toHaveCount(1)
    await expect(active).toContainText('€')

    const nom = (await active.getByRole('link').innerText()).trim()
    await active.getByRole('link').click()

    await expect(page).toHaveURL(/\/voitures\/.+/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(nom)
  })

  test('la voiture de fond tourne au fil du défilement', async ({ page }) => {
    await page.goto('/')
    const fond = page.locator('.fond-rotatif')
    await expect(fond).toHaveAttribute('data-anime', 'oui')

    const vueAffichee = () =>
      fond.locator('img').evaluateAll((images) => images.findIndex((i) => !i.classList.contains('invisible')))
    const avant = await vueAffichee()

    await page.mouse.wheel(0, 1500)
    await expect.poll(vueAffichee).not.toBe(avant)

    // Le décor ne doit jamais intercepter un clic destiné au contenu.
    await expect(fond).toHaveCSS('pointer-events', 'none')
  })

  test('on balaie la bannière pour passer d’une voiture à l’autre', async ({ page }) => {
    await page.goto('/')
    const vitrine = page.getByRole('group', { name: 'Voitures du parc' })
    // La puce active dit quelle voiture est montrée : plus lisible et plus sûr
    // que de fouiller les blocs empilés de la vitrine.
    const affichee = () =>
      page
        .getByRole('button', { name: /^Voir / })
        .evaluateAll((puces) => puces.findIndex((puce) => puce.getAttribute('aria-current') === 'true'))

    // La souris sur la vitrine met d'abord la rotation en pause, ensuite seulement
    // on fixe la première voiture : dans l'autre ordre, le défilement automatique
    // repart et fausse la comparaison.
    await vitrine.hover()
    await page.getByRole('button', { name: /^Voir / }).first().click()
    await vitrine.hover()
    await expect.poll(affichee).toBe(0)

    const boite = await vitrine.boundingBox()
    if (!boite) throw new Error('Bannière introuvable')
    await page.mouse.move(boite.x + boite.width * 0.7, boite.y + boite.height / 2)
    await page.mouse.down()
    await page.mouse.move(boite.x + boite.width * 0.2, boite.y + boite.height / 2, { steps: 12 })
    await page.mouse.up()

    // Un balayage vers la gauche avance d'une voiture, jamais de plusieurs.
    await expect.poll(affichee).toBe(1)
  })

  test('les puces de la bannière choisissent la voiture affichée', async ({ page }) => {
    await page.goto('/')
    const puces = page.getByRole('button', { name: /^Voir / })
    await expect(puces.first()).toBeVisible()

    const derniere = puces.last()
    await derniere.click()

    await expect(derniere).toHaveAttribute('aria-current', 'true')
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
      '/contact?voiture=tesla-testmobile',
    )
  })

  test('un clic sur la carte ouvre la fiche de la voiture', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: `${E2E.marque} ${E2E.modele}` }).first().click()
    await expect(page).toHaveURL(/\/voitures\/tesla-testmobile$/)
  })
})
