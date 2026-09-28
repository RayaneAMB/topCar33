import Link from 'next/link'

import type { Agence } from '@/payload-types'
import { adresseEnLigne, lienItineraire, lienTelephone } from '@/lib/format'

import { LogoMarque } from './LogoMarque'

export function PiedDePage({ agence }: { agence: Agence }) {
  const nom = agence.nom || 'TopCar33'
  const adresse = adresseEnLigne(agence.adresse)
  const itineraire = lienItineraire(agence.adresse)

  return (
    <footer className="mt-20 border-t border-bordure bg-fond-alt">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm sm:grid-cols-3">
        <div>
          <LogoMarque agence={agence} hauteur={40} />
          {adresse && (
            <p className="mt-5 text-texte-doux">
              {adresse}
              {itineraire && (
                <>
                  <br />
                  <a href={itineraire} target="_blank" rel="noopener noreferrer" className="text-primaire underline">
                    Itinéraire
                  </a>
                </>
              )}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-sm">Nous joindre</h2>
          <ul className="mt-3 space-y-1 text-texte-doux">
            {agence.telephone && (
              <li>
                <a href={lienTelephone(agence.telephone)} className="transition hover:text-primaire">
                  {agence.telephone}
                </a>
              </li>
            )}
            {agence.emailPublic && (
              <li>
                <a href={`mailto:${agence.emailPublic}`} className="transition hover:text-primaire">
                  {agence.emailPublic}
                </a>
              </li>
            )}
            {agence.horaires?.map((creneau) => (
              <li key={creneau.id ?? creneau.jours}>
                {creneau.jours} : {creneau.heures}
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Informations">
          <h2 className="text-sm">Le site</h2>
          <ul className="mt-3 space-y-1 text-texte-doux">
            <li>
              <Link href="/location" className="transition hover:text-primaire">
                Voitures à louer
              </Link>
            </li>
            <li>
              <Link href="/vente" className="transition hover:text-primaire">
                Voitures à vendre
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-primaire">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="transition hover:text-primaire">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="transition hover:text-primaire">
                Confidentialité
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <p className="border-t border-bordure py-4 text-center text-xs text-texte-doux">
        © {new Date().getFullYear()} {nom}
      </p>
    </footer>
  )
}
