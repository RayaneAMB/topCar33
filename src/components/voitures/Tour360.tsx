'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { vueSuivante } from '@/lib/tour360'

/** Distance à parcourir au doigt ou à la souris pour passer à la vue suivante. */
const PAS_PX = 12

/**
 * Tour à 360° : le visiteur fait tourner la voiture en glissant dessus.
 *
 * Les vues sont posées l'une sur l'autre : changer d'angle n'entraîne aucune
 * requête, donc aucun clignotement. Une trentaine d'images pèse lourd, alors on
 * ne les met dans la page qu'à l'approche de l'écran ; avant cela, seule la
 * première est affichée. `loading="lazy"` ne conviendrait pas : un navigateur ne
 * charge pas une image masquée, et les vues le sont toutes sauf une.
 */
export function Tour360({
  images,
  titre,
  detourees = false,
}: {
  images: string[]
  titre: string
  detourees?: boolean
}) {
  const [vue, setVue] = useState(0)
  const [chargees, setChargees] = useState(0)
  const [approche, setApproche] = useState(false)
  const cadre = useRef<HTMLDivElement>(null)
  const glissement = useRef<{ depart: number; vueDepart: number } | null>(null)

  useEffect(() => {
    const element = cadre.current
    if (!element || approche) return

    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((entree) => entree.isIntersecting)) setApproche(true)
      },
      { rootMargin: '600px' },
    )
    observateur.observe(element)
    return () => observateur.disconnect()
  }, [approche])

  /**
   * Le chargement est suivi en JavaScript plutôt que par `onLoad` sur les balises :
   * React manque l'événement des images déjà en cache, et l'indicateur resterait
   * bloqué. Quand tout est prêt, les vues s'affichent instantanément.
   */
  useEffect(() => {
    if (!approche) return

    let annule = false
    let restantes = images.length

    for (const source of images) {
      const image = new window.Image()
      const fini = () => {
        if (annule) return
        restantes -= 1
        setChargees(images.length - restantes)
      }
      image.onload = fini
      image.onerror = fini
      image.src = source
    }

    return () => {
      annule = true
    }
  }, [approche, images])

  const bouger = useCallback(
    (x: number) => {
      const debut = glissement.current
      if (!debut) return
      setVue(
        vueSuivante({
          depart: debut.vueDepart,
          deplacement: x - debut.depart,
          pas: PAS_PX,
          total: images.length,
        }),
      )
    },
    [images.length],
  )

  if (images.length === 0) return null

  // Avant l'approche, une seule vue est posée : rien d'autre n'est téléchargé.
  const pret = chargees >= images.length
  // Avant que tout soit chargé, une seule vue est posée : la rotation ne peut pas sauter.
  const aAfficher = pret ? images : images.slice(0, 1)

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={cadre}
        role="img"
        aria-label={`${titre}, vue à 360 degrés. Utilisez les flèches gauche et droite pour tourner.`}
        tabIndex={0}
        onKeyDown={(evenement) => {
          const sens = evenement.key === 'ArrowRight' ? 1 : evenement.key === 'ArrowLeft' ? -1 : 0
          if (sens === 0) return
          evenement.preventDefault()
          setVue((actuelle) => (actuelle + sens + images.length) % images.length)
        }}
        onPointerDown={(evenement) => {
          evenement.currentTarget.setPointerCapture(evenement.pointerId)
          glissement.current = { depart: evenement.clientX, vueDepart: vue }
        }}
        onPointerMove={(evenement) => bouger(evenement.clientX)}
        onPointerUp={() => {
          glissement.current = null
        }}
        onPointerCancel={() => {
          glissement.current = null
        }}
        className="relative aspect-[4/3] cursor-grab touch-pan-y select-none overflow-hidden rounded-carte border border-bordure active:cursor-grabbing"
      >
        {aAfficher.map((source, index) => (
          // eslint-disable-next-line @next/next/no-img-element -- pile de vues : next/image ajouterait un wrapper par image sans rien apporter.
          <img
            key={source}
            src={source}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`absolute inset-0 h-full w-full object-contain p-4 ${detourees ? '' : 'photo-fondue'} ${
              index === vue ? '' : 'invisible'
            }`}
          />
        ))}

        {!pret && (
          <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2 text-xs text-texte-doux">
            <span>Chargement du tour…</span>
            <span className="h-1.5 w-32 overflow-hidden rounded-full bg-bordure">
              <span
                className="block h-full bg-primaire transition-[width] duration-200"
                style={{ width: `${Math.round((chargees / images.length) * 100)}%` }}
              />
            </span>
          </div>
        )}

        {pret && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-texte-doux">
            Glissez pour tourner
          </p>
        )}
      </div>

      <input
        type="range"
        min={0}
        max={images.length - 1}
        value={vue}
        onChange={(evenement) => setVue(Number(evenement.target.value))}
        aria-label={`Angle de vue de ${titre}`}
        className="w-full accent-primaire"
      />
    </div>
  )
}
