import type { Metadata } from 'next'

import { PageLegale } from '@/components/site/PageLegale'
import { getPagesLegales } from '@/lib/donnees'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Éditeur du site, hébergeur, propriété intellectuelle et droit applicable.',
  // Une page obligatoire, sans intérêt dans les résultats de recherche.
  robots: { index: false, follow: true },
}

export default async function PageMentionsLegales() {
  const { mentionsLegales } = await getPagesLegales()

  return (
    <PageLegale
      titre="Mentions légales"
      contenu={mentionsLegales}
      vide="Les mentions légales seront publiées prochainement."
    />
  )
}
