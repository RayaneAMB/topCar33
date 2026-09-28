import Image from 'next/image'
import Link from 'next/link'

import type { Agence } from '@/payload-types'
import { urlPhoto } from '@/lib/format'

export function EnTete({ agence }: { agence: Agence }) {
  const nom = agence.nom || 'TopCar33'
  const logo = typeof agence.logo === 'object' ? agence.logo : null
  const urlLogo = urlPhoto(logo, 'miniature')

  return (
    <header className="border-b border-bordure">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-titre text-xl font-extrabold uppercase tracking-wide">
          {urlLogo && logo ? (
            <Image
              src={urlLogo}
              alt={logo.alt || nom}
              width={logo.width ?? 160}
              height={logo.height ?? 48}
              className="h-10 w-auto"
              priority
            />
          ) : (
            nom
          )}
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/location" className="text-texte-doux hover:text-texte">
            À louer
          </Link>
          <Link href="/vente" className="text-texte-doux hover:text-texte">
            À vendre
          </Link>
          <Link href="/contact" className="text-texte-doux hover:text-texte">
            Contact
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-lg bg-primaire px-4 py-2 font-semibold text-primaire-contraste hover:opacity-90 sm:inline-block"
          >
            Nous contacter
          </Link>
        </nav>
      </div>
    </header>
  )
}
