'use client'

import { useState, useTransition } from 'react'
import { toggleFavoriteAction } from '@/server/actions/favorites'
import { Star } from 'lucide-react'
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
      <Star className={active ? 'size-4 fill-current' : 'size-4'} />
      {active ? 'В избранном' : 'В избранное'}
    </Button>
  )
}
