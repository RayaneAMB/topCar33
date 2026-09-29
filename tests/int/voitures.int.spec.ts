import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { creerAdmin, creerCategorie, creerImage, creerMarque, creerVoiture, initPayload, viderCollections } from './helpers'

let payload: Payload

describe('Collection voitures', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['voitures', 'marques', 'categories', 'media', 'users'])
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
    const marque = await creerMarque(payload, 'Fiat')
    await expect(
      payload.create({
        collection: 'voitures',
        data: {
          offre: 'location',
          marque: marque.id,
          modele: '500',
          categorie: categorie.id,
          photos: [],
          caracteristiques: { boite: 'manuelle', carburant: 'essence', places: 4 },
          tarifs: { prixJour: 30 },
        },
      }),
    ).rejects.toThrow()
  })

  it('le nom complet remplace le nom affiché, sans changer l’URL', async () => {
    const voiture = await creerVoiture(payload, { marque: 'Renault', modele: 'Trafic' })
    expect(voiture.titre).toBe('Renault Trafic')

    const renommee = await payload.update({
      collection: 'voitures',
      id: voiture.id,
      data: { nomComplet: 'Renault Trafic L2H2 9 places' },
    })
    expect(renommee.titre).toBe('Renault Trafic L2H2 9 places')
    expect(renommee.slug).toBe('renault-trafic')
  })

  it('vider le nom complet fait revenir à « marque + modèle »', async () => {
    const voiture = await creerVoiture(payload, { marque: 'Renault', modele: 'Trafic' })
    await payload.update({ collection: 'voitures', id: voiture.id, data: { nomComplet: 'Trafic aménagé' } })
    const revenue = await payload.update({ collection: 'voitures', id: voiture.id, data: { nomComplet: '' } })
    expect(revenue.titre).toBe('Renault Trafic')
  })

  it('une voiture est « à louer » par défaut', async () => {
    const voiture = await creerVoiture(payload)
    expect(voiture.offre).toBe('location')
  })

  it('une voiture à vendre s’enregistre avec prix, année et kilométrage, sans prix par jour', async () => {
    const voiture = await creerVoiture(payload, {
      offre: 'vente',
      marque: 'Peugeot',
      modele: '308',
      prixVente: 12900,
      annee: 2019,
      kilometrage: 68000,
    })
    expect(voiture.offre).toBe('vente')
    expect(voiture.vente?.prix).toBe(12900)
    expect(voiture.vente?.annee).toBe(2019)
    expect(voiture.vente?.kilometrage).toBe(68000)
    expect(voiture.tarifs?.prixJour ?? null).toBeNull()
  })

  it('refuse une voiture à vendre sans prix de vente', async () => {
    const categorie = await creerCategorie(payload, 'Citadine')
    const marque = await creerMarque(payload, 'Fiat')
    const photo = await creerImage(payload, 'Sans prix', 900, 600)
    await expect(
      payload.create({
        collection: 'voitures',
        data: {
          offre: 'vente',
          marque: marque.id,
          modele: '500',
          categorie: categorie.id,
          photos: [photo.id],
          caracteristiques: { boite: 'manuelle', carburant: 'essence', places: 4 },
        },
      }),
    ).rejects.toThrow(/prix de vente/i)
  })

  it('refuse une voiture à louer sans prix par jour', async () => {
    const categorie = await creerCategorie(payload, 'Berline')
    const marque = await creerMarque(payload, 'Fiat')
    const photo = await creerImage(payload, 'Sans tarif', 900, 600)
    await expect(
      payload.create({
        collection: 'voitures',
        data: {
          offre: 'location',
          marque: marque.id,
          modele: 'Panda',
          categorie: categorie.id,
          photos: [photo.id],
          caracteristiques: { boite: 'manuelle', carburant: 'essence', places: 4 },
        },
      }),
    ).rejects.toThrow(/prix par jour/i)
  })

  it('un visiteur anonyme peut lire les voitures', async () => {
    await creerVoiture(payload)
    const resultat = await payload.find({ collection: 'voitures', overrideAccess: false })
    expect(resultat.totalDocs).toBe(1)
  })

  it('un visiteur anonyme ne peut pas créer de voiture, un admin si', async () => {
    const categorie = await creerCategorie(payload, 'SUV')
    const marque = await creerMarque(payload, 'Dacia')
    const photo = await creerImage(payload, 'Duster', 900, 600)
    const donnees = {
      offre: 'location' as const,
      marque: marque.id,
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
