import { escapeHtml } from '../escapeHtml'

export type NatureDemande = 'location' | 'vente' | 'generale'

export type DemandeMail = {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  rue: string
  codePostal: string
  ville: string
  message: string
  voiture?: string
  nature?: NatureDemande
}

const OBJETS: Record<NatureDemande, string> = {
  location: 'Nouvelle demande de location',
  vente: 'Nouvelle demande d’achat',
  generale: 'Nouvelle demande',
}

export type AgenceMail = {
  nom: string
  telephone?: string | null
  emailPublic?: string | null
  adresse?: string
  horaires?: { jours: string; heures: string }[]
}

export type ContenuMail = { subject: string; html: string; text: string }

const STYLE_CELLULE = 'padding:6px 12px;border:1px solid #ddd;vertical-align:top'

const avecSautsDeLigne = (texte: string) => escapeHtml(texte).replace(/\r?\n/g, '<br>')

function tableau(lignes: [string, string][]): string {
  const contenu = lignes
    .map(
      ([libelle, valeur]) =>
        `<tr><th style="${STYLE_CELLULE};text-align:left;background:#f5f5f5">${escapeHtml(libelle)}</th>` +
        `<td style="${STYLE_CELLULE}">${escapeHtml(valeur)}</td></tr>`,
    )
    .join('')
  return `<table style="border-collapse:collapse;font-size:14px">${contenu}</table>`
}

/** Mail envoyé à l'agence pour chaque nouvelle demande. */
export function mailAgence(demande: DemandeMail, urlAdmin: string): ContenuMail {
  const lignes: [string, string][] = [
    ['Nom', `${demande.prenom} ${demande.nom}`],
    ['Email', demande.email],
    ['Téléphone', demande.telephone],
    ['Adresse', `${demande.rue}, ${demande.codePostal} ${demande.ville}`],
    ['Voiture', demande.voiture ?? 'Question générale'],
  ]

  const html = [
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">',
    '<h2 style="margin:0 0 12px">Nouvelle demande de contact</h2>',
    tableau(lignes),
    '<p style="margin:16px 0 4px"><strong>Message :</strong></p>',
    `<p style="margin:0">${avecSautsDeLigne(demande.message)}</p>`,
    `<p style="margin:16px 0 0"><a href="${escapeHtml(urlAdmin)}">Voir la demande dans l’administration</a></p>`,
    '<p style="margin:8px 0 0;color:#666">Astuce : « Répondre » écrit directement au client.</p>',
    '</div>',
  ].join('\n')

  const text = [
    'Nouvelle demande de contact',
    '',
    ...lignes.map(([libelle, valeur]) => `${libelle} : ${valeur}`),
    '',
    'Message :',
    demande.message,
    '',
    `Voir la demande dans l’administration : ${urlAdmin}`,
  ].join('\n')

  const voiture = demande.voiture ? ` (${demande.voiture})` : ''
  const objet = OBJETS[demande.nature ?? 'generale']
  return { subject: `${objet} — ${demande.prenom} ${demande.nom}${voiture}`, html, text }
}

/** Accusé de réception envoyé au client. */
export function mailClient(demande: DemandeMail, agence: AgenceMail): ContenuMail {
  const coordonnees: [string, string][] = []
  if (agence.telephone) coordonnees.push(['Téléphone', agence.telephone])
  if (agence.emailPublic) coordonnees.push(['Email', agence.emailPublic])
  if (agence.adresse) coordonnees.push(['Adresse', agence.adresse])
  for (const creneau of agence.horaires ?? []) coordonnees.push([creneau.jours, creneau.heures])

  const voiture = demande.voiture ?? 'Question générale'

  const html = [
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">',
    `<p>Bonjour ${escapeHtml(demande.prenom)},</p>`,
    '<p>Merci pour votre message : nous avons bien reçu votre demande et nous vous recontactons rapidement.</p>',
    `<p><strong>Voiture :</strong> ${escapeHtml(voiture)}</p>`,
    `<p><strong>Votre message :</strong><br>${avecSautsDeLigne(demande.message)}</p>`,
    coordonnees.length
      ? `<p style="margin:16px 0 8px"><strong>${escapeHtml(agence.nom)}</strong></p>${tableau(coordonnees)}`
      : '',
    `<p style="margin-top:16px">À très bientôt,<br>L’équipe ${escapeHtml(agence.nom)}</p>`,
    '</div>',
  ].join('\n')

  const text = [
    `Bonjour ${demande.prenom},`,
    '',
    'Merci pour votre message : nous avons bien reçu votre demande et nous vous recontactons rapidement.',
    '',
    `Voiture : ${voiture}`,
    'Votre message :',
    demande.message,
    '',
    ...(coordonnees.length ? [agence.nom, ...coordonnees.map(([libelle, valeur]) => `${libelle} : ${valeur}`), ''] : []),
    'À très bientôt,',
    `L’équipe ${agence.nom}`,
  ].join('\n')

  return { subject: `Votre demande a bien été reçue — ${agence.nom}`, html, text }
}
