import type { GlobalConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'

export const Agence: GlobalConfig = {
  slug: 'agence',
  typescript: { interface: 'Agence' },
  label: 'Infos agence',
  admin: { group: 'Réglages' },
  access: {
    read: tousLesVisiteurs,
    update: connecte,
  },
  fields: [
    { name: 'nom', label: 'Nom de l’agence', type: 'text', defaultValue: 'TopCar33' },
    {
      name: 'accroche',
      label: 'Titre de la bannière d’accueil',
      type: 'text',
      defaultValue: 'Louez la voiture qu’il vous faut.',
    },
    { name: 'sousAccroche', label: 'Sous-titre de la bannière d’accueil', type: 'text' },
    {
      name: 'adresse',
      label: 'Adresse',
      type: 'group',
      fields: [
        { name: 'rue', label: 'Rue', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'codePostal', label: 'Code postal', type: 'text' },
            { name: 'ville', label: 'Ville', type: 'text' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'telephone', label: 'Téléphone', type: 'text' },
        { name: 'emailPublic', label: 'Email affiché sur le site', type: 'email' },
      ],
    },
    {
      name: 'horaires',
      label: 'Horaires',
      type: 'array',
      labels: { singular: 'Créneau', plural: 'Créneaux' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'jours', label: 'Jours', type: 'text', required: true, admin: { placeholder: 'Lundi – Samedi' } },
            { name: 'heures', label: 'Heures', type: 'text', required: true, admin: { placeholder: '9h – 19h' } },
          ],
        },
      ],
    },
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Facultatif : sans logo, le nom de l’agence s’affiche en texte.' },
    },
  ],
}
