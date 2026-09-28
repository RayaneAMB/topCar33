import { CarteVoiture } from '@/components/voitures/CarteVoiture'
import { FiltresCategories } from '@/components/voitures/FiltresCategories'
import { getAgence, getCategories, getVoitures } from '@/lib/donnees'

export default async function Accueil({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string | string[] }>
}) {
  const { categorie } = await searchParams
  const categorieSlug = typeof categorie === 'string' ? categorie : undefined
  const [agence, categories, { voitures, categorieActive }] = await Promise.all([
    getAgence(),
    getCategories(),
    getVoitures(categorieSlug),
  ])

  return (
    <>
      <section className="border-b border-bordure bg-linear-to-br from-primaire/15 via-fond to-fond">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h1 className="max-w-2xl text-4xl font-extrabold uppercase leading-tight tracking-wide sm:text-5xl">
            {agence.accroche || 'Louez la voiture qu’il vous faut.'}
          </h1>
          {agence.sousAccroche && <p className="mt-4 max-w-xl text-lg text-texte-doux">{agence.sousAccroche}</p>}
          <a
            href="#voitures"
            className="mt-8 inline-block rounded-lg bg-primaire px-6 py-3 font-semibold text-primaire-contraste hover:opacity-90"
          >
            Voir nos voitures
          </a>
        </div>
      </section>

      <section id="voitures" aria-labelledby="titre-voitures" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-12">
        <h2 id="titre-voitures" className="mb-6 text-2xl font-extrabold">
          Nos voitures
        </h2>
        <FiltresCategories categories={categories} active={categorieActive?.slug ?? null} />
        {voitures.length === 0 ? (
          <p className="text-texte-doux">Aucune voiture à afficher pour le moment.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {voitures.map((voiture) => (
              <li key={voiture.id}>
                <CarteVoiture voiture={voiture} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
