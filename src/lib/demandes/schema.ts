import { z } from 'zod'

import type { ErreursChamps } from './formulaire'

const texteObligatoire = (messageVide: string, max: number) =>
  z
    .string({ error: messageVide })
    .trim()
    .min(1, { error: messageVide })
    .max(max, { error: `${max} caractères maximum` })

export const schemaDemande = z.object({
  prenom: texteObligatoire('Indiquez votre prénom', 100),
  nom: texteObligatoire('Indiquez votre nom', 100),
  email: texteObligatoire('Indiquez votre email', 200).regex(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i, {
    error: 'Adresse email invalide',
  }),
  telephone: texteObligatoire('Indiquez votre téléphone', 30),
  rue: texteObligatoire('Indiquez votre adresse', 200),
  codePostal: texteObligatoire('Indiquez votre code postal', 10),
  ville: texteObligatoire('Indiquez votre ville', 100),
  voiture: z.string().trim().max(200).default(''),
  message: texteObligatoire('Écrivez votre message', 2000),
})

export type DonneesDemande = z.infer<typeof schemaDemande>

export type ResultatValidation = { ok: true; donnees: DonneesDemande } | { ok: false; erreurs: ErreursChamps }

/** Valide les données brutes du formulaire ; renvoie un seul message par champ en erreur. */
export function validerDemande(brut: Record<string, unknown>): ResultatValidation {
  const resultat = schemaDemande.safeParse(brut)
  if (resultat.success) return { ok: true, donnees: resultat.data }

  const erreurs: ErreursChamps = {}
  const { fieldErrors } = z.flattenError(resultat.error)
  for (const [champ, messages] of Object.entries(fieldErrors) as [keyof ErreursChamps, string[] | undefined][]) {
    if (messages?.[0]) erreurs[champ] = messages[0]
  }
  return { ok: false, erreurs }
}
