import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { creerAdmin, creerCategorie, creerVoiture, initPayload, viderCollections } from './helpers'

let payload: Payload

describe('Collection catégories', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['voitures', 'categories', 'media', 'users'])
  })

  it('génère le slug à la création', async () => {
    const categorie = await payload.create({ collection: 'categories', data: { nom: 'Citadine électrique' } })
    expect(categorie.slug).toBe('citadine-electrique')
  })

  it('ajoute un suffixe quand le slug existe déjà', async () => {
    await payload.create({ collection: 'categories', data: { nom: 'Écologique' } })
    const doublon = await payload.create({ collection: 'categories', data: { nom: 'Ecologique' } })
    expect(doublon.slug).toBe('ecologique-2')
  })

  it('garde le même slug quand on renomme la catégorie', async () => {
    const categorie = await payload.create({ collection: 'categories', data: { nom: 'SUV' } })
    const renommee = await payload.update({
      collection: 'categories',
      id: categorie.id,
      data: { nom: 'Tout-terrain' },
    })
    expect(renommee.slug).toBe('suv')
  })

  it('un visiteur anonyme peut lire les catégories', async () => {
    await payload.create({ collection: 'categories', data: { nom: 'Utilitaire' } })
    const resultat = await payload.find({ collection: 'categories', overrideAccess: false })
    expect(resultat.totalDocs).toBe(1)
  })

  it('un visiteur anonyme ne peut pas créer de catégorie', async () => {
    await expect(
      payload.create({ collection: 'categories', data: { nom: 'Pirate' }, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('un admin connecté peut créer une catégorie', async () => {
    const admin = await creerAdmin(payload)
    const categorie = await payload.create({
      collection: 'categories',
      data: { nom: 'Berline' },
      overrideAccess: false,
      user: admin,
    })
    expect(categorie.slug).toBe('berline')
  })

  it('refuse de supprimer une catégorie utilisée par une voiture', async () => {
    const categorie = await creerCategorie(payload, 'Citadine')
    await creerVoiture(payload, { categorie: categorie.id })
    await expect(payload.delete({ collection: 'categories', id: categorie.id })).rejects.toThrow(
      'utilisée par 1 voiture',
    )
  })

  it('supprime une catégorie inutilisée', async () => {
    const categorie = await creerCategorie(payload, 'Cabriolet')
    await payload.delete({ collection: 'categories', id: categorie.id })
    const restantes = await payload.count({ collection: 'categories' })
    expect(restantes.totalDocs).toBe(0)
  })
})
