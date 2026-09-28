import { expect, test } from '@playwright/test'

import { E2E, nettoyerDonneesE2E, preparerDonneesE2E, trouverDemandeE2E } from './fixtures'

let idVoiture = ''

test.describe('Contact', () => {
  test.beforeAll(async () => {
    idVoiture = (await preparerDonneesE2E()).idVoiture
  })

  test.afterAll(async () => {
    await nettoyerDonneesE2E()
  })

  test('les erreurs s’affichent sous les champs et les valeurs sont conservées', async ({ page }) => {
    await page.goto('/contact')
    await page.getByLabel('Prénom').fill('Camille')
    await page.getByLabel('Email').fill('pas-un-email')
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
    await expect(page.getByText('Adresse email invalide')).toBeVisible()
    await expect(page.getByText('Indiquez votre nom')).toBeVisible()
    await expect(page.getByLabel('Prénom')).toHaveValue('Camille')
  })

  test('voiture présélectionnée, envoi, message de remerciement et demande enregistrée', async ({ page }) => {
    await page.goto('/contact?voiture=e2e-testmobile')
    await expect(page.getByLabel('Voiture concernée')).toHaveValue('e2e-testmobile')

    await page.getByLabel('Prénom').fill('Camille')
    await page.getByLabel('Nom', { exact: true }).fill('Martin')
    await page.getByLabel('Email').fill(E2E.email)
    await page.getByLabel('Téléphone').fill('06 00 00 00 00')
    await page.getByLabel('Adresse (numéro et rue)').fill('10 cours de l’Intendance')
    await page.getByLabel('Code postal').fill('33000')
    await page.getByLabel('Ville').fill('Bordeaux')
    await page.getByLabel('Message').fill('Bonjour, est-elle disponible ce week-end ?')
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    await expect(page.getByRole('status')).toContainText('Merci Camille')
    const demande = await trouverDemandeE2E()
    expect(demande).toMatchObject({ titre: 'Camille Martin', voiture: idVoiture, statut: 'nouvelle' })
  })

  test('le bloc « Nous trouver » affiche les coordonnées et le lien d’itinéraire', async ({ page }) => {
    await page.goto('/contact')
    const bloc = page.getByRole('complementary', { name: 'Nous trouver' })
    await expect(bloc).toBeVisible()
    await expect(bloc.getByRole('link', { name: 'Itinéraire (Google Maps)' })).toHaveAttribute(
      'href',
      /^https:\/\/www\.google\.com\/maps\/search\//,
    )
  })
})
