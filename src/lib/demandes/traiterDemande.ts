import type { Payload } from 'payload'

import type { Agence, ReglagesMails, Voiture } from '@/payload-types'

import { adresseEnLigne } from '../format'
import { mailAgence, mailClient, type AgenceMail, type DemandeMail, type NatureDemande } from './emails'
import { CHAMP_PIEGE, type ErreursChamps } from './formulaire'
import { empreinteIp } from './empreinte'
import { FENETRE_MS, LIMITE_PAR_HEURE } from './limite'
import { validerDemande } from './schema'

export type ResultatTraitement =
  | { statut: 'succes'; prenom: string }
  | { statut: 'invalide'; erreurs: ErreursChamps }
  | { statut: 'erreur'; message: string }

/** Le numéro de téléphone de l'agence, en complément d'un message d'erreur. */
function rappelTelephone(agence: Agence | null): string {
  return agence?.telephone ? ` ou appelez-nous au ${agence.telephone}` : ''
}

/**
 * 1. champ piège → faux succès ; 2. validation ; 3. limite par adresse ;
 * 4. enregistrement ; 5. mail agence + mail client (un échec n'annule jamais la
 * demande) ; 6. note des envois.
 */
export async function traiterDemande(
  payload: Payload,
  brut: Record<string, unknown>,
  options: { urlSite?: string; ip?: string | null } = {},
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

  let reglagesMails: ReglagesMails | null = null
  try {
    reglagesMails = await payload.findGlobal({ slug: 'mails', depth: 0 })
  } catch (erreur) {
    payload.logger.error({ err: erreur, msg: 'Lecture des réglages mails impossible' })
  }
  const destinataires = (reglagesMails?.destinataires ?? [])
    .map(({ email }) => email?.trim())
    .filter((email): email is string => Boolean(email))
  const copieCachee = reglagesMails?.copieCachee?.trim() || undefined

  // Une même adresse ne peut pas inonder l'agence : on compte ses demandes de la
  // dernière heure. Sans adresse connue (hébergement sans proxy), on laisse passer
  // plutôt que de bloquer tout le monde d'un coup.
  const limite = reglagesMails?.limiteParHeure ?? LIMITE_PAR_HEURE
  const empreinte = options.ip ? empreinteIp(options.ip, process.env.PAYLOAD_SECRET ?? '') : null
  if (!empreinte) {
    payload.logger.warn(
      `Adresse du visiteur inconnue : la limite de ${limite} demandes par heure ne s’applique pas.`,
    )
  } else {
    const debutFenetre = new Date(Date.now() - FENETRE_MS).toISOString()
    const { totalDocs } = await payload.count({
      collection: 'demandes',
      where: {
        and: [{ empreinteIp: { equals: empreinte } }, { createdAt: { greater_than: debutFenetre } }],
      },
    })
    if (totalDocs >= limite) {
      payload.logger.warn(`Limite horaire atteinte pour une adresse (${totalDocs} demandes) : demande refusée.`)
      return {
        statut: 'erreur',
        message:
          `Vous avez déjà envoyé ${limite} demandes dans l’heure. ` +
          `Réessayez plus tard${rappelTelephone(agence)}.`,
      }
    }
  }

  let voiture: Voiture | undefined
  let nature: NatureDemande = 'generale'
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
    if (voiture) nature = voiture.offre === 'vente' ? 'vente' : 'location'
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
        nature,
        statut: 'nouvelle',
        empreinteIp: empreinte,
      },
    })
    demandeId = demande.id
  } catch (erreur) {
    payload.logger.error({ err: erreur, msg: 'Enregistrement de la demande de contact impossible' })
    return { statut: 'erreur', message: `Une erreur est survenue. Réessayez${rappelTelephone(agence)}.` }
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
    nature,
  }
  const infosAgence: AgenceMail = {
    nom: agence?.nom || 'TopCar33',
    telephone: agence?.telephone,
    emailPublic: agence?.emailPublic,
    adresse: adresseEnLigne(agence?.adresse),
    horaires: (agence?.horaires ?? []).map(({ jours, heures }) => ({ jours, heures })),
  }

  let mailAgenceEnvoye = false
  if (destinataires.length) {
    try {
      await payload.sendEmail({
        to: destinataires,
        ...(copieCachee ? { bcc: copieCachee } : {}),
        replyTo: donnees.email,
        ...mailAgence(pourMail, `${urlSite}/admin/collections/demandes/${demandeId}`, infosAgence),
      })
      mailAgenceEnvoye = true
    } catch (erreur) {
      payload.logger.error({ err: erreur, msg: `Mail agence non envoyé (demande ${demandeId})` })
    }
  } else {
    payload.logger.warn(
      `Aucun destinataire dans Réglages → Mails : demande ${demandeId} non transmise par mail`,
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
