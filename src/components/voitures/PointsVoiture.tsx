import type { Voiture } from '@/payload-types'
import { estAVendre, formaterKilometrage } from '@/lib/format'
import { BOITES, CARBURANTS, libelleOption } from '@/lib/voitureOptions'

import { IconeAnnee, IconeBoite, IconeCarburant, IconeCompteur, IconePlaces } from './Icones'

/**
 * Les trois informations qui comptent sur une carte :
 * boîte, carburant et places en location ; année, kilométrage et carburant en vente.
 */
export function PointsVoiture({ voiture }: { voiture: Voiture }) {
  const carburant = libelleOption(CARBURANTS, voiture.caracteristiques.carburant)

  const points = estAVendre(voiture)
    ? [
        voiture.vente?.annee != null && { Icone: IconeAnnee, valeur: String(voiture.vente.annee) },
        voiture.vente?.kilometrage != null && {
          Icone: IconeCompteur,
          valeur: formaterKilometrage(voiture.vente.kilometrage),
        },
        { Icone: IconeCarburant, valeur: carburant },
      ]
    : [
        { Icone: IconeBoite, valeur: libelleOption(BOITES, voiture.caracteristiques.boite) },
        { Icone: IconeCarburant, valeur: carburant },
        { Icone: IconePlaces, valeur: `${voiture.caracteristiques.places} places` },
      ]

  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-texte-doux">
      {points.filter((point) => point !== false).map(({ Icone, valeur }) => (
        <li key={valeur} className="flex items-center gap-1.5">
          <Icone className="h-4 w-4 shrink-0 text-petrole" />
          {valeur}
        </li>
      ))}
    </ul>
  )
}
