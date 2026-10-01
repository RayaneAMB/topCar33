import type { GlobalConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'

/**
 * Décor du site : la voiture qui tourne en fond de page au fil du défilement.
 *
 * Volontairement séparé du catalogue. Le décor n'est pas un véhicule à louer ni
 * à vendre : le mettre dans les voitures obligerait à créer une fiche fantôme
 * qui s'afficherait dans les listes et fausserait les filtres.
 */
export const Apparence: GlobalConfig = {
  slug: 'apparence',
  typescript: { interface: 'ReglagesApparence' },
  label: 'Apparence',
  admin: {
    group: 'Réglages',
    description: 'Le décor animé du site.',
  },
  access: {
    read: tousLesVisiteurs,
    update: connecte,
  },
  fields: [
    {
      name: 'decor360',
      label: 'Voiture de fond (tour à 360°)',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 48,
      admin: {
        description:
          'Facultatif. Les vues d’une voiture prises tout autour, dans l’ordre : elle tournera en fond de page pendant que le visiteur descend. En dessous de 8 vues, le décor ne s’affiche pas. Cette voiture n’apparaît nulle part dans le catalogue.',
      },
    },
  ],
}
