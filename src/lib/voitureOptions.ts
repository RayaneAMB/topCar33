export type OptionListe = { label: string; value: string }

/** Une voiture est soit à louer, soit à vendre : c'est ce choix qui commande prix et affichage. */
export const OFFRES: OptionListe[] = [
  { label: 'À louer', value: 'location' },
  { label: 'À vendre', value: 'vente' },
]

export const BOITES: OptionListe[] = [
  { label: 'Manuelle', value: 'manuelle' },
  { label: 'Automatique', value: 'automatique' },
]

/**
 * Marques vendues en France. La valeur enregistrée est le nom de la marque,
 * donc l'affichage du site n'a rien à convertir.
 * Pour en ajouter une : ajoutez une ligne ici, puis `npm run generate:types`.
 */
export const MARQUES: OptionListe[] = [
  'Abarth',
  'Alfa Romeo',
  'Alpine',
  'Audi',
  'BMW',
  'BYD',
  'Chevrolet',
  'Citroën',
  'Cupra',
  'Dacia',
  'DS Automobiles',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Isuzu',
  'Iveco',
  'Jaguar',
  'Jeep',
  'Kia',
  'Land Rover',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'MG',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Polestar',
  'Porsche',
  'Renault',
  'Seat',
  'Škoda',
  'Smart',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
].map((marque) => ({ label: marque, value: marque }))

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
