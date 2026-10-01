import type { Metadata } from 'next'

import { PageLegale } from '@/components/site/PageLegale'
import { getPagesLegales } from '@/lib/donnees'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Les données que nous recueillons, pourquoi, combien de temps, et comment exercer vos droits.',
  robots: { index: false, follow: true },
}

export default async function PageConfidentialite() {
  const { confidentialite } = await getPagesLegales()

  return (
    <PageLegale
      titre="Politique de confidentialité"
      contenu={confidentialite}
      vide="La politique de confidentialité sera publiée prochainement."
    />
  )
}
