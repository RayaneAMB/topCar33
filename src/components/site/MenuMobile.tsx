'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Agence } from '@/payload-types'
import type { Theme } from '@/lib/theme'
import { adresseEnLigne, lienItineraire, lienTelephone } from '@/lib/format'
import { LIENS_MENU } from '@/lib/navigation'

import { LienNav } from './LienNav'
import { SelecteurTheme } from './SelecteurTheme'

/** Menu déroulant affiché à la place de la navigation quand l'écran est étroit. */
export function MenuMobile({ agence, theme }: { agence: Agence; theme: Theme }) {
  const [ouvert, setOuvert] = useState(false)
  const adresse = adresseEnLigne(agence.adresse)
  const itineraire = lienItineraire(agence.adresse)
  const creneau = agence.horaires?.[0]

  useEffect(() => {
    if (!ouvert) return
    const fermerAvecEchap = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') setOuvert(false)
    }
    document.addEventListener('keydown', fermerAvecEchap)
    return () => document.removeEventListener('keydown', fermerAvecEchap)
  }, [ouvert])

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        aria-controls="menu-mobile"
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        className="rounded-carte border border-bordure p-2 text-texte transition hover:border-primaire"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          {ouvert ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {ouvert && (
        <div
          id="menu-mobile"
          className="absolute inset-x-0 top-full border-b border-bordure bg-fond px-4 py-4 shadow-lg"
        >
          <nav aria-label="Navigation principale" className="flex flex-col gap-1">
            {LIENS_MENU.map(({ href, libelle }) => (
              <LienNav
                key={href}
                href={href}
                onClick={() => setOuvert(false)}
                className="rounded-carte px-2 py-3 text-base font-semibold transition"
                auRepos="text-texte hover:bg-fond-alt"
                surLaPage="bg-fond-alt text-primaire"
              >
                {libelle}
              </LienNav>
            ))}
            <Link
              href="/contact"
              onClick={() => setOuvert(false)}
              className="mt-2 rounded-carte bg-primaire px-4 py-3 text-center font-semibold text-primaire-contraste"
            >
              Nous contacter
            </Link>
          </nav>

          {/* Les coordonnées, déplacées ici depuis la bande du haut. */}
          <div className="mt-5 space-y-2 border-t border-bordure px-2 pt-4 text-sm text-texte-doux">
            {agence.telephone && (
              <a
                href={lienTelephone(agence.telephone)}
                className="block font-semibold text-primaire"
                onClick={() => setOuvert(false)}
              >
                {agence.telephone}
              </a>
            )}
            {adresse && (
              <p>
                {adresse}
                {itineraire && (
                  <>
                    {' '}
                    <a
                      href={itineraire}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-primaire underline"
                    >
                      Itinéraire
                    </a>
                  </>
                )}
              </p>
            )}
            {creneau && (
              <p>
                {creneau.jours} : {creneau.heures}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-bordure pt-4">
            <span className="text-sm text-texte-doux">Thème</span>
            <SelecteurTheme themeInitial={theme} />
          </div>
        </div>
      )}
    </div>
  )
}
