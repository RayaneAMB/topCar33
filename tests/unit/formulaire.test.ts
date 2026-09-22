import { describe, expect, it } from 'vitest'

import { lireFormulaire, valeursAAfficher } from '@/lib/demandes/formulaire'

describe('lireFormulaire', () => {
  it('lit tous les champs, champ piège compris, et met une chaîne vide aux absents', () => {
    const formData = new FormData()
    formData.set('prenom', 'Jean')
    formData.set('website', 'http://spam.test')
    const brut = lireFormulaire(formData)
    expect(brut.prenom).toBe('Jean')
    expect(brut.website).toBe('http://spam.test')
    expect(brut.message).toBe('')
    expect(Object.keys(brut)).toHaveLength(10)
  })
})

describe('valeursAAfficher', () => {
  it('ne renvoie jamais le champ piège', () => {
    const valeurs = valeursAAfficher({ prenom: 'Jean', website: 'http://spam.test' })
    expect(valeurs.prenom).toBe('Jean')
    expect(valeurs).not.toHaveProperty('website')
  })
})
