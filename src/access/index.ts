import type { Access } from 'payload'

/** Tout le monde, même sans être connecté (lecture du catalogue). */
export const tousLesVisiteurs: Access = () => true

/** Uniquement un utilisateur connecté à l'administration. */
export const connecte: Access = ({ req }) => Boolean(req.user)
