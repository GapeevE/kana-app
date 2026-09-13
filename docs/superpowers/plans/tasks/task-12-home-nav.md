# Task 12: Главный экран и навигация

**Этап:** 3. Интерфейс
**Зависит от:** [Task 9](task-09-repository.md), [Task 10](task-10-server-actions.md), [Task 11](task-11-auth-screens.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/app-nav.tsx`
- Create: `src/app/kanji/page.tsx`
- Create: `src/app/grammar/page.tsx`
- Create: `src/components/under-construction.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `loadUserData` из `@/server/repository`; `buildQueue` из `@/core/session`; `auth` из `@/server/auth`
- Produces: главный экран с очередью на сегодня, нижняя навигация, заглушки разделов

- [ ] **Step 1: Написать компонент заглушки**

`src/components/under-construction.tsx`:

```tsx
export function UnderConstruction({ title }: { title: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground max-w-sm">
        Раздел в разработке. Он появится в одном из следующих обновлений.
      </p>
    </main>
  )
}
```

- [ ] **Step 2: Создать страницы-заглушки**

`src/app/kanji/page.tsx`:

```tsx
import { UnderConstruction } from '@/components/under-construction'

export default function KanjiPage() {
  return <UnderConstruction title="Кандзи" />
}
```

`src/app/grammar/page.tsx`:

```tsx
import { UnderConstruction } from '@/components/under-construction'

export default function GrammarPage() {
  return <UnderConstruction title="Грамматика" />
}
```

- [ ] **Step 3: Написать навигацию**

`src/components/app-nav.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/', label: 'Сегодня' },
  { href: '/reference', label: 'Азбука' },
  { href: '/kanji', label: 'Кандзи' },
  { href: '/grammar', label: 'Грамматика' },
  { href: '/progress', label: 'Прогресс' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 border-t bg-background">
      <ul className="mx-auto flex max-w-2xl">
        {ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`block px-2 py-3 text-center text-xs ${
                  active ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 4: Подключить навигацию в layout**

В `src/app/layout.tsx` обернуть `children`, показывая навигацию только авторизованным:

```tsx
import { auth } from '@/server/auth'
import { AppNav } from '@/components/app-nav'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="ru" className={`${inter.variable} ${notoJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="flex flex-1 flex-col">{children}</div>
        {session?.user && <AppNav />}
      </body>
    </html>
  )
}
```

Остальное содержимое файла (импорты шрифтов, `metadata`) сохраняется из Task 1.

- [ ] **Step 5: Написать главный экран**

`src/app/page.tsx`:

```tsx
import Link from 'next/link'
import { requireUserId } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { buildQueue } from '@/core/session'
import { KANA_CARDS } from '@/data/kana'
import { buttonVariants } from '@/components/ui/button'

export default async function TodayPage() {
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

  const dueCount = queue.filter((c) => c.state !== null).length
  const newCount = queue.filter((c) => c.state === null).length
  const learned = [...data.states.values()].filter((s) => s.interval >= 7).length

  const nextDue = [...data.states.values()]
    .map((s) => s.dueDate)
    .filter((d) => d > today)
    .sort()[0]

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Сегодня</h1>
        {data.streakDays > 0 && (
          <p className="text-sm text-muted-foreground">Серия: {data.streakDays} дн.</p>
        )}
      </header>

      {queue.length > 0 ? (
        <section className="space-y-4 rounded-lg border p-6">
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-semibold">{dueCount}</p>
              <p className="text-sm text-muted-foreground">к повторению</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{newCount}</p>
              <p className="text-sm text-muted-foreground">новых</p>
            </div>
          </div>
          <Link href="/training" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
            Начать тренировку
          </Link>
        </section>
      ) : (
        <section className="rounded-lg border p-6 text-center space-y-2">
          <p className="font-medium">На сегодня всё</p>
          <p className="text-sm text-muted-foreground">
            {nextDue ? `Ближайшее повторение: ${nextDue}` : 'Возвращайтесь завтра'}
          </p>
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        Освоено {learned} из {KANA_CARDS.length}
      </p>
    </main>
  )
}
```

- [ ] **Step 6: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 7: Передать на ручную проверку**

Владельцу проверить: главный экран показывает 10 новых карточек для нового аккаунта, заглушки разделов открываются, навигация работает.

- [ ] **Step 8: Передать на коммит**

```
feat: главный экран с очередью на сегодня, навигация и заглушки разделов
```


---

## Отклонение от первоначального плана

**Ссылки-кнопки оформляются через `buttonVariants`, а не через `<Button asChild>`.** Текущий shadcn/ui построен на Base UI (не на Radix), где свойства `asChild` нет — вместо него применяется `render`. Использование `buttonVariants` даёт тот же вид, не зависит от различий в API примитивов и не заворачивает ссылку в лишний компонент.

Это правило распространяется на все последующие задачи интерфейса.
