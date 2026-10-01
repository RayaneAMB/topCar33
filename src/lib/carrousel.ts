/**
 * Règle de navigation du carrousel, utilisée dans le navigateur.
 * À part des données de vedette : ce fichier ne doit rien importer du serveur,
 * sinon le composant client entraîne tout le module avec lui.
 */

/** La voiture affichée après un balayage horizontal. */
export function apresGlissement({
  index,
  deplacement,
  seuil,
  total,
}: {
  index: number
  deplacement: number
  seuil: number
  total: number
}): number {
  if (total <= 1 || Math.abs(deplacement) < seuil) return index
  // Vers la gauche, on avance dans la liste, comme on tourne une page.
  const sens = deplacement < 0 ? 1 : -1
  return (index + sens + total) % total
}
