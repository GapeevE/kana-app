'use client'

import { useState, useTransition } from 'react'
import { toggleFavoriteAction } from '@/server/actions/favorites'
import { Button } from '@/components/ui/button'

export function FavoriteButton({ cardId, initial }: { cardId: string; initial: boolean }) {
  const [active, setActive] = useState(initial)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant={active ? 'default' : 'outline'}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setActive(await toggleFavoriteAction(cardId))
        })
      }
    >
      {active ? '★ В избранном' : '☆ В избранное'}
    </Button>
  )
}
