export const CHAMPS_FORMULAIRE = [
  'prenom',
  'nom',
  'email',
  'telephone',
  'rue',
  'codePostal',
  'ville',
  'voiture',
  'message',
] as const

/** Champ invisible pour les humains : s'il est rempli, c'est un robot. */
export const CHAMP_PIEGE = 'website'

export type ChampFormulaire = (typeof CHAMPS_FORMULAIRE)[number]
export type ValeursFormulaire = Partial<Record<ChampFormulaire, string>>
export type ErreursChamps = Partial<Record<ChampFormulaire, string>>

export type EtatFormulaire =
  | { statut: 'initial' }
  | { statut: 'succes'; prenom: string }
  | { statut: 'invalide'; erreurs: ErreursChamps; valeurs: ValeursFormulaire }
  | { statut: 'erreur'; message: string; valeurs: ValeursFormulaire }

export const ETAT_INITIAL: EtatFormulaire = { statut: 'initial' }

/** Lit les champs envoyés par le navigateur (champ piège compris), toujours en chaînes. */
export function lireFormulaire(formData: FormData): Record<string, string> {
  const brut: Record<string, string> = {}
  for (const champ of [...CHAMPS_FORMULAIRE, CHAMP_PIEGE]) {
    const valeur = formData.get(champ)
    brut[champ] = typeof valeur === 'string' ? valeur : ''
  }
  return brut
}

/** Valeurs à réafficher dans le formulaire après une erreur (sans le champ piège). */
export function valeursAAfficher(brut: Record<string, string>): ValeursFormulaire {
  const valeurs: ValeursFormulaire = {}
  for (const champ of CHAMPS_FORMULAIRE) valeurs[champ] = brut[champ] ?? ''
  return valeurs
}
