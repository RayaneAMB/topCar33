import { describe, expect, it } from 'vitest'

import { empreinteIp } from '@/lib/demandes/empreinte'
import { ipDuVisiteur, LIMITE_PAR_HEURE } from '@/lib/demandes/limite'

describe('empreinteIp', () => {
  it('brouille l’adresse : on ne la retrouve pas dans le résultat', () => {
    const empreinte = empreinteIp('88.120.5.7', 'secret')
    expect(empreinte).not.toContain('88.120')
    expect(empreinte).toMatch(/^[0-9a-f]{32}$/)
  })

  it('la même adresse donne toujours la même empreinte', () => {
    expect(empreinteIp('88.120.5.7', 'secret')).toBe(empreinteIp('88.120.5.7', 'secret'))
  })

  it('deux adresses différentes donnent deux empreintes différentes', () => {
    expect(empreinteIp('88.120.5.7', 'secret')).not.toBe(empreinteIp('88.120.5.8', 'secret'))
  })

  it('le secret entre dans le calcul : deux sites ne partagent pas leurs empreintes', () => {
    expect(empreinteIp('88.120.5.7', 'secret-a')).not.toBe(empreinteIp('88.120.5.7', 'secret-b'))
  })
})

describe('ipDuVisiteur', () => {
  it('prend la première adresse de x-forwarded-for (le visiteur, pas les relais)', () => {
    const entetes = new Headers({ 'x-forwarded-for': '88.120.5.7, 10.0.0.1, 172.16.0.3' })
    expect(ipDuVisiteur(entetes)).toBe('88.120.5.7')
  })

  it('se rabat sur x-real-ip', () => {
    expect(ipDuVisiteur(new Headers({ 'x-real-ip': '88.120.5.7' }))).toBe('88.120.5.7')
  })

  it('en production sans en-tête, renvoie null : mieux vaut aucune limite que tout le monde dans le même panier', () => {
    expect(ipDuVisiteur(new Headers(), 'production')).toBeNull()
    expect(ipDuVisiteur(new Headers({ 'x-forwarded-for': '  ' }), 'production')).toBeNull()
  })

  it('en développement, regroupe sous une valeur fixe pour rester testable en local', () => {
    expect(ipDuVisiteur(new Headers(), 'development')).toBe('developpement-local')
  })

  it('un vrai en-tête l’emporte toujours sur le repli de développement', () => {
    expect(ipDuVisiteur(new Headers({ 'x-real-ip': '88.120.5.7' }), 'development')).toBe('88.120.5.7')
  })
})

describe('LIMITE_PAR_HEURE', () => {
  it('vaut 10', () => {
    expect(LIMITE_PAR_HEURE).toBe(10)
  })
})
