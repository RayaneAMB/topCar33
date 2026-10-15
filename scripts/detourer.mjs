/**
 * Découpe le fond blanc des photos de voitures, pour tout un dossier.
 *
 * Depuis que la collection Média détoure à la volée, ce script sert surtout à
 * rattraper l'existant : photos versées avant l'automatisation, ou dossier
 * media restauré depuis une sauvegarde. Il reste sans danger à relancer — une
 * photo déjà détourée est ignorée.
 *
 * Usage : npm run detourer
 *
 * Passe par `tsx` (voir le script npm) : il partage son code avec la collection
 * Média, en TypeScript, que Node seul ne sait pas charger ici.
 */
import { readdir } from 'node:fs/promises'

import { detourerFichier, fichiersAffiches } from '../src/lib/images/detourerFichier.ts'

const DOSSIER = process.argv[2] || process.env.MEDIA_DIR || 'media'

const fichiers = fichiersAffiches(await readdir(DOSSIER))
let faits = 0

for (const nom of fichiers) {
  const produit = await detourerFichier(DOSSIER, nom)
  if (!produit) continue
  faits += 1
  console.log(`${nom} → ${produit}`)
}

console.log(faits === 0 ? 'Rien à détourer : tout est déjà fait.' : `${faits} photo(s) détourée(s).`)
