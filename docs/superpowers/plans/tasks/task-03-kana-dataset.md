# Task 3: Датасет каны

**Этап:** 1. Окружение и ядро
**Зависит от:** [Task 1](task-01-setup.md)
**Требования к исполнителю:** [AGENT.md](AGENT.md) — прочитать перед началом
**Спека:** [../../../spec.md](../../../spec.md)

---


**Files:**
- Create: `src/data/kana/types.ts`
- Create: `src/data/kana/gojuon.ts`
- Create: `src/data/kana/dakuten.ts`
- Create: `src/data/kana/yoon.ts`
- Create: `src/data/kana/index.ts`
- Test: `src/core/session/dataset.test.ts`

**Interfaces:**
- Consumes: ничего
- Produces:
  - `interface KanaCard { id: string; char: string; romaji: string; script: 'hiragana' | 'katakana'; type: 'gojuon' | 'dakuten' | 'handakuten' | 'yoon'; group: string; row: string; facts?: string[]; examples?: string[] }`
  - `const KANA_CARDS: readonly KanaCard[]`
  - `const KANA_BY_ID: ReadonlyMap<string, KanaCard>`
  - `function cardsOfGroup(group: string): KanaCard[]`

Идентификатор карточки: `<script>_<romaji>`, например `hiragana_ki`, `katakana_shi`, `hiragana_kya`.
Идентификатор группы: `<script>_<row>`, например `hiragana_k`, `katakana_dakuten_g`, `hiragana_yoon_k`.

- [ ] **Step 1: Написать типы датасета**

`src/data/kana/types.ts`:

```typescript
export type Script = 'hiragana' | 'katakana'
export type KanaType = 'gojuon' | 'dakuten' | 'handakuten' | 'yoon'

export interface KanaCard {
  id: string
  char: string
  romaji: string
  script: Script
  type: KanaType
  group: string
  row: string
  facts?: string[]
  examples?: string[]
}
```

- [ ] **Step 2: Написать падающие тесты на целостность датасета**

Эти тесты защищают от опечаток в 208 записях, которые иначе обнаружатся только пользователем.

`src/core/session/dataset.test.ts`:

```typescript
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
```

- [ ] **Step 3: Запустить тесты и убедиться, что они падают**

Run: `pnpm test`
Expected: FAIL — модуль `@/data/kana` не найден.

- [ ] **Step 4: Написать годзюон**

`src/data/kana/gojuon.ts`. Данные задаются компактными таблицами, из которых генерируются карточки — это исключает ручные опечатки в повторяющихся полях.

