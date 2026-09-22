import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { creerAdmin, creerCategorie, creerImage, creerVoiture, initPayload, viderCollections } from './helpers'

let payload: Payload

describe('Collection voitures', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['voitures', 'categories', 'media', 'users'])
  })

  it('calcule le titre et le slug depuis la marque et le modèle', async () => {
    const voiture = await creerVoiture(payload)
    expect(voiture.titre).toBe('Peugeot 208')
    expect(voiture.slug).toBe('peugeot-208')
  })

  it('ajoute -2 quand une voiture identique existe déjà', async () => {
    await creerVoiture(payload)
    const deuxieme = await creerVoiture(payload)
    expect(deuxieme.slug).toBe('peugeot-208-2')
  })

  it('garde le slug mais met à jour le titre quand on change le modèle', async () => {
    const voiture = await creerVoiture(payload)
    const modifiee = await payload.update({ collection: 'voitures', id: voiture.id, data: { modele: '2008' } })
    expect(modifiee.slug).toBe('peugeot-208')
    expect(modifiee.titre).toBe('Peugeot 2008')
  })

  it('une voiture dupliquée reçoit un nouveau slug', async () => {
    const voiture = await creerVoiture(payload)
    const copie = await payload.duplicate({ collection: 'voitures', id: voiture.id })
    expect(copie.slug).toBe('peugeot-208-2')
  })

  it('applique les valeurs par défaut (disponible, climatisation, 5 portes)', async () => {
    const voiture = await creerVoiture(payload)
    expect(voiture.disponible).toBe(true)
    expect(voiture.caracteristiques.climatisation).toBe(true)
    expect(voiture.caracteristiques.portes).toBe(5)
  })

  it('exige au moins une photo', async () => {
    const categorie = await creerCategorie(payload, 'Citadine')
    await expect(
      payload.create({
        collection: 'voitures',
        data: {
          marque: 'Fiat',
          modele: '500',
          categorie: categorie.id,
          photos: [],
          caracteristiques: { boite: 'manuelle', carburant: 'essence', places: 4 },
          tarifs: { prixJour: 30 },
        },
      }),
    ).rejects.toThrow()
  })

  it('un visiteur anonyme peut lire les voitures', async () => {
    await creerVoiture(payload)
    const resultat = await payload.find({ collection: 'voitures', overrideAccess: false })
    expect(resultat.totalDocs).toBe(1)
  })

  it('un visiteur anonyme ne peut pas créer de voiture, un admin si', async () => {
    const categorie = await creerCategorie(payload, 'SUV')
    const photo = await creerImage(payload, 'Duster', 900, 600)
    const donnees = {
      marque: 'Dacia',
      modele: 'Duster',
      categorie: categorie.id,
      photos: [photo.id],
      caracteristiques: { boite: 'manuelle' as const, carburant: 'diesel' as const, places: 5 },
      tarifs: { prixJour: 49 },
    }
    await expect(
      payload.create({ collection: 'voitures', data: donnees, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
    const admin = await creerAdmin(payload)
    const voiture = await payload.create({ collection: 'voitures', data: donnees, overrideAccess: false, user: admin })
    expect(voiture.slug).toBe('dacia-duster')
  })
})
