# Task 9: Репозиторий прогресса

**Этап:** 2. Данные и доступ
**Зависит от:** [Task 6](task-06-replay.md), [Task 7](task-07-database.md), [Task 8](task-08-auth.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/server/repository/progress.ts`
- Create: `src/server/repository/favorites.ts`
- Create: `src/server/repository/index.ts`

**Interfaces:**
- Consumes: `db` и таблицы из `@/server/db`; `replayAnswers`, `firstAnswersPerSession` из `@/core/session`; `CardState` из `@/core/srs`
- Produces:
  - `async function loadUserData(userId: string): Promise<UserData>` где `interface UserData { states: Map<string, CardState>; answeredCorrectly: Set<string>; newCardsUsedToday: number; newCardsPerDay: number; streakDays: number }`
  - `async function submitAnswers(userId: string, batch: readonly SessionAnswer[]): Promise<void>`
  - `async function listFavorites(userId: string): Promise<string[]>`
  - `async function toggleFavorite(userId: string, cardId: string): Promise<boolean>` — возвращает новое состояние

- [ ] **Step 1: Реализовать загрузку данных пользователя**

`src/server/repository/progress.ts`:

```typescript
import { and, eq, gte, sql } from 'drizzle-orm'
import { db, cardStates, answers, userProgress } from '@/server/db'
import { replayAnswers } from '@/core/session'
import type { SessionAnswer } from '@/core/session'
import type { CardState, Quality } from '@/core/srs'

export interface UserData {
  states: Map<string, CardState>
  answeredCorrectly: Set<string>
  newCardsUsedToday: number
  newCardsPerDay: number
  streakDays: number
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function loadUserData(userId: string): Promise<UserData> {
  const [stateRows, correctRows, progressRow, todayRows] = await Promise.all([
    db.select().from(cardStates).where(eq(cardStates.userId, userId)),
    db
      .selectDistinct({ cardId: answers.cardId })
      .from(answers)
      .where(and(eq(answers.userId, userId), gte(answers.quality, 2))),
    db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1),
    db
      .selectDistinct({ cardId: answers.cardId })
      .from(answers)
      .where(and(eq(answers.userId, userId), sql`${answers.answeredAt}::date = current_date`)),
  ])

  const states = new Map<string, CardState>(
    stateRows.map((r) => [
      r.cardId,
      { easeFactor: r.easeFactor, interval: r.interval, repetitions: r.repetitions, dueDate: r.dueDate },
    ]),
  )

  const previouslyKnown = new Set(stateRows.map((r) => r.cardId))
  const newCardsUsedToday = todayRows.filter((r) => !previouslyKnown.has(r.cardId)).length

  return {
    states,
    answeredCorrectly: new Set(correctRows.map((r) => r.cardId)),
    newCardsUsedToday,
    newCardsPerDay: progressRow[0]?.newCardsPerDay ?? 10,
    streakDays: progressRow[0]?.streakDays ?? 0,
  }
}
```

- [ ] **Step 2: Реализовать приём пакета ответов**

Дописать в `src/server/repository/progress.ts`:

```typescript
export async function submitAnswers(userId: string, batch: readonly SessionAnswer[]): Promise<void> {
  if (batch.length === 0) return

  await db
    .insert(answers)
    .values(
      batch.map((a) => ({
        userId,
        cardId: a.cardId,
        quality: a.quality,
        mode: a.mode,
        hintUsed: a.hintUsed ? 1 : 0,
        sessionId: a.sessionId,
        answeredAt: new Date(a.answeredAt),
      })),
    )
    .onConflictDoNothing()

  const touched = [...new Set(batch.map((a) => a.cardId))]

  const history = await db
    .select()
    .from(answers)
    .where(and(eq(answers.userId, userId), sql`${answers.cardId} = ANY(${touched})`))

  const asSessionAnswers: SessionAnswer[] = history.map((r) => ({
    cardId: r.cardId,
    quality: r.quality as Quality,
    mode: r.mode as 'input' | 'choice',
    hintUsed: r.hintUsed === 1,
    sessionId: r.sessionId,
    answeredAt: r.answeredAt.toISOString(),
  }))

  const recomputed = replayAnswers(asSessionAnswers)

  for (const [cardId, state] of recomputed) {
    await db
      .insert(cardStates)
      .values({
        userId,
        cardId,
        easeFactor: state.easeFactor,
        interval: state.interval,
        repetitions: state.repetitions,
        dueDate: state.dueDate,
      })
      .onConflictDoUpdate({
        target: [cardStates.userId, cardStates.cardId],
        set: {
          easeFactor: state.easeFactor,
          interval: state.interval,
          repetitions: state.repetitions,
          dueDate: state.dueDate,
          updatedAt: new Date(),
        },
      })
  }

  await updateStreak(userId)
}

async function updateStreak(userId: string): Promise<void> {
  const [row] = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1)
  const t = today()
  if (row?.lastSessionDate === t) return

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const streak = row?.lastSessionDate === yesterday ? (row.streakDays ?? 0) + 1 : 1

  await db
    .insert(userProgress)
    .values({ userId, streakDays: streak, lastSessionDate: t })
    .onConflictDoUpdate({
      target: userProgress.userId,
      set: { streakDays: streak, lastSessionDate: t },
    })
}
```

Пересчёт ведётся по полной истории затронутых карточек, а не по присланному пакету. Это делает повторную отправку безопасной и корректно разрешает конфликт при учёбе с двух устройств: порядок определяется временем ответа.

- [ ] **Step 3: Реализовать избранное**

`src/server/repository/favorites.ts`:

```typescript
import { and, eq } from 'drizzle-orm'
import { db, favorites } from '@/server/db'

export async function listFavorites(userId: string): Promise<string[]> {
  const rows = await db.select({ cardId: favorites.cardId }).from(favorites).where(eq(favorites.userId, userId))
  return rows.map((r) => r.cardId)
}

export async function toggleFavorite(userId: string, cardId: string): Promise<boolean> {
  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.cardId, cardId)))
    .limit(1)

  if (existing.length > 0) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.cardId, cardId)))
    return false
  }

  await db.insert(favorites).values({ userId, cardId })
  return true
}
```

- [ ] **Step 4: Создать индексный файл**

`src/server/repository/index.ts`:

```typescript
export { loadUserData, submitAnswers } from './progress'
export type { UserData } from './progress'
export { listFavorites, toggleFavorite } from './favorites'
```

- [ ] **Step 5: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 6: Передать на коммит**

```
feat: репозитории прогресса и избранного с серверным пересчётом SM-2
```
