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
