/**
 * Les entrées du menu principal, partagées par la navigation large et le menu
 * déroulant : une seule liste, pour qu'ajouter une page ne l'ajoute pas qu'à
 * moitié. « Nous contacter » n'en fait pas partie — c'est un bouton d'action,
 * placé et habillé différemment dans chacun des deux menus.
 */
export const LIENS_MENU = [
  { href: '/location', libelle: 'À louer' },
  { href: '/vente', libelle: 'À vendre' },
] as const

/**
 * Le lien du menu qui correspond à la page affichée.
 *
 * On compare des chemins, jamais l'URL entière : les filtres du catalogue
 * voyagent en query (`/location?categorie=suv`), et « À louer » doit rester
 * allumé quand le visiteur filtre. `usePathname()` livre déjà le chemin nu.
 */
export function estPageCourante(chemin: string, href: string): boolean {
  if (chemin === href) return true
  // Une page en dessous allume son parent — mais `/ventes` ne doit pas allumer
  // `/vente`, d'où la barre oblique exigée juste après.
  return href !== '/' && chemin.startsWith(`${href}/`)
}
