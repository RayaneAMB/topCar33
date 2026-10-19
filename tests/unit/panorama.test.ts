import { describe, expect, it } from 'vitest'

import type { Media } from '@/payload-types'
import { estUnPanorama, urlPanorama, verifierPanorama } from '@/lib/panorama'

const media = (champs: Partial<Media>) => ({ id: 'm1', alt: 'x', updatedAt: '', createdAt: '', ...champs }) as Media

describe('urlPanorama', () => {
  it('préfère la version plafonnée à 4096 px', () => {
    const vue = media({ url: '/o.jpg', sizes: { panorama: { url: '/p-4096x2048.jpg' } } })
    expect(urlPanorama(vue)).toBe('/p-4096x2048.jpg')
  })

  it('retombe sur l’original quand il est déjà assez petit', () => {
    // Payload ne fabrique pas de version plus large que l'original.
    expect(urlPanorama(media({ url: '/o.jpg', sizes: {} }))).toBe('/o.jpg')
  })

  it('ne prend jamais une vignette ordinaire, trop floue dans une visionneuse', () => {
    const vue = media({ url: '/o.jpg', sizes: { grande: { url: '/g-1600.jpg' }, carte: { url: '/c-800.jpg' } } })
    expect(urlPanorama(vue)).toBe('/o.jpg')
  })

  it('ne renvoie rien sans photo, ou avec un simple identifiant non chargé', () => {
    expect(urlPanorama(null)).toBeNull()
    expect(urlPanorama(undefined)).toBeNull()
    expect(urlPanorama('id-non-charge')).toBeNull()
  })
})

describe('estUnPanorama', () => {
  it('reconnaît les proportions 2:1 d’une photo à 360°', () => {
    expect(estUnPanorama({ width: 6000, height: 3000 })).toBe(true)
    expect(estUnPanorama({ width: 4096, height: 2048 })).toBe(true)
  })

  it('tolère un léger écart d’arrondi', () => {
    expect(estUnPanorama({ width: 5376, height: 2688 })).toBe(true)
    expect(estUnPanorama({ width: 6080, height: 3040 })).toBe(true)
  })

  it('refuse une photo ordinaire, qui serait étirée sur la sphère', () => {
    expect(estUnPanorama({ width: 1600, height: 1067 })).toBe(false) // 3:2
    expect(estUnPanorama({ width: 1920, height: 1080 })).toBe(false) // 16:9
  })

  it('refuse des dimensions absentes', () => {
    expect(estUnPanorama(null)).toBe(false)
    expect(estUnPanorama({ width: null, height: 3000 })).toBe(false)
  })
})

describe('verifierPanorama', () => {
  it('accepte une vraie photo à 360°', () => {
    expect(verifierPanorama({ width: 6000, height: 3000 })).toBe(true)
  })

  it('explique le refus, dimensions à l’appui', () => {
    // Le cas réel : une image de banque d'images, avec un bandeau de 100 px en bas.
    const message = verifierPanorama({ width: 1600, height: 900 })
    expect(message).toContain('1600 × 900')
    // …et la taille qu'elle devrait avoir, pour qu'on sache quoi corriger.
    expect(message).toContain('1600 × 800')
    expect(message).toContain('bandeau')
  })

  it('signale des dimensions absentes au lieu de planter', () => {
    expect(verifierPanorama({ width: null, height: null })).toMatch(/inconnues/)
  })
})
