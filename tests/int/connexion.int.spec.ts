import type { Payload } from 'payload'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { MAX_TENTATIVES } from '@/lib/auth/code'
import { demarrerConnexion, validerCode } from '@/lib/auth/connexion'

import { initPayload, viderCollections } from './helpers'

let payload: Payload

const MOT_DE_PASSE = 'mot-de-passe-de-test'
const EMAIL = 'patron@topcar33.example'

async function creerCompte() {
  return payload.create({ collection: 'users', data: { email: EMAIL, password: MOT_DE_PASSE } })
}

async function activerDoubleAuth(actif: boolean) {
  await payload.updateGlobal({ slug: 'securite', data: { doubleAuth: actif } })
}

/** Récupère le code à 6 chiffres dans le mail que le site vient d'envoyer. */
function codeDuMail(envoi: { mock: { calls: [{ text?: unknown }][] } }): string {
  const texte = String(envoi.mock.calls[0][0].text ?? '')
  const trouve = /\b(\d{6})\b/.exec(texte)
  if (!trouve) throw new Error(`Aucun code dans le mail : ${texte}`)
  return trouve[1]
}

describe('Connexion en deux temps', () => {
  beforeAll(async () => {
    payload = await initPayload()
  })

  beforeEach(async () => {
    await viderCollections(payload, ['users'])
    await creerCompte()
    await activerDoubleAuth(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sans double authentification, ouvre la session tout de suite', async () => {
    const resultat = await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })

    expect(resultat.statut).toBe('succes')
    expect(resultat).toMatchObject({ jeton: expect.stringMatching(/.+/) })
  })

  it('refuse un mauvais mot de passe sans rien envoyer', async () => {
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    const resultat = await demarrerConnexion(payload, { email: EMAIL, motDePasse: 'pas-le-bon' })

    expect(resultat).toEqual({ statut: 'invalide' })
    expect(envoi).not.toHaveBeenCalled()
  })

  it('avec double authentification, n’ouvre pas de session et envoie un code', async () => {
    await activerDoubleAuth(true)
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    const resultat = await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })

    expect(resultat.statut).toBe('code-envoye')
    expect(resultat).not.toHaveProperty('jeton')
    expect(envoi).toHaveBeenCalledTimes(1)
    expect(envoi.mock.calls[0][0]).toMatchObject({ to: EMAIL })
    expect(codeDuMail(envoi)).toMatch(/^\d{6}$/)
  })

  it('si le mail ne part pas, aucune attente ne reste en travers', async () => {
    await activerDoubleAuth(true)
    vi.spyOn(payload, 'sendEmail').mockRejectedValue(new Error('SMTP en panne'))
    vi.spyOn(payload.logger, 'error').mockImplementation(() => payload.logger)

    const resultat = await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })

    expect(resultat).toEqual({ statut: 'erreur-envoi' })
    const { docs } = await payload.find({ collection: 'users', depth: 0, showHiddenFields: true })
    expect(docs[0].identifiantAttente ?? null).toBeNull()
    expect(docs[0].jetonEnAttente ?? null).toBeNull()
  })

  it('le code n’est jamais enregistré en clair', async () => {
    await activerDoubleAuth(true)
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })

    const code = codeDuMail(envoi)
    const { docs } = await payload.find({ collection: 'users', depth: 0, showHiddenFields: true })
    expect(JSON.stringify(docs[0])).not.toContain(code)
  })

  it('le bon code ouvre la session et efface l’attente', async () => {
    await activerDoubleAuth(true)
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    const debut = await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })
    if (debut.statut !== 'code-envoye') throw new Error('code attendu')

    const resultat = await validerCode(payload, { identifiant: debut.identifiant, code: codeDuMail(envoi) })

    expect(resultat.statut).toBe('succes')
    expect(resultat).toMatchObject({ jeton: expect.stringMatching(/.+/) })
    const { docs } = await payload.find({ collection: 'users', depth: 0, showHiddenFields: true })
    expect(docs[0].identifiantAttente ?? null).toBeNull()
    expect(docs[0].jetonEnAttente ?? null).toBeNull()
  })

  it('un mauvais code est refusé et compte un essai', async () => {
    await activerDoubleAuth(true)
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    const debut = await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })
    if (debut.statut !== 'code-envoye') throw new Error('code attendu')

    const resultat = await validerCode(payload, { identifiant: debut.identifiant, code: '000000' })

    expect(resultat).toEqual({ statut: 'code-invalide', essaisRestants: MAX_TENTATIVES - 1 })
  })

  it('après trop d’essais, le code est annulé', async () => {
    await activerDoubleAuth(true)
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    const debut = await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })
    if (debut.statut !== 'code-envoye') throw new Error('code attendu')

    let dernier
    for (let essai = 0; essai < MAX_TENTATIVES; essai += 1) {
      dernier = await validerCode(payload, { identifiant: debut.identifiant, code: '000000' })
    }

    expect(dernier).toEqual({ statut: 'trop-essais' })
    const { docs } = await payload.find({ collection: 'users', depth: 0, showHiddenFields: true })
    expect(docs[0].identifiantAttente ?? null).toBeNull()
  })

  it('un code périmé est refusé', async () => {
    await activerDoubleAuth(true)
    const envoi = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    const debut = await demarrerConnexion(payload, { email: EMAIL, motDePasse: MOT_DE_PASSE })
    if (debut.statut !== 'code-envoye') throw new Error('code attendu')
    const { docs } = await payload.find({ collection: 'users', depth: 0 })
    await payload.update({
      collection: 'users',
      id: docs[0].id,
      data: { codeAuthExpiration: new Date(Date.now() - 1000).toISOString() },
    })

    const resultat = await validerCode(payload, { identifiant: debut.identifiant, code: codeDuMail(envoi) })

    expect(resultat).toEqual({ statut: 'expire' })
  })

  it('un identifiant d’attente inconnu ne donne aucune session', async () => {
    const resultat = await validerCode(payload, { identifiant: 'inexistant', code: '123456' })
    expect(resultat).toEqual({ statut: 'expire' })
  })

  it('la porte de service est fermée : connexion directe refusée quand la 2FA est active', async () => {
    await activerDoubleAuth(true)

    await expect(
      payload.login({ collection: 'users', data: { email: EMAIL, password: MOT_DE_PASSE } }),
    ).rejects.toThrow(/double authentification/i)
  })
})
