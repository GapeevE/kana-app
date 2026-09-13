import { KANA_CARDS } from '@/data/kana'
import type { CardState } from '@/core/srs'

function levelOf(state: CardState | undefined): string {
  if (!state) return 'bg-muted text-muted-foreground'
  if (state.interval >= 30) return 'bg-primary text-primary-foreground'
  if (state.interval >= 7) return 'bg-primary/65 text-primary-foreground'
  return 'bg-primary/30 text-foreground'
}

export function ProgressMap({ states }: { states: ReadonlyMap<string, CardState> }) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-12 sm:gap-1">
      {KANA_CARDS.map((card) => (
        <div
          key={card.id}
          title={`${card.char} — ${card.romaji}`}
          className={`flex aspect-square items-center justify-center rounded transition-colors ${levelOf(states.get(card.id))}`}
        >
          <span className="kana-glyph text-lg sm:text-xs">{card.char}</span>
        </div>
      ))}
    </div>
  )
}
