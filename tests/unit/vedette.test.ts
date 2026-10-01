import { describe, expect, it } from 'vitest'

import type { Voiture } from '@/payload-types'
import { formaterPrix } from '@/lib/format'
import { apresGlissement } from '@/lib/carrousel'
import { vedettes } from '@/lib/vedette'

const photo = (url: string) => ({
  id: 'm1',
  alt: 'Photo de la voiture',
  url: `${url}.webp`,
  sizes: { carte: { url: `${url}-carte.webp` }, grande: { url: `${url}-grande.webp` } },
})

const voiture = (surcharges: Record<string, unknown> = {}) =>
  ({
    id: 'v1',
    slug: 'peugeot-208',
    titre: 'Peugeot 208',
    modele: '208',
    offre: 'location',
    disponible: true,
    photos: [photo('/media/208')],
    categorie: { id: 'c1', nom: 'Citadine' },
    tarifs: { prixJour: 35 },
    ...surcharges,
  }) as unknown as Voiture

describe('vedettes', () => {
  it('reprend le titre, le prix et la catégorie de la voiture', () => {
    expect(vedettes([voiture()])).toEqual([
      {
        slug: 'peugeot-208',
        titre: 'Peugeot 208',
        photo: '/media/208-carte.webp',
        alt: 'Photo de la voiture',
        prix: formaterPrix(35),
        suffixe: '/ jour',
        categorie: 'Citadine',
        // Aucun fichier détouré pour cette photo d'essai.
        detouree: false,
      },
    ])
  })

  it('écarte les voitures sans photo : la bannière ne montrerait qu’un trou', () => {
    expect(vedettes([voiture({ photos: [] }), voiture({ slug: 'clio', photos: null })])).toEqual([])
  })

  it('écarte les voitures sans slug, qui ne mènent nulle part', () => {
    expect(vedettes([voiture({ slug: null })])).toEqual([])
  })

  it('se limite au nombre demandé', () => {
    const parc = Array.from({ length: 8 }, (_, index) => voiture({ slug: `voiture-${index}` }))
    expect(vedettes(parc, 5)).toHaveLength(5)
    expect(vedettes(parc, 2).map((v) => v.slug)).toEqual(['voiture-0', 'voiture-1'])
  })

  it('affiche le prix de vente sans suffixe pour une voiture à vendre', () => {
    const aVendre = voiture({ offre: 'vente', vente: { prix: 12900 }, tarifs: null })
    expect(vedettes([aVendre])[0]).toMatchObject({ prix: formaterPrix(12900), suffixe: null })
  })

  it('remplace un texte alternatif manquant par le nom de la voiture', () => {
    const sansAlt = voiture({ photos: [{ ...photo('/media/208'), alt: '' }] })
    expect(vedettes([sansAlt])[0].alt).toBe('Peugeot 208')
  })
})

describe('apresGlissement', () => {
  const base = { index: 2, seuil: 60, total: 5 }

  it('ne change pas de voiture pour un frôlement', () => {
    expect(apresGlissement({ ...base, deplacement: 30 })).toBe(2)
    expect(apresGlissement({ ...base, deplacement: -59 })).toBe(2)
  })

  it('vers la gauche, passe à la suivante', () => {
    expect(apresGlissement({ ...base, deplacement: -80 })).toBe(3)
  })

  it('vers la droite, revient à la précédente', () => {
    expect(apresGlissement({ ...base, deplacement: 80 })).toBe(1)
  })

  it('boucle aux extrémités', () => {
    expect(apresGlissement({ ...base, index: 4, deplacement: -80 })).toBe(0)
    expect(apresGlissement({ ...base, index: 0, deplacement: 80 })).toBe(4)
  })

  it('reste immobile s’il n’y a qu’une voiture', () => {
    expect(apresGlissement({ ...base, index: 0, total: 1, deplacement: -200 })).toBe(0)
  })
})
