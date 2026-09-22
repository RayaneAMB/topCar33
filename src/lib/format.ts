import type { Categorie, Media, Voiture } from '@/payload-types'

import { BOITES, CARBURANTS, libelleOption } from './voitureOptions'

type Adresse = { rue?: string | null; codePostal?: string | null; ville?: string | null } | null | undefined

export type TaillePhoto = 'miniature' | 'carte' | 'grande'
export type PhotoGalerie = { url: string; miniature: string; alt: string }
export type LigneTarif = { libelle: string; valeur: string }

/** « 35 € », « 35,50 € », « 1 200 € ». */
export function formaterPrix(montant: number): string {
  const decimales = Number.isInteger(montant) ? 0 : 2
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(montant)
}

/** « Manuelle · Essence · 5 places ». */
export function resumeCaracteristiques(
  caracteristiques: Pick<Voiture['caracteristiques'], 'boite' | 'carburant' | 'places'>,
): string {
  return [
    libelleOption(BOITES, caracteristiques.boite),
    libelleOption(CARBURANTS, caracteristiques.carburant),
    `${caracteristiques.places} places`,
  ].join(' · ')
}

/** Lignes du tableau des tarifs : seulement les tarifs renseignés. */
export function lignesTarifs(tarifs: Voiture['tarifs']): LigneTarif[] {
  const lignes: LigneTarif[] = [{ libelle: 'Jour', valeur: formaterPrix(tarifs.prixJour) }]
  if (tarifs.prixWeekend != null) lignes.push({ libelle: 'Week-end', valeur: formaterPrix(tarifs.prixWeekend) })
  if (tarifs.prixSemaine != null) lignes.push({ libelle: 'Semaine', valeur: formaterPrix(tarifs.prixSemaine) })
  if (tarifs.caution != null) lignes.push({ libelle: 'Caution', valeur: formaterPrix(tarifs.caution) })
  if (tarifs.kmInclus) lignes.push({ libelle: 'Kilométrage inclus', valeur: tarifs.kmInclus })
  return lignes
}

/** URL d'une taille d'image, ou de l'original si la taille n'a pas été générée. */
export function urlPhoto(photo: string | Media | null | undefined, taille: TaillePhoto): string | null {
  if (!photo || typeof photo === 'string') return null
  return photo.sizes?.[taille]?.url || photo.url || null
}

export function premierePhoto(photos: Voiture['photos'] | null | undefined): Media | null {
  const photo = photos?.[0]
  return photo && typeof photo === 'object' ? photo : null
}

export function photosGalerie(photos: Voiture['photos'] | null | undefined): PhotoGalerie[] {
  return (photos ?? []).flatMap((photo) => {
    if (typeof photo !== 'object') return []
    const url = urlPhoto(photo, 'grande')
    if (!url) return []
    return [{ url, miniature: urlPhoto(photo, 'miniature') ?? url, alt: photo.alt }]
  })
}

export function nomCategorie(categorie: string | Categorie | null | undefined): string | null {
  return categorie && typeof categorie === 'object' ? categorie.nom : null
}

/** Description courte d'une voiture (balise meta description). */
export function descriptionVoiture(voiture: Pick<Voiture, 'categorie' | 'caracteristiques' | 'tarifs'>): string {
  return [
    nomCategorie(voiture.categorie),
    `${formaterPrix(voiture.tarifs.prixJour)} / jour`,
    resumeCaracteristiques(voiture.caracteristiques),
  ]
    .filter(Boolean)
    .join(' · ')
}

export function adresseEnLigne(adresse: Adresse): string {
  if (!adresse) return ''
  const ville = [adresse.codePostal, adresse.ville].filter(Boolean).join(' ')
  return [adresse.rue, ville].filter(Boolean).join(', ')
}

/** Lien simple vers Google Maps (pas d'iframe, donc pas de cookies). */
export function lienItineraire(adresse: Adresse): string | null {
  const texte = adresseEnLigne(adresse)
  return texte ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texte)}` : null
}

export function lienTelephone(telephone: string): string {
  return `tel:${telephone.replace(/[^\d+]/g, '')}`
}
