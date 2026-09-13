# Task 7: Схема базы данных

**Этап:** 2. Данные и доступ
**Зависит от:** [Task 1](task-01-setup.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

> **Доступы получены.** `.env.local` заполнен: база Neon (`us-east-1`, PostgreSQL 18.6), `AUTH_SECRET` сгенерирован, `INVITE_CODE` задан.

---


**Files:**
- Create: `drizzle.config.ts`
- Create: `src/server/db/schema.ts`
- Create: `src/server/db/client.ts`
- Create: `src/server/db/index.ts`
- Create: `.env.local` (не коммитится)

**Interfaces:**
- Consumes: `DATABASE_URL`
- Produces:
  - Таблицы `users`, `cardStates`, `answers`, `favorites`, `userProgress`
  - `const db` — экземпляр Drizzle

- [ ] **Step 1: Запросить подключение к базе**

Владелец продукта предоставляет из панели Neon две строки подключения, обе записываются в `.env.local`:

- `DATABASE_URL` — через pooler, используется приложением
- `DATABASE_URL_UNPOOLED` — прямое подключение, используется миграциями: drizzle-kit не работает через pgbouncer

Сгенерировать `AUTH_SECRET` и дописать туда же:

```bash
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

Добавить `INVITE_CODE` со значением, которое назначит владелец продукта.

- [ ] **Step 2: Создать drizzle.config.ts**

```typescript
import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })

export default {
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
} satisfies Config
```

Два отличия от стандартной конфигурации:

- `dotenv` нацелен на `.env.local`: импорт `dotenv/config` читает только `.env`, которого в проекте нет.
- Используется `DATABASE_URL_UNPOOLED` — прямое подключение. Через pgbouncer миграции не выполняются.

- [ ] **Step 3: Описать схему**

`src/server/db/schema.ts`:

```typescript
import { pgTable, uuid, text, integer, real, date, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    login: text('login').notNull(),
    loginLower: text('login_lower').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_login_lower_idx').on(t.loginLower)],
)

export const cardStates = pgTable(
  'card_states',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    cardId: text('card_id').notNull(),
    easeFactor: real('ease_factor').notNull(),
    interval: integer('interval').notNull(),
    repetitions: integer('repetitions').notNull(),
    dueDate: date('due_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('card_states_user_card_idx').on(t.userId, t.cardId),
    index('card_states_due_idx').on(t.userId, t.dueDate),
  ],
)

export const answers = pgTable(
  'answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    cardId: text('card_id').notNull(),
    quality: integer('quality').notNull(),
    mode: text('mode').notNull(),
    hintUsed: integer('hint_used').notNull(),
    sessionId: uuid('session_id').notNull(),
    answeredAt: timestamp('answered_at', { withTimezone: true }).notNull(),
  },
  (t) => [
    index('answers_user_card_idx').on(t.userId, t.cardId),
    uniqueIndex('answers_dedup_idx').on(t.userId, t.sessionId, t.cardId, t.answeredAt),
  ],
)

export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    cardId: text('card_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('favorites_user_card_idx').on(t.userId, t.cardId)],
)

export const userProgress = pgTable('user_progress', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  streakDays: integer('streak_days').notNull().default(0),
  lastSessionDate: date('last_session_date'),
  newCardsPerDay: integer('new_cards_per_day').notNull().default(10),
})
```

Индекс `answers_dedup_idx` делает повторную отправку одного и того же пакета безвредной: дубликат отклоняется базой, а не создаёт лишнюю запись. Поле `unlocked_groups` из спеки не хранится — набор открытых групп вычисляется из истории ответов функцией `unlockedGroups`, что исключает рассогласование.

- [ ] **Step 4: Создать клиент базы**

`src/server/db/client.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })
```

- [ ] **Step 5: Создать индексный файл**

`src/server/db/index.ts`:

```typescript
export { db } from './client'
export * from './schema'
```

- [ ] **Step 6: Сгенерировать миграцию**

Run: `pnpm db:generate`
Expected: в каталоге `drizzle/` появляется SQL-файл с созданием пяти таблиц.

- [ ] **Step 7: Применить миграцию**

Run: `pnpm db:migrate`
Expected: миграция применяется без ошибок.

- [ ] **Step 8: Проверить, что таблицы созданы**

Run: `pnpm db:studio`
Expected: в браузере открывается Drizzle Studio, видны пять таблиц. Закрыть после проверки.

- [ ] **Step 9: Передать на коммит**

```
feat: схема базы данных и подключение к Neon
```
