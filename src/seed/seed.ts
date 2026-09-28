import type { Payload } from 'payload'

import { slugify } from '../lib/slug'
import { imageVoiture, type Silhouette } from './images'
import { paragraphes } from './lexical'

const CATEGORIES = ['Citadine', 'SUV', 'Utilitaire']

type VoitureTemporaire = {
  offre: 'location' | 'vente'
  marque: string
  modele: string
  categorie: string
  silhouette: Silhouette
  couleur: string
  boite: 'manuelle' | 'automatique'
  carburant: 'essence' | 'diesel' | 'hybride' | 'electrique'
  places: number
  portes: number
  tarifs?: { prixJour: number; prixWeekend: number; prixSemaine: number; caution: number; kmInclus: string }
  vente?: { prix: number; annee: number; kilometrage: number }
  disponible: boolean
}

const VOITURES: VoitureTemporaire[] = [
  {
    offre: 'location',
    marque: 'Peugeot', modele: '208', categorie: 'Citadine', silhouette: 'citadine', couleur: '#cfd3d8',
    boite: 'manuelle', carburant: 'essence', places: 5, portes: 5,
    tarifs: { prixJour: 35, prixWeekend: 90, prixSemaine: 210, caution: 800, kmInclus: '200 km/jour' },
    disponible: true,
  },
  {
    offre: 'location',
    marque: 'Renault', modele: 'Clio', categorie: 'Citadine', silhouette: 'citadine', couleur: '#b5563c',
    boite: 'automatique', carburant: 'hybride', places: 5, portes: 5,
    tarifs: { prixJour: 39, prixWeekend: 100, prixSemaine: 240, caution: 800, kmInclus: '200 km/jour' },
    disponible: true,
  },
  {
    offre: 'location',
    marque: 'Dacia', modele: 'Duster', categorie: 'SUV', silhouette: 'suv', couleur: '#8a9a5b',
    boite: 'manuelle', carburant: 'diesel', places: 5, portes: 5,
    tarifs: { prixJour: 49, prixWeekend: 130, prixSemaine: 300, caution: 1000, kmInclus: '250 km/jour' },
    disponible: true,
  },
  {
    offre: 'location',
    marque: 'Renault', modele: 'Trafic', categorie: 'Utilitaire', silhouette: 'utilitaire', couleur: '#e8e8e8',
    boite: 'manuelle', carburant: 'diesel', places: 3, portes: 4,
    tarifs: { prixJour: 69, prixWeekend: 170, prixSemaine: 400, caution: 1500, kmInclus: '150 km/jour' },
    disponible: false,
  },
  {
    offre: 'vente',
    marque: 'Peugeot', modele: '308', categorie: 'Citadine', silhouette: 'citadine', couleur: '#4a6d8c',
    boite: 'manuelle', carburant: 'diesel', places: 5, portes: 5,
    vente: { prix: 12900, annee: 2019, kilometrage: 68000 },
    disponible: true,
  },
  {
    offre: 'vente',
    marque: 'Citroën', modele: 'C3', categorie: 'Citadine', silhouette: 'citadine', couleur: '#d8c3a5',
    boite: 'automatique', carburant: 'essence', places: 5, portes: 5,
    vente: { prix: 10500, annee: 2021, kilometrage: 35000 },
    disponible: true,
  },
]

const AGENCE_TEMPORAIRE = {
  nom: 'TopCar33',
  accroche: 'Louez la voiture qu’il vous faut.',
  sousAccroche: 'Véhicules récents et entretenus, à partir de 35 € par jour.',
  adresse: { rue: 'Adresse temporaire — à remplacer', codePostal: '33000', ville: 'Bordeaux' },
  telephone: '05 00 00 00 00',
  emailPublic: 'contact@topcar33.example',
  emailDemandes: 'demandes@topcar33.example',
  horaires: [
    { jours: 'Lundi – Vendredi', heures: '9h – 19h' },
    { jours: 'Samedi', heures: '9h – 12h' },
  ],
}

async function trouverOuCreerCategorie(payload: Payload, nom: string): Promise<string> {
  const { docs } = await payload.find({ collection: 'categories', where: { nom: { equals: nom } }, limit: 1 })
  if (docs[0]) return docs[0].id
  return (await payload.create({ collection: 'categories', data: { nom } })).id
}

