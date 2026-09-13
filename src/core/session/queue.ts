import { KANA_CARDS, cardsOfGroup } from '@/data/kana'
import { GROUP_ORDER, isGroupComplete } from '@/core/progression'
import type { BuildQueueInput, SessionCard } from './types'

export const DEFAULT_NEW_CARDS_PER_DAY = 10

function collectNewCards(
  states: ReadonlyMap<string, unknown>,
  answeredCorrectly: ReadonlySet<string>,
  limit: number,
): SessionCard[] {
  const fresh: SessionCard[] = []
  const projected = new Set(answeredCorrectly)

  for (const group of GROUP_ORDER) {
    if (fresh.length >= limit) break

    for (const card of cardsOfGroup(group)) {
      if (fresh.length >= limit) break
      if (states.has(card.id) || projected.has(card.id)) continue
      fresh.push({ cardId: card.id, state: null })
      projected.add(card.id)
    }

    if (!isGroupComplete(group, projected)) break
  }

  return fresh
}

export function buildQueue(input: BuildQueueInput): SessionCard[] {
  const { states, answeredCorrectly, today, newCardsLimit, newCardsUsedToday } = input

  const due: SessionCard[] = []
  for (const [cardId, state] of states) {
    if (state.dueDate && state.dueDate <= today) due.push({ cardId, state })
  }

  const remaining = Math.max(0, newCardsLimit - newCardsUsedToday)
  const fresh = collectNewCards(states, answeredCorrectly, remaining)

  return [...due, ...fresh]
}

export function requeueOnFailure(queue: readonly SessionCard[], cardId: string): SessionCard[] {
  const card = queue.find((c) => c.cardId === cardId)
  if (!card) return [...queue]
  return [...queue.filter((c) => c.cardId !== cardId), card]
}
