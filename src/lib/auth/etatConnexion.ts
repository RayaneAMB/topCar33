/**
 * État du formulaire de connexion, partagé entre le serveur et le navigateur.
 * À part des actions : un fichier « use server » ne peut exporter que des fonctions.
 */
export type EtatConnexion =
  | { etape: 'identifiants'; message?: string; email?: string }
  | { etape: 'code'; identifiant: string; email: string; message?: string }

export const ETAT_INITIAL: EtatConnexion = { etape: 'identifiants' }

/**
 * Où aller après une connexion réussie.
 * Payload ajoute `?redirect=/admin/...` quand il renvoie vers la connexion.
 * On n'accepte qu'un chemin interne à l'administration : sans ce filtre, un lien
 * piégé pourrait faire atterrir l'utilisateur sur un site extérieur après sa
 * connexion, en lui laissant croire qu'il est toujours chez lui.
 */
export function destinationSure(valeur: unknown): string {
  if (typeof valeur !== 'string') return '/admin'
  if (!valeur.startsWith('/admin')) return '/admin'
  // « //ailleurs.test » et « /admin:… » ne sont pas des chemins internes.
  if (valeur.startsWith('//') || /[\\:]/.test(valeur)) return '/admin'
  return valeur
}
