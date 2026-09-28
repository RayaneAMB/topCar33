import type { Payload, Where } from 'payload'

import type { Agence, Categorie, PagesLegales, Voiture } from '@/payload-types'
import type { OffreVoiture } from './format'

export async function listerCategories(payload: Payload): Promise<Categorie[]> {
  const { docs } = await payload.find({ collection: 'categories', sort: 'nom', limit: 100, depth: 0 })
  return docs
}

/**
 * Voitures d'une offre, triées par leur prix croissant (prix/jour en location, prix de vente en vente).
 * `categorieSlug` inconnu = toutes les voitures de l'offre.
 */
export async function listerVoitures(
  payload: Payload,
  options: { offre?: OffreVoiture; categorieSlug?: string; limite?: number } = {},
): Promise<{ voitures: Voiture[]; categorieActive: Categorie | null }> {
  let categorieActive: Categorie | null = null
  if (options.categorieSlug) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: options.categorieSlug } },
      limit: 1,
      depth: 0,
    })
    categorieActive = docs[0] ?? null
  }

  const filtres: Where[] = []
  if (options.offre === 'vente') filtres.push({ offre: { equals: 'vente' } })
  // « not_equals » attrape aussi les voitures enregistrées avant l'ajout du champ offre.
  if (options.offre === 'location') filtres.push({ offre: { not_equals: 'vente' } })
  if (categorieActive) filtres.push({ categorie: { equals: categorieActive.id } })

  const triParPrix = options.offre === 'vente' ? 'vente.prix' : 'tarifs.prixJour'

  const { docs: voitures } = await payload.find({
    collection: 'voitures',
    where: filtres.length ? { and: filtres } : undefined,
    sort: options.offre ? triParPrix : 'titre',
    limit: options.limite ?? 100,
    depth: 1,
  })
  return { voitures, categorieActive }
}

export async function trouverVoiture(payload: Payload, slug: string): Promise<Voiture | null> {
  const { docs } = await payload.find({
    collection: 'voitures',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export async function lireAgence(payload: Payload): Promise<Agence> {
  return payload.findGlobal({ slug: 'agence', depth: 1 })
}

export async function lirePagesLegales(payload: Payload): Promise<PagesLegales> {
  return payload.findGlobal({ slug: 'pages-legales', depth: 0 })
}
