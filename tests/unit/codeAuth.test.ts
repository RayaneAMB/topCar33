import { describe, expect, it } from 'vitest'

import { DUREE_CODE_MS, genererCode, hacherCode, memeEmpreinte } from '@/lib/auth/code'

describe('genererCode', () => {
  it('donne toujours 6 chiffres, zéros de tête compris', () => {
    for (let essai = 0; essai < 200; essai += 1) {
      expect(genererCode()).toMatch(/^\d{6}$/)
    }
  })

  it('ne redonne pas deux fois le même code d’affilée', () => {
    const codes = new Set(Array.from({ length: 50 }, () => genererCode()))
    expect(codes.size).toBeGreaterThan(40)
  })
})

describe('hacherCode', () => {
  it('ne laisse pas le code apparaître dans l’empreinte', () => {
    expect(hacherCode('123456', 'secret')).not.toContain('123456')
    expect(hacherCode('123456', 'secret')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('même code et même secret donnent la même empreinte', () => {
    expect(hacherCode('123456', 'secret')).toBe(hacherCode('123456', 'secret'))
  })

  it('un code différent donne une empreinte différente', () => {
    expect(hacherCode('123456', 'secret')).not.toBe(hacherCode('123457', 'secret'))
  })

  it('le secret entre dans le calcul', () => {
    expect(hacherCode('123456', 'a')).not.toBe(hacherCode('123456', 'b'))
  })
})

describe('memeEmpreinte', () => {
  it('reconnaît deux empreintes identiques', () => {
    const empreinte = hacherCode('123456', 'secret')
    expect(memeEmpreinte(empreinte, empreinte)).toBe(true)
  })

  it('refuse deux empreintes différentes, et les longueurs qui ne collent pas', () => {
    expect(memeEmpreinte(hacherCode('123456', 's'), hacherCode('654321', 's'))).toBe(false)
    expect(memeEmpreinte('court', hacherCode('123456', 's'))).toBe(false)
    expect(memeEmpreinte('', '')).toBe(false)
  })
})

describe('DUREE_CODE_MS', () => {
  it('laisse 10 minutes pour saisir le code', () => {
    expect(DUREE_CODE_MS).toBe(10 * 60 * 1000)
  })
})
