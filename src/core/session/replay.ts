import { initialCardState, applyAnswer } from '@/core/srs'
import type { CardState } from '@/core/srs'
import type { SessionAnswer } from './types'

export function replayAnswers(answers: readonly SessionAnswer[]): Map<string, CardState> {
  const ordered = [...answers].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt))
  const states = new Map<string, CardState>()

  for (const a of ordered) {
    const current = states.get(a.cardId) ?? initialCardState()
    states.set(a.cardId, applyAnswer(current, a.quality, new Date(a.answeredAt)))
  }

  return states
}

export function firstAnswersPerSession(answers: readonly SessionAnswer[], sessionId: string): SessionAnswer[] {
  const ordered = [...answers]
    .filter((a) => a.sessionId === sessionId)
    .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt))

  const seen = new Set<string>()
  const first: SessionAnswer[] = []
  for (const a of ordered) {
    if (seen.has(a.cardId)) continue
    seen.add(a.cardId)
    first.push(a)
  }
  return first
}
