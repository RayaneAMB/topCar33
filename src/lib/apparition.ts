/**
 * Faut-il faire entrer cet élément, ou le laisser simplement là ?
 *
 * Deux cas disent non, et pour deux raisons différentes :
 *
 * - le visiteur a demandé moins d'animations : on n'insiste pas ;
 * - l'élément est déjà à l'écran au chargement. Le faire disparaître pour le
 *   faire revenir produirait un clignotement, et « entrer » n'a de sens que
 *   pour ce qu'on n'a pas encore vu.
 */
export function doitEntrer({
  hautRelatif,
  hauteurFenetre,
  animationsReduites,
}: {
  /** Distance entre le haut de l'élément et le haut de la fenêtre. */
  hautRelatif: number
  hauteurFenetre: number
  animationsReduites: boolean
}): boolean {
  if (animationsReduites) return false
  return hautRelatif >= hauteurFenetre
}
