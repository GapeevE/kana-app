# Task 6: Пересчёт состояния по истории ответов

**Этап:** 1. Окружение и ядро
**Зависит от:** [Task 2](task-02-srs-core.md), [Task 5](task-05-session-queue.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


Сервер не доверяет клиентским вычислениям SM-2 и пересчитывает состояние заново по полной истории. Эта же функция разрешает конфликты при учёбе с двух устройств.

**Files:**
- Create: `src/core/session/replay.ts`
- Modify: `src/core/session/index.ts`
- Test: `src/core/session/replay.test.ts`

**Interfaces:**
- Consumes: `applyAnswer`, `initialCardState` из `@/core/srs`; `SessionAnswer` из `./types`
- Produces:
  - `function replayAnswers(answers: readonly SessionAnswer[]): Map<string, CardState>`
  - `function firstAnswersPerSession(answers: readonly SessionAnswer[], sessionId: string): SessionAnswer[]`

- [ ] **Step 1: Добавить sessionId в тип ответа**

В `src/core/session/types.ts` поле `sessionId` уже объявлено в Task 5. Убедиться, что интерфейс выглядит так:

```typescript
export interface SessionAnswer {
  cardId: string
  quality: Quality
  mode: AnswerMode
  hintUsed: boolean
  answeredAt: string
  sessionId: string
}
```

- [ ] **Step 2: Написать падающие тесты**

`src/core/session/replay.test.ts`:

```typescript
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
```

- [ ] **Step 3: Запустить тесты и убедиться, что они падают**

Run: `pnpm test`
Expected: FAIL — модуль `./replay` не найден.

- [ ] **Step 4: Реализовать пересчёт**

`src/core/session/replay.ts`:

```typescript
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
```

- [ ] **Step 5: Запустить тесты**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Дополнить индексный файл**

В `src/core/session/index.ts` добавить:

```typescript
export { replayAnswers, firstAnswersPerSession } from './replay'
```

- [ ] **Step 7: Передать на коммит**

```
feat: пересчёт состояния карточек по истории ответов
```

---

## Этап 2. Данные и доступ
