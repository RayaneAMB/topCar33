import type { Media } from '@/payload-types'

/**
 * Une série de vues prises en tournant autour d'une voiture — celle du décor
 * de fond, réglée dans Apparence.
 */
type SerieDeVues = (string | Media)[] | null | undefined

/**
 * En dessous de ce nombre de vues, la rotation saute d'un angle à l'autre :
 * mieux vaut ne rien montrer qu'un tour haché.
 */
export const MINIMUM_IMAGES = 8

/**
 * Les vues de la série, en version allégée, dans l'ordre où elles ont été versées.
 * Tout ou rien : une seule image manquante trouerait la rotation.
 */
export function imagesTour(serie: SerieDeVues): string[] {
  const vues = serie ?? []
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
 * Une série allégée, pour le décor de fond : il tourne sur toute la hauteur
 * d'une page, où la moitié des vues suffit à donner l'illusion du mouvement.
 * Chaque page du site chargerait sinon la série entière, pour de la décoration.
 */
export function allegerTour(images: string[], maximum = 18): string[] {
  if (images.length <= maximum) return images
  const pas = Math.ceil(images.length / maximum)
  return images.filter((_, index) => index % pas === 0).slice(0, maximum)
}
