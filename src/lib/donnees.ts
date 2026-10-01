import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import {
  lireAgence,
  lirePagesLegales,
  listerCategories,
  listerVoitures,
  trouverVoiture,
  lireApparence,
} from './catalogue'
import type { OffreVoiture } from './format'

// Chaque lecture est faite une seule fois par requête, même si le layout et la page la demandent.
export const getPayloadClient = cache(() => getPayload({ config }))

export const getAgence = cache(async () => lireAgence(await getPayloadClient()))

export const getPagesLegales = cache(async () => lirePagesLegales(await getPayloadClient()))

export const getCategories = cache(async () => listerCategories(await getPayloadClient()))

export const getVoitures = cache(async (offre?: OffreVoiture, categorieSlug?: string, limite?: number) =>
  listerVoitures(await getPayloadClient(), { offre, categorieSlug, limite }),
)

export const getVoiture = cache(async (slug: string) => trouverVoiture(await getPayloadClient(), slug))

export const getApparence = cache(async () => lireApparence(await getPayloadClient()))
