import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RichTexte } from '@/components/RichTexte'
import { BadgeDispo } from '@/components/voitures/BadgeDispo'
import { Caracteristiques } from '@/components/voitures/Caracteristiques'
import { GaleriePhotos } from '@/components/voitures/GaleriePhotos'
import { TableauTarifs } from '@/components/voitures/TableauTarifs'
import { getVoiture } from '@/lib/donnees'
import {
  descriptionVoiture,
  formaterPrix,
  nomCategorie,
  photosGalerie,
  premierePhoto,
  urlPhoto,
} from '@/lib/format'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const voiture = await getVoiture(slug)
  if (!voiture) return { title: 'Voiture introuvable' }
  const image = urlPhoto(premierePhoto(voiture.photos), 'grande')
  return {
    title: `Location ${voiture.titre}`,
    description: descriptionVoiture(voiture),
    openGraph: image ? { images: [image] } : undefined,
  }
}

export default async function PageVoiture({ params }: Params) {
  const { slug } = await params
  const voiture = await getVoiture(slug)
  if (!voiture) notFound()

  const titre = voiture.titre || `${voiture.marque} ${voiture.modele}`
  const categorie = nomCategorie(voiture.categorie)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/#voitures" className="text-sm text-texte-doux hover:text-texte">
        ← Toutes nos voitures
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <GaleriePhotos photos={photosGalerie(voiture.photos)} titre={titre} />

        <div>
          {categorie && <p className="text-xs font-bold uppercase tracking-widest text-primaire">{categorie}</p>}
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{titre}</h1>
          <BadgeDispo disponible={voiture.disponible !== false} className="mt-3 inline-block" />
          <p className="mt-6 text-3xl font-extrabold">
            {formaterPrix(voiture.tarifs.prixJour)} <span className="text-base font-medium text-texte-doux">/ jour</span>
          </p>

          <div className="mt-8">
            <Caracteristiques caracteristiques={voiture.caracteristiques} />
          </div>

          <div className="mt-8">
            <TableauTarifs tarifs={voiture.tarifs} />
          </div>

          <Link
            href={`/contact?voiture=${voiture.slug}`}
            className="mt-8 inline-block rounded-lg bg-primaire px-6 py-3 font-semibold text-primaire-contraste hover:opacity-90"
          >
            Contacter pour ce véhicule
          </Link>
        </div>
      </div>

      {voiture.description && (
        <section aria-labelledby="titre-description" className="mt-12 max-w-3xl">
          <h2 id="titre-description" className="text-2xl font-extrabold">
            Description
          </h2>
          <RichTexte data={voiture.description} className="mt-4 text-texte-doux" />
        </section>
      )}
    </div>
  )
}
