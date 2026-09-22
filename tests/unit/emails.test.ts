import { describe, expect, it } from 'vitest'

import { mailAgence, mailClient, type AgenceMail, type DemandeMail } from '@/lib/demandes/emails'

const demande: DemandeMail = {
  id: 'd1',
  prenom: 'Jean',
  nom: 'Dupont',
  email: 'jean@exemple.fr',
  telephone: '06 12 34 56 78',
  rue: '3 rue des Lilas',
  codePostal: '33000',
  ville: 'Bordeaux',
  message: 'Bonjour,\nest-elle libre samedi ?',
  voiture: 'Peugeot 208',
}

const agence: AgenceMail = {
  nom: 'TopCar33',
  telephone: '05 00 00 00 00',
  emailPublic: 'contact@topcar33.example',
  adresse: '1 rue de l’Exemple, 33000 Bordeaux',
  horaires: [{ jours: 'Lundi – Vendredi', heures: '9h – 19h' }],
}

const URL_ADMIN = 'http://site.test/admin/collections/demandes/d1'

describe('mailAgence', () => {
  it('met le nom du client et la voiture dans l’objet', () => {
    expect(mailAgence(demande, URL_ADMIN).subject).toBe('Nouvelle demande — Jean Dupont (Peugeot 208)')
  })

  it('contient toutes les informations et le lien vers l’administration', () => {
    const { html, text } = mailAgence(demande, URL_ADMIN)
    for (const attendu of ['jean@exemple.fr', '06 12 34 56 78', '3 rue des Lilas, 33000 Bordeaux', 'Peugeot 208', URL_ADMIN]) {
      expect(html).toContain(attendu)
      expect(text).toContain(attendu)
    }
    expect(html).toContain('Bonjour,<br>est-elle libre samedi ?')
    expect(text).toContain('Bonjour,\nest-elle libre samedi ?')
  })

  it('indique « Question générale » quand aucune voiture n’est choisie', () => {
    const { subject, html } = mailAgence({ ...demande, voiture: undefined }, URL_ADMIN)
    expect(subject).toBe('Nouvelle demande — Jean Dupont')
    expect(html).toContain('Question générale')
  })

  it('neutralise le HTML tapé par le client', () => {
    const { html } = mailAgence(
      { ...demande, prenom: '<script>alert(1)</script>', message: '<img src=x onerror=alert(1)>' },
      URL_ADMIN,
    )
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})

describe('mailClient', () => {
  it('a le nom de l’agence dans l’objet et salue le client par son prénom', () => {
    const { subject, html, text } = mailClient(demande, agence)
    expect(subject).toBe('Votre demande a bien été reçue — TopCar33')
    expect(html).toContain('Bonjour Jean,')
    expect(text).toContain('Bonjour Jean,')
  })

  it('rappelle la demande et les coordonnées de l’agence', () => {
    const { html, text } = mailClient(demande, agence)
    for (const attendu of ['Peugeot 208', '05 00 00 00 00', 'contact@topcar33.example', 'Lundi – Vendredi', '9h – 19h']) {
      expect(html).toContain(attendu)
      expect(text).toContain(attendu)
    }
  })

  it('ne contient aucun lien vers l’administration', () => {
    expect(mailClient(demande, agence).html).not.toContain('/admin')
  })

  it('neutralise le HTML tapé par le client', () => {
    const { html } = mailClient({ ...demande, prenom: '<b>Jean</b>' }, agence)
    expect(html).toContain('Bonjour &lt;b&gt;Jean&lt;/b&gt;,')
  })
})
