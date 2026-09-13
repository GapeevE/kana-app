import { describe, it, expect } from 'vitest'
import { replayAnswers, firstAnswersPerSession } from './replay'
import { initialCardState, applyAnswer } from '@/core/srs'
import type { SessionAnswer } from './types'

function answer(cardId: string, quality: 0 | 2 | 3 | 4 | 5, answeredAt: string, sessionId = 's1'): SessionAnswer {
  return { cardId, quality, mode: 'input', hintUsed: false, answeredAt, sessionId }
}

describe('replayAnswers', () => {
  it('для пустой истории возвращает пустую карту', () => {
    expect(replayAnswers([]).size).toBe(0)
  })

  it('воспроизводит состояние одной карточки', () => {
    const at = '2026-01-10T12:00:00.000Z'
    const result = replayAnswers([answer('hiragana_a', 5, at)])
    const expected = applyAnswer(initialCardState(), 5, new Date(at))
    expect(result.get('hiragana_a')).toEqual(expected)
  })

  it('применяет ответы в хронологическом порядке независимо от порядка во входных данных', () => {
    const early = answer('hiragana_a', 5, '2026-01-10T10:00:00.000Z')
    const late = answer('hiragana_a', 5, '2026-01-11T10:00:00.000Z')
    const forward = replayAnswers([early, late])
    const shuffled = replayAnswers([late, early])
    expect(shuffled.get('hiragana_a')).toEqual(forward.get('hiragana_a'))
  })

  it('разделяет состояния разных карточек', () => {
    const result = replayAnswers([
      answer('hiragana_a', 5, '2026-01-10T10:00:00.000Z'),
      answer('hiragana_i', 0, '2026-01-10T10:01:00.000Z'),
    ])
    expect(result.get('hiragana_a')!.repetitions).toBe(1)
    expect(result.get('hiragana_i')!.repetitions).toBe(0)
  })
})

describe('firstAnswersPerSession', () => {
  it('оставляет только первый ответ по каждой карточке в сессии', () => {
    const answers = [
      answer('hiragana_a', 0, '2026-01-10T10:00:00.000Z'),
      answer('hiragana_a', 5, '2026-01-10T10:05:00.000Z'),
      answer('hiragana_i', 3, '2026-01-10T10:06:00.000Z'),
    ]
    const first = firstAnswersPerSession(answers, 's1')
    expect(first.length).toBe(2)
    expect(first.find((a) => a.cardId === 'hiragana_a')!.quality).toBe(0)
  })

  it('игнорирует ответы других сессий', () => {
    const answers = [
      answer('hiragana_a', 5, '2026-01-10T10:00:00.000Z', 's1'),
      answer('hiragana_i', 5, '2026-01-10T10:01:00.000Z', 's2'),
    ]
    expect(firstAnswersPerSession(answers, 's1').length).toBe(1)
  })
})
