import Image from 'next/image'

import type { Agence } from '@/payload-types'
import { urlPhoto } from '@/lib/format'

/** Rapport largeur/hauteur du logo horizontal de la charte (2000 × 305,38). */
const RATIO = 2000 / 305.38

/**
 * Logo téléversé dans l'administration s'il y en a un, sinon le logo de la charte.
 * Les deux versions du logo de la charte sont rendues ; styles.css affiche celle
 * qui correspond au thème (couleur sur fond clair, blanche sur fond sombre).
 */
export function LogoMarque({ agence, hauteur }: { agence: Agence; hauteur: number }) {
  const nom = agence.nom || 'TopCar33'
  const logoAdmin = typeof agence.logo === 'object' ? agence.logo : null
  const urlAdmin = urlPhoto(logoAdmin, 'miniature')
  const dimensions = { height: hauteur, width: 'auto' } as const

  if (urlAdmin && logoAdmin) {
    return (
      <Image
        src={urlAdmin}
        alt={logoAdmin.alt || nom}
        width={logoAdmin.width ?? Math.round(hauteur * RATIO)}
        height={logoAdmin.height ?? hauteur}
        style={dimensions}
        priority
      />
    )
  }

  return (
    <>
      <Image
        src="/marque/logo-horizontal-couleur.svg"
        alt={nom}
        width={Math.round(hauteur * RATIO)}
        height={hauteur}
        className="logo-couleur"
        style={dimensions}
        unoptimized
        priority
      />
      <Image
        src="/marque/logo-horizontal-blanc.svg"
        alt=""
        width={Math.round(hauteur * RATIO)}
        height={hauteur}
        className="logo-blanc"
        style={dimensions}
        unoptimized
        priority
      />
    </>
  )
}
