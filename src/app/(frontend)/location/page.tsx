import type { Metadata } from 'next'

import { FiltresCategories } from '@/components/voitures/FiltresCategories'
import { ListeVoitures } from '@/components/voitures/ListeVoitures'
import { getCategories, getVoitures } from '@/lib/donnees'

export const metadata: Metadata = {
  title: 'À louer',
  description: 'Toutes nos voitures à louer : citadines, SUV et utilitaires, avec leurs tarifs.',
}

export default async function PageLocation({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string | string[] }>
}) {
  const { categorie } = await searchParams
  const categorieSlug = typeof categorie === 'string' ? categorie : undefined
  const [categories, { voitures, categorieActive }] = await Promise.all([
    getCategories(),
    getVoitures('location', categorieSlug),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <span className="barre-diagonale" aria-hidden="true" />
      <h1 className="mt-5 text-3xl sm:text-4xl">Nos voitures à louer</h1>
      <p className="mt-3 mb-9 max-w-xl text-texte-doux">
        Des véhicules récents et entretenus, du citadin à l’utilitaire.
      </p>
      <FiltresCategories base="/location" categories={categories} active={categorieActive?.slug ?? null} />
      <ListeVoitures voitures={voitures} vide="Aucune voiture à louer pour le moment." />
    </div>
  )
}
