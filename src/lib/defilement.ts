/**
 * La vue à afficher selon la position de la section dans l'écran.
 *
 * `haut` est la distance entre le haut de la section et le haut de la fenêtre :
 * positif tant que la section est plus bas, négatif quand elle remonte.
 * La rotation commence quand la section arrive en haut et se termine quand son
 * bas atteint le bas de la fenêtre — la voiture a fait un tour complet pendant
 * qu'on la traversait, ni avant, ni après.
 */
export function vueDepuisDefilement({
  haut,
  hauteur,
  fenetre,
  total,
}: {
  haut: number
  hauteur: number
  fenetre: number
  total: number
}): number {
  if (total <= 0) return 0

  const course = hauteur - fenetre
  if (course <= 0) return 0

  const avancement = Math.min(Math.max(-haut / course, 0), 1)
  return Math.min(Math.round(avancement * (total - 1)), total - 1)
}
