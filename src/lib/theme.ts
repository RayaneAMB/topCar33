export const THEMES = ['systeme', 'clair', 'sombre'] as const
export type Theme = (typeof THEMES)[number]

/** Nom du cookie : lu par le serveur, écrit par le navigateur. */
export const CLE_THEME = 'topcar33-theme'

const UN_AN = 60 * 60 * 24 * 365

export function estUnTheme(valeur: unknown): valeur is Theme {
  return typeof valeur === 'string' && (THEMES as readonly string[]).includes(valeur)
}

/** Valeur de l'attribut `data-theme` : rien pour « systeme », qui laisse le CSS suivre l'appareil. */
export function attributTheme(theme: Theme): 'clair' | 'sombre' | undefined {
  return theme === 'systeme' ? undefined : theme
}

/** Applique le choix tout de suite et le retient pour les prochaines visites. */
export function enregistrerTheme(theme: Theme): void {
  const attribut = attributTheme(theme)
  if (attribut) {
    document.documentElement.setAttribute('data-theme', attribut)
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  document.cookie = `${CLE_THEME}=${theme};path=/;max-age=${UN_AN};samesite=lax`
}
