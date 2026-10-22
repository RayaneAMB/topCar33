import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Demandes } from './collections/Demandes'
import { Marques } from './collections/Marques'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Voitures } from './collections/Voitures'
import { Agence } from './globals/Agence'
import { Apparence } from './globals/Apparence'
import { Mails } from './globals/Mails'
import { PagesLegales } from './globals/PagesLegales'
import { Securite } from './globals/Securite'
import { adaptateurEmail } from './lib/email/adaptateur'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    // Le format par défaut est anglais — « octobre 19 2026, 11:01 AM ».
    // Ici : « 19 oct. 2026, 11:01 », dans l'ordre et à l'heure d'ici.
    dateFormat: 'd MMM yyyy, HH:mm',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — TopCar33 Administration',
      icons: [{ rel: 'icon', type: 'image/png', url: '/favicon-32x32.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/LogoAdmin#LogoAdmin',
        Icon: '/components/admin/IconeAdmin#IconeAdmin',
      },
      beforeNavLinks: ['/components/admin/LogoMenuAdmin#LogoMenuAdmin'],
      afterNavLinks: ['/components/admin/SelecteurThemeAdmin#SelecteurThemeAdmin'],
    },
  },
  collections: [Voitures, Marques, Categories, Media, Demandes, Users],
  globals: [Agence, Apparence, Mails, PagesLegales, Securite],
  editor: lexicalEditor(),
  email: adaptateurEmail(),
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr },
    // La traduction française livrée avec Payload ne sait pas le genre des
    // objets : elle écrit « Créer un(e) nouveau ou nouvelle », « Aucun(e) ».
    // On reformule sans genre plutôt qu'avec des parenthèses — c'est ce que
    // l'agence lit chaque jour.
    translations: {
      fr: {
        general: {
          createNew: 'Ajouter',
          createNewLabel: 'Ajouter : {{label}}',
          creatingNewLabel: 'Ajout : {{label}}',
          created: 'Création',
          createdAt: 'Date de création',
          deletedSuccessfully: 'Suppression effectuée.',
          descending: 'Décroissant',
          none: 'Aucun',
          noResults: 'Aucun résultat : il n’y a encore rien ici, ou rien ne correspond aux filtres choisis.',
          successfullyCreated: '{{label}} : ajout enregistré.',
          successfullyDuplicated: '{{label}} : copie créée.',
          titleDeleted: '{{label}} « {{title}} » : suppression effectuée.',
        },
        fields: {
          addNew: 'Ajouter',
          addNewLabel: 'Ajouter : {{label}}',
          chooseFromExisting: 'Choisir dans la médiathèque',
          chooseLabel: 'Choisir : {{label}}',
          selectExistingLabel: 'Sélectionner : {{label}}',
          uploadNewLabel: 'Envoyer un fichier : {{label}}',
        },
        version: {
          noRowsFound: 'Aucun résultat',
          restoredSuccessfully: 'Restauration effectuée.',
        },
      },
    },
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
