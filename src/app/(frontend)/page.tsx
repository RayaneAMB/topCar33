import Link from 'next/link'

import { SectionApercu } from '@/components/voitures/SectionApercu'
import { getAgence, getVoitures } from '@/lib/donnees'

const APERCU = 3

export default async function Accueil() {
  const [agence, location, vente] = await Promise.all([
    getAgence(),
    getVoitures('location', undefined, APERCU),
    getVoitures('vente', undefined, APERCU),
  ])

  return (
    <>
      <section className="border-b border-bordure bg-linear-to-br from-primaire/15 via-fond to-fond">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h1 className="max-w-2xl text-4xl font-extrabold uppercase leading-tight tracking-wide sm:text-5xl">
            {agence.accroche || 'Louez la voiture qu’il vous faut.'}
          </h1>
          {agence.sousAccroche && <p className="mt-4 max-w-xl text-lg text-texte-doux">{agence.sousAccroche}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/location"
              className="rounded-lg bg-primaire px-6 py-3 font-semibold text-primaire-contraste hover:opacity-90"
            >
              Voir les voitures à louer
            </Link>
            <Link
              href="/vente"
              className="rounded-lg border border-primaire px-6 py-3 font-semibold text-primaire hover:bg-primaire hover:text-primaire-contraste"
            >
              Voir les voitures à vendre
            </Link>
          </div>
        </div>
      </section>

      <SectionApercu
        id="a-louer"
        titre="Nos voitures à louer"
        lien="/location"
        libelleLien="Voir toutes nos voitures à louer"
        voitures={location.voitures}
        vide="Aucune voiture à louer pour le moment."
      />

      <SectionApercu
        id="a-vendre"
        titre="Nos voitures à vendre"
        lien="/vente"
        libelleLien="Voir toutes nos voitures à vendre"
        voitures={vente.voitures}
        vide="Aucune voiture à vendre pour le moment."
      />
    </>
  )
}
