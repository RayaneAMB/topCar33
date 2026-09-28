'use client'

export default function Erreur({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold">Une erreur est survenue</h1>
      <p className="mt-4 text-texte-doux">Le site rencontre un problème momentané. Réessayez dans quelques instants.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-lg bg-primaire px-5 py-2.5 font-semibold text-primaire-contraste"
      >
        Réessayer
      </button>
    </div>
  )
}
