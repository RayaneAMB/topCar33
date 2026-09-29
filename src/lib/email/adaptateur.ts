import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type SMTPConnection from 'nodemailer/lib/smtp-connection'

/**
 * Une config SMTP à moitié remplie est le piège classique : le site répond
 * « Merci », mais aucun mail ne sort. On prévient au démarrage.
 * Renvoie le message d'alerte, ou null si la configuration se tient.
 */
export function alerteSmtp(env: Record<string, string | undefined>): string | null {
  if (!env.SMTP_HOST?.trim()) return null

  const problemes: string[] = []
  const manquants = (['SMTP_USER', 'SMTP_PASS'] as const).filter((cle) => !env[cle]?.trim())
  if (manquants.length) {
    problemes.push(`${manquants.join(' et ')} ${manquants.length > 1 ? 'sont vides' : 'est vide'}`)
  }
  if (env.SMTP_FROM_NAME?.includes('@')) {
    problemes.push('SMTP_FROM_NAME contient une adresse email (le nom et l’adresse sont deux lignes séparées)')
  }

  if (!problemes.length) return null
  return `Configuration SMTP incomplète (${env.SMTP_HOST}) : ${problemes.join(', ')} — aucun mail ne partira.`
}

/**
 * - en test : pas d'adaptateur (Payload écrit dans la console, les tests espionnent `sendEmail`) ;
 * - sans SMTP_HOST (dev) : compte de test Ethereal, aucun vrai envoi ; les identifiants de la
 *   boîte de test s'affichent dans le terminal au démarrage ;
 * - avec SMTP_HOST : vrai serveur SMTP (Gmail, Brevo, Resend…). L'adaptateur est construit
 *   une fois au démarrage : après avoir modifié `.env`, il faut relancer `npm run dev`.
 */
export function adaptateurEmail(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV === 'test') return undefined

  const alerte = alerteSmtp(env)
  if (alerte) console.warn(`[mails] ${alerte}`)

  const expediteur = {
    defaultFromAddress: env.SMTP_FROM_ADDRESS || 'contact@topcar33.com',
    defaultFromName: env.SMTP_FROM_NAME || 'TopCar33',
  }

  if (!env.SMTP_HOST) return nodemailerAdapter(expediteur)

  const port = Number(env.SMTP_PORT || 587)
  // `auth` est absent de SMTPConnection.Options (typage nodemailer 10) alors que
  // createTransport l'accepte : on force le type plutôt que de perdre l'authentification.
  const transportOptions = {
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  } as SMTPConnection.Options

  return nodemailerAdapter({ ...expediteur, transportOptions })
}
