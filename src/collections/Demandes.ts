import type { CollectionConfig } from 'payload'

import { connecte } from '../access'

export const Demandes: CollectionConfig = {
  slug: 'demandes',
  typescript: { interface: 'Demande' },
  labels: { singular: 'Demande de contact', plural: 'Demandes de contact' },
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'nature', 'voiture', 'statut', 'createdAt'],
    group: 'Demandes',
  },
  defaultSort: '-createdAt',
  // Le public ne passe jamais par l'API : le formulaire utilise l'API locale côté serveur.
  access: {
    read: connecte,
    create: connecte,
    update: connecte,
    delete: connecte,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const prenom = data.prenom ?? originalDoc?.prenom
        const nom = data.nom ?? originalDoc?.nom
        data.titre = [prenom, nom].filter(Boolean).join(' ')
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'prenom', label: 'Prénom', type: 'text', required: true, maxLength: 100 },
        { name: 'nom', label: 'Nom', type: 'text', required: true, maxLength: 100 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'telephone', label: 'Téléphone', type: 'text', required: true, maxLength: 30 },
      ],
    },
    {
      name: 'adresse',
      label: 'Adresse',
      type: 'group',
      fields: [
        { name: 'rue', label: 'Rue', type: 'text', required: true, maxLength: 200 },
        {
          type: 'row',
          fields: [
            { name: 'codePostal', label: 'Code postal', type: 'text', required: true, maxLength: 10 },
            { name: 'ville', label: 'Ville', type: 'text', required: true, maxLength: 100 },
          ],
        },
      ],
    },
    {
      name: 'voiture',
      label: 'Voiture concernée',
      type: 'relationship',
      relationTo: 'voitures',
      admin: { description: 'Vide = question générale.' },
    },
    { name: 'message', label: 'Message', type: 'textarea', required: true, maxLength: 2000 },
    {
      name: 'nature',
      label: 'Nature de la demande',
      type: 'select',
      defaultValue: 'generale',
      options: [
        { label: 'Location', value: 'location' },
        { label: 'Achat', value: 'vente' },
        { label: 'Question générale', value: 'generale' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Déduite de l’offre de la voiture au moment de la demande.',
      },
    },
    {
      name: 'statut',
      label: 'Statut',
      type: 'select',
      required: true,
      defaultValue: 'nouvelle',
      options: [
        { label: 'Nouvelle', value: 'nouvelle' },
        { label: 'Traitée', value: 'traitee' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'mailAgenceEnvoye',
      label: 'Mail envoyé à l’agence',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'mailClientEnvoye',
      label: 'Accusé de réception envoyé au client',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'titre',
      label: 'Titre',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Rempli automatiquement.' },
    },
  ],
}
