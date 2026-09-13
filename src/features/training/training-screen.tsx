'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Lightbulb, List, X } from 'lucide-react'
import { useTraining } from './store'
import { useSync, flush } from './use-sync'
import { KanaKeyboard } from './kana-keyboard'
import { KANA_CARDS } from '@/data/kana'
import type { KanaCard } from '@/data/kana'
import type { SessionCard } from '@/core/session'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  sessionId: string
  items: Array<{ card: KanaCard; state: SessionCard['state'] }>
  drillOnly?: boolean
}

function pickDistractors(card: KanaCard): string[] {
  const others = KANA_CARDS.filter((c) => c.script === card.script && c.id !== card.id)
  const sameRowSameType = others.filter((c) => c.row === card.row && c.type === card.type)
  const sameType = others.filter((c) => c.type === card.type)
  const sameRow = others.filter((c) => c.row === card.row)

  const picked: string[] = []
  for (const c of [...sameRowSameType, ...sameType, ...sameRow, ...others]) {
    if (picked.length >= 3) break
    if (picked.includes(c.romaji)) continue
    picked.push(c.romaji)
  }
  return picked
}

function hintFor(card: KanaCard): string {
  if (card.hint) return card.hint
  return `Ряд «${card.row}», гласная «${card.romaji.at(-1)}»`
}

export function TrainingScreen({ sessionId, items, drillOnly = false }: Props) {
  const queue = useTraining((s) => s.queue)
  const cards = useTraining((s) => s.cards)
  const mode = useTraining((s) => s.mode)
  const hintUsed = useTraining((s) => s.hintUsed)
  const answeredCount = useTraining((s) => s.answeredCount)
  const finished = useTraining((s) => s.finished)
  const pendingCount = useTraining((s) => s.pending.length)
  const started = useTraining((s) => s.sessionId === sessionId)

  const init = useTraining((s) => s.init)
  const answer = useTraining((s) => s.answer)
  const setMode = useTraining((s) => s.setMode)
  const useHint = useTraining((s) => s.useHint)
  const drainPending = useTraining((s) => s.drainPending)

  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<{ quality: number; romaji: string } | null>(null)
  const [coarsePointer, setCoarsePointer] = useState(false)

  useEffect(() => {
    setCoarsePointer(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    init(sessionId, itemsRef.current)
  }, [sessionId, init])

  useSync(drillOnly ? 0 : pendingCount, drainPending, drillOnly ? false : finished)

  const current = queue[0]
  const card = current ? cards.get(current.cardId) : undefined

  const options = useMemo(() => {
    if (!card) return []
    return [card.romaji, ...pickDistractors(card)].sort(() => Math.random() - 0.5)
  }, [card])

  const submit = useCallback(
    (given: string) => {
      if (!card || feedback) return
      const quality = answer(given.trim().toLowerCase() === card.romaji)
      setFeedback({ quality, romaji: card.romaji })
      setValue('')
    },
    [card, feedback, answer],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (feedback) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFeedback(null)
        }
        return
      }
      if (mode === 'choice' && /^[1-4]$/.test(e.key)) {
        const option = options[Number(e.key) - 1]
        if (option) submit(option)
        return
      }
      if (e.key === ' ' && !hintUsed) {
        e.preventDefault()
        useHint()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [feedback, mode, hintUsed, useHint, options, submit])

  if (started && finished) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-semibold">Готово!</h1>
        <p className="text-muted-foreground">Ты ответил на {answeredCount} карточек</p>
        <Link
          href={drillOnly ? '/favorites' : '/'}
          className={buttonVariants()}
          onClick={() => {
            if (!drillOnly) void flush(drainPending())
          }}
        >
          {drillOnly ? 'К избранному' : 'На главную'}
        </Link>
      </main>
    )
  }

  if (!card) return null

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <p className="text-sm text-muted-foreground">Осталось: {queue.length}</p>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex h-6 items-center justify-center">
          {hintUsed && !feedback && (
            <p className="animate-in fade-in slide-in-from-top-1 text-sm text-muted-foreground">{hintFor(card)}</p>
          )}
        </div>

        <span key={card.id} className="kana-glyph animate-in fade-in zoom-in-95 text-8xl duration-300">
          {card.char}
        </span>

        {feedback ? (
          <div className="animate-in fade-in space-y-3 text-center">
            <p
              className={`flex items-center justify-center gap-2 text-lg font-medium ${
                feedback.quality === 0 ? 'text-destructive' : 'text-primary'
              }`}
            >
              {feedback.quality === 0 ? <X className="size-5" /> : <Check className="size-5" />}
              {feedback.quality === 0 ? 'Мимо' : 'Точно!'} — {feedback.romaji}
            </p>
            <p className="text-sm text-muted-foreground">Оценка: {feedback.quality}</p>
            <Button onClick={() => setFeedback(null)}>Дальше</Button>
          </div>
        ) : mode === 'input' ? (
          <div className="w-full max-w-xs space-y-3">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(value)}
              placeholder="Как читается?"
              inputMode={coarsePointer ? 'none' : 'text'}
              autoFocus={!coarsePointer}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="text-center text-lg"
            />
            {coarsePointer && (
              <KanaKeyboard
                onLetter={(l) => setValue((v) => v + l)}
                onBackspace={() => setValue((v) => v.slice(0, -1))}
                onSubmit={() => submit(value)}
              />
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={useHint} disabled={hintUsed}>
                <Lightbulb className="size-4" />
                Подсказка
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setMode('choice')}>
                <List className="size-4" />
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
            <Button variant="outline" className="w-full" onClick={useHint} disabled={hintUsed}>
              <Lightbulb className="size-4" />
              Подсказка
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
