import { requireUserId } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { KANA_CARDS } from '@/data/kana'
import { ProgressMap } from '@/features/progress/progress-map'

export default async function ProgressPage() {
  const userId = await requireUserId()
  const data = await loadUserData(userId)

  const learned = [...data.states.values()].filter((s) => s.interval >= 7).length
  const started = data.states.size

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Прогресс</h1>

      <div className="flex gap-6">
        <div>
          <p className="text-3xl font-semibold">
            {learned}
            <span className="text-base text-muted-foreground"> / {KANA_CARDS.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">освоено</p>
        </div>
        <div>
          <p className="text-3xl font-semibold">{started}</p>
          <p className="text-sm text-muted-foreground">начато</p>
        </div>
        <div>
          <p className="text-3xl font-semibold">{data.streakDays}</p>
          <p className="text-sm text-muted-foreground">дней подряд</p>
        </div>
      </div>

      <ProgressMap states={data.states} />
    </main>
  )
}
