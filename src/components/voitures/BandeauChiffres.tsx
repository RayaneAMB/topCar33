import type { Chiffre } from '@/lib/chiffresCles'

/**
 * Les chiffres qui décident, lus d'un coup d'œil comme un combiné
 * d'instruments : le nombre en grand, l'unité et ce qu'il mesure en petit,
 * un filet entre chaque.
 *
 * Le premier — le prix — porte la couleur de la marque : c'est lui qu'on
 * cherche d'abord. Sur mobile il prend toute la ligne, et les suivants se
 * partagent celle d'en dessous plutôt que de s'écraser à trois.
 *
 * `<dl>` : le libellé précède la valeur dans le document, comme le veulent les
 * lecteurs d'écran ; seul l'affichage les inverse.
 */
export function BandeauChiffres({ chiffres }: { chiffres: Chiffre[] }) {
  if (chiffres.length === 0) return null

  return (
    <dl className="flex flex-wrap border-y border-bordure">
      {chiffres.map((chiffre, index) => (
        <div
          key={chiffre.libelle}
          className={[
            // Colonne inversée : « start » est en bas. Les libellés s'alignent
            // ainsi sur une même ligne, quelle que soit la taille du chiffre.
            'flex grow flex-col-reverse justify-start gap-1.5 py-4',
            index === 0 ? 'basis-full border-b border-bordure pr-5 sm:basis-auto sm:border-b-0' : '',
            index === 1 ? 'pr-5 sm:border-l sm:border-bordure sm:pl-5' : '',
            index >= 2 ? 'border-l border-bordure pl-5' : '',
          ].join(' ')}
        >
          <dt className="text-xs text-texte-doux">{chiffre.libelle}</dt>
          <dd
            className={`whitespace-nowrap font-titre font-bold tracking-wide tabular-nums ${
              index === 0 ? 'text-[1.75rem] leading-none text-primaire' : 'text-xl leading-none'
            }`}
          >
            {chiffre.valeur}
            {chiffre.unite && (
              <span className="ml-1.5 font-texte text-sm font-semibold tracking-normal text-texte-doux">
                {chiffre.unite}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
