import { describe, expect, it } from 'vitest'

import { fichiersAffiches, nomDetoure } from '@/lib/images/detourerFichier'

describe('nomDetoure', () => {
  it('pose le suffixe avant l’extension, toujours en .png', () => {
    expect(nomDetoure('classA-800x533.jpg')).toBe('classA-800x533-detoure.png')
    expect(nomDetoure('photo.webp')).toBe('photo-detoure.png')
  })
})

describe('fichiersAffiches', () => {
  it('retient les vignettes carte et tour', () => {
    const tous = ['v-800x533.jpg', 'v-600x400.jpg', 'v-400x267.jpg', 'v.jpg']
    expect(fichiersAffiches(tous)).toEqual(expect.arrayContaining(['v-800x533.jpg', 'v-600x400.jpg']))
  })

  it('écarte les vignettes que le site n’affiche jamais', () => {
    const retenus = fichiersAffiches(['v-800x533.jpg', 'v-600x400.jpg', 'v-400x267.jpg', 'v-1600x1067.jpg', 'v.jpg'])
    expect(retenus).not.toContain('v-400x267.jpg')
    expect(retenus).not.toContain('v-1600x1067.jpg')
  })

  it('écarte l’original quand ses deux vignettes existent', () => {
    expect(fichiersAffiches(['v-800x533.jpg', 'v-600x400.jpg', 'v.jpg'])).not.toContain('v.jpg')
  })

  it('retient l’original quand la vignette « carte » manque', () => {
    // Le cas de la Classe A : photo trop petite pour le 800, donc Payload ne
    // produit que le 600 — et la carte du site affiche l'original.
    expect(fichiersAffiches(['petite-600x450.webp', 'petite.webp'])).toContain('petite.webp')
  })

  it('retient l’original quand la vignette « tour » manque', () => {
    expect(fichiersAffiches(['v-800x533.jpg', 'v.jpg'])).toContain('v.jpg')
  })

  it('retient l’original quand aucune vignette n’a pu être produite', () => {
    expect(fichiersAffiches(['minuscule.png'])).toContain('minuscule.png')
  })

  it('ignore les fichiers déjà détourés et ce qui n’est pas une image', () => {
    const retenus = fichiersAffiches(['v-800x533-detoure.png', 'notes.txt', 'v-800x533.jpg'])
    expect(retenus).toEqual(['v-800x533.jpg'])
  })

  it('ne confond pas deux photos dont le nom commence pareil', () => {
    const retenus = fichiersAffiches(['clio.jpg', 'clio-800x533.jpg', 'clio-600x400.jpg', 'clio5.jpg'])
    // « clio » a ses deux vignettes ; « clio5 » n'en a aucune.
    expect(retenus).not.toContain('clio.jpg')
    expect(retenus).toContain('clio5.jpg')
  })
})
