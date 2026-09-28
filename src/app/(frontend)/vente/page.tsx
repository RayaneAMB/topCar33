import type { Metadata } from 'next'

import { FiltresCategories } from '@/components/voitures/FiltresCategories'
import { ListeVoitures } from '@/components/voitures/ListeVoitures'
import { getCategories, getVoitures } from '@/lib/donnees'

export const metadata: Metadata = {
  title: 'À vendre',
  description: 'Nos voitures d’occasion à vendre : prix, année et kilométrage.',
}

export default async function PageVente({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string | string[] }>
}) {
  const { categorie } = await searchParams
  const categorieSlug = typeof categorie === 'string' ? categorie : undefined
  const [categories, { voitures, categorieActive }] = await Promise.all([
    getCategories(),
    getVoitures('vente', categorieSlug),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <span className="barre-diagonale" aria-hidden="true" />
      <h1 className="mt-5 text-3xl sm:text-4xl">Nos voitures à vendre</h1>
      <p className="mt-3 mb-9 max-w-xl text-texte-doux">
        Véhicules d’occasion révisés, avec leur année et leur kilométrage.
      </p>
      <FiltresCategories base="/vente" categories={categories} active={categorieActive?.slug ?? null} />
      <ListeVoitures voitures={voitures} vide="Aucune voiture à vendre pour le moment." />
    </div>
  )
}
