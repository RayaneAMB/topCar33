/**
 * Texte alternatif tiré du nom du fichier, quand l'agence n'en écrit pas :
 * « bmw-m5_competition (2).jpeg » → « bmw m5 competition (2) ».
 *
 * Le nom d'une photo de voiture dit déjà presque toujours ce qu'elle montre.
 * Mieux vaut ce texte qu'un champ obligatoire que personne ne remplit bien.
 */
export function texteDepuisNomFichier(nom: string | null | undefined): string {
  if (!nom) return 'Photo'
  const texte = nom
    .replace(/\.[^./]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return texte || 'Photo'
}
