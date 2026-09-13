import { and, eq, gte, inArray, sql } from 'drizzle-orm'
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

  const startedBeforeToday = new Set(
    stateRows.filter((r) => r.createdAt.toISOString().slice(0, 10) < today()).map((r) => r.cardId),
  )
  const newCardsUsedToday = todayRows.filter((r) => !startedBeforeToday.has(r.cardId)).length

  return {
    states,
    answeredCorrectly: new Set(correctRows.map((r) => r.cardId)),
    newCardsUsedToday,
    newCardsPerDay: progressRow[0]?.newCardsPerDay ?? 10,
    streakDays: progressRow[0]?.streakDays ?? 0,
  }
}

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
    .where(and(eq(answers.userId, userId), inArray(answers.cardId, touched)))

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
