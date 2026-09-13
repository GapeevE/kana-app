import { KANA_CARDS, cardsOfGroup } from '@/data/kana'
import type { KanaCard, Script, KanaType } from '@/data/kana'

function typeRank(type: KanaType): number {
  if (type === 'gojuon') return 0
  if (type === 'dakuten' || type === 'handakuten') return 1
  return 2
}

function scriptRank(script: Script): number {
  return script === 'hiragana' ? 0 : 1
}

function buildOrder(): string[] {
  const seen = new Map<string, KanaCard>()
  for (const card of KANA_CARDS) {
    if (!seen.has(card.group)) seen.set(card.group, card)
  }
  return [...seen.entries()]
    .sort(([, a], [, b]) => {
      const byScript = scriptRank(a.script) - scriptRank(b.script)
      if (byScript !== 0) return byScript
      const byType = typeRank(a.type) - typeRank(b.type)
      if (byType !== 0) return byType
      return KANA_CARDS.indexOf(a) - KANA_CARDS.indexOf(b)
    })
    .map(([group]) => group)
}

export const GROUP_ORDER: readonly string[] = buildOrder()

export function isGroupComplete(group: string, answeredCorrectly: ReadonlySet<string>): boolean {
  const cards = cardsOfGroup(group)
  return cards.length > 0 && cards.every((c) => answeredCorrectly.has(c.id))
}

export function unlockedGroups(answeredCorrectly: ReadonlySet<string>): string[] {
  const unlocked: string[] = []
  for (const group of GROUP_ORDER) {
    unlocked.push(group)
    if (!isGroupComplete(group, answeredCorrectly)) break
  }
  return unlocked
}

export function currentGroup(answeredCorrectly: ReadonlySet<string>): string | null {
  return GROUP_ORDER.find((g) => !isGroupComplete(g, answeredCorrectly)) ?? null
}
