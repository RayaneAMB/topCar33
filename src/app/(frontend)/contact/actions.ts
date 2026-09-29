'use server'

import { headers } from 'next/headers'

import { lireFormulaire, valeursAAfficher, type EtatFormulaire } from '@/lib/demandes/formulaire'
import { ipDuVisiteur } from '@/lib/demandes/limite'
import { traiterDemande } from '@/lib/demandes/traiterDemande'
import { getPayloadClient } from '@/lib/donnees'

export async function envoyerDemande(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const brut = lireFormulaire(formData)
  const ip = ipDuVisiteur(await headers())
  const resultat = await traiterDemande(await getPayloadClient(), brut, { ip })

  if (resultat.statut === 'succes') return { statut: 'succes', prenom: resultat.prenom }
  if (resultat.statut === 'invalide') {
    return { statut: 'invalide', erreurs: resultat.erreurs, valeurs: valeursAAfficher(brut) }
  }
  return { statut: 'erreur', message: resultat.message, valeurs: valeursAAfficher(brut) }
}
