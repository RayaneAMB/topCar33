import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config.js'

/** Données créées par les tests e2e (préfixe E2E), supprimées à la fin. */
export const E2E = {
  categorie: 'E2E Catégorie',
  marque: 'E2E',
  modele: 'Testmobile',
  altPhoto: 'Photo E2E',
  email: 'e2e@topcar33.example',
}

let instance: Payload | null = null
async function payloadE2E(): Promise<Payload> {
  instance ??= await getPayload({ config })
  return instance
}

export async function nettoyerDonneesE2E(): Promise<void> {
  const payload = await payloadE2E()
  await payload.delete({ collection: 'demandes', where: { email: { equals: E2E.email } } })
  await payload.delete({ collection: 'voitures', where: { marque: { equals: E2E.marque } } })
  await payload.delete({ collection: 'categories', where: { nom: { equals: E2E.categorie } } })
  await payload.delete({ collection: 'media', where: { alt: { equals: E2E.altPhoto } } })
}

export async function preparerDonneesE2E() {
  const payload = await payloadE2E()
  await nettoyerDonneesE2E()
  const image = await sharp({ create: { width: 1200, height: 750, channels: 3, background: '#445566' } })
    .png()
    .toBuffer()
  const photo = await payload.create({
    collection: 'media',
    data: { alt: E2E.altPhoto },
    file: { data: image, mimetype: 'image/png', name: 'e2e-photo.png', size: image.length },
  })
  const categorie = await payload.create({ collection: 'categories', data: { nom: E2E.categorie } })
  const voiture = await payload.create({
    collection: 'voitures',
    data: {
      marque: E2E.marque,
      modele: E2E.modele,
      categorie: categorie.id,
      photos: [photo.id],
      caracteristiques: { boite: 'automatique', carburant: 'electrique', places: 4 },
      tarifs: { prixJour: 12, prixSemaine: 70 },
      disponible: true,
    },
  })
  return { slugVoiture: voiture.slug as string, slugCategorie: categorie.slug as string, idVoiture: voiture.id }
}

export async function trouverDemandeE2E() {
  const payload = await payloadE2E()
  const { docs } = await payload.find({ collection: 'demandes', where: { email: { equals: E2E.email } }, depth: 0 })
  return docs[0] ?? null
}
