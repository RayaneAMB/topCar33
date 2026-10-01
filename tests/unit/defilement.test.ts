import { describe, expect, it } from 'vitest'

import { vueDepuisDefilement } from '@/lib/defilement'

/** Une section de 2000 px traversée par une fenêtre de 800 px. */
const section = { hauteur: 2000, fenetre: 800, total: 36 }

describe('vueDepuisDefilement', () => {
  it('reste sur la première vue tant que la section n’est pas atteinte', () => {
    expect(vueDepuisDefilement({ ...section, haut: 1500 })).toBe(0)
    expect(vueDepuisDefilement({ ...section, haut: 0 })).toBe(0)
  })

  it('avance au fur et à mesure que la section remonte', () => {
    const quart = vueDepuisDefilement({ ...section, haut: -300 })
    const moitie = vueDepuisDefilement({ ...section, haut: -600 })
    expect(quart).toBeGreaterThan(0)
    expect(moitie).toBeGreaterThan(quart)
  })

  it('atteint la dernière vue en fin de section, sans jamais la dépasser', () => {
    expect(vueDepuisDefilement({ ...section, haut: -1200 })).toBe(35)
    expect(vueDepuisDefilement({ ...section, haut: -5000 })).toBe(35)
  })

  it('résiste à une section plus courte que la fenêtre', () => {
    expect(vueDepuisDefilement({ hauteur: 500, fenetre: 800, total: 36, haut: -100 })).toBe(0)
  })

  it('ne renvoie rien d’absurde sans vues', () => {
    expect(vueDepuisDefilement({ ...section, total: 0, haut: -600 })).toBe(0)
  })
})
