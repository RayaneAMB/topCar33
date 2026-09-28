import { libelleDisponibilite, type OffreVoiture } from '@/lib/format'

export function BadgeDispo({
  offre,
  disponible,
  className = '',
}: {
  offre: OffreVoiture | null | undefined
  disponible: boolean
  className?: string
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        disponible ? 'bg-succes-fond text-succes' : 'bg-danger-fond text-danger'
      } ${className}`}
    >
      {libelleDisponibilite(offre, disponible)}
    </span>
  )
}
