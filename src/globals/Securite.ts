import type { GlobalConfig } from 'payload'

import { connecte } from '../access'

/**
 * Réglages de connexion au back-office.
 * Comme « Mails », ce global n'est pas public.
 */
export const Securite: GlobalConfig = {
  slug: 'securite',
  typescript: { interface: 'ReglagesSecurite' },
  label: 'Sécurité',
  admin: {
    group: 'Réglages',
    description: 'Comment on entre dans l’administration.',
  },
  access: {
    read: connecte,
    update: connecte,
  },
  fields: [
    {
      name: 'doubleAuth',
      label: 'Double authentification par email',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        className: 'tc-interrupteur',
        description:
          'Après le mot de passe, un code à 6 chiffres est envoyé par email et doit être saisi. Il est valable 10 minutes. En cas de blocage (plus accès à la boîte mail), lancer « npm run 2fa:off » depuis le dossier du projet.',
      },
    },
  ],
}
