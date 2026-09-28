'use server'

import { lireFormulaire, valeursAAfficher, type EtatFormulaire } from '@/lib/demandes/formulaire'
import { traiterDemande } from '@/lib/demandes/traiterDemande'
import { getPayloadClient } from '@/lib/donnees'

export async function envoyerDemande(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const brut = lireFormulaire(formData)
  const resultat = await traiterDemande(await getPayloadClient(), brut)

  if (resultat.statut === 'succes') return { statut: 'succes', prenom: resultat.prenom }
  if (resultat.statut === 'invalide') {
    return { statut: 'invalide', erreurs: resultat.erreurs, valeurs: valeursAAfficher(brut) }
  }
  return { statut: 'erreur', message: resultat.message, valeurs: valeursAAfficher(brut) }
}
