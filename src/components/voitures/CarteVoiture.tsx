import Image from 'next/image'
import Link from 'next/link'

import type { Voiture } from '@/payload-types'
import { nomCategorie, premierePhoto, prixPrincipal, resumeCarte, urlPhoto } from '@/lib/format'

import { BadgeDispo } from './BadgeDispo'

export function CarteVoiture({ voiture }: { voiture: Voiture }) {
  const photo = premierePhoto(voiture.photos)
  const src = urlPhoto(photo, 'carte')
  const categorie = nomCategorie(voiture.categorie)
  const titre = voiture.titre || `${voiture.marque} ${voiture.modele}`
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
        <BadgeDispo
          offre={voiture.offre}
          disponible={voiture.disponible !== false}
          className="absolute left-3 top-3"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {categorie && <p className="text-xs font-bold uppercase tracking-widest text-primaire">{categorie}</p>}
        <h3 className="mt-1 text-lg font-bold">
          {/* Lien « étiré » : toute la carte est cliquable. */}
          <Link href={`/voitures/${voiture.slug}`} className="after:absolute after:inset-0">
            {titre}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-texte-doux">{resumeCarte(voiture)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-xl font-extrabold">
            {prix.valeur}
            {prix.suffixe && <span className="text-sm font-medium text-texte-doux"> {prix.suffixe}</span>}
          </p>
          <Link
            href={`/contact?voiture=${voiture.slug}`}
            className="relative z-10 rounded-lg border border-primaire px-3 py-1.5 text-sm font-semibold text-primaire hover:bg-primaire hover:text-primaire-contraste"
          >
            Contacter
          </Link>
        </div>
      </div>
    </article>
  )
}
