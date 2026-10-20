import type { Voiture } from '@/payload-types'

import { estAVendre, type LigneTarif } from './format'

/** Un chiffre du bandeau : le nombre en grand, son unité en petit, et ce qu'il mesure. */
export type Chiffre = { valeur: string; unite: string; libelle: string }

const NOMBRE = new Intl.NumberFormat('fr-FR')

/** « 10 500 », « 35,50 » : le montant seul, l'unité étant posée à part. */
function nombre(montant: number): string {
  const decimales = Number.isInteger(montant) ? 0 : 2
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(montant)
}

/**
 * Les trois chiffres qui décident, dans l'ordre où l'œil les cherche.
 *
 * Une occasion se juge d'abord à son prix, puis à son âge et à son
 * kilométrage — ces deux-là étaient jusqu'ici relégués en bas de fiche,
 * sous des cartes consacrées aux portes et à la climatisation.
 *
 * Une location se juge à ce qu'elle coûte selon la durée : jour, week-end,
 * semaine. Caution et kilométrage inclus sont des conditions, pas des prix :
 * elles vont dans `conditions`.
 *
 * On ne garde que ce qui est renseigné — un tiret dans un bandeau de chiffres
 * ferait croire à une donnée manquante par négligence.
 */
export function chiffresCles(voiture: Pick<Voiture, 'offre' | 'tarifs' | 'vente'>): {
  chiffres: Chiffre[]
  conditions: LigneTarif[]
} {
  if (estAVendre(voiture)) {
    const { vente } = voiture
    const chiffres: Chiffre[] = []
    if (vente?.prix != null) chiffres.push({ valeur: nombre(vente.prix), unite: '€', libelle: 'Prix' })
    if (vente?.annee != null) chiffres.push({ valeur: String(vente.annee), unite: '', libelle: 'Année' })
    if (vente?.kilometrage != null) {
      chiffres.push({ valeur: NOMBRE.format(vente.kilometrage), unite: 'km', libelle: 'Kilométrage' })
    }
    return { chiffres, conditions: [] }
  }

  const { tarifs } = voiture
  const chiffres: Chiffre[] = []
  if (tarifs?.prixJour != null) chiffres.push({ valeur: nombre(tarifs.prixJour), unite: '€', libelle: 'Par jour' })
  if (tarifs?.prixWeekend != null) {
    chiffres.push({ valeur: nombre(tarifs.prixWeekend), unite: '€', libelle: 'Le week-end' })
  }
  if (tarifs?.prixSemaine != null) {
    chiffres.push({ valeur: nombre(tarifs.prixSemaine), unite: '€', libelle: 'La semaine' })
  }

  const conditions: LigneTarif[] = []
  if (tarifs?.caution != null) conditions.push({ libelle: 'Caution', valeur: `${nombre(tarifs.caution)} €` })
  if (tarifs?.kmInclus) conditions.push({ libelle: 'Kilométrage inclus', valeur: tarifs.kmInclus })

  return { chiffres, conditions }
}
