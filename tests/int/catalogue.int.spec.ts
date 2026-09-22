import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { lireAgence, lirePagesLegales, listerCategories, listerVoitures, trouverVoiture } from '@/lib/catalogue'

import { creerCategorie, creerVoiture, initPayload, viderCollections } from './helpers'

let payload: Payload

describe('Catalogue', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['demandes', 'voitures', 'categories', 'media'])
  })

  it('liste les voitures par prix croissant, avec catégorie et photos chargées', async () => {
    await creerVoiture(payload, { modele: 'Trafic', marque: 'Renault', prixJour: 69 })
    await creerVoiture(payload, { modele: '208', prixJour: 35 })
    await creerVoiture(payload, { modele: 'Duster', marque: 'Dacia', prixJour: 49 })

    const { voitures, categorieActive } = await listerVoitures(payload)

    expect(voitures.map((voiture) => voiture.tarifs.prixJour)).toEqual([35, 49, 69])
    expect(categorieActive).toBeNull()
    expect(typeof voitures[0].categorie).toBe('object')
    expect(typeof voitures[0].photos[0]).toBe('object')
  })

  it('filtre par slug de catégorie', async () => {
    const suv = await creerCategorie(payload, 'SUV')
    const citadine = await creerCategorie(payload, 'Citadine')
    await creerVoiture(payload, { marque: 'Dacia', modele: 'Duster', categorie: suv.id })
    await creerVoiture(payload, { categorie: citadine.id })

    const { voitures, categorieActive } = await listerVoitures(payload, { categorieSlug: 'suv' })

    expect(voitures.map((voiture) => voiture.titre)).toEqual(['Dacia Duster'])
    expect(categorieActive?.nom).toBe('SUV')
  })

  it('une catégorie inconnue revient à « Toutes »', async () => {
    await creerVoiture(payload)
    const { voitures, categorieActive } = await listerVoitures(payload, { categorieSlug: 'inconnue' })
    expect(voitures).toHaveLength(1)
    expect(categorieActive).toBeNull()
  })

  it('trouverVoiture renvoie la voiture ou null', async () => {
    const voiture = await creerVoiture(payload)
    expect((await trouverVoiture(payload, 'peugeot-208'))?.id).toBe(voiture.id)
    expect(await trouverVoiture(payload, 'inexistante')).toBeNull()
  })

  it('listerCategories trie par nom', async () => {
    await creerCategorie(payload, 'Utilitaire')
    await creerCategorie(payload, 'Citadine')
    expect((await listerCategories(payload)).map((categorie) => categorie.nom)).toEqual(['Citadine', 'Utilitaire'])
  })

  it('lit les globals', async () => {
    await payload.updateGlobal({ slug: 'agence', data: { nom: 'TopCar33' } })
    expect((await lireAgence(payload)).nom).toBe('TopCar33')
    expect(await lirePagesLegales(payload)).toBeDefined()
  })
})
