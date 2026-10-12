'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { doitEntrer } from '@/lib/apparition'

/**
 * Fait entrer son contenu quand le défilement l'amène à l'écran.
 *
 * Le serveur rend l'élément **visible** : si le JavaScript ne s'exécute jamais,
 * les voitures sont là quand même. Ce n'est qu'une fois dans le navigateur, et
 * seulement pour ce qui est encore sous la ligne de flottaison, qu'on le met en
 * retrait — d'où l'absence de clignotement sur ce qui est déjà affiché.
 *
 * L'apparence est dans styles.css (`[data-apparition]`) : le décalage d'une
 * carte à l'autre y est calculé par colonne, ce que le JavaScript ne saurait
 * pas faire sans connaître le point de rupture courant.
 */
export function ApparitionAuDefilement({
  children,
  className = '',
}: {
  children: ReactNode
  /** Le conteneur s'insère dans la mise en page de l'appelant : il lui laisse en fixer les règles. */
  className?: string
}) {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cible = element.current
    if (!cible) return

    const entree = doitEntrer({
      hautRelatif: cible.getBoundingClientRect().top,
      hauteurFenetre: window.innerHeight,
      animationsReduites: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
    if (!entree) return

    cible.dataset.apparition = 'attente'

    // Déclenchement au premier contact avec l'écran, sans marge négative.
    // Exiger que le bloc soit « bien engagé » serait plus joli, mais un bloc
    // court en fin de page peut ne jamais atteindre cette zone faute de
    // défilement restant : il resterait invisible pour toujours. Le contact
    // simple, lui, finit toujours par arriver.
    const observateur = new IntersectionObserver(([vue]) => {
      if (!vue.isIntersecting) return
      cible.dataset.apparition = 'entree'
      // Une seule fois : revenir en arrière ne doit pas rejouer l'animation.
      observateur.disconnect()
    })

    observateur.observe(cible)
    return () => observateur.disconnect()
  }, [])

  return (
    <div ref={element} className={className}>
      {children}
    </div>
  )
}
