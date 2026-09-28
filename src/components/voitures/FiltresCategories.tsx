import Link from 'next/link'

import type { Categorie } from '@/payload-types'

const classeFiltre = (actif: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
    actif
      ? 'border-primaire bg-primaire text-primaire-contraste'
      : 'border-bordure text-texte-doux hover:border-petrole hover:text-texte'
  }`

/** `base` est la page qui porte les filtres : /location ou /vente. */
export function FiltresCategories({
  base,
  categories,
  active,
}: {
  base: string
  categories: Categorie[]
  active: string | null
}) {
  return (
    <nav aria-label="Filtrer par catégorie" className="mb-8 flex flex-wrap gap-2">
      <Link href={base} className={classeFiltre(active === null)} aria-current={active === null ? 'page' : undefined}>
        Toutes
      </Link>
      {categories.map((categorie) => (
        <Link
          key={categorie.id}
          href={`${base}?categorie=${encodeURIComponent(categorie.slug ?? '')}`}
          className={classeFiltre(active === categorie.slug)}
          aria-current={active === categorie.slug ? 'page' : undefined}
        >
          {categorie.nom}
        </Link>
      ))}
    </nav>
  )
}
