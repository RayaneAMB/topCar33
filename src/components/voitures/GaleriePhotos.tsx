'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { PhotoGalerie } from '@/lib/format'

export function GaleriePhotos({ photos, titre }: { photos: PhotoGalerie[]; titre: string }) {
  const [index, setIndex] = useState(0)

  if (photos.length === 0) return <div className="aspect-[16/10] rounded-carte bg-fond-alt" />

  const active = photos[index] ?? photos[0]

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-carte bg-fond-alt">
        <Image
          src={active.url}
          alt={active.alt || titre}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {photos.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((photo, position) => (
            <li key={photo.url}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Afficher la photo ${position + 1}`}
                aria-pressed={position === index}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-md border-2 ${
                  position === index ? 'border-primaire' : 'border-transparent'
                }`}
              >
                <Image src={photo.miniature} alt="" fill sizes="20vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
