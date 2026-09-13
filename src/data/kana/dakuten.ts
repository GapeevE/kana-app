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
