import type { CollectionConfig, PayloadRequest } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'
import { verifierPanorama } from '../lib/panorama'
import { slugify, slugUnique } from '../lib/slug'
import { BOITES, CARBURANTS, OFFRES } from '../lib/voitureOptions'
import { limiterFiltres } from './filtres'

const ANNEE_MAX = new Date().getFullYear() + 1

/** Le titre et l'URL ont besoin du nom de la marque, pas de son identifiant. */
async function nomDeMarque(req: PayloadRequest, marque: unknown): Promise<string> {
  if (!marque) return ''
  if (typeof marque === 'object' && 'nom' in (marque as Record<string, unknown>)) {
    return String((marque as { nom?: unknown }).nom ?? '')
  }
  const doc = await req.payload.findByID({
    collection: 'marques',
    id: String(marque),
    depth: 0,
    req,
    disableErrors: true,
  })
  return doc?.nom ?? ''
}

export const Voitures: CollectionConfig = {
  slug: 'voitures',
  typescript: { interface: 'Voiture' },
  labels: { singular: 'Voiture', plural: 'Voitures' },
  admin: {
    useAsTitle: 'titre',
    // La photo d'abord : on reconnaît une voiture avant de lire son nom.
    defaultColumns: ['photos', 'titre', 'offre', 'prixListe', 'disponible', 'updatedAt'],
    listSearchableFields: ['titre', 'modele'],
    group: 'Catalogue',
    components: {
      beforeListTable: ['/components/admin/FiltresRapides#FiltresRapides'],
    },
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
          const nom = await nomDeMarque(req, data.marque)
          data.slug = await slugUnique({
            payload: req.payload,
            collection: 'voitures',
            base: slugify(`${nom} ${data.modele}`) || 'voiture',
            req,
          })
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const nomComplet = data.nomComplet ?? originalDoc?.nomComplet
        if (nomComplet) {
          data.titre = nomComplet
          return data
        }
        const marque = data.marque ?? originalDoc?.marque
        const modele = data.modele ?? originalDoc?.modele
        const nom = await nomDeMarque(req, marque)
        data.titre = [nom, modele].filter(Boolean).join(' ')
        return data
      },
    ],
  },
  // Ne restent filtrables que les cinq colonnes sur lesquelles on trie vraiment
  // un parc. Un modèle précis se trouve plus vite par la barre de recherche que
  // par un filtre à construire.
  fields: limiterFiltres(
    [
      {
        name: 'offre',
        label: 'Offre',
        type: 'radio',
        options: OFFRES,
        defaultValue: 'location',
        required: true,
        admin: {
          layout: 'horizontal',
          description:
            'À louer : tarifs de location. À vendre : prix de vente, année et kilométrage.',
        },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'marque',
            label: 'Marque',
            type: 'relationship',
            relationTo: 'marques',
            required: true,
            admin: {
              width: '50%',
              description:
                'Marque absente de la liste ? Ajoutez-la avec le bouton + à droite du champ.',
            },
          },
          {
            name: 'modele',
            label: 'Modèle',
            type: 'text',
            required: true,
            admin: { width: '50%', placeholder: 'ex. 208, Clio V, Duster' },
          },
        ],
      },
      {
        name: 'nomComplet',
        label: 'Nom complet (facultatif)',
        type: 'text',
        admin: {
          placeholder: 'ex. Renault Trafic L2H2 9 places',
          description:
            'S’il est rempli, c’est ce nom qui s’affiche partout sur le site. Sinon : marque + modèle. L’adresse de la page ne change pas.',
        },
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
        admin: {
          description: 'La première photo est la photo principale.',
          components: { Cell: '/components/admin/CellulePhoto#CellulePhoto' },
        },
      },
      {
        name: 'vueInterieure',
        label: 'Vue intérieure à 360°',
        type: 'upload',
        relationTo: 'media',
        // Refus explicite d'une photo aux mauvaises proportions : le site
        // l'ignorerait de toute façon, autant le dire tout de suite.
        validate: async (valeur: unknown, { req }: { req: PayloadRequest }) => {
          if (!valeur) return true
          const id = typeof valeur === 'object' ? (valeur as { id?: string }).id : valeur
          if (typeof id !== 'string') return true
          try {
            const media = await req.payload.findByID({ collection: 'media', id, depth: 0, req })
            return verifierPanorama(media)
          } catch {
            // Photo introuvable : Payload signale déjà la relation cassée.
            return true
          }
        },
        admin: {
          description:
            'Facultatif. Une seule photo panoramique de l’habitacle, prise avec une caméra 360 (Insta360, Ricoh Theta…) posée entre les sièges avant. Format attendu : deux fois plus large que haute (ex. 6000 × 3000). Le visiteur pourra regarder tout autour de lui.',
        },
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
              {
                name: 'carburant',
                label: 'Carburant',
                type: 'select',
                options: CARBURANTS,
                required: true,
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'places',
                label: 'Places',
                type: 'number',
                required: true,
                min: 1,
                max: 9,
                defaultValue: 5,
              },
              { name: 'portes', label: 'Portes', type: 'number', min: 2, max: 5, defaultValue: 5 },
            ],
          },
          { name: 'climatisation', label: 'Climatisation', type: 'checkbox', defaultValue: true },
        ],
      },
      {
        name: 'vente',
        label: 'Vente',
        type: 'group',
        admin: { condition: (data) => data?.offre === 'vente' },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'prix',
                label: 'Prix de vente',
                type: 'number',
                min: 0,
                // Obligatoire uniquement pour une voiture à vendre.
                validate: (
                  valeur: number | number[] | null | undefined,
                  { data }: { data?: { offre?: string } },
                ) => {
                  if (data?.offre !== 'vente') return true
                  return typeof valeur === 'number' && valeur >= 0
                    ? true
                    : 'Indiquez le prix de vente'
                },
              },
              { name: 'annee', label: 'Année', type: 'number', min: 1950, max: ANNEE_MAX },
              { name: 'kilometrage', label: 'Kilométrage (km)', type: 'number', min: 0 },
            ],
          },
        ],
      },
      {
        name: 'tarifs',
        label: 'Tarifs de location (€ TTC)',
        type: 'group',
        admin: { condition: (data) => data?.offre !== 'vente' },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'prixJour',
                label: 'Prix par jour',
                type: 'number',
                min: 0,
                // Obligatoire uniquement pour une voiture à louer.
                validate: (
                  valeur: number | number[] | null | undefined,
                  { data }: { data?: { offre?: string } },
                ) => {
                  if (data?.offre === 'vente') return true
                  return typeof valeur === 'number' && valeur >= 0
                    ? true
                    : 'Indiquez le prix par jour'
                },
              },
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
        // Colonne de la liste seulement : le prix qui compte selon l'offre
        // (vente ou prix par jour). Rien n'est enregistré.
        name: 'prixListe',
        label: 'Prix',
        type: 'ui',
        admin: {
          components: {
            Field: false,
            Cell: '/components/admin/CellulePrix#CellulePrix',
          },
        },
      },
      {
        name: 'disponible',
        label: 'Disponible',
        type: 'checkbox',
        defaultValue: true,
        admin: {
          position: 'sidebar',
          description:
            'Décochez quand la voiture est louée : elle reste affichée avec un badge « Déjà louée ».',
          components: {
            Cell: '/components/admin/CelluleDisponible#CelluleDisponible',
          },
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
    ['offre', 'marque', 'categorie', 'disponible', 'prix'],
  ),
}
