import type { Metadata } from 'next'
import React from 'react'

// Polices auto-hébergées (servies par le site, aucun appel à Google Fonts).
// next/font/google plante sous Turbopack sur ce projet, d'où les paquets @fontsource.
import '@fontsource-variable/inter'
import '@fontsource-variable/montserrat'

import { BarreInfos } from '@/components/site/BarreInfos'
import { EnTete } from '@/components/site/EnTete'
import { PiedDePage } from '@/components/site/PiedDePage'
import { getAgence } from '@/lib/donnees'

import './styles.css'

// Toujours à jour : une modification dans l'admin est visible immédiatement.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const agence = await getAgence()
  const nom = agence.nom || 'TopCar33'
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: { default: `${nom} — Location de voitures`, template: `%s | ${nom}` },
    description: agence.sousAccroche || agence.accroche || `Location de voitures — ${nom}`,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const agence = await getAgence()

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col bg-fond text-texte antialiased">
        <BarreInfos agence={agence} />
        <EnTete agence={agence} />
        <main className="flex-1">{children}</main>
        <PiedDePage agence={agence} />
      </body>
    </html>
  )
}
