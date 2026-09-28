import type { Voiture } from '@/payload-types'

import { CarteVoiture } from './CarteVoiture'

export function ListeVoitures({ voitures, vide }: { voitures: Voiture[]; vide: string }) {
  if (voitures.length === 0) return <p className="text-texte-doux">{vide}</p>

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {voitures.map((voiture) => (
        <li key={voiture.id}>
          <CarteVoiture voiture={voiture} />
        </li>
      ))}
    </ul>
  )
}
