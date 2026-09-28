import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import { Types } from 'mongoose'
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
    await viderCollections(payload, ['demandes', 'voitures', 'marques', 'categories', 'media'])
  })

  it('liste les voitures à louer par prix croissant, avec catégorie et photos chargées', async () => {
    await creerVoiture(payload, { modele: 'Trafic', marque: 'Renault', prixJour: 69 })
    await creerVoiture(payload, { modele: '208', prixJour: 35 })
    await creerVoiture(payload, { modele: 'Duster', marque: 'Dacia', prixJour: 49 })

    const { voitures, categorieActive } = await listerVoitures(payload, { offre: 'location' })

    expect(voitures.map((voiture) => voiture.tarifs?.prixJour)).toEqual([35, 49, 69])
    expect(categorieActive).toBeNull()
    expect(typeof voitures[0].categorie).toBe('object')
    expect(typeof voitures[0].photos[0]).toBe('object')
  })

  it('sépare les voitures à louer et à vendre, chacune triée par son prix', async () => {
    await creerVoiture(payload, { marque: 'Renault', modele: 'Trafic', prixJour: 69 })
    await creerVoiture(payload, { marque: 'Peugeot', modele: '208', prixJour: 35 })
    await creerVoiture(payload, { offre: 'vente', marque: 'Peugeot', modele: '308', prixVente: 12900 })
    await creerVoiture(payload, { offre: 'vente', marque: 'Citroën', modele: 'C3', prixVente: 9500 })

    const location = await listerVoitures(payload, { offre: 'location' })
    expect(location.voitures.map((voiture) => voiture.titre)).toEqual(['Peugeot 208', 'Renault Trafic'])

    const vente = await listerVoitures(payload, { offre: 'vente' })
    expect(vente.voitures.map((voiture) => voiture.titre)).toEqual(['Citroën C3', 'Peugeot 308'])
    expect(vente.voitures.map((voiture) => voiture.vente?.prix)).toEqual([9500, 12900])
  })

  it('une voiture enregistrée avant l’ajout du champ reste dans « à louer »', async () => {
    const voiture = await creerVoiture(payload, { prixJour: 35 })
    // Simule une voiture créée avant l'ajout du champ « offre ».
    const db = payload.db as MongooseAdapter
    await db.collections.voitures.collection.updateOne(
      { _id: new Types.ObjectId(voiture.id) },
      { $unset: { offre: '' } },
    )

    const { voitures } = await listerVoitures(payload, { offre: 'location' })
    expect(voitures.map((item) => item.titre)).toEqual(['Peugeot 208'])
    expect((await listerVoitures(payload, { offre: 'vente' })).voitures).toHaveLength(0)
  })

  it('limite le nombre de voitures quand on le demande (aperçu de l’accueil)', async () => {
    await creerVoiture(payload, { modele: '208', prixJour: 35 })
    await creerVoiture(payload, { modele: '308', prixJour: 45 })
    await creerVoiture(payload, { modele: '508', prixJour: 55 })

    const { voitures } = await listerVoitures(payload, { offre: 'location', limite: 2 })
    expect(voitures.map((voiture) => voiture.titre)).toEqual(['Peugeot 208', 'Peugeot 308'])
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
