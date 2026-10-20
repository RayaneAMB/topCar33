import { describe, expect, it } from 'vitest'

import { adresseFiltre, FILTRES_RAPIDES, filtreActif } from '@/lib/admin/filtresRapides'

const filtre = (cle: string) => FILTRES_RAPIDES.find((f) => f.cle === cle)!

describe('adresseFiltre', () => {
  it('écrit la condition au format du panneau de filtres', () => {
    const adresse = adresseFiltre(filtre('vente'), new URLSearchParams())
    expect(new URLSearchParams(adresse).get('where[or][0][and][0][offre][equals]')).toBe('vente')
  })

  it('garde le tri et la limite, remplace l’ancien filtre et revient en page 1', () => {
    const actuels = new URLSearchParams({
      sort: '-updatedAt',
      limit: '25',
      page: '3',
      'where[or][0][and][0][offre][equals]': 'location',
    })
    const params = new URLSearchParams(adresseFiltre(filtre('disponibles'), actuels))
    expect(params.get('sort')).toBe('-updatedAt')
    expect(params.get('limit')).toBe('25')
    expect(params.get('page')).toBeNull()
    expect(params.get('where[or][0][and][0][offre][equals]')).toBeNull()
    expect(params.get('where[or][0][and][0][disponible][equals]')).toBe('true')
  })

  it('« Toutes » retire tout filtre', () => {
    const actuels = new URLSearchParams({ 'where[or][0][and][0][offre][equals]': 'vente' })
    expect(adresseFiltre(filtre('toutes'), actuels)).toBe('?')
  })
})

describe('filtreActif', () => {
  it('reconnaît chaque raccourci depuis son adresse', () => {
    for (const f of FILTRES_RAPIDES) {
      const adresse = adresseFiltre(f, new URLSearchParams())
      expect(filtreActif(new URLSearchParams(adresse))).toBe(f.cle)
    }
  })

  it('n’allume rien pour un filtre construit à la main', () => {
    const actuels = new URLSearchParams({
      'where[or][0][and][0][offre][equals]': 'vente',
      'where[or][0][and][1][marque][equals]': 'abc',
    })
    expect(filtreActif(actuels)).toBeNull()
  })
})
