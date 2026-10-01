import Link from 'next/link'

import type { Agence } from '@/payload-types'
import type { Theme } from '@/lib/theme'
import { LIENS_MENU } from '@/lib/navigation'

import { LienNav } from './LienNav'
import { LogoMarque } from './LogoMarque'
import { MenuMobile } from './MenuMobile'
import { SelecteurTheme } from './SelecteurTheme'

export function EnTete({ agence, theme }: { agence: Agence; theme: Theme }) {
  return (
    <header className="sticky top-0 z-20 border-b border-bordure bg-fond/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="TopCar33, retour à l’accueil" className="shrink-0">
          <LogoMarque agence={agence} hauteur={36} />
        </Link>

        {/* Écrans larges : tout est visible. Écrans étroits : menu déroulant. */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 text-sm sm:flex">
          {LIENS_MENU.map(({ href, libelle }) => (
            <LienNav
              key={href}
              href={href}
              className="font-medium transition"
              auRepos="text-texte-doux hover:text-primaire"
              surLaPage="text-primaire"
            >
              {libelle}
            </LienNav>
          ))}
          <Link
            href="/contact"
            className="rounded-carte bg-primaire px-4 py-2 font-semibold text-primaire-contraste transition hover:bg-petrole hover:text-texte"
          >
            Nous contacter
          </Link>
          <SelecteurTheme themeInitial={theme} />
        </nav>

        <MenuMobile agence={agence} theme={theme} />
      </div>
    </header>
  )
}
