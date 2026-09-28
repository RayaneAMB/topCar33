import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

type Props = { data: ComponentProps<typeof RichText>['data']; className?: string }

/** Affiche un contenu riche saisi dans l'admin avec les styles `.contenu-riche`. */
export function RichTexte({ data, className = '' }: Props) {
  return <RichText data={data} className={`contenu-riche ${className}`} />
}
