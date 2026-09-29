'use client'

import { useState } from 'react'

import { enregistrerTheme, type Theme } from '@/lib/theme'

const CHOIX: { valeur: Theme; libelle: string; icone: React.ReactNode }[] = [
  {
    valeur: 'clair',
    libelle: 'Thème clair',
    icone: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </>
    ),
  },
  {
    valeur: 'sombre',
    libelle: 'Thème sombre',
    icone: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  },
  {
    valeur: 'systeme',
    libelle: 'Thème du système',
    icone: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
]

/** `themeInitial` vient du cookie, lu côté serveur : le bon bouton est actif dès le premier rendu. */
export function SelecteurTheme({ themeInitial }: { themeInitial: Theme }) {
  const [theme, setTheme] = useState<Theme>(themeInitial)

  const choisir = (valeur: Theme) => {
    setTheme(valeur)
    enregistrerTheme(valeur)
  }

  return (
    <div
      role="group"
      aria-label="Thème du site"
      className="flex items-center gap-0.5 rounded-full border border-bordure p-0.5"
    >
      {CHOIX.map(({ valeur, libelle, icone }) => {
        const actif = theme === valeur
        return (
          <button
            key={valeur}
            type="button"
            onClick={() => choisir(valeur)}
            aria-pressed={actif}
            title={libelle}
            className={`rounded-full p-1.5 transition ${
              actif ? 'bg-primaire text-primaire-contraste' : 'text-texte-doux hover:text-texte'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              {icone}
            </svg>
            <span className="sr-only">{libelle}</span>
          </button>
        )
      })}
    </div>
  )
}
