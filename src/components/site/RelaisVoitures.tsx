'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { apresGlissement } from '@/lib/carrousel'
import type { Vedette } from '@/lib/vedette'

/** Temps d'affichage d'une voiture avant que la suivante entre. */
const DUREE_MS = 4500

/** Distance à parcourir pour changer de voiture au doigt. */
const SEUIL_PX = 60

/**
 * Les voitures du parc se relaient : celle qui part glisse à gauche, la suivante
 * arrive par la droite. On peut aussi balayer pour passer de l'une à l'autre.
 *
 * Sans cadre : les photos ont un fond blanc plein, fondu dans la page par
 * `.photo-fondue` (styles.css), qui gère aussi le thème sombre.
 */
export function RelaisVoitures({ vedettes }: { vedettes: Vedette[] }) {
  const [actif, setActif] = useState(0)
  const [enPause, setEnPause] = useState(false)
  const [decalage, setDecalage] = useState(0)
  // Le doigt est-il posé ? La question regarde l'affichage — elle coupe la
  // transition CSS — donc elle appartient à l'état. La ref juste en dessous
  // garde les détails du geste, qui eux ne changent rien à ce qui est dessiné.
  const [enCoursDeGlissement, setEnCoursDeGlissement] = useState(false)
  const glissement = useRef<{ depart: number; aGlisse: boolean } | null>(null)
  const vientDeGlisser = useRef(false)

  useEffect(() => {
    if (vedettes.length < 2 || enPause) return
    // Respecte le réglage système « réduire les animations » : on n'avance plus.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const minuterie = setInterval(() => setActif((index) => (index + 1) % vedettes.length), DUREE_MS)
    return () => clearInterval(minuterie)
  }, [vedettes.length, enPause])

  if (vedettes.length === 0) return null

  const precedent = (actif - 1 + vedettes.length) % vedettes.length

  const terminerGlissement = () => {
    if (!glissement.current) return
    // Retenu jusqu'au clic qui suit : un balayage ne doit pas ouvrir la fiche.
    vientDeGlisser.current = glissement.current.aGlisse
    glissement.current = null
    setEnCoursDeGlissement(false)
    setActif((index) => apresGlissement({ index, deplacement: decalage, seuil: SEUIL_PX, total: vedettes.length }))
    setDecalage(0)
    setEnPause(false)
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocus={() => setEnPause(true)}
      onBlur={() => setEnPause(false)}
    >
      <div
        role="group"
        aria-label="Voitures du parc"
        // `touch-pan-y` laisse la page défiler verticalement pendant qu'on balaie.
        className="relative aspect-[16/11] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        onPointerDown={(evenement) => {
          glissement.current = { depart: evenement.clientX, aGlisse: false }
          setEnCoursDeGlissement(true)
          setEnPause(true)
        }}
        onPointerMove={(evenement) => {
          const debut = glissement.current
          if (!debut) return
          const distance = evenement.clientX - debut.depart
          // On ne s'empare du pointeur qu'au-delà d'un vrai mouvement : le capter
          // dès l'appui empêcherait le clic d'atteindre le lien de la voiture.
          if (!debut.aGlisse && Math.abs(distance) > 8) {
            debut.aGlisse = true
            evenement.currentTarget.setPointerCapture(evenement.pointerId)
          }
          if (debut.aGlisse) setDecalage(distance)
        }}
        onPointerUp={terminerGlissement}
        onPointerCancel={terminerGlissement}
        onPointerLeave={terminerGlissement}
        onClickCapture={(evenement) => {
          if (!vientDeGlisser.current) return
          vientDeGlisser.current = false
          evenement.preventDefault()
          evenement.stopPropagation()
        }}
      >
        {/* Halo de thème sombre : voir .halo-photo dans styles.css. */}
        {!vedettes[actif]?.detouree && <div className="halo-photo" aria-hidden="true" />}

        {vedettes.map((vedette, index) => {
          const estActif = index === actif
          const sort = index === precedent && vedettes.length > 1
          const place = estActif ? 'translate-x-0 opacity-100' : sort ? '-translate-x-8 opacity-0' : 'translate-x-8 opacity-0'

          return (
            <div
              key={vedette.slug}
              aria-hidden={!estActif}
              // Pendant le balayage, la voiture suit le doigt : la transition
              // est coupée, sinon elle traînerait derrière lui.
              style={estActif && decalage ? { transform: `translateX(${decalage}px)` } : undefined}
              className={`absolute inset-0 ease-out motion-reduce:transition-none ${
                enCoursDeGlissement ? '' : 'transition-[transform,opacity] duration-700'
              } ${estActif ? 'opacity-100' : place} ${estActif ? '' : 'pointer-events-none'}`}
            >
              <Image
                src={vedette.photo}
                alt={vedette.alt}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 45vw, 100vw"
                draggable={false}
                className={`object-contain p-[6%] ${vedette.detouree ? '' : 'photo-fondue'}`}
              />

              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3">
                <div className="rounded-carte bg-anthracite/90 px-4 py-2.5 backdrop-blur">
                  {vedette.categorie && (
                    <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/60">
                      {vedette.categorie}
                    </span>
                  )}
                  <Link
                    href={`/voitures/${vedette.slug}`}
                    tabIndex={estActif ? undefined : -1}
                    draggable={false}
                    className="text-base font-semibold text-white transition hover:text-cyan"
                  >
                    {vedette.titre}
                  </Link>
                </div>

                <p className="rounded-carte bg-primaire px-3.5 py-2 text-sm font-bold text-primaire-contraste">
                  {vedette.prix}
                  {vedette.suffixe && <span className="font-medium"> {vedette.suffixe}</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {vedettes.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {vedettes.map((vedette, index) => (
            <button
              key={vedette.slug}
              type="button"
              onClick={() => setActif(index)}
              aria-label={`Voir ${vedette.titre}`}
              aria-current={index === actif}
              className={`h-2.5 rounded-full transition-all ${
                index === actif ? 'w-7 bg-primaire' : 'w-2.5 bg-bordure hover:bg-texte-doux'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
