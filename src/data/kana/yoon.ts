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
