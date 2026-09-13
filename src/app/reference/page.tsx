import { requireUserId } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { unlockedGroups } from '@/core/progression'
import { KanaGrid } from '@/features/reference/kana-grid'
import { ScriptTabs } from '@/features/reference/script-tabs'
import { ScriptIntro } from '@/features/reference/script-intro'

export default async function ReferencePage({
  searchParams,
}: {
  searchParams: Promise<{ script?: string }>
}) {
  const { script: raw } = await searchParams
  const script = raw === 'katakana' ? 'katakana' : 'hiragana'

  const userId = await requireUserId()
  const data = await loadUserData(userId)
  const unlocked = new Set(unlockedGroups(data.answeredCorrectly))

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-semibold">Азбука</h1>
      <ScriptTabs active={script} />
      <ScriptIntro script={script} />
      <KanaGrid script={script} unlocked={unlocked} />
    </main>
  )
}
