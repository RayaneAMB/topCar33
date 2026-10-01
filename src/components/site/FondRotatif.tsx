'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

import { vueDepuisDefilement } from '@/lib/defilement'

const ANIMATIONS_REDUITES = '(prefers-reduced-motion: reduce)'

/**
 * Le réglage système « réduire les animations », lu comme une source extérieure.
 *
 * C'était auparavant un `useState` allumé depuis un effet : React re-rendait
 * aussitôt le composant, et l'avertissait (« cascading renders »).
 * `useSyncExternalStore` est fait pour ça — et, au passage, le décor s'arrête
 * désormais si le visiteur change le réglage sans recharger la page.
 */
function useAnimationsReduites(): boolean {
  return useSyncExternalStore(
    (prevenir) => {
      const requete = window.matchMedia(ANIMATIONS_REDUITES)
      requete.addEventListener('change', prevenir)
      return () => requete.removeEventListener('change', prevenir)
    },
    () => window.matchMedia(ANIMATIONS_REDUITES).matches,
    // Le serveur ne connaît pas le réglage du visiteur : on rend la version
    // immobile, et le navigateur lance l'animation juste après l'hydratation.
    () => true,
  )
}

/**
 * La voiture tourne en fond de page, derrière tout le contenu, au rythme du
 * défilement : un tour complet de haut en bas du site.
 *
 * Le calque est fixe et volontairement discret — c'est un décor, jamais une
 * information. Les couleurs sont gérées dans styles.css (`.fond-rotatif`) :
 * le fond blanc des photos est fondu dans la page, et inversé en thème sombre.
 */
export function FondRotatif({ images, detourees = false }: { images: string[]; detourees?: boolean }) {
  const [vue, setVue] = useState(0)
  const anime = !useAnimationsReduites()

  useEffect(() => {
    // Animations réduites : la voiture reste immobile, rien à écouter.
    if (!anime) return

    let demande = 0
    const suivre = () => {
      demande = 0
      const document_ = document.documentElement
      setVue(
        vueDepuisDefilement({
          // La page entière sert de course : le haut du document s'éloigne
          // au fur et à mesure qu'on descend.
          haut: -window.scrollY,
          hauteur: document_.scrollHeight,
          fenetre: window.innerHeight,
          total: images.length,
        }),
      )
    }

    const planifier = () => {
      if (!demande) demande = requestAnimationFrame(suivre)
    }

    suivre()
    window.addEventListener('scroll', planifier, { passive: true })
    window.addEventListener('resize', planifier)
    return () => {
      if (demande) cancelAnimationFrame(demande)
      window.removeEventListener('scroll', planifier)
      window.removeEventListener('resize', planifier)
    }
  }, [images.length, anime])

  if (images.length === 0) return null

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${detourees ? 'fond-rotatif fond-rotatif--detoure' : 'fond-rotatif'}`}
      aria-hidden="true"
      data-anime={anime ? 'oui' : 'non'}
    >
      <FiltrePetrole />

      {images.map((source, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- pile de vues : next/image n'apporterait rien ici.
        <img
          key={source}
          src={source}
          alt=""
          draggable={false}
          className={`absolute inset-0 h-full w-full scale-125 object-contain sm:scale-110 ${
            index === vue ? '' : 'invisible'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * Le filtre qui repeint le décor en bleu pétrole (#0196AE) sur thème sombre.
 * Appliqué depuis styles.css (`.fond-rotatif--detoure img`), jamais en clair.
 *
 * En deux temps : la photo est d'abord ramenée à sa seule clarté, puis cette
 * clarté est rejouée sur une rampe de pétrole — sombre dans les creux, clair
 * sur les reflets. La carrosserie garde donc son modelé au lieu de s'aplatir
 * en silhouette, et la transparence du détourage n'est pas touchée.
 */
function FiltrePetrole() {
  const CLARTE = '0.2126 0.7152 0.0722 0 0'

  return (
    <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0">
      <filter id="teinte-petrole" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`${CLARTE} ${CLARTE} ${CLARTE} 0 0 0 1 0`} />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.004" intercept="0.001" />
          <feFuncG type="linear" slope="0.618" intercept="0.176" />
          <feFuncB type="linear" slope="0.717" intercept="0.205" />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}
