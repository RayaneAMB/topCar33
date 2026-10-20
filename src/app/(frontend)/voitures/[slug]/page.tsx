import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ApparitionAuDefilement } from '@/components/site/ApparitionAuDefilement'
import { RichTexte } from '@/components/RichTexte'
import { BadgeDispo } from '@/components/voitures/BadgeDispo'
import { BandeauChiffres } from '@/components/voitures/BandeauChiffres'
import { Caracteristiques } from '@/components/voitures/Caracteristiques'
import { GaleriePhotos } from '@/components/voitures/GaleriePhotos'
import { ListeFiche } from '@/components/voitures/ListeFiche'
import { VueInterieure } from '@/components/voitures/VueInterieure'
import { chiffresCles } from '@/lib/chiffresCles'
import { getVoiture } from '@/lib/donnees'
import {
  descriptionVoiture,
  estAVendre,
  nomCategorie,
  photosGalerie,
  premierePhoto,
  urlPhoto,
} from '@/lib/format'
import { photoDetouree } from '@/lib/images/detouree'
import { estUnPanorama, urlPanorama } from '@/lib/panorama'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const voiture = await getVoiture(slug)
  if (!voiture) return { title: 'Voiture introuvable' }
  const image = urlPhoto(premierePhoto(voiture.photos), 'grande')
  return {
    // L'onglet et les résultats de recherche disent ce qu'on peut faire de la
    // voiture : « Location » sur une voiture à vendre tromperait le visiteur.
    title: `${estAVendre(voiture) ? 'Achat' : 'Location'} ${voiture.titre}`,
    description: descriptionVoiture(voiture),
    openGraph: image ? { images: [image] } : undefined,
  }
}

export default async function PageVoiture({ params }: Params) {
  const { slug } = await params
  const voiture = await getVoiture(slug)
  if (!voiture) notFound()

  const titre = voiture.titre || voiture.modele
  // Une photo ordinaire versée par erreur serait étirée sur la sphère : on ne
  // montre la vue intérieure que si l'image a bien les proportions d'un 360°.
  const panorama =
    typeof voiture.vueInterieure === 'object' && estUnPanorama(voiture.vueInterieure)
      ? urlPanorama(voiture.vueInterieure)
      : null
  const categorie = nomCategorie(voiture.categorie)
  const aVendre = estAVendre(voiture)
  const { chiffres, conditions } = chiffresCles(voiture)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href={aVendre ? '/vente' : '/location'} className="text-sm text-texte-doux hover:text-texte">
        {aVendre ? '← Toutes nos voitures à vendre' : '← Toutes nos voitures à louer'}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <GaleriePhotos photos={photosGalerie(voiture.photos).map((photo) => ({
            ...photo,
            url: photoDetouree(photo.url) ?? photo.url,
            miniature: photoDetouree(photo.miniature) ?? photo.miniature,
          }))} titre={titre} />
          {panorama && (
            <section aria-labelledby="titre-interieur">
              <h2 id="titre-interieur" className="text-sm">
                Vue intérieure
              </h2>
              <div className="mt-3">
                <VueInterieure panorama={panorama} titre={titre} />
              </div>
            </section>
          )}
        </div>

        {/* Collée au défilement sur grand écran (voir .colonne-fiche) : prix et
            bouton restent sous la main pendant qu'on parcourt photos et vue
            intérieure, dans la colonne voisine. */}
        <ApparitionAuDefilement className="colonne-fiche">
          <div className="flex flex-wrap items-center gap-3">
            <BadgeDispo offre={voiture.offre} disponible={voiture.disponible !== false} />
            {categorie && (
              <span className="rounded-full border border-bordure px-2.5 py-1 text-xs font-semibold text-texte-doux">
                {categorie}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl">{titre}</h1>

          <div className="mt-6">
            {chiffres.length > 0 ? (
              <BandeauChiffres chiffres={chiffres} />
            ) : (
              <p className="border-y border-bordure py-4 font-titre text-2xl font-bold text-primaire">Prix sur demande</p>
            )}
          </div>

          <section aria-labelledby="titre-fiche" className="mt-8">
            <h2 id="titre-fiche" className="text-sm">
              Fiche technique
            </h2>
            <div className="mt-1">
              <Caracteristiques caracteristiques={voiture.caracteristiques} />
            </div>
          </section>

          {conditions.length > 0 && (
            <section aria-labelledby="titre-conditions" className="mt-8">
              <h2 id="titre-conditions" className="text-sm">
                Conditions de location
              </h2>
              <div className="mt-1">
                <ListeFiche lignes={conditions} uneColonne />
              </div>
            </section>
          )}

          <Link
            href={`/contact?voiture=${voiture.slug}`}
            className="bouton-action mt-8 block w-full rounded-carte bg-primaire px-6 py-3.5 text-center font-semibold text-primaire-contraste transition hover:bg-petrole hover:text-texte"
          >
            Contacter pour ce véhicule
          </Link>
        </ApparitionAuDefilement>
      </div>

      {voiture.description && (
        <ApparitionAuDefilement>
          <section aria-labelledby="titre-description" className="mt-14 max-w-3xl">
            <h2 id="titre-description" className="text-xl">
              Description
            </h2>
            <RichTexte data={voiture.description} className="mt-4 text-texte-doux" />
          </section>
        </ApparitionAuDefilement>
      )}
    </div>
  )
}
