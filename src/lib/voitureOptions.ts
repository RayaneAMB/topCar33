export type OptionListe = { label: string; value: string }

export const BOITES: OptionListe[] = [
  { label: 'Manuelle', value: 'manuelle' },
  { label: 'Automatique', value: 'automatique' },
]

export const CARBURANTS: OptionListe[] = [
  { label: 'Essence', value: 'essence' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Hybride', value: 'hybride' },
  { label: 'Électrique', value: 'electrique' },
]

/** Libellé français d'une valeur de liste (« electrique » → « Électrique »). */
export function libelleOption(options: OptionListe[], valeur: string | null | undefined): string {
  return options.find((option) => option.value === valeur)?.label ?? valeur ?? ''
}
