'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { estPageCourante } from '@/lib/navigation'

type Props = {
  href: string
  children: ReactNode
  /** Styles communs aux deux états. */
  className?: string
  /** Styles quand le visiteur est ailleurs. */
  auRepos: string
  /** Styles quand le visiteur est sur cette page. */
  surLaPage: string
  onClick?: () => void
}

/**
 * Un lien de menu qui reste allumé sur sa propre page.
 *
 * Les deux jeux de styles sont séparés plutôt qu'empilés : deux utilitaires
 * Tailwind qui posent la même propriété — `text-texte-doux` et `text-primaire` —
 * se départagent par leur ordre dans la feuille produite, pas par celui de
 * l'attribut. Ne poser qu'une couleur à la fois évite ce pile ou face.
 */
export function LienNav({ href, children, className = '', auRepos, surLaPage, onClick }: Props) {
  const courante = estPageCourante(usePathname(), href)

  return (
    <Link
      href={href}
      onClick={onClick}
      // La couleur seule ne dit rien à qui ne la voit pas : `aria-current`
      // annonce la même chose aux lecteurs d'écran.
      aria-current={courante ? 'page' : undefined}
      className={`${className} ${courante ? surLaPage : auRepos}`}
    >
      {children}
    </Link>
  )
}
