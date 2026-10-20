import { describe, expect, it } from 'vitest'

import { chiffresCles } from '@/lib/chiffresCles'

// L'espace des milliers de fr-FR est une espace fine insécable : on la
// normalise pour que les attentes restent lisibles.
const lisible = (texte: string) => texte.replace(/[  ]/g, ' ')
const valeurs = (resultat: ReturnType<typeof chiffresCles>) =>
  resultat.chiffres.map((c) => `${c.libelle}=${lisible(c.valeur)}${c.unite ? ' ' + c.unite : ''}`)

describe('chiffresCles — vente', () => {
  it('donne prix, année et kilométrage, dans cet ordre', () => {
    const r = chiffresCles({ offre: 'vente', vente: { prix: 10500, annee: 2021, kilometrage: 35000 } })
    expect(valeurs(r)).toEqual(['Prix=10 500 €', 'Année=2021', 'Kilométrage=35 000 km'])
    expect(r.conditions).toEqual([])
  })

  it('n’affiche que ce qui est renseigné', () => {
    const r = chiffresCles({ offre: 'vente', vente: { prix: 389000 } })
    expect(valeurs(r)).toEqual(['Prix=389 000 €'])
  })

  it('garde les centimes quand il y en a', () => {
    const r = chiffresCles({ offre: 'vente', vente: { prix: 9999.5 } })
    expect(lisible(r.chiffres[0].valeur)).toBe('9 999,50')
  })
})

describe('chiffresCles — location', () => {
  it('donne les prix par durée, et range caution et kilométrage parmi les conditions', () => {
    const r = chiffresCles({
      offre: 'location',
      tarifs: { prixJour: 35, prixWeekend: 90, prixSemaine: 210, caution: 800, kmInclus: '200 km / jour' },
    })
    expect(valeurs(r)).toEqual(['Par jour=35 €', 'Le week-end=90 €', 'La semaine=210 €'])
    expect(r.conditions.map((l) => `${l.libelle}=${lisible(l.valeur)}`)).toEqual([
      'Caution=800 €',
      'Kilométrage inclus=200 km / jour',
    ])
  })

  it('se contente du prix à la journée s’il est seul', () => {
    const r = chiffresCles({ offre: 'location', tarifs: { prixJour: 39 } })
    expect(valeurs(r)).toEqual(['Par jour=39 €'])
    expect(r.conditions).toEqual([])
  })

  it('ne renvoie rien sans tarif, plutôt qu’un bandeau de tirets', () => {
    expect(chiffresCles({ offre: 'location', tarifs: undefined }).chiffres).toEqual([])
  })
})
