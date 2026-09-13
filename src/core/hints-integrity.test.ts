import { describe, it, expect } from 'vitest'
import { KANA_CARDS, KANA_BY_ID } from '@/data/kana'
import { KANA_HINTS } from '@/data/kana/hints'

describe('подсказки и факты', () => {
  it('покрывают весь датасет', () => {
    expect(Object.keys(KANA_HINTS).length).toBe(KANA_CARDS.length)
    for (const card of KANA_CARDS) {
      expect(KANA_HINTS[card.id], `нет записи для ${card.id}`).toBeDefined()
    }
  })

  it('не содержат ключей, которых нет в датасете', () => {
    for (const id of Object.keys(KANA_HINTS)) {
      expect(KANA_BY_ID.has(id), `лишний ключ ${id}`).toBe(true)
    }
  })

  it('совпадают с датасетом по знаку и чтению', () => {
    for (const [id, entry] of Object.entries(KANA_HINTS)) {
      const card = KANA_BY_ID.get(id)
      if (!card) continue
      expect(entry.char, `знак не совпадает у ${id}`).toBe(card.char)
      expect(entry.romaji, `чтение не совпадает у ${id}`).toBe(card.romaji)
    }
  })

  it('подсказка не содержит готового ответа', () => {
    const leaking: string[] = []
    for (const card of KANA_CARDS) {
      if (!card.hint) continue
      const normalized = card.hint.toLowerCase().replace(/[«»"'`]/g, '')
      if (new RegExp(`\\b${card.romaji}\\b`).test(normalized)) leaking.push(card.id)
    }
    expect(leaking, `подсказка выдаёт ответ: ${leaking.join(', ')}`).toEqual([])
  })
})
