import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import config from '@/payload.config'
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

/** Vide les collections dans l'ordre donné (mettre les collections « enfants » en premier). */
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
  const marque = options.marque ?? 'Peugeot'
  const modele = options.modele ?? '208'
  const offre = options.offre ?? 'location'
  let categorie = options.categorie
  if (!categorie) {
    compteurCategories += 1
    categorie = (await creerCategorie(payload, `Catégorie de test ${compteurCategories}-${Date.now()}`)).id
  }
  const photo = await creerImage(payload, `${marque} ${modele}`, 900, 600)
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
