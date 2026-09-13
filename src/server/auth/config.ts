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
