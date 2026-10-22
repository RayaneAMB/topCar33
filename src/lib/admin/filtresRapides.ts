/**
 * Filtres « en un clic » au-dessus de la liste des voitures.
 *
 * Le panneau de filtres de Payload demande trois choix (champ, opérateur,
 * valeur) pour une question que l'agence pose dix fois par jour : « qu'est-ce
 * qu'on a à vendre ? ». Ces raccourcis écrivent la même requête dans l'adresse
 * — au format du panneau, qui l'affiche alors comme s'il l'avait construite.
 */

type Condition = { champ: string; valeur: string }

export type FiltreRapide = {
  cle: string
  libelle: string
  /** Conditions cumulées (ET) ; aucune pour « Toutes ». */
  conditions: Condition[]
}

export const FILTRES_RAPIDES: FiltreRapide[] = [
  { cle: 'toutes', libelle: 'Toutes', conditions: [] },
  { cle: 'location', libelle: 'À louer', conditions: [{ champ: 'offre', valeur: 'location' }] },
  { cle: 'vente', libelle: 'À vendre', conditions: [{ champ: 'offre', valeur: 'vente' }] },
  { cle: 'disponibles', libelle: 'Disponibles', conditions: [{ champ: 'disponible', valeur: 'true' }] },
  {
    cle: 'vendues',
    libelle: 'Vendues',
    conditions: [
      { champ: 'offre', valeur: 'vente' },
      { champ: 'disponible', valeur: 'false' },
    ],
  },
  {
    cle: 'louees',
    libelle: 'Louées',
    conditions: [
      { champ: 'offre', valeur: 'location' },
      { champ: 'disponible', valeur: 'false' },
    ],
  },
]

const cleCondition = (position: number, champ: string) => `where[or][0][and][${position}][${champ}][equals]`

/** Adresse de la liste filtrée, en gardant le tri et le nombre de lignes choisis. */
export function adresseFiltre(filtre: FiltreRapide, actuels: URLSearchParams): string {
  const params = new URLSearchParams()
  actuels.forEach((valeur, cle) => {
    // L'ancien filtre est remplacé, et on revient à la première page : la page
    // 3 d'un autre filtre n'a pas de sens.
    if (cle.startsWith('where') || cle === 'page') return
    params.append(cle, valeur)
  })
  filtre.conditions.forEach(({ champ, valeur }, position) => {
    params.set(cleCondition(position, champ), valeur)
  })
  const requete = params.toString()
  return requete ? `?${requete}` : '?'
}

/**
 * Le raccourci correspondant au filtre en cours, ou `null` si l'utilisateur en
 * a construit un autre dans le panneau (aucun bouton n'est alors allumé).
 */
export function filtreActif(actuels: URLSearchParams): string | null {
  const presentes = [...actuels.keys()].filter((cle) => cle.startsWith('where'))
  const trouve = FILTRES_RAPIDES.find(
    ({ conditions }) =>
      conditions.length === presentes.length &&
      conditions.every(
        ({ champ, valeur }, position) => actuels.get(cleCondition(position, champ)) === valeur,
      ),
  )
  return trouve?.cle ?? null
}
