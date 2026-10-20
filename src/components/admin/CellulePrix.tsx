'use client'

import type { DefaultCellComponentProps } from 'payload'

import { prixPrincipal } from '@/lib/format'
import type { Voiture } from '@/payload-types'

/** Colonne « Prix » : le prix de vente, ou le prix par jour d'une location. */
export function CellulePrix({ rowData }: DefaultCellComponentProps) {
  const voiture = rowData as Pick<Voiture, 'offre' | 'tarifs' | 'vente'>
  const { valeur, suffixe } = prixPrincipal(voiture)
  if (!suffixe && valeur === 'Prix sur demande') return <span className="tc-vide">—</span>

  return (
    <span className="tc-prix">
      {valeur}
      {suffixe && <span className="tc-prix__suffixe"> {suffixe}</span>}
    </span>
  )
}
