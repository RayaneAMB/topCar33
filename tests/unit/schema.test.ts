import { describe, expect, it } from 'vitest'

import { validerDemande } from '@/lib/demandes/schema'

const valide = {
  prenom: ' Jean ',
  nom: 'Dupont',
  email: 'jean@exemple.fr',
  telephone: '06 12 34 56 78',
  rue: '3 rue des Lilas',
  codePostal: '33000',
  ville: 'Bordeaux',
  voiture: 'peugeot-208',
  message: 'Bonjour',
}

describe('validerDemande', () => {
  it('accepte une demande valide et retire les espaces autour', () => {
    expect(validerDemande(valide)).toEqual({ ok: true, donnees: { ...valide, prenom: 'Jean' } })
  })

  it('la voiture est facultative', () => {
    const { voiture: _voiture, ...sansVoiture } = valide
    const resultat = validerDemande(sansVoiture)
    expect(resultat.ok && resultat.donnees.voiture).toBe('')
  })

  it('signale chaque champ obligatoire manquant', () => {
    expect(validerDemande({})).toEqual({
      ok: false,
      erreurs: {
        prenom: 'Indiquez votre prénom',
        nom: 'Indiquez votre nom',
        email: 'Indiquez votre email',
        telephone: 'Indiquez votre téléphone',
        rue: 'Indiquez votre adresse',
        codePostal: 'Indiquez votre code postal',
        ville: 'Indiquez votre ville',
        message: 'Écrivez votre message',
      },
    })
  })

  it('un champ rempli d’espaces compte comme vide', () => {
    const resultat = validerDemande({ ...valide, prenom: '   ' })
    expect(resultat).toEqual({ ok: false, erreurs: { prenom: 'Indiquez votre prénom' } })
  })

  it('refuse un email invalide', () => {
    const resultat = validerDemande({ ...valide, email: 'pas-un-email' })
    expect(resultat).toEqual({ ok: false, erreurs: { email: 'Adresse email invalide' } })
  })

  it('refuse un message de plus de 2000 caractères', () => {
    const resultat = validerDemande({ ...valide, message: 'a'.repeat(2001) })
    expect(resultat).toEqual({ ok: false, erreurs: { message: '2000 caractères maximum' } })
  })
})
