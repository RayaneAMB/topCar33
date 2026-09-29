import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { initPayload } from './helpers'

let payload: Payload

describe('Globals', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  it('un visiteur anonyme lit les infos agence, horaires compris', async () => {
    await payload.updateGlobal({
      slug: 'agence',
      data: {
        nom: 'TopCar33',
        telephone: '05 00 00 00 00',
        horaires: [{ jours: 'Lundi – Vendredi', heures: '9h – 19h' }],
      },
    })
    const agence = await payload.findGlobal({ slug: 'agence', overrideAccess: false })
    expect(agence.telephone).toBe('05 00 00 00 00')
    expect(agence.horaires?.[0]).toMatchObject({ jours: 'Lundi – Vendredi', heures: '9h – 19h' })
  })

  it('un visiteur anonyme ne peut pas modifier les infos agence', async () => {
    await expect(
      payload.updateGlobal({ slug: 'agence', data: { nom: 'Pirate' }, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('les destinataires des demandes restent invisibles aux visiteurs anonymes', async () => {
    await payload.updateGlobal({ slug: 'mails', data: { destinataires: [{ email: 'prive@topcar33.example' }] } })
    await expect(payload.findGlobal({ slug: 'mails', overrideAccess: false })).rejects.toMatchObject({ status: 403 })
    await expect(
      payload.updateGlobal({ slug: 'mails', data: { copieCachee: 'pirate@exemple.fr' }, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('un visiteur anonyme lit les pages légales mais ne peut pas les modifier', async () => {
    const pages = await payload.findGlobal({ slug: 'pages-legales', overrideAccess: false })
    expect(pages).toBeDefined()
    await expect(
      payload.updateGlobal({ slug: 'pages-legales', data: { mentionsLegales: null }, overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
  })
})
