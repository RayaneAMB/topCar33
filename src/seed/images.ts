import sharp from 'sharp'

export type Silhouette = 'citadine' | 'suv' | 'utilitaire'

type Carrosserie = { corps: string; vitres: string; roues: [number, number]; rayon: number; hauteurRoues: number }

const CARROSSERIES: Record<Silhouette, Carrosserie> = {
  citadine: {
    corps: 'M8 34 L8 26 Q8 21 14 20 L26 19 Q34 9 46 8 L70 8 Q80 8 88 18 L104 21 Q112 23 112 29 L112 34 Z',
    vitres: 'M30 18 Q37 11 46 11 L56 11 L56 18 Z M59 11 L69 11 Q77 11 83 18 L59 18 Z',
    roues: [28, 92],
    rayon: 7,
    hauteurRoues: 34,
  },
  suv: {
    corps: 'M6 36 L6 22 Q6 17 12 16 L22 15 Q28 5 40 5 L76 5 Q86 5 92 14 L106 17 Q114 19 114 26 L114 36 Z',
    vitres: 'M26 14 Q31 8 40 8 L56 8 L56 14 Z M59 8 L75 8 Q83 8 88 14 L59 14 Z',
    roues: [28, 94],
    rayon: 8,
    hauteurRoues: 36,
  },
  utilitaire: {
    corps: 'M6 36 L6 8 Q6 4 10 4 L78 4 Q86 4 92 12 L104 18 Q112 20 112 26 L112 36 Z',
    vitres: 'M79 8 L85 8 Q89 9 92 14 L79 14 Z',
    roues: [26, 94],
    rayon: 8,
    hauteurRoues: 36,
  },
}

/** Image PNG 1600×1000 « Photo temporaire » avec une silhouette de voiture. */
export async function imageVoiture(silhouette: Silhouette, couleur: string): Promise<Buffer> {
  const carrosserie = CARROSSERIES[silhouette]
  const roue = (cx: number) =>
    `<circle cx="${cx}" cy="${carrosserie.hauteurRoues}" r="${carrosserie.rayon}" fill="#111"/>` +
    `<circle cx="${cx}" cy="${carrosserie.hauteurRoues}" r="${carrosserie.rayon * 0.45}" fill="#888"/>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 160 100">
  <defs><linearGradient id="fond" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22252b"/><stop offset="1" stop-color="#101114"/></linearGradient></defs>
  <rect width="160" height="100" fill="url(#fond)"/>
  <g transform="translate(20 26)">
    <path d="${carrosserie.corps}" fill="${couleur}"/>
    <path d="${carrosserie.vitres}" fill="#ffffff" fill-opacity="0.35"/>
    ${roue(carrosserie.roues[0])}${roue(carrosserie.roues[1])}
  </g>
  <text x="80" y="90" font-family="Arial, sans-serif" font-size="5" fill="#8b9096" text-anchor="middle">Photo temporaire</text>
</svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}
