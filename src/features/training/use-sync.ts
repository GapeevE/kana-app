'use client'

import { useEffect, useRef } from 'react'
import { syncAnswers } from '@/server/actions/session'
import type { SessionAnswer } from '@/core/session'

const STORAGE_KEY = 'kana-app:pending-answers'
const BATCH_SIZE = 10

function readStored(): SessionAnswer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionAnswer[]) : []
  } catch {
    return []
  }
}

function writeStored(answers: SessionAnswer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  } catch {
    return
  }
}

export async function flush(answers: SessionAnswer[]): Promise<void> {
  const all = [...readStored(), ...answers]
  if (all.length === 0) return

  writeStored(all)
  try {
    const result = await syncAnswers(all)
    if (result.ok) writeStored([])
  } catch {
    return
  }
}

export function useSync(pendingCount: number, drain: () => SessionAnswer[], finished: boolean) {
  const flushing = useRef(false)

  useEffect(() => {
    void flush([])
  }, [])

  useEffect(() => {
    if (flushing.current) return
    if (pendingCount === 0) return
    if (pendingCount < BATCH_SIZE && !finished) return

    flushing.current = true
    void flush(drain()).finally(() => {
      flushing.current = false
    })
  }, [pendingCount, finished, drain])
}
