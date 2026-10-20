'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { adresseFiltre, FILTRES_RAPIDES, filtreActif } from '@/lib/admin/filtresRapides'

/** Rangée de raccourcis au-dessus de la liste des voitures : un clic, un filtre. */
export function FiltresRapides() {
  const params = useSearchParams()
  const actif = filtreActif(new URLSearchParams(params.toString()))

  return (
    <nav aria-label="Filtres rapides" className="tc-filtres-rapides">
      {FILTRES_RAPIDES.map((filtre) => (
        <Link
          key={filtre.cle}
          href={adresseFiltre(filtre, new URLSearchParams(params.toString()))}
          aria-current={filtre.cle === actif ? 'true' : undefined}
          className="tc-filtre-rapide"
        >
          {filtre.libelle}
        </Link>
      ))}
    </nav>
  )
}
