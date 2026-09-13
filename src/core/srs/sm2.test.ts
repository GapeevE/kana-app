import { describe, it, expect } from 'vitest'
import { initialCardState, applyAnswer, INITIAL_EASE_FACTOR, MIN_EASE_FACTOR } from './sm2'

const AT = new Date('2026-01-10T12:00:00Z')

describe('initialCardState', () => {
  it('начинает с ease factor 2.5 и нулевых счётчиков', () => {
    const s = initialCardState()
    expect(s.easeFactor).toBe(INITIAL_EASE_FACTOR)
    expect(s.interval).toBe(0)
    expect(s.repetitions).toBe(0)
  })
})

describe('applyAnswer: первый успешный ответ', () => {
  it('назначает интервал 1 день', () => {
    const s = applyAnswer(initialCardState(), 5, AT)
    expect(s.interval).toBe(1)
    expect(s.repetitions).toBe(1)
    expect(s.dueDate).toBe('2026-01-11')
  })
})

describe('applyAnswer: второй успешный ответ', () => {
  it('назначает интервал 6 дней', () => {
    const first = applyAnswer(initialCardState(), 5, AT)
    const second = applyAnswer(first, 5, AT)
    expect(second.interval).toBe(6)
    expect(second.repetitions).toBe(2)
    expect(second.dueDate).toBe('2026-01-16')
  })
})

describe('applyAnswer: третий и последующие', () => {
  it('умножает интервал на ease factor', () => {
    let s = applyAnswer(initialCardState(), 4, AT)
    s = applyAnswer(s, 4, AT)
    const before = s
    const third = applyAnswer(before, 4, AT)
    expect(third.interval).toBe(Math.round(before.interval * before.easeFactor))
    expect(third.repetitions).toBe(3)
  })
})

describe('applyAnswer: quality 0 — полный сброс', () => {
  it('сбрасывает интервал и повторения, снижает ease factor', () => {
    let s = applyAnswer(initialCardState(), 5, AT)
    s = applyAnswer(s, 5, AT)
    const easeBefore = s.easeFactor
    const failed = applyAnswer(s, 0, AT)
    expect(failed.interval).toBe(1)
    expect(failed.repetitions).toBe(0)
    expect(failed.easeFactor).toBeLessThan(easeBefore)
    expect(failed.dueDate).toBe('2026-01-11')
  })
})

describe('applyAnswer: quality 2 — интервал не растёт', () => {
  it('сохраняет прежний интервал и снижает ease factor', () => {
    let s = applyAnswer(initialCardState(), 5, AT)
    s = applyAnswer(s, 5, AT)
    expect(s.interval).toBe(6)
    const easeBefore = s.easeFactor
    const held = applyAnswer(s, 2, AT)
    expect(held.interval).toBe(6)
    expect(held.dueDate).toBe('2026-01-16')
    expect(held.easeFactor).toBeLessThan(easeBefore)
  })

  it('не сбрасывает счётчик повторений', () => {
    let s = applyAnswer(initialCardState(), 5, AT)
    s = applyAnswer(s, 5, AT)
    const held = applyAnswer(s, 2, AT)
    expect(held.repetitions).toBe(s.repetitions)
  })

  it('на новой карточке даёт интервал 1 день', () => {
    const held = applyAnswer(initialCardState(), 2, AT)
    expect(held.interval).toBe(1)
    expect(held.dueDate).toBe('2026-01-11')
  })
})

describe('ease factor', () => {
  it('растёт при quality 5', () => {
    const s = applyAnswer(initialCardState(), 5, AT)
    expect(s.easeFactor).toBeGreaterThan(INITIAL_EASE_FACTOR)
  })

  it('не опускается ниже минимума при серии провалов', () => {
    let s = initialCardState()
    for (let i = 0; i < 20; i++) s = applyAnswer(s, 0, AT)
    expect(s.easeFactor).toBe(MIN_EASE_FACTOR)
  })
})

describe('чистота функции', () => {
  it('не изменяет переданное состояние', () => {
    const s = initialCardState()
    const snapshot = { ...s }
    applyAnswer(s, 5, AT)
    expect(s).toEqual(snapshot)
  })
})
