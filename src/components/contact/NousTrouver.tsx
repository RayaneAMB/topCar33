import type { Agence } from '@/payload-types'
import { adresseEnLigne, lienItineraire, lienTelephone } from '@/lib/format'

export function NousTrouver({ agence }: { agence: Agence }) {
  const adresse = adresseEnLigne(agence.adresse)
  const itineraire = lienItineraire(agence.adresse)

  return (
    <aside aria-labelledby="titre-nous-trouver" className="h-fit rounded-carte border border-bordure bg-surface p-6">
      <h2 id="titre-nous-trouver" className="text-xl font-bold">
        Nous trouver
      </h2>
      <dl className="mt-4 space-y-4 text-sm">
        {adresse && (
          <div>
            <dt className="font-semibold">Adresse</dt>
            <dd className="text-texte-doux">{adresse}</dd>
            {itineraire && (
              <dd className="mt-1">
                <a href={itineraire} target="_blank" rel="noopener noreferrer" className="text-primaire underline">
                  Itinéraire (Google Maps)
                </a>
              </dd>
            )}
          </div>
        )}
        {agence.telephone && (
          <div>
            <dt className="font-semibold">Téléphone</dt>
            <dd>
              <a href={lienTelephone(agence.telephone)} className="text-texte-doux hover:text-texte">
                {agence.telephone}
              </a>
            </dd>
          </div>
        )}
        {agence.emailPublic && (
          <div>
            <dt className="font-semibold">Email</dt>
            <dd>
              <a href={`mailto:${agence.emailPublic}`} className="text-texte-doux hover:text-texte">
                {agence.emailPublic}
              </a>
            </dd>
          </div>
        )}
        {agence.horaires?.length ? (
          <div>
            <dt className="font-semibold">Horaires</dt>
            {agence.horaires.map((creneau) => (
              <dd key={creneau.id ?? creneau.jours} className="text-texte-doux">
                {creneau.jours} : {creneau.heures}
              </dd>
            ))}
          </div>
        ) : null}
      </dl>
    </aside>
  )
}
