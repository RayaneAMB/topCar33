import type { Voiture } from '@/payload-types'

import { nomCategorie, premierePhoto, prixPrincipal, urlPhoto } from './format'
import { photoDetouree } from './images/detouree'

/**
 * Une voiture réduite à ce que la bannière d'accueil affiche.
 * Le composant qui l'anime tourne dans le navigateur : on lui passe des données
 * plates plutôt que la fiche entière, qui traverserait le réseau pour rien.
 */
export type Vedette = {
  slug: string
  titre: string
  photo: string
  alt: string
  prix: string
  suffixe: string | null
  categorie: string | null
  /** Vrai quand le fond blanc de la photo a été retiré : plus besoin de le masquer. */
  detouree: boolean
}

/** Les voitures montrables en bannière : une photo et une fiche où aller. */
export function vedettes(voitures: Voiture[], maximum = 5): Vedette[] {
  const retenues: Vedette[] = []

  for (const voiture of voitures) {
    if (retenues.length >= maximum) break

    const photo = premierePhoto(voiture.photos)
    const url = urlPhoto(photo, 'carte')
    if (!url || !voiture.slug) continue

    const titre = voiture.titre || voiture.modele
    const { valeur, suffixe } = prixPrincipal(voiture)

    const detouree = photoDetouree(url)

    retenues.push({
      slug: voiture.slug,
      titre,
      photo: detouree ?? url,
      detouree: detouree !== null,
      alt: photo?.alt || titre,
      prix: valeur,
      suffixe,
      categorie: nomCategorie(voiture.categorie),
    })
  }

  return retenues
}