/** Les voitures enregistrées avant l'ajout du champ « offre » deviennent des voitures à louer. */
async function normaliserOffres(payload: Payload): Promise<void> {
  const { docs } = await payload.update({
    collection: 'voitures',
    where: { offre: { exists: false } },
    data: { offre: 'location' },
  })
  if (docs.length > 0) payload.logger.info(`Seed : ${docs.length} voiture(s) passée(s) en « à louer ».`)
}

/** Remplit la base avec des données TEMPORAIRES (voitures de démo, infos agence, pages légales). */
export async function seed(payload: Payload): Promise<void> {
  await normaliserOffres(payload)

  const idsCategories = new Map<string, string>()
  let creees = 0

  for (const voiture of VOITURES) {
    const titre = `${voiture.marque} ${voiture.modele}`
    const slug = slugify(titre)
    const { totalDocs } = await payload.count({ collection: 'voitures', where: { slug: { equals: slug } } })
    if (totalDocs > 0) continue

    if (!idsCategories.has(voiture.categorie)) {
      idsCategories.set(voiture.categorie, await trouverOuCreerCategorie(payload, voiture.categorie))
    }
    const image = await imageVoiture(voiture.silhouette, voiture.couleur)
    const photo = await payload.create({
      collection: 'media',
      data: { alt: `${titre} (photo temporaire)` },
      file: { data: image, mimetype: 'image/png', name: `${slug}.png`, size: image.length },
    })
    await payload.create({
      collection: 'voitures',
      data: {
        offre: voiture.offre,
        marque: voiture.marque,
        modele: voiture.modele,
        categorie: idsCategories.get(voiture.categorie) as string,
        photos: [photo.id],
        description: paragraphes(
          `Description temporaire de la ${titre} : à remplacer dans l’administration.`,
          voiture.offre === 'vente'
            ? 'Parlez ici de l’état du véhicule, de son entretien, des options et des garanties.'
            : 'Parlez ici des équipements (GPS, Bluetooth, régulateur…), du confort et des conditions de location.',
        ),
        caracteristiques: {
          boite: voiture.boite,
          carburant: voiture.carburant,
          places: voiture.places,
          portes: voiture.portes,
          climatisation: true,
        },
        tarifs: voiture.tarifs,
        vente: voiture.vente,
        disponible: voiture.disponible,
      },
    })
    creees += 1
  }

  payload.logger.info(
    creees > 0 ? `Seed : ${creees} voiture(s) temporaire(s) créée(s).` : 'Seed : voitures déjà présentes.',
  )

  const agence = await payload.findGlobal({ slug: 'agence' })
  if (!agence.emailDemandes) {
    await payload.updateGlobal({ slug: 'agence', data: AGENCE_TEMPORAIRE })
    payload.logger.info('Seed : infos agence temporaires enregistrées.')
  }

  const pages = await payload.findGlobal({ slug: 'pages-legales' })
  if (!pages.mentionsLegales || !pages.confidentialite) {
    await payload.updateGlobal({
      slug: 'pages-legales',
      data: {
        mentionsLegales: paragraphes(
          '[TEMPORAIRE — à compléter] Éditeur du site : raison sociale, forme juridique et capital, adresse du siège, numéro SIRET, numéro de TVA intracommunautaire, directeur de la publication, téléphone et email.',
          '[TEMPORAIRE — à compléter après le choix de l’hébergeur] Hébergeur : nom, adresse et téléphone.',
        ),
        confidentialite: paragraphes(
          '[TEMPORAIRE — à faire valider] Les informations du formulaire de contact (nom, prénom, adresse, email, téléphone, message) servent uniquement à répondre à votre demande. Elles ne sont ni vendues ni transmises à des tiers.',
          'Elles sont conservées au maximum 3 ans après notre dernier échange, puis supprimées.',
          'Vous pouvez demander l’accès, la rectification ou la suppression de vos données en nous écrivant. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).',
        ),
      },
    })
    payload.logger.info('Seed : pages légales temporaires enregistrées.')
  }
}
