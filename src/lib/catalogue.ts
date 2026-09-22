import type { Payload } from 'payload'

import type { Agence, Categorie, PagesLegales, Voiture } from '@/payload-types'

export async function listerCategories(payload: Payload): Promise<Categorie[]> {
  const { docs } = await payload.find({ collection: 'categories', sort: 'nom', limit: 100, depth: 0 })
  return docs
}

/** Voitures triées par prix/jour croissant ; `categorieSlug` inconnu = toutes les voitures. */
export async function listerVoitures(
  payload: Payload,
  options: { categorieSlug?: string } = {},
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

  const { docs: voitures } = await payload.find({
    collection: 'voitures',
    where: categorieActive ? { categorie: { equals: categorieActive.id } } : undefined,
    sort: 'tarifs.prixJour',
    limit: 100,
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
