import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { nomDetoure } from '@/lib/images/detourerFichier'

import { initPayload, viderCollections } from './helpers'

let payload: Payload

/** Une voiture sombre sur fond blanc : de quoi détourer pour de vrai. */
async function photoSurFondBlanc() {
  return sharp({ create: { width: 1000, height: 600, channels: 3, background: '#ffffff' } })
    .composite([
      {
        input: await sharp({ create: { width: 500, height: 250, channels: 3, background: '#222222' } })
          .png()
          .toBuffer(),
        top: 200,
        left: 250,
      },
    ])
    .png()
    .toBuffer()
}

async function verser(data: Record<string, unknown>, name: string) {
  const fichier = await photoSurFondBlanc()
  return payload.create({
    collection: 'media',
    data,
    file: { data: fichier, mimetype: 'image/png', name, size: fichier.length },
  })
}

const dossier = () => process.env.MEDIA_DIR || 'media'
const carteDetouree = (doc: { sizes?: { carte?: { filename?: string | null } | null } | null }) =>
  existsSync(join(dossier(), nomDetoure(doc.sizes?.carte?.filename ?? '')))

describe('Médias', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['media'])
  })

  it('sans description, reprend le nom du fichier', async () => {
    const doc = await verser({}, `bmw-m5_competition-${Date.now()}.png`)
    expect(doc.alt).toMatch(/^bmw m5 competition \d+$/)
  })

  it('garde la description écrite par l’agence', async () => {
    const doc = await verser({ alt: 'Vue de trois quarts' }, `photo-${Date.now()}.png`)
    expect(doc.alt).toBe('Vue de trois quarts')
  })

  it('retire le fond par défaut', async () => {
    const doc = await verser({}, `defaut-${Date.now()}.png`)
    expect(doc.retirerFond).toBe(true)
    expect(carteDetouree(doc)).toBe(true)
  })

  it('case éteinte : aucun détourage, et l’éteindre après coup efface l’existant', async () => {
    const sansFond = await verser({ retirerFond: false }, `tel-quel-${Date.now()}.png`)
    expect(carteDetouree(sansFond)).toBe(false)

    const detouree = await verser({}, `apres-coup-${Date.now()}.png`)
    expect(carteDetouree(detouree)).toBe(true)
    await payload.update({ collection: 'media', id: detouree.id, data: { retirerFond: false } })
    expect(carteDetouree(detouree)).toBe(false)
  })
})
