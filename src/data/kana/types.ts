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
  hint?: string
  facts?: string[]
  examples?: string[]
}
