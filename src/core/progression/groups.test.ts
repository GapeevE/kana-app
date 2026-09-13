import { describe, it, expect } from 'vitest'
import { GROUP_ORDER, isGroupComplete, unlockedGroups, currentGroup } from './groups'
import { cardsOfGroup } from '@/data/kana'

function completed(...groups: string[]): Set<string> {
  return new Set(groups.flatMap((g) => cardsOfGroup(g).map((c) => c.id)))
}

describe('GROUP_ORDER', () => {
  it('начинается с первого ряда хираганы', () => {
    expect(GROUP_ORDER[0]).toBe('hiragana_a')
  })

  it('проводит всю хирагану перед катаканой', () => {
    const firstKatakana = GROUP_ORDER.findIndex((g) => g.startsWith('katakana_'))
    const lastHiragana = GROUP_ORDER.map((g) => g.startsWith('hiragana_')).lastIndexOf(true)
    expect(lastHiragana).toBeLessThan(firstKatakana)
  })

  it('внутри азбуки идёт годзюон, затем дакутэн, затем ёон', () => {
    const hira = GROUP_ORDER.filter((g) => g.startsWith('hiragana_'))
    const firstDakuten = hira.findIndex((g) => g.includes('_dakuten_'))
    const firstYoon = hira.findIndex((g) => g.includes('_yoon_'))
    expect(firstDakuten).toBeLessThan(firstYoon)
  })

  it('покрывает все группы датасета без повторов', () => {
    expect(new Set(GROUP_ORDER).size).toBe(GROUP_ORDER.length)
  })
})

describe('isGroupComplete', () => {
  it('ложно, когда не все знаки группы отвечены', () => {
    const partial = new Set(['hiragana_a', 'hiragana_i'])
    expect(isGroupComplete('hiragana_a', partial)).toBe(false)
  })

  it('истинно, когда каждый знак группы отвечен хотя бы раз', () => {
    expect(isGroupComplete('hiragana_a', completed('hiragana_a'))).toBe(true)
  })
})

describe('unlockedGroups', () => {
  it('у нового пользователя открыта только первая группа', () => {
    expect(unlockedGroups(new Set())).toEqual(['hiragana_a'])
  })

  it('открывает следующую группу после освоения предыдущей', () => {
    const unlocked = unlockedGroups(completed('hiragana_a'))
    expect(unlocked).toEqual(['hiragana_a', GROUP_ORDER[1]])
  })

  it('останавливается на первой неосвоенной группе', () => {
    const unlocked = unlockedGroups(completed('hiragana_a', GROUP_ORDER[2]))
    expect(unlocked).toEqual(['hiragana_a', GROUP_ORDER[1]])
  })
})

describe('currentGroup', () => {
  it('у нового пользователя — первая группа', () => {
    expect(currentGroup(new Set())).toBe('hiragana_a')
  })

  it('после освоения первой — вторая', () => {
    expect(currentGroup(completed('hiragana_a'))).toBe(GROUP_ORDER[1])
  })

  it('null, когда освоено всё', () => {
    const all = new Set(GROUP_ORDER.flatMap((g) => cardsOfGroup(g).map((c) => c.id)))
    expect(currentGroup(all)).toBeNull()
  })
})
