import type { Field } from 'payload'

/**
 * Restreint le panneau « Filtres » de l'administration à quelques champs.
 *
 * Par défaut, Payload propose d'y filtrer sur *tous* les champs : le slug, les
 * photos, la description, l'empreinte anti-spam… Trente entrées dont trois
 * servent. On inverse donc la logique : on nomme les champs filtrables, et tous
 * les autres sont retirés du panneau.
 *
 * Seul le panneau de filtres est touché. Les champs restent modifiables dans la
 * fiche, et restent des colonnes affichables.
 *
 * Les champs de présentation — `row`, `collapsible`, `tabs` — n'ont pas de nom
 * propre : on les traverse pour atteindre ceux qu'ils contiennent.
 */
export function limiterFiltres(champs: Field[], filtrables: string[]): Field[] {
  return champs.map((champ) => traiter(champ, new Set(filtrables)))
}

function traiter(champ: Field, filtrables: Set<string>): Field {
  // Un conteneur : on descend, sans rien décider pour lui-même.
  if ('fields' in champ && Array.isArray(champ.fields)) {
    return { ...champ, fields: champ.fields.map((enfant) => traiter(enfant, filtrables)) }
  }

  if ('tabs' in champ && Array.isArray(champ.tabs)) {
    return {
      ...champ,
      tabs: champ.tabs.map((onglet) => ({
        ...onglet,
        fields: onglet.fields.map((enfant) => traiter(enfant, filtrables)),
      })),
    }
  }

  // Sans nom (`ui`, séparateurs), il n'y a rien à filtrer.
  if (!('name' in champ) || typeof champ.name !== 'string') return champ
  if (filtrables.has(champ.name)) return champ

  return { ...champ, admin: { ...champ.admin, disableListFilter: true } } as Field
}
