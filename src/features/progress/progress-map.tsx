import { KANA_CARDS } from '@/data/kana'
import type { CardState } from '@/core/srs'

function levelOf(state: CardState | undefined): string {
  if (!state) return 'bg-muted'
  if (state.interval >= 30) return 'bg-primary'
  if (state.interval >= 7) return 'bg-primary/60'
  return 'bg-primary/25'
}

export function ProgressMap({ states }: { states: ReadonlyMap<string, CardState> }) {
  return (
    <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
      {KANA_CARDS.map((card) => (
        <div
          key={card.id}
          title={`${card.char} — ${card.romaji}`}
          className={`flex aspect-square items-center justify-center rounded ${levelOf(states.get(card.id))}`}
        >
          <span className="kana-glyph text-xs">{card.char}</span>
        </div>
      ))}
    </div>
  )
}
