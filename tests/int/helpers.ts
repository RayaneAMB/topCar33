import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import config from '@/payload.config'
import type { Voiture } from '@/payload-types'
import { getPayload, type CollectionSlug, type Payload } from 'payload'
import sharp from 'sharp'

export async function initPayload(): Promise<Payload> {
  const payload = await getPayload({ config })
  await attendreCollectionsPretes(payload)
  return payload
}

/**
 * Sur une base neuve, MongoDB crée les collections et leurs index en arrière-plan au démarrage.
 * Une transaction lancée pendant ce temps échoue (« Unable to write … due to catalog changes »),
 * donc on attend que chaque modèle Mongoose soit prêt avant de lancer les tests.
 */
async function attendreCollectionsPretes(payload: Payload): Promise<void> {
  const db = payload.db as MongooseAdapter
  const modeles = [...Object.values(db.collections), db.globals, ...Object.values(db.versions ?? {})]
  await Promise.all(modeles.map((modele) => modele?.init()))
}

export function creerCategorie(payload: Payload, nom: string) {
  return payload.create({ collection: 'categories', data: { nom } })
}

/** Crée la marque si elle n'existe pas déjà, et la renvoie. */
export async function creerMarque(payload: Payload, nom: string) {
  const { docs } = await payload.find({ collection: 'marques', where: { nom: { equals: nom } }, limit: 1 })
  return docs[0] ?? (await payload.create({ collection: 'marques', data: { nom } }))
}

/** Vide les collections dans l'ordre donné (mettre les collections « enfants » en premier). */
/**
 * Recule la date de création des demandes, pour tester la fenêtre glissante
 * sans attendre une heure. Payload gère `createdAt` lui-même : on passe par Mongo.
 */
export async function vieillirDemandes(payload: Payload, minutes: number): Promise<void> {
  const db = payload.db as MongooseAdapter
  const date = new Date(Date.now() - minutes * 60 * 1000)
  await db.collections.demandes.collection.updateMany({}, { $set: { createdAt: date } })
}

export async function viderCollections(payload: Payload, collections: CollectionSlug[]): Promise<void> {
  for (const collection of collections) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
}

let compteurAdmins = 0

/** Crée un compte admin et le renvoie sous la forme attendue par l'option `user` de l'API locale. */
export async function creerAdmin(payload: Payload) {
  compteurAdmins += 1
  const admin = await payload.create({
    collection: 'users',
    data: {
      email: `admin-${Date.now()}-${compteurAdmins}@test.local`,
      password: 'mot-de-passe-de-test',
    },
  })
  return { ...admin, collection: 'users' as const }
}

/** Crée une image unie en mémoire et l'envoie dans la collection media. */
export async function creerImage(payload: Payload, alt = 'Photo de test', largeur = 1800, hauteur = 1100) {
  const data = await sharp({
    create: { width: largeur, height: hauteur, channels: 3, background: '#445566' },
  })
    .png()
    .toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/png', name: `test-${Date.now()}.png`, size: data.length },
  })
}

type OptionsVoiture = {
  /** Identifiant d'une marque existante, ou nom de marque (créée au besoin). */
  marque?: string
  modele?: string
  categorie?: string
  prixJour?: number
  disponible?: boolean
  offre?: 'location' | 'vente'
  prixVente?: number
  annee?: number
  kilometrage?: number
}

let compteurCategories = 0

/** Crée une voiture valide (avec photo et catégorie) ; chaque option peut être surchargée. */
export async function creerVoiture(payload: Payload, options: OptionsVoiture = {}) {
  const demande = options.marque ?? 'Peugeot'
  // Un identifiant Mongo fait 24 caractères hexadécimaux ; sinon c'est un nom de marque.
  const estUnId = /^[0-9a-f]{24}$/i.test(demande)
  const marqueDoc = estUnId ? null : await creerMarque(payload, demande)
  const marque = marqueDoc?.id ?? demande
  const nomMarque = marqueDoc?.nom ?? (await payload.findByID({ collection: 'marques', id: marque })).nom
  const modele = options.modele ?? '208'
  const offre = options.offre ?? 'location'
  let categorie = options.categorie
  if (!categorie) {
    compteurCategories += 1
    categorie = (await creerCategorie(payload, `Catégorie de test ${compteurCategories}-${Date.now()}`)).id
  }
  const photo = await creerImage(payload, `${nomMarque} ${modele}`, 900, 600)
  return payload.create({
    collection: 'voitures',
    data: {
      offre,
      marque,
      modele,
      categorie,
      photos: [photo.id],
      caracteristiques: { boite: 'manuelle', carburant: 'essence', places: 5 },
      tarifs: offre === 'location' ? { prixJour: options.prixJour ?? 35 } : undefined,
      vente:
        offre === 'vente'
          ? {
              prix: options.prixVente ?? 12900,
              annee: options.annee ?? 2019,
              kilometrage: options.kilometrage ?? 68000,
            }
          : undefined,
      disponible: options.disponible ?? true,
    },
  })
}
