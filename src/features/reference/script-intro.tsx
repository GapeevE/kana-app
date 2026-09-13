import { SCRIPT_INTRO } from '@/data/kana/articles'

export function ScriptIntro({ script }: { script: 'hiragana' | 'katakana' }) {
  const intro = SCRIPT_INTRO[script]

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">{intro.title}</h2>
      {intro.body.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
    </section>
  )
}
