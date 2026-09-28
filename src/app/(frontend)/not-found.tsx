import Link from 'next/link'

export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold">Page introuvable</h1>
      <p className="mt-4 text-texte-doux">La page que vous cherchez n’existe pas ou a été déplacée.</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-primaire px-5 py-2.5 font-semibold text-primaire-contraste"
      >
        Retour à l’accueil
      </Link>
    </div>
  )
}
