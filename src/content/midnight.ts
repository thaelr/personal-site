import enSource from "./midnight.en.md?raw"
import ruSource from "./midnight.ru.md?raw"
import type { Locale } from "./types"

export type MidnightAccent = "full" | "audience" | "recognition" | "final"

export type MidnightBlock =
  | { kind: "paragraph"; text: string; accent?: MidnightAccent; notice?: boolean }
  | { kind: "subheading"; text: string }
  | { kind: "emphasis"; text: string; accent?: MidnightAccent }
  | { kind: "link"; text: string; href: string }
  | { kind: "media-reference"; asset: string }

export type MidnightChapter = {
  id: "product" | "dialogue" | "engineering" | "generative-media" | "art-direction"
  label: string
  title: string
  subtitle: string
  previewEnd: number
  blocks: MidnightBlock[]
}

type MidnightMarker = "preview-end" | "notice" | `accent:${MidnightAccent}`

const CHAPTER_NUMBER_IDS: Record<string, MidnightChapter["id"]> = {
  "01": "product",
  "02": "dialogue",
  "03": "engineering",
  "04": "generative-media",
  "05": "art-direction",
}

const REQUIRED_MARKERS: Record<MidnightChapter["id"], MidnightMarker[]> = {
  product: ["preview-end", "notice"],
  dialogue: ["preview-end", "accent:full"],
  engineering: ["preview-end"],
  "generative-media": ["preview-end"],
  "art-direction": ["preview-end", "accent:audience", "accent:recognition", "accent:final"],
}

const MARKER_PATTERN = /^<!--\s*(.+?)\s*-->$/
const ACCENT_MARKERS: MidnightMarker[] = [
  "accent:full",
  "accent:audience",
  "accent:recognition",
  "accent:final",
]

function fail(message: string): never {
  throw new Error(`midnight: ${message}`)
}

function parseMarker(line: string): MidnightMarker {
  const match = line.match(MARKER_PATTERN)
  if (!match) fail(`invalid marker syntax: ${line}`)

  const marker = match[1]
  if (marker === "preview-end" || marker === "notice" || ACCENT_MARKERS.some((item) => item === marker)) {
    return marker as MidnightMarker
  }

  return fail(`unknown marker "${marker}"`)
}

function parseMidnightSource(source: string): MidnightChapter[] {
  const chapters: MidnightChapter[] = []
  const seenIds = new Set<MidnightChapter["id"]>()
  let current: MidnightChapter | null = null
  let currentMarkers: Set<MidnightMarker> | null = null
  let pendingAccent: MidnightAccent | null = null
  let pendingNotice = false

  const clearPending = () => {
    pendingAccent = null
    pendingNotice = false
  }

  const assertNoPending = (context: string) => {
    if (pendingAccent || pendingNotice) {
      fail(`marker must precede a paragraph or emphasis (${context})`)
    }
  }

  const finishChapter = () => {
    if (!current || !currentMarkers) return
    assertNoPending(`end of chapter ${current.id}`)

    const required = REQUIRED_MARKERS[current.id]
    for (const marker of required) {
      if (!currentMarkers.has(marker)) {
        fail(`missing <!-- ${marker} --> in chapter ${current.id}`)
      }
    }
    for (const marker of currentMarkers) {
      if (!required.includes(marker)) {
        fail(`unexpected <!-- ${marker} --> in chapter ${current.id}`)
      }
    }
    if (current.previewEnd <= 0 || current.previewEnd >= current.blocks.length) {
      fail(`<!-- preview-end --> must leave blocks hidden in chapter ${current.id}`)
    }
  }

  const pushBlock = (block: MidnightBlock) => {
    if (!current) return

    if (pendingAccent || pendingNotice) {
      if (block.kind !== "paragraph" && block.kind !== "emphasis") {
        fail(`marker must precede a paragraph or emphasis, got ${block.kind}`)
      }
      if (pendingAccent) block.accent = pendingAccent
      if (pendingNotice) {
        if (block.kind !== "paragraph") fail("<!-- notice --> must precede a paragraph")
        block.notice = true
      }
      clearPending()
    }

    current.blocks.push(block)
  }

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith("# ")) {
      finishChapter()

      const heading = line.slice(2)
      const number = heading.match(/^(\d{2})\s*\/\s*/)?.[1]
      if (!number) fail(`chapter heading must start with a number: "${heading}"`)

      const id = CHAPTER_NUMBER_IDS[number]
      if (!id) fail(`unknown chapter number "${number}"`)
      if (seenIds.has(id)) fail(`duplicate chapter id "${id}"`)
      seenIds.add(id)

      current = { id, label: heading, title: "", subtitle: "", previewEnd: 0, blocks: [] }
      currentMarkers = new Set()
      clearPending()
      chapters.push(current)
      continue
    }

    if (!current || !currentMarkers) {
      if (line.startsWith("<!--")) fail(`marker outside chapter: ${line}`)
      continue
    }

    if (line.startsWith("<!--")) {
      const marker = parseMarker(line)
      if (currentMarkers.has(marker)) {
        fail(`duplicate <!-- ${marker} --> in chapter ${current.id}`)
      }
      currentMarkers.add(marker)

      if (marker === "preview-end") {
        current.previewEnd = current.blocks.length
        continue
      }

      if (marker === "notice") {
        if (pendingAccent) {
          fail(`<!-- notice --> cannot follow an accent marker in chapter ${current.id}`)
        }
        pendingNotice = true
        continue
      }

      if (pendingNotice || pendingAccent) {
        fail(`<!-- ${marker} --> cannot follow another pending marker in chapter ${current.id}`)
      }
      pendingAccent = marker.slice("accent:".length) as MidnightAccent
      continue
    }

    if (line.startsWith("## ")) {
      assertNoPending("chapter title")
      current.title = line.slice(3)
      continue
    }

    if (line.startsWith("### ")) {
      pushBlock({ kind: "subheading", text: line.slice(4) })
      continue
    }

    const boldLine = line.match(/^\*\*(.+)\*\*$/)
    if (boldLine) {
      if (!current.subtitle) {
        assertNoPending("chapter subtitle")
        current.subtitle = boldLine[1]
      } else {
        pushBlock({ kind: "emphasis", text: boldLine[1] })
      }
      continue
    }

    const link = line.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
    if (link) {
      pushBlock({ kind: "link", text: link[1], href: link[2] })
      continue
    }

    const mediaReference = line.match(/^!\[\[([^\]]+)\]\]$/)
    if (mediaReference) {
      pushBlock({ kind: "media-reference", asset: mediaReference[1] })
      continue
    }

    pushBlock({ kind: "paragraph", text: line })
  }

  finishChapter()

  for (const id of Object.values(CHAPTER_NUMBER_IDS)) {
    if (!seenIds.has(id)) fail(`missing chapter "${id}"`)
  }

  return chapters
}

export const MIDNIGHT_CONTENT: Record<Locale, MidnightChapter[]> = {
  en: parseMidnightSource(enSource),
  ru: parseMidnightSource(ruSource),
}
