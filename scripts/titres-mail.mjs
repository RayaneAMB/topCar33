/**
 * Génère les titres des mails en images, dans la police Bank Gothic.
 *
 * Pourquoi des images : Gmail (web, iOS, Android), Outlook Windows et Yahoo
 * suppriment les polices personnalisées. Une image est le seul moyen d'afficher
 * la police de la marque chez tout le monde. Chaque image garde son texte en
 * `alt`, lisible quand le destinataire bloque les images.
 *
 * À relancer si un libellé change : `node scripts/titres-mail.mjs`
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const TITRES = [
  'Nouvelle demande',
  'Nouvelle demande de location',
  'Nouvelle demande d’achat',
  'Demande bien reçue',
]

const DOSSIER = 'public/mail'
const ECHELLE = 2 // rendu en double pour les écrans à forte densité
const TAILLE = 21
const COULEUR = '#282d2e'

/** Même règle de nom que `slugTitre()` dans src/lib/demandes/emails.ts. */
function slug(texte) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const police = await readFile('public/polices/BankGothic-Bold.ttf')
const policeBase64 = police.toString('base64')

const page = `<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:'Bank Gothic';src:url(data:font/ttf;base64,${policeBase64}) format('truetype');font-weight:700}
  body{margin:0;background:transparent}
  span{display:inline-block;font-family:'Bank Gothic';font-size:${TAILLE}px;font-weight:700;
       letter-spacing:.06em;text-transform:uppercase;color:${COULEUR};white-space:nowrap;
       padding:2px 4px 4px 0;-webkit-font-smoothing:antialiased}
</style><span id="t"></span>`

await mkdir(DOSSIER, { recursive: true })
const navigateur = await chromium.launch()
const onglet = await navigateur.newPage({ deviceScaleFactor: ECHELLE })
await onglet.setContent(page)
await onglet.evaluate(() => document.fonts.ready)

for (const titre of TITRES) {
  await onglet.evaluate((texte) => {
    document.getElementById('t').textContent = texte
  }, titre)
  const image = await onglet.locator('#t').screenshot({ omitBackground: true })
  const chemin = `${DOSSIER}/titre-${slug(titre)}.png`
  await writeFile(chemin, image)
  console.log(`${chemin} (${image.length} octets)`)
}

await navigateur.close()
