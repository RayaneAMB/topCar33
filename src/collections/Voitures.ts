import type { CollectionConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'
import { slugify, slugUnique } from '../lib/slug'
import { BOITES, CARBURANTS } from '../lib/voitureOptions'

export const Voitures: CollectionConfig = {
  slug: 'voitures',
  typescript: { interface: 'Voiture' },
  labels: { singular: 'Voiture', plural: 'Voitures' },
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'categorie', 'disponible', 'updatedAt'],
    listSearchableFields: ['marque', 'modele'],
    group: 'Catalogue',
  },
  access: {
    read: tousLesVisiteurs,
    create: connecte,
    update: connecte,
    delete: connecte,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data && !data.slug && data.marque && data.modele) {
          data.slug = await slugUnique({
            payload: req.payload,
            collection: 'voitures',
            base: slugify(`${data.marque} ${data.modele}`) || 'voiture',
            req,
          })
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        const marque = data.marque ?? originalDoc?.marque
        const modele = data.modele ?? originalDoc?.modele
        data.titre = [marque, modele].filter(Boolean).join(' ')
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'marque', label: 'Marque', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'modele', label: 'Modèle', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'categorie',
      label: 'Catégorie',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'photos',
      label: 'Photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      minRows: 1,
      maxRows: 10,
      admin: { description: 'La première photo est la photo principale.' },
    },
    { name: 'description', label: 'Description', type: 'richText' },
    {
      name: 'caracteristiques',
      label: 'Caractéristiques',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'boite',
              label: 'Boîte de vitesses',
              type: 'select',
              options: BOITES,
              required: true,
              defaultValue: 'manuelle',
            },
            { name: 'carburant', label: 'Carburant', type: 'select', options: CARBURANTS, required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'places', label: 'Places', type: 'number', required: true, min: 1, max: 9, defaultValue: 5 },
            { name: 'portes', label: 'Portes', type: 'number', min: 2, max: 5, defaultValue: 5 },
          ],
        },
        { name: 'climatisation', label: 'Climatisation', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'tarifs',
      label: 'Tarifs (€ TTC)',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'prixJour', label: 'Prix par jour', type: 'number', required: true, min: 0 },
            { name: 'prixWeekend', label: 'Prix week-end', type: 'number', min: 0 },
            { name: 'prixSemaine', label: 'Prix semaine', type: 'number', min: 0 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'caution', label: 'Caution', type: 'number', min: 0 },
            {
              name: 'kmInclus',
              label: 'Kilométrage inclus',
              type: 'text',
              admin: { placeholder: 'ex. 200 km/jour ou Illimité' },
            },
          ],
        },
      ],
    },
    {
      name: 'disponible',
      label: 'Disponible',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Décochez quand la voiture est louée : elle reste affichée avec un badge « Déjà louée ».',
      },
    },
    {
      name: 'titre',
      label: 'Titre',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Rempli automatiquement (marque + modèle).',
      },
    },
    {
      name: 'slug',
      label: 'Identifiant dans l’URL',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        // Une copie (bouton « Dupliquer ») doit recevoir son propre slug.
        beforeDuplicate: [() => null],
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Généré automatiquement à la création, ne change plus ensuite.',
      },
    },
  ],
}
