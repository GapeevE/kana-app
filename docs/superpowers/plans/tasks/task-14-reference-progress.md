# Task 14: Справочник, избранное и прогресс

**Этап:** 3. Интерфейс
**Зависит от:** [Task 9](task-09-repository.md), [Task 10](task-10-server-actions.md), [Task 12](task-12-home-nav.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/app/reference/page.tsx`
- Create: `src/app/reference/[id]/page.tsx`
- Create: `src/app/progress/page.tsx`
- Create: `src/app/favorites/page.tsx`
- Create: `src/features/reference/kana-grid.tsx`
- Create: `src/features/favorites/favorite-button.tsx`
- Create: `src/features/progress/progress-map.tsx`

**Interfaces:**
- Consumes: `loadUserData`, `listFavorites` из `@/server/repository`; `toggleFavoriteAction` из `@/server/actions/favorites`; `GROUP_ORDER`, `unlockedGroups` из `@/core/progression`
- Produces: экраны `/reference`, `/reference/[id]`, `/progress`, `/favorites`

- [ ] **Step 1: Написать кнопку избранного**

`src/features/favorites/favorite-button.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { toggleFavoriteAction } from '@/server/actions/favorites'
import { Button } from '@/components/ui/button'

export function FavoriteButton({ cardId, initial }: { cardId: string; initial: boolean }) {
  const [active, setActive] = useState(initial)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant={active ? 'default' : 'outline'}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setActive(await toggleFavoriteAction(cardId))
        })
      }
    >
      {active ? '★ В избранном' : '☆ В избранное'}
    </Button>
  )
}
```

- [ ] **Step 2: Написать сетку справочника**

`src/features/reference/kana-grid.tsx`:

```tsx
import Link from 'next/link'
import { KANA_CARDS } from '@/data/kana'

