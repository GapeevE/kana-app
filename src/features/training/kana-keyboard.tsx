'use client'

import { Delete } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LETTERS = [
  'a', 'i', 'u', 'e', 'o',
  'k', 's', 't', 'n', 'h',
  'm', 'y', 'r', 'w', 'g',
  'z', 'd', 'b', 'p', 'j',
  'c', 'f',
]

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
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1">
        {LETTERS.map((letter) => (
          <Button key={letter} type="button" variant="outline" size="sm" onClick={() => onLetter(letter)}>
            {letter}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBackspace} aria-label="Стереть">
          <Delete className="size-4" />
        </Button>
        <Button type="button" className="flex-[2]" onClick={onSubmit}>
          Ответить
        </Button>
      </div>
    </div>
  )
}
