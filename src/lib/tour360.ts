import type { Voiture } from '@/payload-types'

/**
 * En dessous de ce nombre de vues, la rotation saute d'un angle à l'autre :
 * mieux vaut ne rien montrer qu'un tour haché.
 */
export const MINIMUM_IMAGES = 8

/**
 * Les vues du tour, en version allégée, dans l'ordre où elles ont été versées.
 * Tout ou rien : une seule image manquante trouerait la rotation.
 */
export function imagesTour(tour: Voiture['tour360'] | null | undefined): string[] {
  const vues = tour ?? []
  if (vues.length < MINIMUM_IMAGES) return []

  const urls: string[] = []
  for (const vue of vues) {
    if (typeof vue !== 'object' || !vue) return []
    const url = vue.sizes?.tour?.url || vue.url
    if (!url) return []
    urls.push(url)
  }

  return urls
}

/**
 * La vue à afficher après un glissement horizontal.
 * `pas` est la distance, en pixels, qui fait passer à la vue suivante :
 * en dessous, rien ne bouge, sinon la voiture tremblerait au moindre frémissement.
 */
export function vueSuivante({
  depart,
  deplacement,
  pas,
  total,
}: {
  depart: number
  deplacement: number
  pas: number
  total: number
}): number {
  if (total <= 0) return 0
  // Vers la gauche, la voiture tourne dans le sens des prises de vue.
  const franchis = Math.trunc(deplacement / pas)
  return (((depart + franchis) % total) + total) % total
}

/**
 * Une série allégée, pour le décor de fond : il tourne sur toute la hauteur
 * d'une page, où la moitié des vues suffit à donner l'illusion du mouvement.
 * Chaque page du site chargerait sinon la série entière, pour de la décoration.
 */
export function allegerTour(images: string[], maximum = 18): string[] {
  if (images.length <= maximum) return images
  const pas = Math.ceil(images.length / maximum)
  return images.filter((_, index) => index % pas === 0).slice(0, maximum)
}
