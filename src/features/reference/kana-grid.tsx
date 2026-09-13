import Link from 'next/link'
import { KANA_CARDS } from '@/data/kana'
import { GROUP_ORDER } from '@/core/progression'

const GROUP_LABELS: Record<string, string> = {
  gojuon: 'Годзюон',
  dakuten: 'Дакутэн',
  handakuten: 'Хандакутэн',
  yoon: 'Ёон',
}

export function KanaGrid({ unlocked }: { unlocked: ReadonlySet<string> }) {
  return (
    <div className="space-y-6">
      {GROUP_ORDER.map((group) => {
        const cards = KANA_CARDS.filter((c) => c.group === group)
        if (cards.length === 0) return null

        const open = unlocked.has(group)
        const first = cards[0]
        const script = first.script === 'hiragana' ? 'Хирагана' : 'Катакана'
        const kind = GROUP_LABELS[first.type] ?? first.type

        return (
          <section key={group} className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {script} · {kind} · ряд «{first.row}»{!open && ' · закрыто'}
            </h2>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
              {cards.map((card) =>
                open ? (
                  <Link
                    key={card.id}
                    href={`/reference/${card.id}`}
                    className="flex aspect-square flex-col items-center justify-center rounded-md border hover:bg-muted"
                  >
                    <span className="kana-glyph text-2xl">{card.char}</span>
                    <span className="text-xs text-muted-foreground">{card.romaji}</span>
                  </Link>
                ) : (
                  <div
                    key={card.id}
                    className="flex aspect-square items-center justify-center rounded-md border border-dashed opacity-40"
                  >
                    <span className="kana-glyph text-2xl">{card.char}</span>
                  </div>
                ),
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
