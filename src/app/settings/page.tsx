import { auth } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { requireUserId } from '@/server/auth'
import { SignOutButton } from '@/features/auth/sign-out-button'

export default async function SettingsPage() {
  const session = await auth()
  const userId = await requireUserId()
  const data = await loadUserData(userId)

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Ещё</h1>

      <section className="space-y-1 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Вы вошли как</p>
        <p className="font-medium">{session?.user?.name}</p>
      </section>

      <section className="space-y-1 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Новых знаков в день</p>
        <p className="font-medium">{data.newCardsPerDay}</p>
      </section>

      <SignOutButton />

      <p className="text-xs text-muted-foreground">
        Порядок черт:{' '}
        <a href="https://kanjivg.tagaini.net/" className="underline" rel="noreferrer" target="_blank">
          KanjiVG
        </a>
        , CC BY-SA 3.0
      </p>
    </main>
  )
}
