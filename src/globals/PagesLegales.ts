import type { GlobalConfig } from 'payload'

import { connecte, tousLesVisiteurs } from '../access'

export const PagesLegales: GlobalConfig = {
  slug: 'pages-legales',
  typescript: { interface: 'PagesLegales' },
  label: 'Pages légales',
  admin: { group: 'Réglages' },
  access: {
    read: tousLesVisiteurs,
    update: connecte,
  },
  fields: [
    { name: 'mentionsLegales', label: 'Mentions légales', type: 'richText' },
    { name: 'confidentialite', label: 'Politique de confidentialité', type: 'richText' },
  ],
}
