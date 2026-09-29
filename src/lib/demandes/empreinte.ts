import { createHash } from 'node:crypto'

/**
 * L'adresse IP n'est jamais enregistrée telle quelle : on garde une empreinte,
 * salée avec le secret du site. Elle suffit à reconnaître un visiteur qui insiste,
 * sans conserver de donnée personnelle ni permettre de remonter à lui.
 *
 * À part des constantes de `limite.ts` : ce fichier dépend de `node:crypto`, qui
 * n'a rien à faire dans le paquet chargé par l'administration.
 */
export function empreinteIp(ip: string, secret: string): string {
  return createHash('sha256')
    .update(`${secret}:${ip}`)
    .digest('hex')
    .slice(0, 32)
}
