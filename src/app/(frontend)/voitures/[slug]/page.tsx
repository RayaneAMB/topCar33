import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RichTexte } from '@/components/RichTexte'
import { BadgeDispo } from '@/components/voitures/BadgeDispo'
import { Caracteristiques } from '@/components/voitures/Caracteristiques'
import { GaleriePhotos } from '@/components/voitures/GaleriePhotos'
import { TableauInfos } from '@/components/voitures/TableauInfos'
import { getVoiture } from '@/lib/donnees'
import {
  descriptionVoiture,
  estAVendre,
  lignesTarifs,
  lignesVente,
  nomCategorie,
  photosGalerie,
  premierePhoto,
  prixPrincipal,
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

  const titre = voiture.titre || voiture.modele
  const categorie = nomCategorie(voiture.categorie)
  const aVendre = estAVendre(voiture)
  const prix = prixPrincipal(voiture)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href={aVendre ? '/vente' : '/location'} className="text-sm text-texte-doux hover:text-texte">
        {aVendre ? '← Toutes nos voitures à vendre' : '← Toutes nos voitures à louer'}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <GaleriePhotos photos={photosGalerie(voiture.photos)} titre={titre} />

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <BadgeDispo offre={voiture.offre} disponible={voiture.disponible !== false} />
            {categorie && (
              <span className="rounded-full border border-bordure px-2.5 py-1 text-xs font-semibold text-texte-doux">
                {categorie}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl">{titre}</h1>
          <p className="mt-6 font-titre text-3xl font-bold tracking-wide text-primaire">
            {prix.valeur}
            {prix.suffixe && <span className="font-texte text-base font-medium text-texte-doux"> {prix.suffixe}</span>}
          </p>

          <div className="mt-8">
            <Caracteristiques caracteristiques={voiture.caracteristiques} />
          </div>

          <div className="mt-8">
            {aVendre ? (
              <TableauInfos titre="Le véhicule" lignes={lignesVente(voiture.vente)} />
            ) : (
              <TableauInfos titre="Tarifs" lignes={lignesTarifs(voiture.tarifs)} />
            )}
          </div>

          <Link
            href={`/contact?voiture=${voiture.slug}`}
            className="mt-8 inline-block rounded-carte bg-primaire px-6 py-3 font-semibold text-primaire-contraste transition hover:bg-petrole hover:text-texte"
          >
            Contacter pour ce véhicule
          </Link>
        </div>
      </div>

      {voiture.description && (
        <section aria-labelledby="titre-description" className="mt-14 max-w-3xl">
          <h2 id="titre-description" className="text-xl">
            Description
          </h2>
          <RichTexte data={voiture.description} className="mt-4 text-texte-doux" />
        </section>
      )}
    </div>
  )
}
