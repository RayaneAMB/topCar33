import { APIError, type CollectionConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'
import { slugify, slugUnique } from '../lib/slug'

export const Marques: CollectionConfig = {
  slug: 'marques',
  typescript: { interface: 'Marque' },
  labels: { singular: 'Marque', plural: 'Marques' },
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'slug'],
    group: 'Catalogue',
    description: 'La liste proposée dans le formulaire d’une voiture. Ajoutez ici les marques qui manquent.',
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
            collection: 'marques',
            base: slugify(data.nom) || 'marque',
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
          where: { marque: { equals: id } },
          req,
        })
        if (totalDocs > 0) {
          throw new APIError(
            `Impossible de supprimer cette marque : elle est utilisée par ${totalDocs} voiture(s).`,
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
