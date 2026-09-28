import type { Categorie, Media, Voiture } from '@/payload-types'

import { BOITES, CARBURANTS, libelleOption } from './voitureOptions'

type Adresse = { rue?: string | null; codePostal?: string | null; ville?: string | null } | null | undefined

export type TaillePhoto = 'miniature' | 'carte' | 'grande'
export type PhotoGalerie = { url: string; miniature: string; alt: string }
export type LigneTarif = { libelle: string; valeur: string }
export type OffreVoiture = 'location' | 'vente'
export type PrixAffiche = { valeur: string; suffixe: string | null }

/** Une voiture sans offre enregistrée (avant l'ajout du champ) est considérée « à louer ». */
export function estAVendre(voiture: Pick<Voiture, 'offre'>): boolean {
  return voiture.offre === 'vente'
}

/** « 68 000 km ». */
export function formaterKilometrage(kilometrage: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(kilometrage)} km`
}

/** Prix mis en avant : « 49 € » + « / jour » en location, « 12 900 € » en vente. */
export function prixPrincipal(voiture: Pick<Voiture, 'offre' | 'tarifs' | 'vente'>): PrixAffiche {
  const montant = estAVendre(voiture) ? voiture.vente?.prix : voiture.tarifs?.prixJour
  if (montant == null) return { valeur: 'Prix sur demande', suffixe: null }
  return { valeur: formaterPrix(montant), suffixe: estAVendre(voiture) ? null : '/ jour' }
}

export function libelleDisponibilite(offre: OffreVoiture | null | undefined, disponible: boolean): string {
  if (disponible) return 'Disponible'
  return offre === 'vente' ? 'Vendue' : 'Déjà louée'
}

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

/** Résumé affiché sur une carte : caractéristiques en location, année et km en vente. */
export function resumeCarte(voiture: Pick<Voiture, 'offre' | 'caracteristiques' | 'vente'>): string {
  if (!estAVendre(voiture)) return resumeCaracteristiques(voiture.caracteristiques)

  const morceaux: string[] = []
  if (voiture.vente?.annee != null) morceaux.push(String(voiture.vente.annee))
  if (voiture.vente?.kilometrage != null) morceaux.push(formaterKilometrage(voiture.vente.kilometrage))
  morceaux.push(libelleOption(CARBURANTS, voiture.caracteristiques.carburant))
  return morceaux.join(' · ')
}

/** Année et kilométrage d'une voiture à vendre, quand ils sont renseignés. */
export function lignesVente(vente: Voiture['vente']): LigneTarif[] {
  const lignes: LigneTarif[] = []
  if (vente?.annee != null) lignes.push({ libelle: 'Année', valeur: String(vente.annee) })
  if (vente?.kilometrage != null) {
    lignes.push({ libelle: 'Kilométrage', valeur: formaterKilometrage(vente.kilometrage) })
  }
  return lignes
}

/** Lignes du tableau des tarifs de location : seulement les tarifs renseignés. */
export function lignesTarifs(tarifs: Voiture['tarifs']): LigneTarif[] {
  if (tarifs?.prixJour == null) return []

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
export function descriptionVoiture(
  voiture: Pick<Voiture, 'offre' | 'categorie' | 'caracteristiques' | 'tarifs' | 'vente'>,
): string {
  const prix = prixPrincipal(voiture)
  return [
    nomCategorie(voiture.categorie),
    prix.suffixe ? `${prix.valeur} ${prix.suffixe}` : prix.valeur,
    resumeCarte(voiture),
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
