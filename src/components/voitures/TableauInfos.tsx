import type { LigneTarif } from '@/lib/format'

/** Petit tableau à deux colonnes : tarifs de location ou informations du véhicule à vendre. */
export function TableauInfos({ titre, lignes }: { titre: string; lignes: LigneTarif[] }) {
  if (lignes.length === 0) return null

  return (
    <table className="w-full text-sm">
      <caption className="mb-2 text-left font-titre text-lg font-bold">{titre}</caption>
      <tbody>
        {lignes.map((ligne) => (
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
