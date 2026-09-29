import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import React from 'react'

// Montserrat (police de texte de la charte), auto-hébergée : aucun appel à Google Fonts.
// Bank Gothic, la police des titres, est chargée dans styles.css depuis /public/polices.
import '@fontsource-variable/montserrat'

import { EnTete } from '@/components/site/EnTete'
import { PiedDePage } from '@/components/site/PiedDePage'
import { getAgence } from '@/lib/donnees'
import { attributTheme, CLE_THEME, estUnTheme, type Theme } from '@/lib/theme'

import './styles.css'

// Toujours à jour : une modification dans l'admin est visible immédiatement.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const agence = await getAgence()
  const nom = agence.nom || 'TopCar33'
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: { default: `${nom} — Achat, vente et location de voitures`, template: `%s | ${nom}` },
    description: agence.sousAccroche || agence.accroche || `Achat, vente et location de voitures — ${nom}`,
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#0d1011',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [agence, magasinCookies] = await Promise.all([getAgence(), cookies()])

  // Le thème choisi est posé côté serveur : la page arrive déjà dans la bonne couleur.
  const choix = magasinCookies.get(CLE_THEME)?.value
  const theme: Theme = estUnTheme(choix) ? choix : 'systeme'

  return (
    <html lang="fr" data-theme={attributTheme(theme)}>
      <body className="flex min-h-screen flex-col bg-fond text-texte antialiased">
        <EnTete agence={agence} theme={theme} />
        <main className="flex-1">{children}</main>
        <PiedDePage agence={agence} />
      </body>
    </html>
  )
}
