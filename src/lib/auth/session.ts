import { cookies } from 'next/headers'
import type { Payload } from 'payload'
import { generatePayloadCookie } from 'payload/shared'

/**
 * Pose le cookie de session attendu par Payload.
 * On passe par son propre générateur plutôt que d'écrire le cookie à la main :
 * préfixe, domaine, SameSite et durée viennent ainsi de la configuration,
 * et resteront justes si elle change.
 */
export async function ouvrirSession(payload: Payload, jeton: string): Promise<void> {
  const collection = payload.collections.users.config
  const cookie = generatePayloadCookie({
    collectionAuthConfig: collection.auth,
    cookiePrefix: payload.config.cookiePrefix,
    token: jeton,
    returnCookieAsObject: true,
  })

  const magasin = await cookies()
  magasin.set(cookie.name, cookie.value ?? '', {
    domain: cookie.domain,
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
    httpOnly: cookie.httpOnly,
    maxAge: cookie.maxAge,
    path: cookie.path,
    sameSite: cookie.sameSite?.toLowerCase() as 'lax' | 'none' | 'strict' | undefined,
    secure: cookie.secure,
  })
}
