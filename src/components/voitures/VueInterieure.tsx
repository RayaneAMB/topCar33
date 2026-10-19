'use client'

import 'pannellum/build/pannellum.css'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type Etat = 'apercu' | 'chargement' | 'active' | 'erreur'

/** Les messages de Pannellum, en français. `%s` est remplacé par Pannellum. */
const TEXTES = {
  loadButtonLabel: 'Charger le panorama',
  loadingLabel: 'Chargement…',
  bylineLabel: 'par %s',
  noPanoramaError: 'Aucune image panoramique n’a été indiquée.',
  fileAccessError: 'Le fichier %s est inaccessible.',
  malformedURLError: 'L’adresse du panorama est incorrecte.',
  iOS8WebGLError: 'Votre appareil ne sait pas afficher ce panorama.',
  genericWebGLError: 'Votre navigateur ne sait pas afficher ce panorama (WebGL indisponible).',
  textureSizeError: 'Ce panorama est trop grand pour votre appareil : %spx de large, %spx au plus.',
  unknownError: 'Une erreur inconnue empêche l’affichage du panorama.',
}

/**
 * Vue de l'habitacle à 360° : on regarde tout autour de soi, assis à la place
 * du conducteur.
 *
 * Elle s'ouvre sur un aperçu fixe, et la visionneuse ne démarre qu'à la
 * demande — pour deux raisons :
 *
 * - une visionneuse capture le glissement du doigt : posée d'office dans la
 *   page, elle bloquerait le défilement sur mobile à son passage ;
 * - Pannellum et l'image pleine taille pèsent plusieurs méga-octets, à ne
 *   faire payer qu'à qui veut vraiment regarder.
 */
export function VueInterieure({ panorama, titre }: { panorama: string; titre: string }) {
  const [etat, setEtat] = useState<Etat>('apercu')
  const conteneur = useRef<HTMLDivElement>(null)
  const visionneuse = useRef<VisionneusePannellum | null>(null)

  useEffect(() => () => visionneuse.current?.destroy(), [])

  async function lancer() {
    setEtat('chargement')
    // Après une erreur, on peut relancer : la tentative précédente doit partir.
    visionneuse.current?.destroy()
    visionneuse.current = null
    try {
      // Pannellum touche à `window` dès son chargement : il ne peut venir
      // qu'ici, dans le navigateur, jamais au rendu serveur.
      await import('pannellum')
      if (!window.pannellum || !conteneur.current) throw new Error('Pannellum indisponible')

      const vue = window.pannellum.viewer(conteneur.current, {
        type: 'equirectangular',
        panorama,
        autoLoad: true,
        hfov: 100,
        // Sans quoi la molette, au lieu de faire défiler la page, zoome dans
        // le panorama dès que le pointeur passe dessus.
        mouseZoom: false,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        strings: TEXTES,
      })
      vue.on('error', () => setEtat('erreur'))
      visionneuse.current = vue
      setEtat('active')
    } catch {
      setEtat('erreur')
    }
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-carte bg-fond-alt">
      {/* La visionneuse prend sa place ici ; elle reste montée une fois lancée. */}
      <div
        ref={conteneur}
        role="region"
        aria-label={`Vue intérieure à 360° de la ${titre}. Faites glisser pour regarder autour.`}
        className={`absolute inset-0 ${etat === 'active' ? '' : 'invisible'}`}
      />

      {etat !== 'active' && (
        <>
          <Image
            src={panorama}
            alt={`Habitacle de la ${titre}, vu à 360°`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-anthracite/35 p-4 text-center">
            <button
              type="button"
              onClick={lancer}
              disabled={etat === 'chargement'}
              className="bouton-action rounded-carte bg-primaire px-5 py-3 font-semibold text-primaire-contraste disabled:opacity-70"
            >
              {etat === 'chargement' ? 'Chargement…' : 'Explorer l’intérieur à 360°'}
            </button>
            {etat === 'erreur' && (
              <p role="alert" className="max-w-xs rounded-carte bg-anthracite/85 px-3 py-2 text-sm text-white">
                La vue intérieure ne peut pas s’afficher sur cet appareil.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
