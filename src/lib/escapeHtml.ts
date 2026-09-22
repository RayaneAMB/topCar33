const REMPLACEMENTS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Rend un texte saisi par un visiteur sans danger dans du HTML (mails). */
export function escapeHtml(valeur: unknown): string {
  return String(valeur ?? '').replace(/[&<>"']/g, (caractere) => REMPLACEMENTS[caractere])
}
