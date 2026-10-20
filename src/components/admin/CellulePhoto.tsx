'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useState } from 'react'

type MediaLeger = { url?: string | null; sizes?: { miniature?: { url?: string | null } } }

/**
 * Colonne « Photo » : la photo principale en vignette, pour reconnaître une
 * voiture d'un coup d'œil plutôt qu'à son nom.
 *
 * La liste ne charge que les identifiants des photos : on va chercher la
 * vignette de la première.
 */
export function CellulePhoto({ cellData }: DefaultCellComponentProps) {
  const premiere = Array.isArray(cellData) ? cellData[0] : undefined
  const id = typeof premiere === 'object' && premiere ? (premiere as { id?: string }).id : premiere
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof id !== 'string') return
    const annulation = new AbortController()
    fetch(`/api/media/${id}?depth=0`, { credentials: 'include', signal: annulation.signal })
      .then((reponse) => (reponse.ok ? reponse.json() : null))
      .then((media: MediaLeger | null) => setUrl(media?.sizes?.miniature?.url || media?.url || null))
      .catch(() => {})
    return () => annulation.abort()
  }, [id])

  if (!url) return <span className="tc-vignette tc-vignette--vide" aria-hidden="true" />
  // eslint-disable-next-line @next/next/no-img-element -- vignette d'administration, déjà réduite
  return <img src={url} alt="" className="tc-vignette" loading="lazy" />
}
