import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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

export type PieceJointe = { filename: string; content: Buffer; cid: string; contentType: string }

export type ContenuMail = { subject: string; html: string; text: string; attachments?: PieceJointe[] }

/**
 * Mails HTML « à l'ancienne » : tableaux, styles en ligne, 600 px de large.
 * Aucune police web ni SVG — Gmail et Outlook les suppriment. Le logo est donc
 * composé en texte : le nom en capitales espacées, les chiffres finaux en cyan.
 */
const ANTHRACITE = '#282d2e'
const GRAPHITE = '#5c5e60'
const PETROLE = '#017a8d'
const CYAN = '#00c2d4'
const FOND = '#f2f5f6'
const TRAIT = '#e3e8ea'
const REPLI = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif"
const POLICE = `'Montserrat',${REPLI}`
const POLICE_TITRE = `'Bank Gothic','Montserrat',${REPLI}`

/**
 * Les polices du site, chargées depuis le site lui-même.
 * Gmail (web, iOS, Android), Outlook Windows et Yahoo les ignorent : ces clients
 * affichent le repli, d'où une pile de secours derrière chaque `font-family`.
 * Apple Mail, Mail iOS, Thunderbird et Outlook Mac, eux, les respectent.
 */
function declarationsPolices(): string {
  const site = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/+$/, '')
  return (
    '<style>' +
    `@font-face{font-family:'Montserrat';src:url('${site}/polices/montserrat-latin-wght-normal.woff2') format('woff2');font-weight:400 700;font-style:normal;font-display:swap}` +
    `@font-face{font-family:'Bank Gothic';src:url('${site}/polices/BankGothic-Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:swap}` +
    '</style>'
  )
}

type Ligne = { libelle: string; valeur: string; lien?: string }

const avecSautsDeLigne = (texte: string) => escapeHtml(texte).replace(/\r?\n/g, '<br>')

const CID_LOGO = 'logo-topcar33'
const CHEMIN_LOGO = join(process.cwd(), 'public', 'marque', 'logo-mail.png')
let logoEnCache: Buffer | null | undefined

/**
 * Adresse publique du logo. Renseignée, l'image est simplement liée ;
 * vide, le logo voyage avec le mail (`cid:`) et s'affiche même depuis un site local.
 * Une URL ne fonctionne que si elle est servie en `image/png` (ou jpg, gif) :
 * un fichier rendu en `text/plain` reste invisible dans les boîtes mail.
 */
function urlLogo(): string | undefined {
  return process.env.MAIL_LOGO_URL?.trim() || undefined
}

/** Le fichier du logo, lu une seule fois. Absent, on retombe sur le nom en texte. */
function logoMail(): Buffer | null {
  if (logoEnCache === undefined) {
    try {
      logoEnCache = readFileSync(CHEMIN_LOGO)
    } catch {
      logoEnCache = null
    }
  }
  return logoEnCache
}

function piecesJointes(...ajouts: (PieceJointe | undefined)[]): PieceJointe[] {
  const logo = urlLogo() ? null : logoMail()
  const pieces = logo
    ? [{ filename: 'logo-topcar33.png', content: logo, cid: CID_LOGO, contentType: 'image/png' }]
    : []
  return [...pieces, ...ajouts.filter((piece): piece is PieceJointe => Boolean(piece))]
}

/** « TopCar33 » → TOPCAR en blanc, 33 en cyan. Repli quand le logo n'est pas lisible. */
function logoTexte(nom: string): string {
  const correspondance = /^(.*?)(\d+)$/.exec(nom.trim())
  const base = escapeHtml((correspondance?.[1] ?? nom).toUpperCase())
  const chiffres = correspondance?.[2] ? escapeHtml(correspondance[2]) : ''
  return (
    `<span style="font-family:${POLICE_TITRE};font-size:21px;font-weight:700;letter-spacing:.14em;color:${ANTHRACITE}">${base}</span>` +
    (chiffres
      ? `<span style="font-family:${POLICE_TITRE};font-size:21px;font-weight:700;letter-spacing:.14em;color:${PETROLE}">${chiffres}</span>`
      : '')
  )
}

