# Task 1: Зависимости, конфигурация, структура каталогов

**Этап:** 1. Окружение и ядро
**Зависит от:** нет
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Modify: `package.json`
- Create: `vitest.config.mts`
- Create: `.env.example`
- Create: `src/core/.gitkeep`, `src/data/.gitkeep`, `src/server/.gitkeep`, `src/features/.gitkeep`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx` — очистить до заглушки, полноценный экран создаётся в Task 12

**Interfaces:**
- Consumes: ничего
- Produces: рабочее окружение с `pnpm test`, шрифт Noto Sans JP в `--font-jp`

- [ ] **Step 1: Установить зависимости времени выполнения**

```bash
pnpm add drizzle-orm @neondatabase/serverless next-auth@beta bcryptjs zod zustand
```

- [ ] **Step 2: Установить зависимости разработки**

```bash
pnpm add -D drizzle-kit vitest dotenv
```

Отдельный пакет типов для bcryptjs не нужен: начиная с версии 3 библиотека поставляет `index.d.ts` сама, а `@types/bcryptjs` помечен deprecated.

- [ ] **Step 3: Добавить скрипты в package.json**

В раздел `scripts` файла `package.json` добавить:

```json
"test": "vitest run",
"test:watch": "vitest",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

- [ ] **Step 4: Разрешить build-скрипты esbuild**

Vitest не запустится, пока pnpm не разрешит esbuild выполнить скрипт установки. Добавить в `package.json`:

```json
"pnpm": {
  "onlyBuiltDependencies": ["esbuild"]
}
```

Затем `pnpm install`.

- [ ] **Step 5: Создать vitest.config.mts**

Расширение `.mts` обязательно: при `.ts` Vite загружает конфиг как CommonJS и предупреждает о несовместимости синтаксиса ESM.

```typescript
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/core/**/*.test.ts'],
    passWithNoTests: true,
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
```

Флаг `passWithNoTests` нужен, чтобы прогон без тестов не возвращал код ошибки — задачи вне `src/core/*` тестов не добавляют.

- [ ] **Step 6: Проверить, что тесты запускаются**

Run: `pnpm test`
Expected: «No test files found, exiting with code 0», без предупреждений.

- [ ] **Step 7: Создать .env.example**

```
DATABASE_URL=
AUTH_SECRET=
INVITE_CODE=
```

- [ ] **Step 8: Исправить .gitignore**

Шаблон `create-next-app` игнорирует `.env*`, что исключает и `.env.example`, который должен попасть в репозиторий. Добавить строкой ниже:

```
!.env.example
```

Проверить: `git check-ignore -v .env.example` должна показать правило `!.env.example`.

- [ ] **Step 9: Создать каталоги структуры**

```bash
mkdir -p src/core/srs src/core/session src/core/progression src/data/kana \
  src/server/db src/server/repository src/server/auth src/server/actions \
  src/features/training src/features/reference src/features/progress src/features/favorites src/features/auth \
  src/components
```

- [ ] **Step 10: Подключить шрифт Noto Sans JP в layout**

Заменить содержимое `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Noto_Sans_JP, Inter } from 'next/font/google'
import './globals.css'
import React from 'react'

const inter = Inter({ variable: '--font-sans', subsets: ['latin', 'cyrillic'] })
const notoJP = Noto_Sans_JP({ variable: '--font-jp', subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'kana-app',
  description: 'Изучение японской азбуки',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${notoJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
```

- [ ] **Step 11: Привести globals.css в соответствие**

Файл из шаблона ссылается на удалённые шрифты Geist. Заменить блок `@theme inline` и `body`, добавить класс для японских знаков:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-jp: var(--font-jp);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}

.kana-glyph {
  font-family: var(--font-jp), sans-serif;
  line-height: 1;
}
```

- [ ] **Step 12: Очистить стартовую страницу**

Заменить содержимое `src/app/page.tsx` (в нём остался демонстрационный запрос к GitHub API):

```tsx
export default function Home() {
  return <main className="flex flex-1 items-center justify-center">kana-app</main>
}
```

Полноценный главный экран создаётся в Task 12.

- [ ] **Step 13: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит. Предупреждения о неиспользуемых зависимостях допустимы.

- [ ] **Step 14: Передать на коммит**

Предлагаемое сообщение:

```
chore: настроить окружение, зависимости и структуру каталогов
```
