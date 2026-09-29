import { describe, expect, it, vi } from 'vitest'

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

  it('précise la nature de la demande dans l’objet', () => {
    expect(mailAgence({ ...demande, nature: 'location' }, URL_ADMIN).subject).toBe(
      'Nouvelle demande de location — Jean Dupont (Peugeot 208)',
    )
    expect(mailAgence({ ...demande, nature: 'vente', voiture: 'Peugeot 308' }, URL_ADMIN).subject).toBe(
      'Nouvelle demande d’achat — Jean Dupont (Peugeot 308)',
    )
  })

  it('indique « Question générale » quand aucune voiture n’est choisie', () => {
    const { subject, html } = mailAgence({ ...demande, voiture: undefined }, URL_ADMIN)
    expect(subject).toBe('Nouvelle demande — Jean Dupont')
    expect(html).toContain('Question générale')
  })

  it('joint le logo au mail et garde le nom en repli si les images sont bloquées', () => {
    const { html, attachments } = mailAgence(demande, URL_ADMIN, agence)
    expect(html).toContain('src="cid:logo-topcar33"')
    expect(html).toContain('alt="TopCar33"')
    expect(attachments?.[0]).toMatchObject({ cid: 'logo-topcar33', contentType: 'image/png' })
    expect(attachments?.[0].content.length).toBeGreaterThan(1000)
  })

  it('neutralise le HTML tapé par le client', () => {
    const { html } = mailAgence(
      { ...demande, prenom: '<script>alert(1)</script>', message: '<img src=x onerror=alert(1)>' },
      URL_ADMIN,
    )
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    // Les seules images du mail sont les nôtres : le logo et le titre.
    expect(html.match(/<img/g)).toHaveLength(2)
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

  it('déclare les polices du site, avec un repli pour les clients qui les refusent', () => {
    const { html } = mailClient(demande, agence)
    expect(html).toContain('@font-face')
    expect(html).toContain('/polices/montserrat-latin-wght-normal.woff2')
    expect(html).toContain('/polices/BankGothic-Bold.ttf')
    // Les URLs doivent être absolues : une boîte mail n'a pas de page de référence.
    expect(html).toMatch(/url\('https?:\/\/[^']+\/polices\//)
    // Repli présent partout où une police est posée.
    expect(html).toContain('Arial')
  })

  it('joint le même logo que le mail agence', () => {
    const { html, attachments } = mailClient(demande, agence)
    expect(html).toContain('src="cid:logo-topcar33"')
    expect(attachments?.[0]).toMatchObject({ cid: 'logo-topcar33', filename: 'logo-topcar33.png' })
  })

  it('avec MAIL_LOGO_URL, le logo est lié au lieu d’être joint', () => {
    vi.stubEnv('MAIL_LOGO_URL', 'https://topcar33.com/marque/logo-mail.png')
    const { html, attachments } = mailClient(demande, agence)
    expect(html).toContain('src="https://topcar33.com/marque/logo-mail.png"')
    expect(html).not.toContain('cid:logo-topcar33')
    // Le titre reste joint : lui n'a pas d'adresse publique.
    expect(attachments?.map(({ cid }) => cid)).toEqual(['titre-demande-bien-recue'])
    vi.unstubAllEnvs()
  })

  it('affiche le titre dans la police de la marque, en gardant le texte en repli', () => {
    const { html, attachments } = mailClient(demande, agence)
    expect(html).toContain('src="cid:titre-demande-bien-recue"')
    expect(html).toContain('alt="Demande bien reçue"')
    expect(attachments?.some(({ cid }) => cid === 'titre-demande-bien-recue')).toBe(true)
  })

  it('neutralise le HTML tapé par le client', () => {
    const { html } = mailClient({ ...demande, prenom: '<b>Jean</b>' }, agence)
    expect(html).toContain('Bonjour &lt;b&gt;Jean&lt;/b&gt;,')
  })
})
