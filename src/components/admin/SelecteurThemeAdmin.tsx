'use client'

import { useTheme } from '@payloadcms/ui'

type Choix = 'light' | 'dark' | 'auto'

const CHOIX: { valeur: Choix; libelle: string; icone: React.ReactNode }[] = [
  {
    valeur: 'light',
    libelle: 'Clair',
    icone: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </>
    ),
  },
  {
    valeur: 'dark',
    libelle: 'Sombre',
    icone: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  },
  {
    valeur: 'auto',
    libelle: 'Auto',
    icone: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
]

/**
 * Clair / Sombre / Auto, en bas du menu de l'administration.
 *
 * Payload sait déjà changer de thème, mais le réglage est caché dans la page
 * « Compte ». On le met à portée de main, avec les mêmes icônes que sur le site.
 * Le choix est mémorisé par Payload (cookie) ; « Auto » suit l'ordinateur.
 */
export function SelecteurThemeAdmin() {
  const { theme, autoMode, setTheme } = useTheme()
  const actif: Choix = autoMode ? 'auto' : theme

  return (
    <div role="group" aria-label="Thème de l’administration" className="tc-theme">
      {CHOIX.map(({ valeur, libelle, icone }) => (
        <button
          key={valeur}
          type="button"
          // `setTheme` accepte aussi « auto » (efface le cookie), même si son type l'ignore.
          onClick={() => setTheme(valeur as 'light' | 'dark')}
          aria-pressed={actif === valeur}
          title={`Thème ${libelle.toLowerCase()}`}
          className="tc-theme__bouton"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {icone}
          </svg>
          <span>{libelle}</span>
        </button>
      ))}
    </div>
  )
}
