import type { CardState, Quality } from '@/core/srs'

export type AnswerMode = 'input' | 'choice'

export interface SessionCard {
  cardId: string
  state: CardState | null
}

export interface SessionAnswer {
  cardId: string
  quality: Quality
  mode: AnswerMode
  hintUsed: boolean
  answeredAt: string
  sessionId: string
}

export interface BuildQueueInput {
  states: ReadonlyMap<string, CardState>
  answeredCorrectly: ReadonlySet<string>
  today: string
  newCardsLimit: number
  newCardsUsedToday: number
}
