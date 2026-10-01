import type { CollectionConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: { group: 'Catalogue' },
  access: {
    read: tousLesVisiteurs,
    create: connecte,
    update: connecte,
    delete: connecte,
  },
  fields: [
    {
      name: 'alt',
      label: 'Texte alternatif (décrit la photo)',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // MEDIA_DIR sert aux tests (dossier temporaire). En dev : dossier « media » à la racine du projet.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'miniature',
    imageSizes: [
      { name: 'miniature', width: 400 },
      { name: 'carte', width: 800 },
      { name: 'grande', width: 1600 },
      // Un tour à 360° charge 24 à 36 images d'affilée : elles doivent rester
      // légères, sinon la rotation saccade sur mobile.
      { name: 'tour', width: 600 },
    ],
  },
}
