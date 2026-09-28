import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { creerAdmin, creerMarque, creerVoiture, initPayload, viderCollections } from './helpers'

let payload: Payload

describe('Collection marques', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['voitures', 'marques', 'categories', 'media', 'users'])
  })

  it('génère le slug à la création', async () => {
    const marque = await creerMarque(payload, 'Mercedes-Benz')
    expect(marque.slug).toBe('mercedes-benz')
  })

  it('un visiteur anonyme peut lire les marques', async () => {
    await creerMarque(payload, 'Peugeot')
    const resultat = await payload.find({ collection: 'marques', overrideAccess: false })
    expect(resultat.totalDocs).toBe(1)
  })

  it('un visiteur anonyme ne peut pas créer de marque', async () => {
    await expect(
      payload.create({ collection: 'marques', data: { nom: 'Pirate' }, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('un admin connecté peut créer une marque', async () => {
    const admin = await creerAdmin(payload)
    const marque = await payload.create({
      collection: 'marques',
      data: { nom: 'Cupra' },
      overrideAccess: false,
      user: admin,
    })
    expect(marque.nom).toBe('Cupra')
  })

  it('refuse de supprimer une marque utilisée par une voiture', async () => {
    const marque = await creerMarque(payload, 'Peugeot')
    await creerVoiture(payload, { marque: marque.id, modele: '208' })
    await expect(payload.delete({ collection: 'marques', id: marque.id })).rejects.toThrow('utilisée par 1 voiture')
  })

  it('supprime une marque inutilisée', async () => {
    const marque = await creerMarque(payload, 'Smart')
    await payload.delete({ collection: 'marques', id: marque.id })
    expect((await payload.count({ collection: 'marques' })).totalDocs).toBe(0)
  })
})
