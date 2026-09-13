import Link from 'next/link'

const TABS = [
  { script: 'hiragana', label: 'Хирагана', sample: 'あ' },
  { script: 'katakana', label: 'Катакана', sample: 'ア' },
] as const

export function ScriptTabs({ active }: { active: 'hiragana' | 'katakana' }) {
  return (
    <div className="flex gap-2 rounded-xl border border-border bg-card p-1">
      {TABS.map((tab) => {
        const current = tab.script === active
        return (
          <Link
            key={tab.script}
            href={`/reference?script=${tab.script}`}
            aria-current={current ? 'page' : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              current ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="kana-glyph text-base">{tab.sample}</span>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
