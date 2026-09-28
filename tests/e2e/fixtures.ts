import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config.js'

/** Données créées par les tests e2e (préfixe E2E), supprimées à la fin. */
export const E2E = {
  categorie: 'E2E Catégorie',
  // La marque vient désormais d'une liste fixe : on prend une marque réelle,
  // et ce sont les modèles inventés qui identifient les données de test.
  marque: 'Tesla' as const,
  modele: 'Testmobile',
  modeleVente: 'Vendmobile',
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
  await payload.delete({ collection: 'voitures', where: { modele: { in: [E2E.modele, E2E.modeleVente] } } })
  await payload.delete({ collection: 'categories', where: { nom: { equals: E2E.categorie } } })
  await payload.delete({ collection: 'media', where: { alt: { equals: E2E.altPhoto } } })
}

/** La marque est une fiche de la base : on la réutilise si elle existe déjà. */
async function trouverOuCreerMarque(payload: Payload, nom: string) {
  const { docs } = await payload.find({ collection: 'marques', where: { nom: { equals: nom } }, limit: 1 })
  return docs[0] ?? (await payload.create({ collection: 'marques', data: { nom } }))
}

export async function preparerDonneesE2E() {
  const payload = await payloadE2E()
  await nettoyerDonneesE2E()
  const marque = await trouverOuCreerMarque(payload, E2E.marque)
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
      offre: 'location',
      marque: marque.id,
      modele: E2E.modele,
      categorie: categorie.id,
      photos: [photo.id],
      caracteristiques: { boite: 'automatique', carburant: 'electrique', places: 4 },
      tarifs: { prixJour: 12, prixSemaine: 70 },
      disponible: true,
    },
  })
  const voitureVente = await payload.create({
    collection: 'voitures',
    data: {
      offre: 'vente',
      marque: marque.id,
      modele: E2E.modeleVente,
      categorie: categorie.id,
      photos: [photo.id],
      caracteristiques: { boite: 'manuelle', carburant: 'diesel', places: 5 },
      vente: { prix: 9900, annee: 2020, kilometrage: 45000 },
      disponible: true,
    },
  })
  return {
    slugVoiture: voiture.slug as string,
    slugVoitureVente: voitureVente.slug as string,
    slugCategorie: categorie.slug as string,
    idVoiture: voiture.id,
  }
}

export async function trouverDemandeE2E() {
  const payload = await payloadE2E()
  const { docs } = await payload.find({ collection: 'demandes', where: { email: { equals: E2E.email } }, depth: 0 })
  return docs[0] ?? null
}
