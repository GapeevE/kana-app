import type { CardState, Quality } from './types'

export const INITIAL_EASE_FACTOR = 2.5
export const MIN_EASE_FACTOR = 1.3

function addDays(from: Date, days: number): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function adjustEase(easeFactor: number, quality: Quality): number {
  const next = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  return Math.max(MIN_EASE_FACTOR, next)
}

export function initialCardState(): CardState {
  return {
    easeFactor: INITIAL_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    dueDate: '',
  }
}

export function applyAnswer(state: CardState, quality: Quality, answeredAt: Date): CardState {
  const easeFactor = adjustEase(state.easeFactor, quality)

  if (quality === 0) {
    return { easeFactor, interval: 1, repetitions: 0, dueDate: addDays(answeredAt, 1) }
  }

  if (quality === 2) {
    const interval = state.interval === 0 ? 1 : state.interval
    return { easeFactor, interval, repetitions: state.repetitions, dueDate: addDays(answeredAt, interval) }
  }

  const repetitions = state.repetitions + 1
  let interval: number
  if (repetitions === 1) interval = 1
  else if (repetitions === 2) interval = 6
  else interval = Math.round(state.interval * state.easeFactor)

  return { easeFactor, interval, repetitions, dueDate: addDays(answeredAt, interval) }
}
