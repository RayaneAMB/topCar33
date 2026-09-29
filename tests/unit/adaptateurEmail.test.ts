import { describe, expect, it } from 'vitest'

import { alerteSmtp } from '@/lib/email/adaptateur'

describe('alerteSmtp', () => {
  it('ne dit rien sans SMTP_HOST : le mode Ethereal est volontaire en dev', () => {
    expect(alerteSmtp({ SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' })).toBeNull()
  })

  it('ne dit rien quand tout est renseigné', () => {
    expect(alerteSmtp({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'moi@gmail.com', SMTP_PASS: 'secret' })).toBeNull()
  })

  it('signale les identifiants manquants en nommant les variables', () => {
    const alerte = alerteSmtp({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: '', SMTP_PASS: '   ' })
    expect(alerte).toContain('SMTP_USER')
    expect(alerte).toContain('SMTP_PASS')
    expect(alerte).toContain('aucun mail ne partira')
  })

  it('signale le mot de passe seul quand l’identifiant est là', () => {
    const alerte = alerteSmtp({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'moi@gmail.com', SMTP_PASS: '' })
    expect(alerte).toContain('SMTP_PASS')
    expect(alerte).not.toContain('SMTP_USER')
  })

  it('signale une adresse d’expéditeur collée dans le nom', () => {
    const alerte = alerteSmtp({
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_USER: 'moi@gmail.com',
      SMTP_PASS: 'secret',
      SMTP_FROM_NAME: 'TopCar33contact@topcar33.com',
    })
    expect(alerte).toContain('SMTP_FROM_NAME')
  })
})
