import { describe, expect, it } from 'vitest'

import { masqueDetourage, SEUIL_FOND, urlDetouree } from '@/lib/images/detourage'

/**
 * Image d'essai 9×9 : fond blanc, carré sombre au centre, et dans ce carré
 * un pixel blanc — la plaque d'immatriculation du pauvre.
 */
function imageEssai() {
  const largeur = 9
  const hauteur = 9
  const pixels = new Uint8Array(largeur * hauteur * 3).fill(255)

  const poser = (x: number, y: number, valeur: number) => {
    const base = (y * largeur + x) * 3
    pixels[base] = valeur
    pixels[base + 1] = valeur
    pixels[base + 2] = valeur
  }

  for (let y = 3; y <= 5; y += 1) {
    for (let x = 3; x <= 5; x += 1) poser(x, y, 20)
  }
  poser(4, 4, 255) // blanc enclavé

  return { pixels, largeur, hauteur, canaux: 3 }
}

const alphaEn = (alpha: Uint8Array, x: number, y: number, largeur = 9) => alpha[y * largeur + x]

describe('masqueDetourage', () => {
  it('efface le blanc relié aux bords', () => {
    const alpha = masqueDetourage(imageEssai())
    expect(alphaEn(alpha, 0, 0)).toBe(0)
    expect(alphaEn(alpha, 8, 8)).toBe(0)
    expect(alphaEn(alpha, 1, 4)).toBe(0)
  })

  it('garde le sujet intact', () => {
    const alpha = masqueDetourage(imageEssai())
    expect(alphaEn(alpha, 3, 3)).toBe(255)
    expect(alphaEn(alpha, 5, 5)).toBe(255)
  })

  it('ne troue pas un blanc enclavé dans le sujet', () => {
    const alpha = masqueDetourage(imageEssai())
    expect(alphaEn(alpha, 4, 4)).toBe(255)
  })

  it('laisse une ombre douce : un gris clair s’efface en partie, pas entièrement', () => {
    const essai = imageEssai()
    // Un gris clair collé au bord, entre le seuil et le blanc pur.
    const base = (0 * 9 + 4) * 3
    essai.pixels[base] = 228
    essai.pixels[base + 1] = 228
    essai.pixels[base + 2] = 228

    const alpha = masqueDetourage(essai)
    expect(alphaEn(alpha, 4, 0)).toBeGreaterThan(0)
    expect(alphaEn(alpha, 4, 0)).toBeLessThan(255)
  })

  it('un fond plus sombre que le seuil n’est pas touché', () => {
    const largeur = 4
    const hauteur = 4
    const pixels = new Uint8Array(largeur * hauteur * 3).fill(SEUIL_FOND - 30)
    const alpha = masqueDetourage({ pixels, largeur, hauteur, canaux: 3 })
    expect([...alpha].every((valeur) => valeur === 255)).toBe(true)
  })
})

describe('urlDetouree', () => {
  it('remplace l’extension par le suffixe convenu', () => {
    expect(urlDetouree('/api/media/file/208-800x595.webp')).toBe('/api/media/file/208-800x595-detoure.png')
    expect(urlDetouree('/api/media/file/clio.png')).toBe('/api/media/file/clio-detoure.png')
  })

  it('ne se laisse pas abuser par un point dans le chemin', () => {
    expect(urlDetouree('/media/v1.2/photo.webp')).toBe('/media/v1.2/photo-detoure.png')
  })
})
