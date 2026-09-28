import Link from 'next/link'

import type { Voiture } from '@/payload-types'

import { ListeVoitures } from './ListeVoitures'

/** Aperçu d'une offre sur l'accueil : quelques voitures et un lien vers la page complète. */
export function SectionApercu({
  id,
  titre,
  lien,
  libelleLien,
  voitures,
  vide,
}: {
  id: string
  titre: string
  lien: string
  libelleLien: string
  voitures: Voiture[]
  vide: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="mx-auto max-w-6xl scroll-mt-8 px-4 py-12">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-bordure pb-4">
        <h2 id={`${id}-titre`} className="text-2xl">
          {titre}
        </h2>
        <Link href={lien} className="text-sm font-semibold text-primaire underline-offset-4 transition hover:underline">
          {libelleLien}
        </Link>
      </div>
      <ListeVoitures voitures={voitures} vide={vide} />
    </section>
  )
}
