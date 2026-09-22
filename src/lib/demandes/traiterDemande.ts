import type { Payload } from 'payload'

import type { Agence, Voiture } from '@/payload-types'

import { adresseEnLigne } from '../format'
import { mailAgence, mailClient, type AgenceMail, type DemandeMail } from './emails'
import { CHAMP_PIEGE, type ErreursChamps } from './formulaire'
import { validerDemande } from './schema'

export type ResultatTraitement =
  | { statut: 'succes'; prenom: string }
  | { statut: 'invalide'; erreurs: ErreursChamps }
  | { statut: 'erreur'; message: string }

/**
 * 1. champ piège → faux succès ; 2. validation ; 3. enregistrement ;
 * 4. mail agence + mail client (un échec n'annule jamais la demande) ; 5. note des envois.
 */
export async function traiterDemande(
  payload: Payload,
  brut: Record<string, unknown>,
  options: { urlSite?: string } = {},
): Promise<ResultatTraitement> {
  const urlSite = options.urlSite ?? process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  const piege = brut[CHAMP_PIEGE]
  if (typeof piege === 'string' && piege.trim() !== '') {
    return { statut: 'succes', prenom: typeof brut.prenom === 'string' ? brut.prenom.trim() : '' }
  }

  const validation = validerDemande(brut)
  if (!validation.ok) return { statut: 'invalide', erreurs: validation.erreurs }
  const donnees = validation.donnees

  let agence: Agence | null = null
  try {
    agence = await payload.findGlobal({ slug: 'agence', depth: 0 })
  } catch (erreur) {
    payload.logger.error({ err: erreur, msg: 'Lecture des infos agence impossible' })
  }

  let voiture: Voiture | undefined
  let demandeId: string
  try {
    if (donnees.voiture) {
      const { docs } = await payload.find({
        collection: 'voitures',
        where: { slug: { equals: donnees.voiture } },
        limit: 1,
        depth: 0,
      })
      voiture = docs[0]
    }
    const demande = await payload.create({
      collection: 'demandes',
      data: {
        prenom: donnees.prenom,
        nom: donnees.nom,
        email: donnees.email,
        telephone: donnees.telephone,
        adresse: { rue: donnees.rue, codePostal: donnees.codePostal, ville: donnees.ville },
        voiture: voiture?.id ?? null,
        message: donnees.message,
        statut: 'nouvelle',
      },
    })
    demandeId = demande.id
  } catch (erreur) {
    payload.logger.error({ err: erreur, msg: 'Enregistrement de la demande de contact impossible' })
    const telephone = agence?.telephone ? ` ou appelez-nous au ${agence.telephone}` : ''
    return { statut: 'erreur', message: `Une erreur est survenue. Réessayez${telephone}.` }
  }

  const pourMail: DemandeMail = {
    id: demandeId,
    prenom: donnees.prenom,
    nom: donnees.nom,
    email: donnees.email,
    telephone: donnees.telephone,
    rue: donnees.rue,
    codePostal: donnees.codePostal,
    ville: donnees.ville,
    message: donnees.message,
    voiture: voiture?.titre ?? undefined,
  }
  const infosAgence: AgenceMail = {
    nom: agence?.nom || 'TopCar33',
    telephone: agence?.telephone,
    emailPublic: agence?.emailPublic,
    adresse: adresseEnLigne(agence?.adresse),
    horaires: (agence?.horaires ?? []).map(({ jours, heures }) => ({ jours, heures })),
  }

  let mailAgenceEnvoye = false
  if (agence?.emailDemandes) {
    try {
      await payload.sendEmail({
        to: agence.emailDemandes,
        replyTo: donnees.email,
        ...mailAgence(pourMail, `${urlSite}/admin/collections/demandes/${demandeId}`),
      })
      mailAgenceEnvoye = true
    } catch (erreur) {
      payload.logger.error({ err: erreur, msg: `Mail agence non envoyé (demande ${demandeId})` })
    }
  } else {
    payload.logger.warn(
      `Aucun « Email qui reçoit les demandes » dans Infos agence : demande ${demandeId} non transmise par mail`,
    )
  }

  let mailClientEnvoye = false
  try {
    await payload.sendEmail({ to: donnees.email, ...mailClient(pourMail, infosAgence) })
    mailClientEnvoye = true
  } catch (erreur) {
    payload.logger.error({ err: erreur, msg: `Accusé de réception non envoyé (demande ${demandeId})` })
  }

  try {
    await payload.update({ collection: 'demandes', id: demandeId, data: { mailAgenceEnvoye, mailClientEnvoye } })
  } catch (erreur) {
    payload.logger.error({ err: erreur, msg: `Suivi des mails non enregistré (demande ${demandeId})` })
  }

  return { statut: 'succes', prenom: donnees.prenom }
}
