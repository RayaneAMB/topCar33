/** Contenu riche (Lexical) minimal : une suite de paragraphes de texte simple. */
export function paragraphes(...textes: string[]) {
  return {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: textes.map((texte) => ({
        type: 'paragraph',
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
        children: [{ type: 'text', text: texte, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  }
}
