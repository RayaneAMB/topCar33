import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { limiterFiltres } from '@/collections/filtres'
import { Demandes } from '@/collections/Demandes'
import { Voitures } from '@/collections/Voitures'

/** Tous les champs nommés d'un arbre, conteneurs traversés. */
function champsNommes(champs: Field[]): { nom: string; filtrable: boolean }[] {
  return champs.flatMap((champ) => {
    if ('fields' in champ && Array.isArray(champ.fields)) return champsNommes(champ.fields)
    if ('tabs' in champ && Array.isArray(champ.tabs)) {
      return champ.tabs.flatMap((onglet) => champsNommes(onglet.fields))
    }
    if (!('name' in champ) || typeof champ.name !== 'string') return []
    // `admin` a une forme différente par type de champ ; seule cette clé nous intéresse.
    const admin = champ.admin as { disableListFilter?: boolean } | undefined
    return [{ nom: champ.name, filtrable: admin?.disableListFilter !== true }]
  })
}

const filtrables = (champs: Field[]) =>
  champsNommes(champs)
    .filter(({ filtrable }) => filtrable)
    .map(({ nom }) => nom)
    .sort()

describe('limiterFiltres', () => {
  it('ne laisse filtrable que ce qui est nommé', () => {
    const champs = limiterFiltres(
      [
        { name: 'garde', type: 'text' },
        { name: 'retire', type: 'text' },
      ],
      ['garde'],
    )
    expect(filtrables(champs)).toEqual(['garde'])
  })

  it('descend dans les rangées et les groupes', () => {
    const champs = limiterFiltres(
      [
        { type: 'row', fields: [{ name: 'dedans', type: 'text' }] },
        { name: 'groupe', type: 'group', fields: [{ name: 'garde', type: 'text' }] },
      ],
      ['garde'],
    )
    expect(filtrables(champs)).toEqual(['garde'])
  })

  it('laisse intacts les champs sans nom', () => {
    const champs = limiterFiltres([{ type: 'row', fields: [] }], [])
    expect(champs).toHaveLength(1)
  })

  it('n’écrase pas la configuration admin existante', () => {
    const [champ] = limiterFiltres([{ name: 'slug', type: 'text', admin: { readOnly: true } }], [])
    expect(champ.admin).toMatchObject({ readOnly: true, disableListFilter: true })
  })
})

describe('les collections de l’administration', () => {
  it('ne propose que cinq filtres sur les voitures', () => {
    expect(filtrables(Voitures.fields)).toEqual(['categorie', 'disponible', 'marque', 'offre', 'prix'])
  })

  it('ne propose que trois filtres sur les demandes', () => {
    expect(filtrables(Demandes.fields)).toEqual(['nature', 'statut', 'voiture'])
  })

  it('laisse la recherche trouver un client par son nom ou son email', () => {
    // Ces champs ayant quitté le panneau de filtres, la barre doit les couvrir.
    expect(Demandes.admin?.listSearchableFields).toEqual(['titre', 'nom', 'prenom', 'email'])
  })
})
