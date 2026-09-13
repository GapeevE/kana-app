import { describe, it, expect } from 'vitest'
import { KANA_CARDS, KANA_BY_ID, cardsOfGroup } from '@/data/kana'

describe('датасет каны', () => {
  it('содержит 208 карточек', () => {
    expect(KANA_CARDS.length).toBe(208)
  })

  it('делится поровну между хираганой и катаканой', () => {
    const hiragana = KANA_CARDS.filter((c) => c.script === 'hiragana')
    const katakana = KANA_CARDS.filter((c) => c.script === 'katakana')
    expect(hiragana.length).toBe(104)
    expect(katakana.length).toBe(104)
  })

  it('содержит 46 базовых знаков каждой азбуки', () => {
    const gojuon = KANA_CARDS.filter((c) => c.type === 'gojuon')
    expect(gojuon.length).toBe(92)
  })

  it('содержит 66 сочетаний ёон', () => {
    const yoon = KANA_CARDS.filter((c) => c.type === 'yoon')
    expect(yoon.length).toBe(66)
  })

  it('не содержит дублирующихся идентификаторов', () => {
    const ids = new Set(KANA_CARDS.map((c) => c.id))
    expect(ids.size).toBe(KANA_CARDS.length)
  })

  it('не содержит дублирующихся знаков', () => {
    const chars = new Set(KANA_CARDS.map((c) => c.char))
    expect(chars.size).toBe(KANA_CARDS.length)
  })

  it('у каждой карточки заполнены обязательные поля', () => {
    for (const card of KANA_CARDS) {
      expect(card.id).toMatch(/^[a-z_]+$/)
      expect(card.char.length).toBeGreaterThan(0)
      expect(card.romaji).toMatch(/^[a-z]+$/)
      expect(card.group.length).toBeGreaterThan(0)
      expect(card.row.length).toBeGreaterThan(0)
    }
  })

  it('идентификатор собирается из script и romaji', () => {
    for (const card of KANA_CARDS) {
      expect(card.id).toBe(`${card.script}_${card.romaji}`)
    }
  })

  it('использует систему Хэпбёрна', () => {
    expect(KANA_BY_ID.get('hiragana_shi')?.char).toBe('し')
    expect(KANA_BY_ID.get('hiragana_chi')?.char).toBe('ち')
    expect(KANA_BY_ID.get('hiragana_tsu')?.char).toBe('つ')
    expect(KANA_BY_ID.get('hiragana_ji')?.char).toBe('じ')
    expect(KANA_BY_ID.get('hiragana_fu')?.char).toBe('ふ')
  })

  it('индекс по идентификатору покрывает весь датасет', () => {
    expect(KANA_BY_ID.size).toBe(KANA_CARDS.length)
  })

  it('возвращает карточки группы', () => {
    const group = cardsOfGroup('hiragana_k')
    expect(group.length).toBe(5)
    expect(group.map((c) => c.romaji)).toEqual(['ka', 'ki', 'ku', 'ke', 'ko'])
  })
})
