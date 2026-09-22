import type { CollectionSlug, Payload, PayloadRequest } from 'payload'

/** Transforme un texte en identifiant d'URL : « Citroën C3 » → « citroen-c3 ». */
export function slugify(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Renvoie `base`, ou `base-2`, `base-3`… si le slug est déjà pris dans la collection. */
export async function slugUnique(args: {
  payload: Payload
  collection: CollectionSlug
  base: string
  req?: PayloadRequest
}): Promise<string> {
  const { payload, collection, base, req } = args
  for (let numero = 1; ; numero += 1) {
    const candidat = numero === 1 ? base : `${base}-${numero}`
    const { totalDocs } = await payload.count({ collection, where: { slug: { equals: candidat } }, req })
    if (totalDocs === 0) return candidat
  }
}
