/**
 * Sortie de secours : désactive la double authentification sans passer par
 * le back-office. À lancer depuis le dossier du projet quand on ne reçoit
 * plus les codes par mail : `npm run 2fa:off`
 */
import { getPayload } from 'payload'

import config from '../src/payload.config.js'

const payload = await getPayload({ config })

try {
  await payload.updateGlobal({ slug: 'securite', data: { doubleAuth: false } })
  payload.logger.info('Double authentification DÉSACTIVÉE. Connexion par mot de passe seul rétablie.')
  process.exit(0)
} catch (erreur) {
  payload.logger.error({ err: erreur, msg: 'Impossible de désactiver la double authentification' })
  process.exit(1)
}