/** Liste d'informations : libellé discret à gauche, valeur en avant à droite. */
function lignesInfos(lignes: Ligne[]): string {
  const corps = lignes
    .map(({ libelle, valeur, lien }, index) => {
      const bord = index ? `border-top:1px solid ${TRAIT};` : ''
      const contenu = lien
        ? `<a href="${escapeHtml(lien)}" style="color:${PETROLE};text-decoration:none">${escapeHtml(valeur)}</a>`
        : escapeHtml(valeur)
      return (
        `<tr>` +
        `<td style="${bord}padding:11px 12px 11px 0;font-family:${POLICE};font-size:13px;color:${GRAPHITE};white-space:nowrap;vertical-align:top">${escapeHtml(libelle)}</td>` +
        `<td style="${bord}padding:11px 0;font-family:${POLICE};font-size:15px;font-weight:600;color:${ANTHRACITE};text-align:right;vertical-align:top">${contenu}</td>` +
        `</tr>`
      )
    })
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:22px 0 0">${corps}</table>`
}

/** Bouton « à toute épreuve » : un tableau, pas un <button>. */
function bouton(lien: string, libelle: string): string {
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:30px 0 4px"><tr>` +
    `<td style="background:${PETROLE};border-radius:4px">` +
    `<a href="${escapeHtml(lien)}" style="display:inline-block;padding:14px 28px;font-family:${POLICE};font-size:15px;font-weight:700;letter-spacing:.02em;color:#ffffff;text-decoration:none">${escapeHtml(libelle)}</a>` +
    `</td></tr></table>`
  )
}

/**
 * Le titre du mail, en vrai texte.
 *
 * Il a longtemps été une image prérendue, seul moyen d'imposer Bank Gothic à
 * Gmail. Le remède coûtait plus cher que le mal : une pièce jointe par mail, un
 * titre qui disparaît quand le client bloque les images, et rien de
 * sélectionnable. Montserrat en capitales espacées en donne l'allure, et
 * s'affiche partout.
 */
function titre(texte: string): string {
  return `<h1 style="margin:0;font-family:${POLICE};font-size:21px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${ANTHRACITE}">${escapeHtml(texte)}</h1>`
}

function paragraphe(html: string, marge = '16px 0 0'): string {
  return `<p style="margin:${marge};font-family:${POLICE};font-size:15px;line-height:1.6;color:${GRAPHITE}">${html}</p>`
}

/** Le message du visiteur, détaché du reste par un filet cyan. */
function citation(intitule: string, message: string): string {
  return (
    `<p style="margin:26px 0 0;font-family:${POLICE};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${GRAPHITE}">${escapeHtml(intitule)}</p>` +
    `<div style="margin:8px 0 0;padding:15px 18px;background:#f7fafa;border-left:3px solid ${CYAN};font-family:${POLICE};font-size:15px;line-height:1.6;color:${ANTHRACITE}">${avecSautsDeLigne(message)}</div>`
  )
}

/** Le logo — lié ou embarqué —, ou son équivalent en texte si l'image manque. */
function banniere(nom: string): string {
  const source = urlLogo() ?? (logoMail() ? `cid:${CID_LOGO}` : null)
  if (source) {
    // Pas de hauteur fixe : le logo peut être horizontal ou empilé, Outlook se base
    // sur la largeur et garde les proportions.
    return (
      `<img src="${escapeHtml(source)}" alt="${escapeHtml(nom)}" width="160" ` +
      'style="display:block;width:160px;max-width:100%;height:auto;border:0">'
    )
  }
  return (
    logoTexte(nom) +
    `<div style="margin:5px 0 0;font-family:${POLICE};font-size:9px;font-weight:600;letter-spacing:.34em;color:#5c5e60">ACHAT VENTE LOCATION</div>`
  )
}

