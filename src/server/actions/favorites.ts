'use server'

import { requireUserId } from '@/server/auth'
import { toggleFavorite } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'

export async function toggleFavoriteAction(cardId: string): Promise<boolean> {
  const userId = await requireUserId()
  if (!KANA_BY_ID.has(cardId)) return false
  return toggleFavorite(userId, cardId)
}
