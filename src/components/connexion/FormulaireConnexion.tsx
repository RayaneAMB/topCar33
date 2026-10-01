'use client'

import { useActionState } from 'react'

import { ETAT_INITIAL, type EtatConnexion } from '@/lib/auth/etatConnexion'

type Action = (etat: EtatConnexion, formData: FormData) => Promise<EtatConnexion>

const CLASSE_CHAMP =
  'mt-1 w-full rounded-carte border border-bordure bg-fond-alt px-3 py-2 text-texte transition placeholder:text-texte-doux focus:border-primaire'

const CLASSE_BOUTON =
  'mt-6 w-full rounded-carte bg-primaire px-4 py-3 font-semibold text-primaire-contraste transition hover:bg-petrole hover:text-texte disabled:opacity-60'

function Message({ texte }: { texte: string }) {
  return (
    <p role="alert" className="mt-4 rounded-carte border border-danger bg-fond-alt px-3 py-2 text-sm text-danger">
      {texte}
    </p>
  )
}

export function FormulaireConnexion({
  actionIdentifiants,
  actionCode,
  destination,
}: {
  actionIdentifiants: Action
  actionCode: Action
  destination: string
}) {
  const [etat, envoyer, enCours] = useActionState(
    async (precedent: EtatConnexion, formData: FormData) =>
      formData.get('code') === null
        ? actionIdentifiants(precedent, formData)
        : actionCode(precedent, formData),
    ETAT_INITIAL,
  )

  if (etat.etape === 'code') {
    return (
      <form action={envoyer} noValidate>
        <input type="hidden" name="destination" value={destination} />
        <input type="hidden" name="identifiant" value={etat.identifiant} />
        <input type="hidden" name="email" value={etat.email} />

        <p className="text-sm text-texte-doux">
          Un code à 6 chiffres vient d’être envoyé à <strong className="text-texte">{etat.email}</strong>. Il est
          valable 10 minutes.
        </p>

        <div className="mt-6">
          <label htmlFor="code" className="text-sm font-semibold">
            Code reçu par email
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            autoFocus
            required
            className={`${CLASSE_CHAMP} text-center text-2xl tracking-[0.5em]`}
          />
        </div>

        {etat.message && <Message texte={etat.message} />}

        <button type="submit" disabled={enCours} className={CLASSE_BOUTON}>
          {enCours ? 'Vérification…' : 'Valider le code'}
        </button>
      </form>
    )
  }

  return (
    <form action={envoyer} noValidate>
      <input type="hidden" name="destination" value={destination} />
      <div>
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={etat.email ?? ''}
          required
          className={CLASSE_CHAMP}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="motDePasse" className="text-sm font-semibold">
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
          className={CLASSE_CHAMP}
        />
      </div>

      {etat.message && <Message texte={etat.message} />}

      <button type="submit" disabled={enCours} className={CLASSE_BOUTON}>
        {enCours ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
