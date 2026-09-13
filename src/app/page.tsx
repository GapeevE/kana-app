import Link from 'next/link'
import { Flame, RotateCcw, Sparkles } from 'lucide-react'
import { requireUserId } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { buildQueue } from '@/core/session'
import { KANA_CARDS } from '@/data/kana'
import { buttonVariants } from '@/components/ui/button'

export default async function TodayPage() {
  const userId = await requireUserId()
  const data = await loadUserData(userId)
  const today = new Date().toISOString().slice(0, 10)

  const queue = buildQueue({
    states: data.states,
    answeredCorrectly: data.answeredCorrectly,
    today,
    newCardsLimit: data.newCardsPerDay,
    newCardsUsedToday: data.newCardsUsedToday,
  })

  const dueCount = queue.filter((c) => c.state !== null).length
  const newCount = queue.filter((c) => c.state === null).length
  const learned = [...data.states.values()].filter((s) => s.interval >= 7).length

  const nextDue = [...data.states.values()]
    .map((s) => s.dueDate)
    .filter((d) => d > today)
    .sort()[0]

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Сегодня</h1>
        {data.streakDays > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-primary">
            <Flame className="size-4" />
            Серия: {data.streakDays} дн.
          </p>
        )}
      </header>

      {queue.length > 0 ? (
        <section className="animate-in fade-in space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="flex gap-6">
            <div>
              <p className="text-4xl font-semibold">{dueCount}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <RotateCcw className="size-3.5" />
                повторить
              </p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{newCount}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Sparkles className="size-3.5" />
                новых
              </p>
            </div>
          </div>
          <Link href="/training" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
            Погнали
          </Link>
        </section>
      ) : (
        <section className="animate-in fade-in space-y-2 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-lg font-medium">На сегодня всё — можно выдохнуть</p>
          <p className="text-sm text-muted-foreground">
            {nextDue ? `Ближайшее повторение: ${nextDue}` : 'Заглядывай завтра'}
          </p>
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        Ты освоил {learned} из {KANA_CARDS.length}
      </p>
    </main>
  )
}
