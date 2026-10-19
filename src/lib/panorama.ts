import type { Media, Voiture } from '@/payload-types'

/**
 * L'image à charger dans la visionneuse 360° de l'habitacle, ou rien.
 *
 * La version « panorama » (plafonnée à 4096 px) d'abord : au-delà, bien des
 * téléphones refusent la texture et n'affichent qu'une erreur. Elle n'existe
 * que si l'original est plus large — sinon c'est l'original qui sert, et il
 * est déjà assez petit.
 *
 * Jamais les vignettes ordinaires : dans une visionneuse, on ne voit à la fois
 * qu'un quart de l'image ; une version de 1600 px y serait floue.
 */
export function urlPanorama(vue: Voiture['vueInterieure'] | null | undefined): string | null {
  if (!vue || typeof vue !== 'object') return null
  return vue.sizes?.panorama?.url || vue.url || null
}

/**
 * Vrai si les proportions sont celles d'un panorama à 360° (2:1).
 * Une photo ordinaire versée par erreur s'afficherait étirée sur la sphère :
 * mieux vaut ne rien montrer et le signaler dans l'administration.
 */
export function estUnPanorama(media: Pick<Media, 'width' | 'height'> | null | undefined): boolean {
  if (!media?.width || !media.height) return false
  const rapport = media.width / media.height
  return Math.abs(rapport - 2) < 0.05
}

/**
 * Le verdict affiché dans l'administration au versement d'une vue intérieure :
 * `true`, ou la phrase qui explique quoi corriger.
 *
 * Sans lui, une photo aux mauvaises proportions était simplement ignorée sur le
 * site — sans que personne ne sache pourquoi la section n'apparaissait pas.
 */
export function verifierPanorama(media: Pick<Media, 'width' | 'height'> | null | undefined): true | string {
  if (estUnPanorama(media)) return true
  if (!media?.width || !media.height) {
    return 'Les dimensions de cette photo sont inconnues : versez-la à nouveau.'
  }
  const attendue = Math.round(media.width / 2)
  return (
    `Ce n’est pas une photo à 360° : elle fait ${media.width} × ${media.height} px. ` +
    `Il faut une image deux fois plus large que haute — ici ${media.width} × ${attendue}. ` +
    'Vérifiez qu’aucun bandeau ni marge n’a été ajouté, et que c’est bien la photo 360° brute de la caméra.'
  )
}
