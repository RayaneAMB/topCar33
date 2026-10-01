import type { Metadata } from 'next'

import { FormulaireConnexion } from '@/components/connexion/FormulaireConnexion'
import { destinationSure } from '@/lib/auth/etatConnexion'

import { envoyerCode, envoyerIdentifiants } from './actions'

export const metadata: Metadata = {
  title: 'Connexion',
  // Une page de connexion n'a rien à faire dans les résultats de recherche.
  robots: { index: false, follow: false },
}

export default async function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Payload renvoie ici avec ?redirect=/admin/… quand on demandait une page précise.
  const destination = destinationSure((await searchParams).redirect)

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="barre-diagonale mb-6" aria-hidden="true" />
      <h1 className="text-2xl">Connexion</h1>
      <p className="mt-2 text-sm text-texte-doux">Accès réservé à l’administration du site.</p>

      <div className="mt-8 rounded-carte border border-bordure bg-fond p-6">
        <FormulaireConnexion
          actionIdentifiants={envoyerIdentifiants}
          actionCode={envoyerCode}
          destination={destination}
        />
      </div>
    </div>
  )
}
