import type { Agence } from '@/payload-types'
import { adresseEnLigne, lienTelephone } from '@/lib/format'

export function BarreInfos({ agence }: { agence: Agence }) {
  const adresse = adresseEnLigne(agence.adresse)
  const creneau = agence.horaires?.[0]
  if (!adresse && !creneau && !agence.telephone) return null

  return (
    <div className="bg-fond-alt text-xs text-texte-doux">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-1 px-4 py-2">
        {adresse && <span>{adresse}</span>}
        {creneau && (
          <span>
            {creneau.jours} : {creneau.heures}
          </span>
        )}
        {agence.telephone && (
          <a href={lienTelephone(agence.telephone)} className="hover:text-primaire">
            {agence.telephone}
          </a>
        )}
      </div>
    </div>
  )
}
