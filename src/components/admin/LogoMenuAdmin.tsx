/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

/**
 * Logo de la charte en tête du menu latéral : le menu est anthracite dans les
 * deux thèmes, d'où la version blanche seule. Un clic ramène au tableau de bord.
 */
export function LogoMenuAdmin() {
  return (
    <Link href="/admin" className="tc-logo-menu" aria-label="TopCar33 — tableau de bord">
      <img src="/marque/logo-horizontal-blanc.svg" alt="" />
    </Link>
  )
}
