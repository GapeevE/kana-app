import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { StrokeOrderPlayer } from './stroke-order-player'

function approxLength(d: string): number {
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  let length = 0
  for (let i = 2; i + 1 < nums.length; i += 2) {
    length += Math.hypot(nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1])
  }
  return length
}

const STROKE_DURATION = 0.45
const STROKE_GAP = 0.12

function prepare(raw: string): { svg: string; strokes: number } {
  const body = raw.slice(raw.indexOf('<svg'))
  let strokes = 0

  const svg = body
    .replace(/stroke:#000000/g, 'stroke:currentColor')
    .replace(/<path id="(kvg:[^"]+)" d="([^"]+)"/g, (match, _id, d: string) => {
      const length = Math.ceil(approxLength(d)) + 24
      const delay = (strokes * (STROKE_DURATION + STROKE_GAP)).toFixed(2)
      strokes += 1
      return `${match} style="--len:${length};--delay:${delay}s"`
    })

  return { svg, strokes }
}

export async function StrokeOrder({ char }: { char: string }) {
  if ([...char].length > 1) return null

  const code = char.codePointAt(0)!.toString(16).padStart(5, '0')

  let raw: string
  try {
    raw = await readFile(path.join(process.cwd(), 'public', 'kanjivg', `${code}.svg`), 'utf8')
  } catch {
    return null
  }

  const { svg, strokes } = prepare(raw)

  return <StrokeOrderPlayer svg={svg} strokes={strokes} />
}