```typescript
import type { KanaCard, Script } from './types'

const ROWS: Array<{ row: string; items: Array<[string, string, string]> }> = [
  { row: 'a', items: [['あ', 'ア', 'a'], ['い', 'イ', 'i'], ['う', 'ウ', 'u'], ['え', 'エ', 'e'], ['お', 'オ', 'o']] },
  { row: 'k', items: [['か', 'カ', 'ka'], ['き', 'キ', 'ki'], ['く', 'ク', 'ku'], ['け', 'ケ', 'ke'], ['こ', 'コ', 'ko']] },
  { row: 's', items: [['さ', 'サ', 'sa'], ['し', 'シ', 'shi'], ['す', 'ス', 'su'], ['せ', 'セ', 'se'], ['そ', 'ソ', 'so']] },
  { row: 't', items: [['た', 'タ', 'ta'], ['ち', 'チ', 'chi'], ['つ', 'ツ', 'tsu'], ['て', 'テ', 'te'], ['と', 'ト', 'to']] },
  { row: 'n', items: [['な', 'ナ', 'na'], ['に', 'ニ', 'ni'], ['ぬ', 'ヌ', 'nu'], ['ね', 'ネ', 'ne'], ['の', 'ノ', 'no']] },
  { row: 'h', items: [['は', 'ハ', 'ha'], ['ひ', 'ヒ', 'hi'], ['ふ', 'フ', 'fu'], ['へ', 'ヘ', 'he'], ['ほ', 'ホ', 'ho']] },
  { row: 'm', items: [['ま', 'マ', 'ma'], ['み', 'ミ', 'mi'], ['む', 'ム', 'mu'], ['め', 'メ', 'me'], ['も', 'モ', 'mo']] },
  { row: 'y', items: [['や', 'ヤ', 'ya'], ['ゆ', 'ユ', 'yu'], ['よ', 'ヨ', 'yo']] },
  { row: 'r', items: [['ら', 'ラ', 'ra'], ['り', 'リ', 'ri'], ['る', 'ル', 'ru'], ['れ', 'レ', 're'], ['ろ', 'ロ', 'ro']] },
  { row: 'w', items: [['わ', 'ワ', 'wa'], ['を', 'ヲ', 'wo']] },
  { row: 'nn', items: [['ん', 'ン', 'n']] },
]

function build(script: Script): KanaCard[] {
  const charIndex = script === 'hiragana' ? 0 : 1
  return ROWS.flatMap(({ row, items }) =>
    items.map(([hira, kata, romaji]) => ({
      id: `${script}_${romaji}`,
      char: [hira, kata][charIndex],
      romaji,
      script,
      type: 'gojuon' as const,
      group: `${script}_${row}`,
      row,
    })),
  )
}

export const GOJUON: KanaCard[] = [...build('hiragana'), ...build('katakana')]
```

- [ ] **Step 5: Написать дакутэн и хандакутэн**

`src/data/kana/dakuten.ts`:

```typescript
import type { KanaCard, Script, KanaType } from './types'

const ROWS: Array<{ row: string; type: KanaType; items: Array<[string, string, string]> }> = [
  { row: 'g', type: 'dakuten', items: [['が', 'ガ', 'ga'], ['ぎ', 'ギ', 'gi'], ['ぐ', 'グ', 'gu'], ['げ', 'ゲ', 'ge'], ['ご', 'ゴ', 'go']] },
  { row: 'z', type: 'dakuten', items: [['ざ', 'ザ', 'za'], ['じ', 'ジ', 'ji'], ['ず', 'ズ', 'zu'], ['ぜ', 'ゼ', 'ze'], ['ぞ', 'ゾ', 'zo']] },
  { row: 'd', type: 'dakuten', items: [['だ', 'ダ', 'da'], ['ぢ', 'ヂ', 'dji'], ['づ', 'ヅ', 'dzu'], ['で', 'デ', 'de'], ['ど', 'ド', 'do']] },
  { row: 'b', type: 'dakuten', items: [['ば', 'バ', 'ba'], ['び', 'ビ', 'bi'], ['ぶ', 'ブ', 'bu'], ['べ', 'ベ', 'be'], ['ぼ', 'ボ', 'bo']] },
  { row: 'p', type: 'handakuten', items: [['ぱ', 'パ', 'pa'], ['ぴ', 'ピ', 'pi'], ['ぷ', 'プ', 'pu'], ['ぺ', 'ペ', 'pe'], ['ぽ', 'ポ', 'po']] },
]

function build(script: Script): KanaCard[] {
  const charIndex = script === 'hiragana' ? 0 : 1
  return ROWS.flatMap(({ row, type, items }) =>
    items.map(([hira, kata, romaji]) => ({
      id: `${script}_${romaji}`,
      char: [hira, kata][charIndex],
      romaji,
      script,
      type,
      group: `${script}_dakuten_${row}`,
      row,
    })),
  )
}

export const DAKUTEN: KanaCard[] = [...build('hiragana'), ...build('katakana')]
```

Чтения `dji` (ぢ) и `dzu` (づ) отличаются от `ji` (じ) и `zu` (ず), чтобы идентификаторы и правильные ответы оставались уникальными. В современном японском эти пары произносятся одинаково; расхождение объясняется пользователю фактом на карточке (см. `docs/content-facts.md`).

