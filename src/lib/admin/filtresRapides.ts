/**
 * Filtres « en un clic » au-dessus de la liste des voitures.
 *
 * Le panneau de filtres de Payload demande trois choix (champ, opérateur,
 * valeur) pour une question que l'agence pose dix fois par jour : « qu'est-ce
 * qu'on a à vendre ? ». Ces raccourcis écrivent la même requête dans l'adresse
 * — au format du panneau, qui l'affiche alors comme s'il l'avait construite.
 */

export type FiltreRapide = {
  cle: string
  libelle: string
  /** Champ et valeur testés ; absent pour « Toutes ». */
  condition?: { champ: string; valeur: string }
}

export const FILTRES_RAPIDES: FiltreRapide[] = [
  { cle: 'toutes', libelle: 'Toutes' },
  { cle: 'location', libelle: 'À louer', condition: { champ: 'offre', valeur: 'location' } },
  { cle: 'vente', libelle: 'À vendre', condition: { champ: 'offre', valeur: 'vente' } },
  { cle: 'disponibles', libelle: 'Disponibles', condition: { champ: 'disponible', valeur: 'true' } },
  {
    cle: 'indisponibles',
    libelle: 'Vendues ou louées',
    condition: { champ: 'disponible', valeur: 'false' },
  },
]

const cleCondition = (champ: string) => `where[or][0][and][0][${champ}][equals]`

/** Adresse de la liste filtrée, en gardant le tri et le nombre de lignes choisis. */
export function adresseFiltre(filtre: FiltreRapide, actuels: URLSearchParams): string {
  const params = new URLSearchParams()
  actuels.forEach((valeur, cle) => {
    // L'ancien filtre est remplacé, et on revient à la première page : la page
    // 3 d'un autre filtre n'a pas de sens.
    if (cle.startsWith('where') || cle === 'page') return
    params.append(cle, valeur)
  })
  if (filtre.condition) params.set(cleCondition(filtre.condition.champ), filtre.condition.valeur)
  const requete = params.toString()
  return requete ? `?${requete}` : '?'
}

/**
 * Le raccourci correspondant au filtre en cours, ou `null` si l'utilisateur en
 * a construit un autre dans le panneau (aucun bouton n'est alors allumé).
 */
export function filtreActif(actuels: URLSearchParams): string | null {
  const conditions = [...actuels.keys()].filter((cle) => cle.startsWith('where'))
  if (conditions.length === 0) return 'toutes'
  if (conditions.length > 1) return null
  const trouve = FILTRES_RAPIDES.find(
    ({ condition }) =>
      condition &&
      conditions[0] === cleCondition(condition.champ) &&
      actuels.get(conditions[0]) === condition.valeur,
  )
  return trouve?.cle ?? null
}
