// Pannellum n'est pas un module ES : son fichier s'exécute et s'enregistre sur
// `window.pannellum`. On décrit ici la petite partie de son API qu'on utilise.
declare module 'pannellum'

interface VisionneusePannellum {
  destroy(): void
  on(evenement: 'load', rappel: () => void): void
  on(evenement: 'error', rappel: (message: string) => void): void
}

interface Window {
  pannellum?: {
    viewer(conteneur: HTMLElement, reglages: Record<string, unknown>): VisionneusePannellum
  }
}