- [ ] **Step 6: Написать ёон**

`src/data/kana/yoon.ts`:

```typescript
import type { KanaCard, Script } from './types'

const ROWS: Array<{ row: string; items: Array<[string, string, string]> }> = [
  { row: 'k', items: [['きゃ', 'キャ', 'kya'], ['きゅ', 'キュ', 'kyu'], ['きょ', 'キョ', 'kyo']] },
  { row: 's', items: [['しゃ', 'シャ', 'sha'], ['しゅ', 'シュ', 'shu'], ['しょ', 'ショ', 'sho']] },
  { row: 't', items: [['ちゃ', 'チャ', 'cha'], ['ちゅ', 'チュ', 'chu'], ['ちょ', 'チョ', 'cho']] },
  { row: 'n', items: [['にゃ', 'ニャ', 'nya'], ['にゅ', 'ニュ', 'nyu'], ['にょ', 'ニョ', 'nyo']] },
  { row: 'h', items: [['ひゃ', 'ヒャ', 'hya'], ['ひゅ', 'ヒュ', 'hyu'], ['ひょ', 'ヒョ', 'hyo']] },
  { row: 'm', items: [['みゃ', 'ミャ', 'mya'], ['みゅ', 'ミュ', 'myu'], ['みょ', 'ミョ', 'myo']] },
  { row: 'r', items: [['りゃ', 'リャ', 'rya'], ['りゅ', 'リュ', 'ryu'], ['りょ', 'リョ', 'ryo']] },
  { row: 'g', items: [['ぎゃ', 'ギャ', 'gya'], ['ぎゅ', 'ギュ', 'gyu'], ['ぎょ', 'ギョ', 'gyo']] },
  { row: 'j', items: [['じゃ', 'ジャ', 'ja'], ['じゅ', 'ジュ', 'ju'], ['じょ', 'ジョ', 'jo']] },
  { row: 'b', items: [['びゃ', 'ビャ', 'bya'], ['びゅ', 'ビュ', 'byu'], ['びょ', 'ビョ', 'byo']] },
  { row: 'p', items: [['ぴゃ', 'ピャ', 'pya'], ['ぴゅ', 'ピュ', 'pyu'], ['ぴょ', 'ピョ', 'pyo']] },
]

function build(script: Script): KanaCard[] {
  const charIndex = script === 'hiragana' ? 0 : 1
  return ROWS.flatMap(({ row, items }) =>
    items.map(([hira, kata, romaji]) => ({
      id: `${script}_${romaji}`,
      char: [hira, kata][charIndex],
      romaji,
      script,
      type: 'yoon' as const,
      group: `${script}_yoon_${row}`,
      row,
    })),
  )
}

export const YOON: KanaCard[] = [...build('hiragana'), ...build('katakana')]
```

- [ ] **Step 7: Собрать датасет**

`src/data/kana/index.ts`:

```typescript
import { GOJUON } from './gojuon'
import { DAKUTEN } from './dakuten'
import { YOON } from './yoon'
import type { KanaCard } from './types'

export const KANA_CARDS: readonly KanaCard[] = [...GOJUON, ...DAKUTEN, ...YOON]

export const KANA_BY_ID: ReadonlyMap<string, KanaCard> = new Map(KANA_CARDS.map((c) => [c.id, c]))

export function cardsOfGroup(group: string): KanaCard[] {
  return KANA_CARDS.filter((c) => c.group === group)
}

export type { KanaCard, Script, KanaType } from './types'
```

- [ ] **Step 8: Запустить тесты**

Run: `pnpm test`
Expected: PASS. Если тест на количество не сходится — пересчитать таблицы, а не править ожидаемое число в тесте.

- [ ] **Step 9: Передать на коммит**

```
feat: датасет каны на 208 карточек с проверками целостности
```
