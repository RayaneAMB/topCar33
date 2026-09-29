import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { seed } from '@/seed/seed'

import { initPayload, viderCollections } from './helpers'

let payload: Payload

describe('Seed (données temporaires)', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  it('remplit une base vide, et ne duplique rien si on le relance', async () => {
    await viderCollections(payload, ['demandes', 'voitures', 'marques', 'categories', 'media'])
    await payload.updateGlobal({ slug: 'agence', data: { emailDemandes: null } })
    await payload.updateGlobal({ slug: 'pages-legales', data: { mentionsLegales: null, confidentialite: null } })

    await seed(payload)
    await seed(payload)

    expect((await payload.count({ collection: 'marques' })).totalDocs).toBeGreaterThanOrEqual(40)
    expect((await payload.count({ collection: 'categories' })).totalDocs).toBe(3)
    expect((await payload.count({ collection: 'voitures' })).totalDocs).toBe(6)
    expect((await payload.count({ collection: 'voitures', where: { offre: { equals: 'vente' } } })).totalDocs).toBe(2)
    const agence = await payload.findGlobal({ slug: 'agence' })
    expect(agence.emailDemandes).toBe('contact@topcar33.com')
    expect(agence.horaires).toHaveLength(2)
    const pages = await payload.findGlobal({ slug: 'pages-legales' })
    expect(pages.mentionsLegales).toBeTruthy()
    expect(pages.confidentialite).toBeTruthy()
  })
})
