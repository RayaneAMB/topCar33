import { describe, expect, it } from 'vitest'

import { estPageCourante, LIENS_MENU } from '@/lib/navigation'

describe('estPageCourante', () => {
  it('allume le lien de la page affichée', () => {
    expect(estPageCourante('/location', '/location')).toBe(true)
    expect(estPageCourante('/vente', '/vente')).toBe(true)
  })

  it('laisse éteints les autres liens', () => {
    expect(estPageCourante('/vente', '/location')).toBe(false)
    expect(estPageCourante('/contact', '/location')).toBe(false)
  })

  it('reste allumé sur une page en dessous', () => {
    expect(estPageCourante('/location/citadine', '/location')).toBe(true)
  })

  it('ne confond pas deux chemins qui commencent pareil', () => {
    // Sans la barre oblique exigée, « /ventes » allumerait « /vente ».
    expect(estPageCourante('/ventes', '/vente')).toBe(false)
    expect(estPageCourante('/locations-longue-duree', '/location')).toBe(false)
  })

  it('n’allume l’accueil que sur l’accueil', () => {
    expect(estPageCourante('/', '/')).toBe(true)
    // Sinon « / » étant le préfixe de tout, l'accueil resterait allumé partout.
    expect(estPageCourante('/location', '/')).toBe(false)
  })

  it('garde le lien allumé quand le catalogue est filtré', () => {
    // Les filtres voyagent en query : `usePathname()` ne livre que le chemin.
    expect(estPageCourante('/location', '/location')).toBe(true)
  })
})

describe('LIENS_MENU', () => {
  it('ne contient que des chemins internes, sans barre finale', () => {
    for (const { href, libelle } of LIENS_MENU) {
      expect(href.startsWith('/')).toBe(true)
      expect(href.endsWith('/')).toBe(false)
      expect(libelle.length).toBeGreaterThan(0)
    }
  })
})
