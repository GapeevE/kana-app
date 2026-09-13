# Task 8: Аутентификация

**Этап:** 2. Данные и доступ
**Зависит от:** [Task 7](task-07-database.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/server/auth/config.ts`
- Create: `src/server/auth/schemas.ts`
- Create: `src/server/auth/password.ts`
- Create: `src/server/auth/actions.ts`
- Create: `src/server/auth/index.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: `db`, `users`, `userProgress` из `@/server/db`
- Produces:
  - `const { handlers, auth, signIn, signOut }` из `@/server/auth`
  - `async function registerUser(input: { login: string; password: string; inviteCode: string }): Promise<{ ok: true } | { ok: false; error: string }>`
  - `async function requireUserId(): Promise<string>` — возвращает id текущего пользователя или бросает ошибку
  - `const loginSchema`, `const registerSchema` — схемы Zod

- [ ] **Step 1: Реализовать хеширование паролей**

`src/server/auth/password.ts`:

```typescript
import bcrypt from 'bcryptjs'

const COST = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

- [ ] **Step 2: Описать схемы валидации**

Схемы выносятся в отдельный файл `src/server/auth/schemas.ts`, а не в `actions.ts`: модуль с директивой `'use server'` может экспортировать только асинхронные функции, а `loginSchema` нужна ещё и в конфигурации Auth.js.

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().min(3).max(32).regex(/^[A-Za-z0-9_-]+$/),
  password: z.string().min(8),
})

export const registerSchema = loginSchema.extend({
  inviteCode: z.string().min(1),
  acknowledged: z.literal(true),
})
```

Поле `acknowledged` — подтверждение того, что пользователь понимает невозможность восстановления пароля (спека, п. 2.2). Значение `true` обязательно, иначе регистрация отклоняется.

Синтаксис приведён для Zod 4, установленного в проекте.

- [ ] **Step 3: Реализовать регистрацию**

Дописать в `src/server/auth/actions.ts`:

```typescript
'use server'

import { eq } from 'drizzle-orm'
import { db, users, userProgress } from '@/server/db'
import { hashPassword } from './password'
import { registerSchema } from './schemas'

export async function registerUser(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Проверьте правильность заполнения полей' }

  const { login, password, inviteCode } = parsed.data

  if (inviteCode !== process.env.INVITE_CODE) {
    return { ok: false, error: 'Неверный код приглашения' }
  }

  const loginLower = login.toLowerCase()
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.loginLower, loginLower)).limit(1)
  if (existing.length > 0) return { ok: false, error: 'Такой логин уже занят' }

  const passwordHash = await hashPassword(password)
  const [created] = await db.insert(users).values({ login, loginLower, passwordHash }).returning({ id: users.id })
  await db.insert(userProgress).values({ userId: created.id })

  return { ok: true }
}
```

- [ ] **Step 4: Настроить Auth.js**

`src/server/auth/config.ts`:

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import { db, users } from '@/server/db'
import { verifyPassword } from './password'
import { loginSchema } from './schemas'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { login: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw)
        if (!parsed.success) return null

        const loginLower = parsed.data.login.toLowerCase()
        const [user] = await db.select().from(users).where(eq(users.loginLower, loginLower)).limit(1)
        if (!user) return null

        const valid = await verifyPassword(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, name: user.login }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.userId = user.id
      return token
    },
    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string
      return session
    },
  },
})
```

- [ ] **Step 5: Создать обработчик маршрута**

`src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/server/auth'

export const { GET, POST } = handlers
```

- [ ] **Step 6: Создать helper для серверных действий**

Дописать в `src/server/auth/index.ts`:

```typescript
import { auth } from './config'

export { handlers, auth, signIn, signOut } from './config'
export { registerUser } from './actions'
export { loginSchema, registerSchema } from './schemas'

export async function requireUserId(): Promise<string> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('UNAUTHORIZED')
  return userId
}
```

- [ ] **Step 7: Закрыть приложение от неавторизованных**

`src/middleware.ts`:

```typescript
import { auth } from '@/server/auth'

export default auth((req) => {
  const isAuthed = Boolean(req.auth?.user)
  const { pathname } = req.nextUrl

  const isPublic = pathname === '/login' || pathname === '/register'

  if (!isAuthed && !isPublic) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  if (isAuthed && isPublic) {
    return Response.redirect(new URL('/', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 8: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит без ошибок типов.

- [ ] **Step 9: Передать на коммит**

```
feat: аутентификация по логину и паролю с закрытой регистрацией
```
