import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  /**
   * Une seule porte d'entrée : la page de connexion de Payload renvoie vers la
   * nôtre, qui gère le mot de passe seul ou le code à 6 chiffres selon le réglage.
   * Sans cette redirection, on tombe sur un formulaire qui refuse de s'ouvrir.
   * Next conserve la chaîne de requête, donc le `?redirect=` de Payload survit.
   */
  async redirects() {
    return [{ source: '/admin/login', destination: '/connexion', permanent: false }]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
