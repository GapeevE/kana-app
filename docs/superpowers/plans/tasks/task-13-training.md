# Task 13: Экран тренировки

**Этап:** 3. Интерфейс
**Зависит от:** [Task 10](task-10-server-actions.md), [Task 12](task-12-home-nav.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


Ядро приложения. Сессия целиком живёт в клиентском состоянии; ответы копятся локально и уходят пачками.

**Files:**
- Create: `src/features/training/store.ts`
- Create: `src/features/training/use-sync.ts`
- Create: `src/features/training/kana-keyboard.tsx`
- Create: `src/features/training/training-screen.tsx`
- Create: `src/app/training/page.tsx`

**Interfaces:**
- Consumes: `startSession`, `syncAnswers` из `@/server/actions/session`; `requeueOnFailure` из `@/core/session`; `KANA_CARDS` из `@/data/kana`
- Produces: рабочий экран `/training`

- [ ] **Step 1: Написать хранилище сессии**

`src/features/training/store.ts`:

```typescript
'use client'

import { create } from 'zustand'
import { requeueOnFailure } from '@/core/session'
import type { SessionAnswer, SessionCard } from '@/core/session'
import type { Quality } from '@/core/srs'
import type { KanaCard } from '@/data/kana'

export type Mode = 'input' | 'choice'

interface TrainingState {
  sessionId: string
  queue: SessionCard[]
  cards: Map<string, KanaCard>
  pending: SessionAnswer[]
  mode: Mode
  hintUsed: boolean
  answeredCount: number
  finished: boolean

  init: (sessionId: string, items: Array<{ card: KanaCard; state: SessionCard['state'] }>) => void
  setMode: (mode: Mode) => void
  useHint: () => void
  answer: (correct: boolean) => Quality
  drainPending: () => SessionAnswer[]
}

function qualityFor(mode: Mode, hintUsed: boolean, correct: boolean): Quality {
  if (!correct) return 0
  if (mode === 'input') return hintUsed ? 4 : 5
  return hintUsed ? 2 : 3
}

export const useTraining = create<TrainingState>((set, get) => ({
  sessionId: '',
  queue: [],
  cards: new Map(),
  pending: [],
  mode: 'input',
  hintUsed: false,
  answeredCount: 0,
  finished: false,

  init: (sessionId, items) =>
    set({
      sessionId,
      queue: items.map((i) => ({ cardId: i.card.id, state: i.state })),
      cards: new Map(items.map((i) => [i.card.id, i.card])),
      pending: [],
      mode: 'input',
      hintUsed: false,
      answeredCount: 0,
      finished: items.length === 0,
    }),

  setMode: (mode) => set((s) => ({ mode: s.mode === 'input' && mode === 'choice' ? 'choice' : s.mode })),

  useHint: () => set({ hintUsed: true }),

  answer: (correct) => {
    const state = get()
    const current = state.queue[0]
    const quality = qualityFor(state.mode, state.hintUsed, correct)

    const record: SessionAnswer = {
      cardId: current.cardId,
      quality,
      mode: state.mode,
      hintUsed: state.hintUsed,
      sessionId: state.sessionId,
      answeredAt: new Date().toISOString(),
    }

    const nextQueue = quality === 0 ? requeueOnFailure(state.queue, current.cardId) : state.queue.slice(1)

    set({
      queue: nextQueue,
      pending: [...state.pending, record],
      answeredCount: state.answeredCount + 1,
      mode: 'input',
      hintUsed: false,
      finished: nextQueue.length === 0,
    })

    return quality
  },

  drainPending: () => {
    const pending = get().pending
    set({ pending: [] })
    return pending
  },
}))
```

Метод `setMode` реализует правило спеки: потолок оценки в пределах карточки только снижается, поэтому обратный переход из `choice` в `input` игнорируется.

- [ ] **Step 2: Написать синхронизацию**

`src/features/training/use-sync.ts`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { syncAnswers } from '@/server/actions/session'
import type { SessionAnswer } from '@/core/session'

const STORAGE_KEY = 'kana-app:pending-answers'
const BATCH_SIZE = 10

function readStored(): SessionAnswer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionAnswer[]) : []
  } catch {
    return []
  }
}

function writeStored(answers: SessionAnswer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  } catch {
    // хранилище недоступно — ответы уйдут только при успешной отправке
  }
}

export async function flush(answers: SessionAnswer[]): Promise<void> {
  const all = [...readStored(), ...answers]
  if (all.length === 0) return

  writeStored(all)
  const result = await syncAnswers(all)
  if (result.ok) writeStored([])
}

export function useSync(pendingCount: number, drain: () => SessionAnswer[], finished: boolean) {
  const flushing = useRef(false)

  useEffect(() => {
    void flush([])
  }, [])

  useEffect(() => {
    if (flushing.current) return
    if (pendingCount < BATCH_SIZE && !finished) return
    if (pendingCount === 0) return

    flushing.current = true
    void flush(drain()).finally(() => {
      flushing.current = false
    })
  }, [pendingCount, finished, drain])
}
```

Досылка неотправленных ответов при старте и сохранение в localStorage реализуют требование устойчивости к потере связи (спека, п. 7.1).

- [ ] **Step 3: Написать экранную клавиатуру**

`src/features/training/kana-keyboard.tsx`:

```tsx
'use client'

import { Button } from '@/components/ui/button'

const LETTERS = ['a', 'i', 'u', 'e', 'o', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'g', 'z', 'd', 'b', 'p', 'j', 'c', 'f']

