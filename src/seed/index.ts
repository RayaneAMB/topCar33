import { getPayload } from 'payload'

import config from '../payload.config'
import { seed } from './seed'

const payload = await getPayload({ config })

try {
  await seed(payload)
  process.exit(0)
} catch (erreur) {
  payload.logger.error({ err: erreur, msg: 'Échec du seed' })
  process.exit(1)
}
