import Link from 'next/link'

import type { Categorie } from '@/payload-types'

const classeFiltre = (actif: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
    actif
      ? 'border-primaire bg-primaire text-primaire-contraste'
      : 'border-bordure text-texte-doux hover:text-texte'
  }`

export function FiltresCategories({ categories, active }: { categories: Categorie[]; active: string | null }) {
  return (
    <nav aria-label="Filtrer par catégorie" className="mb-8 flex flex-wrap gap-2">
      <Link href="/#voitures" className={classeFiltre(active === null)} aria-current={active === null ? 'page' : undefined}>
        Toutes
      </Link>
      {categories.map((categorie) => (
        <Link
          key={categorie.id}
          href={`/?categorie=${encodeURIComponent(categorie.slug ?? '')}#voitures`}
          className={classeFiltre(active === categorie.slug)}
          aria-current={active === categorie.slug ? 'page' : undefined}
        >
          {categorie.nom}
        </Link>
      ))}
    </nav>
  )
}
