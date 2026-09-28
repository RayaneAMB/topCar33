import Link from 'next/link'

import type { Agence } from '@/payload-types'
import { adresseEnLigne, lienTelephone } from '@/lib/format'

export function PiedDePage({ agence }: { agence: Agence }) {
  const nom = agence.nom || 'TopCar33'
  const adresse = adresseEnLigne(agence.adresse)

  return (
    <footer className="mt-16 border-t border-bordure bg-fond-alt">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-titre text-lg font-extrabold uppercase">{nom}</p>
          {adresse && <p className="mt-2 text-texte-doux">{adresse}</p>}
          {agence.telephone && (
            <p className="mt-1">
              <a href={lienTelephone(agence.telephone)} className="hover:text-primaire">
                {agence.telephone}
              </a>
            </p>
          )}
          {agence.emailPublic && (
            <p className="mt-1">
              <a href={`mailto:${agence.emailPublic}`} className="hover:text-primaire">
                {agence.emailPublic}
              </a>
            </p>
          )}
        </div>
        <div>
          <p className="font-semibold">Horaires</p>
          {agence.horaires?.length ? (
            <ul className="mt-2 space-y-1 text-texte-doux">
              {agence.horaires.map((creneau) => (
                <li key={creneau.id ?? creneau.jours}>
                  {creneau.jours} : {creneau.heures}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-texte-doux">Sur rendez-vous</p>
          )}
        </div>
        <nav aria-label="Informations">
          <p className="font-semibold">Informations</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/contact" className="text-texte-doux hover:text-texte">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="text-texte-doux hover:text-texte">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="text-texte-doux hover:text-texte">
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
