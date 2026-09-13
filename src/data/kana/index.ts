import { GOJUON } from './gojuon'
import { DAKUTEN } from './dakuten'
import { YOON } from './yoon'
import type { KanaCard } from './types'

export const KANA_CARDS: readonly KanaCard[] = [...GOJUON, ...DAKUTEN, ...YOON]

export const KANA_BY_ID: ReadonlyMap<string, KanaCard> = new Map(KANA_CARDS.map((c) => [c.id, c]))

export function cardsOfGroup(group: string): KanaCard[] {
  return KANA_CARDS.filter((c) => c.group === group)
}

export type { KanaCard, Script, KanaType } from './types'
