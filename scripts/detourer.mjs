/**
 * Découpe le fond blanc des photos de voitures.
 *
 * Les photos de studio ont un fond blanc plein. Sur un thème sombre, ce blanc
 * forme un rectangle autour de la voiture. Plutôt que de le masquer par des
 * ruses d'affichage, on le retire une bonne fois : chaque photo reçoit une
 * version détourée, `<nom>-detoure.png`, servie comme les autres.
 *
 * Usage : node scripts/detourer.mjs [dossier-media]
 * À relancer après avoir versé de nouvelles photos.
 */
import { readdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

import { masqueDetourage } from '../src/lib/images/detourage.ts'

const DOSSIER = process.argv[2] || process.env.MEDIA_DIR || 'media'
/** Tailles affichées à l'écran : « carte » (800 px) et « tour » (600 px). */
const MOTIF = /-(800|600)x\d+\.(webp|png|jpe?g)$/i
const IMAGE = /\.(webp|png|jpe?g)$/i
/** Suffixe de vignette posé par Payload : `<nom>-800x533.webp`. */
const VIGNETTE = /-\d+x\d+$/
const sansExtension = (nom) => nom.replace(/\.[^.]+$/, '')

const toutes = (await readdir(DOSSIER)).filter((nom) => IMAGE.test(nom) && !nom.includes('-detoure'))
/** Les photos dont Payload a bien produit une vignette d'affichage. */
const avecVignette = new Set(
  toutes.filter((nom) => MOTIF.test(nom)).map((nom) => sansExtension(nom).replace(VIGNETTE, '')),
)

const fichiers = toutes.filter((nom) => {
  if (MOTIF.test(nom)) return true
  // Faute de vignette « carte » ou « tour », c'est l'original que le site
  // affiche : sans lui, ces voitures-là gardaient leur fond blanc.
  const base = sansExtension(nom)
  return !VIGNETTE.test(base) && !avecVignette.has(base)
})
let faits = 0

for (const nom of fichiers) {
  const cible = join(DOSSIER, `${nom.replace(/\.[^.]+$/, '')}-detoure.png`)
  try {
    await stat(cible)
    continue // déjà détourée
  } catch {
    // à produire
  }

  const { data, info } = await sharp(join(DOSSIER, nom)).raw().toBuffer({ resolveWithObject: true })
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

  await writeFile(cible, png)
  faits += 1
  console.log(`${nom} → ${cible.split(/[\\/]/).pop()}`)
}

console.log(faits === 0 ? 'Rien à détourer : tout est déjà fait.' : `${faits} photo(s) détourée(s).`)
