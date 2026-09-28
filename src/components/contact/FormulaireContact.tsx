'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import {
  CHAMP_PIEGE,
  ETAT_INITIAL,
  type ChampFormulaire,
  type EtatFormulaire,
} from '@/lib/demandes/formulaire'

type OptionVoiture = { slug: string; titre: string; offre: 'location' | 'vente' }

type Props = {
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>
  voitures: OptionVoiture[]
  voitureInitiale: string
}

const GROUPES = [
  { offre: 'location' as const, label: 'À louer' },
  { offre: 'vente' as const, label: 'À vendre' },
]

const classeChamp = (erreur?: string) =>
  `mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-texte placeholder:text-texte-doux ${
    erreur ? 'border-danger' : 'border-bordure'
  }`

function Champ(props: {
  nom: ChampFormulaire
  label: string
  valeur?: string
  erreur?: string
  type?: string
  autoComplete?: string
  multiligne?: boolean
}) {
  const { nom, label, valeur = '', erreur, type = 'text', autoComplete, multiligne } = props
  const aria = {
    'aria-invalid': erreur ? true : undefined,
    'aria-describedby': erreur ? `${nom}-erreur` : undefined,
  }
  return (
    <div>
      <label htmlFor={nom} className="text-sm font-semibold">
        {label}
      </label>
      {multiligne ? (
        <textarea id={nom} name={nom} rows={6} defaultValue={valeur} className={classeChamp(erreur)} {...aria} />
      ) : (
        <input
          id={nom}
          name={nom}
          type={type}
          autoComplete={autoComplete}
          defaultValue={valeur}
          className={classeChamp(erreur)}
          {...aria}
        />
      )}
      {erreur && (
        <p id={`${nom}-erreur`} className="mt-1 text-sm text-danger">
          {erreur}
        </p>
      )}
    </div>
  )
}

export function FormulaireContact({ action, voitures, voitureInitiale }: Props) {
  const [etat, envoyer, enCours] = useActionState(action, ETAT_INITIAL)

  if (etat.statut === 'succes') {
    return (
      <div role="status" className="rounded-carte border border-succes/40 bg-succes-fond p-6">
        <p className="text-lg font-bold">Merci{etat.prenom ? ` ${etat.prenom}` : ''} !</p>
        <p className="mt-1">Votre demande a bien été envoyée. Nous vous recontactons rapidement.</p>
      </div>
    )
  }

  const valeurs = etat.statut === 'invalide' || etat.statut === 'erreur' ? etat.valeurs : {}
  const erreurs = etat.statut === 'invalide' ? etat.erreurs : {}

  return (
    <form action={envoyer} noValidate className="relative space-y-5">
      <p className="text-sm text-texte-doux">Tous les champs sont obligatoires, sauf la voiture.</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Champ nom="prenom" label="Prénom" autoComplete="given-name" valeur={valeurs.prenom} erreur={erreurs.prenom} />
        <Champ nom="nom" label="Nom" autoComplete="family-name" valeur={valeurs.nom} erreur={erreurs.nom} />
        <Champ nom="email" label="Email" type="email" autoComplete="email" valeur={valeurs.email} erreur={erreurs.email} />
        <Champ
          nom="telephone"
          label="Téléphone"
          type="tel"
          autoComplete="tel"
          valeur={valeurs.telephone}
          erreur={erreurs.telephone}
        />
      </div>

      <Champ
        nom="rue"
        label="Adresse (numéro et rue)"
        autoComplete="street-address"
        valeur={valeurs.rue}
        erreur={erreurs.rue}
      />
      <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
        <Champ
          nom="codePostal"
          label="Code postal"
          autoComplete="postal-code"
          valeur={valeurs.codePostal}
          erreur={erreurs.codePostal}
        />
        <Champ nom="ville" label="Ville" autoComplete="address-level2" valeur={valeurs.ville} erreur={erreurs.ville} />
      </div>

      <div>
        <label htmlFor="voiture" className="text-sm font-semibold">
          Voiture concernée
        </label>
        <select id="voiture" name="voiture" defaultValue={valeurs.voiture ?? voitureInitiale} className={classeChamp()}>
          <option value="">Question générale</option>
          {GROUPES.map(({ offre, label }) => {
            const duGroupe = voitures.filter((voiture) => voiture.offre === offre)
            if (duGroupe.length === 0) return null
            return (
              <optgroup key={offre} label={label}>
                {duGroupe.map((voiture) => (
                  <option key={voiture.slug} value={voiture.slug}>
                    {voiture.titre}
                  </option>
                ))}
              </optgroup>
            )
          })}
        </select>
      </div>

      <Champ nom="message" label="Message" multiligne valeur={valeurs.message} erreur={erreurs.message} />

      {/* Champ piège anti-robots : invisible et ignoré par les humains. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={CHAMP_PIEGE}>Ne pas remplir ce champ</label>
        <input id={CHAMP_PIEGE} name={CHAMP_PIEGE} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {etat.statut === 'erreur' && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger-fond p-3 text-sm text-danger">
          {etat.message}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-lg bg-primaire px-6 py-3 font-semibold text-primaire-contraste hover:opacity-90 disabled:opacity-60"
      >
        {enCours ? 'Envoi…' : 'Envoyer ma demande'}
      </button>

      <p className="text-xs text-texte-doux">
        Vos informations servent uniquement à traiter votre demande.{' '}
        <Link href="/confidentialite" className="underline hover:text-texte">
          En savoir plus
        </Link>
      </p>
    </form>
  )
}
