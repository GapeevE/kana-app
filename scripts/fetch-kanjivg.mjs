import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises'

const BASE = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji'
const OUT = 'public/kanjivg'
const SOURCES = ['src/data/kana/gojuon.ts', 'src/data/kana/dakuten.ts', 'src/data/kana/yoon.ts']

async function collectChars() {
  const chars = new Set()
  for (const path of SOURCES) {
    const text = await readFile(path, 'utf8')
    for (const [, hira, kata] of text.matchAll(/\['(.+?)', '(.+?)', '[a-z]+'\]/g)) {
      chars.add(hira)
      chars.add(kata)
    }
  }
  return [...chars]
}

const chars = await collectChars()
const single = chars.filter((c) => [...c].length === 1)

await mkdir(OUT, { recursive: true })
const existing = new Set(await readdir(OUT).catch(() => []))

let downloaded = 0
let skipped = 0
let missing = 0

for (const char of single) {
  const file = `${char.codePointAt(0).toString(16).padStart(5, '0')}.svg`
  if (existing.has(file)) {
    skipped++
    continue
  }

  const response = await fetch(`${BASE}/${file}`)
  if (!response.ok) {
    missing++
    continue
  }

  await writeFile(`${OUT}/${file}`, await response.text())
  downloaded++
}

console.log(`знаков всего ${chars.length}, из них односимвольных ${single.length}`)
console.log(`загружено ${downloaded}, пропущено ${skipped}, недоступно ${missing}`)
