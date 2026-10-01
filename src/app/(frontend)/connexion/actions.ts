'use server'

import { redirect } from 'next/navigation'

import { demarrerConnexion, validerCode } from '@/lib/auth/connexion'
import { ouvrirSession } from '@/lib/auth/session'
import { destinationSure, type EtatConnexion } from '@/lib/auth/etatConnexion'
import { getPayloadClient } from '@/lib/donnees'

const texte = (formData: FormData, champ: string) => String(formData.get(champ) ?? '').trim()

/** Premier temps : email et mot de passe. */
export async function envoyerIdentifiants(
  _etat: EtatConnexion,
  formData: FormData,
): Promise<EtatConnexion> {
  const email = texte(formData, 'email')
  const motDePasse = String(formData.get('motDePasse') ?? '')

  if (!email || !motDePasse) {
    return { etape: 'identifiants', email, message: 'Renseignez votre email et votre mot de passe.' }
  }

  const payload = await getPayloadClient()
  const resultat = await demarrerConnexion(payload, { email, motDePasse })

  if (resultat.statut === 'invalide') {
    return { etape: 'identifiants', email, message: 'Email ou mot de passe incorrect.' }
  }

  if (resultat.statut === 'erreur-envoi') {
    return {
      etape: 'identifiants',
      email,
      message:
        'Le code n’a pas pu être envoyé. Vérifiez la configuration des mails, ou désactivez la double authentification avec « npm run 2fa:off ».',
    }
  }

  if (resultat.statut === 'code-envoye') {
    return { etape: 'code', identifiant: resultat.identifiant, email }
  }

  await ouvrirSession(payload, resultat.jeton)
  redirect(destinationSure(formData.get('destination')))
}

/** Second temps : le code reçu par mail. */
export async function envoyerCode(_etat: EtatConnexion, formData: FormData): Promise<EtatConnexion> {
  const identifiant = texte(formData, 'identifiant')
  const email = texte(formData, 'email')
  const code = texte(formData, 'code')
  const attente = { etape: 'code', identifiant, email } as const

  if (!/^\d{6}$/.test(code)) {
    return { ...attente, message: 'Le code comporte 6 chiffres.' }
  }

  const payload = await getPayloadClient()
  const resultat = await validerCode(payload, { identifiant, code })

  if (resultat.statut === 'code-invalide') {
    const reste = resultat.essaisRestants
    return { ...attente, message: `Code incorrect. ${reste} essai${reste > 1 ? 's' : ''} restant${reste > 1 ? 's' : ''}.` }
  }

  if (resultat.statut === 'trop-essais') {
    return { etape: 'identifiants', email, message: 'Trop d’essais. Recommencez la connexion.' }
  }

  if (resultat.statut === 'expire') {
    return { etape: 'identifiants', email, message: 'Ce code a expiré. Recommencez la connexion.' }
  }

  await ouvrirSession(payload, resultat.jeton)
  redirect(destinationSure(formData.get('destination')))
}
