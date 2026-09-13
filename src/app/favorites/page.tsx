import Link from 'next/link'
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
      <h1 className="text-2xl font-semibold">Избранное</h1>

      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока пусто. Отметьте знаки звёздочкой на странице карточки, чтобы вернуться к ним.
        </p>
      ) : (
        <>
          <Link href="/favorites/training" className={buttonVariants()}>
            Тренировать избранное
          </Link>
          <p className="text-sm text-muted-foreground">
            Ответы в этом режиме не влияют на расписание повторений.
          </p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/reference/${card.id}`}
                className="flex aspect-square flex-col items-center justify-center rounded-md border hover:bg-muted"
              >
                <span className="kana-glyph text-2xl">{card.char}</span>
                <span className="text-xs text-muted-foreground">{card.romaji}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
