import { describe, expect, it } from 'vitest'

import type { Voiture } from '@/payload-types'
import { allegerTour, imagesTour, MINIMUM_IMAGES, vueSuivante } from '@/lib/tour360'

const image = (numero: number, sizes: Record<string, { url: string }> = {}) => ({
  id: `m${numero}`,
  alt: `Vue ${numero}`,
  url: `/media/vue-${numero}.webp`,
  sizes: { tour: { url: `/media/vue-${numero}-tour.webp` }, ...sizes },
})

const suite = (nombre: number) => Array.from({ length: nombre }, (_, index) => image(index))

describe('imagesTour', () => {
  it('prend la version allégée de chaque image, dans l’ordre', () => {
    const images = imagesTour(suite(8) as unknown as Voiture['tour360'])
    expect(images).toHaveLength(8)
    expect(images[0]).toBe('/media/vue-0-tour.webp')
    expect(images[7]).toBe('/media/vue-7-tour.webp')
  })

  it('se rabat sur l’image d’origine quand la version allégée manque', () => {
    const anciennes = suite(8).map((img) => ({ ...img, sizes: {} }))
    expect(imagesTour(anciennes as unknown as Voiture['tour360'])[0]).toBe('/media/vue-0.webp')
  })

  it('ne renvoie rien en dessous du minimum : une rotation hachée est pire que pas de rotation', () => {
    expect(imagesTour(suite(MINIMUM_IMAGES - 1) as unknown as Voiture['tour360'])).toEqual([])
    expect(imagesTour(null)).toEqual([])
    expect(imagesTour(undefined)).toEqual([])
  })

  it('ignore les images non chargées (simples identifiants)', () => {
    const melange = [...suite(7), 'id-non-charge'] as unknown as Voiture['tour360']
    expect(imagesTour(melange)).toEqual([])
  })
})

describe('vueSuivante', () => {
  it('avance d’une vue par pas franchi vers la gauche', () => {
    expect(vueSuivante({ depart: 0, deplacement: 30, pas: 10, total: 12 })).toBe(3)
  })

  it('recule vers la droite', () => {
    expect(vueSuivante({ depart: 5, deplacement: -20, pas: 10, total: 12 })).toBe(3)
  })

  it('boucle sans fin dans les deux sens', () => {
    expect(vueSuivante({ depart: 11, deplacement: 20, pas: 10, total: 12 })).toBe(1)
    expect(vueSuivante({ depart: 0, deplacement: -10, pas: 10, total: 12 })).toBe(11)
    expect(vueSuivante({ depart: 0, deplacement: -1000, pas: 10, total: 12 })).toBe(8)
  })

  it('ne bouge pas tant que le doigt n’a pas franchi un pas', () => {
    expect(vueSuivante({ depart: 4, deplacement: 9, pas: 10, total: 12 })).toBe(4)
    expect(vueSuivante({ depart: 4, deplacement: -9, pas: 10, total: 12 })).toBe(4)
  })
})

describe('allegerTour', () => {
  const suite = (nombre: number) => Array.from({ length: nombre }, (_, index) => `/vue-${index}.webp`)

  it('garde toutes les vues quand il y en a peu', () => {
    expect(allegerTour(suite(12), 18)).toHaveLength(12)
  })

  it('prélève des vues régulièrement réparties, sans en sauter deux d’affilée', () => {
    const allegee = allegerTour(suite(36), 18)
    expect(allegee).toHaveLength(18)
    expect(allegee[0]).toBe('/vue-0.webp')
    expect(allegee[1]).toBe('/vue-2.webp')
    expect(allegee.at(-1)).toBe('/vue-34.webp')
  })

  it('ne renvoie rien à partir de rien', () => {
    expect(allegerTour([], 18)).toEqual([])
  })
})
