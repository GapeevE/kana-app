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
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
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
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
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
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cardId: text('card_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('favorites_user_card_idx').on(t.userId, t.cardId)],
)

export const userProgress = pgTable('user_progress', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  streakDays: integer('streak_days').notNull().default(0),
  lastSessionDate: date('last_session_date'),
  newCardsPerDay: integer('new_cards_per_day').notNull().default(10),
})
