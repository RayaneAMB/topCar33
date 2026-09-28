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
      <section className="bandeau border-b border-bordure bg-fond-alt">
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
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
