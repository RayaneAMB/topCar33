import type { Voiture } from '@/payload-types'
import { lignesTarifs } from '@/lib/format'

export function TableauTarifs({ tarifs }: { tarifs: Voiture['tarifs'] }) {
  return (
    <table className="w-full text-sm">
      <caption className="mb-2 text-left font-titre text-lg font-bold">Tarifs</caption>
      <tbody>
        {lignesTarifs(tarifs).map((ligne) => (
          <tr key={ligne.libelle} className="border-b border-bordure last:border-0">
            <th scope="row" className="py-2 text-left font-normal text-texte-doux">
              {ligne.libelle}
            </th>
            <td className="py-2 text-right font-semibold">{ligne.valeur}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
