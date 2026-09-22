import { APIError, type CollectionConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'
import { slugify, slugUnique } from '../lib/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  typescript: { interface: 'Categorie' },
  labels: { singular: 'Catégorie', plural: 'Catégories' },
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'slug'],
    group: 'Catalogue',
  },
  defaultSort: 'nom',
  access: {
    read: tousLesVisiteurs,
    create: connecte,
    update: connecte,
    delete: connecte,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data && !data.slug && typeof data.nom === 'string') {
          data.slug = await slugUnique({
            payload: req.payload,
            collection: 'categories',
            base: slugify(data.nom) || 'categorie',
            req,
          })
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'voitures',
          where: { categorie: { equals: id } },
          req,
        })
        if (totalDocs > 0) {
          throw new APIError(
            `Impossible de supprimer cette catégorie : elle est utilisée par ${totalDocs} voiture(s).`,
            400,
          )
        }
      },
    ],
  },
  fields: [
    { name: 'nom', label: 'Nom', type: 'text', required: true, unique: true },
    {
      name: 'slug',
      label: 'Identifiant dans l’URL',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Généré automatiquement à la création, ne change plus ensuite.',
      },
    },
  ],
}
