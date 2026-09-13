import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { requireUserId } from '@/server/auth'
import { listFavorites } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'
import { TrainingScreen } from '@/features/training/training-screen'

export default async function FavoritesTrainingPage() {
  const userId = await requireUserId()
  const ids = await listFavorites(userId)
  const items = ids
    .map((id) => KANA_BY_ID.get(id))
    .filter((card) => card !== undefined)
    .map((card) => ({ card, state: null }))

  if (items.length === 0) redirect('/favorites')

  return <TrainingScreen sessionId={randomUUID()} items={items} drillOnly />
}
