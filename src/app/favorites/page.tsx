import Link from 'next/link'
import { Dumbbell, Star } from 'lucide-react'
import { requireUserId } from '@/server/auth'
import { listFavorites } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'
import { buttonVariants } from '@/components/ui/button'

export default async function FavoritesPage() {
  const userId = await requireUserId()
  const ids = await listFavorites(userId)
  const cards = ids.map((id) => KANA_BY_ID.get(id)).filter((c) => c !== undefined)

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="flex items-center gap-2 text-3xl font-semibold">
        <Star className="size-7 text-primary" />
        Избранное
      </h1>

      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока пусто. Отмечай знаки звёздочкой — они соберутся здесь.
        </p>
      ) : (
        <>
          <Link href="/favorites/training" className={buttonVariants()}>
            <Dumbbell className="size-4" />
            Тренировать отмеченные
          </Link>
          <p className="text-sm text-muted-foreground">
            Здесь ответы не влияют на расписание повторений — просто тренируйся.
          </p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 sm:gap-2">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/reference/${card.id}`}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border border-border bg-card transition-colors hover:border-primary hover:bg-accent"
              >
                <span className="kana-glyph text-xl sm:text-2xl">{card.char}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">{card.romaji}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
