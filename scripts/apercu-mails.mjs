/**
 * Aperçu local des mails, sans rien envoyer : chaque mail est écrit en .html,
 * prêt à ouvrir au navigateur. Pratique pour voir un changement de mise en page.
 *
 * Usage : node --import=tsx/esm scripts/apercu-mails.mjs [dossier-de-sortie]
 *
 * Le "cid:" du logo ne veut rien dire pour un navigateur : il est réécrit vers
 * un fichier voisin, logo-apercu.png, à copier depuis public/marque/logo-mail.png.
 */
import { writeFileSync } from 'node:fs'
import { mailAgence, mailClient, mailCodeConnexion } from '../src/lib/demandes/emails.ts'

const sortie = process.argv[2] || '.'
const demande = {
  prenom: 'Camille', nom: 'Durand', email: 'camille.durand@example.com',
  telephone: '06 12 34 56 78', rue: '12 rue des Lilas', codePostal: '33185', ville: 'Le Haillan',
  message: 'Bonjour,\nLa Clio est-elle disponible le week-end du 12 ?\nMerci.',
  voiture: 'Renault Clio', nature: 'location',
}
const agence = {
  nom: 'TopCar33', telephone: '05 00 00 00 00', emailPublic: 'contact@topcar33.com',
  adresse: '296 avenue Pasteur, 33185 Le Haillan',
  horaires: [{ jours: 'Lundi – Vendredi', heures: '9h – 19h' }],
}

for (const [nom, mail] of [
  ['agence', mailAgence(demande, 'http://localhost:3000/admin', agence)],
  ['client', mailClient(demande, agence)],
  ['code', mailCodeConnexion('482913', 'TopCar33')],
]) {
  // Le `cid:` ne veut rien dire pour un navigateur : on le pointe sur le fichier.
  const html = mail.html.replace(/cid:logo-topcar33/g, 'logo-apercu.png')
  writeFileSync(`${sortie}/mail-${nom}.html`, html)
  console.log(`mail-${nom}.html — objet : ${mail.subject}`)
  console.log(`   pièces jointes : ${(mail.attachments ?? []).map((p) => p.filename).join(', ') || 'aucune'}`)
}
