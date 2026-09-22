import { describe, expect, it } from 'vitest'

import {
  adresseEnLigne,
  descriptionVoiture,
  formaterPrix,
  lienItineraire,
  lienTelephone,
  lignesTarifs,
  photosGalerie,
  premierePhoto,
  resumeCaracteristiques,
  urlPhoto,
} from '@/lib/format'
import type { Categorie, Media } from '@/payload-types'

/** Intl utilise des espaces insécables : on les normalise pour comparer. */
const espaces = (texte: string) => texte.replace(/\s/g, ' ')

const photo = {
  id: 'p1',
  alt: 'Face avant',
  url: '/api/media/file/a.png',
  sizes: {
    miniature: { url: '/api/media/file/a-400x250.png' },
    carte: { url: null },
    grande: { url: '/api/media/file/a-1600x1000.png' },
  },
} as unknown as Media

const suv = { id: 'c1', nom: 'SUV', slug: 'suv' } as Categorie

describe('formaterPrix', () => {
  it('affiche les euros au format français, sans décimales si le montant est entier', () => {
    expect(espaces(formaterPrix(35))).toBe('35 €')
    expect(espaces(formaterPrix(35.5))).toBe('35,50 €')
    expect(espaces(formaterPrix(1200))).toBe('1 200 €')
  })
})

describe('resumeCaracteristiques', () => {
  it('résume boîte, carburant et places', () => {
    expect(resumeCaracteristiques({ boite: 'automatique', carburant: 'electrique', places: 4 })).toBe(
      'Automatique · Électrique · 4 places',
    )
  })
})

describe('lignesTarifs', () => {
  it('ne garde que les tarifs renseignés', () => {
    const lignes = lignesTarifs({ prixJour: 49, prixWeekend: null, prixSemaine: 300, caution: null, kmInclus: 'Illimité' })
    expect(lignes.map(({ libelle, valeur }) => [libelle, espaces(valeur)])).toEqual([
      ['Jour', '49 €'],
      ['Semaine', '300 €'],
      ['Kilométrage inclus', 'Illimité'],
    ])
  })
})

describe('photos', () => {
  it('urlPhoto prend la taille demandée, sinon l’original', () => {
    expect(urlPhoto(photo, 'grande')).toBe('/api/media/file/a-1600x1000.png')
    expect(urlPhoto(photo, 'carte')).toBe('/api/media/file/a.png')
    expect(urlPhoto('p1', 'carte')).toBeNull()
    expect(urlPhoto(null, 'carte')).toBeNull()
  })

  it('premierePhoto ignore les photos non chargées', () => {
    expect(premierePhoto([photo])).toBe(photo)
    expect(premierePhoto(['p1'])).toBeNull()
    expect(premierePhoto([])).toBeNull()
  })

  it('photosGalerie prépare grande image + miniature + texte alternatif', () => {
    expect(photosGalerie([photo, 'p2'])).toEqual([
      { url: '/api/media/file/a-1600x1000.png', miniature: '/api/media/file/a-400x250.png', alt: 'Face avant' },
    ])
  })
})

describe('descriptionVoiture', () => {
  it('résume catégorie, prix et caractéristiques (pour le SEO)', () => {
    const texte = descriptionVoiture({
      categorie: suv,
      caracteristiques: { boite: 'manuelle', carburant: 'diesel', places: 5 },
      tarifs: { prixJour: 49 },
    })
    expect(espaces(texte)).toBe('SUV · 49 € / jour · Manuelle · Diesel · 5 places')
  })
})

describe('adresse et liens', () => {
  const adresse = { rue: '1 rue de l’Exemple', codePostal: '33000', ville: 'Bordeaux' }

  it('adresseEnLigne assemble les morceaux présents', () => {
    expect(adresseEnLigne(adresse)).toBe('1 rue de l’Exemple, 33000 Bordeaux')
    expect(adresseEnLigne({ ville: 'Bordeaux' })).toBe('Bordeaux')
    expect(adresseEnLigne(null)).toBe('')
  })

  it('lienItineraire renvoie un lien Google Maps simple, ou null sans adresse', () => {
    expect(lienItineraire(adresse)).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('1 rue de l’Exemple, 33000 Bordeaux')}`,
    )
    expect(lienItineraire(null)).toBeNull()
  })

  it('lienTelephone garde uniquement les chiffres et le +', () => {
    expect(lienTelephone('05 00 00 00 00')).toBe('tel:0500000000')
    expect(lienTelephone('+33 5 00 00 00 00')).toBe('tel:+33500000000')
  })
})
