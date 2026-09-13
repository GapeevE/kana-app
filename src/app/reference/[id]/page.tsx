import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireUserId } from '@/server/auth'
import { listFavorites } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'
import { FavoriteButton } from '@/features/favorites/favorite-button'
import { StrokeOrder } from '@/features/reference/stroke-order'
import { buttonVariants } from '@/components/ui/button'

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = KANA_BY_ID.get(id)
  if (!card) notFound()

  const userId = await requireUserId()
  const favorites = await listFavorites(userId)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 p-6">
      <span className="kana-glyph text-9xl">{card.char}</span>
      <p className="text-2xl">{card.romaji}</p>

      <StrokeOrder char={card.char} />

      {card.facts && card.facts.length > 0 && (
        <section className="w-full rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Интересное</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {card.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>
      )}

      <FavoriteButton cardId={card.id} initial={favorites.includes(card.id)} />

      <Link href="/reference" className={buttonVariants({ variant: 'ghost' })}>
        ← К азбуке
      </Link>
    </main>
  )
}
