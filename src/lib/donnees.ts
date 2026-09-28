import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { lireAgence, lirePagesLegales, listerCategories, listerVoitures, trouverVoiture } from './catalogue'

// Chaque lecture est faite une seule fois par requête, même si le layout et la page la demandent.
export const getPayloadClient = cache(() => getPayload({ config }))

export const getAgence = cache(async () => lireAgence(await getPayloadClient()))

export const getPagesLegales = cache(async () => lirePagesLegales(await getPayloadClient()))

export const getCategories = cache(async () => listerCategories(await getPayloadClient()))

export const getVoitures = cache(async (categorieSlug?: string) =>
  listerVoitures(await getPayloadClient(), { categorieSlug }),
)

export const getVoiture = cache(async (slug: string) => trouverVoiture(await getPayloadClient(), slug))
