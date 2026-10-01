/**
 * Configuration ESLint « plate » (le format d'ESLint 9).
 *
 * Elle passait auparavant par `FlatCompat`, la passerelle prévue pour réutiliser
 * l'ancien format `.eslintrc`. Depuis Next 15, `eslint-config-next` publie déjà
 * des configs plates : les faire traverser la passerelle refermait une boucle
 * dans le graphe des extensions, et `npm run lint` s'arrêtait avant même de lire
 * un fichier (« property 'react' closes the circle »). On importe donc les
 * configs directement, ce qu'elles attendent.
 */
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // Fichiers produits par Payload ou par le build : rien à y corriger à la main.
    ignores: [
      '.next/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default eslintConfig
