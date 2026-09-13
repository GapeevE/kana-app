'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StrokeOrderPlayer({ svg, strokes }: { svg: string; strokes: number }) {
  const [run, setRun] = useState(0)

  return (
    <figure className="flex flex-col items-center gap-3">
      <div
        key={run}
        className="stroke-order size-44 rounded-xl border border-border bg-card p-2 text-foreground"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setRun((n) => n + 1)}>
          <RotateCcw className="size-4" />
          Ещё раз
        </Button>
        <span className="text-xs text-muted-foreground">
          {strokes} {strokes === 1 ? 'черта' : strokes < 5 ? 'черты' : 'черт'}
        </span>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Порядок черт:{' '}
        <a href="https://kanjivg.tagaini.net/" className="underline" rel="noreferrer" target="_blank">
          KanjiVG
        </a>
        , CC BY-SA 3.0
      </figcaption>
    </figure>
  )
}
