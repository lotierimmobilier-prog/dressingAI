import { useAuthStore } from '../stores/authStore'
import { POINTS, BADGES, levelFromPoints } from '../lib/constants'

/** Léger retour haptique sur les actions importantes (mobile). */
export function haptic(pattern = 12) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

/**
 * useGameification : centralise l'attribution de points + badges.
 */
export function useGameification() {
  const profile = useAuthStore((s) => s.profile)
  const addPoints = useAuthStore((s) => s.addPoints)

  const points = profile?.points || 0
  const level = levelFromPoints(points)
  const unlocked = new Set(profile?.badges || [])

  async function reward(action) {
    haptic([10, 30, 10])
    switch (action) {
      case 'add_clothing':
        return addPoints(POINTS.ADD_CLOTHING)
      case 'wear_outfit':
        return addPoints(POINTS.WEAR_OUTFIT)
      case 'ai_validated':
        return addPoints(POINTS.AI_VALIDATED_LOOK, 'styliste')
      case 'share_look':
        return addPoints(POINTS.SHARE_LOOK)
      case 'first_look':
        return addPoints(POINTS.WEAR_OUTFIT, 'first_look')
      default:
        return null
    }
  }

  const badges = BADGES.map((b) => ({ ...b, unlocked: unlocked.has(b.id) }))

  return { points, level, badges, reward, POINTS }
}
