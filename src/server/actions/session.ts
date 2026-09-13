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
  sessionId: z.uuid(),
  answeredAt: z.iso.datetime(),
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
