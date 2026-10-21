import type { GlobalConfig } from 'payload'

import { connecte } from '../access'
import { LIMITE_PAR_HEURE } from '../lib/demandes/limite'

/**
 * Réglages d'envoi des demandes de contact.
 * Contrairement à « Infos agence », ce global n'est PAS public : les adresses
 * qui reçoivent les demandes ne doivent pas sortir par l'API.
 */
export const Mails: GlobalConfig = {
  slug: 'mails',
  typescript: { interface: 'ReglagesMails' },
  label: 'Mails',
  admin: {
    group: 'Réglages',
    description: 'Qui est prévenu quand un visiteur envoie le formulaire de contact.',
  },
  access: {
    read: connecte,
    update: connecte,
  },
  fields: [
    {
      name: 'destinataires',
      label: 'Qui reçoit les demandes',
      type: 'array',
      labels: { singular: 'Adresse', plural: 'Adresses' },
      admin: {
        description:
          'Chaque demande part vers toutes ces adresses. Sans aucune adresse, la demande reste enregistrée dans « Demandes » mais n’est transmise à personne.',
      },
      fields: [{ name: 'email', label: 'Adresse email', type: 'email', required: true }],
    },
    {
      name: 'copieCachee',
      label: 'Copie cachée (Cci)',
      type: 'email',
      admin: {
        description: 'Facultatif : reçoit une copie de chaque demande sans apparaître dans le mail.',
      },
    },
    {
      name: 'limiteParHeure',
      label: 'Demandes maximum par heure et par visiteur',
      type: 'number',
      min: 1,
      admin: {
        placeholder: String(LIMITE_PAR_HEURE),
        description: `Au-delà, la demande est refusée avec un message. Vide = ${LIMITE_PAR_HEURE}.`,
        step: 1,
      },
    },
  ],
}
