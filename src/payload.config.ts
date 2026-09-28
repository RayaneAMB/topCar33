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
import { PagesLegales } from './globals/PagesLegales'
import { adaptateurEmail } from './lib/email/adaptateur'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
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
    },
  },
  collections: [Voitures, Marques, Categories, Media, Demandes, Users],
  globals: [Agence, PagesLegales],
  editor: lexicalEditor(),
  email: adaptateurEmail(),
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr },
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
