import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { creerImage, initPayload, viderCollections } from './helpers'

let payload: Payload

describe('Socle', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  it('tourne sur la base MongoDB en mémoire, jamais sur celle de .env', async () => {
    expect(process.env.DATABASE_URL).toMatch(/^mongodb:\/\/127\.0\.0\.1:\d+\/topcar33-test/)
    await viderCollections(payload, ['users'])
    const utilisateurs = await payload.count({ collection: 'users' })
    expect(utilisateurs.totalDocs).toBe(0)
  })

  it('l’administration est en français', () => {
    expect(payload.config.i18n.fallbackLanguage).toBe('fr')
    expect(Object.keys(payload.config.i18n.supportedLanguages)).toEqual(['fr'])
  })

  it('une photo envoyée génère les tailles miniature, carte et grande', async () => {
    await viderCollections(payload, ['media'])
    const photo = await creerImage(payload)
    expect(photo.sizes?.miniature?.width).toBe(400)
    expect(photo.sizes?.carte?.width).toBe(800)
    expect(photo.sizes?.grande?.width).toBe(1600)
    expect(photo.url).toMatch(/^\/api\/media\/file\//)
  })

  it('les photos sont lisibles par un visiteur anonyme', async () => {
    const resultat = await payload.find({ collection: 'media', overrideAccess: false })
    expect(resultat.totalDocs).toBeGreaterThanOrEqual(1)
  })
})
