import { describe, expect, it } from 'vitest'

import { destinationSure } from '@/lib/auth/etatConnexion'

describe('destinationSure', () => {
  it('garde un chemin de l’administration', () => {
    expect(destinationSure('/admin/collections/voitures')).toBe('/admin/collections/voitures')
    expect(destinationSure('/admin')).toBe('/admin')
  })

  it('refuse tout ce qui sort de l’administration', () => {
    expect(destinationSure('/contact')).toBe('/admin')
    expect(destinationSure('https://pirate.test')).toBe('/admin')
    expect(destinationSure('//pirate.test')).toBe('/admin')
    expect(destinationSure(String.raw`/admin\..\pirate`)).toBe('/admin')
    expect(destinationSure('/admin:80@pirate.test')).toBe('/admin')
  })

  it('renvoie l’accueil de l’administration quand rien n’est fourni', () => {
    expect(destinationSure(undefined)).toBe('/admin')
    expect(destinationSure(null)).toBe('/admin')
    expect(destinationSure(42)).toBe('/admin')
  })
})
