import type { Metadata } from 'next'

import { FormulaireContact } from '@/components/contact/FormulaireContact'
import { NousTrouver } from '@/components/contact/NousTrouver'
import { getAgence, getVoitures } from '@/lib/donnees'
import { estAVendre } from '@/lib/format'

import { envoyerDemande } from './actions'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question, une demande de location ? Écrivez-nous, nous vous recontactons rapidement.',
}

export default async function PageContact({
  searchParams,
}: {
  searchParams: Promise<{ voiture?: string | string[] }>
}) {
  const { voiture } = await searchParams
  const [agence, { voitures }] = await Promise.all([getAgence(), getVoitures()])

  const options = voitures
    .filter((item) => item.slug)
    .map((item) => ({
      slug: item.slug as string,
      titre: item.titre || item.modele,
      offre: estAVendre(item) ? ('vente' as const) : ('location' as const),
    }))
    .sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
  const voitureInitiale =
    typeof voiture === 'string' && options.some((option) => option.slug === voiture) ? voiture : ''

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[2fr_1fr]">
      <section aria-labelledby="titre-contact">
        <span className="barre-diagonale" aria-hidden="true" />
        <h1 id="titre-contact" className="mt-5 text-3xl">
          Nous contacter
        </h1>
        <p className="mt-3 mb-9 max-w-xl text-texte-doux">
          Une question sur une voiture ou une demande de location ? Écrivez-nous, nous vous répondons rapidement.
        </p>
        <FormulaireContact action={envoyerDemande} voitures={options} voitureInitiale={voitureInitiale} />
      </section>
      <NousTrouver agence={agence} />
    </div>
  )
}
