import { stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

import { masqueDetourage } from './detourage'

/** Tailles réellement affichées : « carte » (800 px) et « tour » (600 px). */
export const MOTIF_TAILLE = /-(800|600)x\d+\.(webp|png|jpe?g)$/i
/** Les deux séparément : chacune a son repli propre, voir `fichiersAffiches`. */
const MOTIF_CARTE = /-800x\d+\.(webp|png|jpe?g)$/i
const MOTIF_TOUR = /-600x\d+\.(webp|png|jpe?g)$/i
export const MOTIF_IMAGE = /\.(webp|png|jpe?g)$/i
/** Suffixe de vignette posé par Payload : `<nom>-800x533.webp`. */
export const MOTIF_VIGNETTE = /-\d+x\d+$/

export const sansExtension = (nom: string) => nom.replace(/\.[^.]+$/, '')

/** Le nom du fichier détouré correspondant. */
export const nomDetoure = (nom: string) => `${sansExtension(nom)}-detoure.png`

/**
 * Vrai si la photo porte déjà un fond transparent.
 *
 * Un canal alpha ne suffit pas à l'affirmer : tout PNG en a un, le plus souvent
 * entièrement opaque. C'est sa valeur minimale qui tranche — s'il existe un
 * pixel franchement transparent, le découpage a déjà été fait en amont.
 */
async function aDejaUneTransparence(chemin: string): Promise<boolean> {
  const meta = await sharp(chemin).metadata()
  if (!meta.hasAlpha) return false

  const canalAlpha = (await sharp(chemin).stats()).channels[3]
  return canalAlpha !== undefined && canalAlpha.min < 250
}

/**
 * Produit la version détourée d'une photo, si elle n'existe pas déjà.
 *
 * Le travail vit ici plutôt que dans le script, parce que deux appelants en ont
 * besoin : la commande `scripts/detourer.mjs`, qui rattrape tout un dossier, et
 * le hook de la collection Média, qui traite une photo au moment où elle est
 * versée.
 *
 * Renvoie le nom du fichier produit, ou `null` s'il existait déjà.
 */
export async function detourerFichier(dossier: string, nom: string): Promise<string | null> {
  const cible = nomDetoure(nom)
  try {
    await stat(join(dossier, cible))
    return null // déjà détourée
  } catch {
    // à produire
  }

  const source = join(dossier, nom)

  // Photo déjà détourée à la source — cas courant des visuels de catalogue.
  // On la reprend telle quelle : notre découpe ferait moins bien, et sur un
  // véhicule blanc sur fond blanc elle mangerait la carrosserie, dont le blanc
  // est relié à celui du fond.
  if (await aDejaUneTransparence(source)) {
    await sharp(source).png({ compressionLevel: 9 }).toFile(join(dossier, cible))
    return cible
  }

  const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true })
  const alpha = masqueDetourage({
    pixels: data,
    largeur: info.width,
    hauteur: info.height,
    canaux: info.channels,
  })

  const png = await sharp(data, { raw: info })
    .ensureAlpha()
    .joinChannel(Buffer.from(alpha), { raw: { width: info.width, height: info.height, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toBuffer()

  await writeFile(join(dossier, cible), png)
  return cible
}

/**
 * Parmi les fichiers d'un dossier, ceux que le site affiche vraiment.
 *
 * Les vignettes « carte » (800) et « tour » (600), toujours. Et l'original
 * quand l'une des deux manque : Payload ne fabrique pas une vignette plus large
 * que la photo d'origine, et le site retombe alors sur l'original.
 *
 * Le repli se fait vignette par vignette, pas globalement : une carte réclame
 * « carte » et se rabat sur l'original même si « tour » existe. Confondre les
 * deux laissait justement passer les photos trop petites pour le 800, qui
 * s'affichaient avec leur fond.
 */
export function fichiersAffiches(tous: string[]): string[] {
  const candidats = tous.filter((nom) => MOTIF_IMAGE.test(nom) && !nom.includes('-detoure'))
  const racine = (nom: string) => sansExtension(nom).replace(MOTIF_VIGNETTE, '')
  const avecCarte = new Set(candidats.filter((nom) => MOTIF_CARTE.test(nom)).map(racine))
  const avecTour = new Set(candidats.filter((nom) => MOTIF_TOUR.test(nom)).map(racine))

  return candidats.filter((nom) => {
    if (MOTIF_TAILLE.test(nom)) return true
    const base = sansExtension(nom)
    // Une autre vignette (400 px, 1600 px) n'est jamais posée sur une carte.
    if (MOTIF_VIGNETTE.test(base)) return false
    return !avecCarte.has(base) || !avecTour.has(base)
  })
}
