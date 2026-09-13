'use server'

import { eq } from 'drizzle-orm'
import { db, users, userProgress } from '@/server/db'
import { hashPassword } from './password'
import { registerSchema } from './schemas'

export async function registerUser(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Что-то не так с полями — проверь ещё раз' }

  const { login, password, inviteCode } = parsed.data

  if (inviteCode !== process.env.INVITE_CODE) {
    return { ok: false, error: 'Код приглашения не подходит' }
  }

  const loginLower = login.toLowerCase()
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.loginLower, loginLower)).limit(1)
  if (existing.length > 0) return { ok: false, error: 'Такой логин уже заняли' }

  const passwordHash = await hashPassword(password)
  const [created] = await db.insert(users).values({ login, loginLower, passwordHash }).returning({ id: users.id })
  await db.insert(userProgress).values({ userId: created.id })

  return { ok: true }
}
