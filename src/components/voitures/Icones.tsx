import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

type Props = { className?: string }

export const IconeBoite = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M6 4v16M12 4v16M18 4v8M6 12h12" />
  </svg>
)

export const IconeCarburant = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14M3 20h12M4 10h10M14 9l3 1v7a1.5 1.5 0 0 0 3 0V9l-3-3" />
  </svg>
)

export const IconePlaces = ({ className }: Props) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="7" r="3" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
)

export const IconePortes = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M6 20V4h10l2 2v14H6zM14 12h1" />
  </svg>
)

export const IconeClim = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
  </svg>
)

export const IconeAnnee = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const IconeCompteur = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="M12 18l4.5-5" />
  </svg>
)
