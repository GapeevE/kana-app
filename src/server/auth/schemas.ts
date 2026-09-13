import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().min(3).max(32).regex(/^[A-Za-z0-9_-]+$/),
  password: z.string().min(8),
})

export const registerSchema = loginSchema.extend({
  inviteCode: z.string().min(1),
  acknowledged: z.literal(true),
})
