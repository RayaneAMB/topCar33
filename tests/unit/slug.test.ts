import { describe, expect, it } from 'vitest'

import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('met en minuscules et remplace les espaces par des tirets', () => {
    expect(slugify('Peugeot 208')).toBe('peugeot-208')
  })

  it('retire les accents', () => {
    expect(slugify('Citroën C3 Aircross')).toBe('citroen-c3-aircross')
    expect(slugify('Renault Mégane E-Tech 100%')).toBe('renault-megane-e-tech-100')
  })

  it('gère les ligatures et les lettres spéciales', () => {
    expect(slugify('Škoda Œuvre')).toBe('skoda-oeuvre')
  })

  it('retire les tirets et espaces en trop', () => {
    expect(slugify('  Mercedes-Benz   Classe A ')).toBe('mercedes-benz-classe-a')
  })

  it('renvoie une chaîne vide si rien n’est utilisable', () => {
    expect(slugify('!!!')).toBe('')
  })
})
