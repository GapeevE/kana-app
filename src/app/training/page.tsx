import { redirect } from 'next/navigation'
import { startSession } from '@/server/actions/session'
import { TrainingScreen } from '@/features/training/training-screen'

export default async function TrainingPage() {
  const session = await startSession()
  if (session.cards.length === 0) redirect('/')

  return <TrainingScreen sessionId={session.sessionId} items={session.cards} />
}
