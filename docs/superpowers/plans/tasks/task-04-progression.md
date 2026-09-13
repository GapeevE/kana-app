# Task 4: Прогрессия групп

**Этап:** 1. Окружение и ядро
**Зависит от:** [Task 3](task-03-kana-dataset.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/core/progression/groups.ts`
- Create: `src/core/progression/index.ts`
- Test: `src/core/progression/groups.test.ts`

**Interfaces:**
- Consumes: `KANA_CARDS`, `cardsOfGroup` из `@/data/kana`
- Produces:
  - `const GROUP_ORDER: readonly string[]` — порядок групп от первой к последней
  - `function isGroupComplete(group: string, answeredCorrectly: ReadonlySet<string>): boolean`
  - `function unlockedGroups(answeredCorrectly: ReadonlySet<string>): string[]`
  - `function currentGroup(answeredCorrectly: ReadonlySet<string>): string | null`

`answeredCorrectly` — множество `card_id`, по которым получен хотя бы один ответ с quality ≥ 2.

- [ ] **Step 1: Написать падающие тесты**

`src/core/progression/groups.test.ts`:

```typescript
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
```

- [ ] **Step 2: Запустить тесты и убедиться, что они падают**

Run: `pnpm test`
Expected: FAIL — модуль `./groups` не найден.

- [ ] **Step 3: Реализовать прогрессию**

`src/core/progression/groups.ts`:

```typescript
import { KANA_CARDS, cardsOfGroup } from '@/data/kana'
import type { KanaCard, Script, KanaType } from '@/data/kana'

function typeRank(type: KanaType): number {
  if (type === 'gojuon') return 0
  if (type === 'dakuten' || type === 'handakuten') return 1
  return 2
}

function scriptRank(script: Script): number {
  return script === 'hiragana' ? 0 : 1
}

function buildOrder(): string[] {
  const seen = new Map<string, KanaCard>()
  for (const card of KANA_CARDS) {
    if (!seen.has(card.group)) seen.set(card.group, card)
  }
  return [...seen.entries()]
    .sort(([, a], [, b]) => {
      const byScript = scriptRank(a.script) - scriptRank(b.script)
      if (byScript !== 0) return byScript
      const byType = typeRank(a.type) - typeRank(b.type)
      if (byType !== 0) return byType
      return KANA_CARDS.indexOf(a) - KANA_CARDS.indexOf(b)
    })
    .map(([group]) => group)
}

export const GROUP_ORDER: readonly string[] = buildOrder()

export function isGroupComplete(group: string, answeredCorrectly: ReadonlySet<string>): boolean {
  const cards = cardsOfGroup(group)
  return cards.length > 0 && cards.every((c) => answeredCorrectly.has(c.id))
}

export function unlockedGroups(answeredCorrectly: ReadonlySet<string>): string[] {
  const unlocked: string[] = []
  for (const group of GROUP_ORDER) {
    unlocked.push(group)
    if (!isGroupComplete(group, answeredCorrectly)) break
  }
  return unlocked
}

export function currentGroup(answeredCorrectly: ReadonlySet<string>): string | null {
  return GROUP_ORDER.find((g) => !isGroupComplete(g, answeredCorrectly)) ?? null
}
```

- [ ] **Step 4: Запустить тесты**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Создать индексный файл**

`src/core/progression/index.ts`:

```typescript
export { GROUP_ORDER, isGroupComplete, unlockedGroups, currentGroup } from './groups'
```

- [ ] **Step 6: Передать на коммит**

```
feat: линейная прогрессия групп с критерием открытия
```
