import { randomBytes } from 'node:crypto'
import type { Payload } from 'payload'

import { mailCodeConnexion } from '@/lib/demandes/emails'

import { DUREE_CODE_MS, genererCode, hacherCode, MAX_TENTATIVES, memeEmpreinte } from './code'

export type DebutConnexion =
  | { statut: 'succes'; jeton: string }
  | { statut: 'code-envoye'; identifiant: string }
  | { statut: 'erreur-envoi' }
  | { statut: 'invalide' }

export type ValidationCode =
  | { statut: 'succes'; jeton: string }
  | { statut: 'code-invalide'; essaisRestants: number }
  | { statut: 'trop-essais' }
  | { statut: 'expire' }

const secret = () => process.env.PAYLOAD_SECRET ?? ''

/** Remet l'utilisateur à zéro côté deuxième facteur. */
async function effacerAttente(payload: Payload, id: string | number): Promise<void> {
  await payload.update({
    collection: 'users',
    id,
    data: {
      codeAuthEmpreinte: null,
      codeAuthExpiration: null,
      codeAuthTentatives: 0,
      jetonEnAttente: null,
      identifiantAttente: null,
    },
  })
}

/**
 * Premier temps : on vérifie email et mot de passe.
 *
 * Sans double authentification, la session est ouverte immédiatement.
 * Avec, le jeton est mis de côté (jamais renvoyé au navigateur) et un code
 * part par mail ; seul le second temps le libère.
 */
export async function demarrerConnexion(
  payload: Payload,
  { email, motDePasse }: { email: string; motDePasse: string },
): Promise<DebutConnexion> {
  let jeton: string | undefined
  let utilisateurId: string | number | undefined

  try {
    // Le drapeau dit au garde-fou `beforeLogin` que la demande vient bien d'ici.
    const resultat = await payload.login({
      collection: 'users',
      data: { email, password: motDePasse },
      context: { deuxiemeFacteurValide: true },
    })
    jeton = resultat.token
    utilisateurId = resultat.user?.id
  } catch {
    // Mot de passe faux, compte inconnu ou verrouillé : une seule réponse, pour
    // ne pas révéler quelles adresses existent.
    return { statut: 'invalide' }
  }

  if (!jeton || utilisateurId === undefined) return { statut: 'invalide' }

  const securite = await payload.findGlobal({ slug: 'securite', depth: 0 })
  if (!securite?.doubleAuth) return { statut: 'succes', jeton }

  const code = genererCode()
  const identifiant = randomBytes(16).toString('hex')
  await payload.update({
    collection: 'users',
    id: utilisateurId,
    data: {
      codeAuthEmpreinte: hacherCode(code, secret()),
      codeAuthExpiration: new Date(Date.now() + DUREE_CODE_MS).toISOString(),
      codeAuthTentatives: 0,
      jetonEnAttente: jeton,
      identifiantAttente: identifiant,
    },
  })

  const agence = await payload.findGlobal({ slug: 'agence', depth: 0 })
  try {
    await payload.sendEmail({ to: email, ...mailCodeConnexion(code, agence?.nom || 'TopCar33') })
  } catch (erreur) {
    // Sans mail, le code est inatteignable : on efface l'attente plutôt que de
    // laisser l'utilisateur devant un écran qu'il ne peut pas franchir.
    payload.logger.error({ err: erreur, msg: 'Code de connexion non envoyé' })
    await effacerAttente(payload, utilisateurId)
    return { statut: 'erreur-envoi' }
  }

  return { statut: 'code-envoye', identifiant }
}

/**
 * Second temps : le code reçu par mail libère le jeton mis de côté.
 * Un identifiant inconnu et une attente périmée donnent la même réponse.
 */
export async function validerCode(
  payload: Payload,
  { identifiant, code }: { identifiant: string; code: string },
): Promise<ValidationCode> {
  const { docs } = await payload.find({
    collection: 'users',
    where: { identifiantAttente: { equals: identifiant } },
    limit: 1,
    depth: 0,
    showHiddenFields: true,
  })
  const utilisateur = docs[0]
  if (!utilisateur?.codeAuthEmpreinte || !utilisateur.jetonEnAttente) return { statut: 'expire' }

  const expiration = utilisateur.codeAuthExpiration ? Date.parse(utilisateur.codeAuthExpiration) : 0
  if (!expiration || expiration < Date.now()) {
    await effacerAttente(payload, utilisateur.id)
    return { statut: 'expire' }
  }

  if (!memeEmpreinte(hacherCode(code, secret()), utilisateur.codeAuthEmpreinte)) {
    const tentatives = (utilisateur.codeAuthTentatives ?? 0) + 1
    if (tentatives >= MAX_TENTATIVES) {
      await effacerAttente(payload, utilisateur.id)
      return { statut: 'trop-essais' }
    }
    await payload.update({
      collection: 'users',
      id: utilisateur.id,
      data: { codeAuthTentatives: tentatives },
    })
    return { statut: 'code-invalide', essaisRestants: MAX_TENTATIVES - tentatives }
  }

  const jeton = utilisateur.jetonEnAttente
  await effacerAttente(payload, utilisateur.id)
  return { statut: 'succes', jeton }
}
