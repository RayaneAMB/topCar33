import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * - en test : pas d'adaptateur (Payload écrit dans la console, les tests espionnent `sendEmail`) ;
 * - sans SMTP_HOST (dev) : compte de test Ethereal, aucun vrai envoi ; les identifiants de la boîte de test s'affichent dans le terminal au démarrage ;
 * - avec SMTP_HOST : vrai serveur SMTP (Gmail, Brevo, Resend…).
 */
export function adaptateurEmail(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV === 'test') return undefined

  const expediteur = {
    defaultFromAddress: env.SMTP_FROM_ADDRESS || 'contact@topcar33.com',
    defaultFromName: env.SMTP_FROM_NAME || 'TopCar33',
  }

  if (!env.SMTP_HOST) return nodemailerAdapter(expediteur)

  const port = Number(env.SMTP_PORT || 587)
  return nodemailerAdapter({
    ...expediteur,
    transportOptions: {
      host: env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    },
  })
}
