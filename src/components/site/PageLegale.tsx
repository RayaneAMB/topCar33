import type { ComponentProps } from 'react'

import { RichTexte } from '@/components/RichTexte'

type Props = {
  titre: string
  /** Le champ est facultatif dans l'administration : il peut arriver vide. */
  contenu: ComponentProps<typeof RichTexte>['data'] | null | undefined
  /** Affiché quand l'administration n'a pas encore de texte pour cette page. */
  vide: string
}

/**
 * Mise en page commune aux mentions légales et à la politique de
 * confidentialité : une colonne étroite, un texte qui respire.
 *
 * La largeur est bridée à `max-w-3xl` : un texte juridique en pleine page
 * devient pénible à suivre, l'œil perdant sa ligne au retour à la marge.
 */
export function PageLegale({ titre, contenu, vide }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <span className="barre-diagonale" aria-hidden="true" />
      <h1 className="mt-5 text-3xl">{titre}</h1>
      {contenu ? (
        <RichTexte data={contenu} className="mt-8 text-texte-doux" />
      ) : (
        <p className="mt-8 text-texte-doux">{vide}</p>
      )}
    </div>
  )
}
