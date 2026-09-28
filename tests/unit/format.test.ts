import { describe, expect, it } from 'vitest'

import {
  adresseEnLigne,
  descriptionVoiture,
  estAVendre,
  formaterKilometrage,
  formaterPrix,
  libelleDisponibilite,
  lienItineraire,
  lienTelephone,
  lignesTarifs,
  lignesVente,
  photosGalerie,
  premierePhoto,
  prixPrincipal,
  resumeCarte,
  resumeCaracteristiques,
  urlPhoto,
} from '@/lib/format'
import type { Categorie, Media, Voiture } from '@/payload-types'

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

const aLouer = {
  offre: 'location',
  categorie: suv,
  caracteristiques: { boite: 'manuelle', carburant: 'diesel', places: 5 },
  tarifs: { prixJour: 49, prixSemaine: 300 },
} as Voiture

const aVendre = {
  offre: 'vente',
  categorie: suv,
  caracteristiques: { boite: 'manuelle', carburant: 'diesel', places: 5 },
  vente: { prix: 12900, annee: 2019, kilometrage: 68000 },
} as Voiture

describe('offre location / vente', () => {
  it('estAVendre ne vaut vrai que pour une voiture à vendre', () => {
    expect(estAVendre(aVendre)).toBe(true)
    expect(estAVendre(aLouer)).toBe(false)
    // Voiture enregistrée avant l'ajout du champ : considérée comme « à louer ».
    expect(estAVendre({} as Voiture)).toBe(false)
  })

  it('prixPrincipal affiche le prix par jour ou le prix de vente', () => {
    const location = prixPrincipal(aLouer)
    expect([espaces(location.valeur), location.suffixe]).toEqual(['49 €', '/ jour'])
    const vente = prixPrincipal(aVendre)
    expect([espaces(vente.valeur), vente.suffixe]).toEqual(['12 900 €', null])
  })

  it('prixPrincipal reste lisible quand le prix manque', () => {
    expect(prixPrincipal({ offre: 'vente' } as Voiture)).toEqual({ valeur: 'Prix sur demande', suffixe: null })
  })

  it('libelleDisponibilite s’adapte à l’offre', () => {
    expect(libelleDisponibilite('location', true)).toBe('Disponible')
    expect(libelleDisponibilite('location', false)).toBe('Déjà louée')
    expect(libelleDisponibilite('vente', true)).toBe('Disponible')
    expect(libelleDisponibilite('vente', false)).toBe('Vendue')
  })

  it('formaterKilometrage met les milliers en forme', () => {
    expect(espaces(formaterKilometrage(68000))).toBe('68 000 km')
  })

  it('resumeCarte montre la boîte en location, l’année et les km en vente', () => {
    expect(resumeCarte(aLouer)).toBe('Manuelle · Diesel · 5 places')
    expect(espaces(resumeCarte(aVendre))).toBe('2019 · 68 000 km · Diesel')
  })

  it('lignesVente ne garde que les informations renseignées', () => {
    expect(lignesVente(aVendre.vente).map(({ libelle, valeur }) => [libelle, espaces(valeur)])).toEqual([
      ['Année', '2019'],
      ['Kilométrage', '68 000 km'],
    ])
    expect(lignesVente({ prix: 9000 })).toEqual([])
  })

  it('lignesTarifs renvoie une liste vide sans tarif de location', () => {
    expect(lignesTarifs(aVendre.tarifs)).toEqual([])
  })

  it('descriptionVoiture s’adapte à l’offre', () => {
    expect(espaces(descriptionVoiture(aLouer))).toBe('SUV · 49 € / jour · Manuelle · Diesel · 5 places')
    expect(espaces(descriptionVoiture(aVendre))).toBe('SUV · 12 900 € · 2019 · 68 000 km · Diesel')
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
