import { and, eq } from 'drizzle-orm'
import { db, favorites } from '@/server/db'

export async function listFavorites(userId: string): Promise<string[]> {
  const rows = await db.select({ cardId: favorites.cardId }).from(favorites).where(eq(favorites.userId, userId))
  return rows.map((r) => r.cardId)
}

export async function toggleFavorite(userId: string, cardId: string): Promise<boolean> {
  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.cardId, cardId)))
    .limit(1)

  if (existing.length > 0) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.cardId, cardId)))
    return false
  }

  await db.insert(favorites).values({ userId, cardId })
  return true
}
