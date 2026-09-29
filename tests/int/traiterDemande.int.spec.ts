import type { Payload } from 'payload'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { LIMITE_PAR_HEURE } from '@/lib/demandes/limite'
import { traiterDemande } from '@/lib/demandes/traiterDemande'

import { creerVoiture, initPayload, vieillirDemandes, viderCollections } from './helpers'

let payload: Payload

const URL_SITE = 'http://site.test'
const IP = '88.120.5.7'

const brutValide = (surcharges: Record<string, string> = {}) => ({
  prenom: 'Jean',
  nom: 'Dupont',
  email: 'jean@exemple.fr',
  telephone: '06 12 34 56 78',
  rue: '3 rue des Lilas',
  codePostal: '33000',
  ville: 'Bordeaux',
  voiture: '',
  message: 'Bonjour, est-elle libre samedi ?',
  website: '',
  ...surcharges,
})

describe('traiterDemande', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['demandes', 'voitures', 'marques', 'categories', 'media'])
    await payload.updateGlobal({
      slug: 'agence',
      data: {
        nom: 'TopCar33',
        telephone: '05 00 00 00 00',
        emailPublic: 'contact@topcar33.example',
      },
    })
    await payload.updateGlobal({
      slug: 'mails',
      data: { destinataires: [{ email: 'demandes@topcar33.example' }], copieCachee: null, limiteParHeure: null },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('enregistre la demande, envoie les 2 mails et note les envois', async () => {
    const voiture = await creerVoiture(payload)
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    const resultat = await traiterDemande(payload, brutValide({ voiture: voiture.slug ?? '' }), { urlSite: URL_SITE })

    expect(resultat).toEqual({ statut: 'succes', prenom: 'Jean' })
    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({
      titre: 'Jean Dupont',
      voiture: voiture.id,
      statut: 'nouvelle',
      mailAgenceEnvoye: true,
      mailClientEnvoye: true,
    })

    expect(envoi).toHaveBeenCalledTimes(2)
    const [versAgence, versClient] = envoi.mock.calls.map(([options]) => options)
    expect(versAgence).toMatchObject({
      to: ['demandes@topcar33.example'],
      replyTo: 'jean@exemple.fr',
      subject: 'Nouvelle demande de location — Jean Dupont (Peugeot 208)',
    })
    expect(String(versAgence.html)).toContain(`${URL_SITE}/admin/collections/demandes/${docs[0].id}`)
    expect(versClient).toMatchObject({
      to: 'jean@exemple.fr',
      subject: 'Votre demande a bien été reçue — TopCar33',
    })
  })

  it('enregistre la nature de la demande selon l’offre de la voiture', async () => {
    const aVendre = await creerVoiture(payload, { offre: 'vente', marque: 'Peugeot', modele: '308' })
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await traiterDemande(payload, brutValide({ voiture: aVendre.slug ?? '' }), { urlSite: URL_SITE })

    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0].nature).toBe('vente')
    expect(envoi.mock.calls[0][0]).toMatchObject({
      subject: 'Nouvelle demande d’achat — Jean Dupont (Peugeot 308)',
    })
  })

  it('une demande sans voiture est une question générale', async () => {
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await traiterDemande(payload, brutValide(), { urlSite: URL_SITE })

    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0].nature).toBe('generale')
  })

  it('garde la demande si le mail à l’agence échoue', async () => {
    vi.spyOn(payload, 'sendEmail')
      .mockRejectedValueOnce(new Error('SMTP en panne'))
      .mockResolvedValueOnce(undefined)

    const resultat = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE })

    expect(resultat.statut).toBe('succes')
    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0]).toMatchObject({ mailAgenceEnvoye: false, mailClientEnvoye: true })
  })

  it('envoie à tous les destinataires réglés, avec la copie cachée', async () => {
    await payload.updateGlobal({
      slug: 'mails',
      data: {
        destinataires: [{ email: 'demandes@topcar33.example' }, { email: 'gerant@topcar33.example' }],
        copieCachee: 'archive@topcar33.example',
      },
    })
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await traiterDemande(payload, brutValide(), { urlSite: URL_SITE })

    expect(envoi.mock.calls[0][0]).toMatchObject({
      to: ['demandes@topcar33.example', 'gerant@topcar33.example'],
      bcc: 'archive@topcar33.example',
    })
    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0]).toMatchObject({ mailAgenceEnvoye: true })
  })

  it('sans destinataire réglé, seul le client reçoit un mail', async () => {
    await payload.updateGlobal({ slug: 'mails', data: { destinataires: [] } })
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await traiterDemande(payload, brutValide(), { urlSite: URL_SITE })

    expect(envoi).toHaveBeenCalledTimes(1)
    expect(envoi.mock.calls[0][0]).toMatchObject({ to: 'jean@exemple.fr' })
    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0]).toMatchObject({ mailAgenceEnvoye: false, mailClientEnvoye: true })
  })

  it('refuse la 11ᵉ demande de la même adresse dans l’heure', async () => {
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    for (let index = 0; index < LIMITE_PAR_HEURE; index += 1) {
      const resultat = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })
      expect(resultat.statut).toBe('succes')
    }
    envoi.mockClear()

    const refus = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })

    expect(refus.statut).toBe('erreur')
    expect(refus).toMatchObject({ message: expect.stringContaining('10 demandes') })
    expect((await payload.count({ collection: 'demandes' })).totalDocs).toBe(LIMITE_PAR_HEURE)
    expect(envoi).not.toHaveBeenCalled()
  })

  it('suit la limite réglée dans le back-office', async () => {
    await payload.updateGlobal({ slug: 'mails', data: { limiteParHeure: 3 } })
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    for (let index = 0; index < 3; index += 1) {
      const resultat = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })
      expect(resultat.statut).toBe('succes')
    }

    const refus = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })

    expect(refus).toMatchObject({ statut: 'erreur', message: expect.stringContaining('3 demandes') })
  })

  it('revient à 10 quand le réglage est vide', async () => {
    await payload.updateGlobal({ slug: 'mails', data: { limiteParHeure: null } })
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    for (let index = 0; index < LIMITE_PAR_HEURE; index += 1) {
      await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })
    }

    const refus = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })

    expect(refus).toMatchObject({ statut: 'erreur', message: expect.stringContaining('10 demandes') })
  })

  it('n’enregistre jamais l’adresse en clair, seulement son empreinte', async () => {
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })

    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0].empreinteIp).toMatch(/^[0-9a-f]{32}$/)
    expect(JSON.stringify(docs[0])).not.toContain(IP)
  })

  it('une autre adresse garde son propre quota', async () => {
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    for (let index = 0; index < LIMITE_PAR_HEURE; index += 1) {
      await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })
    }

    const voisin = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: '88.120.5.8' })

    expect(voisin.statut).toBe('succes')
  })

  it('oublie les demandes de plus d’une heure', async () => {
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    for (let index = 0; index < LIMITE_PAR_HEURE; index += 1) {
      await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })
    }
    await vieillirDemandes(payload, 61)

    const resultat = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE, ip: IP })

    expect(resultat.statut).toBe('succes')
  })

  it('sans adresse connue, la limite ne s’applique pas', async () => {
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    const avertissement = vi.spyOn(payload.logger, 'warn').mockImplementation(() => payload.logger)
    for (let index = 0; index < LIMITE_PAR_HEURE + 1; index += 1) {
      await traiterDemande(payload, brutValide(), { urlSite: URL_SITE })
    }

    expect((await payload.count({ collection: 'demandes' })).totalDocs).toBe(LIMITE_PAR_HEURE + 1)
    expect(avertissement).toHaveBeenCalled()
  })

  it('champ piège rempli : répond « succès » sans rien enregistrer ni envoyer', async () => {
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    const resultat = await traiterDemande(payload, brutValide({ website: 'http://spam.test' }), { urlSite: URL_SITE })

    expect(resultat).toEqual({ statut: 'succes', prenom: 'Jean' })
    expect((await payload.count({ collection: 'demandes' })).totalDocs).toBe(0)
    expect(envoi).not.toHaveBeenCalled()
  })

  it('données invalides : renvoie les erreurs par champ sans rien enregistrer', async () => {
    const resultat = await traiterDemande(payload, brutValide({ email: 'pas-un-email', prenom: '' }), {
      urlSite: URL_SITE,
    })

    expect(resultat).toEqual({
      statut: 'invalide',
      erreurs: { prenom: 'Indiquez votre prénom', email: 'Adresse email invalide' },
    })
    expect((await payload.count({ collection: 'demandes' })).totalDocs).toBe(0)
  })

  it('voiture inconnue : la demande devient une question générale', async () => {
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await traiterDemande(payload, brutValide({ voiture: 'voiture-inexistante' }), { urlSite: URL_SITE })

    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0].voiture ?? null).toBeNull()
  })

  it('enregistrement impossible : message d’erreur avec le téléphone de l’agence', async () => {
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    vi.spyOn(payload, 'create').mockRejectedValueOnce(new Error('base indisponible'))

    const resultat = await traiterDemande(payload, brutValide(), { urlSite: URL_SITE })

    expect(resultat).toEqual({
      statut: 'erreur',
      message: 'Une erreur est survenue. Réessayez ou appelez-nous au 05 00 00 00 00.',
    })
    expect(envoi).not.toHaveBeenCalled()
  })
})
