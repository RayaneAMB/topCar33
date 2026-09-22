import type { Payload, RequiredDataFromCollectionSlug } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { creerAdmin, initPayload, viderCollections } from './helpers'

let payload: Payload

type DonneesDemande = RequiredDataFromCollectionSlug<'demandes'>

// `statut` est volontairement absent : on vérifie que Payload applique la valeur par défaut.
const donneesDemande = (surcharges: Partial<DonneesDemande> = {}) =>
  ({
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean@exemple.fr',
    telephone: '06 12 34 56 78',
    adresse: { rue: '3 rue des Lilas', codePostal: '33000', ville: 'Bordeaux' },
    message: 'Bonjour, la voiture est-elle libre samedi ?',
    ...surcharges,
  }) as DonneesDemande

describe('Collection demandes', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['demandes', 'users'])
  })

  it('calcule le titre « Prénom Nom » et met le statut « nouvelle » par défaut', async () => {
    const demande = await payload.create({ collection: 'demandes', data: donneesDemande() })
    expect(demande.titre).toBe('Jean Dupont')
    expect(demande.statut).toBe('nouvelle')
  })

  it('les indicateurs de mails sont à faux par défaut', async () => {
    const demande = await payload.create({ collection: 'demandes', data: donneesDemande() })
    expect(demande.mailAgenceEnvoye).toBe(false)
    expect(demande.mailClientEnvoye).toBe(false)
  })

  it('refuse un message de plus de 2000 caractères', async () => {
    await expect(
      payload.create({ collection: 'demandes', data: donneesDemande({ message: 'a'.repeat(2001) }) }),
    ).rejects.toThrow()
  })

  it('un visiteur anonyme ne peut pas lire les demandes', async () => {
    await payload.create({ collection: 'demandes', data: donneesDemande() })
    await expect(payload.find({ collection: 'demandes', overrideAccess: false })).rejects.toMatchObject({
      status: 403,
    })
  })

  it('un visiteur anonyme ne peut pas créer de demande par l’API', async () => {
    await expect(
      payload.create({ collection: 'demandes', data: donneesDemande(), overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('un admin connecté peut lire les demandes', async () => {
    await payload.create({ collection: 'demandes', data: donneesDemande() })
    const admin = await creerAdmin(payload)
    const resultat = await payload.find({ collection: 'demandes', overrideAccess: false, user: admin })
    expect(resultat.totalDocs).toBe(1)
  })
})
