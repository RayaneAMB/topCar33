import type { Voiture } from '@/payload-types'
import { BOITES, CARBURANTS, libelleOption } from '@/lib/voitureOptions'

import { IconeBoite, IconeCarburant, IconeClim, IconePlaces, IconePortes } from './Icones'

export function Caracteristiques({ caracteristiques }: { caracteristiques: Voiture['caracteristiques'] }) {
  const elements = [
    { Icone: IconeBoite, libelle: 'Boîte', valeur: libelleOption(BOITES, caracteristiques.boite) },
    { Icone: IconeCarburant, libelle: 'Carburant', valeur: libelleOption(CARBURANTS, caracteristiques.carburant) },
    { Icone: IconePlaces, libelle: 'Places', valeur: String(caracteristiques.places) },
    ...(caracteristiques.portes
      ? [{ Icone: IconePortes, libelle: 'Portes', valeur: String(caracteristiques.portes) }]
      : []),
    { Icone: IconeClim, libelle: 'Climatisation', valeur: caracteristiques.climatisation ? 'Oui' : 'Non' },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {elements.map(({ Icone, libelle, valeur }) => (
        <div key={libelle} className="flex items-center gap-3 rounded-lg border border-bordure bg-surface p-3">
          <Icone className="h-6 w-6 shrink-0 text-primaire" />
          <div>
            <dt className="text-xs text-texte-doux">{libelle}</dt>
            <dd className="font-semibold">{valeur}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
