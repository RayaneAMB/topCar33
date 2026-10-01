import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

/** Durée de validité du code envoyé par mail. */
export const DUREE_CODE_MS = 10 * 60 * 1000

/** Au-delà, le code est annulé : il faut recommencer la connexion. */
export const MAX_TENTATIVES = 5

/** Un code à 6 chiffres, tiré au hasard de façon cryptographique. */
export function genererCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

/**
 * Le code n'est jamais enregistré en clair : seule son empreinte l'est.
 * Quelqu'un qui lirait la base ne pourrait pas s'en servir pour se connecter.
 */
export function hacherCode(code: string, secret: string): string {
  return createHmac('sha256', secret).update(code).digest('hex')
}

/**
 * Comparaison à temps constant : le temps de réponse ne révèle pas
 * combien de caractères sont corrects.
 */
export function memeEmpreinte(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
