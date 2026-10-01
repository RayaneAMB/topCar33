/**
 * Fabrique de contenu riche (Lexical) pour le seed.
 *
 * Payload attend un arbre Lexical complet, où chaque nœud porte les mêmes
 * champs de service (`direction`, `format`, `indent`, `version`). Les écrire à
 * la main à chaque fois rendrait un texte long illisible : ces fabriques les
 * posent une fois pour toutes, et l'appelant ne décrit que le contenu.
 */

/** Champs de service communs à tout nœud Lexical. */
const SOCLE = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

/** Tout nœud Lexical se reconnaît à son type et à sa version ; le reste varie. */
type Noeud = { type: string; version: number; [cle: string]: unknown }

function morceauTexte(texte: string) {
  return { type: 'text', text: texte, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }
}

/** Un paragraphe de texte simple. */
export function paragraphe(texte: string): Noeud {
  return { type: 'paragraph', ...SOCLE, textFormat: 0, textStyle: '', children: [morceauTexte(texte)] }
}

/** Un sous-titre de section. `.contenu-riche h2` lui donne sa taille. */
export function titre2(texte: string): Noeud {
  return { type: 'heading', tag: 'h2', ...SOCLE, children: [morceauTexte(texte)] }
}

/** Une liste à puces. Chaque texte devient une puce. */
export function liste(...textes: string[]): Noeud {
  return {
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    ...SOCLE,
    children: textes.map((texte, index) => ({
      type: 'listitem',
      value: index + 1,
      ...SOCLE,
      children: [morceauTexte(texte)],
    })),
  }
}

/** Assemble des nœuds en un document prêt pour un champ `richText`. */
export function contenuRiche(...noeuds: Noeud[]) {
  return { root: { type: 'root', ...SOCLE, children: noeuds } }
}

/** Raccourci historique : un document fait uniquement de paragraphes. */
export function paragraphes(...textes: string[]) {
  return contenuRiche(...textes.map(paragraphe))
}
