import { requireUserId } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { unlockedGroups } from '@/core/progression'
import { KanaGrid } from '@/features/reference/kana-grid'

export default async function ReferencePage() {
  const userId = await requireUserId()
  const data = await loadUserData(userId)
  const unlocked = new Set(unlockedGroups(data.answeredCorrectly))

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-6 text-2xl font-semibold">Азбука</h1>
      <KanaGrid unlocked={unlocked} />
    </main>
  )
}
