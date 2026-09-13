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
