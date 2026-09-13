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
        Нет аккаунта?{' '}
        <Link href="/register" className="underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}
