'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, CalendarCheck, ChartColumn, Languages, Menu, PenLine, Star } from 'lucide-react'

const ITEMS = [
  { href: '/', label: 'Сегодня', short: 'Сегодня', Icon: CalendarCheck },
  { href: '/reference', label: 'Азбука', short: 'Азбука', Icon: BookOpen },
  { href: '/favorites', label: 'Избранное', short: 'Звёзды', Icon: Star },
  { href: '/kanji', label: 'Кандзи', short: 'Кандзи', Icon: Languages },
  { href: '/grammar', label: 'Грамматика', short: 'Грамм.', Icon: PenLine },
  { href: '/progress', label: 'Прогресс', short: 'Успехи', Icon: ChartColumn },
  { href: '/settings', label: 'Ещё', short: 'Ещё', Icon: Menu },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-10 order-last border-t border-border bg-card/80 backdrop-blur sm:order-first sm:bottom-auto sm:top-0 sm:border-t-0 sm:border-b">
      <ul className="mx-auto flex max-w-3xl">
        {ITEMS.map(({ href, label, short, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-1 py-2 transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:py-3 ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[0.6875rem] leading-none sm:hidden">{short}</span>
                <span className="hidden text-sm leading-none sm:inline">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
