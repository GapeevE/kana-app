import { Lightbulb } from 'lucide-react'
import type { GrammarNote as Note } from '@/data/kana/articles'

export function GrammarNote({ note }: { note: Note }) {
  return (
    <section className="space-y-3 rounded-xl border border-primary/30 bg-accent/40 p-5">
      <h3 className="flex items-center gap-2 font-semibold">
        <Lightbulb className="size-4 shrink-0 text-primary" />
        {note.title}
      </h3>
      {note.body.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
    </section>
  )
}
