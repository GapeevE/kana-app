'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { registerUser } from '@/server/auth/actions'
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
        <p className="text-xs text-muted-foreground">Не короче 8 символов</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inviteCode">Код приглашения</Label>
        <Input id="inviteCode" name="inviteCode" required />
      </div>

      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-3">
        <p className="text-sm">
          Приложение не хранит почту и телефон, поэтому <strong>восстановить пароль будет невозможно</strong>. Если вы
          его забудете, доступ к аккаунту и всему прогрессу будет потерян навсегда.
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
        Уже есть аккаунт?{' '}
        <Link href="/login" className="underline">
          Войти
        </Link>
      </p>
    </form>
  )
}