function enveloppe(options: { nomAgence: string; apercu: string; corps: string; pied: string }): string {
  return [
    '<!doctype html>',
    '<html lang="fr"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="color-scheme" content="light only">',
    declarationsPolices(),
    '</head>',
    `<body style="margin:0;padding:0;background:${FOND}">`,
    `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${FOND}">${escapeHtml(options.apercu)}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${FOND};padding:28px 12px">`,
    '<tr><td align="center">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border-collapse:collapse">',
    `<tr><td style="background:#ffffff;padding:24px 28px 20px;border:1px solid ${TRAIT};border-bottom:0;border-radius:6px 6px 0 0">`,
    banniere(options.nomAgence),
    '</td></tr>',
    `<tr><td style="height:3px;background:${CYAN};font-size:0;line-height:0">&nbsp;</td></tr>`,
    `<tr><td style="background:#ffffff;padding:32px 28px;border:1px solid ${TRAIT};border-top:0;border-radius:0 0 6px 6px">`,
    options.corps,
    '</td></tr>',
    `<tr><td style="padding:18px 28px 0;font-family:${POLICE};font-size:12px;line-height:1.6;color:${GRAPHITE}">${options.pied}</td></tr>`,
    '</table></td></tr></table></body></html>',
  ].join('')
}

/** Mail envoyé à l'agence pour chaque nouvelle demande. */
export function mailAgence(demande: DemandeMail, urlAdmin: string, agence?: AgenceMail): ContenuMail {
  const nomAgence = agence?.nom || 'TopCar33'
  const voiture = demande.voiture ?? 'Question générale'
  const objet = OBJETS[demande.nature ?? 'generale']

  const lignes: Ligne[] = [
    { libelle: 'Nom', valeur: `${demande.prenom} ${demande.nom}` },
    { libelle: 'Email', valeur: demande.email, lien: `mailto:${demande.email}` },
    { libelle: 'Téléphone', valeur: demande.telephone, lien: `tel:${demande.telephone.replace(/\s/g, '')}` },
    { libelle: 'Adresse', valeur: `${demande.rue}, ${demande.codePostal} ${demande.ville}` },
    { libelle: 'Voiture', valeur: voiture },
  ]

  const corps = [
    titre(objet),
    paragraphe(`Reçue le ${new Date().toLocaleDateString('fr-FR')} via le formulaire du site.`, '10px 0 0'),
    lignesInfos(lignes),
    citation('Son message', demande.message),
    bouton(urlAdmin, 'Voir la demande'),
    paragraphe('Un clic sur « Répondre » écrit directement au client.', '14px 0 0'),
  ].join('')

  const html = enveloppe({
    nomAgence,
    apercu: `${demande.prenom} ${demande.nom} — ${voiture}`,
    corps,
    pied: `Message automatique du site ${escapeHtml(nomAgence)}.`,
  })

  const text = [
    objet,
    '',
    ...lignes.map(({ libelle, valeur }) => `${libelle} : ${valeur}`),
    '',
    'Message :',
    demande.message,
    '',
    `Voir la demande dans l’administration : ${urlAdmin}`,
  ].join('\n')

  const suffixe = demande.voiture ? ` (${demande.voiture})` : ''
  return { subject: `${objet} — ${demande.prenom} ${demande.nom}${suffixe}`, html, text, attachments: piecesJointes() }
}

