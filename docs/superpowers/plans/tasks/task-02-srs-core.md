# Task 2: Ядро SM-2

**Этап:** 1. Окружение и ядро
**Зависит от:** [Task 1](task-01-setup.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


Самая ответственная часть системы. Ошибка здесь портит прогресс пользователя месяцами и обнаруживается не сразу — поэтому задача целиком строится от тестов.

**Files:**
- Create: `src/core/srs/types.ts`
- Create: `src/core/srs/sm2.ts`
- Create: `src/core/srs/index.ts`
- Test: `src/core/srs/sm2.test.ts`

**Interfaces:**
- Consumes: ничего
- Produces:
  - `type Quality = 0 | 2 | 3 | 4 | 5`
  - `interface CardState { easeFactor: number; interval: number; repetitions: number; dueDate: string }`
  - `function initialCardState(): CardState`
  - `function applyAnswer(state: CardState, quality: Quality, answeredAt: Date): CardState`
  - Константы `INITIAL_EASE_FACTOR = 2.5`, `MIN_EASE_FACTOR = 1.3`

Поле `dueDate` — строка формата `YYYY-MM-DD` (календарный день, не момент времени). Причина: повторения планируются по дням, а не по часам; строка исключает расхождения часовых поясов между клиентом и сервером.

- [ ] **Step 1: Написать типы**

`src/core/srs/types.ts`:

```typescript
export type Quality = 0 | 2 | 3 | 4 | 5

export interface CardState {
  easeFactor: number
  interval: number
  repetitions: number
  dueDate: string
}
```

- [ ] **Step 2: Написать падающие тесты**

`src/core/srs/sm2.test.ts`:

```typescript
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
```

- [ ] **Step 3: Запустить тесты и убедиться, что они падают**

Run: `pnpm test`
Expected: FAIL — модуль `./sm2` не найден.

- [ ] **Step 4: Реализовать SM-2**

`src/core/srs/sm2.ts`:

```typescript
import type { CardState, Quality } from './types'

export const INITIAL_EASE_FACTOR = 2.5
export const MIN_EASE_FACTOR = 1.3

function addDays(from: Date, days: number): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function adjustEase(easeFactor: number, quality: Quality): number {
  const q = quality
  const next = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
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
```

- [ ] **Step 5: Создать индексный файл**

`src/core/srs/index.ts`:

```typescript
export { initialCardState, applyAnswer, INITIAL_EASE_FACTOR, MIN_EASE_FACTOR } from './sm2'
export type { CardState, Quality } from './types'
```

- [ ] **Step 6: Запустить тесты**

Run: `pnpm test`
Expected: PASS, все тесты зелёные.

- [ ] **Step 7: Передать на коммит**

```
feat: ядро SM-2 с модифицированной обработкой quality 0 и 2
```
