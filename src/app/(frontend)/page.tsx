import Link from 'next/link'

import { RelaisVoitures } from '@/components/site/RelaisVoitures'
import { SectionApercu } from '@/components/voitures/SectionApercu'
import { getAgence, getVoitures } from '@/lib/donnees'
import { vedettes } from '@/lib/vedette'

const APERCU = 3
const VEDETTES = 5

export default async function Accueil() {
  const [agence, location, vente] = await Promise.all([
    getAgence(),
    getVoitures('location', undefined, APERCU),
    getVoitures('vente', undefined, APERCU),
  ])

  return (
    <>
      <section className="bandeau voile-decor border-b border-bordure bg-fond-alt/75">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-24">
          <div>
            <span className="barre-diagonale" aria-hidden="true" />
            <h1 className="mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl">
              {agence.accroche || 'Louez la voiture qu’il vous faut.'}
            </h1>
            {agence.sousAccroche && <p className="mt-5 max-w-lg text-lg text-texte-doux">{agence.sousAccroche}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/location"
                className="rounded-carte bg-primaire px-6 py-3 font-semibold text-primaire-contraste transition hover:bg-petrole hover:text-texte"
              >
                Voir les voitures à louer
              </Link>
              <Link
                href="/vente"
                className="rounded-carte border border-petrole px-6 py-3 font-semibold text-primaire transition hover:bg-primaire hover:text-primaire-contraste"
              >
                Voir les voitures à vendre
              </Link>
            </div>
          </div>

          <RelaisVoitures vedettes={vedettes([...location.voitures, ...vente.voitures], VEDETTES)} />
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
