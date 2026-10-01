/**
 * Découpe le fond blanc d'une photo de studio.
 *
 * Le principe : partir des bords et n'effacer que le blanc qui leur est relié.
 * Un blanc entouré de voiture — plaque d'immatriculation, reflet de pare-brise,
 * optique de phare — n'est jamais atteint, donc jamais troué.
 *
 * L'ombre portée n'est pas effacée d'un coup : sa transparence suit sa clarté,
 * ce qui lui laisse une fin douce au lieu d'une découpe visible.
 */

/** Au-dessus de cette clarté, un pixel de bord est considéré comme du fond. */
export const SEUIL_FOND = 200

export function masqueDetourage({
  pixels,
  largeur,
  hauteur,
  canaux,
  seuil = SEUIL_FOND,
}: {
  pixels: Uint8Array | Uint8ClampedArray | Buffer
  largeur: number
  hauteur: number
  canaux: number
  seuil?: number
}): Uint8Array {
  const total = largeur * hauteur
  const alpha = new Uint8Array(total).fill(255)
  const vu = new Uint8Array(total)
  const aVoir: number[] = []

  const clarte = (index: number) => {
    const base = index * canaux
    return Math.min(pixels[base], pixels[base + 1], pixels[base + 2])
  }

  const proposer = (index: number) => {
    if (vu[index]) return
    vu[index] = 1
    if (clarte(index) < seuil) return
    aVoir.push(index)
  }

  for (let x = 0; x < largeur; x += 1) {
    proposer(x)
    proposer((hauteur - 1) * largeur + x)
  }
  for (let y = 0; y < hauteur; y += 1) {
    proposer(y * largeur)
    proposer(y * largeur + largeur - 1)
  }

  const etendue = Math.max(255 - seuil, 1)

  while (aVoir.length > 0) {
    const index = aVoir.pop() as number
    // Plus le pixel est clair, plus il s'efface. La courbe est accentuée pour que
    // l'ombre de studio parte aussi : gardée telle quelle, elle formerait une
    // tache claire sous la voiture sur un fond sombre.
    const rapport = Math.max(0, Math.min(1, (255 - clarte(index)) / etendue))
    alpha[index] = Math.round(255 * rapport ** 2.2)

    const x = index % largeur
    const y = (index - x) / largeur
    if (x > 0) proposer(index - 1)
    if (x < largeur - 1) proposer(index + 1)
    if (y > 0) proposer(index - largeur)
    if (y < hauteur - 1) proposer(index + largeur)
  }

  return alpha
}

/** L'adresse de la version détourée d'une photo, par convention de nommage. */
export function urlDetouree(url: string): string {
  return `${url.replace(/\.[^./]+$/, '')}-detoure.png`
}
