# Task 16: Выход из аккаунта и подготовка к деплою

**Этап:** 3. Интерфейс
**Зависит от:** [Task 12](task-12-home-nav.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/features/auth/sign-out-button.tsx`
- Create: `src/app/settings/page.tsx`
- Create: `docs/deploy.md`
- Modify: `src/components/app-nav.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `signOut` из `@/server/auth`
- Produces: экран настроек с выходом, инструкция по развёртыванию

- [ ] **Step 1: Написать кнопку выхода**

`src/features/auth/sign-out-button.tsx`:

```tsx
'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  return (
    <Button variant="outline" onClick={() => void signOut({ callbackUrl: '/login' })}>
      Выйти
    </Button>
  )
}
```

- [ ] **Step 2: Создать экран настроек**

`src/app/settings/page.tsx`:

```tsx
import { auth } from '@/server/auth'
import { SignOutButton } from '@/features/auth/sign-out-button'

export default async function SettingsPage() {
  const session = await auth()

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Настройки</h1>
      <p className="text-sm text-muted-foreground">Вы вошли как {session?.user?.name}</p>
      <SignOutButton />
    </main>
  )
}
```

- [ ] **Step 3: Добавить настройки в навигацию**

В `src/components/app-nav.tsx` добавить в конец массива `ITEMS`:

```tsx
  { href: '/settings', label: 'Ещё' },
```

- [ ] **Step 4: Написать инструкцию по развёртыванию**

`docs/deploy.md`:

```markdown
# Развёртывание

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Строка подключения Neon |
| `AUTH_SECRET` | Секрет для подписи сессионных cookie |
| `INVITE_CODE` | Код приглашения для регистрации |

Генерация секрета:

    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

## Порядок развёртывания

1. Создать проект в Neon, регион `eu-central-1`.
2. Подключить репозиторий к Vercel.
3. Добавить интеграцию Neon в панели Vercel — `DATABASE_URL` проставится автоматически.
4. Добавить `AUTH_SECRET` и `INVITE_CODE` в переменные окружения Vercel.
5. Применить миграции: `pnpm db:migrate` с `DATABASE_URL` от production.
6. Запустить деплой.

## Локальная разработка

    pnpm install
    cp .env.example .env.local
    # заполнить значения
    pnpm db:migrate
    pnpm dev

## Смена кода приглашения

Изменить `INVITE_CODE` в переменных окружения Vercel и передеплоить. Существующие аккаунты не затрагиваются.
```

- [ ] **Step 5: Переписать README**

`README.md`:

```markdown
# kana-app

Приложение для изучения японской азбуки с интервальными повторениями.

## Документация

- [Техническое задание](docs/spec.md)
- [Развёртывание](docs/deploy.md)
- [Факты и мнемоники](docs/content-facts.md)

## Разработка

    pnpm install
    pnpm dev

Тесты ядра:

    pnpm test

## Лицензии данных

Порядок черт — [KanjiVG](https://kanjivg.tagaini.net/), CC BY-SA 3.0.
```

- [ ] **Step 6: Проверить сборку и тесты**

Run: `pnpm build && pnpm test`
Expected: сборка проходит, все тесты зелёные.

- [ ] **Step 7: Передать на коммит**

```
feat: выход из аккаунта, настройки и документация по развёртыванию
```
