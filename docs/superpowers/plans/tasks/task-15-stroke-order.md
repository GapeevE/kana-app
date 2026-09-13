# Task 15: Порядок черт и тренировка по избранному

**Этап:** 3. Интерфейс
**Зависит от:** [Task 13](task-13-training.md), [Task 14](task-14-reference-progress.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `scripts/fetch-kanjivg.mjs`
- Create: `public/kanjivg/*.svg`
- Create: `src/features/reference/stroke-order.tsx`
- Modify: `src/app/reference/[id]/page.tsx`
- Create: `src/app/favorites/training/page.tsx`
- Modify: `src/components/app-nav.tsx`

**Interfaces:**
- Consumes: `KANA_CARDS`; `listFavorites`
- Produces: компонент `StrokeOrder`, режим тренировки по избранному

- [ ] **Step 1: Написать скрипт загрузки KanjiVG**

`scripts/fetch-kanjivg.mjs`:

```javascript
import { mkdir, writeFile } from 'node:fs/promises'
import { KANA_CARDS } from '../src/data/kana/index.ts'

const BASE = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji'
const OUT = 'public/kanjivg'

await mkdir(OUT, { recursive: true })

for (const card of KANA_CARDS) {
  if ([...card.char].length > 1) continue

  const code = card.char.codePointAt(0).toString(16).padStart(5, '0')
  const response = await fetch(`${BASE}/${code}.svg`)
  if (!response.ok) {
    console.warn(`пропущен ${card.char} (${code})`)
    continue
  }

  await writeFile(`${OUT}/${code}.svg`, await response.text())
}

console.log('готово')
```

Знаки ёон состоят из двух символов и в KanjiVG отсутствуют — для них порядок черт не показывается.

- [ ] **Step 2: Запустить скрипт**

```bash
node --experimental-strip-types scripts/fetch-kanjivg.mjs
```

Expected: в `public/kanjivg/` появляются SVG-файлы. Предупреждения о пропущенных знаках допустимы.

- [ ] **Step 3: Написать компонент порядка черт**

`src/features/reference/stroke-order.tsx`:

```tsx
export function StrokeOrder({ char }: { char: string }) {
  if ([...char].length > 1) return null

  const code = char.codePointAt(0)!.toString(16).padStart(5, '0')

  return (
    <figure className="space-y-2">
      <img src={`/kanjivg/${code}.svg`} alt={`Порядок черт знака ${char}`} className="h-40 w-40 dark:invert" />
      <figcaption className="text-xs text-muted-foreground">
        Порядок черт:{' '}
        <a href="https://kanjivg.tagaini.net/" className="underline" rel="noreferrer" target="_blank">
          KanjiVG
        </a>
        , лицензия CC BY-SA 3.0
      </figcaption>
    </figure>
  )
}
```

Атрибуция обязательна по условиям лицензии CC BY-SA 3.0.

- [ ] **Step 4: Подключить порядок черт на карточку**

В `src/app/reference/[id]/page.tsx` добавить импорт и вставить компонент после чтения:

```tsx
import { StrokeOrder } from '@/features/reference/stroke-order'
```

```tsx
      <p className="text-2xl">{card.romaji}</p>

      <StrokeOrder char={card.char} />
```

- [ ] **Step 5: Создать тренировку по избранному**

`src/app/favorites/training/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { randomUUID } from 'node:crypto'
import { requireUserId } from '@/server/auth'
import { listFavorites } from '@/server/repository'
import { KANA_BY_ID } from '@/data/kana'
import { TrainingScreen } from '@/features/training/training-screen'

export default async function FavoritesTrainingPage() {
  const userId = await requireUserId()
  const ids = await listFavorites(userId)
  const items = ids
    .map((id) => KANA_BY_ID.get(id))
    .filter((c) => c !== undefined)
    .map((card) => ({ card, state: null }))

  if (items.length === 0) redirect('/favorites')

  return <TrainingScreen sessionId={randomUUID()} items={items} drillOnly />
}
```

- [ ] **Step 6: Добавить режим дриллинга в экран тренировки**

В `src/features/training/training-screen.tsx` добавить необязательное свойство и отключить синхронизацию, когда оно установлено:

```tsx
interface Props {
  sessionId: string
  items: Array<{ card: KanaCard; state: SessionCard['state'] }>
  drillOnly?: boolean
}
```

```tsx
export function TrainingScreen({ sessionId, items, drillOnly = false }: Props) {
```

```tsx
  useSync(drillOnly ? 0 : store.pending.length, store.drainPending, drillOnly ? false : store.finished)
```

Ответы в режиме избранного не влияют на SRS-состояние (спека, п. 6.3), поэтому не отправляются на сервер.

- [ ] **Step 7: Добавить ссылку на тренировку в избранном**

В `src/app/favorites/page.tsx` после заголовка добавить кнопку, когда список не пуст:

```tsx
import { Button } from '@/components/ui/button'
```

```tsx
      {cards.length > 0 && (
        <Button asChild>
          <Link href="/favorites/training">Тренировать избранное</Link>
        </Button>
      )}
```

- [ ] **Step 8: Добавить избранное в навигацию**

В `src/components/app-nav.tsx` заменить массив `ITEMS`:

```tsx
const ITEMS = [
  { href: '/', label: 'Сегодня' },
  { href: '/reference', label: 'Азбука' },
  { href: '/favorites', label: 'Избранное' },
  { href: '/kanji', label: 'Кандзи' },
  { href: '/grammar', label: 'Грамматика' },
  { href: '/progress', label: 'Прогресс' },
]
```

- [ ] **Step 9: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 10: Передать на ручную проверку**

Владельцу проверить: порядок черт отображается на карточках базовых знаков, атрибуция видна, тренировка по избранному работает и не меняет прогресс.

- [ ] **Step 11: Передать на коммит**

```
feat: порядок черт из KanjiVG и тренировка по избранному
```


---

## Отклонения от первоначального плана

**Скрипт загрузки читает исходники датасета текстом.** Прямой импорт `src/data/kana/index.ts` из `.mjs`-скрипта невозможен: Node не разрешает TypeScript-импорты без расширений. Скрипт извлекает знаки регулярным выражением из таблиц `gojuon.ts`, `dakuten.ts`, `yoon.ts`. Он также пропускает уже загруженные файлы, поэтому повторный запуск безопасен.

Результат загрузки: 142 файла из 142 односимвольных знаков, 568 КБ. Для 66 сочетаний ёон порядка черт нет — в KanjiVG отсутствуют многосимвольные записи.

**SVG встраивается инлайном, а не через `<img>`.** Изображение во внешнем файле не наследует цвет текста и не поддаётся стилизации извне. Компонент читает файл на сервере, заменяет `stroke:#000000` на `stroke:currentColor` и вставляет разметку — знак корректно отображается в обеих темах, а черты можно анимировать.

**Анимация прорисовки на CSS.** Черты проявляются последовательно через `stroke-dasharray`/`stroke-dashoffset` с задержкой по номеру. Библиотека не потребовалась. Анимация отключается при `prefers-reduced-motion`.

**Номера черт скрыты.** KanjiVG хранит их отдельной группой; на карточке размером 160 пикселей они нечитаемы и мешают восприятию.

**Кнопка завершения сессии учитывает режим.** В тренировке по избранному она ведёт на `/favorites` и не отправляет ответы на сервер — эти ответы не влияют на расписание повторений (спека, п. 6.3).
