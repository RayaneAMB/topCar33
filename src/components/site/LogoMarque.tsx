import Image from 'next/image'

import type { Agence } from '@/payload-types'
import { urlPhoto } from '@/lib/format'

/** Rapport largeur/hauteur du logo horizontal de la charte (2000 × 305,38). */
const RATIO = 2000 / 305.38

/**
 * Logo téléversé dans l'administration s'il y en a un, sinon le logo de la charte.
 * `hauteur` est en pixels : c'est elle qui commande la taille affichée.
 */
export function LogoMarque({ agence, hauteur }: { agence: Agence; hauteur: number }) {
  const nom = agence.nom || 'TopCar33'
  const logoAdmin = typeof agence.logo === 'object' ? agence.logo : null
  const urlAdmin = urlPhoto(logoAdmin, 'miniature')

  if (urlAdmin && logoAdmin) {
    return (
      <Image
        src={urlAdmin}
        alt={logoAdmin.alt || nom}
        width={logoAdmin.width ?? Math.round(hauteur * RATIO)}
        height={logoAdmin.height ?? hauteur}
        style={{ height: hauteur, width: 'auto' }}
        priority
      />
    )
  }

  return (
    <Image
      src="/marque/logo-horizontal-blanc.svg"
      alt={nom}
      width={Math.round(hauteur * RATIO)}
      height={hauteur}
      style={{ height: hauteur, width: 'auto' }}
      unoptimized
      priority
    />
  )
}
