# Task 5: Сборка сессии тренировки

**Этап:** 1. Окружение и ядро
**Зависит от:** [Task 2](task-02-srs-core.md), [Task 3](task-03-kana-dataset.md), [Task 4](task-04-progression.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/core/session/types.ts`
- Create: `src/core/session/queue.ts`
- Create: `src/core/session/index.ts`
- Test: `src/core/session/queue.test.ts`

**Interfaces:**
- Consumes: `CardState`, `Quality` из `@/core/srs`; `KANA_CARDS`, `cardsOfGroup` из `@/data/kana`; `unlockedGroups` из `@/core/progression`
- Produces:
  - `interface SessionCard { cardId: string; state: CardState | null }`
  - `interface BuildQueueInput { states: ReadonlyMap<string, CardState>; answeredCorrectly: ReadonlySet<string>; today: string; newCardsLimit: number; newCardsUsedToday: number }`
  - `function buildQueue(input: BuildQueueInput): SessionCard[]`
  - `function nextCard(queue: readonly SessionCard[], answeredInSession: ReadonlyMap<string, Quality>): SessionCard | null`
  - `function requeueOnFailure(queue: readonly SessionCard[], cardId: string): SessionCard[]`
  - `const DEFAULT_NEW_CARDS_PER_DAY = 10`

- [ ] **Step 1: Написать падающие тесты**

`src/core/session/queue.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildQueue, requeueOnFailure, DEFAULT_NEW_CARDS_PER_DAY } from './queue'
import { initialCardState, applyAnswer } from '@/core/srs'
import type { CardState } from '@/core/srs'
import { cardsOfGroup } from '@/data/kana'

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
  it('у нового пользователя берёт карточки первой группы', () => {
    const queue = buildQueue(baseInput())
    const firstGroup = cardsOfGroup('hiragana_a').map((c) => c.id)
    expect(queue.every((c) => firstGroup.includes(c.cardId))).toBe(true)
    expect(queue.length).toBe(firstGroup.length)
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
  it('не выдаёт новых карточек из неоткрытой группы', () => {
    const queue = buildQueue(baseInput({ newCardsLimit: 100 }))
    const firstGroup = cardsOfGroup('hiragana_a').map((c) => c.id)
    expect(queue.length).toBe(firstGroup.length)
  })

  it('открывает следующую группу после освоения первой', () => {
    const answeredCorrectly = new Set(cardsOfGroup('hiragana_a').map((c) => c.id))
    const states = new Map(
      [...answeredCorrectly].map((id) => [id, { ...initialCardState(), interval: 5, repetitions: 1, dueDate: '2026-02-01' }] as const),
    )
    const queue = buildQueue(baseInput({ states, answeredCorrectly, newCardsLimit: 100 }))
    expect(queue.length).toBeGreaterThan(0)
    expect(queue.every((c) => !answeredCorrectly.has(c.cardId))).toBe(true)
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
```

- [ ] **Step 2: Запустить тесты и убедиться, что они падают**

Run: `pnpm test`
Expected: FAIL — модуль `./queue` не найден.

- [ ] **Step 3: Написать типы сессии**

`src/core/session/types.ts`:

```typescript
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
```

- [ ] **Step 4: Реализовать сборку очереди**

`src/core/session/queue.ts`:

```typescript
import { KANA_CARDS } from '@/data/kana'
import { unlockedGroups } from '@/core/progression'
import type { BuildQueueInput, SessionCard } from './types'

export const DEFAULT_NEW_CARDS_PER_DAY = 10

export function buildQueue(input: BuildQueueInput): SessionCard[] {
  const { states, answeredCorrectly, today, newCardsLimit, newCardsUsedToday } = input

  const due: SessionCard[] = []
  for (const [cardId, state] of states) {
    if (state.dueDate && state.dueDate <= today) due.push({ cardId, state })
  }

  const remaining = Math.max(0, newCardsLimit - newCardsUsedToday)
  const open = new Set(unlockedGroups(answeredCorrectly))
  const fresh: SessionCard[] = []
  for (const card of KANA_CARDS) {
    if (fresh.length >= remaining) break
    if (states.has(card.id)) continue
    if (!open.has(card.group)) continue
    fresh.push({ cardId: card.id, state: null })
  }

  return [...due, ...fresh]
}

export function requeueOnFailure(queue: readonly SessionCard[], cardId: string): SessionCard[] {
  const card = queue.find((c) => c.cardId === cardId)
  if (!card) return [...queue]
  return [...queue.filter((c) => c.cardId !== cardId), card]
}
```

- [ ] **Step 5: Запустить тесты**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Создать индексный файл**

`src/core/session/index.ts`:

```typescript
export { buildQueue, requeueOnFailure, DEFAULT_NEW_CARDS_PER_DAY } from './queue'
export type { SessionCard, SessionAnswer, AnswerMode, BuildQueueInput } from './types'
```

- [ ] **Step 7: Передать на коммит**

```
feat: сборка очереди сессии с повторениями и лимитом новых карточек
```
