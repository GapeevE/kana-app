'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/', label: 'Сегодня' },
  { href: '/reference', label: 'Азбука' },
  { href: '/favorites', label: 'Избранное' },
  { href: '/kanji', label: 'Кандзи' },
  { href: '/grammar', label: 'Грамматика' },
  { href: '/progress', label: 'Прогресс' },
  { href: '/settings', label: 'Ещё' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 border-t bg-background">
      <ul className="mx-auto flex max-w-2xl overflow-x-auto">
        {ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="flex-1 sm:flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block whitespace-nowrap px-3 py-3 text-center text-xs ${
                  active ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
