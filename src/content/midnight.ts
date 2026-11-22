import enSource from "./midnight.en.md?raw"
import ruSource from "./midnight.ru.md?raw"
import type { Locale } from "./types"

export type MidnightBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "emphasis"; text: string }
  | { kind: "link"; text: string; href: string }
  | { kind: "media-reference"; asset: string }

export type MidnightChapter = {
  id: "product" | "dialogue" | "engineering" | "generative-media" | "art-direction"
  label: string
  title: string
  subtitle: string
  blocks: MidnightBlock[]
}

const CHAPTER_IDS: MidnightChapter["id"][] = [
  "product",
  "dialogue",
  "engineering",
  "generative-media",
  "art-direction",
]

function parseMidnightSource(source: string): MidnightChapter[] {
  const chapters: MidnightChapter[] = []
  let current: MidnightChapter | null = null

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith("# ")) {
      const id = CHAPTER_IDS[chapters.length]
      if (!id) continue

      current = {
        id,
        label: line.slice(2),
        title: "",
        subtitle: "",
        blocks: [],
      }
      chapters.push(current)
      continue
    }

    if (!current) continue

    if (line.startsWith("## ")) {
      current.title = line.slice(3)
      continue
    }

    if (line.startsWith("### ")) {
      current.blocks.push({ kind: "subheading", text: line.slice(4) })
      continue
    }

    const boldLine = line.match(/^\*\*(.+)\*\*$/)
    if (boldLine) {
      if (!current.subtitle) {
        current.subtitle = boldLine[1]
      } else {
        current.blocks.push({ kind: "emphasis", text: boldLine[1] })
      }
      continue
    }

    const link = line.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
    if (link) {
      current.blocks.push({ kind: "link", text: link[1], href: link[2] })
      continue
    }

    const mediaReference = line.match(/^!\[\[([^\]]+)\]\]$/)
    if (mediaReference) {
      current.blocks.push({ kind: "media-reference", asset: mediaReference[1] })
      continue
    }

    current.blocks.push({ kind: "paragraph", text: line })
  }

  return chapters
}

export const MIDNIGHT_CONTENT: Record<Locale, MidnightChapter[]> = {
  en: parseMidnightSource(enSource),
  ru: parseMidnightSource(ruSource),
}
