import { describe, expect, it } from 'vitest'

import { texteDepuisNomFichier } from '@/lib/images/texteAlternatif'

describe('texteDepuisNomFichier', () => {
  it('retire l’extension et remplace tirets et soulignés par des espaces', () => {
    expect(texteDepuisNomFichier('bmw-m5_competition (2).jpeg')).toBe('bmw m5 competition (2)')
  })

  it('garde les accents et la casse', () => {
    expect(texteDepuisNomFichier('Renault Master — Caisse.PNG')).toBe('Renault Master — Caisse')
  })

  it('retombe sur « Photo » sans nom exploitable', () => {
    expect(texteDepuisNomFichier(undefined)).toBe('Photo')
    expect(texteDepuisNomFichier('---.jpg')).toBe('Photo')
  })
})