export function KanaGrid({ unlocked }: { unlocked: ReadonlySet<string> }) {
  const groups = [...new Set(KANA_CARDS.map((c) => c.group))]

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const cards = KANA_CARDS.filter((c) => c.group === group)
        const open = unlocked.has(group)

        return (
          <section key={group} className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {group} {!open && '· закрыто'}
            </h2>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
              {cards.map((card) =>
                open ? (
                  <Link
                    key={card.id}
                    href={`/reference/${card.id}`}
                    className="flex aspect-square flex-col items-center justify-center rounded-md border hover:bg-accent"
                  >
                    <span className="kana-glyph text-2xl">{card.char}</span>
                    <span className="text-xs text-muted-foreground">{card.romaji}</span>
                  </Link>
                ) : (
                  <div
                    key={card.id}
                    className="flex aspect-square items-center justify-center rounded-md border border-dashed opacity-40"
                  >
                    <span className="kana-glyph text-2xl">{card.char}</span>
                  </div>
                ),
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Создать страницу справочника**

`src/app/reference/page.tsx`:

```tsx
import { requireUserId } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { unlockedGroups } from '@/core/progression'
import { KanaGrid } from '@/features/reference/kana-grid'

export default async function ReferencePage() {
  const userId = await requireUserId()
  const data = await loadUserData(userId)
  const unlocked = new Set(unlockedGroups(data.answeredCorrectly))

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-6 text-2xl font-semibold">Азбука</h1>
      <KanaGrid unlocked={unlocked} />
    </main>
  )
}
```

- [ ] **Step 4: Создать страницу карточки**

`src/app/reference/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { requireUserId } from '@/server/auth'
import { listFavorites } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'
import { FavoriteButton } from '@/features/favorites/favorite-button'

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = KANA_BY_ID.get(id)
  if (!card) notFound()

  const userId = await requireUserId()
  const favorites = await listFavorites(userId)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 p-6">
      <span className="kana-glyph text-9xl">{card.char}</span>
      <p className="text-2xl">{card.romaji}</p>

      {card.facts && card.facts.length > 0 && (
        <section className="w-full rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Интересное</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {card.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>
      )}

      <FavoriteButton cardId={card.id} initial={favorites.includes(card.id)} />
    </main>
  )
}
```

Анимация порядка черт (KanjiVG) в этой задаче не реализуется — она вынесена в Task 15, поскольку требует загрузки и обработки внешнего датасета.

- [ ] **Step 5: Написать карту освоения**

`src/features/progress/progress-map.tsx`:

```tsx
import { KANA_CARDS } from '@/data/kana'
import type { CardState } from '@/core/srs'

function levelOf(state: CardState | undefined): string {
  if (!state) return 'bg-muted'
  if (state.interval >= 30) return 'bg-primary'
  if (state.interval >= 7) return 'bg-primary/60'
  return 'bg-primary/25'
}

export function ProgressMap({ states }: { states: ReadonlyMap<string, CardState> }) {
  return (
    <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
      {KANA_CARDS.map((card) => (
        <div
          key={card.id}
          title={`${card.char} — ${card.romaji}`}
          className={`flex aspect-square items-center justify-center rounded ${levelOf(states.get(card.id))}`}
        >
          <span className="kana-glyph text-xs">{card.char}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Создать страницу прогресса**

`src/app/progress/page.tsx`:

```tsx
import { requireUserId } from '@/server/auth'
import { loadUserData } from '@/server/repository'
import { KANA_CARDS } from '@/data/kana'
import { ProgressMap } from '@/features/progress/progress-map'

export default async function ProgressPage() {
  const userId = await requireUserId()
  const data = await loadUserData(userId)

  const learned = [...data.states.values()].filter((s) => s.interval >= 7).length
  const started = data.states.size

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Прогресс</h1>

      <div className="flex gap-6">
        <div>
          <p className="text-3xl font-semibold">
            {learned}
            <span className="text-base text-muted-foreground"> / {KANA_CARDS.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">освоено</p>
        </div>
        <div>
          <p className="text-3xl font-semibold">{started}</p>
          <p className="text-sm text-muted-foreground">начато</p>
        </div>
        <div>
          <p className="text-3xl font-semibold">{data.streakDays}</p>
          <p className="text-sm text-muted-foreground">дней подряд</p>
        </div>
      </div>

      <ProgressMap states={data.states} />
    </main>
  )
}
```

- [ ] **Step 7: Создать страницу избранного**

`src/app/favorites/page.tsx`:

```tsx
import Link from 'next/link'
import { requireUserId } from '@/server/auth'
import { listFavorites } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'

export default async function FavoritesPage() {
  const userId = await requireUserId()
  const ids = await listFavorites(userId)
  const cards = ids.map((id) => KANA_BY_ID.get(id)).filter((c) => c !== undefined)

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Избранное</h1>

      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока пусто. Отметьте знаки звёздочкой на странице карточки, чтобы вернуться к ним.
        </p>
      ) : (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/reference/${card.id}`}
              className="flex aspect-square flex-col items-center justify-center rounded-md border hover:bg-accent"
            >
              <span className="kana-glyph text-2xl">{card.char}</span>
              <span className="text-xs text-muted-foreground">{card.romaji}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 8: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 9: Передать на ручную проверку**

Владельцу проверить: закрытые группы в справочнике видны, но не кликабельны; карточка открывается; избранное добавляется и снимается; карта прогресса отражает изученные знаки.

- [ ] **Step 10: Передать на коммит**

```
feat: справочник, карточка знака, избранное и карта прогресса
```


---

## Отклонения от первоначального плана

**Человекочитаемые заголовки групп.** План выводил технический идентификатор (`hiragana_dakuten_g`), который пользователю ничего не говорит. Теперь заголовок собирается из азбуки, типа и ряда: «Хирагана · Дакутэн · ряд «g»».

**Порядок групп берётся из `GROUP_ORDER`.** Исходный вариант выводил группы в порядке появления в датасете; теперь используется тот же порядок, что и в прогрессии, поэтому справочник совпадает с последовательностью изучения.

**Ссылка «← К азбуке» на странице карточки.** Без неё возврат к списку возможен только через кнопку браузера: карточка открывается из сетки, а нижняя навигация ведёт на другие разделы.

**Кнопка возврата оформлена через `buttonVariants`** — по правилу, зафиксированному в задаче 12 (текущий shadcn/ui построен на Base UI, свойства `asChild` нет).
