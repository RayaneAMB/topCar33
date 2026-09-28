import type { Payload } from 'payload'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { traiterDemande } from '@/lib/demandes/traiterDemande'

import { creerVoiture, initPayload, viderCollections } from './helpers'

let payload: Payload

const URL_SITE = 'http://site.test'

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
    await viderCollections(payload, ['demandes', 'voitures', 'categories', 'media'])
    await payload.updateGlobal({
      slug: 'agence',
      data: {
        nom: 'TopCar33',
        telephone: '05 00 00 00 00',
        emailPublic: 'contact@topcar33.example',
        emailDemandes: 'demandes@topcar33.example',
      },
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
      to: 'demandes@topcar33.example',
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

  it('sans « Email qui reçoit les demandes », seul le client reçoit un mail', async () => {
    await payload.updateGlobal({ slug: 'agence', data: { emailDemandes: null } })
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await traiterDemande(payload, brutValide(), { urlSite: URL_SITE })

    expect(envoi).toHaveBeenCalledTimes(1)
    expect(envoi.mock.calls[0][0]).toMatchObject({ to: 'jean@exemple.fr' })
    const { docs } = await payload.find({ collection: 'demandes', depth: 0 })
    expect(docs[0]).toMatchObject({ mailAgenceEnvoye: false, mailClientEnvoye: true })
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
