import Link from 'next/link'
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
        <h1 className="text-2xl font-semibold">Сегодня</h1>
        {data.streakDays > 0 && <p className="text-sm text-muted-foreground">Серия: {data.streakDays} дн.</p>}
      </header>

      {queue.length > 0 ? (
        <section className="space-y-4 rounded-lg border p-6">
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-semibold">{dueCount}</p>
              <p className="text-sm text-muted-foreground">к повторению</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{newCount}</p>
              <p className="text-sm text-muted-foreground">новых</p>
            </div>
          </div>
          <Link href="/training" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
            Начать тренировку
          </Link>
        </section>
      ) : (
        <section className="space-y-2 rounded-lg border p-6 text-center">
          <p className="font-medium">На сегодня всё</p>
          <p className="text-sm text-muted-foreground">
            {nextDue ? `Ближайшее повторение: ${nextDue}` : 'Возвращайтесь завтра'}
          </p>
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        Освоено {learned} из {KANA_CARDS.length}
      </p>
    </main>
  )
}
