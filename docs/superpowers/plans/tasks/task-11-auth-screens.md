# Task 11: Базовые компоненты и экраны входа

**Этап:** 3. Интерфейс
**Зависит от:** [Task 8](task-08-auth.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/components/ui/*` (через CLI shadcn)
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/features/auth/login-form.tsx`
- Create: `src/features/auth/register-form.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `registerUser`, `signIn` из `@/server/auth`
- Produces: рабочие экраны `/login` и `/register`

- [ ] **Step 1: Инициализировать shadcn/ui**

```bash
pnpm dlx shadcn@latest init -d
```

При запросе стиля выбрать значения по умолчанию. Базовый цвет — `neutral`.

- [ ] **Step 2: Добавить нужные компоненты**

```bash
pnpm dlx shadcn@latest add button input label card checkbox progress tabs badge dialog sonner
```

- [ ] **Step 3: Написать форму входа**

`src/features/auth/login-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      login: String(form.get('login') ?? ''),
      password: String(form.get('password') ?? ''),
      redirect: false,
    })

    setPending(false)
    if (result?.error) {
      setError('Неверный логин или пароль')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login">Логин</Label>
        <Input id="login" name="login" autoComplete="username" required minLength={3} maxLength={32} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Вход…' : 'Войти'}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Нет аккаунта? <Link href="/register" className="underline">Зарегистрироваться</Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Написать форму регистрации**

`src/features/auth/register-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { registerUser } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const login = String(form.get('login') ?? '')
    const password = String(form.get('password') ?? '')

    const result = await registerUser({
      login,
      password,
      inviteCode: String(form.get('inviteCode') ?? ''),
      acknowledged,
    })

    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }

    await signIn('credentials', { login, password, redirect: false })
    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login">Логин</Label>
        <Input id="login" name="login" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_-]+" />
        <p className="text-xs text-muted-foreground">Латиница, цифры, дефис и подчёркивание</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inviteCode">Код приглашения</Label>
        <Input id="inviteCode" name="inviteCode" required />
      </div>

      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-3">
        <p className="text-sm">
          Приложение не хранит почту и телефон, поэтому <strong>восстановить пароль будет невозможно</strong>.
          Если вы его забудете, доступ к аккаунту и всему прогрессу будет потерян навсегда.
        </p>
        <div className="flex items-start gap-2">
          <Checkbox id="ack" checked={acknowledged} onCheckedChange={(v) => setAcknowledged(v === true)} />
          <Label htmlFor="ack" className="text-sm font-normal leading-snug">
            Я понимаю, что восстановить пароль будет невозможно
          </Label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending || !acknowledged}>
        {pending ? 'Создание…' : 'Создать аккаунт'}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Уже есть аккаунт? <Link href="/login" className="underline">Войти</Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 5: Создать страницы**

`src/app/login/page.tsx`:

```tsx
import { LoginForm } from '@/features/auth/login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>kana-app</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
```

`src/app/register/page.tsx`:

```tsx
import { RegisterForm } from '@/features/auth/register-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 6: Проверить сборку**

Run: `pnpm build`
Expected: сборка проходит.

- [ ] **Step 7: Передать владельцу на ручную проверку**

Запустить `pnpm dev` и сообщить владельцу: проверить регистрацию с верным и неверным кодом приглашения, вход, выход, редирект неавторизованного на `/login`.

- [ ] **Step 8: Передать на коммит**

```
feat: экраны входа и регистрации с предупреждением о невосстановимости пароля
```
