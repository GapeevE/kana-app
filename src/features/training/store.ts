'use client'

import { create } from 'zustand'
import { requeueOnFailure } from '@/core/session'
import type { SessionAnswer, SessionCard } from '@/core/session'
import type { Quality } from '@/core/srs'
import type { KanaCard } from '@/data/kana'

export type Mode = 'input' | 'choice'

interface TrainingState {
  sessionId: string
  queue: SessionCard[]
  cards: Map<string, KanaCard>
  pending: SessionAnswer[]
  mode: Mode
  hintUsed: boolean
  answeredCount: number
  finished: boolean

  init: (sessionId: string, items: Array<{ card: KanaCard; state: SessionCard['state'] }>) => void
  setMode: (mode: Mode) => void
  useHint: () => void
  answer: (correct: boolean) => Quality
  drainPending: () => SessionAnswer[]
}

function qualityFor(mode: Mode, hintUsed: boolean, correct: boolean): Quality {
  if (!correct) return 0
  if (mode === 'input') return hintUsed ? 4 : 5
  return hintUsed ? 2 : 3
}

export const useTraining = create<TrainingState>((set, get) => ({
  sessionId: '',
  queue: [],
  cards: new Map(),
  pending: [],
  mode: 'input',
  hintUsed: false,
  answeredCount: 0,
  finished: false,

  init: (sessionId, items) =>
    set({
      sessionId,
      queue: items.map((i) => ({ cardId: i.card.id, state: i.state })),
      cards: new Map(items.map((i) => [i.card.id, i.card])),
      pending: [],
      mode: 'input',
      hintUsed: false,
      answeredCount: 0,
      finished: items.length === 0,
    }),

  setMode: (mode) => set((s) => ({ mode: s.mode === 'input' && mode === 'choice' ? 'choice' : s.mode })),

  useHint: () => set({ hintUsed: true }),

  answer: (correct) => {
    const state = get()
    const current = state.queue[0]
    const quality = qualityFor(state.mode, state.hintUsed, correct)

    const record: SessionAnswer = {
      cardId: current.cardId,
      quality,
      mode: state.mode,
      hintUsed: state.hintUsed,
      sessionId: state.sessionId,
      answeredAt: new Date().toISOString(),
    }

    const nextQueue = quality === 0 ? requeueOnFailure(state.queue, current.cardId) : state.queue.slice(1)

    set({
      queue: nextQueue,
      pending: [...state.pending, record],
      answeredCount: state.answeredCount + 1,
      mode: 'input',
      hintUsed: false,
      finished: nextQueue.length === 0,
    })

    return quality
  },

  drainPending: () => {
    const pending = get().pending
    set({ pending: [] })
    return pending
  },
}))
