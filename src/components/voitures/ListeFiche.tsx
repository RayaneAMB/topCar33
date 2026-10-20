import type { ComponentType } from 'react'

export type LigneFiche = {
  libelle: string
  valeur: string
  Icone?: ComponentType<{ className?: string }>
}

/**
 * Une fiche technique : le libellé à gauche, la valeur à droite, un filet
 * dessous — sur deux colonnes dès que la place le permet.
 *
 * Elle remplace des cartes encadrées qui donnaient aux portes et à la
 * climatisation autant de poids qu'au kilométrage, et laissaient une case vide
 * en bout de grille. Une liste ne laisse pas de trou : elle s'arrête, c'est tout.
 */
export function ListeFiche({
  lignes,
  uneColonne = false,
}: {
  lignes: LigneFiche[]
  /**
   * Pour les valeurs en texte libre (« 200 km/jour », « Illimité ») : sur deux
   * colonnes, libellé et valeur passaient chacun sur deux lignes.
   */
  uneColonne?: boolean
}) {
  if (lignes.length === 0) return null

  return (
    <dl className={`grid gap-x-8 ${uneColonne ? '' : 'sm:grid-cols-2'}`}>
      {lignes.map(({ Icone, libelle, valeur }) => (
        <div key={libelle} className="flex items-center justify-between gap-4 border-b border-bordure py-2.5">
          <dt className="flex items-center gap-2 text-sm text-texte-doux">
            {Icone && <Icone className="h-4 w-4 shrink-0 text-primaire" />}
            {libelle}
          </dt>
          <dd className="text-right text-sm font-semibold">{valeur}</dd>
        </div>
      ))}
    </dl>
  )
}
