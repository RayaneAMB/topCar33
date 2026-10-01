import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { urlDetouree } from './detourage'

/**
 * L'adresse de la photo détourée si le fichier existe, sinon rien.
 * Les photos sont stockées sur le disque du serveur : une simple vérification
 * suffit, et évite d'afficher une image manquante quand le détourage n'a pas
 * encore été lancé (`node scripts/detourer.mjs`).
 */
export function photoDetouree(url: string | null | undefined): string | null {
  if (!url) return null

  const detouree = urlDetouree(url)
  const nom = detouree.split('/').pop()
  if (!nom) return null

  return existsSync(join(process.env.MEDIA_DIR || 'media', decodeURIComponent(nom))) ? detouree : null
}

/**
 * Les adresses détourées d'une série, ou rien si une seule manque.
 * Tout ou rien : mélanger détouré et non détouré donnerait une rotation où le
 * fond apparaît et disparaît d'une vue à l'autre.
 */
export function photosDetourees(urls: string[]): string[] | null {
  const detourees = urls.map((url) => photoDetouree(url))
  return detourees.every((url): url is string => url !== null) ? detourees : null
}
