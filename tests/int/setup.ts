import os from 'node:os'
import path from 'node:path'
import { inject } from 'vitest'

// Les tests d'intégration n'utilisent JAMAIS la base de .env : uniquement la base en mémoire.
process.env.DATABASE_URL = inject('mongoUri')
process.env.PAYLOAD_SECRET = 'secret-de-test-topcar33'
process.env.MEDIA_DIR = path.join(os.tmpdir(), 'topcar33-tests-media')
process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'
