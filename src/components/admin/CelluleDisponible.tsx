'use client'

import type { DefaultCellComponentProps } from 'payload'

/** Colonne « Disponible » de la liste des voitures : une pastille verte ou rouge, avec le bon mot. */
export function CelluleDisponible({ cellData, rowData }: DefaultCellComponentProps) {
  const disponible = cellData !== false
  const aVendre = (rowData as { offre?: string } | undefined)?.offre === 'vente'
  const libelle = disponible ? 'Disponible' : aVendre ? 'Vendue' : 'Déjà louée'

  return <span className={`tc-etat ${disponible ? 'tc-etat--oui' : 'tc-etat--non'}`}>{libelle}</span>
}
