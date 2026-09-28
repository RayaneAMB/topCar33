import Link from 'next/link'

import type { Agence } from '@/payload-types'
import { lienTelephone } from '@/lib/format'
import { IconeTelephone } from '@/components/voitures/Icones'

import { LogoMarque } from './LogoMarque'

export function EnTete({ agence }: { agence: Agence }) {
  return (
    <header className="sticky top-0 z-20 border-b border-bordure bg-fond/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="TopCar33, retour à l’accueil" className="shrink-0">
          <LogoMarque agence={agence} hauteur={36} />
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-4 text-sm sm:gap-7">
          <Link href="/location" className="font-medium text-texte-doux transition hover:text-primaire">
            À louer
          </Link>
          <Link href="/vente" className="font-medium text-texte-doux transition hover:text-primaire">
            À vendre
          </Link>
          <Link href="/contact" className="font-medium text-texte-doux transition hover:text-primaire">
            Contact
          </Link>
          {/* Appeler plutôt que « Nous contacter » : le menu mène déjà au formulaire.
              Sur mobile, le numéro reste accessible dans la barre d'infos, en haut. */}
          {agence.telephone && (
            <a
              href={lienTelephone(agence.telephone)}
              className="hidden items-center gap-2 rounded-carte bg-primaire px-4 py-2 font-semibold text-primaire-contraste transition hover:bg-petrole hover:text-texte sm:inline-flex"
            >
              <IconeTelephone className="h-4 w-4" />
              {agence.telephone}
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
