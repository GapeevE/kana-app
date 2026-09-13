import { describe, it, expect } from 'vitest'
import { buildQueue, requeueOnFailure, DEFAULT_NEW_CARDS_PER_DAY } from './queue'
import { initialCardState } from '@/core/srs'
import type { CardState } from '@/core/srs'
import { cardsOfGroup, KANA_BY_ID } from '@/data/kana'

const TODAY = '2026-01-10'

function dueState(dueDate: string): CardState {
  return { ...initialCardState(), interval: 3, repetitions: 2, dueDate }
}

function baseInput(overrides = {}) {
  return {
    states: new Map<string, CardState>(),
    answeredCorrectly: new Set<string>(),
    today: TODAY,
    newCardsLimit: DEFAULT_NEW_CARDS_PER_DAY,
    newCardsUsedToday: 0,
    ...overrides,
  }
}

describe('buildQueue: новые карточки', () => {
  it('у нового пользователя начинает с первой группы', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 5 }))
    const firstGroup = cardsOfGroup('hiragana_a').map((c) => c.id)
    expect(queue.map((c) => c.cardId)).toEqual(firstGroup)
  })

  it('не превышает дневной лимит новых карточек', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 3 }))
    expect(queue.length).toBe(3)
  })

  it('учитывает уже показанные сегодня новые карточки', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 5, newCardsUsedToday: 4 }))
    expect(queue.length).toBe(1)
  })

  it('не выдаёт новых карточек при исчерпанном лимите', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 5, newCardsUsedToday: 5 }))
    expect(queue.length).toBe(0)
  })

  it('у новых карточек состояние отсутствует', () => {
    const queue = buildQueue(baseInput())
    expect(queue[0].state).toBeNull()
  })
})

describe('buildQueue: повторения', () => {
  it('включает карточки, срок которых наступил', () => {
    const states = new Map([['hiragana_a', dueState(TODAY)]])
    const queue = buildQueue(baseInput({ states, newCardsLimit: 0 }))
    expect(queue.map((c) => c.cardId)).toEqual(['hiragana_a'])
  })

  it('включает просроченные карточки', () => {
    const states = new Map([['hiragana_a', dueState('2026-01-01')]])
    const queue = buildQueue(baseInput({ states, newCardsLimit: 0 }))
    expect(queue.length).toBe(1)
  })

  it('не включает карточки с будущим сроком', () => {
    const states = new Map([['hiragana_a', dueState('2026-02-01')]])
    const queue = buildQueue(baseInput({ states, newCardsLimit: 0 }))
    expect(queue.length).toBe(0)
  })

  it('ставит повторения перед новыми карточками', () => {
    const states = new Map([['hiragana_o', dueState(TODAY)]])
    const queue = buildQueue(baseInput({ states, newCardsLimit: 2 }))
    expect(queue[0].cardId).toBe('hiragana_o')
  })

  it('передаёт состояние повторяемой карточки', () => {
    const state = dueState(TODAY)
    const states = new Map([['hiragana_a', state]])
    const queue = buildQueue(baseInput({ states, newCardsLimit: 0 }))
    expect(queue[0].state).toEqual(state)
  })
})

describe('buildQueue: границы открытых групп', () => {
  it('добирает следующие группы, считая текущую пройденной внутри сессии', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 8 }))
    expect(queue.length).toBe(8)
    const groups = new Set(queue.map((c) => KANA_BY_ID.get(c.cardId)!.group))
    expect(groups).toEqual(new Set(['hiragana_a', 'hiragana_k']))
  })

  it('выдаёт группы в порядке прохождения', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 12 }))
    const groups = queue.map((c) => KANA_BY_ID.get(c.cardId)!.group)
    expect(groups.slice(0, 5).every((g) => g === 'hiragana_a')).toBe(true)
    expect(groups.slice(5, 10).every((g) => g === 'hiragana_k')).toBe(true)
    expect(groups.slice(10).every((g) => g === 'hiragana_s')).toBe(true)
  })

  it('не выходит за пределы лимита при добирании групп', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 7 }))
    expect(queue.length).toBe(7)
  })

  it('продолжает с группы, следующей за освоенными', () => {
    const answeredCorrectly = new Set(cardsOfGroup('hiragana_a').map((c) => c.id))
    const states = new Map(
      [...answeredCorrectly].map(
        (id) => [id, { ...initialCardState(), interval: 5, repetitions: 1, dueDate: '2026-02-01' }] as const,
      ),
    )
    const queue = buildQueue(baseInput({ states, answeredCorrectly, newCardsLimit: 5 }))
    expect(queue.length).toBe(5)
    expect(queue.every((c) => KANA_BY_ID.get(c.cardId)!.group === 'hiragana_k')).toBe(true)
  })

  it('не выдаёт знаки из групп за пределами незавершённой', () => {
    const partial = new Set(['hiragana_a', 'hiragana_i'])
    const states = new Map(
      [...partial].map((id) => [id, { ...initialCardState(), interval: 5, repetitions: 1, dueDate: '2026-02-01' }] as const),
    )
    const queue = buildQueue(baseInput({ states, answeredCorrectly: partial, newCardsLimit: 100 }))
    const groups = new Set(queue.map((c) => KANA_BY_ID.get(c.cardId)!.group))
    expect(groups.has('hiragana_a')).toBe(true)
    expect(groups.has('hiragana_k')).toBe(true)
  })
})

describe('requeueOnFailure', () => {
  it('перемещает карточку в конец очереди', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 3 }))
    const firstId = queue[0].cardId
    const requeued = requeueOnFailure(queue, firstId)
    expect(requeued.length).toBe(queue.length)
    expect(requeued[requeued.length - 1].cardId).toBe(firstId)
    expect(requeued[0].cardId).not.toBe(firstId)
  })

  it('не изменяет исходную очередь', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 3 }))
    const snapshot = [...queue]
    requeueOnFailure(queue, queue[0].cardId)
    expect(queue).toEqual(snapshot)
  })
})
