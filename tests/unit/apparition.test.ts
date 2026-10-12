import { describe, expect, it } from 'vitest'

import { doitEntrer } from '@/lib/apparition'

const FENETRE = 800

describe('doitEntrer', () => {
  it('fait entrer ce qui est encore sous la ligne de flottaison', () => {
    expect(doitEntrer({ hautRelatif: 1200, hauteurFenetre: FENETRE, animationsReduites: false })).toBe(true)
  })

  it('laisse tranquille ce qui est déjà à l’écran', () => {
    // Sinon la carte disparaîtrait pour revenir : un clignotement au chargement.
    expect(doitEntrer({ hautRelatif: 300, hauteurFenetre: FENETRE, animationsReduites: false })).toBe(false)
  })

  it('laisse tranquille ce qui est déjà passé au-dessus', () => {
    expect(doitEntrer({ hautRelatif: -500, hauteurFenetre: FENETRE, animationsReduites: false })).toBe(false)
  })

  it('n’anime rien si le visiteur demande moins d’animations', () => {
    expect(doitEntrer({ hautRelatif: 1200, hauteurFenetre: FENETRE, animationsReduites: true })).toBe(false)
  })

  it('traite le bord exact comme hors écran', () => {
    // Pile sous le pli : la carte n'a pas encore été vue, elle peut entrer.
    expect(doitEntrer({ hautRelatif: FENETRE, hauteurFenetre: FENETRE, animationsReduites: false })).toBe(true)
    expect(doitEntrer({ hautRelatif: FENETRE - 1, hauteurFenetre: FENETRE, animationsReduites: false })).toBe(false)
  })
})
