import Link from 'next/link'
import { KANA_CARDS } from '@/data/kana'
import { GROUP_ORDER } from '@/core/progression'
import { GRAMMAR_NOTES } from '@/data/kana/articles'
import { GrammarNote } from './grammar-note'

const TYPE_LABELS: Record<string, string> = {
  gojuon: 'Годзюон',
  dakuten: 'Дакутэн',
  handakuten: 'Хандакутэн',
  yoon: 'Ёон',
}

function noteBefore(type: string, shown: Set<string>) {
  const note = GRAMMAR_NOTES.find((n) => n.beforeGroup === type)
  if (!note || shown.has(note.id)) return null
  shown.add(note.id)
  return note
}

export function KanaGrid({
  script,
  unlocked,
}: {
  script: 'hiragana' | 'katakana'
  unlocked: ReadonlySet<string>
}) {
  const shownNotes = new Set<string>()
  const groups = GROUP_ORDER.filter((group) => group.startsWith(`${script}_`))

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const cards = KANA_CARDS.filter((c) => c.group === group)
        if (cards.length === 0) return null

        const open = unlocked.has(group)
        const first = cards[0]
        const note = noteBefore(first.type, shownNotes)

        return (
          <div key={group} className="space-y-6">
            {note && <GrammarNote note={note} />}

            <section className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                {TYPE_LABELS[first.type] ?? first.type} · ряд «{first.row}»{!open && ' · закрыто'}
              </h2>
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 sm:gap-2">
                {cards.map((card) =>
                  open ? (
                    <Link
                      key={card.id}
                      href={`/reference/${card.id}`}
                      className="flex aspect-square flex-col items-center justify-center rounded-lg border border-border bg-card transition-colors hover:border-primary hover:bg-accent"
                    >
                      <span className="kana-glyph text-xl sm:text-2xl">{card.char}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">{card.romaji}</span>
                    </Link>
                  ) : (
                    <div
                      key={card.id}
                      className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border opacity-30"
                    >
                      <span className="kana-glyph text-xl sm:text-2xl">{card.char}</span>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        )
      })}

      {GRAMMAR_NOTES.filter((n) => n.beforeGroup === 'sokuon').map((note) => (
        <GrammarNote key={note.id} note={note} />
      ))}
    </div>
  )
}
