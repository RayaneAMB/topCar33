/** Nombre de demandes acceptées par heure pour une même adresse. */
export const LIMITE_PAR_HEURE = 10

/** Durée de la fenêtre glissante : on regarde toujours la dernière heure. */
export const FENETRE_MS = 60 * 60 * 1000

/**
 * L'adresse du visiteur, vue à travers le proxy de l'hébergeur.
 * `x-forwarded-for` liste le visiteur puis les relais traversés : la première compte.
 *
 * En développement aucun proxy ne pose ces en-têtes : on regroupe tout le monde sous
 * une valeur fixe, ce qui rend la limite testable en local. En production on préfère
 * renvoyer `null` — mieux vaut une limite inactive, et un avertissement dans les logs,
 * que tous les visiteurs comptés comme une seule personne.
 */
export function ipDuVisiteur(entetes: Headers, environnement = process.env.NODE_ENV): string | null {
  const transmises = entetes.get('x-forwarded-for')
  const premiere = transmises?.split(',')[0]?.trim()
  if (premiere) return premiere

  const directe = entetes.get('x-real-ip')?.trim()
  if (directe) return directe

  return environnement === 'development' ? 'developpement-local' : null
}
