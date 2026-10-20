import type { Voiture } from '@/payload-types'
import { BOITES, CARBURANTS, libelleOption } from '@/lib/voitureOptions'

import { IconeBoite, IconeCarburant, IconeClim, IconePlaces, IconePortes } from './Icones'
import { ListeFiche, type LigneFiche } from './ListeFiche'

/** La fiche technique d'une voiture : boîte, carburant, places, portes, climatisation. */
export function Caracteristiques({ caracteristiques }: { caracteristiques: Voiture['caracteristiques'] }) {
  const lignes: LigneFiche[] = [
    { Icone: IconeBoite, libelle: 'Boîte', valeur: libelleOption(BOITES, caracteristiques.boite) },
    { Icone: IconeCarburant, libelle: 'Carburant', valeur: libelleOption(CARBURANTS, caracteristiques.carburant) },
    { Icone: IconePlaces, libelle: 'Places', valeur: String(caracteristiques.places) },
    ...(caracteristiques.portes
      ? [{ Icone: IconePortes, libelle: 'Portes', valeur: String(caracteristiques.portes) }]
      : []),
    { Icone: IconeClim, libelle: 'Climatisation', valeur: caracteristiques.climatisation ? 'Oui' : 'Non' },
  ]

  return <ListeFiche lignes={lignes} />
}
