import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { CollectionConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'
import { detourerFichier, fichiersAffiches, nomDetoure } from '../lib/images/detourerFichier'
import { texteDepuisNomFichier } from '../lib/images/texteAlternatif'

/** Le fichier d'origine et toutes ses vignettes. */
function nomsDesFichiers(doc: { filename?: string | null; sizes?: object | null }): string[] {
  return [
    doc.filename,
    ...Object.values(doc.sizes ?? {}).map((taille) => (taille as { filename?: string })?.filename),
  ].filter((nom): nom is string => typeof nom === 'string')
}

/**
 * Payload efface ses propres fichiers, pas les nôtres : sans ceci, une photo
 * supprimée — ou dont on a éteint le détourage — laisserait ses fichiers
 * détourés derrière elle, et le site continuerait de les afficher.
 */
async function effacerDetourages(
  dossier: string,
  noms: string[],
  logger: { warn: (message: string) => void },
) {
  for (const nom of noms) {
    try {
      await rm(join(dossier, nomDetoure(nom)), { force: true })
    } catch (erreur) {
      logger.warn(`Détourage non supprimé pour ${nom} : ${(erreur as Error).message}`)
    }
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: {
    group: 'Catalogue',
    /**
     * Les vues du décor de fond se règlent dans Réglages → Apparence : elles
     * n'ont rien à faire dans la médiathèque du catalogue, où leurs 36 images
     * noyaient les photos des voitures.
     *
     * Le tri se fait par usage, pas par nom de fichier : si le décor change
     * de voiture demain, les nouvelles vues seront masquées de la même façon,
     * et les anciennes, une fois retirées d'Apparence, réapparaîtront ici pour
     * pouvoir être supprimées.
     */
    baseFilter: async ({ req }) => {
      const apparence = await req.payload.findGlobal({ slug: 'apparence', depth: 0, req })
      const decor = (apparence.decor360 ?? []).map((vue) => (typeof vue === 'object' ? vue.id : vue))
      return decor.length ? { id: { not_in: decor } } : null
    },
  },
  access: {
    read: tousLesVisiteurs,
    create: connecte,
    update: connecte,
    delete: connecte,
  },
  hooks: {
    /** Sans texte alternatif écrit, on reprend le nom du fichier. */
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!data.alt?.trim()) {
          data.alt = texteDepuisNomFichier(data.filename ?? req.file?.name ?? originalDoc?.filename)
        }
        return data
      },
    ],

    /**
     * Détoure la photo dès qu'elle est versée, si l'agence l'a demandé (case
     * « Retirer le fond ») : le site l'affiche alors sans fond.
     *
     * Case décochée — à l'envoi ou plus tard — : les détourages existants sont
     * effacés, et le site montre la photo telle qu'elle a été prise.
     *
     * Après coup, et non avant : les vignettes que l'on détoure sont produites
     * par Payload pendant l'enregistrement, elles n'existent pas plus tôt.
     *
     * Un échec n'interrompt jamais le versement — on perdrait la photo pour un
     * détail d'affichage. Le site retombe alors sur l'original, et
     * `scripts/detourer.mjs` rattrapera le coup.
     */
    afterChange: [
      async ({ doc, req }) => {
        const dossier = process.env.MEDIA_DIR || 'media'
        const noms = nomsDesFichiers(doc)

        // Les photos versées avant l'option n'ont pas la case : elles restent détourées.
        if (doc.retirerFond === false) {
          await effacerDetourages(dossier, noms, req.payload.logger)
          return doc
        }

        for (const nom of fichiersAffiches(noms)) {
          try {
            const produit = await detourerFichier(dossier, nom)
            if (produit) req.payload.logger.info(`Détourage : ${nom} → ${produit}`)
          } catch (erreur) {
            req.payload.logger.warn(`Détourage impossible pour ${nom} : ${(erreur as Error).message}`)
          }
        }

        return doc
      },
    ],

    /**
     * Payload efface ses propres fichiers, pas les nôtres : sans ceci, chaque
     * photo supprimée laisserait ses détourages derrière elle, et le dossier
     * media se remplirait de fichiers que plus rien ne sert.
     */
    afterDelete: [
      async ({ doc, req }) => {
        await effacerDetourages(process.env.MEDIA_DIR || 'media', nomsDesFichiers(doc), req.payload.logger)
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'retirerFond',
      label: 'Retirer le fond de la photo',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        className: 'tc-interrupteur',
        description:
          'Allumé : le fond blanc ou clair est retiré, la voiture s’affiche seule sur le site. Éteint : la photo s’affiche telle quelle (à choisir pour une photo prise dehors, un intérieur ou une voiture blanche).',
      },
    },
    {
      name: 'alt',
      label: 'Description de la photo (facultatif)',
      type: 'text',
      admin: {
        description: 'Laissez vide : le nom du fichier sera repris automatiquement.',
      },
    },
  ],
  upload: {
    // MEDIA_DIR sert aux tests (dossier temporaire). En dev : dossier « media » à la racine du projet.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'miniature',
    imageSizes: [
      { name: 'miniature', width: 400 },
      { name: 'carte', width: 800 },
      { name: 'grande', width: 1600 },
      // Un tour à 360° charge 24 à 36 images d'affilée : elles doivent rester
      // légères, sinon la rotation saccade sur mobile.
      { name: 'tour', width: 600 },
      // Vue intérieure : une caméra 360 sort du 6000 à 8000 px de large, mais
      // bien des téléphones refusent une texture de plus de 4096 px et
      // n'affichent alors rien. Payload n'agrandit jamais une photo : les
      // photos ordinaires, toutes plus étroites, n'en reçoivent pas.
      { name: 'panorama', width: 4096 },
    ],
  },
}
