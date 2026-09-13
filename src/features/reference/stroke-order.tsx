import { readFile } from 'node:fs/promises'
import path from 'node:path'

async function loadSvg(code: string): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), 'public', 'kanjivg', `${code}.svg`)
    const raw = await readFile(file, 'utf8')
    const body = raw.slice(raw.indexOf('<svg'))
    return body.replace(/stroke:#000000/g, 'stroke:currentColor')
  } catch {
    return null
  }
}

export async function StrokeOrder({ char }: { char: string }) {
  if ([...char].length > 1) return null

  const code = char.codePointAt(0)!.toString(16).padStart(5, '0')
  const svg = await loadSvg(code)
  if (!svg) return null

  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="stroke-order size-40 text-foreground" dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="text-xs text-muted-foreground">
        Порядок черт:{' '}
        <a href="https://kanjivg.tagaini.net/" className="underline" rel="noreferrer" target="_blank">
          KanjiVG
        </a>
        , CC BY-SA 3.0
      </figcaption>
    </figure>
  )
}