export function KanaKeyboard({
  onLetter,
  onBackspace,
  onSubmit,
}: {
  onLetter: (letter: string) => void
  onBackspace: () => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-2 md:hidden">
      <div className="grid grid-cols-8 gap-1">
        {LETTERS.map((letter) => (
          <Button key={letter} type="button" variant="outline" size="sm" onClick={() => onLetter(letter)}>
            {letter}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBackspace}>
          ←
        </Button>
        <Button type="button" className="flex-[2]" onClick={onSubmit}>
          Ответить
        </Button>
      </div>
    </div>
  )
}
```

Раскладка содержит только буквы, встречающиеся в чтениях каны по Хэпбёрну. Скрывается на десктопе (`md:hidden`), где используется физическая клавиатура.

- [ ] **Step 4: Написать экран тренировки**

`src/features/training/training-screen.tsx`:

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTraining } from './store'
import { useSync, flush } from './use-sync'
import { KanaKeyboard } from './kana-keyboard'
import { KANA_CARDS } from '@/data/kana'
import type { KanaCard } from '@/data/kana'
import type { SessionCard } from '@/core/session'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  sessionId: string
  items: Array<{ card: KanaCard; state: SessionCard['state'] }>
}

function distractors(card: KanaCard): string[] {
  const sameRow = KANA_CARDS.filter((c) => c.script === card.script && c.row === card.row && c.id !== card.id)
  const sameScript = KANA_CARDS.filter((c) => c.script === card.script && c.id !== card.id)
  const pool = [...sameRow, ...sameScript]

  const picked: string[] = []
  for (const c of pool) {
    if (picked.length >= 3) break
    if (picked.includes(c.romaji)) continue
    picked.push(c.romaji)
  }
  return picked
}

function hintFor(card: KanaCard): string {
  return `Ряд «${card.row}», чтение начинается на «${card.romaji[0]}»`
}

export function TrainingScreen({ sessionId, items }: Props) {
  const store = useTraining()
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<{ quality: number; romaji: string } | null>(null)

  useEffect(() => {
    store.init(sessionId, items)
  }, [sessionId, items])

  useSync(store.pending.length, store.drainPending, store.finished)

  const current = store.queue[0]
  const card = current ? store.cards.get(current.cardId) : undefined

  const options = useMemo(() => {
    if (!card) return []
    return [card.romaji, ...distractors(card)].sort(() => Math.random() - 0.5)
  }, [card?.id])

  function submit(answer: string) {
    if (!card || feedback) return
    const quality = store.answer(answer.trim().toLowerCase() === card.romaji)
    setFeedback({ quality, romaji: card.romaji })
    setValue('')
  }

  function next() {
    setFeedback(null)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (feedback) {
        if (e.key === 'Enter' || e.key === ' ') next()
        return
      }
      if (store.mode === 'choice' && /^[1-4]$/.test(e.key)) {
        submit(options[Number(e.key) - 1] ?? '')
      }
      if (e.key === ' ' && !store.hintUsed) {
        e.preventDefault()
        store.useHint()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [feedback, store.mode, store.hintUsed, options])

  if (store.finished) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Сессия завершена</h1>
        <p className="text-muted-foreground">Отвечено карточек: {store.answeredCount}</p>
        <Button asChild onClick={() => void flush(store.drainPending())}>
          <Link href="/">На главную</Link>
        </Button>
      </main>
    )
  }

  if (!card) return null

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <p className="text-sm text-muted-foreground">Осталось: {store.queue.length}</p>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <span className="kana-glyph text-8xl">{card.char}</span>

        {store.hintUsed && !feedback && (
          <p className="text-sm text-muted-foreground">{hintFor(card)}</p>
        )}

        {feedback ? (
          <div className="space-y-3 text-center">
            <p className={feedback.quality === 0 ? 'text-destructive font-medium' : 'text-primary font-medium'}>
              {feedback.quality === 0 ? 'Неверно' : 'Верно'} — {feedback.romaji}
            </p>
            <p className="text-sm text-muted-foreground">Оценка: {feedback.quality}</p>
            <Button onClick={next}>Дальше</Button>
          </div>
        ) : store.mode === 'input' ? (
          <div className="w-full max-w-xs space-y-3">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(value)}
              placeholder="Введите чтение"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="none"
            />
            <KanaKeyboard
              onLetter={(l) => setValue((v) => v + l)}
              onBackspace={() => setValue((v) => v.slice(0, -1))}
              onSubmit={() => submit(value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => store.useHint()} disabled={store.hintUsed}>
                Подсказка
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => store.setMode('choice')}>
                Варианты
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {options.map((option, i) => (
                <Button key={option} variant="outline" onClick={() => submit(option)}>
                  <span className="mr-2 text-xs text-muted-foreground">{i + 1}</span>
                  {option}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => store.useHint()} disabled={store.hintUsed}>
              Подсказка
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Создать страницу тренировки**

`src/app/training/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { startSession } from '@/server/actions/session'
import { TrainingScreen } from '@/features/training/training-screen'

export default async function TrainingPage() {
  const session = await startSession()
  if (session.cards.length === 0) redirect('/')

  return <TrainingScreen sessionId={session.sessionId} items={session.cards} />
}
```

- [ ] **Step 6: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 7: Передать на ручную проверку**

Владельцу проверить: ввод ответа даёт оценку 5, подсказка — 4, режим вариантов — 3, подсказка плюс варианты — 2, ошибка возвращает карточку в конец очереди, на десктопе работают клавиши 1–4, пробел и Enter, прогресс сохраняется после перезагрузки страницы.

- [ ] **Step 8: Передать на коммит**

```
feat: экран тренировки с локальной сессией и пакетной синхронизацией
```
