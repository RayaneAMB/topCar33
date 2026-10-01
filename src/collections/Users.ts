import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

/**
 * Champs de la connexion en deux temps. Ils ne sortent jamais par l'API
 * (`read: () => false`) et ne s'affichent pas dans l'administration :
 * ce sont des données de passage, pas des informations à consulter.
 */
const champsDeuxiemeFacteur: CollectionConfig['fields'] = [
  { name: 'codeAuthEmpreinte', type: 'text' },
  { name: 'codeAuthExpiration', type: 'date' },
  { name: 'codeAuthTentatives', type: 'number', defaultValue: 0 },
  { name: 'jetonEnAttente', type: 'text' },
  { name: 'identifiantAttente', type: 'text', index: true },
].map((champ) => ({
  ...champ,
  access: { read: () => false, create: () => false, update: () => false },
  admin: { hidden: true },
})) as CollectionConfig['fields']

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
  },
  auth: true,
  hooks: {
    /**
     * Le mot de passe seul ne suffit plus quand la double authentification est active.
     * Sans ce garde-fou, la page de connexion de Payload et l'API ouvriraient une
     * session sans deuxième facteur : la protection serait décorative.
     * Seule la page `/connexion`, qui a vérifié le code, pose ce drapeau.
     */
    beforeLogin: [
      async ({ context, req }) => {
        const securite = await req.payload.findGlobal({ slug: 'securite', depth: 0, req })
        if (!securite?.doubleAuth) return
        if (context?.deuxiemeFacteurValide === true) return

        throw new APIError(
          'La double authentification est active : connectez-vous depuis la page /connexion du site.',
          403,
        )
      },
    ],
  },
  fields: champsDeuxiemeFacteur,
}
