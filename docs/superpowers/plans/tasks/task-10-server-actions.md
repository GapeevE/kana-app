# Task 10: Серверные действия

**Этап:** 2. Данные и доступ
**Зависит от:** [Task 5](task-05-session-queue.md), [Task 8](task-08-auth.md), [Task 9](task-09-repository.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/server/actions/session.ts`
- Create: `src/server/actions/favorites.ts`

**Interfaces:**
- Consumes: `requireUserId` из `@/server/auth`; репозитории из `@/server/repository`; `buildQueue` из `@/core/session`
- Produces:
  - `async function startSession(): Promise<{ sessionId: string; cards: Array<{ card: KanaCard; state: CardState | null }>; dueCount: number; newCount: number }>`
  - `async function syncAnswers(batch: unknown): Promise<{ ok: boolean }>`
  - `async function toggleFavoriteAction(cardId: string): Promise<boolean>`

- [ ] **Step 1: Написать действие старта сессии**

`src/server/actions/session.ts`:

```typescript
'use server'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireUserId } from '@/server/auth'
import { loadUserData, submitAnswers } from '@/server/repository'
import { buildQueue } from '@/core/session'
import { KANA_BY_ID } from '@/data/kana'

export async function startSession() {
  const userId = await requireUserId()
  const data = await loadUserData(userId)
  const today = new Date().toISOString().slice(0, 10)

  const queue = buildQueue({
    states: data.states,
    answeredCorrectly: data.answeredCorrectly,
    today,
    newCardsLimit: data.newCardsPerDay,
    newCardsUsedToday: data.newCardsUsedToday,
  })

  const cards = queue.map((item) => ({
    card: KANA_BY_ID.get(item.cardId)!,
    state: item.state,
  }))

  return {
    sessionId: randomUUID(),
    cards,
    dueCount: queue.filter((c) => c.state !== null).length,
    newCount: queue.filter((c) => c.state === null).length,
  }
}

const answerSchema = z.object({
  cardId: z.string().min(1),
  quality: z.union([z.literal(0), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  mode: z.enum(['input', 'choice']),
  hintUsed: z.boolean(),
  sessionId: z.string().uuid(),
  answeredAt: z.string().datetime(),
})

const batchSchema = z.array(answerSchema).max(500)

export async function syncAnswers(batch: unknown): Promise<{ ok: boolean }> {
  const userId = await requireUserId()
  const parsed = batchSchema.safeParse(batch)
  if (!parsed.success) return { ok: false }

  const known = parsed.data.filter((a) => KANA_BY_ID.has(a.cardId))
  await submitAnswers(userId, known)
  return { ok: true }
}
```

Валидация Zod и фильтрация по известным `cardId` — обязательная часть: клиент может прислать что угодно, а SM-2 пересчитывается на основе этих данных.

- [ ] **Step 2: Написать действие избранного**

`src/server/actions/favorites.ts`:

```typescript
'use server'

import { requireUserId } from '@/server/auth'
import { toggleFavorite } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'

export async function toggleFavoriteAction(cardId: string): Promise<boolean> {
  const userId = await requireUserId()
  if (!KANA_BY_ID.has(cardId)) return false
  return toggleFavorite(userId, cardId)
}
```

- [ ] **Step 3: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 4: Передать на коммит**

```
feat: серверные действия старта сессии и синхронизации ответов
```

---

## Этап 3. Интерфейс
