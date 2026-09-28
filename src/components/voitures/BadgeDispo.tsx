export function BadgeDispo({ disponible, className = '' }: { disponible: boolean; className?: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        disponible ? 'bg-succes-fond text-succes' : 'bg-danger-fond text-danger'
      } ${className}`}
    >
      {disponible ? 'Disponible' : 'Déjà louée'}
    </span>
  )
}
