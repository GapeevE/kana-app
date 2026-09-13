import { GOJUON } from './gojuon'
import { DAKUTEN } from './dakuten'
import { YOON } from './yoon'
import { KANA_HINTS } from './hints'
import type { KanaCard } from './types'

function withContent(card: KanaCard): KanaCard {
  const entry = KANA_HINTS[card.id]
  if (!entry) return card

  return {
    ...card,
    ...(entry.hint ? { hint: entry.hint } : {}),
    ...(entry.facts?.length ? { facts: entry.facts } : {}),
  }
}

export const KANA_CARDS: readonly KanaCard[] = [...GOJUON, ...DAKUTEN, ...YOON].map(withContent)

export const KANA_BY_ID: ReadonlyMap<string, KanaCard> = new Map(KANA_CARDS.map((c) => [c.id, c]))

export function cardsOfGroup(group: string): KanaCard[] {
  return KANA_CARDS.filter((c) => c.group === group)
}

export type { KanaCard, Script, KanaType } from './types'