/** Accusé de réception envoyé au client. */
export function mailClient(demande: DemandeMail, agence: AgenceMail): ContenuMail {
  const voiture = demande.voiture ?? 'Question générale'

  const coordonnees: Ligne[] = []
  if (agence.telephone) {
    coordonnees.push({
      libelle: 'Téléphone',
      valeur: agence.telephone,
      lien: `tel:${agence.telephone.replace(/\s/g, '')}`,
    })
  }
  if (agence.emailPublic) {
    coordonnees.push({ libelle: 'Email', valeur: agence.emailPublic, lien: `mailto:${agence.emailPublic}` })
  }
  if (agence.adresse) coordonnees.push({ libelle: 'Adresse', valeur: agence.adresse })
  for (const creneau of agence.horaires ?? []) {
    coordonnees.push({ libelle: creneau.jours, valeur: creneau.heures })
  }

  const corps = [
    titre('Demande bien reçue'),
    paragraphe(`Bonjour ${escapeHtml(demande.prenom)},`, '18px 0 0'),
    paragraphe('Nous avons votre demande sous les yeux et nous vous recontactons rapidement.'),
    `<div style="margin:24px 0 0;padding:15px 18px;background:#f7fafa;border:1px solid ${TRAIT};border-radius:6px">` +
      `<div style="font-family:${POLICE};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${GRAPHITE}">Voiture</div>` +
      `<div style="margin:5px 0 0;font-family:${POLICE};font-size:17px;font-weight:700;color:${ANTHRACITE}">${escapeHtml(voiture)}</div>` +
      '</div>',
    citation('Ce que vous nous avez écrit', demande.message),
    coordonnees.length
      ? `<div style="margin:30px 0 0;padding:20px 22px;background:#f7fafa;border:1px solid ${TRAIT};border-radius:6px">` +
        `<p style="margin:0;font-family:${POLICE};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${GRAPHITE}">Nous joindre</p>` +
        lignesInfos(coordonnees).replace('margin:22px 0 0', 'margin:10px 0 0') +
        '</div>'
      : '',
    paragraphe(`À très bientôt,<br>L’équipe ${escapeHtml(agence.nom)}`, '26px 0 0'),
  ].join('')

  const html = enveloppe({
    nomAgence: agence.nom,
    apercu: 'Nous avons bien reçu votre demande et nous vous recontactons rapidement.',
    corps,
    pied: 'Vous recevez ce message parce que vous avez rempli le formulaire de contact. Inutile d’y répondre : nous revenons vers vous.',
  })

  const text = [
    `Bonjour ${demande.prenom},`,
    '',
    'Nous avons votre demande sous les yeux et nous vous recontactons rapidement.',
    '',
    `Voiture : ${voiture}`,
    'Votre message :',
    demande.message,
    '',
    ...(coordonnees.length
      ? [agence.nom, ...coordonnees.map(({ libelle, valeur }) => `${libelle} : ${valeur}`), '']
      : []),
    'À très bientôt,',
    `L’équipe ${agence.nom}`,
  ].join('\n')

  return { subject: `Votre demande a bien été reçue — ${agence.nom}`, html, text, attachments: piecesJointes() }
}

/**
 * Code à 6 chiffres pour entrer dans l'administration.
 * Volontairement sobre : pas de lien cliquable, rien à faire d'autre que
 * recopier le code — c'est ce qui rend ce genre de mail difficile à imiter.
 */
export function mailCodeConnexion(code: string, nomAgence: string): ContenuMail {
  const corps = [
    titre('Code de connexion'),
    paragraphe(`Voici le code pour accéder à l’administration de ${escapeHtml(nomAgence)}.`, '18px 0 0'),
    `<div style="margin:24px 0 0;padding:20px;background:#f7fafa;border:1px solid ${TRAIT};border-radius:6px;text-align:center">` +
      `<div style="font-family:${POLICE};font-size:34px;font-weight:700;letter-spacing:.32em;color:${ANTHRACITE};padding-left:.32em">${escapeHtml(code)}</div>` +
      '</div>',
    paragraphe('Ce code est valable 10 minutes et ne sert qu’une fois.'),
    paragraphe(
      'Si vous n’êtes pas à l’origine de cette connexion, ignorez ce message et changez votre mot de passe : quelqu’un connaît vos identifiants.',
      '20px 0 0',
    ),
  ].join('')

  const html = enveloppe({
    nomAgence,
    apercu: `Votre code de connexion : ${code}`,
    corps,
    pied: 'Message automatique. Ne transmettez ce code à personne.',
  })

  const text = [
    'Code de connexion',
    '',
    `Voici le code pour accéder à l’administration de ${nomAgence} : ${code}`,
    '',
    'Ce code est valable 10 minutes et ne sert qu’une fois.',
    'Si vous n’êtes pas à l’origine de cette connexion, ignorez ce message et changez votre mot de passe.',
  ].join('\n')

  return { subject: `${code} — votre code de connexion`, html, text, attachments: piecesJointes() }
}
