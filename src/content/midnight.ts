import enSource from "./midnight.en.md?raw"
import ruSource from "./midnight.ru.md?raw"
import type { Locale } from "./types"

export type MidnightAccent = "full" | "audience" | "recognition" | "final"
export type MidnightInteraction =
  | "orbit-comparison"
  | "filmstrip"
  | "slow-scan-glass"
  | "slow-scan-liquid"

export type MidnightBlock =
  | {
      kind: "paragraph"
      text: string
      accent?: MidnightAccent
      notice?: boolean
      interaction?: MidnightInteraction
    }
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

/** Structural interaction metadata shared by the UI and text export. */
export const MIDNIGHT_INTERACTIONS: Record<
  Locale,
  Record<MidnightInteraction, { targets: readonly string[]; description: string }>
> = {
  en: {
    "orbit-comparison": {
      targets: ["FLUX produced convincing realism", "Pony could generate explicit scenes"],
      description:
        "Visual: the FLUX and Pony phrases each open a rotating carousel of six corresponding generated images.",
    },
    filmstrip: {
      targets: ["I've already produced more than 16,000 photos and 500 videos for Midnight Persona."],
      description:
        "Visual: the final phrase opens a WebGL filmstrip of generated photographs from the Midnight Persona media pipeline.",
    },
    "slow-scan-glass": {
      targets: ["Fogged-up glass with finger marks"],
      description:
        "Visual: the marked phrase triggers a slow scan that reveals a short video clip of fogged glass with finger marks.",
    },
    "slow-scan-liquid": {
      targets: ["Liquid matter stretches, intertwines, and wraps around itself."],
      description:
        "Visual: the marked phrase triggers a slow scan that reveals a short video clip of liquid matter stretching and wrapping around itself.",
    },
  },
  ru: {
    "orbit-comparison": {
      targets: ["FLUX давал убедительный реализм", "Второй позволял генерировать откровенные сцены"],
      description:
        "Визуал: фразы про FLUX и Pony открывают вращающиеся карусели из шести соответствующих сгенерированных изображений.",
    },
    filmstrip: {
      targets: ["Для Midnight Persona уже произведено более 16 000 фотографий и 500 видео."],
      description:
        "Визуал: финальная фраза открывает WebGL-киноленту из сгенерированных фотографий медиапайплайна Midnight Persona.",
    },
    "slow-scan-glass": {
      targets: ["Запотевшее стекло со следами пальцев"],
      description:
        "Визуал: отмеченная фраза запускает медленное сканирование, которое раскрывает короткий видеофрагмент запотевшего стекла со следами пальцев.",
    },
    "slow-scan-liquid": {
      targets: ["Жидкая материя тянется, переплетается и обволакивает саму себя."],
      description:
        "Визуал: отмеченная фраза запускает медленное сканирование, которое раскрывает короткий видеофрагмент жидкой материи, тянущейся и обволакивающей саму себя.",
    },
  },
}

type MidnightMarker =
  | "preview-end"
  | "notice"
  | `accent:${MidnightAccent}`
  | `interaction:${MidnightInteraction}`

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
  "generative-media": ["preview-end", "interaction:orbit-comparison", "interaction:filmstrip"],
  "art-direction": [
    "preview-end",
    "accent:audience",
    "accent:recognition",
    "accent:final",
    "interaction:slow-scan-glass",
    "interaction:slow-scan-liquid",
  ],
}

const MARKER_PATTERN = /^<!--\s*(.+?)\s*-->$/
const ACCENT_MARKERS: MidnightMarker[] = [
  "accent:full",
  "accent:audience",
  "accent:recognition",
  "accent:final",
]
const INTERACTION_MARKERS: MidnightMarker[] = [
  "interaction:orbit-comparison",
  "interaction:filmstrip",
  "interaction:slow-scan-glass",
  "interaction:slow-scan-liquid",
]

function fail(message: string): never {
  throw new Error(`midnight: ${message}`)
}

function parseMarker(line: string): MidnightMarker {
  const match = line.match(MARKER_PATTERN)
  if (!match) fail(`invalid marker syntax: ${line}`)

  const marker = match[1]
  if (
    marker === "preview-end" ||
    marker === "notice" ||
    ACCENT_MARKERS.some((item) => item === marker) ||
    INTERACTION_MARKERS.some((item) => item === marker)
  ) {
    return marker as MidnightMarker
  }

  return fail(`unknown marker "${marker}"`)
}

function parseMidnightSource(source: string, locale: Locale): MidnightChapter[] {
  const chapters: MidnightChapter[] = []
  const seenIds = new Set<MidnightChapter["id"]>()
  let current: MidnightChapter | null = null
  let currentMarkers: Set<MidnightMarker> | null = null
  let pendingAccent: MidnightAccent | null = null
  let pendingNotice = false
  let pendingInteraction: MidnightInteraction | null = null

  const clearPending = () => {
    pendingAccent = null
    pendingNotice = false
    pendingInteraction = null
  }

  const assertNoPending = (context: string) => {
    if (pendingAccent || pendingNotice || pendingInteraction) {
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

    if (pendingAccent || pendingNotice || pendingInteraction) {
      if (block.kind !== "paragraph" && block.kind !== "emphasis") {
        fail(`marker must precede a paragraph or emphasis, got ${block.kind}`)
      }
      if (pendingAccent) block.accent = pendingAccent
      if (pendingNotice) {
        if (block.kind !== "paragraph") fail("<!-- notice --> must precede a paragraph")
        block.notice = true
      }
      if (pendingInteraction) {
        if (block.kind !== "paragraph") fail("interaction marker must precede a paragraph")
        for (const target of MIDNIGHT_INTERACTIONS[locale][pendingInteraction].targets) {
          if (!block.text.includes(target)) {
            fail(`interaction ${pendingInteraction} target is missing from its paragraph`)
          }
        }
        block.interaction = pendingInteraction
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
        if (pendingAccent || pendingInteraction) {
          fail(`<!-- notice --> cannot follow an accent marker in chapter ${current.id}`)
        }
        pendingNotice = true
        continue
      }

      if (marker.startsWith("interaction:")) {
        if (pendingNotice || pendingAccent || pendingInteraction) {
          fail(`<!-- ${marker} --> cannot follow another pending marker in chapter ${current.id}`)
        }
        pendingInteraction = marker.slice("interaction:".length) as MidnightInteraction
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
  en: parseMidnightSource(enSource, "en"),
  ru: parseMidnightSource(ruSource, "ru"),
}
