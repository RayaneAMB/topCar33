import Image from 'next/image'
import Link from 'next/link'

import type { Voiture } from '@/payload-types'
import { nomCategorie, premierePhoto, prixPrincipal, urlPhoto } from '@/lib/format'

import { BadgeDispo } from './BadgeDispo'
import { PointsVoiture } from './PointsVoiture'

export function CarteVoiture({ voiture }: { voiture: Voiture }) {
  const photo = premierePhoto(voiture.photos)
  const src = urlPhoto(photo, 'carte')
  const categorie = nomCategorie(voiture.categorie)
  const titre = voiture.titre || voiture.modele
  const prix = prixPrincipal(voiture)

  return (
    <article
      data-testid="carte-voiture"
      className="relative flex h-full flex-col overflow-hidden rounded-carte border border-bordure bg-surface transition hover:border-primaire"
    >
      <div className="relative aspect-[16/10] bg-fond-alt">
        {src && (
          <Image
            src={src}
            alt={photo?.alt || titre}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <BadgeDispo offre={voiture.offre} disponible={voiture.disponible !== false} />
          {categorie && (
            <span className="rounded-full bg-fond/85 px-2.5 py-1 text-xs font-semibold text-texte backdrop-blur">
              {categorie}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base">
          {/* Lien « étiré » : toute la carte est cliquable. */}
          <Link href={`/voitures/${voiture.slug}`} className="after:absolute after:inset-0">
            {titre}
          </Link>
        </h3>
        <PointsVoiture voiture={voiture} />

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="font-titre text-xl font-bold tracking-wide">
            {prix.valeur}
            {prix.suffixe && <span className="font-texte text-sm font-medium text-texte-doux"> {prix.suffixe}</span>}
          </p>
          <Link
            href={`/contact?voiture=${voiture.slug}`}
            className="relative z-10 rounded-carte border border-petrole px-3 py-1.5 text-sm font-semibold text-primaire transition hover:bg-primaire hover:text-primaire-contraste"
          >
            Contacter
          </Link>
        </div>
      </div>
    </article>
  )
}
