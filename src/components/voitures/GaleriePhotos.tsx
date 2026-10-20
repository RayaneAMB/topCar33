'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import type { PhotoGalerie } from '@/lib/format'

/**
 * Galerie de la fiche voiture : on fait glisser les photos au doigt.
 *
 * Le glissement est celui du navigateur — un défilement horizontal aimanté
 * (`scroll-snap`) — et non un geste recalculé à la main : on obtient
 * l'inertie et le rebond natifs du téléphone, le balayage à deux doigts du
 * pavé tactile, et les flèches du clavier une fois la galerie sélectionnée.
 *
 * La souris, elle, ne sait pas glisser : flèches et vignettes s'en chargent.
 */
export function GaleriePhotos({ photos, titre }: { photos: PhotoGalerie[]; titre: string }) {
  const [index, setIndex] = useState(0)
  const piste = useRef<HTMLDivElement>(null)

  // La photo affichée se déduit de la position de défilement : c'est elle qui
  // fait foi, que l'on ait glissé, cliqué une vignette ou utilisé le clavier.
  useEffect(() => {
    const element = piste.current
    if (!element) return
    let demande = 0
    const suivre = () => {
      demande = 0
      setIndex(Math.round(element.scrollLeft / element.clientWidth))
    }
    const planifier = () => {
      if (!demande) demande = requestAnimationFrame(suivre)
    }
    element.addEventListener('scroll', planifier, { passive: true })
    return () => {
      element.removeEventListener('scroll', planifier)
      if (demande) cancelAnimationFrame(demande)
    }
  }, [])

  if (photos.length === 0) return <div className="aspect-[16/10] rounded-carte bg-fond-alt" />

  const plusieurs = photos.length > 1

  function aller(position: number) {
    const element = piste.current
    if (!element) return
    const cible = Math.max(0, Math.min(photos.length - 1, position))
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollTo({ left: cible * element.clientWidth, behavior: reduit ? 'auto' : 'smooth' })
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={piste}
          // Sélectionnable au clavier : les flèches gauche/droite font défiler.
          tabIndex={plusieurs ? 0 : undefined}
          role="region"
          aria-roledescription="galerie"
          aria-label={`Photos de la ${titre}`}
          className="galerie-piste flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-carte bg-fond-alt"
        >
          {photos.map((photo, position) => (
            <div
              key={photo.url}
              role="group"
              aria-roledescription="photo"
              aria-label={`${position + 1} sur ${photos.length}`}
              className="relative h-full w-full shrink-0 snap-center snap-always"
            >
              <Image
                src={photo.url}
                alt={photo.alt || titre}
                fill
                // Seule la première photo est urgente ; les suivantes attendent
                // qu'on s'en approche.
                priority={position === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {plusieurs && (
          <>
            {/* Les flèches sont posées dans un conteneur qui les centre : un
                `translate` sur le bouton lui-même serait écrasé par l'effet
                d'enfoncement de `.bouton-controle`. */}
            <div className="pointer-events-none absolute inset-y-0 left-3 hidden items-center sm:flex">
              <button
                type="button"
                onClick={() => aller(index - 1)}
                disabled={index === 0}
                aria-label="Photo précédente"
                className="bouton-controle pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-fond/85 text-texte shadow-sm backdrop-blur transition hover:bg-fond disabled:opacity-0"
              >
                <Chevron sens="gauche" />
              </button>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center sm:flex">
              <button
                type="button"
                onClick={() => aller(index + 1)}
                disabled={index === photos.length - 1}
                aria-label="Photo suivante"
                className="bouton-controle pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-fond/85 text-texte shadow-sm backdrop-blur transition hover:bg-fond disabled:opacity-0"
              >
                <Chevron sens="droite" />
              </button>
            </div>

            <p
              aria-live="polite"
              className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-anthracite/75 px-2.5 py-1 text-xs font-semibold text-white tabular-nums backdrop-blur"
            >
              <span className="sr-only">Photo </span>
              {index + 1} / {photos.length}
            </p>
          </>
        )}
      </div>

      {plusieurs && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((photo, position) => (
            <li key={photo.url}>
              <button
                type="button"
                onClick={() => aller(position)}
                aria-label={`Afficher la photo ${position + 1}`}
                aria-pressed={position === index}
                className={`bouton-controle relative block aspect-[4/3] w-full overflow-hidden rounded-md border-2 ${
                  position === index ? 'border-primaire' : 'border-transparent'
                }`}
              >
                <Image src={photo.miniature} alt="" fill sizes="20vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Chevron({ sens }: { sens: 'gauche' | 'droite' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d={sens === 'gauche' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}
