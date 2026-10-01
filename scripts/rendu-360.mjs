/**
 * Transforme un modèle 3D en une série d'images pour le tour à 360° du site.
 *
 * Pourquoi passer par des images plutôt que par de la 3D en direct : un modèle
 * de studio pèse plusieurs dizaines de méga-octets et demande une bibliothèque
 * 3D dans le navigateur du visiteur. Ici, le calcul est fait une fois sur ce PC,
 * et le site ne sert que des photos — légères, et affichables partout.
 *
 * Usage :
 *   node scripts/rendu-360.mjs <dossier-contenant-le-.obj> [vues] [motif-décor]
 *
 * Exemple :
 *   node scripts/rendu-360.mjs "C:/.../3D Models" 36 "^(Ground|LightSource)"
 *
 * Le motif sert à écarter le décor du fichier (sol, panneaux d'éclairage) :
 * sans lui, le cadrage se fait sur une scène vide et la voiture paraît minuscule.
 * Les images sortent dans `rendu-360/`, à verser ensuite dans le champ
 * « Tour à 360° » de la fiche voiture.
 */
import { createReadStream, mkdirSync, readdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'
import { chromium } from 'playwright'

const [dossierModele, nombreVues = '36', motifDecor = '^(Ground|LightSource)'] = process.argv.slice(2)
if (!dossierModele) {
  console.error('Indiquez le dossier contenant le fichier .obj.')
  process.exit(1)
}

const VUES = Number(nombreVues)
const SORTIE = 'rendu-360'
const TYPES = { '.html': 'text/html', '.obj': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg' }

const obj = readdirSync(dossierModele).find((nom) => nom.toLowerCase().endsWith('.obj'))
if (!obj) {
  console.error(`Aucun fichier .obj dans ${dossierModele}`)
  process.exit(1)
}

mkdirSync(SORTIE, { recursive: true })

// Un serveur local : un navigateur refuse de charger un modèle depuis le disque.
const racines = { '/modele/': resolve(dossierModele), '/': resolve('scripts') }
const serveur = createServer((requete, reponse) => {
  const url = decodeURIComponent(requete.url.split('?')[0])
  const prefixe = url.startsWith('/modele/') ? '/modele/' : '/'
  const chemin = join(racines[prefixe], url.slice(prefixe.length))
  try {
    statSync(chemin)
  } catch {
    reponse.writeHead(404).end('introuvable')
    return
  }
  reponse.writeHead(200, { 'content-type': TYPES[extname(chemin)] || 'application/octet-stream' })
  createReadStream(chemin).pipe(reponse)
})
await new Promise((resoudre) => serveur.listen(4173, resoudre))

const navigateur = await chromium.launch()
const page = await navigateur.newPage({ viewport: { width: 900, height: 675 } })

const adresse = `http://localhost:4173/rendu-360.html?modele=/modele/${encodeURIComponent(obj)}&decor=${encodeURIComponent(motifDecor)}`
console.log(`Chargement de ${obj}…`)
await page.goto(adresse)
await page.waitForFunction(() => window.modelePret || window.modeleErreur, null, { timeout: 180_000 })

const erreur = await page.evaluate(() => window.modeleErreur)
if (erreur) {
  console.error('Chargement impossible :', erreur)
  await navigateur.close()
  serveur.close()
  process.exit(1)
}

const toile = page.locator('canvas')
for (let index = 0; index < VUES; index += 1) {
  await page.evaluate((degres) => window.rendreVue(degres), (index * 360) / VUES)
  await toile.screenshot({ path: `${SORTIE}/vue-${String(index).padStart(2, '0')}.png` })
}

console.log(`${VUES} vues écrites dans ${SORTIE}/`)
await navigateur.close()
serveur.close()
