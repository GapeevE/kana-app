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
